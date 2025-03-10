export interface ExceptionItem {
  type: string;
  description: string;
}

export interface ActionPolicy {
  restrictSensitive: boolean;
  restrict: boolean;
  warnBeforePaste: boolean;
}

export interface MetricsCollection {
  urlCapture: boolean;
  fileUploads: boolean;
  fileDownloads: boolean;
  clipboardEvents: boolean;
}

export interface MetricsSettings {
  retentionDays: number;
  anonymizeUserData: boolean;
  persistData: boolean;
}

export interface PastePolicy extends ActionPolicy {
  isSensitiveDataBlocked: boolean;
}

export interface UploadPolicy extends ActionPolicy {
  isScanEnabled: boolean;
}

export interface DownloadPolicy extends ActionPolicy {
  isScanEnabled: boolean;
}

export interface FormSubmissionPolicy extends ActionPolicy {
  isValidationEnabled: boolean;
}

export interface ExtensionPolicy {
  version: number;
  actions: {
    paste: ActionPolicy;
  };
  blocklist: string[];
  allowlist: string[];
  metricsCollection: MetricsCollection;
  metricsSettings: MetricsSettings;
  updatedAt?: {
    seconds: number;
    nanoseconds: number;
  };
  updatedBy?: string;
}

export const defaultExtensionPolicy: ExtensionPolicy = {
  version: 2,
  actions: {
    paste: {
      restrictSensitive: false,
      restrict: false,
      warnBeforePaste: false,
    },
  },
  blocklist: [],
  allowlist: [],
  metricsCollection: {
    urlCapture: true,
    fileUploads: true,
    fileDownloads: true,
    clipboardEvents: true,
  },
  metricsSettings: {
    retentionDays: 90,
    anonymizeUserData: false,
    persistData: true,
  },
};
