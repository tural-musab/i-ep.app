/**
 * Grade Calculations API Route
 * İ-EP.APP - Grade Management System
 * 
 * Endpoints:
 * - GET /api/grades/calculations - Get grade calculations and statistics
 * - POST /api/grades/calculations - Trigger grade calculations
 * - PUT /api/grades/calculations - Update grade configurations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { GradeRepository } from '@/lib/repository/grade-repository';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { z } from 'zod';

// Validation schemas
const CalculationQuerySchema = z.object({
  type: z.enum(['student', 'class', 'subject', 'bulk']),
  studentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  semester: z.string().transform(Number).optional(),
  academicYear: z.string().optional(),
  includeDetails: z.string().transform(Boolean).optional().default(false),
  recalculate: z.string().transform(Boolean).optional().default(false),
});

const CalculationTriggerSchema = z.object({
  type: z.enum(['student', 'class', 'subject', 'bulk']),
  studentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  semester: z.number().int().min(1).max(2).optional(),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid academic year format').optional(),
  force: z.boolean().optional().default(false),
});

const ConfigurationUpdateSchema = z.object({
  configurations: z.array(z.object({
    subjectId: z.string().uuid('Invalid subject ID'),
    classId: z.string().uuid('Invalid class ID').optional(),
    gradeType: z.enum(['exam', 'homework', 'project', 'participation', 'quiz', 'midterm', 'final']),
    weight: z.number().min(0).max(1),
    minGrade: z.number().min(0).optional().default(0),
    maxGrade: z.number().min(1).optional().default(100),
    passingGrade: z.number().min(0).optional().default(50),
    honorRollGrade: z.number().min(0).optional().default(85),
    isRequired: z.boolean().optional().default(true),
    allowsMakeup: z.boolean().optional().default(false),
    semester: z.number().int().min(1).max(2),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid academic year format'),
  })),
});

/**
 * GET /api/grades/calculations
 * Get grade calculations and statistics
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
    
    const validatedQuery = CalculationQuerySchema.parse(queryParams);
    
    // Initialize repository
    const gradeRepo = new GradeRepository(supabase, tenantId);
    
    let result;

    switch (validatedQuery.type) {
      case 'student':
        if (!validatedQuery.studentId) {
          return NextResponse.json(
            { error: 'Student ID is required for student calculations' },
            { status: 400 }
          );
        }
        
        result = await getStudentCalculations(
          gradeRepo,
          validatedQuery.studentId,
          validatedQuery.subjectId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeDetails,
          validatedQuery.recalculate
        );
        break;

      case 'class':
        if (!validatedQuery.classId) {
          return NextResponse.json(
            { error: 'Class ID is required for class calculations' },
            { status: 400 }
          );
        }
        
        result = await getClassCalculations(
          gradeRepo,
          validatedQuery.classId,
          validatedQuery.subjectId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeDetails,
          validatedQuery.recalculate
        );
        break;

      case 'subject':
        if (!validatedQuery.subjectId) {
          return NextResponse.json(
            { error: 'Subject ID is required for subject calculations' },
            { status: 400 }
          );
        }
        
        result = await getSubjectCalculations(
          gradeRepo,
          validatedQuery.subjectId,
          validatedQuery.classId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeDetails,
          validatedQuery.recalculate
        );
        break;

      case 'bulk':
        result = await getBulkCalculations(
          gradeRepo,
          validatedQuery.classId,
          validatedQuery.subjectId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeDetails,
          validatedQuery.recalculate
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid calculation type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      type: validatedQuery.type,
      calculatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting grade calculations:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to get calculations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/grades/calculations
 * Trigger grade calculations
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CalculationTriggerSchema.parse(body);
    
    // Initialize repository
    const gradeRepo = new GradeRepository(supabase, tenantId);
    
    let result;

    switch (validatedData.type) {
      case 'student':
        if (!validatedData.studentId) {
          return NextResponse.json(
            { error: 'Student ID is required for student calculations' },
            { status: 400 }
          );
        }
        
        result = await triggerStudentCalculations(
          gradeRepo,
          validatedData.studentId,
          validatedData.subjectId,
          validatedData.semester,
          validatedData.academicYear,
          validatedData.force
        );
        break;

      case 'class':
        if (!validatedData.classId) {
          return NextResponse.json(
            { error: 'Class ID is required for class calculations' },
            { status: 400 }
          );
        }
        
        result = await triggerClassCalculations(
          gradeRepo,
          validatedData.classId,
          validatedData.subjectId,
          validatedData.semester,
          validatedData.academicYear,
          validatedData.force
        );
        break;

      case 'subject':
        if (!validatedData.subjectId) {
          return NextResponse.json(
            { error: 'Subject ID is required for subject calculations' },
            { status: 400 }
          );
        }
        
        result = await triggerSubjectCalculations(
          gradeRepo,
          validatedData.subjectId,
          validatedData.classId,
          validatedData.semester,
          validatedData.academicYear,
          validatedData.force
        );
        break;

      case 'bulk':
        result = await triggerBulkCalculations(
          gradeRepo,
          validatedData.classId,
          validatedData.subjectId,
          validatedData.semester,
          validatedData.academicYear,
          validatedData.force
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid calculation type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Calculations triggered successfully',
    });

  } catch (error) {
    console.error('Error triggering calculations:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to trigger calculations' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/grades/calculations
 * Update grade configurations
 */
