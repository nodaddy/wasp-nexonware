# Extension Policy Schema Update Summary (V4)

## Overview

We've updated the extension policy schema to include metrics collection controls and global settings. This enhancement allows administrators to configure what metrics are collected by the extension and how that data is managed.

## Key Changes

### 1. Schema Structure

**Before:**

```json
{
  "actions": {
    "paste": {
      "logData": false,
      "restrictSensitive": false,
      "restrict": false
    },
    "upload": {
      "logData": false,
      "restrictSensitive": false,
      "restrict": false
    },
    "download": {
      "logData": false,
      "restrictSensitive": false,
      "restrict": false
    },
    "formSubmission": {
      "logData": false,
      "restrictSensitive": false,
      "restrict": false
    }
  },
  "blocklist": [],
  "allowlist": [],
  "updatedAt": {
    "seconds": 1741267862,
    "nanoseconds": 95000000
  },
  "updatedBy": "userId"
}
```

**After:**

```json
{
  "version": 2,
  "actions": {
    "paste": {
      "logData": false,
      "restrictSensitive": false,
      "restrict": false
    },
    "upload": {
      "logData": false,
      "restrictSensitive": false,
      "restrict": false
    },
    "download": {
      "logData": false,
      "restrictSensitive": false,
      "restrict": false
    },
    "formSubmission": {
      "logData": false,
      "restrictSensitive": false,
      "restrict": false
    }
  },
  "metricsCollection": {
    "urlCapture": true,
    "activeTimeTracking": true,
    "siteDwellTime": true,
    "trackFileUploads": true,
    "trackFileDownloads": true
  },
  "metricsSettings": {
    "retentionDays": 90,
    "anonymizeUserData": false,
    "persistData": true
  },
  "blocklist": [],
  "allowlist": [],
  "updatedAt": {
    "seconds": 1741267862,
    "nanoseconds": 95000000
  },
  "updatedBy": "userId"
}
```

### 2. New Components

#### Metrics Collection

- **urlCapture**: Controls whether URLs visited by users are collected
- **activeTimeTracking**: Records periods when the user is actively interacting with the page
- **siteDwellTime**: Tracks how long users spend on different websites
- **trackFileUploads**: Records metadata about files uploaded by users
- **trackFileDownloads**: Records metadata about files downloaded by users

#### Metrics Settings

- **retentionDays**: Number of days to retain collected metrics data (1-365 days)
- **anonymizeUserData**: Option to remove personally identifiable information from collected metrics
- **persistData**: Controls whether data is stored persistently or only kept in memory

### 3. Version Control

Added a `version` field (set to 2) to track schema changes and facilitate future migrations.

## Files Updated

1. **src/types/policies.ts**

   - Added `MetricsCollection` and `MetricsSettings` interfaces
   - Updated the `ExtensionPolicy` interface to include the new fields
   - Added version field to the schema
   - Updated the default policy and conversion function

2. **src/lib/policyService.ts**

   - Enhanced schema detection to identify the correct version
   - Added support for migrating from previous schemas to version 2
   - Updated the save function to ensure version 2 is set

3. **src/hooks/useExtensionPolicy.ts**

   - Added `updateMetricsCollection` and `updateMetricsSettings` functions
   - Updated the hook interface to expose the new functions

4. **src/app/dashboard/extension-policy/page.tsx**
   - Added new sections for Metrics Collection and Metrics Settings
   - Added UI controls for all new settings
   - Implemented handler for retention days input

## Benefits of the New Schema

1. **Enhanced Metrics Control**: Granular control over what metrics are collected
2. **Data Privacy Options**: Settings to control data retention and anonymization
3. **Versioning**: Better tracking of schema changes for future migrations
4. **Improved UI**: Dedicated sections for metrics configuration
5. **Future-Proof**: Structured to accommodate additional metrics in the future

## Backward Compatibility

The system now supports multiple schema versions and automatically upgrades policies to version 2 when read and saved. This ensures a smooth transition for existing users while providing the new functionality.
