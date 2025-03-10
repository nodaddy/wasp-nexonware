import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/lib/firebaseAdmin";
import { CustomClaims } from "@/types/firebase";

interface UpdateCompanyRequest {
  companyId: string;
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    status?: "active" | "pending" | "inactive";
    emailDomains?: string[];
    [key: string]: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!db || !auth) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 }
      );
    }

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
    const body: UpdateCompanyRequest = await request.json();
    const { companyId, data } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No update data provided" },
        { status: 400 }
      );
    }

    // Verify the token and get the user
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      const userRecord = await auth.getUser(decodedToken.uid);

      // Check if user has custom claims
      const customClaims: CustomClaims = userRecord.customClaims || {};

      // Check if user is an admin
      if (customClaims.role !== "admin") {
        return NextResponse.json(
          { error: "Only administrators can update company information" },
          { status: 403 }
        );
      }

      // Check if user has access to this company
      if (customClaims.companyId !== companyId) {
        return NextResponse.json(
          { error: "Unauthorized access to company data" },
          { status: 403 }
        );
      }

      // Get the company from Firestore
      const companyRef = db.collection("companies").doc(companyId);
      const companyDoc = await companyRef.get();

      if (!companyDoc.exists) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }

      // Prepare update data
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: userRecord.uid,
      };

      // Update the company
      await companyRef.update(updateData);

      return NextResponse.json({
        success: true,
        message: "Company information updated successfully",
      });
    } catch (error) {
      console.error("Error verifying token:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company information" },
      { status: 500 }
    );
  }
}
