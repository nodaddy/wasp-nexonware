import { NextRequest, NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";
import { auth as adminAuth } from "@/lib/firebaseAdmin";

// Initialize BigQuery client
let bigquery: BigQuery;
try {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  bigquery = new BigQuery({
    projectId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
  console.log("BigQuery client initialized successfully for paths endpoint");
} catch (error) {
  console.error("Failed to initialize BigQuery client:", error);
}

/**
 * API endpoint to fetch the most visited URL paths from BigQuery
 */
export async function GET(request: NextRequest) {
  try {
    // Check if BigQuery client is initialized
    if (!bigquery) {
      console.error("BigQuery client is not initialized");
      return NextResponse.json(
        {
          error: "Server configuration error - BigQuery client not initialized",
        },
        { status: 500 }
      );
    }

    // Check authentication/authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Missing or invalid token" },
        { status: 401 }
      );
    }

    // Get the company ID from headers
    const companyId = request.headers.get("x-company-id");
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    try {
      // Verify the Firebase token
      if (!adminAuth) {
        console.error("Firebase Admin Auth is not initialized");
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 }
        );
      }

      await adminAuth.verifyIdToken(token);
    } catch (authError) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || null;
    const endDate = searchParams.get("endDate") || null;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Ensure we have a project ID
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    if (!projectId) {
      console.error("Missing FIREBASE_ADMIN_PROJECT_ID environment variable");
      return NextResponse.json(
        { error: "Server configuration error - Missing project ID" },
        { status: 500 }
      );
    }

    const datasetId = "firebase_archive";
    const tableId = "user_metrics_archive";

    // Build date filter clause
    let dateFilter = "";
    const params: Record<string, string> = {};

    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }

    if (startDate && endDate) {
      dateFilter = `AND DATE(timestamp) BETWEEN DATE(@startDate) AND DATE(@endDate)`;
    } else if (startDate) {
      dateFilter = `AND DATE(timestamp) >= DATE(@startDate)`;
    } else if (endDate) {
      dateFilter = `AND DATE(timestamp) <= DATE(@endDate)`;
    }

    // Query for URL paths
    const pathsQuery = `
      SELECT 
        JSON_EXTRACT_SCALAR(raw_data, '$.path') as path,
        COUNT(*) as visits
      FROM \`${projectId}.${datasetId}.${tableId}\`
      WHERE 
        metricsType = 'urls'
        AND raw_data IS NOT NULL
        AND companyId = '${companyId}'
        ${dateFilter}
      GROUP BY path
      ORDER BY visits DESC
      LIMIT ${limit}
    `;

    console.log("Executing paths query:", pathsQuery);

    try {
      const [rows] = await bigquery.query({
        query: pathsQuery,
        params,
      });

      // If we got results, return them
      if (rows && rows.length > 0) {
        return NextResponse.json({
          success: true,
          data: rows,
        });
      }

      // If no results, try an alternative approach
      console.log(
        "No path data found with JSON_EXTRACT_SCALAR, trying alternative approach"
      );

      // Try to extract path from URL directly
      const alternativeQuery = `
        SELECT 
          REGEXP_EXTRACT(raw_data, r'path["\']?\\s*:\\s*["\']([^"\']+)') as path,
          COUNT(*) as visits
        FROM \`${projectId}.${datasetId}.${tableId}\`
        WHERE 
          metricsType = 'urls'
          AND raw_data IS NOT NULL
          AND companyId = '${companyId}'
          ${dateFilter}
        GROUP BY path
        HAVING path IS NOT NULL
        ORDER BY visits DESC
        LIMIT ${limit}
      `;

      console.log("Executing alternative paths query:", alternativeQuery);
      const [altRows] = await bigquery.query({
        query: alternativeQuery,
        params,
      });

      if (altRows && altRows.length > 0) {
        return NextResponse.json({
          success: true,
          data: altRows,
        });
      }

      // If still no results, return mock data
      console.log("Using fallback approach with mock data");
      console.log(`No real path data found for company ID: ${companyId}`);

      return NextResponse.json({
        success: true,
        data: [
          { path: "/dashboard", visits: 45 },
          { path: "/login", visits: 38 },
          { path: "/profile", visits: 30 },
          { path: "/settings", visits: 25 },
          { path: "/analytics", visits: 20 },
          { path: "/users", visits: 18 },
          { path: "/reports", visits: 15 },
          { path: "/help", visits: 12 },
          { path: "/logout", visits: 10 },
          { path: "/register", visits: 8 },
        ],
        message: `Using mock data as fallback for company ID: ${companyId}`,
      });
    } catch (error: unknown) {
      console.error("Error fetching paths data:", error);
      console.error(`Error occurred for company ${companyId}`);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Error processing paths data",
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Error in paths endpoint:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
