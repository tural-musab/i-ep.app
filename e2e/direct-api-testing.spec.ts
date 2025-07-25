import { test, expect } from '@playwright/test';

// Direct API testing without browser authentication
const criticalEndpoints = [
  { method: 'GET', path: '/api/health', requiresAuth: false, priority: 'critical' },
  { method: 'GET', path: '/api/ready', requiresAuth: false, priority: 'critical' },
  { method: 'GET', path: '/api/debug-auth', requiresAuth: false, priority: 'high' },
  { method: 'GET', path: '/api/tenant/current', requiresAuth: true, priority: 'high' },
  { method: 'GET', path: '/api/assignments', requiresAuth: true, priority: 'high' },
  { method: 'GET', path: '/api/attendance', requiresAuth: true, priority: 'high' },
  { method: 'GET', path: '/api/grades', requiresAuth: true, priority: 'high' },
  { method: 'GET', path: '/api/students', requiresAuth: true, priority: 'medium' },
  { method: 'GET', path: '/api/classes', requiresAuth: true, priority: 'medium' },
  { method: 'GET', path: '/api/dashboard/recent-activities', requiresAuth: true, priority: 'medium' },
  { method: 'GET', path: '/api/assignments/statistics', requiresAuth: true, priority: 'low' },
  { method: 'GET', path: '/api/attendance/statistics', requiresAuth: true, priority: 'low' },
  { method: 'GET', path: '/api/grades/analytics', requiresAuth: true, priority: 'low' }
];

type DirectAPITestResult = {
  endpoint: string;
  method: string;
  priority: string;
  authType: string;
  status: number;
  success: boolean;
  responseTime: number;
  responseSize?: number;
  error?: string;
};

let directTestResults: DirectAPITestResult[] = [];

test.describe('Phase 6.1 - Direct API Testing', () => {
  test.describe.configure({ mode: 'serial' });

  test('Direct API Testing - No Authentication', async ({ request }) => {
    console.log('\n=== Testing APIs without authentication ===');
    
    for (const endpoint of criticalEndpoints) {
      const startTime = Date.now();
      
      try {
        const response = await request.fetch(endpoint.path, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const responseTime = Date.now() - startTime;
        const responseText = await response.text().catch(() => '');
        const responseSize = responseText.length;
        
        // For endpoints that require auth, 401/403 is expected success
        // For endpoints that don't require auth, 200 is expected success
        const success = endpoint.requiresAuth ? 
          (response.status() === 401 || response.status() === 403) : 
          response.ok();
        
        const result: DirectAPITestResult = {
          endpoint: endpoint.path,
          method: endpoint.method,
          priority: endpoint.priority,
          authType: 'none',
          status: response.status(),
          success,
          responseTime,
          responseSize
        };
        
        if (!success) {
          result.error = responseText.substring(0, 200);
        }
        
        directTestResults.push(result);
        
        const expectedStatus = endpoint.requiresAuth ? '401/403' : '200';
        const statusIcon = success ? '✅' : '❌';
        console.log(`${statusIcon} ${endpoint.method} ${endpoint.path} → ${response.status()} (expected: ${expectedStatus}) - ${responseTime}ms`);
        
      } catch (error) {
        const result: DirectAPITestResult = {
          endpoint: endpoint.path,
          method: endpoint.method,
          priority: endpoint.priority,
          authType: 'none',
          status: 0,
          success: false,
          responseTime: Date.now() - startTime,
          error: String(error).substring(0, 200)
        };
        
        directTestResults.push(result);
        console.log(`❌ ${endpoint.method} ${endpoint.path} → ERROR: ${error}`);
      }
    }
  });

  test('Direct API Testing - Mock Headers', async ({ request }) => {
    console.log('\n=== Testing APIs with mock authentication headers ===');
    
    const mockHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token',
      'Cookie': 'next-auth.session-token=mock-session',
      'X-Tenant-ID': 'localhost',
      'X-User-Role': 'teacher'
    };
    
    for (const endpoint of criticalEndpoints.filter(e => e.requiresAuth)) {
      const startTime = Date.now();
      
      try {
        const response = await request.fetch(endpoint.path, {
          method: endpoint.method,
          headers: mockHeaders
        });
        
        const responseTime = Date.now() - startTime;
        const responseText = await response.text().catch(() => '');
        const responseSize = responseText.length;
        
        // With mock auth, we might get 200, 401, 422, or 500
        // Consider 200 and 422 (validation error) as success
        const success = response.ok() || response.status() === 422;
        
        const result: DirectAPITestResult = {
          endpoint: endpoint.path,
          method: endpoint.method,
          priority: endpoint.priority,
          authType: 'mock-headers',
          status: response.status(),
          success,
          responseTime,
          responseSize
        };
        
        if (!success) {
          result.error = responseText.substring(0, 200);
        }
        
        directTestResults.push(result);
        
        const statusIcon = success ? '✅' : '❌';
        console.log(`${statusIcon} ${endpoint.method} ${endpoint.path} → ${response.status()} - ${responseTime}ms`);
        
      } catch (error) {
        const result: DirectAPITestResult = {
          endpoint: endpoint.path,
          method: endpoint.method,
          priority: endpoint.priority,
          authType: 'mock-headers',
          status: 0,
          success: false,
          responseTime: Date.now() - startTime,
          error: String(error).substring(0, 200)
        };
        
        directTestResults.push(result);
        console.log(`❌ ${endpoint.method} ${endpoint.path} → ERROR: ${error}`);
      }
    }
  });

  test('API Response Time Analysis', async ({ request }) => {
    console.log('\n=== API Response Time Analysis ===');
    
    const responseTimeTests = [
      '/api/health',
      '/api/ready',
      '/api/assignments',
      '/api/classes'
    ];
    
    const responseTimes: Record<string, number[]> = {};
    
    // Test each endpoint 3 times to get average response time
    for (const path of responseTimeTests) {
      responseTimes[path] = [];
      
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        
        try {
          await request.fetch(path, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          const responseTime = Date.now() - startTime;
          responseTimes[path].push(responseTime);
          
        } catch (error) {
          // Still record the time even if request failed
          const responseTime = Date.now() - startTime;
          responseTimes[path].push(responseTime);
        }
      }
      
      const avgTime = responseTimes[path].reduce((a, b) => a + b, 0) / responseTimes[path].length;
      const status = avgTime < 500 ? '✅' : (avgTime < 1000 ? '⚠️' : '❌');
      console.log(`${status} ${path} → Avg: ${avgTime.toFixed(0)}ms (${responseTimes[path].join(', ')}ms)`);
    }
    
    // Expect reasonable response times
    Object.entries(responseTimes).forEach(([path, times]) => {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(2000); // Max 2 seconds average
    });
  });
});

