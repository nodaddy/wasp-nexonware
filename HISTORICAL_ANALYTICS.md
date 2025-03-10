# Historical Analytics

This feature provides access to historical data that has been archived from the Firebase Realtime Database to BigQuery. It allows users to view and analyze data that is no longer in the real-time database but has been preserved for long-term storage and analysis.

## Overview

The Historical Analytics page displays data that has been archived from the Firebase Realtime Database to BigQuery through the data archiving process. This provides several benefits:

1. **Long-term data retention**: Access data beyond what is kept in the real-time database
2. **Performance optimization**: Keep the real-time database lean while preserving historical data
3. **Advanced analytics**: Leverage BigQuery's powerful analytical capabilities for historical data

## Implementation Details

### Components

1. **API Endpoint**: `/api/analytics/historical`

   - Fetches data from BigQuery
   - Supports filtering by metrics type
   - Implements pagination

2. **Historical Analytics Page**: `/historical-analytics`
   - Displays archived data in a simple table format
   - Allows filtering by metrics type
   - Shows the most recent data first

### Data Flow

1. Data is collected in Firebase Realtime Database
2. The data archiving process runs on a scheduled basis (configurable interval)
3. Data older than the retention period is copied to BigQuery
4. The copied data is then deleted from Firebase Realtime Database
5. The Historical Analytics page queries this archived data from BigQuery

## Usage

To access the Historical Analytics page:

1. Log in to the application
2. Click on "Historical Analytics" in the navigation menu
3. Use the filter dropdown to select a specific metrics type (optional)
4. View the data in the table

## Security

The Historical Analytics feature implements the following security measures:

1. **Authentication**: Only authenticated users can access the page
2. **Authorization**: The API endpoint verifies the user's Firebase token
3. **Role-based access**: Both admin and analyst roles can access this feature

## Troubleshooting

### Common Issues

1. **"Unable to detect a Project Id in the current environment"**

   - **Cause**: The BigQuery client can't find the Google Cloud Project ID
   - **Solution**: Ensure the `FIREBASE_ADMIN_PROJECT_ID` environment variable is set correctly in your `.env` file

2. **BigQuery Authentication Errors**

   - **Cause**: Missing or invalid credentials for BigQuery
   - **Solution**: Verify that `FIREBASE_ADMIN_CLIENT_EMAIL` and `FIREBASE_ADMIN_PRIVATE_KEY` are correctly set in your `.env` file

3. **"No data found" message**

   - **Cause**: Either no data has been archived yet, or the BigQuery table doesn't exist
   - **Solution**: Check that the data archiving process has run successfully and that data exists in the BigQuery table

4. **Permission Errors**
   - **Cause**: The service account doesn't have permission to access BigQuery
   - **Solution**: Ensure the service account has the necessary BigQuery permissions (BigQuery Data Viewer at minimum)

### Required Environment Variables

For the Historical Analytics feature to work properly, the following environment variables must be set:

```
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"
```

## Future Enhancements

Potential future enhancements for the Historical Analytics feature:

1. Advanced filtering and search capabilities
2. Data visualization with charts and graphs
3. Export functionality (CSV, Excel, etc.)
4. Custom date range selection
5. Detailed view for individual records
