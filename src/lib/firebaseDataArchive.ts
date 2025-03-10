import { adminFetchData, adminDeleteData, adminDb } from "./firebaseAdminDb";
import { insertRows, ensureDatasetExists, ensureTableExists } from "./bigquery";

/**
 * Fetches data from Firebase Realtime Database based on a time range
 * @param path The path in the database to query
 * @param startTimestamp The start timestamp (inclusive)
 * @param endTimestamp The end timestamp (inclusive)
 * @param timeField The field name that contains the timestamp
 * @returns Array of objects from the database
 */
export async function fetchDataByTimeRange(
  path: string,
  startTimestamp: number,
  endTimestamp: number,
  timeField: string = "timestamp"
): Promise<any[]> {
  try {
    if (!adminDb) {
      throw new Error("Firebase Admin database not initialized");
    }

    const dbRef = adminDb.ref(path);
    const snapshot = await dbRef
      .orderByChild(timeField)
      .startAt(startTimestamp)
      .endAt(endTimestamp)
      .get();

    if (!snapshot.exists()) {
      return [];
    }

    // Convert the snapshot to an array of objects with keys
    const data: any[] = [];
    snapshot.forEach((childSnapshot) => {
      data.push({
        _id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });

    return data;
  } catch (error) {
    console.error(`Error fetching data from ${path}:`, error);
    throw error;
  }
}

/**
 * Fetches metrics data from Firebase Realtime Database with the nested structure
 * metrics/$companyId/$uid/$metricsType/$timestamp
 * @param cutoffTimestamp Timestamp to use as cutoff (data older than this will be archived)
 * @returns Array of objects from the database
 */
export async function fetchMetricsDataForArchiving(
  cutoffTimestamp: number
): Promise<any[]> {
  try {
    if (!adminDb) {
      throw new Error("Firebase Admin database not initialized");
    }

    console.log(
      `Archiving data older than: ${new Date(
        cutoffTimestamp
      ).toISOString()} (${cutoffTimestamp})`
    );

    const metricsRef = adminDb.ref("metrics");
    const metricsSnapshot = await metricsRef.get();

    if (!metricsSnapshot.exists()) {
      console.log("No metrics data found in Firebase");
      return [];
    }

    // Log the structure of the first few levels to help debug
    console.log("Firebase data structure:");
    const structure: any = {};
    metricsSnapshot.forEach((companySnapshot) => {
      const companyId = companySnapshot.key;
      structure[companyId] = {};
      let userCount = 0;

      companySnapshot.forEach((userSnapshot) => {
        if (userCount < 2) {
          // Limit to first 2 users for brevity
          const userId = userSnapshot.key;
          structure[companyId][userId] = {};
          userCount++;
        }
      });
    });
    console.log(JSON.stringify(structure, null, 2));

    const allMetrics: any[] = [];

    // Iterate through company IDs
    metricsSnapshot.forEach((companySnapshot) => {
      const companyId = companySnapshot.key;

      // Iterate through user IDs
      companySnapshot.forEach((userSnapshot) => {
        const userId = userSnapshot.key;

        // Iterate through metrics types
        userSnapshot.forEach((metricsTypeSnapshot) => {
          const metricsType = metricsTypeSnapshot.key;

          // Check if this is a timestamp level or if there's another level
          if (metricsTypeSnapshot.hasChildren()) {
            // Handle the case where timestamps are at this level
            if (isTimestampLevel(metricsTypeSnapshot)) {
              processTimestampLevel(
                metricsTypeSnapshot,
                companyId,
                userId,
                metricsType,
                cutoffTimestamp,
                allMetrics
              );
            } else {
              // Handle nested structure - iterate one more level
              metricsTypeSnapshot.forEach((nestedSnapshot) => {
                const nestedKey = nestedSnapshot.key;
                if (isTimestampLevel(nestedSnapshot)) {
                  processTimestampLevel(
                    nestedSnapshot,
                    companyId,
                    userId,
                    `${metricsType}/${nestedKey}`,
                    cutoffTimestamp,
                    allMetrics
                  );
                }
              });
            }
          }
        });
      });
    });

    console.log(`Found ${allMetrics.length} records to archive`);
    return allMetrics;
  } catch (error) {
    console.error("Error fetching metrics data:", error);
    throw error;
  }
}

/**
 * Checks if a snapshot contains timestamp data
 */
function isTimestampLevel(snapshot: any): boolean {
  let isTimestamp = false;
  snapshot.forEach((child: any) => {
    // Check if the key can be parsed as a number (timestamp)
    const key = child.key;
    if (!isNaN(parseInt(key, 10))) {
      isTimestamp = true;
    }
  });
  return isTimestamp;
}

/**
 * Process a level containing timestamps
 */
function processTimestampLevel(
  snapshot: any,
  companyId: string,
  userId: string,
  metricsType: string,
  cutoffTimestamp: number,
  results: any[]
) {
  snapshot.forEach((timestampSnapshot: any) => {
    const timestamp = timestampSnapshot.key;
    const timestampNum = parseInt(timestamp, 10);

    // If it's not a valid timestamp, skip
    if (isNaN(timestampNum)) return;

    // For testing, include all data regardless of age if cutoffTimestamp is 0
    const shouldInclude =
      cutoffTimestamp === 0 || timestampNum <= cutoffTimestamp;

    if (shouldInclude) {
      const data = timestampSnapshot.val();

      try {
        // Create a base object with only the core fields
        const metricObject: any = {
          _id: timestamp,
          companyId,
          userId,
          metricsType,
          // Create a proper Date object for the timestamp field
          timestamp: new Date(timestampNum),
        };

        // Store the complete data as a JSON string in raw_data
        if (data !== null) {
          metricObject.raw_data = JSON.stringify(data);
        } else {
          metricObject.raw_data = null;
        }

        results.push(metricObject);
      } catch (error) {
        console.error(`Error processing metric at ${timestamp}:`, error);
      }
    }
  });
}

/**
 * Archives data from Firebase to BigQuery and optionally deletes it from Firebase
 */
export async function archiveDataToBigQuery(
  firebasePath: string,
  bigQueryTableId: string,
  startTimestamp: number,
  endTimestamp: number,
  schema: any[],
  timeField: string = "timestamp",
  deleteAfterArchive: boolean = false
): Promise<{ archived: number; deleted: number }> {
  try {
    // Ensure BigQuery dataset and table exist
    await ensureDatasetExists();
    await ensureTableExists(bigQueryTableId, schema);

    // Fetch data from Firebase
    const data = await fetchDataByTimeRange(
      firebasePath,
      startTimestamp,
      endTimestamp,
      timeField
    );

    if (data.length === 0) {
      return { archived: 0, deleted: 0 };
    }

    // Insert data into BigQuery
    await insertRows(bigQueryTableId, data);

    // Optionally delete data from Firebase after successful archiving
    let deletedCount = 0;
    if (deleteAfterArchive && adminDb) {
      for (const item of data) {
        const path = `${firebasePath}/${item._id}`;
        await adminDeleteData(path);
        deletedCount++;
      }
    }

    return {
      archived: data.length,
      deleted: deletedCount,
    };
  } catch (error) {
    console.error("Error archiving data:", error);
    throw error;
  }
}

/**
 * Archives metrics data from Firebase to BigQuery and deletes it after archiving
 * @param bigQueryTableId The BigQuery table ID to archive to
 * @param hoursToKeep Number of hours of data to keep in Firebase
 * @param schema The BigQuery schema
 */
export async function archiveMetricsToBigQuery(
  bigQueryTableId: string,
  hoursToKeep: number = 6,
  timeUnit: "hours" | "days" = "hours",
  schema: any[],
  deleteAfterArchive: boolean = true
): Promise<{ archived: number; deleted: number }> {
  try {
    console.log(
      `Using schema with ${schema.length} fields:`,
      schema.map((f) => f.name).join(", ")
    );

    // Ensure BigQuery dataset and table exist
    await ensureDatasetExists();
    await ensureTableExists(bigQueryTableId, schema);

    // Calculate cutoff timestamp based on time unit
    const cutoffTimestamp =
      timeUnit === "hours"
        ? getTimestampHoursAgo(hoursToKeep)
        : getTimestampDaysAgo(hoursToKeep);

    // Fetch metrics data
    const data = await fetchMetricsDataForArchiving(cutoffTimestamp);

    if (data.length === 0) {
      return { archived: 0, deleted: 0 };
    }

    // Verify data structure matches schema
    const sampleData = data[0];
    const schemaFields = schema.map((field) => field.name);
    const dataFields = Object.keys(sampleData);

    console.log("Schema fields:", schemaFields);
    console.log("Data fields:", dataFields);

    // Check for missing fields
    const missingFields = schemaFields.filter(
      (field) => !dataFields.includes(field)
    );
    if (missingFields.length > 0) {
      console.warn(
        `Data is missing fields defined in schema: ${missingFields.join(", ")}`
      );
    }

    // Check for extra fields
    const extraFields = dataFields.filter(
      (field) => !schemaFields.includes(field)
    );
    if (extraFields.length > 0) {
      console.warn(
        `Data contains fields not in schema: ${extraFields.join(", ")}`
      );
    }

    // Insert data into BigQuery
    await insertRows(bigQueryTableId, data);

    // Delete data from Firebase after successful archiving
    let deletedCount = 0;
    if (deleteAfterArchive && adminDb) {
      try {
        console.log(
          `Starting deletion of ${data.length} records from Firebase...`
        );
        // Use the admin database for deletion
        for (const item of data) {
          const { companyId, userId, metricsType, _id } = item;
          const path = `metrics/${companyId}/${userId}/${metricsType}/${_id}`;

          try {
            await adminDeleteData(path);
            deletedCount++;

            // Log progress periodically
            if (deletedCount % 100 === 0) {
              console.log(`Deleted ${deletedCount}/${data.length} records...`);
            }
          } catch (deleteError) {
            console.error(`Error deleting item at ${path}:`, deleteError);
            // Continue with other deletions even if one fails
          }
        }
        console.log(
          `Completed deletion of ${deletedCount}/${data.length} records from Firebase`
        );
      } catch (deleteError) {
        console.error("Error during deletion process:", deleteError);
        // Still return successful archiving even if deletion fails
      }
    }

    return {
      archived: data.length,
      deleted: deletedCount,
    };
  } catch (error) {
    console.error("Error archiving metrics data:", error);
    throw error;
  }
}

/**
 * Calculates timestamp for a given number of days ago
 */
export function getTimestampDaysAgo(days: number): number {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.getTime();
}

/**
 * Calculates timestamp for a given number of hours ago
 */
export function getTimestampHoursAgo(hours: number): number {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.getTime();
}

export default {
  fetchDataByTimeRange,
  archiveDataToBigQuery,
  getTimestampDaysAgo,
  getTimestampHoursAgo,
  fetchMetricsDataForArchiving,
  archiveMetricsToBigQuery,
};
