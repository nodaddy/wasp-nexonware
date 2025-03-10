import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

// Helper function to extract domain from email
const extractDomain = (email: string): string => {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : "";
};

// Valid roles
const VALID_ROLES = ["admin", "analyst"];

export async function POST(request: NextRequest) {
  try {
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

    // Get request body
    const body = await request.json();
    const { uid, role } = body;

    if (!uid) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate role if it's not null (null means revoke role)
    if (role !== null && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          error: "Invalid role. Must be 'admin', 'analyst', or null to revoke",
        },
        { status: 400 }
      );
    }

    // Verify the token and get the admin user
    try {
      if (!auth) {
        return NextResponse.json(
          { error: "Firebase Admin not initialized" },
          { status: 500 }
        );
      }

      // Verify the admin user
      const decodedToken = await auth.verifyIdToken(idToken);
      const adminUser = await auth.getUser(decodedToken.uid);

      // Check if the user is an admin
      if (
        !adminUser.customClaims?.role ||
        adminUser.customClaims.role !== "admin"
      ) {
        return NextResponse.json(
          {
            error: "Unauthorized. Only users with admin role can update roles.",
          },
          { status: 403 }
        );
      }

      // Get the admin's email domain
      const adminDomain = extractDomain(adminUser.email || "");

      if (!adminDomain) {
        return NextResponse.json(
          { error: "Admin user has no valid email domain" },
          { status: 400 }
        );
      }

      // Get the target user
      try {
        const userRecord = await auth.getUser(uid);

        // Check if the user belongs to the same domain as the admin
        const userDomain = extractDomain(userRecord.email || "");

        if (userDomain !== adminDomain) {
          return NextResponse.json(
            { error: "Cannot update user from a different organization" },
            { status: 403 }
          );
        }

        // Prevent non-admin users from assigning admin role to others
        if (role === "admin") {
          // Only admins can create other admins
          if (adminUser.customClaims?.role !== "admin") {
            return NextResponse.json(
              { error: "Only administrators can assign admin privileges" },
              { status: 403 }
            );
          }
        }

        // Update the user's custom claims
        const customClaims = { ...(userRecord.customClaims || {}) };

        if (role === null) {
          // Remove the role claim if role is null (revoke)
          if (customClaims.role) {
            delete customClaims.role;
          }
        } else {
          // Set the role claim
          customClaims.role = role;

          // Set the companyId claim to match the admin's companyId
          if (adminUser.customClaims?.companyId) {
            console.log(
              `Setting companyId ${adminUser.customClaims.companyId} for user ${uid}`
            );
            customClaims.companyId = adminUser.customClaims.companyId;
          } else {
            console.warn(
              `Admin user ${adminUser.uid} does not have a companyId claim`
            );
          }
        }

        console.log(`Updating user ${uid} with claims:`, customClaims);
        await auth.setCustomUserClaims(uid, customClaims);

        return NextResponse.json({
          success: true,
          message:
            role === null
              ? "User role has been revoked"
              : `User role updated to ${role}`,
          companyIdAssigned: customClaims.companyId ? true : false,
          companyId: customClaims.companyId || null,
        });
      } catch (error) {
        console.error("Error getting user:", error);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
