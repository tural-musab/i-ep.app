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
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

// Validation schemas
const StatisticsQuerySchema = z.object({
  type: z.enum(['student', 'class', 'trends', 'chronic', 'perfect']).default('student'),
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

    const validatedQuery = StatisticsQuerySchema.parse(queryParams);

    // Development environment mock data bypass
    if (process.env.NODE_ENV === 'development') {
      const mockAttendanceData = {
        student: {
          totalDays: 180,
          presentDays: 165,
          absentDays: 15,
          lateArrivals: 8,
          attendanceRate: 91.7,
          trends: {
            thisMonth: 95.2,
            lastMonth: 88.4,
            improvement: 6.8
          }
        },
        class: {
          totalStudents: 25,
          averageAttendance: 89.5,
          presentToday: 23,
          absentToday: 2,
          lateToday: 1
        },
        trends: {
          daily: [92, 88, 95, 89, 91, 87, 93],
          weekly: [89.2, 91.5, 88.7, 92.1]
        },
        chronic: [
          {
            studentId: 'student-1',
            studentName: 'Ahmet Yılmaz',
            absenceRate: 25.5,
            totalAbsences: 46
          }
        ],
        perfect: [
          {
            studentId: 'student-2',
            studentName: 'Zeynep Kaya',
            attendanceRate: 100,
            consecutiveDays: 180
          }
        ]
      };
      
      return NextResponse.json({
        success: true,
        data: mockAttendanceData[validatedQuery.type as keyof typeof mockAttendanceData] || mockAttendanceData.student,
        type: validatedQuery.type,
      });
    }
    
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
        return NextResponse.json({ error: 'Invalid statistics type' }, { status: 400 });
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

    return NextResponse.json({ error: 'Failed to fetch attendance statistics' }, { status: 500 });
  }
}
