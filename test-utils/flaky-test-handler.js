// Enterprise-Grade Flaky Test Management System
// İ-EP.APP - Professional Test Infrastructure

const fs = require('fs');
const path = require('path');

class FlakyTestHandler {
  constructor() {
    this.flakyTests = new Map();
    this.testResults = [];
    this.reportPath = path.join(process.cwd(), 'test-results', 'flaky-tests.json');
    this.thresholds = {
      success_rate: 0.8, // 80% success rate threshold
      max_retries: 3,
      quarantine_threshold: 0.5 // 50% success rate = quarantine
    };
    
    this.ensureReportDirectory();
  }

  ensureReportDirectory() {
    const dir = path.dirname(this.reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Record test execution result
  recordTestResult(testName, passed, duration, attempt = 1) {
    const result = {
      testName,
      passed,
      duration,
      attempt,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test'
    };

    this.testResults.push(result);

    // Update flaky test tracking
    if (!this.flakyTests.has(testName)) {
      this.flakyTests.set(testName, {
        totalRuns: 0,
        failures: 0,
        successRate: 1.0,
        averageDuration: 0,
        lastFailure: null,
        quarantined: false
      });
    }

    const stats = this.flakyTests.get(testName);
    stats.totalRuns++;
    
    if (!passed) {
      stats.failures++;
      stats.lastFailure = new Date().toISOString();
    }
    
    stats.successRate = (stats.totalRuns - stats.failures) / stats.totalRuns;
    stats.averageDuration = (stats.averageDuration + duration) / 2;
    
    // Auto-quarantine highly unreliable tests
    if (stats.successRate < this.thresholds.quarantine_threshold && stats.totalRuns >= 5) {
      stats.quarantined = true;
      this.reportQuarantinedTest(testName, stats);
    }

    this.flakyTests.set(testName, stats);
  }

  // Generate flaky test report
  generateReport() {
    const report = {
      generated: new Date().toISOString(),
      summary: {
        totalTests: this.flakyTests.size,
        flakyTests: Array.from(this.flakyTests.entries())
          .filter(([_, stats]) => stats.successRate < this.thresholds.success_rate).length,
        quarantinedTests: Array.from(this.flakyTests.entries())
          .filter(([_, stats]) => stats.quarantined).length
      },
      flakyTests: this.getFlakyTests(),
      recommendations: this.generateRecommendations()
    };

    // Write report to file
    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  getFlakyTests() {
    return Array.from(this.flakyTests.entries())
      .filter(([_, stats]) => stats.successRate < this.thresholds.success_rate)
      .map(([testName, stats]) => ({
        testName,
        successRate: Math.round(stats.successRate * 100),
        totalRuns: stats.totalRuns,
        failures: stats.failures,
        averageDuration: Math.round(stats.averageDuration),
        lastFailure: stats.lastFailure,
        quarantined: stats.quarantined,
        severity: this.calculateSeverity(stats)
      }))
      .sort((a, b) => a.successRate - b.successRate);
  }

  calculateSeverity(stats) {
    if (stats.quarantined) return 'CRITICAL';
    if (stats.successRate < 0.5) return 'HIGH';
    if (stats.successRate < 0.7) return 'MEDIUM';
    return 'LOW';
  }

  generateRecommendations() {
    const flakyTests = this.getFlakyTests();
    const recommendations = [];

    if (flakyTests.length === 0) {
      recommendations.push({
        type: 'SUCCESS',
        message: '🎉 No flaky tests detected! Excellent test stability.'
      });
    } else {
      recommendations.push({
        type: 'ACTION_REQUIRED',
        message: `⚠️ ${flakyTests.length} flaky tests detected requiring attention.`
      });

      // Specific recommendations
      const criticalTests = flakyTests.filter(t => t.severity === 'CRITICAL');
      if (criticalTests.length > 0) {
        recommendations.push({
          type: 'CRITICAL',
          message: `🚨 ${criticalTests.length} tests are quarantined. Immediate investigation required.`,
          tests: criticalTests.map(t => t.testName)
        });
      }

      const slowTests = flakyTests.filter(t => t.averageDuration > 5000);
      if (slowTests.length > 0) {
        recommendations.push({
          type: 'PERFORMANCE',
          message: `⏱️ ${slowTests.length} tests are running slow (>5s). Consider optimization.`,
          tests: slowTests.map(t => `${t.testName} (${t.averageDuration}ms)`)
        });
      }
    }

    return recommendations;
  }

  reportQuarantinedTest(testName, stats) {
    console.warn(`
🚨 TEST QUARANTINED: ${testName}
- Success Rate: ${Math.round(stats.successRate * 100)}%
- Total Runs: ${stats.totalRuns}
- Failures: ${stats.failures}
- Last Failure: ${stats.lastFailure}

RECOMMENDATION: Investigate and fix before re-enabling.
    `);
  }

  // Jest setup integration
  setupJestHooks() {
    // Global test result handler
    global.afterEach = (originalAfterEach => {
      return function(fn) {
        return originalAfterEach.call(this, () => {
          // Extract test information
          const testName = expect.getState().currentTestName;
          const testState = expect.getState();
          
          if (testName) {
            const passed = !testState.isExpectingAssertions || testState.assertionCalls === testState.expectedAssertionsNumber;
            const startTime = this.startTime || Date.now();
            const duration = Date.now() - startTime;
            
            // Record test result
            global.flakyTestHandler?.recordTestResult(testName, passed, duration);
          }
          
          if (fn) fn();
        });
      };
    })(global.afterEach || (() => {}));
  }
}

// Global instance
global.flakyTestHandler = new FlakyTestHandler();

// Jest setup
if (typeof jest !== 'undefined') {
  global.flakyTestHandler.setupJestHooks();
}

module.exports = FlakyTestHandler;