/**
 * Grade API - Main Route
 * İ-EP.APP - Grade Management System
 * 
 * Endpoints:
 * - GET /api/grades - List grades with filtering and analytics
 * - POST /api/grades - Create new grade record or bulk create
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { GradeRepository } from '@/lib/repository/grade-repository';
import { getTenantId } from '@/lib/tenant/tenant-utils';
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
  gradeType: z.enum(['exam', 'homework', 'project', 'participation', 'quiz', 'midterm', 'final']).optional(),
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
  grades: z.array(z.object({
    studentId: z.string().uuid('Invalid student ID'),
    gradeValue: z.number().min(0, 'Grade value must be positive'),
    description: z.string().optional(),
  })).min(1, 'At least one grade is required'),
});

/**
 * GET /api/grades
 * Retrieve grades with filtering, sorting, and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId();
    const supabase = await createServerSupabaseClient();
    
    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validatedQuery = GradeQuerySchema.parse(queryParams);
    
    // Initialize repository
    const gradeRepo = new GradeRepository(supabase, tenantId);
    
    // Build query options
    const queryOptions = {
      studentId: validatedQuery.studentId,
      classId: validatedQuery.classId,
      subjectId: validatedQuery.subjectId,
      teacherId: validatedQuery.teacherId,
      gradeType: validatedQuery.gradeType,
      semester: validatedQuery.semester,
      academicYear: validatedQuery.academicYear,
      startDate: validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
      endDate: validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined,
      minGrade: validatedQuery.minGrade,
      maxGrade: validatedQuery.maxGrade,
      includeCalculations: validatedQuery.includeCalculations,
      includeComments: validatedQuery.includeComments,
      limit: validatedQuery.limit || 50,
      offset: validatedQuery.offset || 0,
    };

    // Get grades
    const grades = await gradeRepo.getGrades(queryOptions);
    
    // Get total count for pagination
    const totalCount = await gradeRepo.getGradesCount(queryOptions);

    // Get analytics if requested
    let analytics = null;
    if (validatedQuery.classId && validatedQuery.subjectId && validatedQuery.semester && validatedQuery.academicYear) {
      analytics = await gradeRepo.getGradeAnalytics(
        validatedQuery.classId,
        validatedQuery.subjectId,
        validatedQuery.semester,
        validatedQuery.academicYear
      );
    }

    return NextResponse.json({
      success: true,
      data: grades,
      analytics,
      pagination: {
        total: totalCount,
        limit: queryOptions.limit,
        offset: queryOptions.offset,
        hasMore: (queryOptions.offset + queryOptions.limit) < totalCount,
      },
    });

  } catch (error) {
    console.error('Error fetching grades:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    );
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
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
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

      return NextResponse.json({
        success: true,
        data: createdGrades,
        message: `${createdGrades.length} grades created successfully`,
      }, { status: 201 });

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

      return NextResponse.json({
        success: true,
        data: grade,
        message: 'Grade created successfully',
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating grade:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create grade' },
      { status: 500 }
    );
  }
}