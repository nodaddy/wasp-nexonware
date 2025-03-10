# Extension Policy Schema Update Summary (V5)

## Overview

We've updated the extension policy schema to simplify the action properties and refine the metrics collection controls. This update streamlines the policy configuration and focuses on the most essential metrics for monitoring user activity.

## Key Changes

### 1. Schema Structure

**Before:**

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

**After:**

```json
{
  "version": 2,
  "actions": {
    "paste": {
      "restrictSensitive": false,
      "restrict": false
    },
    "upload": {
      "restrictSensitive": false,
      "restrict": false
    },
    "download": {
      "restrictSensitive": false,
      "restrict": false
    },
    "formSubmission": {
      "restrictSensitive": false,
      "restrict": false
    }
  },
  "metricsCollection": {
    "urlCapture": true,
    "fileUploads": true,
    "fileDownloads": true,
    "clipboardEvents": true
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

### 2. Action Properties Simplification

- Removed `logData` property from all action types
- Retained only the essential control properties:
  - `restrict`: Controls whether the action is allowed
  - `restrictSensitive`: Controls content scanning for sensitive data

### 3. Metrics Collection Updates

- Renamed `trackFileUploads` to `fileUploads` for consistency
- Renamed `trackFileDownloads` to `fileDownloads` for consistency
- Removed `activeTimeTracking` and `siteDwellTime` metrics
- Added `clipboardEvents` to track clipboard operations

## Files Updated

1. **src/types/policies.ts**

   - Updated the `ActionPolicy` interface to remove `logData`
   - Updated the `MetricsCollection` interface with the new metrics
   - Updated the default policy and conversion function

2. **src/lib/policyService.ts**

   - Enhanced schema detection to identify the correct version
   - Added support for migrating from previous schemas
   - Updated field mappings for backward compatibility

3. **src/app/dashboard/extension-policy/page.tsx**
   - Removed UI controls for `logData` properties
   - Updated metrics collection section with the new metrics
   - Added UI control for `clipboardEvents`

## Benefits of the New Schema

1. **Simplified Configuration**: Fewer options make policy configuration more straightforward
2. **Focused Metrics**: More targeted metrics collection for better performance
3. **Improved Clarity**: Clearer separation between restriction controls and metrics collection
4. **Consistent Naming**: More consistent property names across the schema
5. **Better UX**: Simplified UI with fewer checkboxes and clearer options

## Backward Compatibility

The system continues to support multiple schema versions and automatically upgrades policies to the latest version when read and saved. This ensures a smooth transition for existing users while providing the new streamlined functionality.
