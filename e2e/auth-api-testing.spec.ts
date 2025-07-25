import { test, expect, Page } from '@playwright/test';

// Demo user configuration
const demoUsers = {
  admin: {
    email: 'admin@demo.localhost',
    password: 'demo123',
    role: 'admin'
  },
  teacher: {
    email: 'teacher@demo.localhost', 
    password: 'demo123',
    role: 'teacher'
  },
  student: {
    email: 'student@demo.localhost',
    password: 'demo123', 
    role: 'student'
  },
  parent: {
    email: 'parent@demo.localhost',
    password: 'demo123',
    role: 'parent'
  }
};

// Core API endpoints for testing
const coreEndpoints = [
  { method: 'GET', path: '/api/assignments', roles: ['teacher', 'admin'] },
  { method: 'GET', path: '/api/attendance', roles: ['teacher', 'admin'] },
  { method: 'GET', path: '/api/grades', roles: ['teacher', 'admin'] },
  { method: 'GET', path: '/api/students', roles: ['teacher', 'admin'] },
  { method: 'GET', path: '/api/classes', roles: ['teacher', 'admin'] },
  { method: 'GET', path: '/api/dashboard/recent-activities', roles: ['all'] },
  { method: 'GET', path: '/api/assignments/statistics', roles: ['teacher', 'admin'] },
  { method: 'GET', path: '/api/attendance/statistics', roles: ['teacher', 'admin'] },
  { method: 'GET', path: '/api/grades/analytics', roles: ['teacher', 'admin'] },
  { method: 'GET', path: '/api/tenant/current', roles: ['all'] },
  { method: 'GET', path: '/api/health', roles: ['all'] }
];

type TestResult = {
  endpoint: string;
  method: string;
  user: string;
  status: number;
  success: boolean;
  responseTime: number;
  error?: string;
};

let testResults: TestResult[] = [];

