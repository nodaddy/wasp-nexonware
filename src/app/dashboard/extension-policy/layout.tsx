"use client";

import RoleBasedRoute from "@/components/auth/RoleBasedRoute";

export default function ExtensionPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleBasedRoute allowedRoles={["admin"]}>{children}</RoleBasedRoute>;
}
