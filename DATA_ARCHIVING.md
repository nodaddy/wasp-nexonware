# Firebase to BigQuery Data Archiving

This document outlines the implementation of a data archiving solution that moves data from Firebase Realtime Database to Google BigQuery for long-term storage and analytics.

## Overview

As your Firebase Realtime Database grows, it can become costly and less performant. This solution allows you to:

1. Automatically archive older data to BigQuery
2. Reduce Firebase storage costs
3. Maintain access to historical data for analytics
4. Improve Firebase query performance

## Metrics Data Structure

This implementation is specifically designed to handle the following Firebase data structure:

```
metrics/$companyId/$uid/$metricsType/$timestamp
```

Where:

- `$companyId`: The ID of the company
- `$uid`: The user ID
- `$metricsType`: The type of metric being recorded
- `$timestamp`: The timestamp when the metric was recorded
- The data at this node contains JSON properties like value, count, duration, etc.

## Setup Instructions

### 1. Google Cloud Setup

1. Create a Google Cloud Project (or use your existing one)
2. Enable the BigQuery API
3. Create a service account with BigQuery Admin permissions
4. Generate and download a JSON key for the service account

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```
# Google Cloud BigQuery
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account-email
GOOGLE_CLOUD_PRIVATE_KEY="your-service-account-private-key"
BIGQUERY_DATASET_ID=firebase_archive

# Data Archiving
ARCHIVING_SECRET_KEY=your-secret-key-for-scheduled-archiving
```

### 3. Schema Configuration

The schema is configured to match your metrics data structure. Each property in your JSON data is mapped to a column in BigQuery:

```typescript
const SCHEMAS = {
  userMetrics: [
    { name: "_id", type: "STRING" },
    { name: "companyId", type: "STRING" },
    { name: "userId", type: "STRING" },
    { name: "metricsType", type: "STRING" },
    { name: "timestamp", type: "TIMESTAMP" },
    // Add columns for each property in your JSON data
    { name: "value", type: "FLOAT" },
    { name: "count", type: "INTEGER" },
    { name: "duration", type: "INTEGER" },
    { name: "status", type: "STRING" },
    { name: "category", type: "STRING" },
    { name: "tags", type: "STRING", mode: "REPEATED" },
    { name: "metadata", type: "STRING" }, // JSON string for complex nested data
  ],
};
```

You should customize this schema to match the exact properties in your metrics data.

### 4. Archiving Configuration

Configure the archiving settings in `src/app/api/data-archiving/scheduled/route.ts`:

```typescript
const ARCHIVING_CONFIGS = [
  {
    tableId: "user_metrics_archive",
    schemaType: "userMetrics",
    daysToKeep: 90, // Keep 3 months of data in Firebase
    deleteAfterArchive: true,
  },
];
```

## Usage

### Manual Archiving

Send a POST request to `/api/data-archiving` with:

```json
{
  "archiveType": "metrics",
  "tableId": "user_metrics_archive",
  "schemaType": "userMetrics",
  "daysToKeep": 90,
  "deleteAfterArchive": false
}
```

Include a Firebase ID token in the Authorization header:

```
Authorization: Bearer your-firebase-id-token
```

### Scheduled Archiving

Set up a cron job or scheduled task to call `/api/data-archiving/scheduled` with:

```
Authorization: Bearer your-archiving-secret-key
```

This will process all configured archiving tasks.

## Querying Archived Data

You can query your archived data using BigQuery's SQL interface:

```sql
SELECT * FROM `your-project.firebase_archive.user_metrics_archive`
WHERE timestamp > TIMESTAMP('2023-01-01')
AND companyId = 'your-company-id'
```

Example queries:

```sql
-- Get metrics by user
SELECT userId, metricsType, AVG(value) as avgValue
FROM `your-project.firebase_archive.user_metrics_archive`
WHERE companyId = 'company123'
GROUP BY userId, metricsType

-- Get metrics by time period
SELECT
  TIMESTAMP_TRUNC(timestamp, DAY) as day,
  metricsType,
  COUNT(*) as count,
  AVG(value) as avgValue
FROM `your-project.firebase_archive.user_metrics_archive`
WHERE timestamp BETWEEN TIMESTAMP('2023-01-01') AND TIMESTAMP('2023-12-31')
GROUP BY day, metricsType
ORDER BY day
```

## Monitoring

Monitor your archiving jobs by checking:

1. API response logs
2. BigQuery job history
3. Firebase Realtime Database size

## Troubleshooting

- Ensure your service account has proper permissions
- Verify your schema matches your data structure
- Check for errors in the API response
- Inspect server logs for detailed error messages
