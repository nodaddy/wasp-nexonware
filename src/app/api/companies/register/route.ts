import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/lib/firebaseAdmin";
import crypto from "crypto";
import { sendCompanyRegistrationEmail } from "@/lib/nodemailer";
import { generateCompanyVerificationToken } from "@/lib/tokens";

interface CompanyRegistrationRequest {
  companyName: string;
  adminEmail: string;
  adminName: string;
  inviteCode: string;
  emailDomains: string[];
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

    const {
      companyName,
      adminEmail,
      adminName,
      inviteCode,
      emailDomains,
    }: CompanyRegistrationRequest = await request.json();

    // Validate input
    if (!companyName || !adminEmail || !adminName || !inviteCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email domains
    if (
      !emailDomains ||
      !Array.isArray(emailDomains) ||
      emailDomains.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one email domain is required" },
        { status: 400 }
      );
    }

    // Check if company with this admin email already exists
    const existingCompanies = await db
      .collection("companies")
      .where("adminEmail", "==", adminEmail)
      .get();

    if (!existingCompanies.empty) {
      return NextResponse.json(
        { error: "A company with this admin email already exists" },
        { status: 400 }
      );
    }

    // Validate the invite code
    const invitesSnapshot = await db
      .collection("invites")
      .where("code", "==", inviteCode)
      .where("status", "==", "active")
      .get();

    if (invitesSnapshot.empty) {
      return NextResponse.json(
        { error: "Invalid or expired invite code" },
        { status: 400 }
      );
    }

    const inviteDoc = invitesSnapshot.docs[0];
    const inviteData = inviteDoc.data();

    // Check if the invite has expired
    const expiresAt = inviteData.expiresAt?.toDate();
    if (expiresAt && expiresAt < new Date()) {
      // Update the invite status to expired
      await inviteDoc.ref.update({
        status: "expired",
        updatedAt: new Date(),
      });

      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 400 }
      );
    }

    // Check if the email domain is allowed by the invite
    const adminDomain = adminEmail.split("@")[1].toLowerCase();
    const allowedDomains = inviteData.allowedDomains || [];

    if (allowedDomains.length > 0 && !allowedDomains.includes(adminDomain)) {
      return NextResponse.json(
        { error: "Your email domain is not authorized to use this invite" },
        { status: 400 }
      );
    }

    // Generate verification token using our token utility
    const verificationToken = generateCompanyVerificationToken(
      crypto.randomBytes(16).toString("hex"),
      adminEmail
    );
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hour expiry

    // Create company document
    const companyRef = await db.collection("companies").add({
      name: companyName,
      adminEmail: adminEmail,
      adminName: adminName,
      emailDomains: emailDomains,
      inviteId: inviteDoc.id,
      inviteCode: inviteCode,
      verificationToken: verificationToken,
      verificationExpiry: verificationExpiry,
      status: "pending", // pending, active, suspended
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update the invite status to used
    await inviteDoc.ref.update({
      status: "used",
      usedBy: adminEmail,
      usedAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate verification link
    const verificationLink = `${
      process.env.NEXT_PUBLIC_APP_URL
    }/auth/setup-password?token=${verificationToken}&email=${encodeURIComponent(
      adminEmail
    )}`;

    console.log(`Verification link for ${adminEmail}: ${verificationLink}`);

    try {
      // Check if user already exists
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(adminEmail);

        // If user exists, update their custom claims to include admin role and companyId
        await auth.setCustomUserClaims(userRecord.uid, {
          role: "admin",
          companyId: companyRef.id,
        });

        console.log(`Updated existing user ${adminEmail} with admin role`);
      } catch (error) {
        console.error("Error in user creation or sending email:", error);
        // User doesn't exist, create a temporary user with a random password
        // This user will be properly set up when they complete registration
        const tempPassword = crypto.randomBytes(16).toString("hex");
        userRecord = await auth.createUser({
          email: adminEmail,
          password: tempPassword,
          displayName: adminName,
          emailVerified: false,
        });

        // Set custom claims for admin role
        await auth.setCustomUserClaims(userRecord.uid, {
          role: "admin",
          companyId: companyRef.id,
        });

        console.log(`Temporary user created for ${adminEmail} with admin role`);
      }

      // Send verification email using Nodemailer
      const emailSent = await sendCompanyRegistrationEmail(
        adminEmail,
        verificationLink,
        companyName,
        adminName
      );

      if (!emailSent) {
        console.error("Failed to send verification email");
      }

      return NextResponse.json({
        success: true,
        message:
          "Company registered successfully. Please check your email to complete setup.",
        companyId: companyRef.id,
        // Only include the verification link in development for testing
        ...(process.env.NODE_ENV === "development" && { verificationLink }),
      });
    } catch (emailError) {
      console.error("Error in user creation or sending email:", emailError);

      // If email fails, we should still return success but log the error
      return NextResponse.json({
        success: true,
        message:
          "Company registered successfully, but verification email could not be sent. Please contact support.",
        companyId: companyRef.id,
        // Only include the verification link in development for testing
        ...(process.env.NODE_ENV === "development" && { verificationLink }),
      });
    }
  } catch (error) {
    console.error("Error registering company:", error);
    return NextResponse.json(
      { error: "Failed to register company" },
      { status: 500 }
    );
  }
}
