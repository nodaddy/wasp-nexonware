"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthLayout from "@/components/layouts/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// Form validation schema
const passwordSchema = z
  .object({
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
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Infer the type from the schema
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SetupPasswordPage(): React.ReactNode {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [tokenValid, setTokenValid] = useState<boolean>(true);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setTokenValid(false);
      setSubmitError("Invalid or missing verification link parameters");
    }
  }, [token, email]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormData): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to set up password");
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
      title="Set Up Your Password"
      subtitle="Create a secure password for your account"
    >
      {!tokenValid ? (
        <div className="card bg-error-50 border border-error-200 p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-100">
              <svg
                className="h-6 w-6 text-error-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-neutral-title">
              Invalid Verification Link
            </h3>
            <p className="mt-2 text-sm text-neutral-subtitle">
              The verification link is invalid or has expired. Please contact
              support or request a new verification link.
            </p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => router.push("/")}>
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      ) : success ? (
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
              Password Set Successfully!
            </h3>
            <p className="mt-2 text-sm text-neutral-subtitle">
              Your password has been set up successfully. You can now log in to
              your account.
            </p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => router.push("/login")}>
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="New Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
            placeholder="Enter your new password"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
            placeholder="Confirm your password"
            required
          />

          {submitError && (
            <div className="bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-200 px-4 py-3 rounded-md">
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
              {isSubmitting ? "Setting Up..." : "Set Password"}
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
