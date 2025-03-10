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
  console.log("BigQuery client initialized successfully for events endpoint");
} catch (error) {
  console.error("Failed to initialize BigQuery client:", error);
}

/**
 * Resolves an email address to a Firebase user ID
 * @param email The email address to resolve
 * @returns The user ID or null if not found
 */
async function resolveEmailToUserId(email: string): Promise<string | null> {
  try {
    if (!adminAuth) {
      console.error("Firebase Admin Auth is not initialized");
      return null;
    }

    // Get the user by email
    const userRecord = await adminAuth.getUserByEmail(email);
    return userRecord.uid;
  } catch (error) {
    console.error(`Error resolving email ${email} to userId:`, error);
    return null;
  }
}

/**
 * API endpoint to fetch events with filtering and pagination
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
    const userEmail = searchParams.get("userEmail") || null;
    const metricsType = searchParams.get("metricsType") || null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    // Resolve email to userId if provided
    let userId: string | null = null;
    if (userEmail) {
      userId = await resolveEmailToUserId(userEmail);
      if (!userId) {
        return NextResponse.json({
          success: true,
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
          message: `No user found with email: ${userEmail}`,
        });
      }
    }

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

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

    // Build WHERE clause based on filters
    let whereClause = `WHERE companyId = '${companyId}'`;

    if (userId) {
      whereClause += ` AND userId = '${userId}'`;
    }

    if (metricsType) {
      whereClause += ` AND metricsType = '${metricsType}'`;
    }

    // First, get the total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM \`${projectId}.${datasetId}.${tableId}\`
      ${whereClause}
    `;

    console.log("Executing count query:", countQuery);

    // Execute the count query
    const [countRows] = await bigquery.query({ query: countQuery });
    const total = countRows[0]?.total || 0;

    // Now, get the actual data with pagination
    const dataQuery = `
      SELECT 
        _id,
        userId,
        metricsType,
        timestamp,
        raw_data,
        companyId
      FROM \`${projectId}.${datasetId}.${tableId}\`
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `;

    console.log("Executing data query:", dataQuery);

    // Execute the data query
    const [dataRows] = await bigquery.query({ query: dataQuery });

    // If we filtered by email, add the email to each result for display
    const enhancedRows = userEmail
      ? dataRows.map((row) => ({ ...row, userEmail }))
      : dataRows;

    // Return the results
    return NextResponse.json({
      success: true,
      data: enhancedRows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error("Error in events endpoint:", error);

    // Check for specific BigQuery errors
    if (error.message && error.message.includes("Unrecognized name")) {
      return NextResponse.json(
        {
          error:
            "Schema error: One or more required columns are missing in the BigQuery table.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
