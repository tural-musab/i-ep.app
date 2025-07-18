# API Integration Test Report
Generated: 2025-07-18T08:45:20.035Z

## Summary
- Total Endpoints: 14
- Passed: 0
- Failed: 14
- Coverage: 0%
- Average Response Time: 502ms

## Test Results

### Passed Endpoints (0)


### Failed Endpoints (14)
- ❌ GET /api/students: body used already for: http://localhost:3000/api/students
- ❌ GET /api/teachers: body used already for: http://localhost:3000/api/teachers
- ❌ GET /api/classes: HTTP 500
- ❌ GET /api/assignments: HTTP 500
- ❌ POST /api/assignments: HTTP 500
- ❌ GET /api/assignments/test-id: HTTP 500
- ❌ GET /api/attendance: HTTP 401
- ❌ POST /api/attendance: HTTP 401
- ❌ GET /api/attendance/reports: HTTP 401
- ❌ GET /api/grades: HTTP 401
- ❌ POST /api/grades: HTTP 401
- ❌ GET /api/grades/analytics: HTTP 401
- ❌ GET /api/parent-communication/messages: HTTP 401
- ❌ GET /api/health: body used already for: http://localhost:3000/api/health

## Authentication Status
- Endpoints requiring auth: 13
- Public endpoints: 1

## Performance Analysis
- Fastest endpoint: /api/grades (22ms)
- Slowest endpoint: /api/students (3204ms)

## Test Configuration
- Base URL: http://localhost:3000
- Timeout: 30000ms
- Total Tests: 14
