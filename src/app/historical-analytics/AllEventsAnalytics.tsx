import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

const AllEventsAnalytics = ({ data }: { data: any[] }) => {
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
        <div className="text-xs text-gray-700 truncate">
          {data.length > 40 ? data.substring(0, 40) + "..." : data}
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
              <span className="text-xs mr-1">Data</span>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${
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
          <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
            <div className="p-1">
              {Object.entries(parsedData).map(([key, value]) => (
                <div
                  key={key}
                  className="py-0.5 border-b border-gray-100 last:border-b-0"
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
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <h3 className="text-sm font-medium mb-2">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              User Email
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Filter by User Email"
              className="w-full border border-gray-300 rounded-md shadow-sm px-2 py-1 text-xs focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Metrics Type
            </label>
            <select
              value={metricsType}
              onChange={(e) => setMetricsType(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm px-2 py-1 text-xs focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
              className="bg-indigo-600 text-white px-3 py-1 text-xs rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="bg-gray-100 text-gray-700 px-3 py-1 text-xs rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border border-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-3">
        <h3 className="text-sm font-medium mb-2">Results</h3>

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
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Event ID
                    </th>
                    {events.some((event) => event.userEmail) && (
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        User Email
                      </th>
                    )}
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Metrics Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Timestamp
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr
                      key={event._id}
                      className="hover:bg-gray-50 border-b border-gray-100"
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                        {event._id}
                      </td>
                      {event.userEmail && (
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          {event.userEmail}
                        </td>
                      )}
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {event.metricsType}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {new Date(event.timestamp.value).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
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
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-2 sm:px-4 mt-2">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium ${
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
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium ${
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
                  <p className="text-xs text-gray-700">
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
                      className={`relative inline-flex items-center rounded-l-md px-1 py-1 ${
                        page === 1
                          ? "text-gray-300"
                          : "text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show pages around current page
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
                          className={`relative inline-flex items-center px-2 py-1 text-xs font-medium ${
                            page === pageNum
                              ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                              : "text-gray-500 hover:bg-gray-50"
                          } border border-gray-300`}
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
                      className={`relative inline-flex items-center rounded-r-md px-1 py-1 ${
                        page === totalPages
                          ? "text-gray-300"
                          : "text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
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

export default AllEventsAnalytics;
