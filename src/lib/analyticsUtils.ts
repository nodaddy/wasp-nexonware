import {
  MetricsData,
  UserMetrics,
  ClipboardEvent,
  FileDownload,
  FileUpload,
  UrlVisit,
} from "../types/metrics";

/**
 * Counts total events by type for a company
 */
export function countCompanyEvents(
  companyData: Record<string, UserMetrics> | null
) {
  if (!companyData)
    return { clipboardEvents: 0, fileDownloads: 0, fileUploads: 0, urls: 0 };

  return Object.values(companyData).reduce(
    (acc, userData) => {
      return {
        clipboardEvents:
          acc.clipboardEvents + countEvents(userData.clipboardEvents),
        fileDownloads: acc.fileDownloads + countEvents(userData.fileDownloads),
        fileUploads: acc.fileUploads + countEvents(userData.fileUploads),
        urls: acc.urls + countEvents(userData.urls),
      };
    },
    { clipboardEvents: 0, fileDownloads: 0, fileUploads: 0, urls: 0 }
  );
}

/**
 * Counts events in a record
 */
function countEvents<T>(events: Record<string, T> | undefined): number {
  if (!events) return 0;
  return Object.keys(events).length;
}

/**
 * Gets clipboard events by type (copy, paste, cut)
 */
export function getClipboardEventsByType(
  events: Record<string, ClipboardEvent> | undefined | null
) {
  if (!events) return { copy: 0, paste: 0, cut: 0 };

  return Object.values(events).reduce(
    (acc, event) => {
      const eventType = event.eventType as "copy" | "paste" | "cut";
      acc[eventType] = (acc[eventType] || 0) + 1;
      return acc;
    },
    { copy: 0, paste: 0, cut: 0 } as Record<"copy" | "paste" | "cut", number>
  );
}

/**
 * Gets file downloads by type
 */
export function getFileDownloadsByType(
  downloads: Record<string, FileDownload> | undefined | null
) {
  if (!downloads) return {};

  return Object.values(downloads).reduce((acc, download) => {
    const fileType = download.fileExtension || "unknown";
    acc[fileType] = (acc[fileType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Gets file uploads by type
 */
export function getFileUploadsByType(
  uploads: Record<string, FileUpload> | undefined | null
) {
  if (!uploads) return {};

  return Object.values(uploads).reduce((acc, upload) => {
    const fileType = upload.fileType.split("/")[1] || "unknown";
    acc[fileType] = (acc[fileType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Gets domain visit counts
 */
export function getDomainVisits(
  urls: Record<string, UrlVisit> | undefined | null
) {
  if (!urls) return {};

  return Object.values(urls).reduce((acc, visit) => {
    acc[visit.domain] = (acc[visit.domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Gets sensitive data events
 */
export function getSensitiveDataEvents(
  events: Record<string, ClipboardEvent> | undefined | null
) {
  if (!events) return [];

  return Object.values(events).filter((event) => event.hasSensitiveData);
}

/**
 * Gets events by time period (day, week, month)
 */
export function getEventsByTimePeriod<T extends { timestamp: string }>(
  events: Record<string, T> | undefined | null,
  period: "day" | "week" | "month" = "day"
) {
  if (!events) return {};

  const now = new Date();
  const periodMap = {
    day: 1,
    week: 7,
    month: 30,
  };

  const cutoffDate = new Date(
    now.getTime() - periodMap[period] * 24 * 60 * 60 * 1000
  );

  // Group events by day
  return Object.values(events).reduce((acc, event) => {
    const eventDate = new Date(event.timestamp);

    if (eventDate >= cutoffDate) {
      const dateKey = eventDate.toISOString().split("T")[0];
      acc[dateKey] = (acc[dateKey] || 0) + 1;
    }

    return acc;
  }, {} as Record<string, number>);
}

/**
 * Gets top domains by visit count
 */
export function getTopDomains(
  urls: Record<string, UrlVisit> | undefined | null,
  limit: number = 5
) {
  const domainCounts = getDomainVisits(urls);

  return Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .reduce((acc, [domain, count]) => {
      acc[domain] = count;
      return acc;
    }, {} as Record<string, number>);
}

/**
 * Gets user activity over time
 */
export function getUserActivityOverTime(
  userData: UserMetrics | null,
  period: "day" | "week" | "month" = "week"
) {
  if (!userData) return {};

  const clipboardActivity = getEventsByTimePeriod(
    userData.clipboardEvents,
    period
  );
  const downloadActivity = getEventsByTimePeriod(
    userData.fileDownloads,
    period
  );
  const uploadActivity = getEventsByTimePeriod(userData.fileUploads, period);
  const urlActivity = getEventsByTimePeriod(userData.urls, period);

  // Combine all dates
  const allDates = new Set([
    ...Object.keys(clipboardActivity),
    ...Object.keys(downloadActivity),
    ...Object.keys(uploadActivity),
    ...Object.keys(urlActivity),
  ]);

  // Create combined activity data
  const result: Record<
    string,
    { clipboard: number; downloads: number; uploads: number; urls: number }
  > = {};

  allDates.forEach((date) => {
    result[date] = {
      clipboard: clipboardActivity[date] || 0,
      downloads: downloadActivity[date] || 0,
      uploads: uploadActivity[date] || 0,
      urls: urlActivity[date] || 0,
    };
  });

  return result;
}
