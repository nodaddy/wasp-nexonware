// Types for the metrics data structure in Firebase Realtime Database

// Event types
export interface ClipboardEvent {
  actionAllowed: boolean;
  contentLength: number;
  contentType: string;
  domain: string;
  eventType: "copy" | "paste" | "cut";
  hasSensitiveData: boolean;
  language: string;
  pageTitle: string;
  path: string;
  screenHeight: number;
  screenWidth: number;
  sourceElement?: string;
  sourceElementClass?: string;
  sourceElementId?: string;
  targetElement?: string;
  targetElementClass?: string;
  targetElementId?: string;
  extensionAction: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

export interface FileDownload {
  domain: string;
  downloadId: number;
  endTime: string;
  fileExtension: string;
  fileSize: number;
  filename: string;
  mimeType: string;
  referringPage: string;
  referringPageTitle: string;
  startTime: string;
  state: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

export interface FileUpload {
  domain: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  language: string;
  lastModified: string;
  pageTitle: string;
  path: string;
  screenHeight: number;
  screenWidth: number;
  timestamp: string;
  uploadMethod: string;
  url: string;
  userAgent: string;
}

export interface UrlVisit {
  domain: string;
  language: string;
  pageLoadTime: number;
  pageTitle: string;
  path: string;
  referrer: string;
  screenHeight: number;
  screenWidth: number;
  timestamp: string;
  url: string;
  userAgent: string;
}

// Collection of event types
export interface EventTypes {
  clipboardEvents: Record<string, ClipboardEvent>;
  fileDownloads: Record<string, FileDownload>;
  fileUploads: Record<string, FileUpload>;
  urls: Record<string, UrlVisit>;
}

// User metrics structure
export interface UserMetrics extends EventTypes {}

// Company metrics structure
export interface CompanyMetrics {
  [userId: string]: UserMetrics;
}

// Overall metrics data structure
export interface MetricsData {
  [companyId: string]: CompanyMetrics;
}
