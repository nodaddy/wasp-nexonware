import { BigQuery } from "@google-cloud/bigquery";

// Initialize BigQuery with credentials
// First try BigQuery-specific credentials, then fall back to Firebase Admin credentials
const projectId =
  process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail =
  process.env.GOOGLE_CLOUD_CLIENT_EMAIL ||
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = (
  process.env.GOOGLE_CLOUD_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY
)?.replace(/\\n/g, "\n");

// Log the BigQuery configuration for debugging
console.log("BigQuery Configuration:");
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

// Initialize BigQuery with credentials
const bigquery = new BigQuery({
  projectId,
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
});

// Dataset and table names
const DATASET_ID = process.env.BIGQUERY_DATASET_ID || "firebase_archive";

/**
 * Creates a BigQuery dataset if it doesn't exist
 */
export async function ensureDatasetExists(
  datasetId: string = DATASET_ID
): Promise<void> {
  try {
    const [exists] = await bigquery.dataset(datasetId).exists();

    if (!exists) {
      await bigquery.createDataset(datasetId);
      console.log(`Dataset ${datasetId} created.`);
    }
  } catch (error) {
    console.error("Error ensuring dataset exists:", error);
    throw error;
  }
}

/**
 * Creates a BigQuery table if it doesn't exist
 */
export async function ensureTableExists(
  tableId: string,
  schema: any[],
  datasetId: string = DATASET_ID
): Promise<void> {
  try {
    const dataset = bigquery.dataset(datasetId);
    const [exists] = await dataset.table(tableId).exists();

    if (!exists) {
      // Log the schema for debugging
      console.log(
        `Creating table ${tableId} with schema:`,
        JSON.stringify(schema, null, 2)
      );

      // Create the table with the specified schema
      await dataset.createTable(tableId, {
        schema,
        // Explicitly set the time partitioning
        timePartitioning: {
          type: "DAY",
          field: "timestamp", // Partition by the timestamp field
        },
      });

      console.log(`Table ${tableId} created in dataset ${datasetId}.`);
    } else {
      console.log(`Table ${tableId} already exists in dataset ${datasetId}.`);

      // Get the current schema
      const [table] = await dataset.table(tableId).get();
      console.log(
        `Existing table schema:`,
        JSON.stringify(table.metadata.schema, null, 2)
      );
    }
  } catch (error) {
    console.error("Error ensuring table exists:", error);
    throw error;
  }
}

/**
 * Inserts rows into a BigQuery table with enhanced error handling
 */
export async function insertRows(
  tableId: string,
  rows: any[],
  datasetId: string = DATASET_ID
): Promise<void> {
  if (rows.length === 0) return;

  try {
    // Log sample data for debugging
    console.log(`Inserting ${rows.length} rows into ${datasetId}.${tableId}`);
    console.log("Sample data (first row):", JSON.stringify(rows[0], null, 2));
    console.log(`Using project ID: ${projectId}`);
    console.log(`Using dataset ID: ${datasetId}`);

    // Verify that the dataset exists
    const [datasetExists] = await bigquery.dataset(datasetId).exists();
    if (!datasetExists) {
      console.log(`Dataset ${datasetId} does not exist. Creating it...`);
      await bigquery.createDataset(datasetId);
      console.log(`Dataset ${datasetId} created successfully.`);
    } else {
      console.log(`Dataset ${datasetId} exists.`);
    }

    // Verify that the table exists
    const [tableExists] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .exists();
    if (!tableExists) {
      console.log(
        `Table ${tableId} does not exist. It will be created automatically.`
      );
    } else {
      console.log(`Table ${tableId} exists.`);
    }

    // Process rows to ensure they're compatible with BigQuery
    const processedRows = rows.map((row) => {
      const processed = sanitizeRowForBigQuery(row);

      // For BigQuery, we need to use strings for timestamps
      if (processed.timestamp instanceof Date) {
        processed.timestamp = processed.timestamp.toISOString();
        console.log(
          `Converted timestamp to ISO string: ${processed.timestamp}`
        );
      }

      return processed;
    });

    // Try a direct SQL insert approach
    console.log("Using direct SQL insert for better reliability");

    // Insert rows in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < processedRows.length; i += BATCH_SIZE) {
      const batch = processedRows.slice(i, i + BATCH_SIZE);

      try {
        console.log(
          `Inserting batch ${i / BATCH_SIZE + 1} (${
            batch.length
          } rows) via SQL...`
        );

        // Build the SQL insert statement
        let insertQuery = `
          INSERT INTO \`${projectId}.${datasetId}.${tableId}\` 
          (_id, companyId, userId, metricsType, timestamp, raw_data)
          VALUES
        `;

        // Add values for each row
        const values = batch.map((row) => {
          return `(
            "${row._id || ""}",
            "${row.companyId || ""}",
            "${row.userId || ""}",
            "${row.metricsType || ""}",
            TIMESTAMP("${row.timestamp || ""}"),
            "${(row.raw_data || "").replace(/"/g, '\\"')}"
          )`;
        });

        insertQuery += values.join(",\n") + ";";

        console.log(
          `SQL Insert Query: ${insertQuery.substring(0, 200)}... (truncated)`
        );

        // Execute the query
        const [insertResult] = await bigquery.query({
          query: insertQuery,
          location: "US",
        });

        console.log(
          `Batch ${i / BATCH_SIZE + 1} inserted successfully:`,
          insertResult
        );
      } catch (batchError) {
        console.error(
          `Error inserting batch ${i / BATCH_SIZE + 1} via SQL:`,
          batchError
        );
      }
    }

    console.log(
      `Completed insertion of ${rows.length} rows into ${datasetId}.${tableId}`
    );

    // Verify the insertion with a query
    try {
      const verificationQuery = `SELECT COUNT(*) as count FROM \`${projectId}.${datasetId}.${tableId}\``;
      console.log(`Verifying insertion with query: ${verificationQuery}`);
      const [verificationResult] = await bigquery.query({
        query: verificationQuery,
        location: "US",
      });
      console.log(
        `Verification query result: ${JSON.stringify(verificationResult)}`
      );
      console.log(
        `Table ${datasetId}.${tableId} now has ${verificationResult[0].count} rows`
      );
    } catch (verificationError) {
      console.error("Error verifying insertion:", verificationError);
    }
  } catch (error) {
    console.error("Error in insertRows:", error);
    throw error;
  }
}

