import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdminCore";
import { Invite } from "@/types/invite";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    // Get the invite code from the URL params
    const { code } = params;
    console.log(`Checking invite code: "${code}"`);

    if (!code) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json(
        {
          error:
            "Firebase Admin is not properly initialized. Please check server logs.",
        },
        { status: 500 }
      );
    }

    // Log all invites for debugging
    console.log("Fetching all invites for debugging...");
    const allInvitesSnapshot = await db.collection("invites").get();
    console.log(`Found ${allInvitesSnapshot.size} total invites`);
    allInvitesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(
        `Invite in DB: id=${doc.id}, code="${data.code}", status=${data.status}`
      );
    });

    // Query the invite by code (case insensitive)
    console.log(`Querying for invite with code="${code}"`);
    // First try exact match
    let inviteSnapshot = await db
      .collection("invites")
      .where("code", "==", code)
      .get();

    // If no results, try case insensitive search by getting all and filtering
    let matchingDocs: QueryDocumentSnapshot[] = [];
    if (inviteSnapshot.empty) {
      console.log("No exact match found, trying case insensitive search");
      const allInvites = await db.collection("invites").get();
      matchingDocs = allInvites.docs.filter(
        (doc) => doc.data().code.toLowerCase() === code.toLowerCase()
      );

      if (matchingDocs.length > 0) {
        console.log(
          `Found ${matchingDocs.length} matching invites with case insensitive search`
        );
      }
    } else {
      console.log(
        `Found ${inviteSnapshot.size} matching invites with exact search`
      );
      matchingDocs = inviteSnapshot.docs;
    }

    // Check if invite exists
    if (matchingDocs.length === 0) {
      console.log("No matching invite found after all searches");
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Get the invite data
    const inviteDoc = matchingDocs[0];
    const inviteData = inviteDoc.data();
    console.log("Found invite:", JSON.stringify(inviteData, null, 2));

    // Format the invite data for response with Date objects
    const inviteResponse: Invite = {
      id: inviteDoc.id,
      code: inviteData.code,
      allowedDomains: inviteData.allowedDomains || [],
      createdAt: inviteData.createdAt?.toDate() || new Date(),
      expiresAt: inviteData.expiresAt?.toDate() || new Date(),
      status: inviteData.status,
      updatedAt: inviteData.updatedAt?.toDate(),
      usedAt: inviteData.usedAt?.toDate(),
      usedBy: inviteData.usedBy,
    };

    // Check if invite is expired
    const now = new Date();
    if (inviteResponse.expiresAt < now) {
      console.log("Invite is expired");
      // Update the invite status to expired if it's not already
      if (inviteData.status === "active") {
        console.log("Updating invite status to expired");
        await inviteDoc.ref.update({
          status: "expired",
          updatedAt: now,
        });
        inviteResponse.status = "expired";
        inviteResponse.updatedAt = now;
      }

      return NextResponse.json(
        { error: "Invite code has expired", inviteData: inviteResponse },
        { status: 400 }
      );
    }

    // Check if invite is already used
    if (inviteData.status === "used") {
      console.log("Invite has already been used");
      return NextResponse.json(
        {
          error: "Invite code has already been used",
          inviteData: inviteResponse,
        },
        { status: 400 }
      );
    }

    // If we get here, the invite is valid
    console.log("Invite is valid, returning data");
    return NextResponse.json({ inviteData: inviteResponse });
  } catch (error) {
    console.error("Error validating invite code:", error);
    return NextResponse.json(
      {
        error: "Failed to validate invite code",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
