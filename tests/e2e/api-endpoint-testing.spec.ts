import { test, expect } from '@playwright/test';

// Direct API testing without browser authentication
// This tests API endpoints directly with various authentication scenarios

interface APITestResult {
  endpoint: string;
  method: string;
  authType: string;
  status: number;
  success: boolean;
  responseTime: number;
  error?: string;
  responseSize?: number;
}

interface APITestSuite {
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  successRate: number;
  results: APITestResult[];
  authSummary: Record<string, { total: number; success: number; rate: number }>;
}

const baseURL = 'http://localhost:3000';

// Critical API endpoints for direct testing
const criticalEndpoints = [
  { method: 'GET', path: '/api/health', requiresAuth: false },
  { method: 'GET', path: '/api/ready', requiresAuth: false },
  { method: 'GET', path: '/api/tenant/current', requiresAuth: true },
  { method: 'GET', path: '/api/debug-auth', requiresAuth: false },
  { method: 'GET', path: '/api/assignments', requiresAuth: true },
  { method: 'GET', path: '/api/attendance', requiresAuth: true },
  { method: 'GET', path: '/api/grades', requiresAuth: true },
  { method: 'GET', path: '/api/students', requiresAuth: true },
  { method: 'GET', path: '/api/classes', requiresAuth: true },
  { method: 'GET', path: '/api/dashboard/recent-activities', requiresAuth: true },
  { method: 'GET', path: '/api/assignments/statistics', requiresAuth: true },
  { method: 'GET', path: '/api/attendance/statistics', requiresAuth: true },
  { method: 'GET', path: '/api/grades/analytics', requiresAuth: true }
];

