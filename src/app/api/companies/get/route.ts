import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/lib/firebaseAdmin";
import { Company } from "@/types/api";
import { CustomClaims } from "@/types/firebase";

export async function GET(request: NextRequest) {
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

    // Verify the token and get the user
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      const userRecord = await auth.getUser(decodedToken.uid);

      // Check if user has custom claims
      const customClaims: CustomClaims = userRecord.customClaims || {};

      // Get the company ID from the URL query or from custom claims
      const { searchParams } = new URL(request.url);
      let companyId = searchParams.get("id");

      // If no company ID is provided, use the one from custom claims
      if (!companyId && customClaims.companyId) {
        companyId = customClaims.companyId;
      }

      if (!companyId) {
        return NextResponse.json(
          { error: "Company ID is required" },
          { status: 400 }
        );
      }

      // Check if user has access to this company
      if (
        customClaims.role !== "admin" &&
        customClaims.companyId !== companyId
      ) {
        return NextResponse.json(
          { error: "Unauthorized access to company data" },
          { status: 403 }
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

      // Return company data
      const companyData = companyDoc.data();
      const company: Company = {
        id: companyDoc.id,
        name: companyData?.name || "",
        email: companyData?.email || "",
        phone: companyData?.phone,
        address: companyData?.address,
        createdAt: companyData?.createdAt || new Date().toISOString(),
        updatedAt: companyData?.updatedAt,
        status:
          (companyData?.status as "active" | "pending" | "inactive") ||
          "pending",
        adminEmail: companyData?.adminEmail,
        adminId: companyData?.adminId,
        ...companyData,
      };

      return NextResponse.json(company);
    } catch (error) {
      console.error("Error verifying token:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error getting company:", error);
    return NextResponse.json(
      { error: "Failed to get company data" },
      { status: 500 }
    );
  }
}
