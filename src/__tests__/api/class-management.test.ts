import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { GET, POST } from '@/app/api/classes/route';
import {
  GET as getClassStudents,
  POST as assignStudent,
} from '@/app/api/class-students/[classId]/route';
import {
  GET as getClassTeachers,
  POST as assignTeacher,
} from '@/app/api/class-teachers/[classId]/route';

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(),
}));

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  startSpan: jest.fn((_, fn) => fn()),
  captureException: jest.fn(),
}));

describe('Class Management API', () => {
  let mockSupabase: {
    from: jest.Mock;
    select: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    eq: jest.Mock;
    single: jest.Mock;
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock Supabase client methods
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };

    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('Classes API', () => {
    const mockClass = {
      id: '123',
      name: '6-A',
      grade_level: 6,
      capacity: 30,
      academic_year: '2023-2024',
      is_active: true,
      homeroom_teacher: {
        id: 'teacher-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      },
      student_count: [{ count: 25 }],
      teacher_count: [{ count: 3 }],
    };

    describe('GET /api/classes', () => {
      it('should return list of classes', async () => {
        mockSupabase.select.mockResolvedValueOnce({
          data: [mockClass],
          error: null,
        });

        const response = await GET(new Request('http://localhost/api/classes'));
        const data = await response.json();

        expect(data).toHaveLength(1);
        expect(data[0]).toHaveProperty('name', '6-A');
        expect(mockSupabase.select).toHaveBeenCalledWith(
          expect.stringContaining('homeroom_teacher')
        );
      });

      it('should handle errors', async () => {
        mockSupabase.select.mockResolvedValueOnce({
          data: null,
          error: new Error('Database error'),
        });

        const response = await GET(new Request('http://localhost/api/classes'));
        const data = await response.json();

        expect(data).toHaveProperty('error');
        expect(response.status).toBe(500);
      });
    });

    describe('POST /api/classes', () => {
      const newClass = {
        name: '7-B',
        grade_level: 7,
        capacity: 25,
        academic_year: '2023-2024',
        is_active: true,
      };

      it('should create a new class', async () => {
        mockSupabase.insert.mockResolvedValueOnce({
          data: { ...newClass, id: '456' },
          error: null,
        });

        const response = await POST(
          new Request('http://localhost/api/classes', {
            method: 'POST',
            body: JSON.stringify(newClass),
          })
        );
        const data = await response.json();

        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name', '7-B');
      });

      it('should validate input data', async () => {
        const response = await POST(
          new Request('http://localhost/api/classes', {
            method: 'POST',
            body: JSON.stringify({ name: '7-B' }), // Missing required fields
          })
        );
        const data = await response.json();

        expect(data).toHaveProperty('error');
        expect(response.status).toBe(400);
      });
    });

    // Add more test cases for PUT and DELETE...
  });

  describe('Class Students API', () => {
    const mockStudent = {
      id: 'student-1',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      student_number: '2023001',
      is_active: true,
    };

    describe('GET /api/class-students/[classId]', () => {
      it('should return list of students in a class', async () => {
        mockSupabase.select.mockResolvedValueOnce({
          data: [{ students: mockStudent }],
          error: null,
        });

        const response = await getClassStudents(
          new Request('http://localhost/api/class-students/123'),
          { params: { classId: '123' } }
        );
        const data = await response.json();

        expect(data).toHaveLength(1);
        expect(data[0]).toHaveProperty('first_name', 'Jane');
      });
    });

    describe('POST /api/class-students/[classId]', () => {
      it('should assign a student to class', async () => {
        // Mock class capacity check
        mockSupabase.select.mockResolvedValueOnce({
          data: { capacity: 30, student_count: [{ count: 25 }] },
          error: null,
        });

        // Mock existing assignment check
        mockSupabase.select.mockResolvedValueOnce({
          data: [],
          error: null,
        });

        // Mock insert
        mockSupabase.insert.mockResolvedValueOnce({
          data: { class_id: '123', student_id: 'student-1' },
          error: null,
        });

        const response = await assignStudent(
          new Request('http://localhost/api/class-students/123', {
            method: 'POST',
            body: JSON.stringify({ student_id: 'student-1' }),
          }),
          { params: { classId: '123' } }
        );
        const data = await response.json();

        expect(data).toHaveProperty('message');
        expect(response.status).toBe(200);
      });

      it('should prevent assigning to full class', async () => {
        mockSupabase.select.mockResolvedValueOnce({
          data: { capacity: 30, student_count: [{ count: 30 }] },
          error: null,
        });

        const response = await assignStudent(
          new Request('http://localhost/api/class-students/123', {
            method: 'POST',
            body: JSON.stringify({ student_id: 'student-1' }),
          }),
          { params: { classId: '123' } }
        );
        const data = await response.json();

        expect(data).toHaveProperty('error', 'Sınıf kapasitesi dolu');
        expect(response.status).toBe(400);
      });
    });

    // Add more test cases for DELETE...
  });

  describe('Class Teachers API', () => {
    const mockTeacher = {
      id: 'teacher-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      is_active: true,
    };

    describe('GET /api/class-teachers/[classId]', () => {
      it('should return list of teachers in a class', async () => {
        mockSupabase.select.mockResolvedValueOnce({
          data: [{ teachers: mockTeacher, role: 'subject_teacher' }],
          error: null,
        });

        const response = await getClassTeachers(
          new Request('http://localhost/api/class-teachers/123'),
          { params: { classId: '123' } }
        );
        const data = await response.json();

        expect(data).toHaveLength(1);
        expect(data[0]).toHaveProperty('first_name', 'John');
        expect(data[0]).toHaveProperty('role', 'subject_teacher');
      });
    });

    describe('POST /api/class-teachers/[classId]', () => {
      it('should assign a subject teacher to class', async () => {
        // Mock class check
        mockSupabase.select.mockResolvedValueOnce({
          data: { id: '123', homeroom_teacher_id: null },
          error: null,
        });

        // Mock insert
        mockSupabase.insert.mockResolvedValueOnce({
          data: { class_id: '123', teacher_id: 'teacher-1', role: 'subject_teacher' },
          error: null,
        });

        const response = await assignTeacher(
          new Request('http://localhost/api/class-teachers/123', {
            method: 'POST',
            body: JSON.stringify({
              teacher_id: 'teacher-1',
              role: 'subject_teacher',
            }),
          }),
          { params: { classId: '123' } }
        );
        const data = await response.json();

        expect(data).toHaveProperty('message');
        expect(response.status).toBe(200);
      });

      it('should prevent assigning multiple homeroom teachers', async () => {
        mockSupabase.select.mockResolvedValueOnce({
          data: { id: '123', homeroom_teacher_id: 'existing-teacher' },
          error: null,
        });

        const response = await assignTeacher(
          new Request('http://localhost/api/class-teachers/123', {
            method: 'POST',
            body: JSON.stringify({
              teacher_id: 'teacher-1',
              role: 'homeroom_teacher',
            }),
          }),
          { params: { classId: '123' } }
        );
        const data = await response.json();

        expect(data).toHaveProperty('error', 'Bu sınıfın zaten bir sınıf öğretmeni var');
        expect(response.status).toBe(400);
      });
    });

    // Add more test cases for DELETE...
  });
});
