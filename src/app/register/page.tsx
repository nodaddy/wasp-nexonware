"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthLayout from "@/components/layouts/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";

// Function to extract domain from email
const extractDomain = (email: string): string => {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : "";
};

// Form validation schema
const registerSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

// Infer the type from the schema
type RegisterFormData = z.infer<typeof registerSchema>;

// Response type
interface RegisterResponse {
  success: boolean;
  message: string;
  companyId: string;
  verificationLink?: string;
  error?: string;
}

// Invite data type
interface InviteData {
  id: string;
  code: string;
  allowedDomains: string[];
  createdAt: Date;
  expiresAt: Date;
}

// Loading component
function RegisterLoading() {
  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Sign up to get started with NexonWare"
    >
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    </AuthLayout>
  );
}

// Main content component that uses useSearchParams
function RegisterContent() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [emailDomains, setEmailDomains] = useState<string[]>([]);

  // Get the invite code from URL if present
  useEffect(() => {
    const code = searchParams.get("invite");
    if (code) {
      setInviteCode(code);
      fetchInviteDetails(code);
    }
  }, [searchParams]);

  // Fetch invite details if we have a code
  const fetchInviteDetails = async (code: string) => {
    try {
      const response = await fetch(`/api/invites/${code}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate invite code");
      }

      if (data.invite) {
        setInviteData({
          id: data.invite.id,
          code: data.invite.code,
          allowedDomains: data.invite.allowedDomains || [],
          createdAt: new Date(data.invite.createdAt),
          expiresAt: new Date(data.invite.expiresAt),
        });

        if (
          data.invite.allowedDomains &&
          data.invite.allowedDomains.length > 0
        ) {
          setEmailDomains(data.invite.allowedDomains);
        }
      }
    } catch (error) {
      console.error("Error fetching invite details:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to validate invite code"
      );
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: "",
      email: "",
      password: "",
    },
  });

  // Watch the email field to validate domain against invite
  const watchEmail = watch("email");

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setSubmitError("");

    // Check if email domain is allowed by the invite
    if (
      inviteData &&
      inviteData.allowedDomains &&
      inviteData.allowedDomains.length > 0
    ) {
      const domain = extractDomain(data.email);
      if (!inviteData.allowedDomains.includes(domain)) {
        setSubmitError(
          `Email domain not allowed. Please use an email from one of these domains: ${inviteData.allowedDomains.join(
            ", "
          )}`
        );
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/companies/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          inviteCode: inviteCode || null,
        }),
      });

      const result: RegisterResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      setSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Sign up to get started with NexonWare"
    >
      {success ? (
        <div className="card bg-accent-50 border border-accent-200 p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent-100">
              <svg
                className="h-6 w-6 text-accent-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-neutral-title">
              Registration Successful!
            </h3>
            <p className="mt-2 text-sm text-neutral-subtitle">
              Your account has been created. Please check your email for
              verification instructions.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {inviteCode && inviteData && (
            <div className="bg-accent-50 border border-accent-200 p-4 rounded-md mb-6">
              <p className="text-sm text-neutral-subtitle">
                You&apos;ve been invited to join NexonWare.
                {emailDomains.length > 0 && (
                  <span>
                    {" "}
                    Please use an email from one of these domains:{" "}
                    <strong>{emailDomains.join(", ")}</strong>
                  </span>
                )}
              </p>
            </div>
          )}

          <Input
            label="Company Name"
            {...register("companyName")}
            error={errors.companyName?.message}
            placeholder="Enter your company name"
            required
          />

          <Input
            label="Email Address"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            placeholder="Enter your email address"
            required
          />

          <Input
            label="Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
            placeholder="Create a password"
            required
          />

          {submitError && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md">
              {submitError}
            </div>
          )}

          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-neutral-subtitle">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-primary-600 hover:text-primary-700"
              >
                Sign in
              </a>
            </p>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

// Main component with Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterContent />
    </Suspense>
  );
}
