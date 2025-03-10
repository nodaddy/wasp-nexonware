import { NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase-admin";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/nodemailer";

export async function POST(request: Request) {
  // Check if Firebase Admin is initialized
  if (!db || !auth) {
    return NextResponse.json(
      { error: "Firebase Admin is not initialized" },
      { status: 500 }
    );
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if the user exists in Firebase Auth
    try {
      const userRecord = await auth.getUserByEmail(email);

      if (!userRecord) {
        // Don't reveal if the email exists or not for security reasons
        return NextResponse.json(
          {
            success: true,
            message:
              "If an account with that email exists, a password reset link has been sent.",
          },
          { status: 200 }
        );
      }

      // Generate a password reset token
      const token = generatePasswordResetToken(email);

      // In a production environment, you would store this token in a database
      // with an expiration time, but for this example, we'll just send it

      // Create the reset link
      const resetLink = `${
        process.env.NEXT_PUBLIC_APP_URL
      }/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      // Send the password reset email using Nodemailer
      const emailSent = await sendPasswordResetEmail(email, resetLink);

      if (!emailSent) {
        console.error("Failed to send password reset email");
      }

      return NextResponse.json(
        {
          success: true,
          message: "Password reset email sent successfully",
          // Only include the link in development for testing
          ...(process.env.NODE_ENV === "development" && { resetLink }),
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error checking user:", error);

      // Don't reveal if the email exists or not for security reasons
      return NextResponse.json(
        {
          success: true,
          message:
            "If an account with that email exists, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in forgot-password API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
