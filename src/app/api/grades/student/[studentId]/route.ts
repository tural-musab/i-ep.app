/**
 * Student Grade API - Student-Specific Route
 * İ-EP.APP - Student Grade Access System
 * 
 * Endpoints:
 * - GET /api/grades/student/[studentId] - Get all grades for a specific student
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { GradeRepository } from '@/lib/repository/grade-repository';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { z } from 'zod';

// Student grade query validation
const StudentGradeQuerySchema = z.object({
  semester: z.string().transform(Number).optional(),
  academicYear: z.string().optional(),
  subjectId: z.string().uuid().optional(),
  gradeType: z.enum(['exam', 'homework', 'project', 'participation', 'quiz', 'midterm', 'final']).optional(),
  includeAnalytics: z.string().transform(Boolean).optional().default(true),
  includeHistory: z.string().transform(Boolean).optional().default(false),
});

// Turkish grade mapping helper
const getTurkishGrade = (percentage: number): string => {
  if (percentage >= 90) return 'AA';
  if (percentage >= 85) return 'BA';
  if (percentage >= 75) return 'BB';
  if (percentage >= 70) return 'CB';
  if (percentage >= 60) return 'CC';
  if (percentage >= 55) return 'DC';
  if (percentage >= 50) return 'DD';
  return 'FF';
};

// GPA calculation helper
const calculateGPA = (grades: any[]): number => {
  const gradePoints: { [key: string]: number } = {
    'AA': 4.0, 'BA': 3.5, 'BB': 3.0, 'CB': 2.5,
    'CC': 2.0, 'DC': 1.5, 'DD': 1.0, 'FF': 0.0
  };

  let totalPoints = 0;
  let totalCredits = 0;

  grades.forEach(grade => {
    const percentage = (grade.gradeValue / grade.maxGrade) * 100;
    const letterGrade = getTurkishGrade(percentage);
    const points = gradePoints[letterGrade] || 0;
    const credits = grade.credits || 1;
    
    totalPoints += points * credits;
    totalCredits += credits;
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
};

/**
 * GET /api/grades/student/[studentId]
 * Get all grades for a specific student with analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
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

    // Validate studentId parameter
    const studentId = params.studentId;
    if (!studentId || !z.string().uuid().safeParse(studentId).success) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = StudentGradeQuerySchema.parse(queryParams);

    // Initialize repository
    const gradeRepo = new GradeRepository(supabase, tenantId);

    // Verify student access permissions
    // Students can only view their own grades
    // Teachers and admins can view their students' grades
    const userRole = session.user.user_metadata?.role;
    if (userRole === 'student' && session.user.id !== studentId) {
      return NextResponse.json(
        { error: 'Access denied: You can only view your own grades' },
        { status: 403 }
      );
    }

    // Build query options for student grades
    const queryOptions = {
      studentId,
      semester: validatedQuery.semester,
      academicYear: validatedQuery.academicYear || '2024-2025',
      subjectId: validatedQuery.subjectId,
      gradeType: validatedQuery.gradeType,
      includeCalculations: true,
      includeComments: true,
      limit: 1000, // Get all grades for the student
      offset: 0,
    };

    // Get student grades
    const grades = await gradeRepo.getGrades(queryOptions);

    // Get student information
    const { data: studentInfo } = await supabase
      .from('students')
      .select(`
        id,
        first_name,
        last_name,
        student_number,
        birth_date,
        user_id,
        classes:class_students!inner(
          classes(
            id,
            name,
            grade_level,
            academic_year
          )
        )
      `)
      .eq('id', studentId)
      .eq('tenant_id', tenantId)
      .single();

    if (!studentInfo) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Process grades by subject
    const subjectGrades: { [key: string]: any } = {};
    let allGrades: any[] = [];

    grades.forEach((grade: any) => {
      const subjectKey = grade.subject_id;
      if (!subjectGrades[subjectKey]) {
        subjectGrades[subjectKey] = {
          subjectId: grade.subject_id,
          subjectName: grade.subject_name || 'Unknown Subject',
          teacherId: grade.teacher_id,
          teacherName: grade.teacher_name || 'Unknown Teacher',
          credits: grade.credits || 3,
          grades: [],
          average: 0,
          letterGrade: 'FF',
          semester: grade.semester,
        };
      }

      const percentage = (grade.gradeValue / grade.maxGrade) * 100;
      const gradeEntry = {
        id: grade.id,
        type: grade.gradeType,
        examName: grade.examName || grade.gradeType,
        score: percentage,
        rawScore: grade.gradeValue,
        maxScore: grade.maxGrade,
        date: grade.gradeDate,
        grade: getTurkishGrade(percentage),
        weight: grade.weight || 1.0,
        description: grade.description,
      };

      subjectGrades[subjectKey].grades.push(gradeEntry);
      allGrades.push({
        ...gradeEntry,
        subjectName: subjectGrades[subjectKey].subjectName,
        credits: subjectGrades[subjectKey].credits,
      });
    });

    // Calculate averages for each subject
    Object.values(subjectGrades).forEach((subject: any) => {
      if (subject.grades.length > 0) {
        const weightedSum = subject.grades.reduce((sum: number, grade: any) => 
          sum + (grade.score * grade.weight), 0
        );
        const totalWeight = subject.grades.reduce((sum: number, grade: any) => 
          sum + grade.weight, 0
        );
        subject.average = totalWeight > 0 ? weightedSum / totalWeight : 0;
        subject.letterGrade = getTurkishGrade(subject.average);
      }
    });

    // Calculate overall statistics
    const subjects = Object.values(subjectGrades);
    const currentGPA = calculateGPA(allGrades);
    
    // Calculate semester statistics
    const semesterStats = {
      totalSubjects: subjects.length,
      totalCredits: subjects.reduce((sum: number, subject: any) => sum + subject.credits, 0),
      passedCredits: subjects.filter((s: any) => s.average >= 50).reduce((sum: number, subject: any) => sum + subject.credits, 0),
      gpa: parseFloat(currentGPA.toFixed(2)),
      averageGrade: subjects.length > 0 ? 
        subjects.reduce((sum: number, subject: any) => sum + subject.average, 0) / subjects.length : 0,
      highestGrade: subjects.length > 0 ? 
        Math.max(...subjects.map((s: any) => s.average)) : 0,
      lowestGrade: subjects.length > 0 ? 
        Math.min(...subjects.map((s: any) => s.average)) : 0,
    };

    // Analytics (if requested)
    let analytics = null;
    if (validatedQuery.includeAnalytics) {
      analytics = {
        performanceTrend: 'stable', // TODO: Calculate from historical data
        strongSubjects: subjects
          .filter((s: any) => s.average >= 85)
          .map((s: any) => ({ name: s.subjectName, average: s.average })),
        improvementAreas: subjects
          .filter((s: any) => s.average < 75 && s.average >= 50)
          .map((s: any) => ({ name: s.subjectName, average: s.average })),
        failingSubjects: subjects
          .filter((s: any) => s.average < 50)
          .map((s: any) => ({ name: s.subjectName, average: s.average })),
        gradeDistribution: {
          'AA': subjects.filter((s: any) => s.letterGrade === 'AA').length,
          'BA': subjects.filter((s: any) => s.letterGrade === 'BA').length,
          'BB': subjects.filter((s: any) => s.letterGrade === 'BB').length,
          'CB': subjects.filter((s: any) => s.letterGrade === 'CB').length,
          'CC': subjects.filter((s: any) => s.letterGrade === 'CC').length,
          'DC': subjects.filter((s: any) => s.letterGrade === 'DC').length,
          'DD': subjects.filter((s: any) => s.letterGrade === 'DD').length,
          'FF': subjects.filter((s: any) => s.letterGrade === 'FF').length,
        },
      };
    }

    // Student history (if requested)
    let history = null;
    if (validatedQuery.includeHistory) {
      // TODO: Implement historical semester data
      history = {
        previousSemesters: [],
        overallGPA: currentGPA,
        totalCreditsEarned: semesterStats.passedCredits,
        academicStanding: currentGPA >= 3.0 ? 'Good' : currentGPA >= 2.0 ? 'Satisfactory' : 'Probation',
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: studentInfo.id,
          name: `${studentInfo.first_name} ${studentInfo.last_name}`,
          studentNumber: studentInfo.student_number,
          class: studentInfo.classes?.[0]?.classes?.name || 'Unknown Class',
          classId: studentInfo.classes?.[0]?.classes?.id,
          gradeLevel: studentInfo.classes?.[0]?.classes?.grade_level,
        },
        currentSemester: validatedQuery.academicYear || '2024-2025',
        subjects: subjects,
        semesterStats,
        analytics,
        history,
      },
      meta: {
        totalGrades: allGrades.length,
        lastUpdated: new Date().toISOString(),
        academicYear: validatedQuery.academicYear || '2024-2025',
        semester: validatedQuery.semester || 'Güz',
      },
    });

  } catch (error) {
    console.error('Error fetching student grades:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch student grades' },
      { status: 500 }
    );
  }
}