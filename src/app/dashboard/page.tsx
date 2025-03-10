"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Users, BarChart2, ArrowRight, Shield, Database } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  isLoading?: boolean;
  error?: boolean;
}

const StatCard = ({
  title,
  value,
  description,
  trend,
  isLoading,
  error,
}: StatCardProps) => {
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm border ${
        error ? "border-red-300" : "border-gray-200"
      }`}
    >
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
        ) : error ? (
          <p className="text-3xl font-semibold text-red-600">Error</p>
        ) : (
          <>
            <p className="text-3xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <span
                className={`ml-2 text-sm font-medium ${
                  trend.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.positive ? "+" : ""}
                {trend.value}
              </span>
            )}
          </>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {error && (
        <p className="mt-2 text-xs text-red-600">
          Failed to load data. Please try again later.
        </p>
      )}
    </div>
  );
};

interface QuickLinkCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const QuickLinkCard = ({
  title,
  description,
  icon,
  href,
}: QuickLinkCardProps) => {
  return (
    <Link
      href={href}
      className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <div className="ml-auto">
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
};

export default function DashboardPage() {
  const { user, loading, getUserToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);
  const [stats, setStats] = useState([
    {
      title: "Total Users",
      value: "0",
      description: "Active users in your organization",
      trend: { value: "0%", positive: true },
      isLoading: true,
      error: false,
    },
    {
      title: "Active Sessions",
      value: "0",
      description: "Current active user sessions",
      trend: { value: "0%", positive: true },
      isLoading: true,
      error: false,
    },
  ]);

  // Redirect analysts to analytics page
  useEffect(() => {
    if (!loading && user && user.customClaims?.role === "analyst") {
      router.push("/dashboard/analytics");
    }
  }, [user, loading, router]);

  // Function to fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user || loading || authError) return;

    try {
      setError(null);
      // Mark cards as loading
      setStats((prevStats) =>
        prevStats.map((stat, index) =>
          index <= 1 ? { ...stat, isLoading: true, error: false } : stat
        )
      );

      const token = await getUserToken();
      console.log("Token1:", token);
      if (!token) {
        setError("Failed to get authentication token");
        setAuthError(true);
        // Mark cards as error
        setStats((prevStats) =>
          prevStats.map((stat, index) =>
            index <= 1 ? { ...stat, isLoading: false, error: true } : stat
          )
        );
        return;
      }

      // Fetch active sessions
      const sessionsResponse = await fetch("/api/analytics/active-sessions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!sessionsResponse.ok) {
        throw new Error("Failed to fetch active sessions");
      }

      const sessionsData = await sessionsResponse.json();

      // Fetch company users
      const usersResponse = await fetch("/api/analytics/company-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch company users");
      }

      const usersData = await usersResponse.json();

      // Update stats with real data
      setStats((prevStats) => {
        const newStats = [...prevStats];

        // Update total users
        newStats[0] = {
          ...newStats[0],
          value: usersData.totalUsers.toString(),
          trend: usersData.trend,
          description: "Active users in your organization",
          isLoading: false,
          error: false,
        };

        // Update active sessions
        newStats[1] = {
          ...newStats[1],
          value: sessionsData.activeSessions.toString(),
          trend: sessionsData.trend,
          description: "Current active user sessions",
          isLoading: false,
          error: false,
        };

        return newStats;
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      // Check if it's an authentication error
      if (
        error instanceof Error &&
        (error.message.includes("authentication") ||
          error.message.includes("credential") ||
          error.message.includes("token"))
      ) {
        setAuthError(true);
      }

      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );

      // Mark cards as error
      setStats((prevStats) =>
        prevStats.map((stat, index) =>
          index <= 1 ? { ...stat, isLoading: false, error: true } : stat
        )
      );
    }
  }, [user, loading, getUserToken, authError]);

  // Fetch dashboard data on component mount
  useEffect(() => {
    if (!authError) {
      fetchDashboardData();
    }
  }, [user, loading, getUserToken, fetchDashboardData, authError]);

  const quickLinks = [
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: <Users size={24} />,
      href: "/dashboard/users",
    },
    {
      title: "Monitoring Configuration",
      description: "Configure extension policies",
      icon: <Shield size={24} />,
      href: "/dashboard/extension-policy",
    },
    {
      title: "Live Analytics",
      description: "View detailed analytics",
      icon: <BarChart2 size={24} />,
      href: "/dashboard/analytics",
    },
    {
      title: "Historical Data",
      description: "Access historical analytics",
      icon: <Database size={24} />,
      href: "/historical-analytics",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your NexonWare admin dashboard. Here&apos;s an overview of
          your organization.
        </p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link, index) => (
            <QuickLinkCard key={index} {...link} />
          ))}
        </div>
      </div>
    </div>
  );
}
