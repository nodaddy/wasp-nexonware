import { NextRequest, NextResponse } from "next/server";
import {
  startDataArchivingScheduler,
  runDataArchivingOnce,
} from "@/lib/scheduler";

// Flag to track if the scheduler has been initialized
let isSchedulerInitialized = false;

// Initialize the scheduler when this module is loaded
if (typeof window === "undefined" && !isSchedulerInitialized) {
  console.log("\n");
  console.log("=======================================================");
  console.log("🔄 SERVER INITIALIZATION - STARTING CRON JOB SCHEDULER");
  console.log("=======================================================");
  console.log(`⏰ Initialization time: ${new Date().toISOString()}`);

  startDataArchivingScheduler();
  isSchedulerInitialized = true;

  console.log("✅ SERVER-SIDE SCHEDULER INITIALIZED SUCCESSFULLY");
  console.log("=======================================================\n");
}

/**
 * API route to check the status of the scheduler
 */
export async function GET() {
  console.log(`📊 Scheduler status check at ${new Date().toISOString()}`);

  return NextResponse.json({
    status: "ok",
    schedulerInitialized: isSchedulerInitialized,
    message: "Server-side scheduler status",
    configuration: {
      frequency: "Every minute",
      timezone: "UTC",
      nextRun: new Date(Math.ceil(Date.now() / 60000) * 60000).toISOString(),
    },
  });
}

/**
 * API route to manually trigger the data archiving process
 */
export async function POST(request: NextRequest) {
  try {
    console.log("\n");
    console.log("=======================================================");
    console.log("🔄 MANUAL TRIGGER - DATA ARCHIVING PROCESS");
    console.log("=======================================================");
    console.log(`⏰ Trigger time: ${new Date().toISOString()}`);

    // Get the API key from query parameters
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("key");
    const secretKey = process.env.ARCHIVING_SECRET_KEY;

    // Optional API key check - if ARCHIVING_SECRET_KEY is set, verify the key
    if (secretKey && apiKey !== secretKey) {
      console.log("❌ Authentication failed - Invalid or missing API key");
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing API key" },
        { status: 401 }
      );
    }

    console.log(
      "🔑 Authentication successful - Running data archiving process"
    );

    // Run the data archiving process once
    const results = await runDataArchivingOnce();

    console.log("✅ Manual data archiving process completed successfully");
    console.log("=======================================================\n");

    return NextResponse.json({
      status: "success",
      message: "Data archiving process triggered manually",
      results,
    });
  } catch (error: unknown) {
    console.error("❌ ERROR triggering data archiving process:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
