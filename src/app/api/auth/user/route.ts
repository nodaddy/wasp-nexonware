import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";
import { UserData } from "@/types/firebase";

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

    // Verify the token and get the user
    try {
      if (!auth) {
        return NextResponse.json(
          { error: "Firebase Admin not initialized" },
          { status: 500 }
        );
      }

      const decodedToken = await auth.verifyIdToken(idToken);
      const userRecord = await auth.getUser(decodedToken.uid);

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
      console.error("Error verifying token:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { error: "Failed to get user data" },
      { status: 500 }
    );
  }
}
