import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebaseAdminCore";
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
    console.log("Redis client initialized for company-users caching");
  }
} catch (error) {
  console.error("Failed to initialize Redis client:", error);
}

// Cache TTL in seconds (10 minutes - longer than active sessions since this changes less frequently)
const CACHE_TTL = 600;

// Helper function to extract domain from email
const extractDomain = (email: string): string => {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : "";
};

export async function GET(request: NextRequest) {
  try {
    // Get Firebase Admin instances
    const adminAuth = getAdminAuth();
    const db = getAdminFirestore();

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

      // Get the company ID from custom claims
      const companyId = customClaims.companyId;

      if (!companyId) {
        return NextResponse.json(
          { error: "User is not associated with a company" },
          { status: 400 }
        );
      }

      // Create cache key
      const cacheKey = `company-users:${companyId}`;

      // Try to get data from cache first
      if (redis) {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log("Returning company users data from cache");
          return NextResponse.json(cachedData);
        }
      }

      // Get the company from Firestore
      const companyDoc = await db.collection("companies").doc(companyId).get();

      if (!companyDoc.exists) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }

      // Get company data
      const companyData = companyDoc.data();
      const emailDomains = companyData?.emailDomains || [];

      if (!emailDomains.length) {
        const responseData = {
          totalUsers: 0,
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

      // Instead of listing all users, which can be expensive for large user bases,
      // we'll use a more targeted approach with pagination if available

      // For Firebase Auth, we can use the listUsers method with pagination
      // This is more efficient than downloading all users at once
      let allUsers: any[] = [];
      let nextPageToken: string | undefined;

      // Limit the number of users we process to avoid excessive downloads
      const MAX_USERS_TO_PROCESS = 1000;
      let processedUsers = 0;

      do {
        // Get a batch of users (default is 1000)
        const listUsersResult = await adminAuth.listUsers(1000, nextPageToken);

        // Filter users by domain in this batch
        const batchCompanyUsers = listUsersResult.users.filter((user) => {
          if (!user.email) return false;
          const domain = extractDomain(user.email);
          return emailDomains.includes(domain);
        });

        // Add filtered users to our collection
        allUsers = [...allUsers, ...batchCompanyUsers];

        // Update the page token for the next batch
        nextPageToken = listUsersResult.pageToken;

        // Update processed users count
        processedUsers += listUsersResult.users.length;

        // Break if we've processed too many users to avoid excessive downloads
        if (processedUsers >= MAX_USERS_TO_PROCESS) {
          console.log(
            `Reached maximum user processing limit of ${MAX_USERS_TO_PROCESS}`
          );
          break;
        }
      } while (nextPageToken);

      const responseData = {
        totalUsers: allUsers.length,
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
    console.error("Error getting company users:", error);
    return NextResponse.json(
      { error: "Failed to get company users data" },
      { status: 500 }
    );
  }
}
