"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  UserPlus,
  MoreHorizontal,
  X,
  Check,
  ShieldAlert,
  ShieldOff,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserData } from "@/types/firebase";

interface UserCardProps {
  user: UserData;
  onUpdateRole: (uid: string, role: string | null) => void;
}

const UserCard = ({ user, onUpdateRole }: UserCardProps) => {
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(
    user.customClaims?.role || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const handleSaveRole = async () => {
    if (selectedRole !== (user.customClaims?.role || "")) {
      setIsSubmitting(true);
      // If selectedRole is empty string, pass null to indicate role revocation
      await onUpdateRole(user.uid, selectedRole || null);
      setIsSubmitting(false);
    }
    setIsEditingRole(false);
  };

  const handleCancelEdit = () => {
    setSelectedRole(user.customClaims?.role || "");
    setIsEditingRole(false);
  };

  const handleRevokeRole = async () => {
    if (confirm("Are you sure you want to revoke this user's role?")) {
      setIsSubmitting(true);
      await onUpdateRole(user.uid, null);
      setIsSubmitting(false);
    }
  };

  // Determine user status based on emailVerified
  const status = user.emailVerified ? "active" : "pending";

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || user.email || ""}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-medium">
              {(user.displayName || user.email || "").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isEditingRole ? (
          <div className="flex items-center gap-2">
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="text-sm border border-gray-300 rounded-md p-1 text-gray-700 bg-white"
              disabled={isSubmitting}
            >
              <option value="">No Role (Revoke Access)</option>
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
            </select>
            <button
              onClick={handleSaveRole}
              disabled={isSubmitting}
              className="p-1 rounded-md text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Save role"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isSubmitting}
              className="p-1 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span
                className="text-sm text-gray-700 cursor-pointer hover:text-blue-600"
                onClick={() => setIsEditingRole(true)}
              >
                {user.customClaims?.role ? user.customClaims.role : "No Role"}
              </span>
              {user.customClaims?.role && (
                <button
                  onClick={handleRevokeRole}
                  disabled={isSubmitting}
                  className="p-1 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Revoke role"
                >
                  <ShieldOff size={14} />
                </button>
              )}
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[status as keyof typeof statusColors]
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default function UsersPage() {
  const { getUserToken, isAdmin } = useAuth();
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [foundUser, setFoundUser] = useState<UserData | null>(null);
  const [updateMessage, setUpdateMessage] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchEmail) {
      setSearchError("Please enter an email to search");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setFoundUser(null);
    setUpdateMessage("");

    try {
      const token = await getUserToken();

      if (!token) {
        setSearchError("Authentication error. Please sign in again.");
        setIsSearching(false);
        return;
      }

      const response = await fetch(
        `/api/users/search?email=${encodeURIComponent(searchEmail)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setSearchError(data.error || "Failed to search for user");
      } else {
        setFoundUser(data);
      }
    } catch (error) {
      console.error("Error searching for user:", error);
      setSearchError("An error occurred while searching for the user");
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateRole = async (uid: string, role: string | null) => {
    setUpdateMessage("");
    setSearchError("");

    try {
      const token = await getUserToken();

      if (!token) {
        setSearchError("Authentication error. Please sign in again.");
        return;
      }

      const response = await fetch("/api/users/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSearchError(data.error || "Failed to update user role");
      } else {
        setUpdateMessage(data.message || "User role updated successfully");

        // Update the found user with the new role
        if (foundUser) {
          setFoundUser({
            ...foundUser,
            customClaims:
              role === null
                ? { ...(foundUser.customClaims || {}), role: undefined }
                : { ...(foundUser.customClaims || {}), role },
          });
        }
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      setSearchError("An error occurred while updating the user role");
    }
  };

  // If the current user is not an admin, show a message
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-center mb-4">
          <ShieldAlert className="mr-2" size={24} />
          <span>Access Denied</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Access Required
        </h1>
        <p className="text-gray-600 text-center max-w-md">
          You need administrator privileges to access the user management page.
          Please contact your organization administrator for assistance.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search for users in your organization and manage their roles.
        </p>
      </div>

      {/* Search form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Search for a User
        </h2>
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="block text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter user email address..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        {searchError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {searchError}
          </div>
        )}

        {updateMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            {updateMessage}
          </div>
        )}
      </div>

      {/* Search results */}
      {foundUser && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Search Result
          </h2>
          <UserCard user={foundUser} onUpdateRole={handleUpdateRole} />
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 mb-2">
          How to manage user roles
        </h3>
        <ul className="list-disc pl-5 text-blue-700 space-y-1">
          <li>Search for a user by their email address</li>
          <li>Click on the user's current role to edit it</li>
          <li>
            Select a new role from the dropdown menu or select "No Role" to
            revoke access
          </li>
          <li>Click the checkmark to save the changes</li>
          <li>
            Alternatively, use the revoke button (shield icon) to quickly remove
            a role
          </li>
          <li>Users with the "admin" role can manage other users</li>
          <li>Users with the "analyst" role have limited access</li>
          <li>
            Users with no role will not be able to sign in to the Administration
            Portal
          </li>
          <li>
            <strong>Note: Only admin role can assign or revoke roles</strong>
          </li>
        </ul>
      </div>
    </div>
  );
}
