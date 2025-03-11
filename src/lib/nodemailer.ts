import nodemailer from "nodemailer";
import {
  getPasswordResetEmailTemplate,
  getPasswordResetPlainTextTemplate,
} from "./emailTemplates";

// Email configuration
// In production, you would use real SMTP credentials
// For development, we can use a testing service or ethereal email
const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
};

// Create a transporter
const transporter = nodemailer.createTransport(emailConfig);

/**
 * Send an email using Nodemailer
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content of the email
 * @param text - Plain text content of the email (fallback)
 * @returns Promise<boolean> - Whether the email was sent successfully
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Nexonware EAP" <noreply@nexonware.com>',
      to,
      subject,
      text,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send a password reset email
 * @param email - Recipient email address
 * @param resetLink - Password reset link
 * @returns Promise<boolean> - Whether the email was sent successfully
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<boolean> {
  const subject = "Reset Your Password";
  const html = getPasswordResetEmailTemplate(email, resetLink);
  const text = getPasswordResetPlainTextTemplate(email, resetLink);

  return sendEmail(email, subject, html, text);
}

/**
 * Verify that the email configuration is valid
 * @returns Promise<boolean> - Whether the configuration is valid
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
}
