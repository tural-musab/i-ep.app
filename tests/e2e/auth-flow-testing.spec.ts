import { test, expect, Page } from '@playwright/test';

// Demo user configuration from project documentation
const demoUsers = {
  admin: {
    email: 'admin@demo.localhost',
    password: 'demo123',
    role: 'admin',
    expectedAccess: 'all'
  },
  teacher: {
    email: 'teacher@demo.localhost', 
    password: 'demo123',
    role: 'teacher',
    expectedAccess: 'teacher'
  },
  student: {
    email: 'student@demo.localhost',
    password: 'demo123', 
    role: 'student',
    expectedAccess: 'student'
  },
  parent: {
    email: 'parent@demo.localhost',
    password: 'demo123',
    role: 'parent', 
    expectedAccess: 'parent'
  }
};

// Core API endpoints for systematic testing
const coreEndpoints = [
  { method: 'GET', path: '/api/assignments', roles: ['teacher', 'admin'], category: 'assignment' },
  { method: 'POST', path: '/api/assignments', roles: ['teacher', 'admin'], category: 'assignment' },
  { method: 'GET', path: '/api/attendance', roles: ['teacher', 'admin'], category: 'attendance' },
  { method: 'POST', path: '/api/attendance', roles: ['teacher', 'admin'], category: 'attendance' },
  { method: 'GET', path: '/api/grades', roles: ['teacher', 'admin'], category: 'grades' },
  { method: 'POST', path: '/api/grades', roles: ['teacher', 'admin'], category: 'grades' },
  { method: 'GET', path: '/api/students', roles: ['teacher', 'admin'], category: 'users' },
  { method: 'GET', path: '/api/teachers', roles: ['admin'], category: 'users' },
  { method: 'GET', path: '/api/classes', roles: ['teacher', 'admin'], category: 'classes' },
  { method: 'GET', path: '/api/dashboard/recent-activities', roles: ['all'], category: 'dashboard' },
  { method: 'GET', path: '/api/tenant/current', roles: ['all'], category: 'system' },
  { method: 'GET', path: '/api/health', roles: ['all'], category: 'system' },
  { method: 'GET', path: '/api/assignments/statistics', roles: ['teacher', 'admin'], category: 'analytics' },
  { method: 'GET', path: '/api/attendance/statistics', roles: ['teacher', 'admin'], category: 'analytics' },
  { method: 'GET', path: '/api/grades/analytics', roles: ['teacher', 'admin'], category: 'analytics' }
];

interface TestResult {
  endpoint: string;
  method: string;
  user: string;
  status: number;
  success: boolean;
  responseTime: number;
  error?: string;
  category: string;
}

interface AuthTestResults {
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  successRate: number;
  results: TestResult[];
  categorySummary: Record<string, { total: number; success: number; rate: number }>;
  userSummary: Record<string, { total: number; success: number; rate: number }>;
}

