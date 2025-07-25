// Test Quality Dashboard - İ-EP.APP
// Enterprise-Grade Test Monitoring and Analytics

const fs = require('fs');
const path = require('path');

class TestQualityDashboard {
  constructor() {
    this.metricsPath = path.join(process.cwd(), 'test-results', 'quality-metrics.json');
    this.dashboardPath = path.join(process.cwd(), 'test-results', 'quality-dashboard.html');
    this.historicalData = this.loadHistoricalData();
  }

  loadHistoricalData() {
    try {
      if (fs.existsSync(this.metricsPath)) {
        return JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not load historical test data:', error.message);
    }
    return { runs: [], trends: {} };
  }

  recordTestRun(results) {
    const testRun = {
      timestamp: new Date().toISOString(),
      totalTests: results.numTotalTests || 0,
      passedTests: results.numPassedTests || 0,
      failedTests: results.numFailedTests || 0,
      pendingTests: results.numPendingTests || 0,
      successRate: results.numTotalTests > 0 ? 
        Math.round((results.numPassedTests / results.numTotalTests) * 100) : 100,
      duration: results.duration || 0,
      environment: process.env.NODE_ENV || 'test',
      gitCommit: process.env.GITHUB_SHA || 'local',
      branch: process.env.GITHUB_REF_NAME || 'local'
    };

    // Add to historical data
    this.historicalData.runs.push(testRun);
    
    // Keep only last 50 runs for performance
    if (this.historicalData.runs.length > 50) {
      this.historicalData.runs = this.historicalData.runs.slice(-50);
    }

    // Update trends
    this.updateTrends();
    
    // Save to file
    this.saveMetrics();
    
    return testRun;
  }

  updateTrends() {
    const runs = this.historicalData.runs;
    if (runs.length < 2) return;

    const recent = runs.slice(-10); // Last 10 runs
    const older = runs.slice(-20, -10); // Previous 10 runs

    this.historicalData.trends = {
      successRateTrend: this.calculateTrend(
        older.map(r => r.successRate),
        recent.map(r => r.successRate)
      ),
      durationTrend: this.calculateTrend(
        older.map(r => r.duration),
        recent.map(r => r.duration)
      ),
      testCountTrend: this.calculateTrend(
        older.map(r => r.totalTests),
        recent.map(r => r.totalTests)
      ),
      stability: this.calculateStability(recent)
    };
  }

  calculateTrend(oldValues, newValues) {
    if (oldValues.length === 0 || newValues.length === 0) return 'stable';
    
    const oldAvg = oldValues.reduce((a, b) => a + b, 0) / oldValues.length;
    const newAvg = newValues.reduce((a, b) => a + b, 0) / newValues.length;
    
    const change = ((newAvg - oldAvg) / oldAvg) * 100;
    
    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'improving' : 'declining';
  }

  calculateStability(runs) {
    if (runs.length < 3) return 'insufficient-data';
    
    const successRates = runs.map(r => r.successRate);
    const variance = this.calculateVariance(successRates);
    
    if (variance < 25) return 'excellent';
    if (variance < 100) return 'good';
    if (variance < 400) return 'moderate';
    return 'poor';
  }

  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  generateMetrics() {
    const runs = this.historicalData.runs;
    if (runs.length === 0) {
      return {
        totalRuns: 0,
        averageSuccessRate: 0,
        averageDuration: 0,
        trends: {},
        lastRun: null,
        recommendations: ['No test data available. Run tests to generate metrics.']
      };
    }

    const lastRun = runs[runs.length - 1];
    const last7Days = runs.filter(run => {
      const runDate = new Date(run.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return runDate > weekAgo;
    });

    return {
      totalRuns: runs.length,
      averageSuccessRate: Math.round(
        runs.reduce((sum, run) => sum + run.successRate, 0) / runs.length
      ),
      averageDuration: Math.round(
        runs.reduce((sum, run) => sum + run.duration, 0) / runs.length
      ),
      weeklyRuns: last7Days.length,
      trends: this.historicalData.trends,
      lastRun,
      recentPerformance: this.analyzeRecentPerformance(),
      recommendations: this.generateRecommendations()
    };
  }

  analyzeRecentPerformance() {
    const runs = this.historicalData.runs;
    if (runs.length < 5) return null;

    const recent5 = runs.slice(-5);
    const failureRate = recent5.filter(r => r.failedTests > 0).length / recent5.length;
    const avgDuration = recent5.reduce((sum, r) => sum + r.duration, 0) / recent5.length;
    
    return {
      failureRate: Math.round(failureRate * 100),
      averageDuration: Math.round(avgDuration),
      stability: this.calculateStability(recent5),
      successfulRuns: recent5.filter(r => r.failedTests === 0).length,
      totalRuns: recent5.length
    };
  }

  generateRecommendations() {
    const metrics = this.historicalData;
    const recommendations = [];

    if (metrics.runs.length === 0) {
      return ['Run tests to start collecting quality metrics.'];
    }

    const lastRun = metrics.runs[metrics.runs.length - 1];
    const trends = metrics.trends;

    // Success rate recommendations
    if (lastRun.successRate < 80) {
      recommendations.push('🚨 CRITICAL: Success rate below 80%. Investigate failing tests immediately.');
    } else if (lastRun.successRate < 95) {
      recommendations.push('⚠️ SUCCESS RATE: Below 95%. Review and fix failing tests.');
    } else {
      recommendations.push('✅ EXCELLENT: High success rate maintained.');
    }

    // Performance recommendations
    if (trends.durationTrend === 'declining') {
      recommendations.push('⏱️ PERFORMANCE: Test execution time increasing. Consider optimization.');
    } else if (trends.durationTrend === 'improving') {
      recommendations.push('🚀 PERFORMANCE: Test execution time improving. Great work!');
    }

    // Stability recommendations
    if (trends.stability === 'poor') {
      recommendations.push('📊 STABILITY: High variance in test results. Investigate flaky tests.');
    } else if (trends.stability === 'excellent') {
      recommendations.push('🎯 STABILITY: Excellent test consistency maintained.');
    }

    // Growth recommendations
    if (trends.testCountTrend === 'improving') {
      recommendations.push('📈 COVERAGE: Test suite growing. Ensure quality over quantity.');
    }

    return recommendations;
  }

  saveMetrics() {
    const dir = path.dirname(this.metricsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.metricsPath, JSON.stringify(this.historicalData, null, 2));
  }

  generateDashboard() {
    const metrics = this.generateMetrics();
    const html = this.generateDashboardHTML(metrics);
    
    const dir = path.dirname(this.dashboardPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.dashboardPath, html);
    return this.dashboardPath;
  }

  generateDashboardHTML(metrics) {
    const chartData = this.historicalData.runs.slice(-20).map(run => ({
      date: new Date(run.timestamp).toLocaleDateString('tr-TR'),
      successRate: run.successRate,
      duration: run.duration
    }));

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>İ-EP.APP - Test Quality Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
            background: #f8fafc; 
            color: #1e293b; 
            line-height: 1.6;
        }
        .header { 
            background: linear-gradient(135deg, #0f766e 0%, #059669 100%); 
            color: white; 
            padding: 2rem; 
            text-align: center;
        }
        .header h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        .header p { opacity: 0.9; font-size: 1.1rem; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .grid { display: grid; gap: 1.5rem; }
        .grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
        .grid-4 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
        .card { 
            background: white; 
            border-radius: 12px; 
            padding: 1.5rem; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
            border: 1px solid #e2e8f0;
        }
        .metric-card { text-align: center; }
        .metric-value { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        .metric-label { color: #64748b; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .trend { 
            display: inline-flex; 
            align-items: center; 
            gap: 0.25rem; 
            margin-top: 0.5rem; 
            font-size: 0.875rem; 
            font-weight: 500;
        }
        .trend.improving { color: #059669; }
        .trend.declining { color: #dc2626; }
        .trend.stable { color: #64748b; }
        .success { color: #059669; }
        .warning { color: #d97706; }
        .danger { color: #dc2626; }
        .chart-container { height: 300px; position: relative; }
        .recommendations { background: #f1f5f9; border-left: 4px solid #0ea5e9; }
        .recommendations h3 { color: #0f172a; margin-bottom: 1rem; }
        .recommendations ul { list-style: none; }
        .recommendations li { 
            padding: 0.5rem 0; 
            border-bottom: 1px solid #e2e8f0; 
        }
        .recommendations li:last-child { border-bottom: none; }
        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .status-excellent { background: #d1fae5; color: #065f46; }
        .status-good { background: #fef3c7; color: #92400e; }
        .status-poor { background: #fecaca; color: #991b1b; }
        .footer { text-align: center; margin-top: 2rem; color: #64748b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Test Quality Dashboard</h1>
        <p>İ-EP.APP - Comprehensive Test Monitoring & Analytics</p>
    </div>

    <div class="container">
        <div class="grid grid-4" style="margin-bottom: 2rem;">
            <div class="card metric-card">
                <div class="metric-value ${metrics.averageSuccessRate >= 95 ? 'success' : metrics.averageSuccessRate >= 80 ? 'warning' : 'danger'}">
                    ${metrics.averageSuccessRate}%
                </div>
                <div class="metric-label">Average Success Rate</div>
                ${metrics.trends.successRateTrend ? `
                <div class="trend ${metrics.trends.successRateTrend}">
                    ${metrics.trends.successRateTrend === 'improving' ? '📈' : 
                      metrics.trends.successRateTrend === 'declining' ? '📉' : '➡️'} 
                    ${metrics.trends.successRateTrend}
                </div>` : ''}
            </div>

            <div class="card metric-card">
                <div class="metric-value">${metrics.totalRuns}</div>
                <div class="metric-label">Total Test Runs</div>
                <div class="metric-label" style="margin-top: 0.5rem;">${metrics.weeklyRuns} this week</div>
            </div>

            <div class="card metric-card">
                <div class="metric-value">${Math.round(metrics.averageDuration / 1000 * 100) / 100}s</div>
                <div class="metric-label">Average Duration</div>
                ${metrics.trends.durationTrend ? `
                <div class="trend ${metrics.trends.durationTrend === 'improving' ? 'success' : metrics.trends.durationTrend === 'declining' ? 'danger' : 'stable'}">
                    ${metrics.trends.durationTrend === 'improving' ? '⚡' : 
                      metrics.trends.durationTrend === 'declining' ? '🐌' : '➡️'} 
                    ${metrics.trends.durationTrend}
                </div>` : ''}
            </div>

            <div class="card metric-card">
                <div class="metric-value">
                    <span class="status-badge ${
                      metrics.trends.stability === 'excellent' ? 'status-excellent' :
                      metrics.trends.stability === 'good' ? 'status-good' : 'status-poor'
                    }">
                        ${metrics.trends.stability || 'Calculating...'}
                    </span>
                </div>
                <div class="metric-label">Test Stability</div>
            </div>
        </div>

        <div class="grid grid-2">
            <div class="card">
                <h3 style="margin-bottom: 1rem;">📈 Success Rate Trend</h3>
                <div class="chart-container">
                    <canvas id="successChart"></canvas>
                </div>
            </div>

            <div class="card">
                <h3 style="margin-bottom: 1rem;">⏱️ Duration Trend</h3>
                <div class="chart-container">
                    <canvas id="durationChart"></canvas>
                </div>
            </div>
        </div>

        ${metrics.lastRun ? `
        <div class="card" style="margin-top: 1.5rem;">
            <h3 style="margin-bottom: 1rem;">🏃‍♂️ Last Test Run</h3>
            <div class="grid grid-4">
                <div>
                    <strong>Timestamp:</strong><br>
                    ${new Date(metrics.lastRun.timestamp).toLocaleString('tr-TR')}
                </div>
                <div>
                    <strong>Tests:</strong><br>
                    ${metrics.lastRun.totalTests} total, ${metrics.lastRun.passedTests} passed, ${metrics.lastRun.failedTests} failed
                </div>
                <div>
                    <strong>Duration:</strong><br>
                    ${Math.round(metrics.lastRun.duration / 1000 * 100) / 100} seconds
                </div>
                <div>
                    <strong>Environment:</strong><br>
                    ${metrics.lastRun.environment} (${metrics.lastRun.branch})
                </div>
            </div>
        </div>` : ''}

        <div class="card recommendations" style="margin-top: 1.5rem;">
            <h3>💡 Quality Recommendations</h3>
            <ul>
                ${metrics.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>

    <div class="footer">
        <p>Generated at ${new Date().toLocaleString('tr-TR')} • İ-EP.APP Test Quality Monitoring</p>
    </div>

    <script>
        const chartData = ${JSON.stringify(chartData)};
        
        // Success Rate Chart
        new Chart(document.getElementById('successChart'), {
            type: 'line',
            data: {
                labels: chartData.map(d => d.date),
                datasets: [{
                    label: 'Success Rate (%)',
                    data: chartData.map(d => d.successRate),
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Duration Chart
        new Chart(document.getElementById('durationChart'), {
            type: 'line',
            data: {
                labels: chartData.map(d => d.date),
                datasets: [{
                    label: 'Duration (ms)',
                    data: chartData.map(d => d.duration),
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  // CLI usage
  static async generateReport() {
    const dashboard = new TestQualityDashboard();
    const dashboardPath = dashboard.generateDashboard();
    console.log(`\n📊 Test Quality Dashboard generated: ${dashboardPath}`);
    return dashboardPath;
  }
}

module.exports = TestQualityDashboard;

// CLI execution
if (require.main === module) {
  TestQualityDashboard.generateReport().catch(console.error);
}