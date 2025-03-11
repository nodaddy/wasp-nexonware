import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDatabase } from "@/lib/firebaseAdminCore";
import { CustomClaims } from "@/types/firebase";
import { Redis } from "@upstash/redis";

// Initialize Redis client for caching if environment variables are available
let redis: Redis | null = null;
try {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log("Redis client initialized for caching");
  }
} catch (error) {
  console.error("Failed to initialize Redis client:", error);
}

// Cache TTL in seconds (5 minutes)
const CACHE_TTL = 300;

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

      // Get company ID for cache key
      const companyId = customClaims.companyId || "global";

      // Only allow admins and analysts to access this data
      if (customClaims.role !== "admin" && customClaims.role !== "analyst") {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 403 }
        );
      }

      // Create cache key
      const cacheKey = `active-sessions:${companyId}`;

      // Try to get data from cache first
      if (redis) {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log("Returning active sessions data from cache");
          return NextResponse.json(cachedData);
        }
      }

      // Calculate timestamp for 6 hours ago
      const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000;

      // Instead of downloading the entire metrics node, we'll use a more targeted approach
      // First, check if we have a company-specific filter
      let metricsRef;

      if (customClaims.companyId) {
        // If user has a company ID, only get metrics for that company
        metricsRef = db.ref(`metrics/${customClaims.companyId}`);
      } else {
        // For global admins, still get all metrics but with a more efficient approach
        metricsRef = db.ref("metrics");
      }

      // Use orderByChild and startAt if your data structure supports it
      // This requires you to have timestamps as values rather than keys
      // If your current structure doesn't support this, you'll need to restructure your data

      // For now, we'll use a more efficient approach with the current structure
      // Get the last 24 hours of data instead of all data (adjust as needed)
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const oneDayAgoStr = oneDayAgo.toString();

      // This assumes timestamps are stored as string keys and are sortable
      const snapshot = await metricsRef
        .orderByKey()
        .startAt(oneDayAgoStr)
        .get();

      if (!snapshot.exists()) {
        const responseData = {
          activeSessions: 0,
          trend: {
            value: "0%",
            positive: true,
          },
        };

        // Cache the result
        if (redis) {
          await redis.set(cacheKey, responseData, { ex: CACHE_TTL });
        }

        return NextResponse.json(responseData);
      }

      // Count unique users from the metrics path
      const data = snapshot.val();
      const uniqueUsers = new Set();

      // Process the data structure where timestamp is part of the path
      // This is more efficient now because we're only processing a subset of the data
      if (customClaims.companyId) {
        // If we queried for a specific company, data structure is different
        Object.keys(data).forEach((userId) => {
          // Check if this user has any recent activity
          let hasRecentActivity = false;

          // Check user's metrics data
          const userData = data[userId];
          if (userData && typeof userData === "object") {
            // Look through all timestamps (which are keys in the object)
            Object.keys(userData).forEach((timestamp) => {
              // Try to convert the timestamp to a number
              const timestampNum = parseInt(timestamp, 10);

              // If it's a valid timestamp and it's within the last 6 hours
              if (!isNaN(timestampNum) && timestampNum >= oneHourAgo) {
                hasRecentActivity = true;
              }
            });
          }

          // If this user has recent activity, add them to the set
          if (hasRecentActivity) {
            uniqueUsers.add(userId);
          }
        });
      } else {
        // For global data, structure includes company IDs
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
                  if (!isNaN(timestampNum) && timestampNum >= oneHourAgo) {
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
      }

      const activeSessionsCount = uniqueUsers.size;

      const responseData = {
        activeSessions: activeSessionsCount,
        trend: {
          value: "0%",
          positive: true,
        },
      };

      // Cache the result
      if (redis) {
        await redis.set(cacheKey, responseData, { ex: CACHE_TTL });
      }

      return NextResponse.json(responseData);
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
