/**
 * Grade Analytics API Route
 * İ-EP.APP - Grade Management System
 *
 * Endpoints:
 * - GET /api/grades/analytics - Get comprehensive grade analytics and statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { GradeRepository } from '@/lib/repository/grade-repository';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

// Validation schemas  
const AnalyticsQuerySchema = z.object({
  type: z.enum(['student', 'class', 'subject', 'teacher', 'trends', 'distribution', 'comparison']).default('student'),
  studentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  semester: z.string().transform(Number).optional(),
  academicYear: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gradeType: z
    .enum(['exam', 'homework', 'project', 'participation', 'quiz', 'midterm', 'final'])
    .optional(),
  includeDetails: z.preprocess((val) => {
    if (val === undefined || val === null) return false;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    return false;
  }, z.boolean()).default(false),
  includeComparisons: z.preprocess((val) => {
    if (val === undefined || val === null) return false;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    return false;
  }, z.boolean()).default(false),
  timePeriod: z.enum(['week', 'month', 'semester', 'year']).default('semester'),
});

/**
 * GET /api/grades/analytics
 * Get comprehensive grade analytics and statistics
 */
export async function GET(request: NextRequest) {
  try {
    let tenantId = getTenantId();
    
    // Development environment tenant bypass
    if (!tenantId && process.env.NODE_ENV === 'development') {
      tenantId = 'f8b3a2c1-e4d5-4a6b-9c8d-1f2e3a4b5c6d'; // Mock development tenant
    }
    
    const supabase = await createServerSupabaseClient();

    // Verify authentication - Development bypass
    let session = await getServerSession(authOptions);
    
    // Development environment bypass
    if (!session && process.env.NODE_ENV === 'development') {
      session = {
        user: {
          id: 'demo-teacher',
          email: 'teacher@demo.com',
          name: 'Demo Teacher',
          role: 'teacher'
        }
      } as any;
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = AnalyticsQuerySchema.parse(queryParams);

    // Development environment mock data bypass
    if (process.env.NODE_ENV === 'development') {
      const mockGradeData = {
        student: {
          gpa: 3.45,
          averageGrade: 86.2,
          totalGrades: 42,
          subjectBreakdown: {
            'Matematik': { average: 88.5, count: 12, trend: '+2.3' },
            'Türkçe': { average: 84.0, count: 10, trend: '-1.2' },
            'İngilizce': { average: 91.2, count: 8, trend: '+4.1' }
          },
          trends: {
            thisMonth: 87.3,
            lastMonth: 84.1,
            improvement: 3.2
          }
        },
        class: {
          classAverage: 78.5,
          totalStudents: 25,
          gradeDistribution: {
            'AA': 3,
            'BA': 8,
            'BB': 7,
            'CB': 5,
            'CC': 2
          }
        },
        subject: {
          subjectAverage: 82.3,
          participatingStudents: 25,
          highestGrade: 95,
          lowestGrade: 65,
          standardDeviation: 8.4
        },
        teacher: {
          averageGradeGiven: 81.2,
          totalGradesGiven: 156,
          subjectsCount: 3,
            classesCount: 4
        },
        trends: {
          monthly: [78.2, 80.1, 82.5, 81.9],
          weekly: [83.1, 82.7, 84.2, 81.5]
        },
        distribution: {
          'A': 15,
          'B': 35,
          'C': 30,
          'D': 15,
          'F': 5
        },
        comparison: {
          thisClass: 82.3,
          schoolAverage: 79.1,
          improvement: 3.2
        }
      };
      
      return NextResponse.json({
        success: true,
        data: mockGradeData[validatedQuery.type as keyof typeof mockGradeData] || mockGradeData.student,
        type: validatedQuery.type,
        generatedAt: new Date().toISOString(),
      });
    }
    
    // Initialize repository
    const gradeRepo = new GradeRepository(supabase, tenantId);

    let result;

    switch (validatedQuery.type) {
      case 'student':
        if (!validatedQuery.studentId) {
          return NextResponse.json(
            { error: 'Student ID is required for student analytics' },
            { status: 400 }
          );
        }

        result = await generateStudentAnalytics(
          gradeRepo,
          validatedQuery.studentId,
          validatedQuery.subjectId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeDetails,
          validatedQuery.includeComparisons
        );
        break;

      case 'class':
        if (!validatedQuery.classId) {
          return NextResponse.json(
            { error: 'Class ID is required for class analytics' },
            { status: 400 }
          );
        }

        result = await generateClassAnalytics(
          gradeRepo,
          validatedQuery.classId,
          validatedQuery.subjectId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeDetails
        );
        break;

      case 'subject':
        if (!validatedQuery.subjectId) {
          return NextResponse.json(
            { error: 'Subject ID is required for subject analytics' },
            { status: 400 }
          );
        }

        result = await generateSubjectAnalytics(
          gradeRepo,
          validatedQuery.subjectId,
          validatedQuery.classId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeDetails
        );
        break;

      case 'teacher':
        if (!validatedQuery.teacherId) {
          return NextResponse.json(
            { error: 'Teacher ID is required for teacher analytics' },
            { status: 400 }
          );
        }

        result = await generateTeacherAnalytics(
          gradeRepo,
          validatedQuery.teacherId,
          validatedQuery.subjectId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeDetails
        );
        break;

      case 'trends':
        result = await generateTrendsAnalytics(
          gradeRepo,
          validatedQuery.studentId,
          validatedQuery.classId,
          validatedQuery.subjectId,
          validatedQuery.timePeriod,
          validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
          validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined
        );
        break;

      case 'distribution':
        result = await generateDistributionAnalytics(
          gradeRepo,
          validatedQuery.classId,
          validatedQuery.subjectId,
          validatedQuery.gradeType,
          validatedQuery.semester,
          validatedQuery.academicYear
        );
        break;

      case 'comparison':
        result = await generateComparisonAnalytics(
          gradeRepo,
          validatedQuery.classId,
          validatedQuery.subjectId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeDetails
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      type: validatedQuery.type,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating grade analytics:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
  }
}

/**
 * Generate student-specific analytics
 */
async function generateStudentAnalytics(
  gradeRepo: GradeRepository,
  studentId: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  includeDetails: boolean = false,
  includeComparisons: boolean = false
) {
  const studentGrades = await gradeRepo.getStudentGrades(studentId, {
    subjectId,
    semester,
    academicYear,
    includeCalculations: true,
  });

  const studentStats = await gradeRepo.getStudentGradeStatistics(
    studentId,
    subjectId,
    semester,
    academicYear
  );

  const gradeDistribution = await gradeRepo.getStudentGradeDistribution(
    studentId,
    subjectId,
    semester,
    academicYear
  );

  let classRankings = null;
  let subjectComparisons = null;

  if (includeComparisons) {
    classRankings = await gradeRepo.getStudentClassRankings(studentId, semester, academicYear);

    subjectComparisons = await gradeRepo.getStudentSubjectComparisons(
      studentId,
      semester,
      academicYear
    );
  }

  return {
    statistics: studentStats,
    gradeDistribution,
    recentGrades: includeDetails ? studentGrades.slice(0, 10) : undefined,
    classRankings,
    subjectComparisons,
    totalGrades: studentGrades.length,
  };
}

/**
 * Generate class-specific analytics
 */
async function generateClassAnalytics(
  gradeRepo: GradeRepository,
  classId: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  includeDetails: boolean = false
) {
  const classStats = await gradeRepo.getClassGradeStatistics(
    classId,
    subjectId,
    semester,
    academicYear
  );

  const gradeDistribution = await gradeRepo.getClassGradeDistribution(
    classId,
    subjectId,
    semester,
    academicYear
  );

  const topPerformers = await gradeRepo.getClassTopPerformers(
    classId,
    subjectId,
    semester,
    academicYear,
    5
  );

  const strugglingStudents = await gradeRepo.getClassStrugglingStudents(
    classId,
    subjectId,
    semester,
    academicYear,
    5
  );

  let subjectBreakdown = null;
  if (includeDetails && !subjectId) {
    subjectBreakdown = await gradeRepo.getClassSubjectBreakdown(classId, semester, academicYear);
  }

  return {
    statistics: classStats,
    gradeDistribution,
    topPerformers,
    strugglingStudents,
    subjectBreakdown,
  };
}

/**
 * Generate subject-specific analytics
 */
async function generateSubjectAnalytics(
  gradeRepo: GradeRepository,
  subjectId: string,
  classId?: string,
  semester?: number,
  academicYear?: string,
  includeDetails: boolean = false
) {
  const subjectStats = await gradeRepo.getSubjectGradeStatistics(
    subjectId,
    classId,
    semester,
    academicYear
  );

  const gradeDistribution = await gradeRepo.getSubjectGradeDistribution(
    subjectId,
    classId,
    semester,
    academicYear
  );

  const gradeTypeBreakdown = await gradeRepo.getSubjectGradeTypeBreakdown(
    subjectId,
    classId,
    semester,
    academicYear
  );

  let classComparisons = null;
  if (includeDetails && !classId) {
    classComparisons = await gradeRepo.getSubjectClassComparisons(
      subjectId,
      semester,
      academicYear
    );
  }

  return {
    statistics: subjectStats,
    gradeDistribution,
    gradeTypeBreakdown,
    classComparisons,
  };
}

/**
 * Generate teacher-specific analytics
 */
async function generateTeacherAnalytics(
  gradeRepo: GradeRepository,
  teacherId: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  includeDetails: boolean = false
) {
  const teacherStats = await gradeRepo.getTeacherGradeStatistics(
    teacherId,
    subjectId,
    semester,
    academicYear
  );

  const gradingPatterns = await gradeRepo.getTeacherGradingPatterns(
    teacherId,
    subjectId,
    semester,
    academicYear
  );

  let classBreakdown = null;
  let subjectBreakdown = null;

  if (includeDetails) {
    classBreakdown = await gradeRepo.getTeacherClassBreakdown(teacherId, semester, academicYear);

    if (!subjectId) {
      subjectBreakdown = await gradeRepo.getTeacherSubjectBreakdown(
        teacherId,
        semester,
        academicYear
      );
    }
  }

  return {
    statistics: teacherStats,
    gradingPatterns,
    classBreakdown,
    subjectBreakdown,
  };
}

/**
 * Generate trends analytics
 */
async function generateTrendsAnalytics(
  gradeRepo: GradeRepository,
  studentId?: string,
  classId?: string,
  subjectId?: string,
  timePeriod: 'week' | 'month' | 'semester' | 'year' = 'semester',
  startDate?: Date,
  endDate?: Date
) {
  const trends = await gradeRepo.getGradeTrends(timePeriod, {
    studentId,
    classId,
    subjectId,
    startDate,
    endDate,
  });

  const performanceTrends = await gradeRepo.getPerformanceTrends(timePeriod, {
    studentId,
    classId,
    subjectId,
    startDate,
    endDate,
  });

  return {
    trends,
    performanceTrends,
    timePeriod,
    dateRange: {
      start: startDate?.toISOString(),
      end: endDate?.toISOString(),
    },
  };
}

/**
 * Generate distribution analytics
 */
async function generateDistributionAnalytics(
  gradeRepo: GradeRepository,
  classId?: string,
  subjectId?: string,
  gradeType?: string,
  semester?: number,
  academicYear?: string
) {
  const distribution = await gradeRepo.getGradeDistribution(
    classId,
    subjectId,
    gradeType,
    semester,
    academicYear
  );

  const letterGradeDistribution = await gradeRepo.getLetterGradeDistribution(
    classId,
    subjectId,
    gradeType,
    semester,
    academicYear
  );

  const percentileRanges = await gradeRepo.getPercentileRanges(
    classId,
    subjectId,
    gradeType,
    semester,
    academicYear
  );

  return {
    distribution,
    letterGradeDistribution,
    percentileRanges,
  };
}

/**
 * Generate comparison analytics
 */
async function generateComparisonAnalytics(
  gradeRepo: GradeRepository,
  classId?: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  includeDetails: boolean = false
) {
  const classComparisons = await gradeRepo.getClassComparisons(semester, academicYear, subjectId);

  const subjectComparisons = await gradeRepo.getSubjectComparisons(classId, semester, academicYear);

  let historicalComparisons = null;
  if (includeDetails) {
    historicalComparisons = await gradeRepo.getHistoricalComparisons(
      classId,
      subjectId,
      semester,
      academicYear
    );
  }

  return {
    classComparisons,
    subjectComparisons,
    historicalComparisons,
  };
}
