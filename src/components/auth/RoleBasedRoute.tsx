"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert } from "lucide-react";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function RoleBasedRoute({
  children,
  allowedRoles,
}: RoleBasedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading and user exists, check role
    if (!loading && user) {
      const userRole = user.customClaims?.role;

      // If user has no role or role is not in allowed roles, redirect based on role
      if (!userRole || !allowedRoles.includes(userRole)) {
        if (userRole === "analyst") {
          // Analysts should only access the analytics page
          router.push("/dashboard/analytics");
        } else if (userRole === "admin") {
          // Admins can access any page, but this would only happen if allowedRoles doesn't include "admin"
          router.push("/dashboard");
        } else {
          // Users with no valid role should be redirected to login
          router.push("/login");
        }
      }
    } else if (!loading && !user) {
      // If not loading and no user, redirect to login
      router.push("/login");
    }
  }, [user, loading, router, allowedRoles, pathname]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show access denied message if user doesn't have the required role
  if (
    !loading &&
    user &&
    user.customClaims?.role &&
    !allowedRoles.includes(user.customClaims.role)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-center mb-4">
          <ShieldAlert className="mr-2" size={24} />
          <span>Access Denied</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Insufficient Permissions
        </h1>
        <p className="text-gray-600 text-center max-w-md mb-4">
          You don't have the required permissions to access this page.
          {user.customClaims.role === "analyst" &&
            " As an analyst, you only have access to the Analytics & Reporting page."}
        </p>
        <button
          onClick={() => {
            if (user.customClaims?.role === "analyst") {
              router.push("/dashboard/analytics");
            } else if (user.customClaims?.role === "admin") {
              router.push("/dashboard");
            } else {
              router.push("/login");
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Allowed Page
        </button>
      </div>
    );
  }

  // Only render children if user is authenticated and has the required role
  return user &&
    user.customClaims?.role &&
    allowedRoles.includes(user.customClaims.role) ? (
    <>{children}</>
  ) : null;
}