test.describe('Phase 6.1 - Comprehensive Authentication Flow Testing', () => {
  let authResults: AuthTestResults;

  test.beforeAll(async () => {
    authResults = {
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      successRate: 0,
      results: [],
      categorySummary: {},
      userSummary: {}
    };
  });

  // Test authentication for each demo user
  Object.entries(demoUsers).forEach(([userType, userData]) => {
    test.describe(`Authentication Testing - ${userType.toUpperCase()} User`, () => {
      let page: Page;
      let isAuthenticated = false;

      test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        
        // Navigate to login page
        await page.goto('http://localhost:3000/auth/signin');
        
        try {
          // Perform login
          await page.fill('input[name="email"]', userData.email);
          await page.fill('input[name="password"]', userData.password);
          await page.click('button[type="submit"]');
          
          // Wait for redirect to dashboard
          await page.waitForURL(/\/dashboard/, { timeout: 10000 });
          isAuthenticated = true;
          
          console.log(`✅ ${userType} authentication successful`);
        } catch (error) {
          console.log(`❌ ${userType} authentication failed:`, error);
          isAuthenticated = false;
        }
      });

      test.afterEach(async () => {
        await page.close();
      });

      test(`should authenticate ${userType} user successfully`, async () => {
        expect(isAuthenticated).toBe(true);
        
        // Verify user is on correct dashboard
        const currentUrl = page.url();
        expect(currentUrl).toContain('/dashboard');
        
        // Check for user-specific elements
        if (userType === 'teacher') {
          expect(currentUrl).toContain('/ogretmen');
        } else if (userType === 'parent') {
          expect(currentUrl).toContain('/veli');
        }
      });

      // Test API endpoints for each user
      coreEndpoints.forEach((endpoint) => {
        const shouldHaveAccess = endpoint.roles.includes('all') || 
                               endpoint.roles.includes(userType) ||
                               (userType === 'admin'); // Admin has access to everything

        test(`should ${shouldHaveAccess ? 'allow' : 'deny'} ${userType} access to ${endpoint.method} ${endpoint.path}`, async () => {
          if (!isAuthenticated) {
            test.skip();
            return;
          }

          const startTime = Date.now();
          
          try {
            const response = await page.request.fetch(`http://localhost:3000${endpoint.path}`, {
              method: endpoint.method,
              headers: {
                'Content-Type': 'application/json',
              },
              data: endpoint.method === 'POST' ? getTestPayload(endpoint.path) : undefined
            });
            
            const responseTime = Date.now() - startTime;
            const success = response.ok();

            const result: TestResult = {
              endpoint: endpoint.path,
              method: endpoint.method,
              user: userType,
              status: response.status(),
              success,
              responseTime,
              category: endpoint.category
            };

            if (!success) {
              const errorText = await response.text();
              result.error = errorText.substring(0, 200); // Limit error message length
            }

            authResults.results.push(result);
            authResults.totalTests++;
            
            if (success) {
              authResults.successfulTests++;
            } else {
              authResults.failedTests++;
            }

            // Update category summary
            if (!authResults.categorySummary[endpoint.category]) {
              authResults.categorySummary[endpoint.category] = { total: 0, success: 0, rate: 0 };
            }
            authResults.categorySummary[endpoint.category].total++;
            if (success) authResults.categorySummary[endpoint.category].success++;
            authResults.categorySummary[endpoint.category].rate = 
              (authResults.categorySummary[endpoint.category].success / authResults.categorySummary[endpoint.category].total) * 100;

            // Update user summary
            if (!authResults.userSummary[userType]) {
              authResults.userSummary[userType] = { total: 0, success: 0, rate: 0 };
            }
            authResults.userSummary[userType].total++;
            if (success) authResults.userSummary[userType].success++;
            authResults.userSummary[userType].rate = 
              (authResults.userSummary[userType].success / authResults.userSummary[userType].total) * 100;

            console.log(`${success ? '✅' : '❌'} ${userType} → ${endpoint.method} ${endpoint.path} (${response.status()}) - ${responseTime}ms`);

            if (shouldHaveAccess) {
              expect(response.ok()).toBe(true);
            } else {
              expect([401, 403]).toContain(response.status());
            }
            
          } catch (error) {
            const result: TestResult = {
              endpoint: endpoint.path,
              method: endpoint.method,
              user: userType,
              status: 0,
              success: false,
              responseTime: Date.now() - startTime,
              error: String(error).substring(0, 200),
              category: endpoint.category
            };
            
            authResults.results.push(result);
            authResults.totalTests++;
            authResults.failedTests++;
            
            console.log(`❌ ${userType} → ${endpoint.method} ${endpoint.path} - ERROR: ${error}`);
            
            if (shouldHaveAccess) {
              throw error; // Fail the test if user should have access but got an error
            }
          }
        });
      });
    });
  });

  test.afterAll(async () => {
    // Calculate final success rate
    authResults.successRate = authResults.totalTests > 0 
      ? (authResults.successfulTests / authResults.totalTests) * 100 
      : 0;

    // Generate comprehensive report
    await generateTestReport(authResults);
    
    console.log('\n=== PHASE 6.1 AUTHENTICATION TESTING RESULTS ===');
    console.log(`Total Tests: ${authResults.totalTests}`);
    console.log(`Successful: ${authResults.successfulTests}`);
    console.log(`Failed: ${authResults.failedTests}`);
    console.log(`Success Rate: ${authResults.successRate.toFixed(1)}%`);
    console.log('\nCategory Summary:');
    Object.entries(authResults.categorySummary).forEach(([category, stats]) => {
      console.log(`  ${category}: ${stats.success}/${stats.total} (${stats.rate.toFixed(1)}%)`);
    });
    console.log('\nUser Summary:');
    Object.entries(authResults.userSummary).forEach(([user, stats]) => {
      console.log(`  ${user}: ${stats.success}/${stats.total} (${stats.rate.toFixed(1)}%)`);
    });
  });
});

