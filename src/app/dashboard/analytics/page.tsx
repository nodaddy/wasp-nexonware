"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  BarChart2,
  PieChart,
  LineChart as LineChartIcon,
  Users,
  Chrome,
  Shield,
  Clipboard,
  Upload,
  Globe,
} from "lucide-react";
import { useCompanyMetrics } from "../../../hooks/useMetrics";
import {
  countCompanyEvents,
  getClipboardEventsByType,
  getFileDownloadsByType,
  getFileUploadsByType,
  getDomainVisits,
  getSensitiveDataEvents,
  getTopDomains,
  getUserActivityOverTime,
} from "../../../lib/analyticsUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Sector,
} from "recharts";
import {
  UserMetrics,
  FileDownload,
  FileUpload,
  ClipboardEvent,
} from "../../../types/metrics";

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const ChartCard = ({
  title,
  description,
  children,
  actions,
}: ChartCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          {actions && <div>{actions}</div>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};

// Placeholder chart components
const BarChartPlaceholder = () => (
  <div className="aspect-[16/9] flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <BarChart2 size={48} className="mx-auto text-gray-300" />
      <p className="mt-2 text-sm text-gray-500">Bar Chart</p>
      <p className="text-xs text-gray-400">
        Data visualization will appear here
      </p>
    </div>
  </div>
);

const LineChartPlaceholder = () => (
  <div className="aspect-[16/9] flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LineChartIcon size={48} className="mx-auto text-gray-300" />
      <p className="mt-2 text-sm text-gray-500">Line Chart</p>
      <p className="text-xs text-gray-400">
        Data visualization will appear here
      </p>
    </div>
  </div>
);

const PieChartPlaceholder = () => (
  <div className="aspect-[1/1] flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <PieChart size={48} className="mx-auto text-gray-300" />
      <p className="mt-2 text-sm text-gray-500">Pie Chart</p>
      <p className="text-xs text-gray-400">
        Data visualization will appear here
      </p>
    </div>
  </div>
);

// Animated counter component that animates when the number changes
const AnimatedCounter = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Don't animate on initial render
    if (displayValue === 0 && value !== 0) {
      setDisplayValue(value);
      return;
    }

    // If the value has changed, animate to the new value
    if (value !== displayValue) {
      // Trigger animation
      setIsAnimating(true);

      // Use a simple counter animation
      let start = displayValue;
      const end = value;
      const duration = 1000; // 1 second
      const frameDuration = 1000 / 60; // 60fps
      const totalFrames = Math.round(duration / frameDuration);
      const increment = (end - start) / totalFrames;

      let frame = 0;
      const counter = setInterval(() => {
        frame++;
        const newValue = Math.round(start + increment * frame);

        // Update the display value
        setDisplayValue(frame === totalFrames ? end : newValue);

        // Clear the interval when we reach the end
        if (frame === totalFrames) {
          clearInterval(counter);

          // Remove animation class after animation completes
          setTimeout(() => {
            setIsAnimating(false);
          }, 1200); // Match the animation duration
        }
      }, frameDuration);

      return () => clearInterval(counter);
    }
  }, [value, displayValue]);

  return (
    <span
      className={`font-medium inline-block ${
        isAnimating ? "animate-counter-highlight" : ""
      } rounded px-1 ${className || ""}`}
    >
      {displayValue.toLocaleString()}
    </span>
  );
};

