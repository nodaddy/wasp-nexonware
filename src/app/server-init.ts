// This file is imported by Next.js during server startup
// It's used to initialize server-side processes like cron jobs

import { startDataArchivingScheduler } from "@/lib/scheduler";
import { dataArchivingConfig, getIntervalDescription } from "@/lib/config";

// Flag to track if the scheduler has been initialized
let isSchedulerInitialized = false;

// Only run in server environment
if (typeof window === "undefined" && !isSchedulerInitialized) {
  const intervalDescription = getIntervalDescription(
    dataArchivingConfig.intervalMinutes
  );

  console.log("\n");
  console.log("=======================================================");
  console.log(`🔄 SERVER-INIT.TS - STARTING SCHEDULED DATA ARCHIVING`);
  console.log("=======================================================");
  console.log(`⏰ Initialization time: ${new Date().toISOString()}`);
  console.log(
    `⏱️ Interval: ${dataArchivingConfig.intervalMinutes} minute(s) (${intervalDescription})`
  );
  console.log(`🌐 Timezone: ${dataArchivingConfig.timezone}`);

  try {
    startDataArchivingScheduler();
    isSchedulerInitialized = true;
    console.log("✅ DATA ARCHIVING SCHEDULER INITIALIZED SUCCESSFULLY");
  } catch (error) {
    console.error("❌ ERROR initializing data archiving scheduler:", error);
  }

  console.log("=======================================================\n");
}

// Export a dummy function to prevent tree-shaking
export function getServerInitStatus() {
  return {
    initialized: isSchedulerInitialized,
    timestamp: new Date().toISOString(),
    config: {
      intervalMinutes: dataArchivingConfig.intervalMinutes,
      intervalDescription: getIntervalDescription(
        dataArchivingConfig.intervalMinutes
      ),
      timezone: dataArchivingConfig.timezone,
      runOnInit: dataArchivingConfig.runOnInit,
    },
  };
}
