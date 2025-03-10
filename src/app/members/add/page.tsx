"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Form validation schema
const addMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "readonly"], {
    required_error: "Please select a role",
  }),
});

// Define the form data type
type AddMemberFormData = z.infer<typeof addMemberSchema>;

export default function AddMembersPage() {
  const router = useRouter();
  const { user, getUserToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      role: "readonly",
    },
  });

  const onSubmit = async (data: AddMemberFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      // This would be an API call to add a member
      // For now, we'll just simulate success
      // const response = await fetch("/api/members/add", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${await getUserToken()}`,
      //   },
      //   body: JSON.stringify(data),
      // });

      // const result = await response.json();

      // if (!response.ok) {
      //   throw new Error(result.error || "Failed to add member");
      // }

      // Simulate success
      setSuccessMessage(
        `Invitation sent to ${data.email} with ${data.role} role.`
      );
      reset(); // Clear the form
    } catch (error) {
      setSubmitError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <header className="bg-white dark:bg-neutral-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-title">
              Add Team Members
            </h1>
            <p className="text-sm text-neutral-subtitle">
              Invite administrators or read-only members to your company
            </p>
          </div>
          <Button variant="secondary" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-neutral-title">
            Invite a New Member
          </h2>

          {submitError && (
            <div className="bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-200 p-4 rounded mb-6">
              {submitError}
            </div>
          )}

          {successMessage && (
            <div className="bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-800 text-success-700 dark:text-success-200 p-4 rounded mb-6">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="colleague@example.com"
            />

            <div>
              <label className="form-label">Role</label>
              <div className="mt-2 space-y-4">
                <div className="flex items-center">
                  <input
                    id="role-readonly"
                    type="radio"
                    value="readonly"
                    {...register("role")}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-neutral-700"
                  />
                  <label
                    htmlFor="role-readonly"
                    className="ml-3 block text-neutral-body"
                  >
                    <span className="font-medium text-neutral-title">
                      Read-only
                    </span>
                    <span className="block text-sm text-neutral-subtitle">
                      Can view data but cannot make changes
                    </span>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="role-admin"
                    type="radio"
                    value="admin"
                    {...register("role")}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-neutral-700"
                  />
                  <label
                    htmlFor="role-admin"
                    className="ml-3 block text-neutral-body"
                  >
                    <span className="font-medium text-neutral-title">
                      Administrator
                    </span>
                    <span className="block text-sm text-neutral-subtitle">
                      Full access to manage all aspects of your company
                    </span>
                  </label>
                </div>
              </div>
              {errors.role && (
                <p className="error-text">{errors.role.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Sending Invitation..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
