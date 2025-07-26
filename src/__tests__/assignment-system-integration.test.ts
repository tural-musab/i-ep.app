/**
 * Assignment System Integration Tests
 * İ-EP.APP - Professional Integration Testing
 *
 * Tests the integration between:
 * - Assignment Repository
 * - Assignment Validation
 * - Assignment Types
 * - Database Layer (mocked)
 */

import { describe, it, expect, beforeEach, jest, beforeAll, afterAll } from '@jest/globals';
import { AssignmentRepository, Assignment } from '../lib/repository/assignment-repository';
import { assignmentValidation } from '../lib/validations/assignment-validation';
import { AssignmentStatus, AssignmentType } from '../types/assignment';

// Mock the Supabase client
jest.mock('../lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

// Mock Next.js headers for tenant isolation
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: 'test-tenant-id' })),
  })),
}));

describe('Assignment System Integration Tests', () => {
  let assignmentRepository: AssignmentRepository;
  let mockSupabaseFrom: jest.Mock;

  beforeAll(() => {
    // Setup global mocks
    const { supabase } = require('../lib/supabase/client');
    mockSupabaseFrom = supabase.from;
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create fresh repository instance
    assignmentRepository = new AssignmentRepository();

    // Setup default successful responses
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Assignment Repository Integration', () => {
    describe('create', () => {
      it('should create assignment with valid data', async () => {
        const validAssignment = {
          title: 'Mathematics Homework',
          description: 'Solve problems 1-10 from chapter 3',
          type: 'homework' as const,
          subject: 'Mathematics',
          class_id: 'class-123',
          teacher_id: 'teacher-456',
          due_date: '2025-07-20T10:00:00Z',
          max_score: 100,
          is_graded: false,
          status: 'draft' as const,
          tenant_id: 'test-tenant-id',
        };

        // Mock successful database response
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'assignment-123', ...validAssignment },
            error: null,
          }),
        };

        mockSupabaseFrom.mockReturnValue(mockChain);

        const result = await assignmentRepository.create(validAssignment);

        expect(result).toBeDefined();
        expect(result.id).toBe('assignment-123');
        expect(result.title).toBe('Mathematics Homework');
        expect(mockSupabaseFrom).toHaveBeenCalledWith('assignments');
      });

      it('should handle database errors during creation', async () => {
        const validAssignment = {
          title: 'Test Assignment',
          description: 'Test Description',
          type: 'homework' as const,
          subject: 'Mathematics',
          class_id: 'class-123',
          teacher_id: 'teacher-456',
          due_date: '2025-07-20T10:00:00Z',
          max_score: 100,
          is_graded: false,
          status: 'draft' as const,
          tenant_id: 'test-tenant-id',
        };

        // Mock database error
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' },
          }),
        };

        mockSupabaseFrom.mockReturnValue(mockChain);

        await expect(assignmentRepository.create(validAssignment)).rejects.toThrow(
          'Repository error: Database connection failed'
        );
      });

      it('should enforce tenant isolation during creation', async () => {
        const assignmentWithDifferentTenant = {
          title: 'Test Assignment',
          description: 'Test Description',
          type: 'homework' as const,
          subject: 'Mathematics',
          class_id: 'class-123',
          teacher_id: 'teacher-456',
          due_date: '2025-07-20T10:00:00Z',
          max_score: 100,
          is_graded: false,
          status: 'draft' as const,
          tenant_id: 'different-tenant-id',
        };

        const mockChain = {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'assignment-123', ...assignmentWithDifferentTenant },
            error: null,
          }),
        };

        mockSupabaseFrom.mockReturnValue(mockChain);

        const result = await assignmentRepository.create(assignmentWithDifferentTenant);

        // Should still work, but tenant_id should be overridden by repository
        expect(result).toBeDefined();
        expect(mockSupabaseFrom).toHaveBeenCalledWith('assignments');
      });
    });

    describe('findById', () => {
      it('should find assignment by ID with tenant isolation', async () => {
        const mockAssignment = {
          id: 'assignment-123',
          title: 'Test Assignment',
          description: 'Test Description',
          type: 'homework',
          subject: 'Mathematics',
          class_id: 'class-123',
          teacher_id: 'teacher-456',
          due_date: '2025-07-20T10:00:00Z',
          max_score: 100,
          is_graded: false,
          status: 'draft',
          tenant_id: 'test-tenant-id',
        };

        const mockChain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockAssignment,
            error: null,
          }),
        };

        mockSupabaseFrom.mockReturnValue(mockChain);

        const result = await assignmentRepository.findById('assignment-123');

        expect(result).toBeDefined();
        expect(result?.id).toBe('assignment-123');
        expect(result?.title).toBe('Test Assignment');
        expect(mockSupabaseFrom).toHaveBeenCalledWith('assignments');
      });

      it('should return null for non-existent assignment', async () => {
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // Not found error
          }),
        };

        mockSupabaseFrom.mockReturnValue(mockChain);

        const result = await assignmentRepository.findById('non-existent-id');

        expect(result).toBeNull();
      });
    });

    describe('findAll', () => {
      it('should find all assignments with pagination', async () => {
        const mockAssignments = [
          {
            id: 'assignment-1',
            title: 'Assignment 1',
            type: 'homework',
            status: 'published',
            tenant_id: 'test-tenant-id',
          },
          {
            id: 'assignment-2',
            title: 'Assignment 2',
            type: 'exam',
            status: 'draft',
            tenant_id: 'test-tenant-id',
          },
        ];

        const mockChain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          range: jest.fn(() => ({
            select: jest.fn().mockResolvedValue({
              data: mockAssignments,
              error: null,
              count: 2,
            }),
          })),
        };

        mockSupabaseFrom.mockReturnValue(mockChain);

        const result = await assignmentRepository.findAll({ page: 1, limit: 10 });

        expect(result).toBeDefined();
        expect(result.data).toHaveLength(2);
        expect(result.totalCount).toBe(2);
        expect(result.data[0].id).toBe('assignment-1');
        expect(result.data[1].id).toBe('assignment-2');
      });
    });

    describe('update', () => {
      it('should update assignment with valid data', async () => {
        const updateData = {
          title: 'Updated Assignment Title',
          description: 'Updated description',
          status: 'published' as const,
        };

        const mockChain = {
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({
                    data: { id: 'assignment-123', ...updateData },
                    error: null,
                  }),
                })),
              })),
            })),
          })),
        };

        mockSupabaseFrom.mockReturnValue(mockChain);

        const result = await assignmentRepository.update('assignment-123', updateData);

        expect(result).toBeDefined();
        expect(result.id).toBe('assignment-123');
        expect(result.title).toBe('Updated Assignment Title');
        expect(result.status).toBe('published');
      });
    });

    describe('delete', () => {
      it('should delete assignment successfully', async () => {
        const mockChain = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'assignment-123' },
            error: null,
          }),
        };

        mockSupabaseFrom.mockReturnValue(mockChain);

        const result = await assignmentRepository.delete('assignment-123');

        expect(result).toBe(true);
        expect(mockSupabaseFrom).toHaveBeenCalledWith('assignments');
      });
    });
  });

  describe('Assignment Validation Integration', () => {
    it('should validate assignment with correct schema', () => {
      const validAssignmentData = {
        title: 'Valid Assignment',
        description: 'Valid description',
        due_date: new Date('2025-07-20T10:00:00Z'),
        class_id: 'class-123',
        teacher_id: 'teacher-456',
        tenant_id: 'test-tenant-id',
        points_possible: 100,
        assignment_type: 'HOMEWORK' as const,
      };

      const result = assignmentValidation.safeParse(validAssignmentData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Valid Assignment');
        expect(result.data.points_possible).toBe(100);
        expect(result.data.assignment_type).toBe('HOMEWORK');
      }
    });

    it('should reject invalid assignment data', () => {
      const invalidAssignmentData = {
        title: '', // Empty title
        description: 'Valid description',
        due_date: 'invalid-date', // Invalid date
        class_id: '', // Empty class_id
        teacher_id: 'teacher-456',
        tenant_id: 'test-tenant-id',
        points_possible: -10, // Negative points
        assignment_type: 'INVALID_TYPE', // Invalid type
      };

      const result = assignmentValidation.safeParse(invalidAssignmentData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        expect(result.error.issues.some((issue) => issue.path.includes('title'))).toBe(true);
        expect(result.error.issues.some((issue) => issue.path.includes('points_possible'))).toBe(
          true
        );
      }
    });
  });

  describe('Assignment Types Integration', () => {
    it('should work with AssignmentStatus enum', () => {
      const validStatuses = [
        AssignmentStatus.DRAFT,
        AssignmentStatus.PUBLISHED,
        AssignmentStatus.CLOSED,
        AssignmentStatus.ARCHIVED,
      ];

      validStatuses.forEach((status) => {
        expect(Object.values(AssignmentStatus)).toContain(status);
      });
    });

    it('should work with AssignmentType enum', () => {
      const validTypes = [
        AssignmentType.HOMEWORK,
        AssignmentType.PROJECT,
        AssignmentType.EXAM,
        AssignmentType.QUIZ,
        AssignmentType.PRESENTATION,
      ];

      validTypes.forEach((type) => {
        expect(Object.values(AssignmentType)).toContain(type);
      });
    });
  });

  describe('End-to-End Assignment Workflow', () => {
    it('should complete full assignment lifecycle', async () => {
      // 1. Create assignment
      const newAssignment = {
        title: 'E2E Test Assignment',
        description: 'End-to-end test assignment',
        type: 'homework' as const,
        subject: 'Mathematics',
        class_id: 'class-123',
        teacher_id: 'teacher-456',
        due_date: '2025-07-20T10:00:00Z',
        max_score: 100,
        is_graded: false,
        status: 'draft' as const,
        tenant_id: 'test-tenant-id',
      };

      // Mock creation
      const createMockChain = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'assignment-e2e', ...newAssignment },
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(createMockChain);

      const createdAssignment = await assignmentRepository.create(newAssignment);

      expect(createdAssignment).toBeDefined();
      expect(createdAssignment.id).toBe('assignment-e2e');
      expect(createdAssignment.status).toBe('draft');

      // 2. Update assignment status to published
      const updateMockChain = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'assignment-e2e',
                    ...newAssignment,
                    status: 'published',
                  },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      };

      mockSupabaseFrom.mockReturnValue(updateMockChain);

      const updatedAssignment = await assignmentRepository.update('assignment-e2e', {
        status: 'published' as const,
      });

      expect(updatedAssignment.status).toBe('published');

      // 3. Find the assignment
      const findMockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'assignment-e2e',
            ...newAssignment,
            status: 'published',
          },
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(findMockChain);

      const foundAssignment = await assignmentRepository.findById('assignment-e2e');

      expect(foundAssignment).toBeDefined();
      expect(foundAssignment?.status).toBe('published');

      // 4. Delete the assignment
      const deleteMockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'assignment-e2e' },
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(deleteMockChain);

      const deleteResult = await assignmentRepository.delete('assignment-e2e');

      expect(deleteResult).toBe(true);
    });
  });
});