test.describe('Phase 6.1 - Authentication & API Testing', () => {
  test.describe.configure({ mode: 'serial' });

  // Test system health first
  test('System Health Check', async ({ request }) => {
    console.log('\n=== System Health Check ===');
    
    const healthEndpoints = ['/api/health', '/api/ready'];
    let healthyCount = 0;
    
    for (const endpoint of healthEndpoints) {
      try {
        const response = await request.get(endpoint);
        const isHealthy = response.ok();
        
        if (isHealthy) {
          healthyCount++;
          console.log(`✅ ${endpoint} → ${response.status()}`);
        } else {
          console.log(`❌ ${endpoint} → ${response.status()}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} → ERROR: ${error}`);
      }
    }
    
    expect(healthyCount).toBeGreaterThan(0);
  });

  // Test each demo user authentication
  Object.entries(demoUsers).forEach(([userType, userData]) => {
    test(`Authentication Test - ${userType.toUpperCase()}`, async ({ page }) => {
      console.log(`\n=== Testing ${userType} authentication ===`);
      
      // Navigate to login page
      await page.goto('/auth/signin');
      
      // Fill in credentials
      await page.fill('input[name="email"]', userData.email);
      await page.fill('input[name="password"]', userData.password);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for navigation with generous timeout
      try {
        await page.waitForURL(/\/dashboard/, { timeout: 15000 });
        console.log(`✅ ${userType} authentication successful`);
        
        // Verify we're on the correct page
        const currentUrl = page.url();
        expect(currentUrl).toContain('/dashboard');
        
        // Test API endpoints with authenticated session
        await testAPIEndpointsForUser(page, userType);
        
      } catch (error) {
        console.log(`❌ ${userType} authentication failed: ${error}`);
        
        // Check if we're on an error page or still on login
        const currentUrl = page.url();
        console.log(`Current URL: ${currentUrl}`);
        
        // Take screenshot for debugging
        await page.screenshot({ 
          path: `test-results/${userType}-auth-failure.png`,
          fullPage: true 
        });
        
        throw new Error(`Authentication failed for ${userType}: ${error}`);
      }
    });
  });

  test.afterEach(async () => {
    // Log results after each test
    if (testResults.length > 0) {
      const latest = testResults[testResults.length - 1];
      console.log(`Result: ${latest.success ? '✅' : '❌'} ${latest.user} → ${latest.method} ${latest.endpoint} (${latest.status}) - ${latest.responseTime}ms`);
    }
  });
});

async function testAPIEndpointsForUser(page: Page, userType: string) {
  console.log(`\n--- Testing API endpoints for ${userType} ---`);
  
  for (const endpoint of coreEndpoints) {
    const shouldHaveAccess = endpoint.roles.includes('all') || 
                           endpoint.roles.includes(userType) ||
                           userType === 'admin';

    const startTime = Date.now();
    
    try {
      const response = await page.request.fetch(endpoint.path, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const responseTime = Date.now() - startTime;
      const success = shouldHaveAccess ? response.ok() : [401, 403].includes(response.status());
      
      const result: TestResult = {
        endpoint: endpoint.path,
        method: endpoint.method,
        user: userType,
        status: response.status(),
        success,
        responseTime
      };
      
      if (!success) {
        const errorText = await response.text().catch(() => 'Could not read response');
        result.error = errorText.substring(0, 200);
      }
      
      testResults.push(result);
      
      const statusIcon = success ? '✅' : '❌';
      const expectedStatus = shouldHaveAccess ? '200' : '401/403';
      console.log(`  ${statusIcon} ${endpoint.method} ${endpoint.path} → ${response.status()} (expected: ${expectedStatus})`);
      
    } catch (error) {
      const result: TestResult = {
        endpoint: endpoint.path,
        method: endpoint.method,
        user: userType,
        status: 0,
        success: false,
        responseTime: Date.now() - startTime,
        error: String(error).substring(0, 200)
      };
      
      testResults.push(result);
      console.log(`  ❌ ${endpoint.method} ${endpoint.path} → ERROR: ${error}`);
    }
  }
}

test.afterAll(async () => {
  // Generate comprehensive test report
  const totalTests = testResults.length;
  const successfulTests = testResults.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
  
  // Calculate user-specific success rates
  const userSummary: Record<string, { total: number; success: number; rate: number }> = {};
  
  for (const result of testResults) {
    if (!userSummary[result.user]) {
      userSummary[result.user] = { total: 0, success: 0, rate: 0 };
    }
    userSummary[result.user].total++;
    if (result.success) userSummary[result.user].success++;
    userSummary[result.user].rate = (userSummary[result.user].success / userSummary[result.user].total) * 100;
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (successRate < 90) {
    recommendations.push('🔴 CRITICAL: Success rate below 90% target');
  } else {
    recommendations.push('✅ SUCCESS: Target success rate achieved');
  }
  
  Object.entries(userSummary).forEach(([user, stats]) => {
    if (stats.rate < 75) {
      recommendations.push(`⚠️ ${user} user has low success rate (${stats.rate.toFixed(1)}%)`);
    }
  });
  
  if (failedTests > 0) {
    recommendations.push('🔧 Review failed tests for authentication/authorization issues');
  }
  
  const report = {
    testMetadata: {
      phase: '6.1 Frontend-Backend Integration',
      date: new Date().toISOString(),
      testType: 'E2E Authentication & API Testing',
      totalEndpoints: coreEndpoints.length,
      totalUsers: Object.keys(demoUsers).length
    },
    summary: {
      totalTests,
      successfulTests,
      failedTests,
      successRate: Number(successRate.toFixed(1))
    },
    userSummary,
    detailedResults: testResults,
    recommendations
  };
  
  // Write report to file using Node.js fs
  const fs = require('fs');
  const reportPath = 'AUTHENTICATION_TEST_RESULTS_E2E.json';
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Test report saved to: ${reportPath}`);
  } catch (error) {
    console.log(`Failed to write report: ${error}`);
  }
  
  // Console summary
  console.log('\n=== PHASE 6.1 E2E AUTHENTICATION TESTING RESULTS ===');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Successful: ${successfulTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  console.log('\nUser Summary:');
  Object.entries(userSummary).forEach(([user, stats]) => {
    console.log(`  ${user}: ${stats.success}/${stats.total} (${stats.rate.toFixed(1)}%)`);
  });
  console.log('\nRecommendations:');
  recommendations.forEach(rec => console.log(`  ${rec}`));
  
  // Validate minimum success rate
  expect(successRate).toBeGreaterThan(70); // Minimum 70% success rate
});