export async function PUT(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ConfigurationUpdateSchema.parse(body);
    
    // Initialize repository
    const gradeRepo = new GradeRepository(supabase, tenantId);
    
    // Verify user has permission to update configurations
    const hasPermission = await gradeRepo.verifyConfigurationUpdatePermission(
      session.user.id
    );
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update grade configurations' },
        { status: 403 }
      );
    }

    // Update configurations
    const updatedConfigurations = await gradeRepo.updateGradeConfigurations(
      validatedData.configurations
    );

    // Trigger recalculations for affected entities
    const recalculationResults = await Promise.all(
      validatedData.configurations.map(config => 
        gradeRepo.triggerRecalculationForConfiguration(
          config.subjectId,
          config.classId,
          config.semester,
          config.academicYear
        )
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        configurations: updatedConfigurations,
        recalculations: recalculationResults,
      },
      message: 'Grade configurations updated successfully',
    });

  } catch (error) {
    console.error('Error updating grade configurations:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update configurations' },
      { status: 500 }
    );
  }
}

/**
 * Get student calculations
 */
async function getStudentCalculations(
  gradeRepo: GradeRepository,
  studentId: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  includeDetails: boolean = false,
  recalculate: boolean = false
) {
  if (recalculate) {
    await gradeRepo.recalculateStudentGrades(studentId, subjectId, semester, academicYear);
  }

  const calculations = await gradeRepo.getStudentGradeCalculations(
    studentId,
    semester,
    academicYear,
    subjectId
  );

  const gpa = await gradeRepo.calculateStudentGPA(studentId, semester, academicYear);
  
  let details = null;
  if (includeDetails) {
    details = await gradeRepo.getStudentCalculationDetails(
      studentId,
      subjectId,
      semester,
      academicYear
    );
  }

  return {
    calculations,
    gpa,
    details,
    summary: {
      totalSubjects: calculations.length,
      passingSubjects: calculations.filter(calc => calc.isPassing).length,
      honorRollSubjects: calculations.filter(calc => calc.isHonorRoll).length,
      averageGPA: gpa,
    },
  };
}

/**
 * Get class calculations
 */
async function getClassCalculations(
  gradeRepo: GradeRepository,
  classId: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  includeDetails: boolean = false,
  recalculate: boolean = false
) {
  if (recalculate) {
    await gradeRepo.recalculateClassGrades(classId, subjectId, semester, academicYear);
  }

  const calculations = await gradeRepo.getClassGradeCalculations(
    classId,
    semester,
    academicYear,
    subjectId
  );

  const statistics = await gradeRepo.getClassGradeStatistics(
    classId,
    subjectId,
    semester,
    academicYear
  );

  let details = null;
  if (includeDetails) {
    details = await gradeRepo.getClassCalculationDetails(
      classId,
      subjectId,
      semester,
      academicYear
    );
  }

  return {
    calculations,
    statistics,
    details,
    summary: {
      totalStudents: calculations.length,
      passingStudents: calculations.filter(calc => calc.isPassing).length,
      honorRollStudents: calculations.filter(calc => calc.isHonorRoll).length,
      averageGPA: statistics.averageGPA,
    },
  };
}

/**
 * Get subject calculations
 */
