/**
 * Test script for verifying email functionality
 *
 * Usage:
 * 1. Make sure your .env file is properly configured with email settings
 * 2. Run this script with: node scripts/test-email.js
 */

require("dotenv").config();
const nodemailer = require("nodemailer");

// Create a test email function
async function sendTestEmail() {
  console.log("Starting email test...");

  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASSWORD || "",
    },
  });

  // Recipients who will receive the test email
  const recipients = ["neeleshsharma351@gmail.com", "nsharma1@me.iitr.ac.in"];

  try {
    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@nexonware.com",
      to: recipients.join(", "),
      subject: "Nexonware Email Test",
      text: "This is a test email to verify the email notification system is working correctly.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #333;">Nexonware Email Test</h2>
          <p>This is a test email to verify the email notification system is working correctly.</p>
          <p>If you received this email, the email configuration is working properly!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending test email:", error);
  }
}

// Run the test
sendTestEmail().catch(console.error);
