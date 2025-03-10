import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Initialize global variable
// Using var for global scope
if (typeof global !== "undefined") {
  // @ts-ignore - We're intentionally adding this to the global scope
  global.schedulerInitialized = global.schedulerInitialized || false;
}

// This is a simple middleware that will make a request to the init-server API
// when the application starts, ensuring the scheduler is initialized
export async function middleware() {
  // Only run this middleware on the server
  if (typeof window === "undefined") {
    // Only initialize once per server instance
    // @ts-ignore - Accessing our global variable
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
          console.log("✅ Server-side scheduler initialized successfully");

          // @ts-ignore - Setting our global variable
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
        console.error("❌ Failed to initialize server-side scheduler:", error);
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