async function getSubjectCalculations(
  gradeRepo: GradeRepository,
  subjectId: string,
  classId?: string,
  semester?: number,
  academicYear?: string,
  includeDetails: boolean = false,
  recalculate: boolean = false
) {
  if (recalculate) {
    await gradeRepo.recalculateSubjectGrades(subjectId, classId, semester, academicYear);
  }

  const calculations = await gradeRepo.getSubjectGradeCalculations(
    subjectId,
    classId,
    semester,
    academicYear
  );

  const statistics = await gradeRepo.getSubjectGradeStatistics(
    subjectId,
    classId,
    semester,
    academicYear
  );

  let details = null;
  if (includeDetails) {
    details = await gradeRepo.getSubjectCalculationDetails(
      subjectId,
      classId,
      semester,
      academicYear
    );
  }

  return {
    calculations,
    statistics,
    details,
    summary: {
      totalStudents: calculations.length,
      passingStudents: calculations.filter(calc => calc.isPassing).length,
      honorRollStudents: calculations.filter(calc => calc.isHonorRoll).length,
      averageGrade: statistics.averageGrade,
    },
  };
}

/**
 * Get bulk calculations
 */
async function getBulkCalculations(
  gradeRepo: GradeRepository,
  classId?: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  includeDetails: boolean = false,
  recalculate: boolean = false
) {
  if (recalculate) {
    await gradeRepo.recalculateBulkGrades(classId, subjectId, semester, academicYear);
  }

  const calculations = await gradeRepo.getBulkGradeCalculations(
    classId,
    subjectId,
    semester,
    academicYear
  );

  const statistics = await gradeRepo.getBulkGradeStatistics(
    classId,
    subjectId,
    semester,
    academicYear
  );

  let details = null;
  if (includeDetails) {
    details = await gradeRepo.getBulkCalculationDetails(
      classId,
      subjectId,
      semester,
      academicYear
    );
  }

  return {
    calculations,
    statistics,
    details,
    summary: {
      totalCalculations: calculations.length,
      affectedStudents: [...new Set(calculations.map(calc => calc.studentId))].length,
      affectedSubjects: [...new Set(calculations.map(calc => calc.subjectId))].length,
      affectedClasses: [...new Set(calculations.map(calc => calc.classId))].length,
    },
  };
}

/**
 * Trigger student calculations
 */
async function triggerStudentCalculations(
  gradeRepo: GradeRepository,
  studentId: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  force: boolean = false
) {
  const result = await gradeRepo.triggerStudentCalculations(
    studentId,
    subjectId,
    semester,
    academicYear,
    force
  );

  return {
    studentId,
    subjectId,
    semester,
    academicYear,
    calculationsTriggered: result.calculationsTriggered,
    calculationsUpdated: result.calculationsUpdated,
    force,
    triggeredAt: new Date().toISOString(),
  };
}

/**
 * Trigger class calculations
 */
async function triggerClassCalculations(
  gradeRepo: GradeRepository,
  classId: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  force: boolean = false
) {
  const result = await gradeRepo.triggerClassCalculations(
    classId,
    subjectId,
    semester,
    academicYear,
    force
  );

  return {
    classId,
    subjectId,
    semester,
    academicYear,
    calculationsTriggered: result.calculationsTriggered,
    calculationsUpdated: result.calculationsUpdated,
    studentsAffected: result.studentsAffected,
    force,
    triggeredAt: new Date().toISOString(),
  };
}

/**
 * Trigger subject calculations
 */
async function triggerSubjectCalculations(
  gradeRepo: GradeRepository,
  subjectId: string,
  classId?: string,
  semester?: number,
  academicYear?: string,
  force: boolean = false
) {
  const result = await gradeRepo.triggerSubjectCalculations(
    subjectId,
    classId,
    semester,
    academicYear,
    force
  );

  return {
    subjectId,
    classId,
    semester,
    academicYear,
    calculationsTriggered: result.calculationsTriggered,
    calculationsUpdated: result.calculationsUpdated,
    studentsAffected: result.studentsAffected,
    force,
    triggeredAt: new Date().toISOString(),
  };
}

/**
 * Trigger bulk calculations
 */
async function triggerBulkCalculations(
  gradeRepo: GradeRepository,
  classId?: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  force: boolean = false
) {
  const result = await gradeRepo.triggerBulkCalculations(
    classId,
    subjectId,
    semester,
    academicYear,
    force
  );

  return {
    classId,
    subjectId,
    semester,
    academicYear,
    calculationsTriggered: result.calculationsTriggered,
    calculationsUpdated: result.calculationsUpdated,
    studentsAffected: result.studentsAffected,
    subjectsAffected: result.subjectsAffected,
    classesAffected: result.classesAffected,
    force,
    triggeredAt: new Date().toISOString(),
  };
}