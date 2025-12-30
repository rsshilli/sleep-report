# Sleep Records Analysis

This project analyzes CPAP sleep data and generates a comprehensive HTML report with visualizations and statistics.

## View Report

📊 **[View Sleep Analysis Report](https://rsshilli.github.io/sleep-report/sleep-report.html)**

## Overview

The analysis includes:
- Average sleep hours by day of the week
- Standard deviation error bars showing sleep variability
- Overall statistics (average, standard deviation, min/max)
- Detailed breakdown of sleep patterns for each day
- Interactive chart with tooltips

## Usage

To regenerate the sleep report:

```bash
npm run analyze
```

Or:

```bash
node analyzeSleep.js
```

This will:
1. Read all sleep data from the JSON files (sleep-09.json, sleep-10.json, sleep-11.json, sleep-12.json)
2. Filter out invalid records (values less than 2 hours indicate machine malfunction)
3. Calculate statistics for each day of the week
4. Generate `sleep-report.html` with interactive charts

## Data Source

Sleep data is exported from CPAP machine records in JSON format, containing:
- Date of sleep session
- Total usage time in minutes
- Sleep scores and metrics

## Dependencies

- `dayjs` - Date manipulation library
- Chart.js - Charting library (loaded via CDN in generated HTML)
- chartjs-chart-error-bars - Error bars plugin (loaded via CDN in generated HTML)

