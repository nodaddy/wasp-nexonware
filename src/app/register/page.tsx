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
  adminName: z.string().min(2, "Admin name must be at least 2 characters"),
  adminEmail: z.string().email("Please enter a valid email address"),
  inviteCode: z.string().min(1, "Invite code is required"),
});

// Define the form data type
type RegisterFormData = z.infer<typeof registerSchema>;

// Define the API response type
interface RegisterResponse {
  success: boolean;
  message: string;
  companyId: string;
  verificationLink?: string;
  error?: string;
}

// Define the invite data type
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
      title="Register Your Company"
      subtitle="Create a new company account on our Enterprise Administration Platform"
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
  const inviteCodeParam = searchParams.get("code");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [inviteLoading, setInviteLoading] = useState<boolean>(false);
  const [inviteError, setInviteError] = useState<string>("");
  const [emailDomains, setEmailDomains] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: "",
      adminName: "",
      adminEmail: "",
      inviteCode: inviteCodeParam || "",
    },
  });

  const adminEmail = watch("adminEmail");
  const inviteCode = watch("inviteCode");

  // Fetch invite details when invite code changes
  useEffect(() => {
    if (inviteCode && inviteCode.length > 0) {
      fetchInviteDetails(inviteCode);
    } else {
      setInviteData(null);
      setInviteError("");
    }
  }, [inviteCode]);

  // Extract domain from admin email
  useEffect(() => {
    if (adminEmail) {
      const domain = extractDomain(adminEmail);
      if (domain && !emailDomains.includes(domain)) {
        setEmailDomains([domain]);
      }
    }
  }, [adminEmail, emailDomains]);

  const fetchInviteDetails = async (code: string) => {
    setInviteLoading(true);
    setInviteError("");

    try {
      const response = await fetch(`/api/invites/${code}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to validate invite code");
      }

      const data = await response.json();
      setInviteData(data.invite);

      // If invite has allowed domains, update the email domains
      if (data.invite.allowedDomains && data.invite.allowedDomains.length > 0) {
        setEmailDomains(data.invite.allowedDomains);
      }
    } catch (error) {
      setInviteError(
        error instanceof Error
          ? error.message
          : "Failed to validate invite code"
      );
      setInviteData(null);
    } finally {
      setInviteLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/companies/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          emailDomains: emailDomains,
        }),
      });

      const result: RegisterResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to register company");
      }

      // If registration was successful, show success message
      if (result.success) {
        setSuccess(true);
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Register Your Company"
      subtitle="Create a new company account on our Enterprise Administration Platform"
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
              We&apos;ve sent a verification email to the admin email address
              you provided. Please check the email and follow the instructions
              to complete the setup.
            </p>
            <div className="mt-4">
              <Button
                variant="primary"
                onClick={() => (window.location.href = "/")}
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Invite Code"
            {...register("inviteCode")}
            error={errors.inviteCode?.message || inviteError}
            placeholder="Enter your invite code"
            required
            disabled={!!inviteCodeParam}
          />

          {inviteLoading && (
            <div className="bg-info-50 border border-info-200 text-info-700 px-4 py-3 rounded-md">
              Validating invite code...
            </div>
          )}

          {inviteData && (
            <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-md">
              <p className="font-medium">Valid Invite Code</p>
              {inviteData.allowedDomains &&
                inviteData.allowedDomains.length > 0 && (
                  <p className="text-sm mt-1">
                    Allowed domains: {inviteData.allowedDomains.join(", ")}
                  </p>
                )}
              <p className="text-sm mt-1">
                Expires: {new Date(inviteData.expiresAt).toLocaleString()}
              </p>
            </div>
          )}

          <Input
            label="Company Name"
            {...register("companyName")}
            error={errors.companyName?.message}
            placeholder="Enter your company name"
            required
            disabled={!inviteData}
          />

          <Input
            label="Admin Name"
            {...register("adminName")}
            error={errors.adminName?.message}
            placeholder="Enter admin's full name"
            required
            disabled={!inviteData}
          />

          <Input
            label="Admin Email"
            type="email"
            {...register("adminEmail")}
            error={errors.adminEmail?.message}
            placeholder="Enter admin's email address"
            required
            disabled={!inviteData}
          />

          {emailDomains.length > 0 && (
            <div className="bg-info-50 border border-info-200 text-info-700 px-4 py-3 rounded-md">
              <p className="font-medium">Email Domains</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {emailDomains.map((domain, index) => (
                  <div
                    key={index}
                    className="bg-white border border-info-300 rounded-full px-3 py-1 text-sm flex items-center"
                  >
                    {domain}
                  </div>
                ))}
              </div>
              <p className="text-xs mt-2">
                These domains will be used to automatically associate employees
                with your company when they register.
              </p>
            </div>
          )}

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
              disabled={isSubmitting || !inviteData}
            >
              {isSubmitting ? "Registering..." : "Register Company"}
            </Button>
          </div>

          <p className="text-center text-sm text-neutral-subtitle mt-4">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Sign in
            </a>
          </p>
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
