import { NextRequest, NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";
import { getAdminAuth } from "@/lib/firebaseAdminCore";

// Cache for summary data
type CacheEntry = {
  data: Record<string, unknown>;
  expiresAt: number;
};

const summaryCache: Map<string, CacheEntry> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Initialize BigQuery client
let bigquery: BigQuery | null = null;

// Function to get or initialize BigQuery client
function getBigQueryClient(): BigQuery | null {
  if (bigquery) {
    return bigquery;
  }

  try {
    console.log("Initializing BigQuery client...");

    // Check for required environment variables
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      // Use JSON credentials from environment variable
      console.log("Using GOOGLE_APPLICATION_CREDENTIALS_JSON for BigQuery");
      try {
        const credentials = JSON.parse(
          process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
        );
        bigquery = new BigQuery({
          projectId: credentials.project_id,
          credentials,
        });
        console.log("BigQuery client initialized with JSON credentials");
        console.log(`Project ID: ${credentials.project_id}`);
        console.log(`Client email: ${credentials.client_email}`);
        return bigquery;
      } catch (parseError) {
        console.error(
          "Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:",
          parseError
        );
      }
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use credentials file path
      console.log(
        `Using GOOGLE_APPLICATION_CREDENTIALS file path for BigQuery: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`
      );
      try {
        bigquery = new BigQuery();
        console.log("BigQuery client initialized with credentials file");
        return bigquery;
      } catch (fileError) {
        console.error(
          "Error initializing BigQuery with credentials file:",
          fileError
        );
      }
    }

    // If we have Firebase Admin credentials, try to use those
    if (
      process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ) {
      console.log("Using Firebase Admin credentials for BigQuery");
      console.log(`Project ID: ${process.env.FIREBASE_ADMIN_PROJECT_ID}`);
      console.log(`Client email: ${process.env.FIREBASE_ADMIN_CLIENT_EMAIL}`);

      // Replace newlines in the private key
      let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
      if (privateKey.includes("\\n")) {
        privateKey = privateKey.replace(/\\n/g, "\n");
      }

      try {
        bigquery = new BigQuery({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          credentials: {
            client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            private_key: privateKey,
          },
        });
        console.log(
          "BigQuery client initialized with Firebase Admin credentials"
        );
        return bigquery;
      } catch (firebaseError) {
        console.error(
          "Error initializing BigQuery with Firebase Admin credentials:",
          firebaseError
        );
      }
    }

    console.error("Missing Google Cloud credentials for BigQuery");
    return null;
  } catch (error) {
    console.error("Error initializing BigQuery client:", error);
    return null;
  }
}

// Get the correct project ID and dataset for queries
function getQueryDetails() {
  // Default to the Firebase project ID
  let projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || "nexonware-eap";

  // For dataset, we'll use a default that's likely to exist in the project
  let dataset = "firebase_archive";

  // Override with specific BigQuery settings if available
  if (process.env.BIGQUERY_PROJECT_ID) {
    projectId = process.env.BIGQUERY_PROJECT_ID;
  }

  if (process.env.BIGQUERY_DATASET) {
    dataset = process.env.BIGQUERY_DATASET;
  }

  console.log(`Using BigQuery project: ${projectId}, dataset: ${dataset}`);
  return { projectId, dataset };
}

export async function GET(request: NextRequest) {
  // Get the authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid authorization header" },
      { status: 400 }
    );
  }

  // Verify the token
  const token = authHeader.split("Bearer ")[1];
  try {
    const auth = getAdminAuth();
    await auth.verifyIdToken(token);
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.json(
      { error: "Invalid authentication token" },
      { status: 401 }
    );
  }

  // Get query parameters
  const companyId = request.headers.get("X-Company-ID");
  const cacheKey = `${companyId}`;

  // Check cache first
  const cachedData = summaryCache.get(cacheKey);
  if (cachedData && Date.now() < cachedData.expiresAt) {
    console.log(`Using cached data for ${cacheKey}`);
    return NextResponse.json(cachedData.data);
  }

  // Validate parameters
  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID is required" },
      { status: 400 }
    );
  }

  // Get or initialize BigQuery client
  const bq = getBigQueryClient();
  if (!bq) {
    console.error("Failed to initialize BigQuery client");
    return NextResponse.json(
      { error: "BigQuery client not initialized" },
      { status: 500 }
    );
  }

  try {
    // Get project and dataset details
    const { projectId, dataset } = getQueryDetails();

    // Adjust table names based on the actual structure in your BigQuery
    // Using user_metrics_archive table which is likely to exist in firebase_archive dataset
    const tableName = "user_metrics_archive";

    // Query for total events
    const eventsQuery = `
      SELECT COUNT(*) as totalEvents
      FROM \`${projectId}.${dataset}.${tableName}\`
      WHERE companyId = @companyId
    `;

    const eventsOptions = {
      query: eventsQuery,
      params: {
        companyId: companyId,
      },
    };

    // Query for unique users
    const usersQuery = `
      SELECT COUNT(DISTINCT userId) as uniqueUsers
      FROM \`${projectId}.${dataset}.${tableName}\`
      WHERE companyId = @companyId
    `;

    const usersOptions = {
      query: usersQuery,
      params: {
        companyId: companyId,
      },
    };

    // Query for metrics by type
    const metricsTypeQuery = `
      SELECT 
        metricsType,
        COUNT(*) as count
      FROM \`${projectId}.${dataset}.${tableName}\`
      WHERE companyId = @companyId
      GROUP BY metricsType
    `;

    const metricsTypeOptions = {
      query: metricsTypeQuery,
      params: {
        companyId: companyId,
      },
    };

    console.log("Executing BigQuery queries with the following parameters:");
    console.log(`- Company ID: ${companyId}`);
    console.log(`- Project ID: ${projectId}`);
    console.log(`- Dataset: ${dataset}`);
    console.log(`- Table: ${tableName}`);

    // Execute all queries in parallel
    const [eventsResults, usersResults, metricsTypeResults] = await Promise.all(
      [
        bq.query(eventsOptions),
        bq.query(usersOptions),
        bq.query(metricsTypeOptions),
      ]
    );

    // Process metrics by type
    const metricsByType = {
      urls: 0,
      fileDownloads: 0,
      fileUploads: 0,
      clipboardEvents: 0,
    };

    if (metricsTypeResults[0] && metricsTypeResults[0].length > 0) {
      metricsTypeResults[0].forEach((row: Record<string, unknown>) => {
        const metricsType = row.metricsType as string;
        if (
          metricsType &&
          Object.prototype.hasOwnProperty.call(metricsByType, metricsType)
        ) {
          metricsByType[metricsType as keyof typeof metricsByType] =
            row.count as number;
        }
      });
    }

    // Format the results
    const summary = {
      totalEvents: eventsResults[0]?.[0]?.totalEvents || 0,
      uniqueUsers: usersResults[0]?.[0]?.uniqueUsers || 0,
      byType: metricsByType,
    };

    // Cache the results
    summaryCache.set(cacheKey, {
      data: summary,
      expiresAt: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error querying BigQuery:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
        note: "Please check if the BigQuery dataset and table exist and the service account has access.",
      },
      { status: 500 }
    );
  }
}
