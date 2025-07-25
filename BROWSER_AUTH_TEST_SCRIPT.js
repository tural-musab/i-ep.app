/**
 * Browser Authentication Test Script
 * İ-EP.APP - API Authentication Flow Testing
 * 
 * Usage: Copy-paste this code into browser console after login
 */

// Test configuration
const API_BASE = window.location.origin;
const ENDPOINTS_TO_TEST = [
  '/api/assignments/statistics',
  '/api/attendance/statistics', 
  '/api/grades/analytics',
  '/api/classes',
  '/api/students',
  '/api/teachers',
  '/api/assignments',
  '/api/attendance',
  '/api/grades'
];

// Test runner function
async function testAPIAuthentication() {
  console.log('🔍 Starting API Authentication Tests...\n');
  console.log('========================================');
  
  const results = [];
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    try {
      console.log(`\n📡 Testing: ${endpoint}`);
      
      const startTime = performance.now();
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
      });
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      let data;
      let dataQuality = 'unknown';
      
      try {
        data = await response.json();
        dataQuality = data.error ? 'error' : 'valid';
      } catch (e) {
        data = 'Invalid JSON response';
        dataQuality = 'invalid';
      }
      
      const result = {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        dataQuality,
        data: response.status === 200 ? 'Success (data received)' : data
      };
      
      results.push(result);
      
      // Log result
      const statusColor = response.status === 200 ? '✅' : 
                         response.status === 401 ? '🔒' :
                         response.status === 403 ? '🚫' : '❌';
      
      console.log(`   ${statusColor} Status: ${response.status} (${responseTime}ms)`);
      console.log(`   Response: ${typeof data === 'object' ? JSON.stringify(data).substring(0, 100) + '...' : data}`);
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({
        endpoint,
        status: 'ERROR',
        error: error.message,
        responseTime: 'N/A',
        dataQuality: 'error'
      });
    }
  }
  
  // Summary report
  console.log('\n📊 AUTHENTICATION TEST SUMMARY');
  console.log('=====================================');
  
  const successful = results.filter(r => r.status === 200).length;
  const authRequired = results.filter(r => r.status === 401).length;
  const forbidden = results.filter(r => r.status === 403).length;
  const errors = results.filter(r => r.status === 'ERROR' || (r.status !== 200 && r.status !== 401 && r.status !== 403)).length;
  
  console.log(`✅ Successful (200): ${successful}/${ENDPOINTS_TO_TEST.length}`);
  console.log(`🔒 Auth Required (401): ${authRequired}/${ENDPOINTS_TO_TEST.length}`);
  console.log(`🚫 Forbidden (403): ${forbidden}/${ENDPOINTS_TO_TEST.length}`);
  console.log(`❌ Errors: ${errors}/${ENDPOINTS_TO_TEST.length}`);
  
  // Detailed results table
  console.log('\n📋 DETAILED RESULTS:');
  console.table(results);
  
  return results;
}

// User role detection
async function getCurrentUserRole() {
  try {
    const response = await fetch(`${API_BASE}/api/tenant/current`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data.user?.role || 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

// Main execution
console.log('🎯 Browser API Authentication Tester Ready!');
console.log('📝 Instructions:');
console.log('1. Make sure you are logged in');
console.log('2. Run: testAPIAuthentication()');
console.log('3. Check results in console');
console.log('\n🔄 Current user role detection...');

getCurrentUserRole().then(role => {
  console.log(`👤 Current user role: ${role}`);
  console.log('\n▶️ Ready to test! Run: testAPIAuthentication()');
});