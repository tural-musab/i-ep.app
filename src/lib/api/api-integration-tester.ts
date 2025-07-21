/**
 * API Integration Testing Utility
 * İ-EP.APP - Comprehensive API Testing Suite
 * Tests all 14 API endpoints with frontend integration
 */

export interface ApiEndpoint {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiresAuth: boolean;
  testData?: any;
  description: string;
  status: 'not_tested' | 'testing' | 'passed' | 'failed';
  lastTested?: Date;
  error?: string;
  responseTime?: number;
}

export interface ApiTestResult {
  endpoint: string;
  method: string;
  status: 'passed' | 'failed';
  responseTime: number;
  statusCode: number;
  error?: string;
  data?: any;
}

export class ApiIntegrationTester {
  private endpoints: ApiEndpoint[] = [
    // User Management APIs
    {
      name: 'Students API',
      url: '/api/students',
      method: 'GET',
      requiresAuth: true,
      description: 'List all students with pagination',
      status: 'not_tested',
    },
    {
      name: 'Teachers API',
      url: '/api/teachers',
      method: 'GET',
      requiresAuth: true,
      description: 'List all teachers with pagination',
      status: 'not_tested',
    },
    {
      name: 'Classes API',
      url: '/api/classes',
      method: 'GET',
      requiresAuth: true,
      description: 'List all classes with teacher/student counts',
      status: 'not_tested',
    },

    // Assignment System APIs
    {
      name: 'Assignments List',
      url: '/api/assignments',
      method: 'GET',
      requiresAuth: true,
      description: 'List assignments with filtering',
      status: 'not_tested',
    },
    {
      name: 'Assignment Create',
      url: '/api/assignments',
      method: 'POST',
      requiresAuth: true,
      description: 'Create new assignment',
      status: 'not_tested',
      testData: {
        title: 'Test Assignment',
        description: 'Test assignment for API integration',
        type: 'homework',
        subject: 'Mathematics',
        class_id: '550e8400-e29b-41d4-a716-446655440000',
        teacher_id: '550e8400-e29b-41d4-a716-446655440001',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        max_score: 100,
      },
    },
    {
      name: 'Assignment Detail',
      url: '/api/assignments/{id}',
      method: 'GET',
      requiresAuth: true,
      description: 'Get assignment details',
      status: 'not_tested',
    },

    // Attendance System APIs
    {
      name: 'Attendance List',
      url: '/api/attendance',
      method: 'GET',
      requiresAuth: true,
      description: 'List attendance records',
      status: 'not_tested',
    },
    {
      name: 'Attendance Create',
      url: '/api/attendance',
      method: 'POST',
      requiresAuth: true,
      description: 'Create attendance record',
      status: 'not_tested',
      testData: {
        student_id: '550e8400-e29b-41d4-a716-446655440002',
        class_id: '550e8400-e29b-41d4-a716-446655440000',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
      },
    },
    {
      name: 'Attendance Reports',
      url: '/api/attendance/reports',
      method: 'GET',
      requiresAuth: true,
      description: 'Generate attendance reports',
      status: 'not_tested',
    },

    // Grade System APIs
    {
      name: 'Grades List',
      url: '/api/grades',
      method: 'GET',
      requiresAuth: true,
      description: 'List student grades',
      status: 'not_tested',
    },
    {
      name: 'Grade Create',
      url: '/api/grades',
      method: 'POST',
      requiresAuth: true,
      description: 'Create new grade',
      status: 'not_tested',
      testData: {
        student_id: '550e8400-e29b-41d4-a716-446655440002',
        subject_id: '550e8400-e29b-41d4-a716-446655440003',
        grade_value: 85,
        max_grade: 100,
        grade_type: 'exam',
        semester: 1,
        academic_year: '2024-2025',
      },
    },
    {
      name: 'Grade Analytics',
      url: '/api/grades/analytics',
      method: 'GET',
      requiresAuth: true,
      description: 'Generate grade analytics',
      status: 'not_tested',
    },

    // Parent Communication APIs
    {
      name: 'Parent Messages',
      url: '/api/parent-communication/messages',
      method: 'GET',
      requiresAuth: true,
      description: 'List parent communication messages',
      status: 'not_tested',
    },

    // System APIs
    {
      name: 'Health Check',
      url: '/api/health',
      method: 'GET',
      requiresAuth: false,
      description: 'System health check',
      status: 'not_tested',
    },
  ];

  /**
   * Test a single API endpoint
   */
  async testEndpoint(endpoint: ApiEndpoint): Promise<ApiTestResult> {
    const startTime = Date.now();

    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Add test data for POST/PUT requests
      if (endpoint.testData && ['POST', 'PUT'].includes(endpoint.method)) {
        options.body = JSON.stringify(endpoint.testData);
      }

      const response = await fetch(endpoint.url, options);
      const responseTime = Date.now() - startTime;

      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      return {
        endpoint: endpoint.name,
        method: endpoint.method,
        status: response.ok ? 'passed' : 'failed',
        responseTime,
        statusCode: response.status,
        data,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint: endpoint.name,
        method: endpoint.method,
        status: 'failed',
        responseTime,
        statusCode: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test all API endpoints
   */
  async testAllEndpoints(): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];

    for (const endpoint of this.endpoints) {
      console.log(`Testing ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
      endpoint.status = 'testing';

      const result = await this.testEndpoint(endpoint);
      results.push(result);

      // Update endpoint status
      endpoint.status = result.status;
      endpoint.lastTested = new Date();
      endpoint.error = result.error;
      endpoint.responseTime = result.responseTime;
    }

    return results;
  }

  /**
   * Get testing summary
   */
  getTestingSummary(): {
    total: number;
    passed: number;
    failed: number;
    notTested: number;
    coverage: number;
  } {
    const total = this.endpoints.length;
    const passed = this.endpoints.filter((e) => e.status === 'passed').length;
    const failed = this.endpoints.filter((e) => e.status === 'failed').length;
    const notTested = this.endpoints.filter((e) => e.status === 'not_tested').length;
    const coverage = Math.round((passed / total) * 100);

    return {
      total,
      passed,
      failed,
      notTested,
      coverage,
    };
  }

  /**
   * Get endpoints by status
   */
  getEndpointsByStatus(status: ApiEndpoint['status']): ApiEndpoint[] {
    return this.endpoints.filter((e) => e.status === status);
  }

  /**
   * Generate test report
   */
  generateTestReport(): string {
    const summary = this.getTestingSummary();
    const passed = this.getEndpointsByStatus('passed');
    const failed = this.getEndpointsByStatus('failed');

    let report = `
# API Integration Test Report
Generated: ${new Date().toISOString()}

## Summary
- Total Endpoints: ${summary.total}
- Passed: ${summary.passed}
- Failed: ${summary.failed}
- Not Tested: ${summary.notTested}
- Coverage: ${summary.coverage}%

## Passed Endpoints (${passed.length})
${passed.map((e) => `- ✅ ${e.name} (${e.method} ${e.url}) - ${e.responseTime}ms`).join('\n')}

## Failed Endpoints (${failed.length})
${failed.map((e) => `- ❌ ${e.name} (${e.method} ${e.url}) - ${e.error}`).join('\n')}

## Authentication Status
- Endpoints requiring auth: ${this.endpoints.filter((e) => e.requiresAuth).length}
- Public endpoints: ${this.endpoints.filter((e) => !e.requiresAuth).length}
`;

    return report;
  }
}

// Export singleton instance
export const apiTester = new ApiIntegrationTester();
