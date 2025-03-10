# Extension Policy Schema Update Summary (V3)

## Overview

We've updated the extension policy schema to use consistent property names across all action types. This change simplifies the schema, improves maintainability, and makes it easier to understand the policy configuration.

## Key Changes

### 1. Schema Structure

**Before:**

```json
{
  "actions": {
    "paste": {
      "restrictPasting": false,
      "logPasteData": false,
      "blockSensitiveData": false
    },
    "upload": {
      "restrictUploads": false,
      "logUploadData": false,
      "scanForMalware": false
    },
    "download": {
      "restrictDownloads": false,
      "logDownloadData": false,
      "scanBeforeDownload": false
    },
    "formSubmission": {
      "restrictSubmissions": false,
      "logSubmissionData": false,
      "validateBeforeSubmit": false
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
  "actions": {
    "formSubmission": {
      "logData": false,
      "restrictSensitive": false,
      "restrict": false
    },
    "download": {
      "logData": false,
      "restrictSensitive": false,
      "restrict": false
    },
    "paste": {
      "logData": false,
      "restrictSensitive": false,
      "restrict": false
    },
    "upload": {
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

### 2. Property Name Standardization

We've standardized the property names across all action types:

| Before                                                                       | After             |
| ---------------------------------------------------------------------------- | ----------------- |
| restrictPasting, restrictUploads, restrictDownloads, restrictSubmissions     | restrict          |
| logPasteData, logUploadData, logDownloadData, logSubmissionData              | logData           |
| blockSensitiveData, scanForMalware, scanBeforeDownload, validateBeforeSubmit | restrictSensitive |

### 3. ActionPolicy Interface

Created a unified `ActionPolicy` interface that applies to all action types:

```typescript
export interface ActionPolicy {
  logData: boolean;
  restrictSensitive: boolean;
  restrict: boolean;
}
```

## Files Updated

1. **src/types/policies.ts**

   - Updated the `ExtensionPolicy` interface
   - Created a unified `ActionPolicy` interface
   - Updated the default policy
   - Modified the conversion function to use the new property names

2. **src/lib/policyService.ts**

   - Updated to handle the new schema
   - Added support for migrating from both legacy and intermediate schemas
   - Enhanced detection of schema versions

3. **src/app/dashboard/extension-policy/page.tsx**
   - Updated all references to policy fields
   - Updated checkbox IDs and labels for clarity
   - Maintained the same UI structure and functionality

## Benefits of the New Schema

1. **Consistency**: Same property names across all action types
2. **Simplicity**: Easier to understand what each property does
3. **Maintainability**: Simpler code for handling policy updates
4. **Extensibility**: Easier to add new action types in the future
5. **Readability**: More intuitive property names

## Backward Compatibility

The system now supports multiple schema versions:

1. Legacy schema (pre-actions)
2. Intermediate schema with old property names
3. New schema with standardized property names

All policies are automatically converted to the new format when read and saved in the new format.
