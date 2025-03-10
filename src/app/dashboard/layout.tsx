"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import RoleBasedRoute from "@/components/auth/RoleBasedRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedRoute allowedRoles={["admin", "analyst"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleBasedRoute>
  );
}
