"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { SummaryCards } from "@/components/analytics/SummaryCards";
import AllEventsAnalytics from "./AllEventsAnalytics";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-6 px-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-indigo-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold">Historical Analytics</h1>
              <p className="text-indigo-100 mt-1">
                Comprehensive event tracking and analysis dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Summary Section with improved styling */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Summary Overview
              </h2>
              <p className="text-xs text-gray-500">
                Key metrics from your historical data
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              <button
                onClick={refreshSummaryData}
                disabled={summaryLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out disabled:opacity-50"
              >
                {summaryLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-1.5"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1.5"
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

          {/* Cards with improved styling */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-3">
              <SummaryCards
                data={summaryData}
                loading={summaryLoading}
                error={summaryError}
              />
            </div>

            {/* Last updated info */}
            {!summaryLoading && !summaryError && (
              <div className="bg-gray-50 px-3 py-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Last updated: {new Date().toLocaleString()}
                  {summaryFromCache && (
                    <span className="ml-2 text-amber-600 font-medium">
                      (Cached data)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Events Analytics with improved styling */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <AllEventsAnalytics data={data} />
        </div>
      </div>
    </div>
  );
}
