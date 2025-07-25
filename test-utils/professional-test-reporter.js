// Professional Test Reporter for İ-EP.APP
// Enterprise-Grade Test Result Reporting

const fs = require('fs');
const path = require('path');

class ProfessionalTestReporter {
  constructor(globalConfig, options = {}) {
    this.globalConfig = globalConfig;
    this.options = {
      outputPath: 'test-results/professional-report.html',
      pageTitle: 'İ-EP.APP - Professional Test Results',
      includeFailureMsg: true,
      includeSuiteFailure: true,
      theme: 'lightTheme',
      executionTimeWarningThreshold: 3000,
      ...options
    };
    this.testResults = [];
    this.startTime = Date.now();
  }

  onRunStart(results, options) {
    this.startTime = Date.now();
    console.log('\n🚀 İ-EP.APP Professional Test Suite Starting...\n');
  }

  onTestResult(test, testResult, aggregatedResult) {
    // Collect test results for reporting
    this.testResults.push({
      testFilePath: testResult.testFilePath,
      testResults: testResult.testResults,
      performanceInfo: testResult.performanceInfo,
      numFailingTests: testResult.numFailingTests,
      numPassingTests: testResult.numPassingTests,
      numPendingTests: testResult.numPendingTests,
      startTime: testResult.perfStats?.start,
      endTime: testResult.perfStats?.end
    });
  }

  onRunComplete(contexts, results) {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    try {
      this.generateProfessionalReport(results, duration);
      console.log(`\n✅ Professional test report generated: ${this.options.outputPath}`);
    } catch (error) {
      console.warn(`⚠️ Professional report generation failed: ${error.message}`);
      // Fallback to simple text report
      this.generateFallbackReport(results, duration);
    }
  }

  generateProfessionalReport(results, duration) {
    const reportData = this.prepareReportData(results, duration);
    const htmlContent = this.generateHTMLReport(reportData);
    
    // Ensure directory exists
    const dir = path.dirname(this.options.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.options.outputPath, htmlContent);
  }