/**
 * Sanitizes a row object for BigQuery insertion
 * Handles common issues that cause insertion errors
 * For user metrics, ensures only schema fields are included
 */
function sanitizeRowForBigQuery(row: any): any {
  const sanitized: any = {};

  // Define the allowed fields for user metrics
  const allowedFields = [
    "_id",
    "companyId",
    "userId",
    "metricsType",
    "timestamp",
    "raw_data",
  ];

  // Process each field in the row
  for (const [key, value] of Object.entries(row)) {
    // Skip undefined values
    if (value === undefined) continue;

    // For user metrics, only include allowed fields
    if (!allowedFields.includes(key)) {
      console.log(`Skipping field not in schema: ${key}`);
      continue;
    }

    if (value === null) {
      // Keep null values as is
      sanitized[key] = null;
    } else if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      // Convert objects to JSON strings to avoid nested object errors
      sanitized[key] = JSON.stringify(value);
    } else if (Array.isArray(value)) {
      // Handle arrays - ensure all elements are of the same type
      if (value.length === 0) {
        // Skip empty arrays or convert to null based on your preference
        sanitized[key] = null;
      } else if (value.every((item) => typeof item === "string")) {
        // Array of strings is allowed
        sanitized[key] = value;
      } else {
        // Convert mixed arrays to string to avoid type mismatch errors
        sanitized[key] = JSON.stringify(value);
      }
    } else if (key === "timestamp") {
      // For BigQuery TIMESTAMP type, we need to provide a properly formatted timestamp
      try {
        // If it's already a Date object, use it directly
        if (value instanceof Date) {
          sanitized[key] = value;
          console.log(`Using existing Date object for timestamp`);
        } else {
          // Parse the timestamp string to a Date object
          const date = new Date(value as string);

          // Check if the date is valid
          if (!isNaN(date.getTime())) {
            sanitized[key] = date;
            console.log(
              `Converted timestamp ${value} to Date object for BigQuery`
            );
          } else {
            console.warn(`Invalid timestamp value: ${value}, setting to null`);
            sanitized[key] = null;
          }
        }
      } catch (e) {
        console.error(`Error processing timestamp ${value}:`, e);
        sanitized[key] = null;
      }
    } else {
      // Keep other primitive values as is
      sanitized[key] = value;
    }
  }

  // Ensure all required fields are present
  for (const field of allowedFields) {
    if (sanitized[field] === undefined) {
      console.log(`Field ${field} is missing, setting to null`);
      sanitized[field] = null;
    }
  }

  return sanitized;
}

/**
 * Runs a query against BigQuery
 */
export async function runQuery(query: string): Promise<any[]> {
  try {
    console.log(`Running BigQuery query: ${query}`);
    console.log(`Using project ID: ${projectId}`);

    // Configure query options
    const options = {
      query,
      // Location must match that of the dataset(s) referenced in the query.
      location: "US",
    };

    // Run the query
    const [rows] = await bigquery.query(options);
    console.log(`Query returned ${rows.length} rows`);

    if (rows.length === 0) {
      console.log("No rows returned. Checking if table exists...");

      // Try to extract table name from query
      const tableMatch = query.match(/FROM\s+`([^`]+)`/i);
      if (tableMatch && tableMatch[1]) {
        const fullTablePath = tableMatch[1];
        const parts = fullTablePath.split(".");

        if (parts.length === 3) {
          const [projectId, datasetId, tableId] = parts;
          console.log(
            `Checking if table ${projectId}.${datasetId}.${tableId} exists...`
          );

          try {
            const [exists] = await bigquery
              .dataset(datasetId)
              .table(tableId)
              .exists();
            console.log(
              `Table ${projectId}.${datasetId}.${tableId} exists: ${exists}`
            );

            if (exists) {
              // Get table metadata
              const [table] = await bigquery
                .dataset(datasetId)
                .table(tableId)
                .get();
              console.log(
                `Table metadata:`,
                JSON.stringify(table.metadata, null, 2)
              );
            }
          } catch (tableError) {
            console.error(`Error checking table existence:`, tableError);
          }
        }
      }
    }

    return rows;
  } catch (error) {
    console.error("Error running BigQuery query:", error);
    throw error;
  }
}

export default {
  bigquery,
  ensureDatasetExists,
  ensureTableExists,
  insertRows,
  runQuery,
};
