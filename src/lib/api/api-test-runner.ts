/**
 * API Test Runner - İ-EP.APP
 * Frontend-Backend Integration Testing
 * Runs comprehensive API tests and validates responses
 */

import { apiTester, ApiTestResult } from './api-integration-tester';

/**
 * Run API integration tests with comprehensive validation
 */
export async function runApiIntegrationTests(): Promise<{
  success: boolean;
  results: ApiTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    coverage: number;
    avgResponseTime: number;
  };
  report: string;
}> {
  console.log('🚀 İ-EP.APP API Integration Testing Started');
  console.log('Testing 14 API endpoints with frontend integration...\n');

  try {
    // Run all endpoint tests
    const results = await apiTester.testAllEndpoints();
    
    // Get summary statistics
    const summary = apiTester.getTestingSummary();
    
    // Calculate average response time
    const avgResponseTime = Math.round(
      results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
    );
    
    // Generate comprehensive report
    const report = apiTester.generateTestReport();
    
    // Log results to console
    console.log('\n📊 API Integration Test Results:');
    console.log(`✅ Passed: ${summary.passed}/${summary.total}`);
    console.log(`❌ Failed: ${summary.failed}/${summary.total}`);
    console.log(`📈 Coverage: ${summary.coverage}%`);
    console.log(`⚡ Avg Response Time: ${avgResponseTime}ms`);
    
    // Log failed endpoints for debugging
    const failedEndpoints = results.filter(r => r.status === 'failed');
    if (failedEndpoints.length > 0) {
      console.log('\n🔍 Failed Endpoints:');
      failedEndpoints.forEach(endpoint => {
        console.log(`❌ ${endpoint.endpoint}: ${endpoint.error}`);
      });
    }
    
    return {
      success: summary.failed === 0,
      results,
      summary: {
        ...summary,
        avgResponseTime
      },
      report
    };
    
  } catch (error) {
    console.error('❌ API Integration Testing failed:', error);
    return {
      success: false,
      results: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        coverage: 0,
        avgResponseTime: 0
      },
      report: `API Integration Testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Test specific API endpoints by category
 */
export async function testApisByCategory(category: 'users' | 'assignments' | 'attendance' | 'grades' | 'communication' | 'system') {
  const endpointMap = {
    users: ['Students API', 'Teachers API', 'Classes API'],
    assignments: ['Assignments List', 'Assignment Create', 'Assignment Detail'],
    attendance: ['Attendance List', 'Attendance Create', 'Attendance Reports'],
    grades: ['Grades List', 'Grade Create', 'Grade Analytics'],
    communication: ['Parent Messages'],
    system: ['Health Check']
  };

  const endpoints = endpointMap[category];
  console.log(`🧪 Testing ${category} APIs: ${endpoints.join(', ')}`);
  
  // This would need enhancement to test specific endpoints
  // For now, we'll run all tests and filter results
  const results = await apiTester.testAllEndpoints();
  return results.filter(r => endpoints.includes(r.endpoint));
}

/**
 * Validate API response structure
 */
export function validateApiResponse(response: any, expectedFields: string[]): {
  isValid: boolean;
  missingFields: string[];
  extraFields: string[];
} {
  const actualFields = Object.keys(response || {});
  const missingFields = expectedFields.filter(field => !actualFields.includes(field));
  const extraFields = actualFields.filter(field => !expectedFields.includes(field));
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    extraFields
  };
}

/**
 * Test authentication and authorization
 */
export async function testAuthEndpoints(): Promise<{
  publicEndpoints: number;
  authEndpoints: number;
  authFailures: string[];
}> {
  const results = await apiTester.testAllEndpoints();
  
  const publicEndpoints = results.filter(r => !r.endpoint.includes('auth')).length;
  const authEndpoints = results.filter(r => r.endpoint.includes('auth')).length;
  const authFailures = results
    .filter(r => r.status === 'failed' && r.statusCode === 401)
    .map(r => r.endpoint);
  
  return {
    publicEndpoints,
    authEndpoints,
    authFailures
  };
}

/**
 * Performance testing for API endpoints
 */
export async function testApiPerformance(): Promise<{
  fastest: { endpoint: string; time: number };
  slowest: { endpoint: string; time: number };
  averageTime: number;
  performanceIssues: string[];
}> {
  const results = await apiTester.testAllEndpoints();
  
  const times = results.map(r => ({ endpoint: r.endpoint, time: r.responseTime }));
  const fastest = times.reduce((min, curr) => curr.time < min.time ? curr : min);
  const slowest = times.reduce((max, curr) => curr.time > max.time ? curr : max);
  const averageTime = times.reduce((sum, curr) => sum + curr.time, 0) / times.length;
  
  // Flag endpoints slower than 2 seconds
  const performanceIssues = times
    .filter(t => t.time > 2000)
    .map(t => `${t.endpoint}: ${t.time}ms`);
  
  return {
    fastest,
    slowest,
    averageTime: Math.round(averageTime),
    performanceIssues
  };
}

// Export for use in development/testing
export { apiTester };