// User Activity Table Component
const UserActivityTable = ({
  companyData,
}: {
  companyData: Record<string, UserMetrics> | null;
}) => {
  // Combine all events from all users
  const allEvents: Array<{
    type: string;
    timestamp: string;
    userId: string;
    domain?: string;
    eventType?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    extensionAction?: string;
    hasSensitiveData?: boolean;
  }> = [];

  if (companyData) {
    Object.entries(companyData).forEach(([userId, userData]) => {
      // Add clipboard events
      if (userData.clipboardEvents) {
        Object.values(userData.clipboardEvents).forEach((event) => {
          allEvents.push({
            type: "clipboard",
            timestamp: event.timestamp,
            userId,
            domain: event.domain,
            eventType: event.eventType,
            extensionAction: event.extensionAction,
            hasSensitiveData: event.hasSensitiveData,
          });
        });
      }

      // Add file downloads
      if (userData.fileDownloads) {
        Object.values(userData.fileDownloads).forEach((event) => {
          allEvents.push({
            type: "download",
            timestamp: event.timestamp,
            userId,
            domain: event.domain,
            fileName: event.filename,
            fileSize: event.fileSize,
            fileType: event.fileExtension,
            extensionAction:
              event.state === "complete" ? "Allowed" : "Interrupted",
          });
        });
      }

      // Add file uploads
      if (userData.fileUploads) {
        Object.values(userData.fileUploads).forEach((event) => {
          allEvents.push({
            type: "upload",
            timestamp: event.timestamp,
            userId,
            domain: event.domain,
            fileName: event.fileName,
            fileSize: event.fileSize,
            fileType: event.fileType.split("/")[1],
            extensionAction: "Monitored",
          });
        });
      }

      // Add URL visits
      if (userData.urls) {
        Object.values(userData.urls).forEach((event) => {
          allEvents.push({
            type: "url",
            timestamp: event.timestamp,
            userId,
            domain: event.domain,
            extensionAction: "Tracked",
          });
        });
      }
    });
  }

  // Sort events by timestamp (most recent first)
  allEvents.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Limit to most recent 10 events
  const recentEvents = allEvents.slice(0, 10);

  // Function to get icon for event type
  const getEventIcon = (type: string) => {
    switch (type) {
      case "clipboard":
        return <Clipboard className="h-5 w-5 text-indigo-500 ml-4" />;
      case "download":
        return <Download className="h-5 w-5 text-blue-500 ml-4" />;
      case "upload":
        return <Upload className="h-5 w-5 text-green-500 ml-4" />;
      case "url":
        return <Globe className="h-5 w-5 text-amber-500 ml-4" />;
      default:
        return null;
    }
  };

  // Function to get event description
  const getEventDescription = (event: (typeof allEvents)[0]) => {
    switch (event.type) {
      case "clipboard":
        return `${event.eventType} operation on ${event.domain}${
          event.hasSensitiveData ? " (Sensitive Data)" : ""
        }`;
      case "download":
        return `Downloaded ${event.fileName} (${(
          event.fileSize! / 1024
        ).toFixed(1)} KB) from ${event.domain}`;
      case "upload":
        return `Uploaded ${event.fileName} (${(event.fileSize! / 1024).toFixed(
          1
        )} KB) to ${event.domain}`;
      case "url":
        return `Visited ${event.domain}`;
      default:
        return "Unknown activity";
    }
  };

  // Function to get status badge color
  const getStatusColor = (event: (typeof allEvents)[0]) => {
    if (event.type === "clipboard" && event.hasSensitiveData) {
      return "bg-red-100 text-red-800";
    }

    if (
      event.extensionAction?.toLowerCase() === "blocked" ||
      event.extensionAction?.toLowerCase() === "interrupted" ||
      event.extensionAction?.toLowerCase() === "unrestricted" ||
      event.extensionAction?.toLowerCase() === "warned"
    ) {
      return "bg-red-100 text-red-800";
    }

    if (
      event.extensionAction?.toLowerCase() === "allowed" ||
      event.extensionAction?.toLowerCase() === "restricted"
    ) {
      return "bg-green-100 text-green-800";
    }

    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="overflow-hidden">
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-4"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Activity
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    User ID
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Extension Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="flex items-center">
                          {getEventIcon(event.type)}
                          <span className="ml-2 font-medium text-gray-900 capitalize">
                            {event.type}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getEventDescription(event)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {event.userId.substring(0, 8)}...
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            event
                          )}`}
                        >
                          {event.extensionAction}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-sm text-gray-500"
                    >
                      No recent activity data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Website Activity Chart Component
const WebsiteActivityChart = ({
  companyData,
}: {
  companyData: Record<string, UserMetrics> | null;
}) => {
  // Combine all URL data from all users
  const allUrls = Object.values(companyData || {}).reduce(
    (acc: Record<string, any>, userData: UserMetrics) => {
      if (userData.urls) {
        return { ...acc, ...userData.urls };
      }
      return acc;
    },
    {}
  );

  // Get top domains
  const topDomains = getTopDomains(allUrls, 10);

  // Format data for Recharts
  const chartData = Object.entries(topDomains).map(([domain, count]) => ({
    domain,
    visits: count,
  }));

  // Colors for the bars
  const barColors = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
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
            {chartData.map((entry, index) => (
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

// User Activity Over Time Chart Component
const UserActivityOverTimeChart = ({
  companyData,
}: {
  companyData: Record<string, UserMetrics> | null;
}) => {
  // Combine all user activity data
  const activityData: Record<
    string,
    { clipboard: number; downloads: number; uploads: number; urls: number }
  > = {};

  if (companyData) {
    // Get current time and 6 hours ago
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    // Process data for each user
    Object.values(companyData).forEach((userData: UserMetrics) => {
      // Process each type of event
      ["clipboardEvents", "fileDownloads", "fileUploads", "urls"].forEach(
        (eventType) => {
          if (userData[eventType as keyof UserMetrics]) {
            Object.values(
              userData[eventType as keyof UserMetrics] || {}
            ).forEach((event: Record<string, any>) => {
              const eventTime = new Date(event.timestamp);

              // Only include events from the last 6 hours
              if (eventTime >= sixHoursAgo && eventTime <= now) {
                // Create hourly buckets (e.g., "2023-05-15T14:00:00")
                const hourBucket = new Date(
                  eventTime.getFullYear(),
                  eventTime.getMonth(),
                  eventTime.getDate(),
                  eventTime.getHours()
                ).toISOString();

                if (!activityData[hourBucket]) {
                  activityData[hourBucket] = {
                    clipboard: 0,
                    downloads: 0,
                    uploads: 0,
                    urls: 0,
                  };
                }

                // Increment the appropriate counter
                if (eventType === "clipboardEvents")
                  activityData[hourBucket].clipboard++;
                else if (eventType === "fileDownloads")
                  activityData[hourBucket].downloads++;
                else if (eventType === "fileUploads")
                  activityData[hourBucket].uploads++;
                else if (eventType === "urls") activityData[hourBucket].urls++;
              }
            });
          }
        }
      );
    });

    // Ensure all hours are represented (even with zero counts)
    for (let i = 0; i < 6; i++) {
      const hourTime = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourBucket = new Date(
        hourTime.getFullYear(),
        hourTime.getMonth(),
        hourTime.getDate(),
        hourTime.getHours()
      ).toISOString();

      if (!activityData[hourBucket]) {
        activityData[hourBucket] = {
          clipboard: 0,
          downloads: 0,
          uploads: 0,
          urls: 0,
        };
      }
    }
  }

  // Convert to array and sort by date
  const chartData = Object.entries(activityData)
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Line colors
  const lineColors = {
    clipboard: "#8b5cf6", // Purple
    downloads: "#3b82f6", // Blue
    uploads: "#10b981", // Green
    urls: "#f59e0b", // Amber
  };

  return (
    <div className="h-96">
      <div className="mb-4 flex justify-between items-center">
        <span></span>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-[#8b5cf6]"></div>
          <span className="text-xs text-gray-600">Clipboard</span>
          <div className="h-3 w-3 rounded-full bg-[#3b82f6]"></div>
          <span className="text-xs text-gray-600">Downloads</span>
          <div className="h-3 w-3 rounded-full bg-[#10b981]"></div>
          <span className="text-xs text-gray-600">Uploads</span>
          <div className="h-3 w-3 rounded-full bg-[#f59e0b]"></div>
          <span className="text-xs text-gray-600">Website Visits</span>
          &nbsp; &nbsp; &nbsp; &nbsp;
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(date: string) => {
              const d = new Date(date);
              return `${d.getHours()}:00`;
            }}
            label={{ value: "Hour", position: "insideBottomRight", offset: 0 }}
            height={50}
          />
          <YAxis
            label={{ value: "Events", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const formattedName =
                name.charAt(0).toUpperCase() + name.slice(1);
              return [`${value} events`, formattedName];
            }}
            labelFormatter={(label: string) => {
              const date = new Date(label);
              return `${date.toLocaleDateString()} ${date.getHours()}:00 - ${
                date.getHours() + 1
              }:00`;
            }}
          />
          <Line
            type="monotone"
            dataKey="clipboard"
            name="Clipboard"
            stroke={lineColors.clipboard}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="downloads"
            name="Downloads"
            stroke={lineColors.downloads}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="uploads"
            name="Uploads"
            stroke={lineColors.uploads}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="urls"
            name="Website Visits"
            stroke={lineColors.urls}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// File Transfer Analysis Chart Component
const FileTransferAnalysisChart = ({
  companyData,
}: {
  companyData: Record<string, UserMetrics> | null;
}) => {
  // Combine all file data from all users
  const allDownloads: Record<string, FileDownload> = {};
  const allUploads: Record<string, FileUpload> = {};

  if (companyData) {
    Object.values(companyData).forEach((userData) => {
      // Combine downloads
      if (userData.fileDownloads) {
        Object.entries(userData.fileDownloads).forEach(([key, download]) => {
          allDownloads[key] = download;
        });
      }

      // Combine uploads
      if (userData.fileUploads) {
        Object.entries(userData.fileUploads).forEach(([key, upload]) => {
          allUploads[key] = upload;
        });
      }
    });
  }

  // Get file types and their counts
  const downloadsByType = getFileDownloadsByType(allDownloads);
  const uploadsByType = getFileUploadsByType(allUploads);

  // Combine all file types
  const allFileTypes = new Set([
    ...Object.keys(downloadsByType),
    ...Object.keys(uploadsByType),
  ]);

  // Format data for Recharts
  const chartData = Array.from(allFileTypes)
    .map((fileType) => ({
      fileType,
      downloadCount: downloadsByType[fileType] || 0,
      uploadCount: uploadsByType[fileType] || 0,
    }))
    // Sort by total count (downloads + uploads)
    .sort(
      (a, b) =>
        b.downloadCount + b.uploadCount - (a.downloadCount + a.uploadCount)
    )
    // Limit to top 8 file types
    .slice(0, 8);

  // State for view type
  const [viewType, setViewType] = useState<"downloads" | "uploads">(
    "downloads"
  );

  return (
    <div className="h-96">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 ml-5">
          <div className="inline-flex rounded-md shadow-sm mb-20">
            <button
              type="button"
              onClick={() => setViewType("downloads")}
              className={`relative inline-flex items-center rounded-l-md px-3 py-1 text-sm font-semibold ${
                viewType === "downloads"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              }`}
            >
              Downloads
            </button>
            <button
              type="button"
              onClick={() => setViewType("uploads")}
              className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-1 text-sm font-semibold ${
                viewType === "uploads"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              }`}
            >
              Uploads
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="fileType"
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis
            label={{ value: "Count", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            formatter={(value: number) => [
              `${value} files`,
              viewType === "downloads" ? "Downloads" : "Uploads",
            ]}
            labelFormatter={(label: string) => `File Type: ${label}`}
          />

          {viewType === "downloads" ? (
            <Bar
              dataKey="downloadCount"
              name="Downloads"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          ) : (
            <Bar
              dataKey="uploadCount"
              name="Uploads"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Clipboard Activity Chart Component
const ClipboardActivityChart = ({
  companyData,
}: {
  companyData: Record<string, UserMetrics> | null;
}) => {
  // Combine all clipboard events from all users
  const allClipboardEvents: Record<string, ClipboardEvent> = {};

  if (companyData) {
    Object.values(companyData).forEach((userData) => {
      if (userData.clipboardEvents) {
        Object.entries(userData.clipboardEvents).forEach(([key, event]) => {
          allClipboardEvents[key] = event;
        });
      }
    });
  }

  // Get clipboard events by type
  const eventsByType = getClipboardEventsByType(allClipboardEvents);

  // Calculate sensitive vs non-sensitive events
  const sensitiveEvents = Object.values(allClipboardEvents).filter(
    (event) => event.hasSensitiveData
  ).length;

  const nonSensitiveEvents =
    Object.values(allClipboardEvents).length - sensitiveEvents;

  // Format data for Recharts
  const chartData = [
    { name: "Sensitive", value: sensitiveEvents, color: "#ef4444" }, // Red for sensitive
    { name: "Normal", value: nonSensitiveEvents, color: "#3b82f6" }, // Blue for non-sensitive
  ];

  // Calculate total events and percentages
  const totalEvents = chartData.reduce((sum, item) => sum + item.value, 0);
  const sensitiveDataPercentage =
    totalEvents > 0 ? Math.round((sensitiveEvents / totalEvents) * 100) : 0;

  // Get event type breakdown
  const copyPercentage =
    totalEvents > 0 ? Math.round((eventsByType.copy / totalEvents) * 100) : 0;

  const pastePercentage =
    totalEvents > 0 ? Math.round((eventsByType.paste / totalEvents) * 100) : 0;

  const cutPercentage =
    totalEvents > 0 ? Math.round((eventsByType.cut / totalEvents) * 100) : 0;

  // Active shape for hover effect
  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin((-midAngle * Math.PI) / 180);
    const cos = Math.cos((-midAngle * Math.PI) / 180);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
        >{`${payload.name}: ${value}`}</text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
        >
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  // State for active index
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="h-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg ">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Total Events
          </h3>
          <div className="text-2xl font-semibold text-gray-500">
            <AnimatedCounter value={totalEvents} />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1 text-xs text-gray-500">
            <div>
              <span className="font-medium">Copy:</span> {copyPercentage}%
            </div>
            <div>
              <span className="font-medium">Paste:</span> {pastePercentage}%
            </div>
            <div>
              <span className="font-medium">Cut:</span> {cutPercentage}%
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Sensitive Data
          </h3>
          <div className="text-2xl font-semibold text-red-500">
            <AnimatedCounter value={sensitiveDataPercentage} />%
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {sensitiveEvents} of {totalEvents} events contain sensitive data
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg  ">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Level</h3>
          <p
            className={`text-2xl font-semibold ${
              sensitiveDataPercentage > 20
                ? "text-red-500"
                : sensitiveDataPercentage > 10
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {sensitiveDataPercentage > 20
              ? "High"
              : sensitiveDataPercentage > 10
              ? "Medium"
              : "Low"}
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                sensitiveDataPercentage > 20
                  ? "bg-red-600"
                  : sensitiveDataPercentage > 10
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(sensitiveDataPercentage * 3, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Pie Chart - Fixed Height */}
      <div className="bg-white p-4 rounded-lg  " style={{ height: "300px" }}>
        <RechartsPieChart width={500} height={250}>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} events (${Math.round((value / totalEvents) * 100)}%)`,
              name,
            ]}
          />
          <Legend verticalAlign="bottom" height={36} />
        </RechartsPieChart>
      </div>
    </div>
  );
};

// Analytics Dashboard
export default function AnalyticsPage() {
  // For demo purposes, we're using a hardcoded company ID
  // In a real app, you would get this from the authenticated user's context
  const companyId = "bN2uIWUplCFpHCFrMZPO";
  const {
    data: companyData,
    loading,
    error,
  } = useCompanyMetrics(companyId, true);

  // Calculate metrics from the data
  const eventCounts = countCompanyEvents(companyData);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Live Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Realtime analytics of employee browser activity and data protection
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {loading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">Loading analytics data...</p>
          </div>
        ) : error ? (
          <div className="mt-6 text-center">
            <p className="text-red-500">Error loading analytics data</p>
          </div>
        ) : (
          <>
            {/* Event Summary Cards */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <Clipboard className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Clipboard Events
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            <AnimatedCounter
                              value={eventCounts.clipboardEvents}
                            />
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <Download className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          File Downloads
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            <AnimatedCounter
                              value={eventCounts.fileDownloads}
                            />
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          File Uploads
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            <AnimatedCounter value={eventCounts.fileUploads} />
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Website Visits
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            <AnimatedCounter value={eventCounts.urls} />
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartCard
                title="Website Activity"
                description="Most visited websites by employees"
              >
                {loading ? (
                  <BarChartPlaceholder />
                ) : (
                  <WebsiteActivityChart companyData={companyData} />
                )}
              </ChartCard>

              <ChartCard
                title="User Activity Over Time"
                description="Trends in employee browser activity"
              >
                {loading ? (
                  <LineChartPlaceholder />
                ) : (
                  <UserActivityOverTimeChart companyData={companyData} />
                )}
              </ChartCard>

              <ChartCard
                title="File Transfer Analysis"
                description="Types of files being uploaded and downloaded"
              >
                {loading ? (
                  <BarChartPlaceholder />
                ) : (
                  <FileTransferAnalysisChart companyData={companyData} />
                )}
              </ChartCard>

              <ChartCard
                title="Clipboard Activity"
                description="Copy, paste, and cut events"
              >
                {loading ? (
                  <PieChartPlaceholder />
                ) : (
                  <ClipboardActivityChart companyData={companyData} />
                )}
              </ChartCard>
            </div>

            {/* Recent Activity Table */}
            <div className="mt-8">
              <ChartCard
                title="Recent User Activity"
                description="Latest browser events from employees"
              >
                {loading ? (
                  <div className="py-10 text-center">
                    <p className="text-gray-500">Loading activity data...</p>
                  </div>
                ) : (
                  <UserActivityTable companyData={companyData} />
                )}
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
