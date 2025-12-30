const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

// Read all sleep JSON files
const sleepFiles = ['sleep-09.json', 'sleep-10.json', 'sleep-11.json', 'sleep-12.json'];

// Store sleep data by day of week
const sleepByDayOfWeek = {
  0: [], // Sunday
  1: [], // Monday
  2: [], // Tuesday
  3: [], // Wednesday
  4: [], // Thursday
  5: [], // Friday
  6: []  // Saturday
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Read and process all sleep records
sleepFiles.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
  const sleepRecords = data.data.getPatientWrapper.sleepRecords.items;

  sleepRecords.forEach(record => {
    const date = dayjs(record.startDate);
    const dayOfWeek = date.day();
    const hoursSlept = record.totalUsage / 60; // Convert minutes to hours

    // Only include non-zero values (zero means machine wasn't working)
    if (hoursSlept > 2) {
      sleepByDayOfWeek[dayOfWeek].push(hoursSlept);
    }
  });
});

// Calculate statistics for each day of week
const statistics = {};
dayNames.forEach((dayName, index) => {
  const hours = sleepByDayOfWeek[index];

  if (hours.length === 0) {
    statistics[dayName] = {
      count: 0,
      average: 0,
      stdDev: 0,
      min: 0,
      max: 0
    };
    return;
  }

  const average = hours.reduce((sum, h) => sum + h, 0) / hours.length;
  const variance = hours.reduce((sum, h) => sum + Math.pow(h - average, 2), 0) / hours.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...hours);
  const max = Math.max(...hours);

  statistics[dayName] = {
    count: hours.length,
    average: average,
    stdDev: stdDev,
    min: min,
    max: max
  };
});

// Calculate overall statistics
const allHours = Object.values(sleepByDayOfWeek).flat();
const overallAverage = allHours.reduce((sum, h) => sum + h, 0) / allHours.length;
const overallVariance = allHours.reduce((sum, h) => sum + Math.pow(h - overallAverage, 2), 0) / allHours.length;
const overallStdDev = Math.sqrt(overallVariance);
const overallMin = Math.min(...allHours);
const overallMax = Math.max(...allHours);

// Prepare data for Chart.js
const chartLabels = dayNames;
const chartData = dayNames.map((_, index) => {
  const hours = sleepByDayOfWeek[index];
  return hours.length > 0 ? hours.reduce((sum, h) => sum + h, 0) / hours.length : 0;
});
const chartStdDev = dayNames.map((dayName) => statistics[dayName].stdDev);

// Generate HTML with Chart.js
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ryan's Sleep Analysis Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-chart-error-bars@4.4.5/build/index.umd.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        .chart-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .stats-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #4CAF50;
        }
        .stat-label {
            font-size: 0.85em;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .stat-value {
            font-size: 1.5em;
            color: #333;
            font-weight: bold;
            margin-top: 5px;
        }
        .day-stats-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .day-stats-table th,
        .day-stats-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .day-stats-table th {
            background-color: #4CAF50;
            color: white;
            font-weight: 600;
        }
        .day-stats-table tr:hover {
            background-color: #f5f5f5;
        }
        .day-stats-table td:not(:first-child) {
            text-align: center;
        }
        h2 {
            color: #333;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <h1>💤 Ryan's Sleep Analysis Report</h1>
    <p class="subtitle">Analysis of ${allHours.length} nights of sleep across September-December 2025</p>
    
    <div class="stats-container">
        <h2>Overall Statistics</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Nights</div>
                <div class="stat-value">${allHours.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Average Sleep</div>
                <div class="stat-value">${overallAverage.toFixed(2)} hrs</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Standard Deviation</div>
                <div class="stat-value">${overallStdDev.toFixed(2)} hrs</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Min Sleep</div>
                <div class="stat-value">${overallMin.toFixed(2)} hrs</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Max Sleep</div>
                <div class="stat-value">${overallMax.toFixed(2)} hrs</div>
            </div>
        </div>
    </div>

    <div class="chart-container">
        <h2>Average Sleep by Day of Week</h2>
        <canvas id="sleepChart"></canvas>
    </div>

    <div class="stats-container">
        <h2>Detailed Statistics by Day of Week</h2>
        <table class="day-stats-table">
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Count</th>
                    <th>Average</th>
                    <th>Std Dev</th>
                    <th>Min</th>
                    <th>Max</th>
                </tr>
            </thead>
            <tbody>
                ${dayNames.map(day => `
                <tr>
                    <td><strong>${day}</strong></td>
                    <td>${statistics[day].count}</td>
                    <td>${statistics[day].average.toFixed(2)} hrs</td>
                    <td>${statistics[day].stdDev.toFixed(2)} hrs</td>
                    <td>${statistics[day].min.toFixed(2)} hrs</td>
                    <td>${statistics[day].max.toFixed(2)} hrs</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <script>
        // Register the error bars plugin
        Chart.register(ChartErrorBars.BarWithErrorBarsController, ChartErrorBars.BarWithErrorBar);
        
        const ctx = document.getElementById('sleepChart').getContext('2d');
        
        // Data arrays
        const averages = ${JSON.stringify(chartData)};
        const stdDevs = ${JSON.stringify(chartStdDev)};
        
        // Format data with error bars
        const chartData = averages.map((avg, i) => ({
            y: avg,
            yMin: avg - stdDevs[i],
            yMax: avg + stdDevs[i]
        }));
        
        const sleepChart = new Chart(ctx, {
            type: ChartErrorBars.BarWithErrorBarsController.id,
            data: {
                labels: ${JSON.stringify(chartLabels)},
                datasets: [{
                    label: 'Average Sleep Hours',
                    data: chartData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(199, 199, 199, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const stdDev = stdDevs[context.dataIndex];
                                const avg = averages[context.dataIndex];
                                return [
                                    'Average: ' + avg.toFixed(2) + ' hours',
                                    'Std Dev: ±' + stdDev.toFixed(2) + ' hours',
                                    'Range: ' + (avg - stdDev).toFixed(2) + ' - ' + (avg + stdDev).toFixed(2) + ' hrs'
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours of Sleep',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + ' hrs';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Day of Week',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;

// Write the HTML file
fs.writeFileSync(path.join(__dirname, 'sleep-report.html'), html);

console.log('✅ Sleep analysis complete!');
console.log(`📊 Report generated: sleep-report.html`);
console.log(`\nOverall Statistics:`);
console.log(`  Total nights: ${allHours.length}`);
console.log(`  Average sleep: ${overallAverage.toFixed(2)} hours`);
console.log(`  Standard deviation: ${overallStdDev.toFixed(2)} hours`);
console.log(`  Range: ${overallMin.toFixed(2)} - ${overallMax.toFixed(2)} hours`);
console.log(`\nAverage sleep by day of week:`);
dayNames.forEach((day, index) => {
  const avg = sleepByDayOfWeek[index].length > 0
    ? sleepByDayOfWeek[index].reduce((sum, h) => sum + h, 0) / sleepByDayOfWeek[index].length
    : 0;
  console.log(`  ${day}: ${avg.toFixed(2)} hours (${sleepByDayOfWeek[index].length} nights)`);
});

