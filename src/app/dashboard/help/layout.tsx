"use client";

import RoleBasedRoute from "@/components/auth/RoleBasedRoute";

export default function HelpLayout({
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
