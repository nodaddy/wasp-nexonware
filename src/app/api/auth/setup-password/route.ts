import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/lib/firebaseAdmin";
import { CustomClaims } from "@/types/firebase";

interface SetupPasswordRequest {
  email: string;
  token: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!db || !auth) {
      return NextResponse.json(
        {
          error:
            "Firebase Admin is not properly initialized. Please check server logs.",
        },
        { status: 500 }
      );
    }

    const { email, token, password }: SetupPasswordRequest =
      await request.json();

    // Validate input
    if (!email || !token || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if token is valid
    const companiesSnapshot = await db
      .collection("companies")
      .where("adminEmail", "==", email)
      .where("verificationToken", "==", token)
      .get();

    if (companiesSnapshot.empty) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const companyDoc = companiesSnapshot.docs[0];
    const company = companyDoc.data();

    // Check if token is expired
    const verificationExpiry = company.verificationExpiry.toDate();
    if (verificationExpiry < new Date()) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Update user in Firebase Auth
    try {
      // Get the user record
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
      } catch (error) {
        // This shouldn't happen since we created the user during registration
        console.error("User not found:", error);
        return NextResponse.json(
          { error: "User account not found" },
          { status: 400 }
        );
      }

      // Get current custom claims to preserve them
      const { customClaims = {} } = await auth.getUser(userRecord.uid);

      // Update the user with the new password and mark as verified
      await auth.updateUser(userRecord.uid, {
        password: password,
        emailVerified: true,
      });

      // Set custom claims for admin role, preserving existing claims
      const updatedClaims: CustomClaims = {
        ...customClaims,
        role: "admin", // Ensure role is set to admin
        companyId: companyDoc.id,
      };

      await auth.setCustomUserClaims(userRecord.uid, updatedClaims);

      console.log(`Updated user ${email} with verified status and admin role`);

      // Update company document
      await companyDoc.ref.update({
        status: "active",
        adminUid: userRecord.uid,
        verificationToken: null, // Clear token for security
        verificationExpiry: null,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Password set successfully. You can now log in.",
      });
    } catch (error) {
      console.error("Error setting up user:", error);
      return NextResponse.json(
        { error: "Failed to set up user account" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error setting up password:", error);
    return NextResponse.json(
      { error: "Failed to set up password" },
      { status: 500 }
    );
  }
}
