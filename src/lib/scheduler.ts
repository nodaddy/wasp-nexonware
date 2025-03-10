import { archiveMetricsToBigQuery } from "./firebaseDataArchive";
import { dataArchivingConfig, getIntervalDescription } from "./config";

// Define schema type (same as in the data-archiving route)
type SchemaField = {
  name: string;
  type: string;
  mode?: "NULLABLE" | "REQUIRED" | "REPEATED";
  description?: string;
};
type SchemaTypes = "userMetrics"; // Add other schema types as needed

// Define schemas for different data types (same as in the data-archiving route)
const SCHEMAS: Record<SchemaTypes, SchemaField[]> = {
  // Schema for user metrics data
  userMetrics: [
    { name: "_id", type: "STRING" },
    { name: "companyId", type: "STRING" },
    { name: "userId", type: "STRING" },
    { name: "metricsType", type: "STRING" },
    { name: "timestamp", type: "TIMESTAMP" },
    { name: "raw_data", type: "STRING" },
  ],
};

// Define archiving configuration type
type ArchivingConfig = {
  tableId: string;
  schemaType: SchemaTypes;
  daysToKeep: number;
  deleteAfterArchive: boolean;
};

// Define archiving configurations for different data types
const ARCHIVING_CONFIGS: ArchivingConfig[] = [
  {
    tableId: "user_metrics_archive",
    schemaType: "userMetrics",
    daysToKeep: 90, // Keep 3 months of data in Firebase
    deleteAfterArchive: true,
  },
  // Add more configurations for different data paths
];

// Flag to track if the scheduler is running
let isSchedulerRunning = false;

/**
 * Run the data archiving process
 */
async function runDataArchiving() {
  console.log("📋 Starting scheduled data archiving process...");

  try {
    // Process all configured archiving tasks
    const results = [];

    for (const config of ARCHIVING_CONFIGS) {
      const { tableId, schemaType, daysToKeep, deleteAfterArchive } = config;

      console.log(
        `🔍 Processing ${tableId} with schema ${schemaType}, keeping data for ${daysToKeep} days`
      );

      // Archive metrics data
      const result = await archiveMetricsToBigQuery(
        tableId,
        daysToKeep,
        "days", // Using days as the time unit
        SCHEMAS[schemaType],
        deleteAfterArchive
      );

      results.push({
        tableId,
        archived: result.archived,
        deleted: result.deleted,
      });

      console.log(
        `✅ Archived data for ${tableId}: ${result.archived} records, deleted: ${result.deleted} records`
      );
    }

    console.log("🎉 Scheduled data archiving completed successfully");
    return results;
  } catch (error: any) {
    console.error("❌ ERROR in scheduled data archiving:", error);
    throw error;
  }
}

/**
 * Start the scheduler for data archiving
 */
export function startDataArchivingScheduler() {
  if (isSchedulerRunning) {
    console.log("🔄 Data archiving scheduler is already running");
    return;
  }

  const { intervalMinutes, timezone, runOnInit } = dataArchivingConfig;
  const intervalDescription = getIntervalDescription(intervalMinutes);
  const intervalMs = intervalMinutes * 60 * 1000; // Convert minutes to milliseconds

  console.log("\n");
  console.log("=======================================================");
  console.log(
    `🚀 INITIALIZING DATA ARCHIVING - ${intervalDescription.toUpperCase()}`
  );
  console.log("=======================================================");
  console.log(`⏰ Current time: ${new Date().toISOString()}`);
  console.log(
    `⏱️ Interval: ${intervalMinutes} minute(s) (${intervalDescription})`
  );
  console.log(`🌐 Timezone: ${timezone}`);
  console.log(`▶️ Run on init: ${runOnInit}`);

  // Function to run the data archiving process
  const runArchiving = async () => {
    try {
      const now = new Date();
      console.log("\n");
      console.log("=======================================================");
      console.log(
        `📊 SCHEDULED DATA ARCHIVING RUNNING AT ${now.toISOString()}`
      );
      console.log(`🕒 Local time: ${now.toLocaleTimeString()}`);
      console.log(`📅 Schedule: ${intervalDescription}`);
      console.log("=======================================================");

      await runDataArchiving();

      console.log("=======================================================");
      console.log(
        `✅ SCHEDULED DATA ARCHIVING COMPLETED AT ${new Date().toISOString()}`
      );
      console.log(
        `⏭️ Next run in ${intervalMinutes} minute(s) at approximately ${new Date(
          Date.now() + intervalMs
        ).toISOString()}`
      );
      console.log("=======================================================\n");
    } catch (error) {
      console.error("❌ ERROR in scheduled data archiving task:", error);
    }
  };

  // Run immediately if configured to do so
  if (runOnInit) {
    console.log(`▶️ Running initial data archiving process...`);
    runArchiving();
  }

  // Set up the interval
  const intervalId = setInterval(runArchiving, intervalMs);

  isSchedulerRunning = true;
  console.log("✅ Data archiving scheduler started successfully");
  console.log(
    `⏭️ Next run in ${intervalMinutes} minute(s) at approximately ${new Date(
      Date.now() + intervalMs
    ).toISOString()}`
  );
  console.log("=======================================================\n");

  // Return the interval ID so it can be cleared if needed
  return intervalId;
}

/**
 * Run the data archiving process once (for testing)
 */
export async function runDataArchivingOnce() {
  return await runDataArchiving();
}

// Self-initializing code - this will run when the module is imported
// Only run in server environment
if (typeof window === "undefined") {
  const intervalDescription = getIntervalDescription(
    dataArchivingConfig.intervalMinutes
  );

  console.log("\n");
  console.log("=======================================================");
  console.log("🚀 SCHEDULER MODULE LOADED - INITIALIZING DATA ARCHIVING");
  console.log("=======================================================");
  console.log(`⏰ Module load time: ${new Date().toISOString()}`);
  console.log(
    `⏱️ Interval: ${dataArchivingConfig.intervalMinutes} minute(s) (${intervalDescription})`
  );
  console.log(`🌐 Timezone: ${dataArchivingConfig.timezone}`);

  // Start the scheduler
  startDataArchivingScheduler();

  console.log("=======================================================\n");
}
