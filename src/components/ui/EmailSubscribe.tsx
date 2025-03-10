"use client";

import React, { useState } from "react";
import Button from "./Button";

interface EmailSubscribeProps {
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

export default function EmailSubscribe({
  placeholder = "Enter your email",
  buttonText = "Get Invite",
  className = "",
}: EmailSubscribeProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

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

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="w-[50%]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            disabled={isSubmitting}
          />
        </div>
        <Button
          type="submit"
          style={{ backgroundColor: "black" }}
          disabled={isSubmitting}
          className="whitespace-nowrap"
        >
          {isSubmitting ? (
            <>
              <span className="spinner-sm mr-2"></span>
              Submitting...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </form>

      {message && (
        <p
          className={`mt-2 text-sm ${
            message.type === "success"
              ? "text-accent-600 dark:text-accent-400"
              : "text-error-600 dark:text-error-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
