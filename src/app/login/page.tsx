"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import AuthLayout from "@/components/layouts/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Define the form data type
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    signIn,
    signOut,
    user,
    loading,
    error: authError,
    isAdmin,
  } = useAuth();
  const [loginError, setLoginError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Redirect if already logged in and has a valid role
  useEffect(() => {
    if (user && !loading) {
      // Check if user has a role (either admin or analyst)
      const userRole = user.customClaims?.role;

      if (userRole === "admin" || userRole === "analyst") {
        // If user is an analyst, redirect to analytics page
        if (userRole === "analyst") {
          router.push("/dashboard/analytics");
        } else {
          // If user is an admin, redirect to main dashboard
          router.push("/dashboard");
        }
      } else if (user) {
        // If user is logged in but has no valid role, sign them out and show error
        signOut();
        setLoginError(
          "Access denied. You need admin or analyst privileges to access the platform."
        );
      }
    }
  }, [user, loading, router, signOut]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setLoginError("");

    try {
      const success = await signIn(data.email, data.password);

      if (success) {
        // The redirect will happen in the useEffect if the user has a valid role
      } else {
        setLoginError(authError || "Failed to sign in. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <AuthLayout title="Login" subtitle="Please wait...">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Login" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {loginError && (
          <div className="p-3 bg-error-50 border border-error-200 text-error-700 rounded">
            {loginError}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <a
              href="/forgot-password"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>

        <div className="text-center text-sm text-neutral-subtitle">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Register your company
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}
