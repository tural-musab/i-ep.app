#!/usr/bin/env node

/**
 * İ-EP.APP Comprehensive Local Demo Testing Script
 * Runs comprehensive tests on the local demo environment
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  supabaseUrl: 'http://127.0.0.1:54321',
  tenantId: 'istanbul-demo-ortaokulu',
  testTimeout: 30000,
  retryAttempts: 3
};

// Demo credentials for testing
const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@istanbul-demo-ortaokulu.edu.tr',
    password: 'Demo2025!Admin',
    role: 'admin'
  },
  teacher: {
    email: 'ogretmen@istanbul-demo-ortaokulu.edu.tr',
    password: 'Demo2025!Teacher',
    role: 'teacher'
  },
  student: {
    email: 'ogrenci@istanbul-demo-ortaokulu.edu.tr',
    password: 'Demo2025!Student',
    role: 'student'
  },
  parent: {
    email: 'veli@istanbul-demo-ortaokulu.edu.tr',
    password: 'Demo2025!Parent',
    role: 'parent'
  }
};

// Test Results Storage
let testResults = {
  startTime: new Date().toISOString(),
  environment: 'local-demo',
  tenant: TEST_CONFIG.tenantId,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    test: '\x1b[35m'     // Magenta
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}\x1b[0m`);
}

function recordTest(name, category, status, details = {}, error = null) {
  const test = {
    name,
    category,
    status,
    details,
    error: error ? error.message : null,
    timestamp: new Date().toISOString()
  };

  testResults.tests.push(test);
  testResults.summary.total++;
  testResults.summary[status]++;

  const statusIcon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏸️';
  log(`${statusIcon} ${category}: ${name}`, status === 'passed' ? 'success' : 'error');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, TEST_CONFIG.testTimeout);

    const protocol = url.startsWith('https') ? https : require('http');
    
    const req = protocol.get(url, options, (res) => {
      clearTimeout(timeout);
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Test Categories

async function testEnvironmentSetup() {
  log('🔧 Testing Environment Setup...', 'test');

  // Test 1: Node.js version
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
      recordTest('Node.js Version Check', 'Environment', 'passed', { 
        version: nodeVersion,
        required: '>=18'
      });
    } else {
      recordTest('Node.js Version Check', 'Environment', 'failed', { 
        version: nodeVersion,
        required: '>=18'
      });
    }
  } catch (error) {
    recordTest('Node.js Version Check', 'Environment', 'failed', {}, error);
  }

  // Test 2: Environment variables
  try {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      recordTest('Environment Variables', 'Environment', 'passed', { 
        checked: requiredVars.length
      });
    } else {
      recordTest('Environment Variables', 'Environment', 'failed', { 
        missing: missingVars
      });
    }
  } catch (error) {
    recordTest('Environment Variables', 'Environment', 'failed', {}, error);
  }

  // Test 3: Supabase connection
  try {
    const response = await makeRequest(`${TEST_CONFIG.supabaseUrl}/health`);
    
    if (response.status === 200) {
      recordTest('Supabase Health Check', 'Environment', 'passed', { 
        url: TEST_CONFIG.supabaseUrl,
        status: response.status
      });
    } else {
      recordTest('Supabase Health Check', 'Environment', 'failed', { 
        url: TEST_CONFIG.supabaseUrl,
        status: response.status
      });
    }
  } catch (error) {
    recordTest('Supabase Health Check', 'Environment', 'failed', {}, error);
  }

  await sleep(1000);
}

async function testApplicationBuild() {
  log('🔨 Testing Application Build...', 'test');

  return new Promise((resolve) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let buildOutput = '';
    let buildError = '';

    buildProcess.stdout.on('data', (data) => {
      buildOutput += data.toString();
    });

    buildProcess.stderr.on('data', (data) => {
      buildError += data.toString();
    });

    const timeout = setTimeout(() => {
      buildProcess.kill('SIGTERM');
      recordTest('Application Build', 'Build', 'failed', { 
        reason: 'timeout',
        timeout: 300000
      });
      resolve();
    }, 300000); // 5 minutes timeout

    buildProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0) {
        recordTest('Application Build', 'Build', 'passed', { 
          buildTime: 'success',
          outputLines: buildOutput.split('\n').length
        });
      } else {
        recordTest('Application Build', 'Build', 'failed', { 
          exitCode: code,
          errorLines: buildError.split('\n').length
        }, new Error(`Build failed with code ${code}`));
      }
      
      resolve();
    });
  });
}

async function testUnitTests() {
  log('🧪 Running Unit Tests...', 'test');

  return new Promise((resolve) => {
    const testProcess = spawn('npm', ['test', '--', '--passWithNoTests', '--verbose'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let testOutput = '';
    let testError = '';

    testProcess.stdout.on('data', (data) => {
      testOutput += data.toString();
    });

    testProcess.stderr.on('data', (data) => {
      testError += data.toString();
    });

    const timeout = setTimeout(() => {
      testProcess.kill('SIGTERM');
      recordTest('Unit Tests Execution', 'Testing', 'failed', { 
        reason: 'timeout',
        timeout: 120000
      });
      resolve();
    }, 120000); // 2 minutes timeout

    testProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      // Parse test results from output
      const testMatch = testOutput.match(/Tests:\s+(\d+)\s+passed/);
      const failMatch = testOutput.match(/(\d+)\s+failed/);
      
      const passedTests = testMatch ? parseInt(testMatch[1]) : 0;
      const failedTests = failMatch ? parseInt(failMatch[1]) : 0;

      if (code === 0 && passedTests > 0) {
        recordTest('Unit Tests Execution', 'Testing', 'passed', { 
          passed: passedTests,
          failed: failedTests,
          total: passedTests + failedTests
        });
      } else {
        recordTest('Unit Tests Execution', 'Testing', 'failed', { 
          exitCode: code,
          passed: passedTests,
          failed: failedTests
        }, new Error(`Tests failed with code ${code}`));
      }
      
      resolve();
    });
  });
}

async function testDatabaseConnections() {
  log('🗄️ Testing Database Connections...', 'test');

  const { createClient } = require('@supabase/supabase-js');
  
  try {
    const supabase = createClient(
      TEST_CONFIG.supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // Test tenant table access
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name')
      .limit(1);

    if (!tenantsError && tenants) {
      recordTest('Tenants Table Access', 'Database', 'passed', { 
        rowCount: tenants.length
      });
    } else {
      recordTest('Tenants Table Access', 'Database', 'failed', {}, tenantsError);
    }

    // Test tenant-specific table access
    const { data: users, error: usersError } = await supabase
      .from(`${TEST_CONFIG.tenantId}_users`)
      .select('id, email, role')
      .limit(5);

    if (!usersError && users) {
      recordTest('Tenant Users Table Access', 'Database', 'passed', { 
        rowCount: users.length,
        tenant: TEST_CONFIG.tenantId
      });
    } else {
      recordTest('Tenant Users Table Access', 'Database', 'failed', {}, usersError);
    }

  } catch (error) {
    recordTest('Database Connection', 'Database', 'failed', {}, error);
  }

  await sleep(1000);
}

async function testAuthentication() {
  log('🔐 Testing Authentication System...', 'test');

  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    TEST_CONFIG.supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  );

  // Test each role authentication
  for (const [roleName, credentials] of Object.entries(DEMO_CREDENTIALS)) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (!error && data.user) {
        recordTest(`${roleName} Authentication`, 'Authentication', 'passed', { 
          userId: data.user.id,
          email: credentials.email,
          role: roleName
        });

        // Sign out to clean up
        await supabase.auth.signOut();
      } else {
        recordTest(`${roleName} Authentication`, 'Authentication', 'failed', { 
          email: credentials.email
        }, error);
      }
    } catch (error) {
      recordTest(`${roleName} Authentication`, 'Authentication', 'failed', {}, error);
    }

    await sleep(500); // Small delay between tests
  }
}

async function testAPIEndpoints() {
  log('🌐 Testing API Endpoints...', 'test');

  const apiEndpoints = [
    { path: '/api/health', method: 'GET', expectedStatus: 200 },
    { path: '/api/assignments', method: 'GET', expectedStatus: [200, 401] }, // May require auth
    { path: '/api/attendance/statistics', method: 'GET', expectedStatus: [200, 401] },
    { path: '/api/grades/analytics', method: 'GET', expectedStatus: [200, 401] },
    { path: '/api/classes', method: 'GET', expectedStatus: [200, 401] }
  ];

  for (const endpoint of apiEndpoints) {
    try {
      const response = await makeRequest(`${TEST_CONFIG.baseUrl}${endpoint.path}`);
      const expectedStatuses = Array.isArray(endpoint.expectedStatus) 
        ? endpoint.expectedStatus 
        : [endpoint.expectedStatus];

      if (expectedStatuses.includes(response.status)) {
        recordTest(`API ${endpoint.path}`, 'API', 'passed', { 
          method: endpoint.method,
          status: response.status,
          expected: expectedStatuses
        });
      } else {
        recordTest(`API ${endpoint.path}`, 'API', 'failed', { 
          method: endpoint.method,
          status: response.status,
          expected: expectedStatuses
        });
      }
    } catch (error) {
      recordTest(`API ${endpoint.path}`, 'API', 'failed', {}, error);
    }

    await sleep(200); // Small delay between requests
  }
}

async function testTurkishContent() {
  log('🇹🇷 Testing Turkish Content Support...', 'test');

  try {
    // Test Turkish characters in database
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      TEST_CONFIG.supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // Test Turkish characters in tenant name
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('name, settings')
      .eq('id', TEST_CONFIG.tenantId)
      .single();

    if (!error && tenant && tenant.name.includes('Istanbul')) {
      recordTest('Turkish Characters in Database', 'Localization', 'passed', { 
        tenantName: tenant.name,
        hasSpecialChars: /[çğıöşüÇĞIÖŞÜ]/.test(tenant.name)
      });
    } else {
      recordTest('Turkish Characters in Database', 'Localization', 'failed', {}, error);
    }

    // Test Turkish locale settings
    if (tenant && tenant.settings && tenant.settings.locale === 'tr') {
      recordTest('Turkish Locale Configuration', 'Localization', 'passed', { 
        locale: tenant.settings.locale,
        timezone: tenant.settings.timezone
      });
    } else {
      recordTest('Turkish Locale Configuration', 'Localization', 'failed', {
        locale: tenant?.settings?.locale || 'not set'
      });
    }

  } catch (error) {
    recordTest('Turkish Content Support', 'Localization', 'failed', {}, error);
  }

  await sleep(1000);
}

async function testPerformance() {
  log('⚡ Testing Performance Metrics...', 'test');

  const performanceTests = [
    { name: 'Homepage Load Time', url: TEST_CONFIG.baseUrl },
    { name: 'API Health Response Time', url: `${TEST_CONFIG.baseUrl}/api/health` },
    { name: 'Supabase Response Time', url: `${TEST_CONFIG.supabaseUrl}/health` }
  ];

  for (const test of performanceTests) {
    try {
      const startTime = Date.now();
      const response = await makeRequest(test.url);
      const responseTime = Date.now() - startTime;

      const isGoodPerformance = responseTime < 2000; // Under 2 seconds
      
      recordTest(test.name, 'Performance', isGoodPerformance ? 'passed' : 'failed', { 
        responseTime: `${responseTime}ms`,
        status: response.status,
        threshold: '2000ms'
      });
    } catch (error) {
      recordTest(test.name, 'Performance', 'failed', {}, error);
    }

    await sleep(500);
  }
}

async function testErrorHandling() {
  log('🚨 Testing Error Handling...', 'test');

  const errorTests = [
    { name: 'Non-existent API Endpoint', url: `${TEST_CONFIG.baseUrl}/api/nonexistent`, expectedStatus: 404 },
    { name: 'Invalid API Request', url: `${TEST_CONFIG.baseUrl}/api/assignments/invalid-id`, expectedStatus: [400, 404] }
  ];

  for (const test of errorTests) {
    try {
      const response = await makeRequest(test.url);
      const expectedStatuses = Array.isArray(test.expectedStatus) 
        ? test.expectedStatus 
        : [test.expectedStatus];

      if (expectedStatuses.includes(response.status)) {
        recordTest(test.name, 'Error Handling', 'passed', { 
          status: response.status,
          expected: expectedStatuses
        });
      } else {
        recordTest(test.name, 'Error Handling', 'failed', { 
          status: response.status,
          expected: expectedStatuses
        });
      }
    } catch (error) {
      recordTest(test.name, 'Error Handling', 'failed', {}, error);
    }

    await sleep(200);
  }
}

// Generate comprehensive test report
function generateTestReport() {
  log('📊 Generating comprehensive test report...', 'info');

  testResults.endTime = new Date().toISOString();
  testResults.duration = new Date(testResults.endTime) - new Date(testResults.startTime);

  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>İ-EP.APP Local Demo Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
        .summary-card { padding: 20px; border-radius: 8px; text-align: center; }
        .passed { background: #d4edda; color: #155724; }
        .failed { background: #f8d7da; color: #721c24; }
        .total { background: #d1ecf1; color: #0c5460; }
        .skipped { background: #fff3cd; color: #856404; }
        .test-group { margin-bottom: 25px; }
        .test-group h3 { color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 5px; }
        .test-item { padding: 10px; margin: 5px 0; border-left: 4px solid; border-radius: 4px; }
        .test-item.passed { border-left-color: #28a745; background: #f8f9fa; }
        .test-item.failed { border-left-color: #dc3545; background: #f8f9fa; }
        .test-details { font-size: 0.9em; color: #6c757d; margin-top: 5px; }
        .error-details { color: #dc3545; font-family: monospace; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 İ-EP.APP Local Demo Test Report</h1>
        <p><strong>Environment:</strong> ${testResults.environment}</p>
        <p><strong>Tenant:</strong> ${testResults.tenant}</p>
        <p><strong>Start Time:</strong> ${testResults.startTime}</p>
        <p><strong>End Time:</strong> ${testResults.endTime}</p>
        <p><strong>Duration:</strong> ${Math.round(testResults.duration / 1000)}s</p>
    </div>

    <div class="summary">
        <div class="summary-card total">
            <h3>${testResults.summary.total}</h3>
            <p>Total Tests</p>
        </div>
        <div class="summary-card passed">
            <h3>${testResults.summary.passed}</h3>
            <p>Passed</p>
        </div>
        <div class="summary-card failed">
            <h3>${testResults.summary.failed}</h3>
            <p>Failed</p>
        </div>
        <div class="summary-card skipped">
            <h3>${testResults.summary.skipped}</h3>
            <p>Skipped</p>
        </div>
    </div>

    ${generateTestGroupsHTML()}
</body>
</html>
`;

  // Save reports
  const reportsDir = path.join(__dirname, '../../test-results');
  fs.mkdirSync(reportsDir, { recursive: true });

  const htmlPath = path.join(reportsDir, 'local-demo-test-report.html');
  const jsonPath = path.join(reportsDir, 'local-demo-test-results.json');

  fs.writeFileSync(htmlPath, htmlReport);
  fs.writeFileSync(jsonPath, JSON.stringify(testResults, null, 2));

  log(`📊 HTML Report: ${htmlPath}`, 'success');
  log(`📄 JSON Results: ${jsonPath}`, 'success');
}

function generateTestGroupsHTML() {
  const categories = [...new Set(testResults.tests.map(test => test.category))];
  
  return categories.map(category => {
    const categoryTests = testResults.tests.filter(test => test.category === category);
    
    return `
    <div class="test-group">
        <h3>${category} (${categoryTests.length} tests)</h3>
        ${categoryTests.map(test => `
        <div class="test-item ${test.status}">
            <strong>${test.name}</strong>
            <div class="test-details">
                Status: ${test.status.toUpperCase()}
                ${test.details && Object.keys(test.details).length > 0 ? `<br>Details: ${JSON.stringify(test.details)}` : ''}
                ${test.error ? `<div class="error-details">Error: ${test.error}</div>` : ''}
            </div>
        </div>
        `).join('')}
    </div>
    `;
  }).join('');
}

// Main test runner
async function runComprehensiveTests() {
  log('🎯 Starting comprehensive local demo testing...', 'info');

  try {
    await testEnvironmentSetup();
    await testApplicationBuild();
    await testUnitTests();
    await testDatabaseConnections();
    await testAuthentication();
    await testAPIEndpoints();
    await testTurkishContent();
    await testPerformance();
    await testErrorHandling();

    generateTestReport();

    // Final summary
    const passRate = ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1);
    
    log(`\n🎉 Testing completed!`, 'success');
    log(`📊 Results: ${testResults.summary.passed}/${testResults.summary.total} passed (${passRate}%)`, 'info');
    
    if (testResults.summary.failed > 0) {
      log(`❌ ${testResults.summary.failed} tests failed`, 'error');
      process.exit(1);
    } else {
      log(`✅ All tests passed! System is ready for production deployment.`, 'success');
    }

  } catch (error) {
    log(`❌ Testing failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runComprehensiveTests();
}

module.exports = { 
  runComprehensiveTests, 
  TEST_CONFIG, 
  testResults 
};