"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { SummaryCards } from "@/components/analytics/SummaryCards";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Sector,
} from "recharts";

// Top Domains Chart Component
const TopDomainsChart = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const { getUserToken, user } = useAuth();
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch domains data
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getUserToken();
        if (!token) {
          throw new Error("Failed to get authentication token");
        }

        if (!user) {
          throw new Error("User not authenticated");
        }

        // Build the query parameters
        const params = new URLSearchParams();
        params.append("startDate", startDate);
        params.append("endDate", endDate);

        console.log("Fetching domains data...");
        const response = await fetch(
          `/api/analytics/historical/domains?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Company-ID": user.customClaims?.companyId || "",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error response:", errorData);

          if (response.status === 500) {
            if (errorData.error?.includes("BigQuery")) {
              throw new Error(
                "BigQuery connection error. Please check server configuration and credentials."
              );
            } else {
              throw new Error(
                errorData.error || "Server error occurred while fetching data"
              );
            }
          } else if (response.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          } else if (response.status === 400) {
            if (errorData.error?.includes("Company ID")) {
              throw new Error(
                "Company ID is missing. Please ensure your account is properly set up with a company."
              );
            } else {
              throw new Error(errorData.error || "Bad request");
            }
          } else {
            throw new Error(
              errorData.error || "An error occurred while fetching domains data"
            );
          }
        }

        const result = await response.json();
        console.log("Domains data:", result);

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch domains data");
        }

        setDomains(result.data || []);
      } catch (err: any) {
        console.error("Error fetching domains data:", err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, [startDate, endDate, getUserToken, user]);

  // Colors for the bars
  const barColors = [
    "#4f46e5",
    "#6366f1",
    "#818cf8",
    "#a5b4fc",
    "#c7d2fe",
    "#ddd6fe",
    "#e0e7ff",
    "#ede9fe",
    "#f5f3ff",
    "#faf5ff",
  ];

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!domains || domains.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-gray-500">No domain data available</div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={domains}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="domain"
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [`${value} visits`, "Visits"]}
            labelFormatter={(label: string) => `Domain: ${label}`}
          />
          <Bar
            dataKey="visits"
            name="Website Visits"
            fill="#4f46e5"
            radius={[4, 4, 0, 0]}
          >
            {domains.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={barColors[index % barColors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// URL Path Distribution Chart Component
const UrlPathDistributionChart = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const { getUserToken, user } = useAuth();
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch paths data
  useEffect(() => {
    const fetchPaths = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getUserToken();
        if (!token) {
          throw new Error("Failed to get authentication token");
        }

        if (!user) {
          throw new Error("User not authenticated");
        }

        // Build the query parameters
        const params = new URLSearchParams();
        params.append("startDate", startDate);
        params.append("endDate", endDate);
        params.append("limit", "10");

        console.log("Fetching URL paths data...");
        const response = await fetch(
          `/api/analytics/historical/paths?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Company-ID": user.customClaims?.companyId || "",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error response:", errorData);

          if (response.status === 500) {
            if (errorData.error?.includes("BigQuery")) {
              throw new Error(
                "BigQuery connection error. Please check server configuration and credentials."
              );
            } else {
              throw new Error(
                errorData.error || "Server error occurred while fetching data"
              );
            }
          } else if (response.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          } else if (response.status === 400) {
            if (errorData.error?.includes("Company ID")) {
              throw new Error(
                "Company ID is missing. Please ensure your account is properly set up with a company."
              );
            } else {
              throw new Error(errorData.error || "Bad request");
            }
          } else {
            throw new Error(
              errorData.error || "An error occurred while fetching paths data"
            );
          }
        }

        const result = await response.json();
        console.log("URL paths data:", result);

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch URL paths data");
        }

        setPaths(result.data || []);
      } catch (err: any) {
        console.error("Error fetching URL paths data:", err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPaths();
  }, [startDate, endDate, getUserToken, user]);

  // Colors for the bars
  const barColors = [
    "#4f46e5", // Indigo
    "#7c3aed", // Purple
    "#ec4899", // Pink
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c55e", // Green
    "#06b6d4", // Cyan
    "#3b82f6", // Blue
    "#8b5cf6", // Violet
    "#d946ef", // Fuchsia
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p className="text-xl">Error loading URL path data</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (paths.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">
          No URL path data available for the selected period.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">URL Path Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={paths}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="path"
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [`${value} visits`, "Visits"]}
            labelFormatter={(label: string) => `Path: ${label}`}
          />
          <Bar
            dataKey="visits"
            name="Page Visits"
            fill="#4f46e5"
            radius={[4, 4, 0, 0]}
          >
            {paths.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={barColors[index % barColors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// URL Analytics Dashboard Component
const UrlAnalyticsDashboard = ({ data }: { data: any[] }) => {
  const { getUserToken, user } = useAuth();
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // State for analytics data
  const [topDomains, setTopDomains] = useState<any[]>([]);
  const [visitsOverTime, setVisitsOverTime] = useState<any[]>([]);
  const [browserUsage, setBrowserUsage] = useState<any[]>([]);
  const [browserUsageLoading, setBrowserUsageLoading] = useState(true);
  const [browserUsageError, setBrowserUsageError] = useState<string | null>(
    null
  );
  const [summaryData, setSummaryData] = useState<any>(null);

  // Loading states
  const [loading, setLoading] = useState<Record<string, boolean>>({
    topDomains: true,
    visitsOverTime: true,
    summary: true,
  });

  // Error states
  const [errors, setErrors] = useState<Record<string, string | null>>({
    topDomains: null,
    visitsOverTime: null,
    summary: null,
  });

  // Fetch browser usage data
  const fetchBrowserUsage = async () => {
    try {
      setBrowserUsageLoading(true);
      setBrowserUsageError(null);

      const token = await getUserToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Build the query parameters
      const params = new URLSearchParams();
      params.append("startDate", startDate);
      params.append("endDate", endDate);

      console.log("Fetching browser usage data...");
      const response = await fetch(
        `/api/analytics/historical/browsers?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Company-ID": user.customClaims?.companyId || "",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);

        if (response.status === 500) {
          if (errorData.error?.includes("BigQuery")) {
            throw new Error(
              "BigQuery connection error. Please check server configuration and credentials."
            );
          } else {
            throw new Error(
              errorData.error || "Server error occurred while fetching data"
            );
          }
        } else if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 400) {
          if (errorData.error?.includes("Company ID")) {
            throw new Error(
              "Company ID is missing. Please ensure your account is properly set up with a company."
            );
          } else {
            throw new Error(errorData.error || "Bad request");
          }
        } else {
          throw new Error(
            errorData.error || "An error occurred while fetching browser data"
          );
        }
      }

      const result = await response.json();
      console.log("Browser usage data:", result);

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch browser usage data");
      }

      // Check if we received mock data due to schema errors
      if (result.message && result.message.includes("schema error")) {
        console.warn("Using mock data due to schema error:", result.message);
        // We'll still use the mock data, but we'll show a warning to the user
        setBrowserUsageError(`Note: Using sample data. ${result.message}`);
      }

      setBrowserUsage(result.data || []);
    } catch (err: any) {
      console.error("Error fetching browser usage data:", err);
      setBrowserUsageError(err.message || "An error occurred");
    } finally {
      setBrowserUsageLoading(false);
    }
  };

  // Fetch analytics data from the server
  const fetchAnalyticsData = async (analysisType: string) => {
    try {
      setLoading((prev) => ({ ...prev, [analysisType]: true }));
      setErrors((prev) => ({ ...prev, [analysisType]: null }));

      const token = await getUserToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Build the query parameters
      const params = new URLSearchParams();
      params.append("metricsType", "urls");
      params.append("analysisType", analysisType);
      params.append("startDate", startDate);
      params.append("endDate", endDate);

      const response = await fetch(
        `/api/analytics/historical?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Company-ID": user.customClaims?.companyId || "",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to fetch ${analysisType} data`
        );
      }

      const result = await response.json();
      console.log(`${analysisType} data:`, result);

      if (!result.success) {
        throw new Error(result.error || `Failed to fetch ${analysisType} data`);
      }

      // Update the appropriate state based on the analysis type
      switch (analysisType) {
        case "topDomains":
          setTopDomains(result.data || []);
          break;
        case "visitsOverTime":
          setVisitsOverTime(result.data || []);
          break;
        case "summary":
          setSummaryData(result.data || null);
          break;
      }
    } catch (err: any) {
      console.error(`Error fetching ${analysisType} data:`, err);
      setErrors((prev) => ({ ...prev, [analysisType]: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, [analysisType]: false }));
    }
  };

  // Fetch all analytics data on component mount or date change
  useEffect(() => {
    fetchAnalyticsData("topDomains");
    fetchAnalyticsData("visitsOverTime");
    fetchAnalyticsData("summary");
    fetchBrowserUsage();
  }, [startDate, endDate, user, getUserToken]);

  // Check if all data is loading
  const isAllLoading = Object.values(loading).some((isLoading) => isLoading);

  // Check if there are any errors
  const hasErrors = Object.values(errors).some((error) => error !== null);

  // Check if we have any data
  const hasData =
    topDomains.length > 0 ||
    visitsOverTime.length > 0 ||
    browserUsage.length > 0 ||
    summaryData !== null;

  if (isAllLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">URL Analytics</h2>
        <div className="text-center py-8">
          <div className="spinner mb-4"></div>
          <p>Loading URL analytics data...</p>
        </div>
      </div>
    );
  }

  if (hasErrors && !hasData) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">URL Analytics</h2>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">
                Error loading URL analytics data
              </p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {Object.entries(errors).map(
                  ([key, error]) =>
                    error && (
                      <li key={key}>
                        {key}: {error}
                      </li>
                    )
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">URL Analytics</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No URL data available for the selected period.</p>
          <p className="mt-2 text-sm">
            Try selecting a different date range or check if URL tracking is
            enabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">URL Analytics</h2>

      {/* Summary Statistics */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-800 mb-1">
              Total Visits
            </h3>
            <p className="text-2xl font-bold text-indigo-700">
              {summaryData.totalVisits}
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-800 mb-1">
              Unique Domains
            </h3>
            <p className="text-2xl font-bold text-indigo-700">
              {summaryData.urls}
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-800 mb-1">
              Unique Paths
            </h3>
            <p className="text-2xl font-bold text-indigo-700">
              {summaryData.uniquePaths}
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-800 mb-1">
              Avg. Load Time
            </h3>
            <p className="text-2xl font-bold text-indigo-700">
              {summaryData.avgPageLoadTime
                ? summaryData.avgPageLoadTime.toFixed(2)
                : 0}{" "}
              ms
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-800 mb-1">
              Most Recent Visit
            </h3>
            <p className="text-sm font-medium text-indigo-700 truncate">
              {summaryData.mostRecentVisit
                ? new Date(summaryData.mostRecentVisit).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Domains Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-medium">Most Visited Domains</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Top 10 domains by number of visits
          </p>
          <TopDomainsChart startDate={startDate} endDate={endDate} />
        </div>

        {/* Path Distribution Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-medium">URL Path Distribution</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Top 10 URL paths by number of visits
          </p>
          <UrlPathDistributionChart startDate={startDate} endDate={endDate} />
        </div>

        {/* Browser Usage Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-medium">Browser Usage</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Distribution of visits by browser
          </p>

          <div className="h-80">
            {browserUsageLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : browserUsageError && browserUsageError.startsWith("Note:") ? (
              <div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        {browserUsageError.substring(5)}
                      </p>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={browserUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="visits"
                      nameKey="browser"
                      label={({ browser, percent }) =>
                        `${browser}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {browserUsage.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#4f46e5",
                              "#6366f1",
                              "#818cf8",
                              "#a5b4fc",
                              "#c7d2fe",
                              "#ddd6fe",
                              "#e0e7ff",
                              "#ede9fe",
                            ][index % 8]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `${value} visits`,
                        "Visits",
                      ]}
                      labelFormatter={(name) => `Browser: ${name}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : browserUsageError ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-red-500 text-center">
                  <p className="text-xl">Error loading browser data</p>
                  <p className="text-sm mt-2">{browserUsageError}</p>
                </div>
              </div>
            ) : browserUsage.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">
                  No browser data available for the selected period.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="visits"
                    nameKey="browser"
                    label={({ browser, percent }) =>
                      `${browser}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {browserUsage.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#4f46e5",
                            "#6366f1",
                            "#818cf8",
                            "#a5b4fc",
                            "#c7d2fe",
                            "#ddd6fe",
                            "#e0e7ff",
                            "#ede9fe",
                          ][index % 8]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} visits`, "Visits"]}
                    labelFormatter={(name) => `Browser: ${name}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Visits Over Time Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-medium">URL Visits Over Time</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Number of URL visits per day
          </p>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visitsOverTime}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value} visits`, "Visits"]}
                  labelFormatter={(label: string) => `Date: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="visits"
                  name="URL Visits"
                  stroke="#4f46e5"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// EventDataViewer component to display raw_data in a formatted way
const EventDataViewer = ({ data }: { data: string }) => {
  // Try to parse the data as JSON
  let parsedData: any = null;
  let isValidJson = false;

  // State to track if dropdown is open
  const [isOpen, setIsOpen] = useState(false);

  try {
    parsedData = JSON.parse(data);
    isValidJson = true;
  } catch (e) {
    // Not valid JSON, will display as string
  }

  if (!isValidJson) {
    return (
      <div className="text-sm text-gray-700 truncate">
        {data.length > 50 ? data.substring(0, 50) + "..." : data}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main row content - always visible */}
      <div className="flex items-center justify-start">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <div className="flex items-center">
            <span className="text-xs mr-1">Show data</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </button>
      </div>

      {/* Dropdown - only visible when open */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            {Object.entries(parsedData).map(([key, value]) => (
              <div
                key={key}
                className="py-1 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-xs text-gray-700">{key}</div>
                <div className="text-xs text-gray-600 break-words">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// AllEventsAnalytics component for filtering and displaying all events
const AllEventsAnalytics = () => {
  const { getUserToken, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);

  // Filter states
  const [userEmail, setUserEmail] = useState("");
  const [metricsType, setMetricsType] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch events with filters
  const fetchEvents = async (emailP?: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = await getUserToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (emailP !== "" && userEmail) params.append("userEmail", userEmail);
      if (metricsType) params.append("metricsType", metricsType);
      params.append("page", page.toString());
      params.append("pageSize", pageSize.toString());

      const response = await fetch(
        `/api/analytics/historical/events?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Company-ID": user.customClaims?.companyId || "",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch events");
      }

      const result = await response.json();

      // Check if there's a message about no user found
      if (
        result.message &&
        result.message.includes("No user found with email")
      ) {
        setError(result.message);
        setEvents([]);
        setTotalEvents(0);
        return;
      }

      setEvents(result.data || []);
      setTotalEvents(result.total || 0);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = () => {
    setPage(1); // Reset to first page when filters change
    fetchEvents();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setUserEmail("");
    setMetricsType("");
    setPage(1);
    fetchEvents("");
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Fetch events on component mount and when page changes
  useEffect(() => {
    fetchEvents();
  }, [page, pageSize]);

  // Calculate total pages
  const totalPages = Math.ceil(totalEvents / pageSize);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">All Events Analytics</h2>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-md font-medium mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Email
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Filter by User Email"
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metrics Type
            </label>
            <select
              value={metricsType}
              onChange={(e) => setMetricsType(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              <option value="urls">URLs</option>
              <option value="fileDownloads">File Downloads</option>
              <option value="fileUploads">File Uploads</option>
              <option value="clipboardEvents">Clipboard Events</option>
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleFilterChange}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border border-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <h3 className="text-md font-medium mb-3">Results</h3>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded-lg">
            <p className="text-gray-500">
              No events found matching your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Event ID
                    </th>
                    {events.some((event) => event.userEmail) && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        User Email
                      </th>
                    )}
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Metrics Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Timestamp
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event._id}
                      </td>
                      {event.userEmail && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.userEmail}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.metricsType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.timestamp.value).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-lg">
                          <EventDataViewer data={event.raw_data || "{}"} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                    page === 1
                      ? "text-gray-300"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, page + 1))
                  }
                  disabled={page === totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                    page === totalPages
                      ? "text-gray-300"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(page - 1) * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(page * pageSize, totalEvents)}
                    </span>{" "}
                    of <span className="font-medium">{totalEvents}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                        page === 1
                          ? "text-gray-300"
                          : "text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            page === pageNum
                              ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, page + 1))
                      }
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                        page === totalPages
                          ? "text-gray-300"
                          : "text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function HistoricalAnalyticsPage() {
  const { user, loading, getUserToken } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricsType, setMetricsType] = useState<string | null>(null);

  // State for summary data
  const [summaryData, setSummaryData] = useState({
    totalEvents: 0,
    byType: {
      urls: 0,
      fileDownloads: 0,
      fileUploads: 0,
      clipboardEvents: 0,
    },
  });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryFromCache, setSummaryFromCache] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch summary data
  useEffect(() => {
    async function fetchSummaryData() {
      if (!user) return;

      try {
        setSummaryLoading(true);
        setSummaryError(null);

        const token = await getUserToken();
        if (!token) {
          throw new Error("Failed to get authentication token");
        }

        // Build the query parameters
        const params = new URLSearchParams();

        console.log("Fetching historical summary data...");
        const response = await fetch(
          `/api/analytics/historical/summary?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Company-ID": user.customClaims?.companyId || "",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error response:", errorData);

          if (response.status === 500) {
            if (errorData.error?.includes("BigQuery")) {
              throw new Error(
                "BigQuery connection error. Please check server configuration and credentials."
              );
            } else {
              throw new Error(
                errorData.error || "Server error occurred while fetching data"
              );
            }
          } else if (response.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          } else if (response.status === 400) {
            if (errorData.error?.includes("Company ID")) {
              throw new Error(
                "Company ID is missing. Please ensure your account is properly set up with a company."
              );
            } else {
              throw new Error(errorData.error || "Bad request");
            }
          } else {
            throw new Error(
              errorData.error || "An error occurred while fetching data"
            );
          }
        }

        const result = await response.json();

        // Check if the API returned success: false
        if (!result.byType) {
          throw new Error(result.error || "Failed to fetch summary data");
        }

        // If we get here, we have valid data
        console.log("Summary data received:", result);
        setSummaryData(result);
        setSummaryFromCache(result.fromCache === true);
      } catch (err: any) {
        console.error("Error fetching summary data:", err);
        setSummaryError(err.message || "An error occurred");
      } finally {
        setSummaryLoading(false);
      }
    }

    fetchSummaryData();
  }, [user, getUserToken]);

  // Function to manually refresh summary data
  const refreshSummaryData = async () => {
    if (!user) return;

    try {
      setSummaryLoading(true);
      setSummaryError(null);

      const token = await getUserToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      // Add a cache-busting parameter
      const params = new URLSearchParams();
      params.append("refresh", Date.now().toString());

      console.log("Manually refreshing summary data...");
      const response = await fetch(
        `/api/analytics/historical/summary?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            "X-Company-ID": user.customClaims?.companyId || "",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);

        if (response.status === 500) {
          if (errorData.error?.includes("BigQuery")) {
            throw new Error(
              "BigQuery connection error. Please check server configuration and credentials."
            );
          } else {
            throw new Error(
              errorData.error || "Server error occurred while fetching data"
            );
          }
        } else if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 400) {
          if (errorData.error?.includes("Company ID")) {
            throw new Error(
              "Company ID is missing. Please ensure your account is properly set up with a company."
            );
          } else {
            throw new Error(errorData.error || "Bad request");
          }
        } else {
          throw new Error(
            errorData.error || "An error occurred while fetching data"
          );
        }
      }

      const result = await response.json();

      // Check if the API returned success: false
      if (!result.byType) {
        throw new Error(result.error || "Failed to fetch summary data");
      }

      // If we get here, we have valid data
      console.log("Summary data received:", result);
      setSummaryData(result);
      setSummaryFromCache(result.fromCache === true);
    } catch (err: any) {
      console.error("Error refreshing summary data:", err);
      setSummaryError(err.message || "An error occurred");
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        const token = await getUserToken();
        if (!token) {
          throw new Error("Failed to get authentication token");
        }

        // Build the query parameters
        const params = new URLSearchParams();
        params.append("limit", "10");
        if (metricsType) {
          params.append("metricsType", metricsType);
        }

        console.log("Fetching historical data...");
        const response = await fetch(
          `/api/analytics/historical?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Company-ID": user.customClaims?.companyId || "",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error response:", errorData);

          // Provide more specific error messages based on status code
          if (response.status === 500) {
            if (errorData.error?.includes("BigQuery")) {
              throw new Error(
                "BigQuery connection error. Please check server configuration and credentials."
              );
            } else if (errorData.error?.includes("project")) {
              throw new Error(
                "Google Cloud Project ID is missing. Please check your environment variables."
              );
            } else {
              throw new Error(
                errorData.error || "Server error occurred while fetching data"
              );
            }
          } else if (response.status === 401) {
            throw new Error("Authentication error. Please log in again.");
          } else if (response.status === 403) {
            throw new Error("You do not have permission to access this data.");
          } else {
            throw new Error(
              errorData.error || "Failed to fetch historical data"
            );
          }
        }

        const result = await response.json();
        console.log(
          "Data fetched successfully:",
          result.data?.length || 0,
          "records"
        );
        setData(result.data || []);

        // Check if there's a message from the API
        if (result.message) {
          console.log("API message:", result.message);
          // Show a warning message if the API returned a message but no data
          if (!result.data || result.data.length === 0) {
            setError(`No data available: ${result.message}`);
          }
        }
      } catch (err: any) {
        console.error("Error fetching historical data:", err);
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user, getUserToken, metricsType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Historical Analytics</h1>

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Summary</h2>
          <div className="flex space-x-2">
            <button
              onClick={refreshSummaryData}
              disabled={summaryLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {summaryLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500 mr-2"></div>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>
        <SummaryCards
          data={summaryData}
          loading={summaryLoading}
          error={summaryError}
        />
      </div>

      {/* URL Analytics Dashboard */}
      {/* <UrlAnalyticsDashboard data={data} /> */}

      {/* All Events Analytics with Filtering */}
      <AllEventsAnalytics />
    </div>
  );
}
