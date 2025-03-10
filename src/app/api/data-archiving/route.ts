import { NextRequest, NextResponse } from "next/server";
import { archiveMetricsToBigQuery } from "@/lib/firebaseDataArchive";

/**
 * DATA ARCHIVING API
 *
 * This API is designed to be publicly accessible for cron jobs and scheduled tasks.
 *
 * Authentication:
 * - No token authentication required
 * - Optional API key check using query parameter: ?key=your-secret-key
 * - If ARCHIVING_SECRET_KEY is set in environment variables, the key is required
 * - If ARCHIVING_SECRET_KEY is not set, the API is completely public
 *
 * Usage examples:
 * - GET /api/data-archiving?key=your-secret-key
 * - POST /api/data-archiving?key=your-secret-key
 *   Body: { "tableId": "user_metrics_archive", "schemaType": "userMetrics" }
 */

// Define schema type
type SchemaField = {
  name: string;
  type: string;
  mode?: "NULLABLE" | "REQUIRED" | "REPEATED";
  description?: string;
};
type SchemaTypes = "userMetrics" | "otherSchemaType"; // Add other schema types as needed

// Define schemas for different data types
const SCHEMAS: Record<SchemaTypes, SchemaField[]> = {
  // Schema for user metrics data - designed to handle all metrics types
  userMetrics: [
    {
      name: "_id",
      type: "STRING",
      mode: "REQUIRED",
      description: "Timestamp as string ID",
    },
    {
      name: "companyId",
      type: "STRING",
      mode: "REQUIRED",
      description: "Company identifier",
    },
    {
      name: "userId",
      type: "STRING",
      mode: "REQUIRED",
      description: "User identifier",
    },
    {
      name: "metricsType",
      type: "STRING",
      mode: "REQUIRED",
      description:
        "Type of metric (clipboardEvents, fileDownloads, fileUploads, urls)",
    },
    {
      name: "timestamp",
      type: "TIMESTAMP",
      mode: "REQUIRED",
      description: "Timestamp when the metric was recorded",
    },
    {
      name: "raw_data",
      type: "STRING",
      mode: "NULLABLE",
      description: "Complete raw data as JSON string",
    },
  ],
  // Add placeholder for other schema types
  otherSchemaType: [],
  // Add more schemas as needed for different data types
};

export async function POST(request: NextRequest) {
  try {
    // Get the API key from query parameters
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("key");
    const secretKey = process.env.ARCHIVING_SECRET_KEY;

    // Validate API key
    if (!apiKey || apiKey !== secretKey) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    // Get the schema for user metrics
    const schema = SCHEMAS.userMetrics;

    // Start the archiving process
    // Using 0 hours to archive all data (for testing)
    console.log(
      "Starting metrics archiving process for all data (no time limit)"
    );
    const result = await archiveMetricsToBigQuery(
      "user_metrics_archive",
      0, // archive data older than 6 hours and 0 means archive all data
      "hours",
      schema,
      true // Delete after archive
    );

    // Return the result
    return NextResponse.json({
      success: true,
      message: `Successfully archived ${result.archived} records to BigQuery${
        result.deleted < result.archived
          ? ` but deletion from Firebase failed (${result.deleted} records deleted)`
          : ` and deleted ${result.deleted} records from Firebase`
      }`,
      result,
    });
  } catch (error: unknown) {
    console.error("Error in data archiving:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check archiving status or configuration
export async function GET(request: NextRequest) {
  try {
    // Get the API key from query parameters
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("key");
    const secretKey = process.env.ARCHIVING_SECRET_KEY;

    // Optional API key check - if ARCHIVING_SECRET_KEY is set, verify the key
    // If no secret key is configured, allow public access
    if (secretKey && apiKey !== secretKey) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing API key" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      status: "ready",
      availableSchemas: Object.keys(SCHEMAS),
      archiveTypes: ["standard", "metrics"],
      message: "Data archiving service is ready",
    });
  } catch (error: unknown) {
    console.error("Error in data archiving status API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
