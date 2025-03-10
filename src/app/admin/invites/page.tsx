"use client";

import { useState, useEffect } from "react";
import { Invite } from "@/types/invite";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form validation schema
const inviteSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  allowedDomains: z.string().min(1, "At least one domain is required"),
  expiresAt: z.string().min(1, "Expiration date is required"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      code: "",
      allowedDomains: "",
      expiresAt: getDefaultExpiryDate(),
    },
  });

  // Set default expiry date to 30 days from now
  function getDefaultExpiryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  }

  // Fetch invites on component mount
  useEffect(() => {
    fetchInvites();
  }, []);

  // Function to fetch invites
  const fetchInvites = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/invites");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch invites");
      }

      setInvites(data.invites || []);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new invite
  const onSubmit = async (data: InviteFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert comma-separated domains to array
      const allowedDomains = data.allowedDomains
        .split(",")
        .map((domain) => domain.trim())
        .filter((domain) => domain.length > 0);

      const response = await fetch("/api/admin/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: data.code,
          allowedDomains,
          expiresAt: new Date(data.expiresAt),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create invite");
      }

      // If creation was successful, show success message and reset form
      setSuccess("Invite created successfully!");
      reset({
        code: "",
        allowedDomains: "",
        expiresAt: getDefaultExpiryDate(),
      });

      // Refresh the invites list
      fetchInvites();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Invites</h1>

      {/* Create Invite Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Invite</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Invite Code
            </label>
            <input
              id="code"
              type="text"
              {...register("code")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a unique invite code"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="allowedDomains"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Allowed Domains
            </label>
            <input
              id="allowedDomains"
              type="text"
              {...register("allowedDomains")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter comma-separated domains (e.g., gmail.com, example.com)"
            />
            {errors.allowedDomains && (
              <p className="mt-1 text-sm text-red-600">
                {errors.allowedDomains.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter comma-separated domains that are allowed to use this invite
            </p>
          </div>

          <div>
            <label
              htmlFor="expiresAt"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Expiration Date
            </label>
            <input
              id="expiresAt"
              type="date"
              {...register("expiresAt")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.expiresAt && (
              <p className="mt-1 text-sm text-red-600">
                {errors.expiresAt.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Invite"}
          </button>
        </form>
      </div>

      {/* Invites List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Invites</h2>

        {loading ? (
          <div className="text-center py-4">Loading invites...</div>
        ) : invites.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No invites found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allowed Domains
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Used By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invite.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invite.allowedDomains.join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invite.status === "active"
                            ? "bg-green-100 text-green-800"
                            : invite.status === "used"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {invite.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invite.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invite.expiresAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invite.usedBy || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
