import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDatabase } from "@/lib/firebaseAdminCore";
import { CustomClaims } from "@/types/firebase";

export async function GET(request: NextRequest) {
  try {
    // Get Firebase Admin instances
    const adminAuth = getAdminAuth();
    const db = getAdminDatabase();

    // Get the authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract the token
    const idToken = authHeader.split("Bearer ")[1];

    if (!idToken) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    try {
      // Verify the token and get the user
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const userRecord = await adminAuth.getUser(decodedToken.uid);

      // Check if user has custom claims
      const customClaims: CustomClaims = userRecord.customClaims || {};

      // Only allow admins and analysts to access this data
      if (customClaims.role !== "admin" && customClaims.role !== "analyst") {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 403 }
        );
      }

      // Calculate timestamp for 6 hours ago
      const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;

      // Create a reference to the metrics node
      const metricsRef = db.ref("metrics");

      // Get all metrics data
      const snapshot = await metricsRef.get();

      if (!snapshot.exists()) {
        return NextResponse.json({
          activeSessions: 0,
          trend: {
            value: "0%",
            positive: true,
          },
        });
      }

      // Count unique users from the metrics path
      const data = snapshot.val();
      const uniqueUsers = new Set();
      const currentTime = Date.now();

      // Process the data structure where timestamp is part of the path
      // Iterate through companyIds
      Object.keys(data).forEach((companyId) => {
        // Iterate through userIds within each company
        if (data[companyId] && typeof data[companyId] === "object") {
          Object.keys(data[companyId]).forEach((userId) => {
            // Check if this user has any recent activity
            let hasRecentActivity = false;

            // Check user's metrics data
            const userData = data[companyId][userId];
            if (userData && typeof userData === "object") {
              // Look through all timestamps (which are keys in the object)
              Object.keys(userData).forEach((timestamp) => {
                // Try to convert the timestamp to a number
                const timestampNum = parseInt(timestamp, 10);

                // If it's a valid timestamp and it's within the last 6 hours
                if (!isNaN(timestampNum) && timestampNum >= sixHoursAgo) {
                  hasRecentActivity = true;
                }
              });
            }

            // If this user has recent activity, add them to the set
            if (hasRecentActivity) {
              uniqueUsers.add(userId);
            }
          });
        }
      });

      const activeSessionsCount = uniqueUsers.size;

      return NextResponse.json({
        activeSessions: activeSessionsCount,
        trend: {
          value: "0%",
          positive: true,
        },
      });
    } catch (error) {
      console.error("Error verifying token:", error);
      // Return a more detailed error message for debugging
      return NextResponse.json(
        {
          error: "Invalid token",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error getting active sessions:", error);
    return NextResponse.json(
      { error: "Failed to get active sessions data" },
      { status: 500 }
    );
  }
}