test.afterAll(async () => {
  // Generate comprehensive report
  const totalTests = directTestResults.length;
  const successfulTests = directTestResults.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
  
  // Priority-based analysis
  const prioritySummary: Record<string, { total: number; success: number; rate: number }> = {};
  const authSummary: Record<string, { total: number; success: number; rate: number }> = {};
  
  for (const result of directTestResults) {
    // Priority summary
    if (!prioritySummary[result.priority]) {
      prioritySummary[result.priority] = { total: 0, success: 0, rate: 0 };
    }
    prioritySummary[result.priority].total++;
    if (result.success) prioritySummary[result.priority].success++;
    prioritySummary[result.priority].rate = 
      (prioritySummary[result.priority].success / prioritySummary[result.priority].total) * 100;
    
    // Auth type summary
    if (!authSummary[result.authType]) {
      authSummary[result.authType] = { total: 0, success: 0, rate: 0 };
    }
    authSummary[result.authType].total++;
    if (result.success) authSummary[result.authType].success++;
    authSummary[result.authType].rate = 
      (authSummary[result.authType].success / authSummary[result.authType].total) * 100;
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (successRate < 70) {
    recommendations.push('🔴 CRITICAL: Direct API success rate below 70%');
  } else if (successRate < 85) {
    recommendations.push('⚠️ WARNING: Direct API success rate needs improvement');
  } else {
    recommendations.push('✅ SUCCESS: Direct API endpoints performing well');
  }
  
  // Check critical endpoints specifically
  const criticalResults = directTestResults.filter(r => r.priority === 'critical');
  const criticalSuccessRate = criticalResults.length > 0 ? 
    (criticalResults.filter(r => r.success).length / criticalResults.length) * 100 : 0;
    
  if (criticalSuccessRate < 90) {
    recommendations.push('🔴 CRITICAL endpoints must have >90% success rate');
  }
  
  // Auth method analysis
  Object.entries(authSummary).forEach(([auth, stats]) => {
    if (stats.rate < 50) {
      recommendations.push(`🔴 ${auth} authentication method has major issues (${stats.rate.toFixed(1)}%)`);
    } else if (stats.rate < 75) {
      recommendations.push(`⚠️ ${auth} authentication method needs attention (${stats.rate.toFixed(1)}%)`);
    }
  });
  
  recommendations.push('🔧 Next: Implement proper session-based authentication testing');
  recommendations.push('📊 Review detailed results for specific error patterns');
  
  const report = {
    testMetadata: {
      phase: '6.1 Frontend-Backend Integration',
      date: new Date().toISOString(),
      testType: 'Direct API Testing',
      totalEndpoints: criticalEndpoints.length
    },
    summary: {
      totalTests,
      successfulTests,
      failedTests,
      successRate: Number(successRate.toFixed(1))
    },
    prioritySummary,
    authSummary,
    detailedResults: directTestResults,
    recommendations
  };
  
  // Write report
  const fs = require('fs');
  const reportPath = 'DIRECT_API_TEST_RESULTS.json';
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Direct API test report saved to: ${reportPath}`);
  } catch (error) {
    console.log(`Failed to write report: ${error}`);
  }
  
  // Console summary
  console.log('\n=== PHASE 6.1 DIRECT API TESTING RESULTS ===');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Successful: ${successfulTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  console.log('\nPriority Summary:');
  Object.entries(prioritySummary).forEach(([priority, stats]) => {
    console.log(`  ${priority}: ${stats.success}/${stats.total} (${stats.rate.toFixed(1)}%)`);
  });
  console.log('\nAuth Method Summary:');
  Object.entries(authSummary).forEach(([auth, stats]) => {
    console.log(`  ${auth}: ${stats.success}/${stats.total} (${stats.rate.toFixed(1)}%)`);
  });
  
  // Validate minimum success rate
  expect(successRate).toBeGreaterThan(60); // Minimum 60% for direct API testing
});