import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configure nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || "",
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Recipients who will receive the notification
    const recipients = ["neeleshsharma351@gmail.com", "nsharma1@me.iitr.ac.in"];

    // Send email notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@nexonware.com",
      to: recipients.join(", "),
      subject: "New Invite Request Alert",
      text: `A new wants an invite to WASP.Nexonware: ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #333;">New Subscription Alert</h2>
          <p>A new user has subscribed to your platform.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>This email was sent automatically from your Nexonware platform.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending subscription email:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
