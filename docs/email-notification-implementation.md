# Email Notification Implementation

## Overview

This document outlines the implementation of an email notification system for the subscription form in the Nexonware EAP platform. When a user submits their email to request an invite, the system sends a notification email to the specified recipients.

## Implementation Details

### 1. API Route Creation

Created a new API route at `src/app/api/subscribe/route.ts` that handles the email subscription process:

```typescript
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
```

### 2. EmailSubscribe Component Update

Modified the `src/components/ui/EmailSubscribe.tsx` component to use the new API endpoint:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email || !email.includes("@")) {
    setMessage({ text: "Please enter a valid email address", type: "error" });
    return;
  }

  setIsSubmitting(true);
  setMessage(null);

  try {
    // Call the API endpoint to send email notification
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    setIsSubmitting(false);

    if (response.ok && data.success) {
      setMessage({
        text: "Thank you! We'll be in touch soon.",
        type: "success",
      });
      setEmail("");
    } else {
      setMessage({
        text: data.error || "Something went wrong. Please try again later.",
        type: "error",
      });
    }
  } catch (error) {
    console.error("Error during subscription:", error);
    setIsSubmitting(false);
    setMessage({
      text: "Something went wrong. Please try again later.",
      type: "error",
    });
  }
};
```

### 3. Environment Variables

The implementation uses the following environment variables that were already configured in the `.env` file:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=nexonware@gmail.com
EMAIL_PASSWORD="fa"
```

## Functionality

1. **User Interaction**:

   - User enters their email in the subscription form
   - User clicks the "Get Invite" button

2. **Validation**:

   - The form validates that the email is properly formatted
   - If invalid, an error message is displayed

3. **API Request**:

   - The form sends a POST request to `/api/subscribe` with the email
   - The API validates the email format again

4. **Email Notification**:

   - The API uses nodemailer to send an email to both specified recipients:
     - neeleshsharma351@gmail.com
     - nsharma1@me.iitr.ac.in
   - The email contains the subscriber's email address

5. **User Feedback**:
   - Success message is shown if the email is sent successfully
   - Error message is shown if there's a problem

## Email Content

The notification email includes:

- **Subject**: "New Invite Request Alert"
- **Text**: "A new wants an invite to WASP.Nexonware: [email]"
- **HTML**: Formatted message with the subscriber's email

## Testing

To test this functionality:

1. Enter a valid email in the subscription form
2. Submit the form
3. Check that the success message appears
4. Verify that the notification email is received at both specified email addresses

## Troubleshooting

If emails are not being received:

1. Check the email configuration in the `.env` file
2. Verify that the Gmail account allows "Less secure app access" or uses an app password
3. Check the server logs for any errors during the email sending process