test.describe('Phase 6.1 - Direct API Endpoint Testing', () => {
  let apiResults: APITestSuite;

  test.beforeAll(async () => {
    apiResults = {
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      successRate: 0,
      results: [],
      authSummary: {}
    };
  });

  test('Direct API Testing - No Authentication', async ({ request }) => {
    console.log('\n=== Testing APIs without authentication ===');
    
    for (const endpoint of criticalEndpoints) {
      const startTime = Date.now();
      
      try {
        const response = await request.fetch(`${baseURL}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const responseTime = Date.now() - startTime;
        const responseText = await response.text();
        const responseSize = responseText.length;
        
        const success = endpoint.requiresAuth ? 
          (response.status() === 401 || response.status() === 403) : // Should be unauthorized
          response.ok(); // Should work
        
        const result: APITestResult = {
          endpoint: endpoint.path,
          method: endpoint.method,
          authType: 'none',
          status: response.status(),
          success,
          responseTime,
          responseSize
        };
        
        if (!success) {
          result.error = responseText.substring(0, 200);
        }
        
        apiResults.results.push(result);
        apiResults.totalTests++;
        
        if (success) {
          apiResults.successfulTests++;
        } else {
          apiResults.failedTests++;
        }
        
        const expectedStatus = endpoint.requiresAuth ? '401/403' : '200';
        console.log(`${success ? '✅' : '❌'} ${endpoint.method} ${endpoint.path} → ${response.status()} (expected: ${expectedStatus}) - ${responseTime}ms`);
        
        // Update auth summary
        if (!apiResults.authSummary['none']) {
          apiResults.authSummary['none'] = { total: 0, success: 0, rate: 0 };
        }
        apiResults.authSummary['none'].total++;
        if (success) apiResults.authSummary['none'].success++;
        apiResults.authSummary['none'].rate = 
          (apiResults.authSummary['none'].success / apiResults.authSummary['none'].total) * 100;
        
      } catch (error) {
        const result: APITestResult = {
          endpoint: endpoint.path,
          method: endpoint.method,
          authType: 'none',
          status: 0,
          success: false,
          responseTime: Date.now() - startTime,
          error: String(error).substring(0, 200)
        };
        
        apiResults.results.push(result);
        apiResults.totalTests++;
        apiResults.failedTests++;
        
        console.log(`❌ ${endpoint.method} ${endpoint.path} - ERROR: ${error}`);
      }
    }
  });

  test('Direct API Testing - With Mock Headers', async ({ request }) => {
    console.log('\n=== Testing APIs with mock authentication headers ===');
    
    const mockHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token',
      'X-Tenant-ID': 'localhost',
      'X-User-Role': 'teacher',
      'X-User-ID': 'mock-user-id'
    };
    
    for (const endpoint of criticalEndpoints.filter(e => e.requiresAuth)) {
      const startTime = Date.now();
      
      try {
        const response = await request.fetch(`${baseURL}${endpoint.path}`, {
          method: endpoint.method,
          headers: mockHeaders
        });
        
        const responseTime = Date.now() - startTime;
        const responseText = await response.text();
        const responseSize = responseText.length;
        
        const success = response.ok() || response.status() === 422; // 422 is validation error, acceptable
        
        const result: APITestResult = {
          endpoint: endpoint.path,
          method: endpoint.method,
          authType: 'mock-headers',
          status: response.status(),
          success,
          responseTime,
          responseSize
        };
        
        if (!success) {
          result.error = responseText.substring(0, 200);
        }
        
        apiResults.results.push(result);
        apiResults.totalTests++;
        
        if (success) {
          apiResults.successfulTests++;
        } else {
          apiResults.failedTests++;
        }
        
        console.log(`${success ? '✅' : '❌'} ${endpoint.method} ${endpoint.path} → ${response.status()} - ${responseTime}ms`);
        
        // Update auth summary
        if (!apiResults.authSummary['mock-headers']) {
          apiResults.authSummary['mock-headers'] = { total: 0, success: 0, rate: 0 };
        }
        apiResults.authSummary['mock-headers'].total++;
        if (success) apiResults.authSummary['mock-headers'].success++;
        apiResults.authSummary['mock-headers'].rate = 
          (apiResults.authSummary['mock-headers'].success / apiResults.authSummary['mock-headers'].total) * 100;
        
      } catch (error) {
        const result: APITestResult = {
          endpoint: endpoint.path,
          method: endpoint.method,
          authType: 'mock-headers',
          status: 0,
          success: false,
          responseTime: Date.now() - startTime,
          error: String(error).substring(0, 200)
        };
        
        apiResults.results.push(result);
        apiResults.totalTests++;
        apiResults.failedTests++;
        
        console.log(`❌ ${endpoint.method} ${endpoint.path} - ERROR: ${error}`);
      }
    }
  });

  test('System Health and Readiness Check', async ({ request }) => {
    console.log('\n=== System Health Check ===');
    
    // Test critical system endpoints
    const systemEndpoints = [
      '/api/health',
      '/api/ready', 
      '/api/debug-auth',
      '/api/tenant/current'
    ];
    
    let healthyEndpoints = 0;
    
    for (const path of systemEndpoints) {
      try {
        const response = await request.get(`${baseURL}${path}`);
        const isHealthy = response.ok() || response.status() === 401; // 401 is expected for protected endpoints
        
        if (isHealthy) {
          healthyEndpoints++;
          console.log(`✅ ${path} → ${response.status()}`);
        } else {
          console.log(`❌ ${path} → ${response.status()}`);
        }
      } catch (error) {
        console.log(`❌ ${path} → ERROR: ${error}`);
      }
    }
    
    const systemHealthRate = (healthyEndpoints / systemEndpoints.length) * 100;
    console.log(`\n🏥 System Health: ${healthyEndpoints}/${systemEndpoints.length} (${systemHealthRate.toFixed(1)}%)`);
    
    expect(systemHealthRate).toBeGreaterThan(75); // At least 75% of system endpoints should be healthy
  });

  test.afterAll(async () => {
    // Calculate final success rate
    apiResults.successRate = apiResults.totalTests > 0 
      ? (apiResults.successfulTests / apiResults.totalTests) * 100 
      : 0;

    // Generate report
    const report = {
      testMetadata: {
        phase: '6.1 Frontend-Backend Integration',
        date: new Date().toISOString(),
        testType: 'Direct API Endpoint Testing',
        totalEndpoints: criticalEndpoints.length
      },
      summary: {
        totalTests: apiResults.totalTests,
        successfulTests: apiResults.successfulTests,
        failedTests: apiResults.failedTests,
        successRate: apiResults.successRate
      },
      authSummary: apiResults.authSummary,
      detailedResults: apiResults.results,
      recommendations: generateAPIRecommendations(apiResults)
    };

    // Write report to file
    const fs = require('fs');
    const reportPath = '/Users/turanmusabosman/Projects/i-ep.app/API_ENDPOINT_TEST_RESULTS_PHASE_6_1.json';
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n=== PHASE 6.1 API ENDPOINT TESTING RESULTS ===');
    console.log(`Total Tests: ${apiResults.totalTests}`);
    console.log(`Successful: ${apiResults.successfulTests}`);
    console.log(`Failed: ${apiResults.failedTests}`);
    console.log(`Success Rate: ${apiResults.successRate.toFixed(1)}%`);
    console.log('\nAuth Method Summary:');
    Object.entries(apiResults.authSummary).forEach(([auth, stats]) => {
      console.log(`  ${auth}: ${stats.success}/${stats.total} (${stats.rate.toFixed(1)}%)`);
    });
    console.log(`\n📊 Detailed API test report saved to: ${reportPath}`);
    
    // Validation
    expect(apiResults.successRate).toBeGreaterThan(70); // Minimum 70% success rate expected
  });
});

function generateAPIRecommendations(results: APITestSuite): string[] {
  const recommendations: string[] = [];
  
  if (results.successRate < 70) {
    recommendations.push('🔴 CRITICAL: API success rate below 70% - major issues detected');
  } else if (results.successRate < 85) {
    recommendations.push('⚠️ WARNING: API success rate below 85% - improvements needed');
  } else {
    recommendations.push('✅ SUCCESS: API endpoints performing well');
  }
  
  // Check auth-specific recommendations
  Object.entries(results.authSummary).forEach(([auth, stats]) => {
    if (stats.rate < 60) {
      recommendations.push(`🔴 ${auth} authentication method has critical issues (${stats.rate.toFixed(1)}%)`);
    } else if (stats.rate < 80) {
      recommendations.push(`⚠️ ${auth} authentication method needs improvement (${stats.rate.toFixed(1)}%)`);
    }
  });
  
  // Check for specific error patterns
  const serverErrors = results.results.filter(r => r.status >= 500).length;
  const authErrors = results.results.filter(r => r.status === 401 || r.status === 403).length;
  const clientErrors = results.results.filter(r => r.status >= 400 && r.status < 500 && r.status !== 401 && r.status !== 403).length;
  
  if (serverErrors > 0) {
    recommendations.push(`🔴 ${serverErrors} server errors (5xx) detected - check application logs`);
  }
  
  if (clientErrors > 0) {
    recommendations.push(`⚠️ ${clientErrors} client errors (4xx) detected - check request validation`);
  }
  
  recommendations.push('🔧 Next: Implement proper authentication in E2E tests');
  recommendations.push('📝 Update API documentation with test results');
  
  return recommendations;
}