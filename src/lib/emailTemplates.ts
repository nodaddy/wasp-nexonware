/**
 * Email template for company registration verification
 * @param companyName - The name of the company
 * @param adminName - The name of the admin
 * @param verificationLink - The verification link
 * @returns HTML email template
 */
export function getCompanyRegistrationEmailTemplate(
  companyName: string,
  adminName: string,
  verificationLink: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Complete Your Company Registration</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4f46e5;
          padding: 20px;
          text-align: center;
          color: white;
        }
        .content {
          padding: 20px;
          background-color: #f9fafb;
        }
        .button {
          display: inline-block;
          background-color: #4f46e5;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Complete Your Registration</h1>
        </div>
        <div class="content">
          <p>Hello ${adminName},</p>
          <p>Thank you for registering <strong>${companyName}</strong> on the Nexonware Enterprise Administration Platform.</p>
          <p>To complete your registration and set up your admin account, please click the button below:</p>
          <p style="text-align: center;">
            <a href="${verificationLink}" class="button">Complete Registration</a>
          </p>
          <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
          <p>${verificationLink}</p>
          <p>This link will expire in 24 hours for security reasons.</p>
          <p>If you did not register for an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Nexonware Enterprise Administration Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email template for plain text fallback
 * @param companyName - The name of the company
 * @param adminName - The name of the admin
 * @param verificationLink - The verification link
 * @returns Plain text email template
 */
export function getCompanyRegistrationPlainTextTemplate(
  companyName: string,
  adminName: string,
  verificationLink: string
): string {
  return `
    Hello ${adminName},

    Thank you for registering ${companyName} on the Nexonware Enterprise Administration Platform.

    To complete your registration and set up your admin account, please visit the following link:
    ${verificationLink}

    This link will expire in 24 hours for security reasons.

    If you did not register for an account, please ignore this email.

    © ${new Date().getFullYear()} Nexonware Enterprise Administration Platform. All rights reserved.
  `;
}

/**
 * Email template for password reset
 * @param email - The user's email
 * @param resetLink - The password reset link
 * @returns HTML email template
 */
export function getPasswordResetEmailTemplate(
  email: string,
  resetLink: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4f46e5;
          padding: 20px;
          text-align: center;
          color: white;
        }
        .content {
          padding: 20px;
          background-color: #f9fafb;
        }
        .button {
          display: inline-block;
          background-color: #4f46e5;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset the password for your account (${email}) on the Nexonware Enterprise Administration Platform.</p>
          <p>To reset your password, please click the button below:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
          <p>${resetLink}</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Nexonware Enterprise Administration Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email template for password reset (plain text fallback)
 * @param email - The user's email
 * @param resetLink - The password reset link
 * @returns Plain text email template
 */
export function getPasswordResetPlainTextTemplate(
  email: string,
  resetLink: string
): string {
  return `
    Hello,

    We received a request to reset the password for your account (${email}) on the Nexonware Enterprise Administration Platform.

    To reset your password, please visit the following link:
    ${resetLink}

    This link will expire in 1 hour for security reasons.

    If you did not request a password reset, please ignore this email or contact support if you have concerns.

    © ${new Date().getFullYear()} Nexonware Enterprise Administration Platform. All rights reserved.
  `;
}
