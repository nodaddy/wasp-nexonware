# Data Archiving Configuration

This document describes how to configure the data archiving scheduler in the application.

## Environment Variables

Add the following variables to your `.env` file to configure the data archiving process:

```
# Data Archiving Configuration
# Interval in minutes between data archiving runs (default: 60 minutes)
# Examples:
# 1    - Every minute
# 5    - Every 5 minutes
# 60   - Every hour
# 360  - Every 6 hours
# 720  - Every 12 hours
# 1440 - Every day (24 hours)
DATA_ARCHIVING_INTERVAL_MINUTES=60

# Timezone for the scheduler (default: UTC)
DATA_ARCHIVING_TIMEZONE="UTC"

# Whether to run the archiving process when the scheduler starts (default: true)
DATA_ARCHIVING_RUN_ON_INIT=true

# Default days to keep data before archiving (default: 90)
DATA_ARCHIVING_DAYS_TO_KEEP=90

# Secret key for API authentication
ARCHIVING_SECRET_KEY=your-secret-key
```

## Interval Examples

The `DATA_ARCHIVING_INTERVAL_MINUTES` variable is a simple number representing the interval in minutes between each run of the data archiving process:

- `1` - Run every minute
- `5` - Run every 5 minutes
- `15` - Run every 15 minutes
- `30` - Run every 30 minutes
- `60` - Run every hour
- `120` - Run every 2 hours
- `360` - Run every 6 hours
- `720` - Run every 12 hours
- `1440` - Run every day (24 hours)

## Checking the Status

You can check the status of the data archiving scheduler by visiting:

```
/api/cron-status
```

This will show you:

- Whether the scheduler is initialized
- When it was initialized
- The current interval configuration
- When the next run will occur

## Manually Triggering the Process

You can manually trigger the data archiving process by sending a POST request to:

```
/api/init-server?key=your-secret-key
```

Replace `your-secret-key` with the value of `ARCHIVING_SECRET_KEY` from your environment variables.
