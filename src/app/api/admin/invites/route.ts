import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { CreateInviteRequest, Invite } from "@/types/invite";

// GET endpoint to list all invites
export async function GET(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Firebase Admin is not properly initialized. Please check server logs.",
        },
        { status: 500 }
      );
    }

    // For now, we're not implementing authentication checks
    // In a real application, you would check if the user is an admin

    // Query all invites
    const invitesSnapshot = await db
      .collection("invites")
      .orderBy("createdAt", "desc")
      .get();

    const invites: Invite[] = [];
    invitesSnapshot.forEach((doc) => {
      const data = doc.data();
      invites.push({
        id: doc.id,
        code: data.code,
        allowedDomains: data.allowedDomains || [],
        createdAt: data.createdAt?.toDate(),
        expiresAt: data.expiresAt?.toDate(),
        status: data.status,
        updatedAt: data.updatedAt?.toDate(),
        usedAt: data.usedAt?.toDate(),
        usedBy: data.usedBy,
      });
    });

    return NextResponse.json({
      success: true,
      invites,
    });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invites" },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new invite
export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Firebase Admin is not properly initialized. Please check server logs.",
        },
        { status: 500 }
      );
    }

    // For now, we're not implementing authentication checks
    // In a real application, you would check if the user is an admin

    // Parse the request body
    const body: CreateInviteRequest = await request.json();

    // Validate required fields
    if (!body.code) {
      return NextResponse.json(
        { success: false, error: "Invite code is required" },
        { status: 400 }
      );
    }

    if (!body.allowedDomains || !Array.isArray(body.allowedDomains)) {
      return NextResponse.json(
        { success: false, error: "Allowed domains must be an array" },
        { status: 400 }
      );
    }

    if (!body.expiresAt) {
      return NextResponse.json(
        { success: false, error: "Expiration date is required" },
        { status: 400 }
      );
    }

    // Check if the invite code already exists
    const existingInviteSnapshot = await db
      .collection("invites")
      .where("code", "==", body.code)
      .get();

    if (!existingInviteSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Invite code already exists" },
        { status: 400 }
      );
    }

    // Create the invite document
    const now = new Date();
    const inviteData: Omit<Invite, "id"> = {
      code: body.code,
      allowedDomains: body.allowedDomains,
      createdAt: now,
      expiresAt: new Date(body.expiresAt),
      status: "active",
      updatedAt: now,
    };

    const inviteRef = await db.collection("invites").add(inviteData);
    const inviteDoc = await inviteRef.get();
    const createdInvite = inviteDoc.data() as any;

    return NextResponse.json({
      success: true,
      invite: {
        id: inviteRef.id,
        ...createdInvite,
        createdAt: createdInvite.createdAt,
        expiresAt: createdInvite.expiresAt,
        updatedAt: createdInvite.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create invite" },
      { status: 500 }
    );
  }
}
