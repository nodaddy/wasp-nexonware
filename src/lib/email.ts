import {
  sendSignInLinkToEmail,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  sendEmailVerification,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";
import {
  getCompanyRegistrationEmailTemplate,
  getCompanyRegistrationPlainTextTemplate,
  getPasswordResetEmailTemplate,
  getPasswordResetPlainTextTemplate,
} from "./emailTemplates";

/**
 * Send a verification email with a custom link
 * @param email - The recipient's email address
 * @param verificationLink - The verification link to include in the email
 * @param displayName - The recipient's name
 * @returns Promise<boolean> - Whether the email was sent successfully
 */
export async function sendVerificationEmail(
  email: string,
  verificationLink: string,
  displayName: string
): Promise<boolean> {
  try {
    // Firebase doesn't directly support custom verification links with sendSignInLinkToEmail
    // So we'll use a custom approach by sending a password reset email
    // and then handling the verification in our custom setup-password route

    // First, ensure the auth is initialized
    if (!auth) {
      console.error("Firebase auth is not initialized");
      return false;
    }

    // Send a password reset email which we'll intercept in our custom flow
    await firebaseSendPasswordResetEmail(auth, email);

    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

/**
 * Send a custom email with verification link for company registration
 * This uses Firebase's password reset email as a mechanism to send the verification link
 *
 * @param email - The recipient's email address
 * @param verificationLink - The verification link to include in the email
 * @param companyName - The company name
 * @param adminName - The admin's name
 * @returns Promise<boolean> - Whether the email was sent successfully
 */
export async function sendCompanyRegistrationEmail(
  email: string,
  verificationLink: string,
  companyName: string,
  adminName: string
): Promise<boolean> {
  try {
    // For now, we'll use the basic Firebase password reset email
    // In a production app, you would use a more robust email solution like SendGrid
    if (!auth) {
      console.error("Firebase auth is not initialized");
      return false;
    }

    // Generate email content using our templates
    const htmlContent = getCompanyRegistrationEmailTemplate(
      companyName,
      adminName,
      verificationLink
    );

    const plainTextContent = getCompanyRegistrationPlainTextTemplate(
      companyName,
      adminName,
      verificationLink
    );

    // Firebase doesn't support custom email templates in the client SDK
    // So we'll use the password reset email as a mechanism
    await firebaseSendPasswordResetEmail(auth, email, {
      // The URL you want to redirect back to after password reset
      url: verificationLink,
    });

    console.log(
      `Registration email sent to ${email} with verification link: ${verificationLink}`
    );

    // In a production environment, you would use a service like SendGrid, Mailgun, etc.
    // to send custom HTML emails with your templates

    return true;
  } catch (error) {
    console.error("Error sending registration email:", error);
    return false;
  }
}

/**
 * Send a password reset email with a custom link
 * @param email - The recipient's email address
 * @param resetLink - The password reset link to include in the email
 * @returns Promise<boolean> - Whether the email was sent successfully
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<boolean> {
  try {
    // For now, we'll use the basic Firebase password reset email
    // In a production app, you would use a more robust email solution like SendGrid
    if (!auth) {
      console.error("Firebase auth is not initialized");
      return false;
    }

    // Generate email content using our templates
    const htmlContent = getPasswordResetEmailTemplate(email, resetLink);
    const plainTextContent = getPasswordResetPlainTextTemplate(
      email,
      resetLink
    );

    // Firebase doesn't support custom email templates in the client SDK
    // So we'll use the password reset email as a mechanism
    await firebaseSendPasswordResetEmail(auth, email, {
      // The URL you want to redirect back to after password reset
      url: resetLink,
    });

    console.log(
      `Password reset email sent to ${email} with reset link: ${resetLink}`
    );

    // In a production environment, you would use a service like SendGrid, Mailgun, etc.
    // to send custom HTML emails with your templates

    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}
