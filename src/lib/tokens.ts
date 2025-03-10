import crypto from "crypto";
import jwt from "jsonwebtoken";

// Secret key for signing tokens - in production, use an environment variable
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

/**
 * Generate a password reset token
 * @param email The user's email
 * @returns A signed JWT token
 */
export function generatePasswordResetToken(email: string): string {
  // Create a token that expires in 1 hour
  return jwt.sign(
    {
      email,
      type: "password-reset",
      // Add some randomness to prevent token reuse
      nonce: crypto.randomBytes(16).toString("hex"),
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}

/**
 * Verify a password reset token
 * @param token The token to verify
 * @returns The decoded token payload if valid, null otherwise
 */
export function verifyPasswordResetToken(
  token: string
): { email: string } | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload & {
      email: string;
      type: string;
    };

    // Check if it's a password reset token
    if (decoded.type !== "password-reset") {
      return null;
    }

    return { email: decoded.email };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Generate a company verification token
 * @param companyId The company ID
 * @param adminEmail The admin email
 * @returns A signed JWT token
 */
export function generateCompanyVerificationToken(
  companyId: string,
  adminEmail: string
): string {
  // Create a token that expires in 24 hours
  return jwt.sign(
    {
      companyId,
      adminEmail,
      type: "company-verification",
      // Add some randomness to prevent token reuse
      nonce: crypto.randomBytes(16).toString("hex"),
    },
    SECRET_KEY,
    { expiresIn: "24h" }
  );
}

/**
 * Verify a company verification token
 * @param token The token to verify
 * @returns The decoded token payload if valid, null otherwise
 */
export function verifyCompanyVerificationToken(
  token: string
): { companyId: string; adminEmail: string } | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload & {
      companyId: string;
      adminEmail: string;
      type: string;
    };

    // Check if it's a company verification token
    if (decoded.type !== "company-verification") {
      return null;
    }

    return {
      companyId: decoded.companyId,
      adminEmail: decoded.adminEmail,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
