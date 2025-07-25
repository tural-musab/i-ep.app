#!/usr/bin/env node

/**
 * API Integration Testing Script
 * İ-EP.APP - Frontend-Backend Integration Validation
 *
 * Bu script tüm API endpoint'leri test eder ve sonuçları raporlar
 * Usage: node scripts/test-api-integration.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 İ-EP.APP API Integration Testing');
console.log('='.repeat(50));

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 3,
  endpoints: [
    // User Management APIs
    { path: '/api/students', method: 'GET', auth: true },
    { path: '/api/teachers', method: 'GET', auth: true },
    { path: '/api/classes', method: 'GET', auth: true },

    // Assignment System APIs
    { path: '/api/assignments', method: 'GET', auth: true },
    { path: '/api/assignments', method: 'POST', auth: true },
    { path: '/api/assignments/test-id', method: 'GET', auth: true },

    // Attendance System APIs
    { path: '/api/attendance', method: 'GET', auth: true },
    { path: '/api/attendance', method: 'POST', auth: true },
    { path: '/api/attendance/reports', method: 'GET', auth: true },

    // Grade System APIs
    { path: '/api/grades', method: 'GET', auth: true },
    { path: '/api/grades', method: 'POST', auth: true },
    { path: '/api/grades/analytics', method: 'GET', auth: true },

    // Parent Communication APIs
    { path: '/api/parent-communication/messages', method: 'GET', auth: true },

    // System APIs
    { path: '/api/health', method: 'GET', auth: false },
  ],
};

async function testEndpoint(endpoint) {
  const url = `${TEST_CONFIG.baseUrl}${endpoint.path}`;
  const startTime = Date.now();

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        ...(endpoint.auth && { Authorization: 'Bearer mock-token' }),
      },
      timeout: TEST_CONFIG.timeout,
    });

    const responseTime = Date.now() - startTime;
    const status = response.status;

    let data;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    return {
      endpoint: endpoint.path,
      method: endpoint.method,
      status: response.ok ? 'PASSED' : 'FAILED',
      statusCode: status,
      responseTime: responseTime,
      data: response.ok ? 'OK' : data,
      error: response.ok ? null : `HTTP ${status}`,
    };
  } catch (error) {
    return {
      endpoint: endpoint.path,
      method: endpoint.method,
      status: 'FAILED',
      statusCode: 0,
      responseTime: Date.now() - startTime,
      data: null,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log(`📍 Testing ${TEST_CONFIG.endpoints.length} API endpoints`);
  console.log(`🌐 Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`⏱️  Timeout: ${TEST_CONFIG.timeout}ms\n`);

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const endpoint of TEST_CONFIG.endpoints) {
    process.stdout.write(`Testing ${endpoint.method} ${endpoint.path} ... `);

    const result = await testEndpoint(endpoint);
    results.push(result);

    if (result.status === 'PASSED') {
      console.log(`✅ PASSED (${result.responseTime}ms)`);
      passed++;
    } else {
      console.log(`❌ FAILED (${result.error})`);
      failed++;
    }
  }

  // Generate summary
  const total = results.length;
  const coverage = Math.round((passed / total) * 100);
  const avgResponseTime = Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / total);

  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Endpoints: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Coverage: ${coverage}%`);
  console.log(`⚡ Avg Response Time: ${avgResponseTime}ms`);

  // Show failed endpoints
  const failedEndpoints = results.filter((r) => r.status === 'FAILED');
  if (failedEndpoints.length > 0) {
    console.log('\n🔍 FAILED ENDPOINTS:');
    failedEndpoints.forEach((endpoint) => {
      console.log(`❌ ${endpoint.method} ${endpoint.endpoint}: ${endpoint.error}`);
    });
  }

  // Generate report file
  const reportPath = path.join(__dirname, '..', 'API_INTEGRATION_TEST_REPORT.md');
  const timestamp = new Date().toISOString();

  const report = `# API Integration Test Report
Generated: ${timestamp}

## Summary
- Total Endpoints: ${total}
- Passed: ${passed}
- Failed: ${failed}
- Coverage: ${coverage}%
- Average Response Time: ${avgResponseTime}ms

## Test Results

### Passed Endpoints (${passed})
${results
  .filter((r) => r.status === 'PASSED')
  .map((r) => `- ✅ ${r.method} ${r.endpoint} (${r.responseTime}ms)`)
  .join('\n')}

### Failed Endpoints (${failed})
${results
  .filter((r) => r.status === 'FAILED')
  .map((r) => `- ❌ ${r.method} ${r.endpoint}: ${r.error}`)
  .join('\n')}

## Authentication Status
- Endpoints requiring auth: ${TEST_CONFIG.endpoints.filter((e) => e.auth).length}
- Public endpoints: ${TEST_CONFIG.endpoints.filter((e) => !e.auth).length}

## Performance Analysis
- Fastest endpoint: ${results.reduce((min, curr) => (curr.responseTime < min.responseTime ? curr : min)).endpoint} (${results.reduce((min, curr) => (curr.responseTime < min.responseTime ? curr : min)).responseTime}ms)
- Slowest endpoint: ${results.reduce((max, curr) => (curr.responseTime > max.responseTime ? curr : max)).endpoint} (${results.reduce((max, curr) => (curr.responseTime > max.responseTime ? curr : max)).responseTime}ms)

## Test Configuration
- Base URL: ${TEST_CONFIG.baseUrl}
- Timeout: ${TEST_CONFIG.timeout}ms
- Total Tests: ${total}
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Report saved to: ${reportPath}`);

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

// Check if development server is running
async function checkServer() {
  try {
    const fetch = (await import('node-fetch')).default;
    await fetch(`${TEST_CONFIG.baseUrl}/api/health`);
    return true;
  } catch {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking if development server is running...');

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('⚠️  Development server is not running');
    console.log('💡 Please start the server first: npm run dev');
    console.log('⏳ Waiting for server to start...');

    // Wait a bit and try again
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const serverRunning2 = await checkServer();

    if (!serverRunning2) {
      console.log('❌ Server is still not running. Exiting...');
      process.exit(1);
    }
  }

  console.log('✅ Development server is running');
  console.log('🚀 Starting API integration tests...\n');

  await runTests();
}

main().catch(console.error);
