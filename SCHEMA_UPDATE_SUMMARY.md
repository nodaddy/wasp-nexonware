# Extension Policy Schema Update Summary

## Overview

We've updated the extension policy schema to be more organized, scalable, and maintainable. The new schema uses a nested structure with consistent naming conventions and includes versioning to support future changes.

## Key Changes

### 1. Schema Structure

**Before:**

```json
{
  "paste": {
    "restrictPasting": false,
    "logPasteData": false,
    "blockSensitiveData": false,
    "exceptions": []
  },
  "upload": {
    "restrictUploads": false,
    "logUploadData": false,
    "scanForMalware": false,
    "exceptions": []
  },
  "download": {
    "restrictDownloads": false,
    "logDownloadData": false,
    "scanBeforeDownload": false,
    "exceptions": []
  },
  "formSubmission": {
    "restrictSubmissions": false,
    "logSubmissionData": false,
    "validateBeforeSubmit": false,
    "exceptions": []
  },
  "updatedAt": "timestamp",
  "updatedBy": "userId"
}
```

**After:**

```json
{
  "version": 1,
  "actions": {
    "paste": {
      "isRestricted": false,
      "isLogEnabled": false,
      "isSensitiveDataBlocked": false,
      "exceptions": []
    },
    "upload": {
      "isRestricted": false,
      "isLogEnabled": false,
      "isScanEnabled": false,
      "exceptions": []
    },
    "download": {
      "isRestricted": false,
      "isLogEnabled": false,
      "isScanEnabled": false,
      "exceptions": []
    },
    "formSubmission": {
      "isRestricted": false,
      "isLogEnabled": false,
      "isValidationEnabled": false,
      "exceptions": []
    }
  },
  "lastUpdated": {
    "seconds": 1741267862,
    "nanoseconds": 95000000
  },
  "updatedBy": "userId"
}
```

### 2. Exception Structure

**Before:**

```json
"exceptions": ["example.com", "trusted-site.com"]
```

**After:**

```json
"exceptions": [
  {
    "type": "domain",
    "description": "example.com"
  },
  {
    "type": "domain",
    "description": "trusted-site.com"
  }
]
```

### 3. Consistent Naming

- Changed `restrictPasting` to `isRestricted`
- Changed `logPasteData` to `isLogEnabled`
- Changed `blockSensitiveData` to `isSensitiveDataBlocked`
- Changed `scanForMalware` and `scanBeforeDownload` to `isScanEnabled`
- Changed `validateBeforeSubmit` to `isValidationEnabled`
- Changed `updatedAt` to `lastUpdated`

### 4. Added Versioning

Added a `version` field to support future schema changes and migrations.

## Files Updated

1. **src/types/policies.ts**

   - Updated the `ExtensionPolicy` interface
   - Created new interfaces for each action type
   - Added an `ExceptionItem` interface
   - Created a legacy interface for backward compatibility
   - Added a conversion function to migrate from legacy to new schema

2. **src/lib/policyService.ts**

   - Updated the `getExtensionPolicy` function to handle both new and legacy schemas
   - Updated the `saveExtensionPolicy` function to use the new schema

3. **src/hooks/useExtensionPolicy.ts**

   - Updated the hook to work with the nested structure
   - Modified the `updatePolicyField` and `updateExceptions` functions

4. **src/components/ui/DomainExceptions.tsx**

   - Updated to work with the new `ExceptionItem` structure
   - Changed props from `domains` to `exceptions`

5. **src/app/dashboard/extension-policy/page.tsx**
   - Updated all references to policy fields to use the new structure
   - Updated all checkbox components to use the new field names

## Backward Compatibility

The system now supports both the new schema and the legacy schema:

1. When reading policies, it detects which schema is being used
2. Legacy policies are automatically converted to the new format
3. All policies are saved in the new format

## Benefits of the New Schema

1. **Better Organization**: Related settings are grouped together under the `actions` object
2. **Consistent Naming**: All boolean flags follow the same naming convention
3. **More Flexible Exceptions**: The new exception structure allows for different types of exceptions
4. **Future-Proof**: The version field allows for easier schema migrations in the future
5. **Improved Readability**: The schema is more self-documenting with clearer field names
