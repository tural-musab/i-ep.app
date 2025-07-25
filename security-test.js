#!/usr/bin/env node

/**
 * Security Validation Test Script
 * Tests API endpoints for proper authentication enforcement
 */

const testEndpoints = [
  '/api/assignments',
  '/api/students', 
  '/api/classes',
  '/api/dashboard/recent-activities',
  '/api/ready'
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🧪 Testing: ${endpoint}`);
    
    // Test without authentication
    const unauthResponse = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${unauthResponse.status}`);
    
    if (endpoint === '/api/ready') {
      // /api/ready should work without auth (system health)
      return unauthResponse.status === 200 || unauthResponse.status === 503;
    } else {
      // All other endpoints should require auth (401)
      return unauthResponse.status === 401;
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function runSecurityTests() {
  console.log('🛡️  SECURITY VALIDATION TEST SUITE');
  console.log('=====================================');
  
  let passed = 0;
  let total = testEndpoints.length;
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    if (result) {
      console.log(`   ✅ PASSED - Proper security enforcement`);
      passed++;
    } else {
      console.log(`   ❌ FAILED - Security vulnerability detected`);
    }
  }
  
  console.log(`\n📊 SECURITY TEST RESULTS:`);
  console.log(`   Passed: ${passed}/${total} (${Math.round((passed/total)*100)}%)`);
  
  if (passed === total) {
    console.log(`   🎉 ALL SECURITY TESTS PASSED!`);
    process.exit(0);
  } else {
    console.log(`   🚨 SECURITY VULNERABILITIES DETECTED!`);
    process.exit(1);
  }
}

// Run tests only if this script is executed directly
if (require.main === module) {
  runSecurityTests().catch(console.error);
}

module.exports = { testEndpoint, runSecurityTests };