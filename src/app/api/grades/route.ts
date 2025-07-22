/**
 * Grade API - Main Route
 * İ-EP.APP - Grade Management System
 *
 * Endpoints:
 * - GET /api/grades - List grades with filtering and analytics
 * - POST /api/grades - Create new grade record or bulk create
 */

import { NextRequest, NextResponse } from 'next/server';
import { GradeRepository } from '@/lib/repository/grade-repository';
import { z } from 'zod';

// Validation schemas
const GradeCreateSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  classId: z.string().uuid('Invalid class ID'),
  subjectId: z.string().uuid('Invalid subject ID'),
  assignmentId: z.string().uuid().optional(),
  gradeType: z.enum(['exam', 'homework', 'project', 'participation', 'quiz', 'midterm', 'final']),
  gradeValue: z.number().min(0, 'Grade value must be positive'),
  maxGrade: z.number().min(1, 'Max grade must be at least 1'),
  weight: z.number().min(0).max(1).optional().default(1.0),
  examName: z.string().optional(),
  description: z.string().optional(),
  semester: z.number().int().min(1).max(2),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid academic year format'),
  gradeDate: z.string().optional(),
});

const GradeQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  gradeType: z
    .enum(['exam', 'homework', 'project', 'participation', 'quiz', 'midterm', 'final'])
    .optional(),
  semester: z.string().transform(Number).optional(),
  academicYear: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minGrade: z.string().transform(Number).optional(),
  maxGrade: z.string().transform(Number).optional(),
  includeCalculations: z.string().transform(Boolean).optional().default(false),
  includeComments: z.string().transform(Boolean).optional().default(false),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

const GradeBulkCreateSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  subjectId: z.string().uuid('Invalid subject ID'),
  gradeType: z.enum(['exam', 'homework', 'project', 'participation', 'quiz', 'midterm', 'final']),
  examName: z.string().optional(),
  maxGrade: z.number().min(1, 'Max grade must be at least 1'),
  weight: z.number().min(0).max(1).optional().default(1.0),
  semester: z.number().int().min(1).max(2),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid academic year format'),
  gradeDate: z.string().optional(),
  grades: z
    .array(
      z.object({
        studentId: z.string().uuid('Invalid student ID'),
        gradeValue: z.number().min(0, 'Grade value must be positive'),
        description: z.string().optional(),
      })
    )
    .min(1, 'At least one grade is required'),
});

/**
 * GET /api/grades
 * Retrieve grades with filtering, sorting, and analytics
 */
export async function GET(request: NextRequest) {
  try {
    // Extract authentication headers - Modern Pattern
    const userEmail = request.headers.get('X-User-Email') || 'teacher1@demo.local';
    const userId = request.headers.get('X-User-ID') || 'demo-teacher-001';
    const tenantId = request.headers.get('x-tenant-id') || 'localhost-tenant';

    console.log('🔧 Grades API - Auth headers:', { userEmail, userId, tenantId });

    // For demo, return mock grade data
    const mockGrades = [
      {
        id: 'grade-001',
        student_id: 'student-001',
        student_name: 'Ahmet YILMAZ',
        class_id: 'class-5a',
        subject_id: 'subject-turkish',
        subject_name: 'Türkçe',
        assignment_id: 'assignment-001',
        grade_type: 'homework',
        grade_value: 85,
        max_grade: 100,
        weight: 1.0,
        exam_name: 'Kompozisyon Ödevi',
        description: 'Okulum konulu kompozisyon',
        semester: 1,
        academic_year: '2024-2025',
        grade_date: new Date().toISOString(),
        teacher_id: userId,
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      },
      {
        id: 'grade-002',
        student_id: 'student-002',
        student_name: 'Ayşe KAYA',
        class_id: 'class-5a',
        subject_id: 'subject-math',
        subject_name: 'Matematik',
        assignment_id: 'assignment-002',
        grade_type: 'homework',
        grade_value: 92,
        max_grade: 100,
        weight: 1.0,
        exam_name: 'Kesirler Çalışması',
        description: 'Kesirlerle işlemler',
        semester: 1,
        academic_year: '2024-2025',
        grade_date: new Date().toISOString(),
        teacher_id: userId,
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      }
    ];

    const result = {
      data: mockGrades,
      pagination: {
        total: mockGrades.length,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };

    console.log('✅ Grades API - Returning mock data:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({ error: 'Failed to fetch grades' }, { status: 500 });
  }
}

/**
 * POST /api/grades
 * Create new grade record or bulk create grades
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId();
    const supabase = await createServerSupabaseClient();

    // Verify authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const gradeRepo = new GradeRepository(supabase, tenantId);

    // Check if this is a bulk create request
    if (body.grades && Array.isArray(body.grades)) {
      // Bulk create
      const validatedData = GradeBulkCreateSchema.parse(body);

      // Verify user has permission to grade this class and subject
      const hasPermission = await gradeRepo.verifyGradingPermission(
        validatedData.classId,
        validatedData.subjectId,
        session.user.id
      );

      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Insufficient permissions to grade this class and subject' },
          { status: 403 }
        );
      }

      // Create bulk grades
      const createdGrades = await gradeRepo.createBulkGrades(
        validatedData.classId,
        validatedData.subjectId,
        {
          gradeType: validatedData.gradeType,
          examName: validatedData.examName,
          maxGrade: validatedData.maxGrade,
          weight: validatedData.weight,
          semester: validatedData.semester,
          academicYear: validatedData.academicYear,
          gradeDate: validatedData.gradeDate ? new Date(validatedData.gradeDate) : new Date(),
          teacherId: session.user.id,
        },
        validatedData.grades
      );

      return NextResponse.json(
        {
          success: true,
          data: createdGrades,
          message: `${createdGrades.length} grades created successfully`,
        },
        { status: 201 }
      );
    } else {
      // Single create
      const validatedData = GradeCreateSchema.parse(body);

      // Verify user has permission to grade this student
      const hasPermission = await gradeRepo.verifyGradingPermission(
        validatedData.classId,
        validatedData.subjectId,
        session.user.id
      );

      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Insufficient permissions to grade this student' },
          { status: 403 }
        );
      }

      // Check if grade already exists for this student, subject, and exam
      const existingGrade = await gradeRepo.getGradeByStudentAndExam(
        validatedData.studentId,
        validatedData.subjectId,
        validatedData.gradeType,
        validatedData.examName,
        validatedData.semester,
        validatedData.academicYear
      );

      if (existingGrade) {
        return NextResponse.json(
          { error: 'Grade already exists for this student and exam' },
          { status: 409 }
        );
      }

      // Create grade
      const grade = await gradeRepo.createGrade({
        studentId: validatedData.studentId,
        classId: validatedData.classId,
        subjectId: validatedData.subjectId,
        assignmentId: validatedData.assignmentId,
        gradeType: validatedData.gradeType,
        gradeValue: validatedData.gradeValue,
        maxGrade: validatedData.maxGrade,
        weight: validatedData.weight,
        examName: validatedData.examName,
        description: validatedData.description,
        semester: validatedData.semester,
        academicYear: validatedData.academicYear,
        gradeDate: validatedData.gradeDate ? new Date(validatedData.gradeDate) : new Date(),
        teacherId: session.user.id,
      });

      return NextResponse.json(
        {
          success: true,
          data: grade,
          message: 'Grade created successfully',
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error creating grade:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create grade' }, { status: 500 });
  }
}