  prepareReportData(results, duration) {
    const slowTests = this.testResults
      .flatMap(suite => suite.testResults)
      .filter(test => (test.duration || 0) > this.options.executionTimeWarningThreshold)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));

    const failedTests = this.testResults
      .flatMap(suite => suite.testResults)
      .filter(test => test.status === 'failed');

    return {
      summary: {
        total: results.numTotalTests,
        passed: results.numPassedTests,
        failed: results.numFailedTests,
        pending: results.numPendingTests,
        duration: Math.round(duration / 1000 * 100) / 100,
        successRate: Math.round((results.numPassedTests / results.numTotalTests) * 100)
      },
      performance: {
        slowTests: slowTests.slice(0, 10), // Top 10 slowest
        averageTestTime: this.calculateAverageTestTime(),
        totalSuites: this.testResults.length
      },
      quality: {
        flakyTests: [], // Will be populated by flaky test handler
        coverageThreshold: this.globalConfig.coverageThreshold || {},
        testStability: this.calculateTestStability()
      },
      failedTests: failedTests.slice(0, 20), // Top 20 failures
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test'
    };
  }

  calculateAverageTestTime() {
    const allTests = this.testResults.flatMap(suite => suite.testResults);
    const totalDuration = allTests.reduce((sum, test) => sum + (test.duration || 0), 0);
    return allTests.length > 0 ? Math.round(totalDuration / allTests.length) : 0;
  }

  calculateTestStability() {
    const total = this.testResults.flatMap(suite => suite.testResults).length;
    const failed = this.testResults.flatMap(suite => suite.testResults).filter(t => t.status === 'failed').length;
    return total > 0 ? Math.round(((total - failed) / total) * 100) : 100;
  }

  generateHTMLReport(data) {
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.options.pageTitle}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f7fa; 
            color: #2c3e50;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            border-radius: 10px; 
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .summary { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .metric-card { 
            background: white; 
            padding: 25px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            border-left: 4px solid #3498db;
        }
        .metric-card.success { border-left-color: #27ae60; }
        .metric-card.warning { border-left-color: #f39c12; }
        .metric-card.danger { border-left-color: #e74c3c; }
        .metric-number { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
        .metric-label { color: #7f8c8d; font-size: 0.9em; text-transform: uppercase; }
        .section { 
            background: white; 
            margin-bottom: 25px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .section-header { 
            background: #34495e; 
            color: white; 
            padding: 20px; 
            font-size: 1.2em; 
            font-weight: 600;
        }
        .section-content { padding: 25px; }
        .test-item { 
            padding: 15px; 
            border-bottom: 1px solid #ecf0f1; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
        }
        .test-item:last-child { border-bottom: none; }
        .test-name { font-weight: 500; }
        .test-duration { color: #7f8c8d; font-size: 0.9em; }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-success { background: #d5f4e6; color: #27ae60; }
        .status-failed { background: #fadbd8; color: #e74c3c; }
        .status-pending { background: #fef9e7; color: #f39c12; }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #7f8c8d; 
            font-size: 0.9em;
        }
        .progress-bar {
            height: 8px;
            background: #ecf0f1;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(45deg, #27ae60, #2ecc71);
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 ${this.options.pageTitle}</h1>
        <p>Comprehensive Test Quality Dashboard • Generated ${new Date().toLocaleString('tr-TR')}</p>
    </div>

    <div class="summary">
        <div class="metric-card ${data.summary.successRate >= 95 ? 'success' : data.summary.successRate >= 80 ? 'warning' : 'danger'}">
            <div class="metric-number">${data.summary.successRate}%</div>
            <div class="metric-label">Success Rate</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${data.summary.successRate}%"></div>
            </div>
        </div>
        <div class="metric-card success">
            <div class="metric-number">${data.summary.passed}</div>
            <div class="metric-label">Tests Passed</div>
        </div>
        <div class="metric-card ${data.summary.failed > 0 ? 'danger' : 'success'}">
            <div class="metric-number">${data.summary.failed}</div>
            <div class="metric-label">Tests Failed</div>
        </div>
        <div class="metric-card">
            <div class="metric-number">${data.summary.duration}s</div>
            <div class="metric-label">Execution Time</div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">📊 Performance Metrics</div>
        <div class="section-content">
            <p><strong>Total Test Suites:</strong> ${data.performance.totalSuites}</p>
            <p><strong>Average Test Duration:</strong> ${data.performance.averageTestTime}ms</p>
            <p><strong>Test Stability:</strong> ${data.quality.testStability}%</p>
            ${data.performance.slowTests.length > 0 ? `
            <h4>⏱️ Slowest Tests (Performance Optimization Targets)</h4>
            ${data.performance.slowTests.map(test => `
                <div class="test-item">
                    <span class="test-name">${test.fullName || test.title}</span>
                    <span class="test-duration">${test.duration || 0}ms</span>
                </div>
            `).join('')}
            ` : '<p>✅ No slow tests detected (all tests < 3s)</p>'}
        </div>
    </div>

    ${data.failedTests.length > 0 ? `
    <div class="section">
        <div class="section-header">🚨 Failed Tests Analysis</div>
        <div class="section-content">
            ${data.failedTests.map(test => `
                <div class="test-item">
                    <div>
                        <div class="test-name">${test.fullName || test.title}</div>
                        ${this.options.includeFailureMsg && test.failureMessages ? 
                          `<div style="color: #e74c3c; font-size: 0.9em; margin-top: 5px;">
                             ${test.failureMessages[0]?.split('\\n')[0] || 'Test failed'}
                           </div>` : ''}
                    </div>
                    <span class="status-badge status-failed">Failed</span>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-header">🎯 Quality Recommendations</div>
        <div class="section-content">
            ${data.summary.successRate >= 95 ? 
              '<p>🎉 <strong>Excellent test quality!</strong> Your test suite is highly reliable with 95%+ success rate.</p>' :
              data.summary.successRate >= 80 ?
              '<p>⚠️ <strong>Good test quality</strong> but room for improvement. Consider investigating failed tests.</p>' :
              '<p>🚨 <strong>Critical test quality issues.</strong> Immediate attention required for failed tests.</p>'
            }
            ${data.performance.slowTests.length > 0 ? 
              `<p>⏱️ Consider optimizing ${data.performance.slowTests.length} slow tests for better developer experience.</p>` : 
              '<p>✅ All tests execute efficiently (< 3 seconds).</p>'
            }
            <p>📈 <strong>Next Steps:</strong> Monitor test stability trends and address any flaky test patterns.</p>
        </div>
    </div>

    <div class="footer">
        <p>Generated by İ-EP.APP Professional Test Infrastructure • Environment: ${data.environment}</p>
        <p>Execution completed at ${data.timestamp}</p>
    </div>
</body>
</html>`;
  }

  generateFallbackReport(results, duration) {
    const fallbackContent = `
# İ-EP.APP Test Results

Generated: ${new Date().toISOString()}

## Summary
- Total Tests: ${results.numTotalTests}
- Passed: ${results.numPassedTests}
- Failed: ${results.numFailedTests}
- Duration: ${Math.round(duration / 1000 * 100) / 100}s
- Success Rate: ${Math.round((results.numPassedTests / results.numTotalTests) * 100)}%

## Status
${results.success ? '✅ All tests passed!' : '❌ Some tests failed. Review failures above.'}
`;

    const fallbackPath = this.options.outputPath.replace('.html', '.txt');
    fs.writeFileSync(fallbackPath, fallbackContent);
    console.log(`📄 Fallback report generated: ${fallbackPath}`);
  }
}

module.exports = ProfessionalTestReporter;