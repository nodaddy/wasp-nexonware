"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  Users,
  BarChart2,
  Settings,
  HelpCircle,
  Search,
  Bell,
  User,
  Menu,
  X,
  Plus,
  LogOut,
  Shield,
  Database,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem = ({ href, icon, label, active }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, signOut, isAdmin, loading } = useAuth();
  const { toasts, hideToast } = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Get user role
  const userRole = user?.customClaims?.role || "";
  const isAnalyst = userRole === "analyst";

  // Define navigation items
  const adminNavItems = [
    { href: "/dashboard", icon: <Home size={20} />, label: "Dashboard" },
    {
      href: "/dashboard/users",
      icon: <Users size={20} />,
      label: "User Management",
    },
    {
      href: "/dashboard/extension-policy",
      icon: <Shield size={20} />,
      label: "Monitoring Configuration",
    },
    {
      href: "/dashboard/analytics",
      icon: <BarChart2 size={20} />,
      label: "Live Analytics",
    },
    {
      href: "/historical-analytics",
      icon: <Database size={20} />,
      label: "Historical Analytics",
    },
    {
      href: "/dashboard/settings",
      icon: <Settings size={20} />,
      label: "Settings & Integrations",
    },
    // {
    //   href: "/dashboard/help",
    //   icon: <HelpCircle size={20} />,
    //   label: "Onboarding & Help",
    // },
  ];

  // Analyst only sees analytics page
  const analystNavItems = [
    {
      href: "/dashboard/analytics",
      icon: <BarChart2 size={20} />,
      label: "Analytics & Reporting",
    },
    {
      href: "/historical-analytics",
      icon: <Database size={20} />,
      label: "Historical Analytics",
    },
    {
      href: "/dashboard/help",
      icon: <HelpCircle size={20} />,
      label: "Onboarding & Help",
    },
  ];

  const navItems = isAnalyst ? analystNavItems : adminNavItems;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-blue-600">
                Nexonware
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <Menu size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-1 text-gray-500 hover:text-gray-700 focus:outline-none">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 text-xs text-gray-500">
                        Signed in as
                      </div>
                      <div className="px-4 py-2 text-sm font-medium border-b border-gray-100">
                        {user?.email?.split("@")[0] || "User"}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumbs */}
          <nav className="mb-6">
            <ol className="flex text-sm text-gray-500">
              <li className="flex items-center">
                <Link
                  href={isAnalyst ? "/dashboard/analytics" : "/dashboard"}
                  className="hover:text-blue-600"
                >
                  Dashboard
                </Link>
                {pathname !== "/dashboard" && <span className="mx-2">/</span>}
              </li>
              {pathname !== "/dashboard" && (
                <li className="font-medium text-gray-900">
                  {navItems.find((item) => item.href === pathname)?.label ||
                    "Page"}
                </li>
              )}
            </ol>
          </nav>

          {/* Quick action button - only show for admin users */}
          {!isAnalyst && (
            <div className="fixed bottom-8 right-8 z-10">
              <button className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus size={24} />
              </button>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
