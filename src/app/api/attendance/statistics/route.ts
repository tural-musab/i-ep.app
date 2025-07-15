/**
 * Attendance Statistics API Route
 * İ-EP.APP - Attendance Management System
 * 
 * Endpoints:
 * - GET /api/attendance/statistics - Get attendance statistics and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AttendanceRepository } from '@/lib/repository/attendance-repository';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { z } from 'zod';

// Validation schemas
const StatisticsQuerySchema = z.object({
  type: z.enum(['student', 'class', 'trends', 'chronic', 'perfect']),
  studentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  days: z.string().transform(Number).optional(),
  threshold: z.string().transform(Number).optional(),
});

/**
 * GET /api/attendance/statistics
 * Get attendance statistics and analytics
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
    
    const validatedQuery = StatisticsQuerySchema.parse(queryParams);
    
    // Initialize repository
    const attendanceRepo = new AttendanceRepository(supabase, tenantId);
    
    let result;

    switch (validatedQuery.type) {
      case 'student':
        if (!validatedQuery.studentId) {
          return NextResponse.json(
            { error: 'Student ID is required for student statistics' },
            { status: 400 }
          );
        }
        
        result = await attendanceRepo.getStudentAttendanceStats(
          validatedQuery.studentId,
          validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
          validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined
        );
        break;

      case 'class':
        if (!validatedQuery.classId) {
          return NextResponse.json(
            { error: 'Class ID is required for class statistics' },
            { status: 400 }
          );
        }
        
        result = await attendanceRepo.getClassAttendanceSummary(
          validatedQuery.classId,
          validatedQuery.startDate ? new Date(validatedQuery.startDate) : new Date()
        );
        break;

      case 'trends':
        if (!validatedQuery.studentId) {
          return NextResponse.json(
            { error: 'Student ID is required for attendance trends' },
            { status: 400 }
          );
        }
        
        result = await attendanceRepo.getAttendanceTrends(
          validatedQuery.studentId,
          validatedQuery.days || 30
        );
        break;

      case 'chronic':
        result = await attendanceRepo.getChronicAbsentees(
          validatedQuery.classId,
          validatedQuery.threshold || 20,
          validatedQuery.days || 30
        );
        break;

      case 'perfect':
        result = await attendanceRepo.getPerfectAttendanceStudents(
          validatedQuery.classId,
          validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
          validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid statistics type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      type: validatedQuery.type,
    });

  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch attendance statistics' },
      { status: 500 }
    );
  }
}