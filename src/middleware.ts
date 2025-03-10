import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Declare global variable for TypeScript
declare global {
  var schedulerInitialized: boolean;
}

// This is a simple middleware that will make a request to the init-server API
// when the application starts, ensuring the scheduler is initialized
export async function middleware(request: NextRequest) {
  // Only run this middleware on the server
  if (typeof window === "undefined") {
    // Only initialize once per server instance
    if (!global.schedulerInitialized) {
      try {
        console.log("\n");
        console.log("=======================================================");
        console.log("🔄 MIDDLEWARE - INITIALIZING SCHEDULER");
        console.log("=======================================================");
        console.log(
          `⏰ Middleware execution time: ${new Date().toISOString()}`
        );

        // Make a request to the init-server API to initialize the scheduler
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        console.log(
          `🔗 Calling init-server API at: ${baseUrl}/api/init-server`
        );

        const response = await fetch(`${baseUrl}/api/init-server`);

        if (response.ok) {
          console.log("✅ SCHEDULER INITIALIZED VIA MIDDLEWARE SUCCESSFULLY");
          global.schedulerInitialized = true;
        } else {
          console.error(
            `❌ Failed to initialize scheduler: ${response.status} ${response.statusText}`
          );
        }

        console.log(
          "=======================================================\n"
        );
      } catch (error) {
        console.error("❌ ERROR initializing scheduler via middleware:", error);
      }
    }
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Run on homepage and API routes
    "/",
    "/api/:path*",
  ],
};
