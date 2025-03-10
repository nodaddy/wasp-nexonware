"use client";

import RoleBasedRoute from "@/components/auth/RoleBasedRoute";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleBasedRoute allowedRoles={["admin", "analyst"]}>
      {children}
    </RoleBasedRoute>
  );
}
