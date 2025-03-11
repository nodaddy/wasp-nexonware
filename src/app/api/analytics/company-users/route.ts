import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebaseAdminCore";
import { CustomClaims } from "@/types/firebase";

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
        return NextResponse.json({
          totalUsers: 0,
          trend: {
            value: "0%",
            positive: true,
          },
        });
      }

      // List all users
      const listUsersResult = await adminAuth.listUsers();

      // Filter users by domain
      const companyUsers = listUsersResult.users.filter((user) => {
        if (!user.email) return false;
        const domain = extractDomain(user.email);
        return emailDomains.includes(domain);
      });

      return NextResponse.json({
        totalUsers: companyUsers.length,
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
    console.error("Error getting company users:", error);
    return NextResponse.json(
      { error: "Failed to get company users data" },
      { status: 500 }
    );
  }
}
