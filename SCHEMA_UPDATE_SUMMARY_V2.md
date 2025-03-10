# Extension Policy Schema Update Summary (V2)

## Overview

We've updated the extension policy schema to use global blocklist and allowlist arrays instead of per-action exceptions. This change simplifies the schema and makes it more maintainable while providing a clearer separation between allowed and blocked domains.

## Key Changes

### 1. Schema Structure

**Before:**

```json
{
  "actions": {
    "paste": {
      "isRestricted": false,
      "isLogEnabled": false,
      "isSensitiveDataBlocked": false,
      "exceptions": [{ "type": "domain", "description": "example.com" }]
    },
    "upload": {
      "isRestricted": false,
      "isLogEnabled": false,
      "isScanEnabled": false,
      "exceptions": [{ "type": "domain", "description": "example.com" }]
    }
    // ... other actions with their own exceptions
  },
  "lastUpdated": {
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
  "blocklist": ["malicious-site.com"],
  "allowlist": ["trusted-site.com"],
  "updatedAt": {
    "seconds": 1741267862,
    "nanoseconds": 95000000
  },
  "updatedBy": "userId"
}
```

### 2. Field Naming Changes

- Reverted to original field names (e.g., `restrictPasting` instead of `isRestricted`)
- Changed `lastUpdated` to `updatedAt` to match the provided schema
- Removed the `version` field

### 3. Domain Exceptions

- Removed per-action exceptions and replaced with global `blocklist` and `allowlist` arrays
- Simplified domain storage to use simple strings instead of complex objects
- Created a dedicated "Domain Exceptions" section in the UI

## Files Updated

1. **src/types/policies.ts**

   - Updated the `ExtensionPolicy` interface
   - Removed `ExceptionItem` interface
   - Updated the default policy
   - Modified the conversion function to collect all exceptions into the allowlist

2. **src/lib/policyService.ts**

   - Updated to handle the new schema
   - Added support for migrating from both legacy and intermediate schemas
   - Changed timestamp field from `lastUpdated` to `updatedAt`

3. **src/hooks/useExtensionPolicy.ts**

   - Replaced `updateExceptions` with `updateAllowlist` and `updateBlocklist`
   - Updated the policy field update logic

4. **src/components/ui/DomainExceptions.tsx**

   - Simplified to work with string arrays instead of exception objects
   - Added a title prop for better UI customization

5. **src/app/dashboard/extension-policy/page.tsx**
   - Updated all references to policy fields
   - Consolidated domain exceptions into a dedicated section
   - Added separate UI for allowlist and blocklist

## Benefits of the New Schema

1. **Simplified Structure**: Removed nested exceptions from each action
2. **Clear Separation**: Distinct blocklist and allowlist for better policy control
3. **Reduced Redundancy**: No duplicate domains across different actions
4. **Improved UI**: Dedicated section for domain management
5. **Better Performance**: Simpler data structure means faster processing

## Backward Compatibility

The system now supports three schema versions:

1. Legacy schema (pre-actions)
2. Intermediate schema (with actions and per-action exceptions)
3. New schema (with actions, blocklist, and allowlist)

All policies are automatically converted to the new format when read and saved in the new format.
