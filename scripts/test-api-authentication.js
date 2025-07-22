#!/usr/bin/env node

/**
 * API Authentication Flow Tester
 * İ-EP.APP - Systematic API endpoint authentication testing
 * 
 * Usage: node scripts/test-api-authentication.js
 */

const http = require('http');
const { performance } = require('perf_hooks');

// Test configuration
const API_BASE = 'http://localhost:3000';

const CORE_ENDPOINTS = [
  '/api/assignments/statistics',
  '/api/attendance/statistics', 
  '/api/grades/analytics',
  '/api/classes',
  '/api/students',
  '/api/teachers'
];

const CRUD_ENDPOINTS = [
  '/api/assignments',
  '/api/attendance', 
  '/api/grades'
];

const SYSTEM_ENDPOINTS = [
  '/api/health',
  '/api/ready',
  '/api/tenant/current'
];

// Demo users for testing
const DEMO_USERS = [
  {
    email: 'admin@demo.local',
    password: 'demo123',
    role: 'admin',
    expectedAccess: 'all'
  },
  {
    email: 'teacher1@demo.local', 
    password: 'demo123',
    role: 'teacher',
    expectedAccess: 'limited'
  },
  {
    email: 'student1@demo.local',
    password: 'demo123', 
    role: 'student',
    expectedAccess: 'minimal'
  },
  {
    email: 'parent1@demo.local',
    password: 'demo123',
    role: 'parent', 
    expectedAccess: 'minimal'
  }
];

// HTTP request helper
function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Auth-Tester/1.0',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test endpoint without authentication
async function testUnauthenticatedAccess() {
  console.log('🔒 Testing Unauthenticated Access...\n');
  
  const results = [];
  const allEndpoints = [...CORE_ENDPOINTS, ...CRUD_ENDPOINTS];
  
  for (const endpoint of allEndpoints) {
    try {
      const startTime = performance.now();
      const response = await makeRequest(`${API_BASE}${endpoint}`);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      const result = {
        endpoint,
        status: response.status,
        responseTime: `${responseTime}ms`,
        response: response.data
      };
      
      results.push(result);
      
      // Expected: 401 Unauthorized
      const statusIcon = response.status === 401 ? '✅' : 
                        response.status === 403 ? '⚠️' : '❌';
      
      console.log(`${statusIcon} ${endpoint}`);
      console.log(`   Status: ${response.status} (${responseTime}ms)`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 80)}...`);
      console.log();
      
    } catch (error) {
      console.error(`❌ ${endpoint} - Error: ${error.message}`);
      results.push({
        endpoint,
        status: 'ERROR',
        error: error.message
      });
    }
  }
  
  return results;
}

// Test system endpoints (should be accessible)
async function testSystemEndpoints() {
  console.log('🔧 Testing System Endpoints...\n');
  
  const results = [];
  
  for (const endpoint of SYSTEM_ENDPOINTS) {
    try {
      const startTime = performance.now();
      const response = await makeRequest(`${API_BASE}${endpoint}`);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      const result = {
        endpoint,
        status: response.status,
        responseTime: `${responseTime}ms`,
        accessible: response.status === 200
      };
      
      results.push(result);
      
      const statusIcon = response.status === 200 ? '✅' : '❌';
      
      console.log(`${statusIcon} ${endpoint}`);
      console.log(`   Status: ${response.status} (${responseTime}ms)`);
      
      if (endpoint === '/api/health') {
        console.log(`   Health: ${response.data.status || 'unknown'}`);
      }
      
      console.log();
      
    } catch (error) {
      console.error(`❌ ${endpoint} - Error: ${error.message}`);
      results.push({
        endpoint,
        status: 'ERROR',
        error: error.message
      });
    }
  }
  
  return results;
}

// Generate test report
function generateReport(unauthResults, systemResults) {
  console.log('📊 AUTHENTICATION TEST REPORT');
  console.log('===============================\n');
  
  // Unauthenticated access analysis
  const properAuth = unauthResults.filter(r => r.status === 401).length;
  const improperlAccess = unauthResults.filter(r => r.status === 200).length;
  
  console.log('🔒 Protected Endpoint Analysis:');
  console.log(`   Properly Protected (401): ${properAuth}/${unauthResults.length}`);
  console.log(`   Improperly Accessible (200): ${improperlAccess}/${unauthResults.length}`);
  
  if (improperlAccess > 0) {
    console.log('   ⚠️ SECURITY ISSUE: Some endpoints accessible without auth!');
  } else {
    console.log('   ✅ All protected endpoints require authentication');
  }
  
  console.log();
  
  // System endpoints analysis
  const systemWorking = systemResults.filter(r => r.accessible).length;
  
  console.log('🔧 System Endpoint Analysis:');
  console.log(`   Working System Endpoints: ${systemWorking}/${systemResults.length}`);
  
  if (systemWorking === systemResults.length) {
    console.log('   ✅ All system endpoints accessible');
  } else {
    console.log('   ⚠️ Some system endpoints not working');
  }
  
  console.log();
  
  // Overall assessment
  const overallScore = ((properAuth / unauthResults.length) + (systemWorking / systemResults.length)) / 2 * 100;
  
  console.log('🎯 Overall Assessment:');
  console.log(`   Authentication Security: ${Math.round(overallScore)}%`);
  
  if (overallScore >= 90) {
    console.log('   ✅ EXCELLENT - Authentication system working properly');
  } else if (overallScore >= 70) {
    console.log('   ⚠️ GOOD - Minor issues need attention');
  } else {
    console.log('   ❌ POOR - Significant authentication issues');
  }
  
  console.log();
  console.log('📋 Next Step: Test authenticated access in browser');
  console.log('   1. Visit: http://localhost:3000');
  console.log('   2. Login: admin@demo.local / demo123');
  console.log('   3. Run browser test script for authenticated endpoints');
}

// Main execution
async function runAuthenticationTests() {
  try {
    console.log('🚀 İ-EP.APP API Authentication Flow Testing\n');
    console.log('Testing against:', API_BASE);
    console.log('========================================\n');
    
    // Test unauthenticated access (should be blocked)
    const unauthResults = await testUnauthenticatedAccess();
    
    // Test system endpoints (should be accessible)  
    const systemResults = await testSystemEndpoints();
    
    // Generate comprehensive report
    generateReport(unauthResults, systemResults);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAuthenticationTests()
    .then(() => {
      console.log('✅ Authentication testing completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Authentication testing failed:', error);
      process.exit(1);
    });
}

module.exports = { runAuthenticationTests };