// Helper function to get test payload for POST requests
function getTestPayload(endpoint: string): any {
  switch (endpoint) {
    case '/api/assignments':
      return {
        title: 'Test Assignment',
        description: 'Test Description',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        class_id: 'test-class-id'
      };
    case '/api/attendance':
      return {
        student_id: 'test-student-id',
        class_id: 'test-class-id',
        date: new Date().toISOString().split('T')[0],
        status: 'present'
      };
    case '/api/grades':
      return {
        student_id: 'test-student-id',
        subject: 'Matematik',
        grade_value: 85,
        grade_type: 'exam',
        weight: 1.0
      };
    default:
      return {};
  }
}

// Helper function to generate detailed test report
async function generateTestReport(results: AuthTestResults) {
  const report = {
    testMetadata: {
      phase: '6.1 Frontend-Backend Integration',
      date: new Date().toISOString(),
      testType: 'Authentication Flow Testing',
      totalEndpoints: coreEndpoints.length,
      totalUsers: Object.keys(demoUsers).length
    },
    summary: {
      totalTests: results.totalTests,
      successfulTests: results.successfulTests,
      failedTests: results.failedTests,
      successRate: results.successRate
    },
    categorySummary: results.categorySummary,
    userSummary: results.userSummary,
    detailedResults: results.results,
    recommendations: generateRecommendations(results)
  };

  // Write report to file
  const fs = require('fs');
  const reportPath = '/Users/turanmusabosman/Projects/i-ep.app/AUTHENTICATION_TEST_RESULTS_PHASE_6_1.json';
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📊 Detailed test report saved to: ${reportPath}`);
}

// Helper function to generate recommendations based on test results
function generateRecommendations(results: AuthTestResults): string[] {
  const recommendations: string[] = [];
  
  if (results.successRate < 90) {
    recommendations.push('🔴 CRITICAL: Success rate below 90% target - immediate attention required');
  }
  
  if (results.successRate >= 90) {
    recommendations.push('✅ SUCCESS: Target success rate of 90%+ achieved');
  }
  
  // Check for category-specific issues
  Object.entries(results.categorySummary).forEach(([category, stats]) => {
    if (stats.rate < 80) {
      recommendations.push(`⚠️ ${category} APIs have low success rate (${stats.rate.toFixed(1)}%) - requires investigation`);
    }
  });
  
  // Check for user-specific issues
  Object.entries(results.userSummary).forEach(([user, stats]) => {
    if (stats.rate < 75) {
      recommendations.push(`⚠️ ${user} user role has authentication issues (${stats.rate.toFixed(1)}%) - check permissions`);
    }
  });
  
  if (results.failedTests > 0) {
    recommendations.push('🔧 Review failed tests for authentication, authorization, or server errors');
  }
  
  recommendations.push('📝 Update CLAUDE.md with verified authentication success rates');
  recommendations.push('🚀 Ready for Phase 6.2 if success rate > 85%');
  
  return recommendations;
}