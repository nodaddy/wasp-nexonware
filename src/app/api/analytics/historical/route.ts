import { NextRequest, NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";
import { auth as adminAuth } from "@/lib/firebaseAdmin";

// Initialize BigQuery client with explicit project ID and credentials
let bigquery: BigQuery;
try {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  console.log("Historical Analytics API - BigQuery Configuration:");
  console.log(`- Project ID: ${projectId}`);
  console.log(
    `- Client Email: ${
      clientEmail ? clientEmail.substring(0, 10) + "..." : "undefined"
    }`
  );
  console.log(
    `- Private Key: ${
      privateKey ? "Provided (length: " + privateKey.length + ")" : "undefined"
    }`
  );

  bigquery = new BigQuery({
    projectId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
  console.log("BigQuery client initialized successfully");
} catch (error) {
  console.error("Failed to initialize BigQuery client:", error);
  // We'll handle this in the API handler
}

/**
 * Ensures that the BigQuery dataset and table exist
 * @param datasetId The BigQuery dataset ID
 * @param tableId The BigQuery table ID
 * @returns True if the dataset and table exist or were created successfully
 */
async function ensureDatasetAndTableExist(
  datasetId: string,
  tableId: string
): Promise<boolean> {
  try {
    // Check if dataset exists
    const [datasetExists] = await bigquery.dataset(datasetId).exists();

    if (!datasetExists) {
      console.log(`Dataset ${datasetId} does not exist. Creating it...`);
      await bigquery.createDataset(datasetId);
      console.log(`Dataset ${datasetId} created successfully`);
    }

    // Check if table exists
    const [tableExists] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .exists();

    if (!tableExists) {
      console.log(
        `Table ${tableId} does not exist in dataset ${datasetId}. Note: It will be created automatically when data is archived.`
      );
      // We don't create the table here because it requires a schema
      // The table will be created automatically when data is archived
    }

    return true;
  } catch (error) {
    console.error(`Error ensuring dataset and table exist: ${error}`);
    return false;
  }
}

/**
 * API endpoint to fetch historical analytics data from BigQuery
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

    const token = authHeader.split("Bearer ")[1];

    try {
      // Check if Firebase Admin is initialized
      if (!adminAuth) {
        console.error("Firebase Admin Auth is not initialized");
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 }
        );
      }

      // Verify the Firebase token
      await adminAuth.verifyIdToken(token);

      // Optional: Check for specific roles if needed
      // if (!decodedToken.role) {
      //   return NextResponse.json(
      //     { error: "Forbidden - Insufficient permissions" },
      //     { status: 403 }
      //   );
      // }
    } catch (authError) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("tableId") || "user_metrics_archive";
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const metricsType = searchParams.get("metricsType") || null;
    const analysisType = searchParams.get("analysisType") || null;
    const startDate = searchParams.get("startDate") || null;
    const endDate = searchParams.get("endDate") || null;

    // Ensure we have a project ID
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    if (!projectId) {
      console.error("Missing FIREBASE_ADMIN_PROJECT_ID environment variable");
      return NextResponse.json(
        { error: "Server configuration error - Missing project ID" },
        { status: 500 }
      );
    }

    // Ensure dataset and table exist
    const datasetId = "firebase_archive";
    const datasetTableExists = await ensureDatasetAndTableExist(
      datasetId,
      tableId
    );

    if (!datasetTableExists) {
      return NextResponse.json(
        { error: "BigQuery dataset or table access error" },
        { status: 500 }
      );
    }

    // If this is a URL analytics request, use specialized queries
    if (metricsType === "urls" && analysisType) {
      return await handleUrlAnalytics(
        projectId,
        datasetId,
        tableId,
        analysisType,
        startDate,
        endDate
      );
    }

    // Construct the SQL query for regular data
    let query = `SELECT * FROM \`${projectId}.${datasetId}.${tableId}\``;

    // Add filters if provided
    if (metricsType) {
      query += ` WHERE metricsType = @metricsType`;
    }

    // Add date range filters if provided
    if (startDate || endDate) {
      const dateFilter = [];
      if (metricsType) {
        // If we already have a WHERE clause
        if (startDate) {
          dateFilter.push(`DATE(timestamp) >= DATE(@startDate)`);
        }
        if (endDate) {
          dateFilter.push(`DATE(timestamp) <= DATE(@endDate)`);
        }
        if (dateFilter.length > 0) {
          query += ` AND ${dateFilter.join(" AND ")}`;
        }
      } else {
        // If we don't have a WHERE clause yet
        if (startDate) {
          dateFilter.push(`DATE(timestamp) >= DATE(@startDate)`);
        }
        if (endDate) {
          dateFilter.push(`DATE(timestamp) <= DATE(@endDate)`);
        }
        if (dateFilter.length > 0) {
          query += ` WHERE ${dateFilter.join(" AND ")}`;
        }
      }
    }

    // Add order by and limit
    query += ` ORDER BY timestamp DESC LIMIT @limit OFFSET @offset`;

    console.log("Executing BigQuery query:", query);

    // Set query parameters
    const options = {
      query,
      params: {
        limit: limit,
        offset: offset,
        ...(metricsType && { metricsType }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
    };

    try {
      // First, check if the table exists and has data
      const tableRef = bigquery.dataset(datasetId).table(tableId);
      const [tableExists] = await tableRef.exists();

      if (!tableExists) {
        console.log(
          `Table ${projectId}.${datasetId}.${tableId} does not exist`
        );
        return NextResponse.json({
          success: true,
          data: [],
          message: `Table ${tableId} does not exist yet. It will be created when data is archived.`,
          pagination: {
            limit,
            offset,
            nextOffset: offset + limit,
          },
        });
      }

      // Get table metadata to check if it has data
      const [metadata] = await tableRef.getMetadata();
      console.log(`Table metadata:`, {
        numRows: metadata.numRows,
        numBytes: metadata.numBytes,
        lastModified: metadata.lastModifiedTime,
      });

      if (metadata.numRows === "0") {
        console.log(
          `Table ${projectId}.${datasetId}.${tableId} exists but has 0 rows`
        );
        return NextResponse.json({
          success: true,
          data: [],
          message: `Table ${tableId} exists but has no data yet.`,
          pagination: {
            limit,
            offset,
            nextOffset: offset + limit,
          },
        });
      }

      // Execute the query if the table exists and has data
      const [rows] = await bigquery.query(options);
      console.log(`Query returned ${rows.length} rows`);

      if (rows.length === 0) {
        console.log(
          `Query returned 0 rows. This might indicate a filter issue or empty table.`
        );
      } else {
        console.log(`First row sample:`, JSON.stringify(rows[0]));
      }

      return NextResponse.json({
        success: true,
        data: rows,
        pagination: {
          limit,
          offset,
          nextOffset: offset + limit,
        },
      });
    } catch (queryError: unknown) {
      console.error("BigQuery error:", queryError);

      // Log more details about the error
      if (queryError instanceof Error && "response" in queryError) {
        console.error("Error response:", queryError.response);
      }

      if (queryError instanceof Error) {
        console.error("Error message:", queryError.message);
      }

      return NextResponse.json(
        {
          error: `BigQuery error: ${
            queryError instanceof Error ? queryError.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Error fetching historical analytics:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle URL analytics requests with specialized BigQuery queries
 */
async function handleUrlAnalytics(
  projectId: string,
  datasetId: string,
  tableId: string,
  analysisType: string,
  startDate: string | null,
  endDate: string | null
) {
  try {
    let query = "";
    const params: Record<string, string> = {};

    // Add date parameters if provided
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }

    // Build date filter clause
    let dateFilter = "";
    if (startDate && endDate) {
      dateFilter = `AND DATE(timestamp) BETWEEN DATE(@startDate) AND DATE(@endDate)`;
    } else if (startDate) {
      dateFilter = `AND DATE(timestamp) >= DATE(@startDate)`;
    } else if (endDate) {
      dateFilter = `AND DATE(timestamp) <= DATE(@endDate)`;
    }

    // First, let's check the schema and a sample row to understand the structure
    console.log(
      `Checking schema for table ${projectId}.${datasetId}.${tableId}`
    );

    // Get a sample row to understand the structure
    const sampleQuery = `
      SELECT * 
      FROM \`${projectId}.${datasetId}.${tableId}\`
      WHERE metricsType = 'urls'
      LIMIT 1
    `;

    try {
      const [sampleRows] = await bigquery.query({ query: sampleQuery });
      if (sampleRows && sampleRows.length > 0) {
        console.log("Sample URL row:", JSON.stringify(sampleRows[0]));

        // Examine the sample row to determine the structure
        const sampleRow = sampleRows[0];
        const keys = Object.keys(sampleRow);
        console.log("Available fields:", keys);

        // Check if there's a data field that might contain our URL data
        if (sampleRow.data && typeof sampleRow.data === "string") {
          try {
            // If data is a JSON string, parse it
            const parsedData = JSON.parse(sampleRow.data);
            console.log("Parsed data field:", parsedData);
          } catch {
            console.log("Data field is not valid JSON");
          }
        }

        // Check for raw_data field
        if (sampleRow.raw_data && typeof sampleRow.raw_data === "string") {
          try {
            // If raw_data is a JSON string, parse it
            const parsedRawData = JSON.parse(sampleRow.raw_data);
            console.log("Parsed raw_data field:", parsedRawData);
          } catch {
            console.log("raw_data field is not valid JSON");
          }
        }
      } else {
        console.log("No sample URL data found");
      }
    } catch (sampleError) {
      console.error("Error fetching sample row:", sampleError);
    }

    // Based on the schema inspection, let's use a more flexible approach
    // We'll try different field access patterns based on what we find

    switch (analysisType) {
      case "topDomains":
        // Try different field access patterns
        query = `
          WITH url_data AS (
            SELECT
              CASE
                WHEN domain IS NOT NULL THEN domain
                WHEN raw_data IS NOT NULL AND JSON_EXTRACT_SCALAR(raw_data, '$.domain') IS NOT NULL THEN JSON_EXTRACT_SCALAR(raw_data, '$.domain')
                WHEN data IS NOT NULL AND JSON_EXTRACT_SCALAR(data, '$.domain') IS NOT NULL THEN JSON_EXTRACT_SCALAR(data, '$.domain')
                ELSE NULL
              END as domain
            FROM \`${projectId}.${datasetId}.${tableId}\`
            WHERE metricsType = 'urls'
            ${dateFilter}
          )
          SELECT 
            domain, 
            COUNT(*) as visits
          FROM url_data
          WHERE domain IS NOT NULL AND domain != ''
          GROUP BY domain
          ORDER BY visits DESC
          LIMIT 10
        `;
        break;

      case "visitsOverTime":
        // Query for visits over time - this should work with just the timestamp
        query = `
          SELECT 
            DATE(timestamp) as date, 
            COUNT(*) as visits
          FROM \`${projectId}.${datasetId}.${tableId}\`
          WHERE 
            metricsType = 'urls'
            ${dateFilter}
          GROUP BY date
          ORDER BY date ASC
        `;
        break;

      case "pathDistribution":
        // Try different field access patterns for path
        query = `
          WITH url_data AS (
            SELECT
              CASE
                WHEN path IS NOT NULL THEN path
                WHEN raw_data IS NOT NULL AND JSON_EXTRACT_SCALAR(raw_data, '$.path') IS NOT NULL THEN JSON_EXTRACT_SCALAR(raw_data, '$.path')
                WHEN data IS NOT NULL AND JSON_EXTRACT_SCALAR(data, '$.path') IS NOT NULL THEN JSON_EXTRACT_SCALAR(data, '$.path')
                ELSE NULL
              END as path
            FROM \`${projectId}.${datasetId}.${tableId}\`
            WHERE metricsType = 'urls'
            ${dateFilter}
          )
          SELECT 
            IFNULL(REGEXP_EXTRACT(path, r'^/([^/]*)'), '/') as path_segment,
            COUNT(*) as visits
          FROM url_data
          WHERE path IS NOT NULL
          GROUP BY path_segment
          ORDER BY visits DESC
          LIMIT 8
        `;
        break;

      case "browserUsage":
        // Try different field access patterns for userAgent
        query = `
          WITH url_data AS (
            SELECT
              CASE
                WHEN userAgent IS NOT NULL THEN userAgent
                WHEN raw_data IS NOT NULL AND JSON_EXTRACT_SCALAR(raw_data, '$.userAgent') IS NOT NULL THEN JSON_EXTRACT_SCALAR(raw_data, '$.userAgent')
                WHEN data IS NOT NULL AND JSON_EXTRACT_SCALAR(data, '$.userAgent') IS NOT NULL THEN JSON_EXTRACT_SCALAR(data, '$.userAgent')
                ELSE NULL
              END as userAgent
            FROM \`${projectId}.${datasetId}.${tableId}\`
            WHERE metricsType = 'urls'
            ${dateFilter}
          )
          SELECT 
            CASE
              WHEN userAgent LIKE '%Chrome%' THEN 'Chrome'
              WHEN userAgent LIKE '%Firefox%' THEN 'Firefox'
              WHEN userAgent LIKE '%Safari%' AND userAgent NOT LIKE '%Chrome%' THEN 'Safari'
              WHEN userAgent LIKE '%Edge%' THEN 'Edge'
              WHEN userAgent LIKE '%MSIE%' OR userAgent LIKE '%Trident/%' THEN 'Internet Explorer'
              ELSE 'Unknown'
            END as browser,
            COUNT(*) as visits
          FROM url_data
          WHERE userAgent IS NOT NULL
          GROUP BY browser
          ORDER BY visits DESC
        `;
        break;

      case "screenSizeDistribution":
        // Try different field access patterns for screenWidth
        query = `
          WITH url_data AS (
            SELECT
              CASE
                WHEN screenWidth IS NOT NULL THEN CAST(screenWidth AS INT64)
                WHEN raw_data IS NOT NULL AND JSON_EXTRACT_SCALAR(raw_data, '$.screenWidth') IS NOT NULL THEN CAST(JSON_EXTRACT_SCALAR(raw_data, '$.screenWidth') AS INT64)
                WHEN data IS NOT NULL AND JSON_EXTRACT_SCALAR(data, '$.screenWidth') IS NOT NULL THEN CAST(JSON_EXTRACT_SCALAR(data, '$.screenWidth') AS INT64)
                ELSE NULL
              END as screenWidth
            FROM \`${projectId}.${datasetId}.${tableId}\`
            WHERE metricsType = 'urls'
            ${dateFilter}
          )
          SELECT 
            CASE
              WHEN screenWidth < 768 THEN 'Mobile (< 768px)'
              WHEN screenWidth BETWEEN 768 AND 1023 THEN 'Tablet (768px - 1023px)'
              WHEN screenWidth BETWEEN 1024 AND 1439 THEN 'Laptop (1024px - 1439px)'
              WHEN screenWidth >= 1440 THEN 'Desktop (≥ 1440px)'
              ELSE 'Unknown'
            END as screen_size,
            COUNT(*) as visits
          FROM url_data
          WHERE screenWidth IS NOT NULL
          GROUP BY screen_size
          ORDER BY 
            CASE screen_size
              WHEN 'Mobile (< 768px)' THEN 1
              WHEN 'Tablet (768px - 1023px)' THEN 2
              WHEN 'Laptop (1024px - 1439px)' THEN 3
              WHEN 'Desktop (≥ 1440px)' THEN 4
              ELSE 5
            END
        `;
        break;

      case "summary":
        // Try different field access patterns for summary data
        query = `
          WITH url_data AS (
            SELECT
              CASE
                WHEN domain IS NOT NULL THEN domain
                WHEN raw_data IS NOT NULL AND JSON_EXTRACT_SCALAR(raw_data, '$.domain') IS NOT NULL THEN JSON_EXTRACT_SCALAR(raw_data, '$.domain')
                WHEN data IS NOT NULL AND JSON_EXTRACT_SCALAR(data, '$.domain') IS NOT NULL THEN JSON_EXTRACT_SCALAR(data, '$.domain')
                ELSE NULL
              END as domain,
              CASE
                WHEN path IS NOT NULL THEN path
                WHEN raw_data IS NOT NULL AND JSON_EXTRACT_SCALAR(raw_data, '$.path') IS NOT NULL THEN JSON_EXTRACT_SCALAR(raw_data, '$.path')
                WHEN data IS NOT NULL AND JSON_EXTRACT_SCALAR(data, '$.path') IS NOT NULL THEN JSON_EXTRACT_SCALAR(data, '$.path')
                ELSE NULL
              END as path,
              CASE
                WHEN pageLoadTime IS NOT NULL THEN CAST(pageLoadTime AS FLOAT64)
                WHEN raw_data IS NOT NULL AND JSON_EXTRACT_SCALAR(raw_data, '$.pageLoadTime') IS NOT NULL THEN CAST(JSON_EXTRACT_SCALAR(raw_data, '$.pageLoadTime') AS FLOAT64)
                WHEN data IS NOT NULL AND JSON_EXTRACT_SCALAR(data, '$.pageLoadTime') IS NOT NULL THEN CAST(JSON_EXTRACT_SCALAR(data, '$.pageLoadTime') AS FLOAT64)
                ELSE NULL
              END as pageLoadTime,
              timestamp
            FROM \`${projectId}.${datasetId}.${tableId}\`
            WHERE metricsType = 'urls'
            ${dateFilter}
          )
          SELECT
            COUNT(*) as totalVisits,
            COUNT(DISTINCT domain) as uniqueDomains,
            COUNT(DISTINCT path) as uniquePaths,
            AVG(pageLoadTime) as avgPageLoadTime,
            MAX(timestamp) as mostRecentVisit
          FROM url_data
        `;
        break;

      default:
        return NextResponse.json(
          { error: `Unknown analysis type: ${analysisType}` },
          { status: 400 }
        );
    }

    console.log(`Executing URL analytics query for ${analysisType}:`, query);
    const [rows] = await bigquery.query({ query, params });

    return NextResponse.json({
      success: true,
      analysisType,
      data: rows,
    });
  } catch (error: unknown) {
    console.error(`Error in URL analytics (${analysisType}):`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error processing URL analytics",
      },
      { status: 500 }
    );
  }
}
