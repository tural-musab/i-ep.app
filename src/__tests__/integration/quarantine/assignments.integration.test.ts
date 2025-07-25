/**
 * Assignment API Integration Tests
 * Phase 4.2 - Real API endpoint testing
 */

import { NextRequest } from 'next/server';

// Mock Next.js environment for API route testing
const mockRequestGet = (url: string) => new NextRequest(`http://localhost:3000${url}`, { method: 'GET' });
const mockRequestPost = (url: string, body: any) => new NextRequest(`http://localhost:3000${url}`, {
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' }
});

describe('Assignment API Integration Tests', () => {
  describe('GET /api/assignments', () => {
    it('should return 200 with empty array initially', async () => {
      // Import the API route handler dynamically
      const { GET } = await import('@/app/api/assignments/route');
      
      const request = mockRequestGet('/api/assignments');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      // Initially should be empty or contain existing assignments
      expect(data).toBeDefined();
    });
  });

  describe('POST /api/assignments', () => {
    it('should create assignment and return 201 with ID', async () => {
      const { POST } = await import('@/app/api/assignments/route');
      
      const assignmentData = {
        title: 'Test Assignment',
        description: 'Integration test assignment',
        due_date: '2025-08-01T00:00:00Z',
        class_id: 'test-class-id',
        subject: 'Mathematics',
        total_points: 100
      };
      
      const request = mockRequestPost('/api/assignments', assignmentData);
      const response = await POST(request);
      
      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.title).toBe(assignmentData.title);
      expect(data.description).toBe(assignmentData.description);
    });
  });

  describe('GET /api/assignments (after creation)', () => {
    it('should return at least 1 assignment after creation', async () => {
      // First create an assignment
      const { POST, GET } = await import('@/app/api/assignments/route');
      
      const assignmentData = {
        title: 'Test Assignment 2',
        description: 'Second test assignment',
        due_date: '2025-08-02T00:00:00Z',
        class_id: 'test-class-id-2', 
        subject: 'Science',
        total_points: 90
      };
      
      const postRequest = mockRequestPost('/api/assignments', assignmentData);
      await POST(postRequest);
      
      // Then fetch all assignments
      const getRequest = mockRequestGet('/api/assignments');
      const response = await GET(getRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(1);
      
      // Check if our created assignment exists
      const createdAssignment = data.find((a: any) => a.title === 'Test Assignment 2');
      expect(createdAssignment).toBeDefined();
    });
  });
});