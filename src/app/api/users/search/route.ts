import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";
import { UserData } from "@/types/firebase";

// Helper function to extract domain from email
const extractDomain = (email: string): string => {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : "";
};

export async function GET(request: NextRequest) {
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

    // Get search query from URL
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
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
            error:
              "Unauthorized. Only users with admin role can search for users.",
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

      // Try to get the user by email
      try {
        const userRecord = await auth.getUserByEmail(email);

        // Check if the user belongs to the same domain as the admin
        const userDomain = extractDomain(userRecord.email || "");

        if (userDomain !== adminDomain) {
          return NextResponse.json(
            { error: "User not found in your organization" },
            { status: 404 }
          );
        }

        // Return user data with custom claims
        const userData: UserData = {
          uid: userRecord.uid,
          email: userRecord.email || null,
          displayName: userRecord.displayName || null,
          emailVerified: userRecord.emailVerified,
          photoURL: userRecord.photoURL || null,
          customClaims: userRecord.customClaims || {},
          createdAt: userRecord.metadata.creationTime,
        };

        return NextResponse.json(userData);
      } catch (error) {
        // User not found
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error searching for user:", error);
    return NextResponse.json(
      { error: "Failed to search for user" },
      { status: 500 }
    );
  }
}
