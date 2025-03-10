/**
 * Configuration module for the application
 * This centralizes all configuration settings from environment variables
 */

// Data Archiving Configuration
export const dataArchivingConfig = {
  // Interval in minutes between data archiving runs
  // This replaces the cron schedule with a simpler configuration
  intervalMinutes: parseInt(
    process.env.DATA_ARCHIVING_INTERVAL_MINUTES || "60"
  ),

  // Timezone for the scheduler (used for logging)
  timezone: process.env.DATA_ARCHIVING_TIMEZONE || "UTC",

  // Whether to run the archiving process when the scheduler starts
  runOnInit: process.env.DATA_ARCHIVING_RUN_ON_INIT !== "false",

  // Secret key for API authentication
  secretKey: process.env.ARCHIVING_SECRET_KEY || "",

  // Default days to keep data before archiving
  defaultDaysToKeep: parseInt(process.env.DATA_ARCHIVING_DAYS_TO_KEEP || "365"),
};

/**
 * Get a human-readable description of the interval
 */
export function getIntervalDescription(minutes: number): string {
  if (minutes < 1) {
    return "Invalid interval";
  }

  if (minutes === 1) {
    return "Every minute";
  }

  if (minutes === 60) {
    return "Every hour";
  }

  if (minutes === 1440) {
    return "Every day";
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `Every ${hours} hour${hours > 1 ? "s" : ""}`;
  }

  return `Every ${minutes} minute${minutes > 1 ? "s" : ""}`;
}
