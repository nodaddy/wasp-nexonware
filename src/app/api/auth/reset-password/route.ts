import { NextResponse } from "next/server";
import { db, auth } from "@/lib/firebaseAdmin";
import { verifyPasswordResetToken } from "@/lib/tokens";

export async function POST(request: Request) {
  // Check if Firebase Admin is initialized
  if (!db || !auth) {
    return NextResponse.json(
      { error: "Firebase Admin is not initialized" },
      { status: 500 }
    );
  }

  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: "Email, token, and password are required" },
        { status: 400 }
      );
    }

    // Verify the token
    const tokenData = verifyPasswordResetToken(token);
    if (!tokenData || tokenData.email !== email) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Update the user's password in Firebase Auth
    try {
      // Get the user by email
      const userRecord = await auth.getUserByEmail(email);

      // Update the password
      await auth.updateUser(userRecord.uid, {
        password: password,
      });

      return NextResponse.json(
        { success: true, message: "Password reset successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating user password:", error);
      return NextResponse.json(
        { error: "Failed to reset password" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in reset-password API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
