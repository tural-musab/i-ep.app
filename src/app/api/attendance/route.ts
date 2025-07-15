/**
 * Attendance API - Main Route
 * İ-EP.APP - Attendance Management System
 * 
 * Endpoints:
 * - GET /api/attendance - List attendance records with filtering
 * - POST /api/attendance - Create new attendance record
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AttendanceRepository } from '@/lib/repository/attendance-repository';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { z } from 'zod';

// Validation schemas
const AttendanceCreateSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  classId: z.string().uuid('Invalid class ID'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  status: z.enum(['present', 'absent', 'late', 'excused', 'sick']),
  timeIn: z.string().optional(),
  timeOut: z.string().optional(),
  notes: z.string().optional(),
  excuseReason: z.string().optional(),
  excuseDocument: z.string().optional(),
});

const AttendanceQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['present', 'absent', 'late', 'excused', 'sick']).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

const AttendanceBulkCreateSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  attendance: z.array(z.object({
    studentId: z.string().uuid('Invalid student ID'),
    status: z.enum(['present', 'absent', 'late', 'excused', 'sick']),
    timeIn: z.string().optional(),
    timeOut: z.string().optional(),
    notes: z.string().optional(),
    excuseReason: z.string().optional(),
  })).min(1, 'At least one attendance record is required'),
});

/**
 * GET /api/attendance
 * Retrieve attendance records with filtering options
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
    
    const validatedQuery = AttendanceQuerySchema.parse(queryParams);
    
    // Initialize repository
    const attendanceRepo = new AttendanceRepository(supabase, tenantId);
    
    // Build query options
    const queryOptions = {
      studentId: validatedQuery.studentId,
      classId: validatedQuery.classId,
      date: validatedQuery.date ? new Date(validatedQuery.date) : undefined,
      startDate: validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
      endDate: validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined,
      status: validatedQuery.status,
      limit: validatedQuery.limit || 50,
      offset: validatedQuery.offset || 0,
    };

    // Get attendance records
    const attendanceRecords = await attendanceRepo.getAttendanceRecords(queryOptions);
    
    // Get total count for pagination
    const totalCount = await attendanceRepo.getAttendanceRecordsCount(queryOptions);

    return NextResponse.json({
      data: attendanceRecords,
      pagination: {
        total: totalCount,
        limit: queryOptions.limit,
        offset: queryOptions.offset,
        hasMore: (queryOptions.offset + queryOptions.limit) < totalCount,
      },
    });

  } catch (error) {
    console.error('Error fetching attendance records:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance
 * Create new attendance record or bulk create
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
    const attendanceRepo = new AttendanceRepository(supabase, tenantId);

    // Check if this is a bulk create request
    if (body.attendance && Array.isArray(body.attendance)) {
      // Bulk create
      const validatedData = AttendanceBulkCreateSchema.parse(body);
      
      // Verify class exists and user has permission
      const classExists = await attendanceRepo.verifyClassAccess(validatedData.classId);
      if (!classExists) {
        return NextResponse.json(
          { error: 'Class not found or access denied' },
          { status: 403 }
        );
      }

      // Create bulk attendance records
      const createdRecords = await attendanceRepo.createBulkAttendance(
        validatedData.classId,
        new Date(validatedData.date),
        validatedData.attendance.map(record => ({
          studentId: record.studentId,
          status: record.status,
          timeIn: record.timeIn,
          timeOut: record.timeOut,
          notes: record.notes,
          excuseReason: record.excuseReason,
          markedBy: session.user.id,
        }))
      );

      return NextResponse.json({
        success: true,
        data: createdRecords,
        message: `${createdRecords.length} attendance records created successfully`,
      }, { status: 201 });

    } else {
      // Single create
      const validatedData = AttendanceCreateSchema.parse(body);
      
      // Verify student and class exist and user has permission
      const studentExists = await attendanceRepo.verifyStudentAccess(validatedData.studentId);
      const classExists = await attendanceRepo.verifyClassAccess(validatedData.classId);
      
      if (!studentExists || !classExists) {
        return NextResponse.json(
          { error: 'Student or class not found or access denied' },
          { status: 403 }
        );
      }

      // Check if attendance already exists for this student on this date
      const existingAttendance = await attendanceRepo.getAttendanceByStudentAndDate(
        validatedData.studentId,
        new Date(validatedData.date)
      );

      if (existingAttendance) {
        return NextResponse.json(
          { error: 'Attendance already recorded for this student on this date' },
          { status: 409 }
        );
      }

      // Create attendance record
      const attendanceRecord = await attendanceRepo.createAttendance({
        studentId: validatedData.studentId,
        classId: validatedData.classId,
        date: new Date(validatedData.date),
        status: validatedData.status,
        timeIn: validatedData.timeIn,
        timeOut: validatedData.timeOut,
        notes: validatedData.notes,
        excuseReason: validatedData.excuseReason,
        excuseDocument: validatedData.excuseDocument,
        markedBy: session.user.id,
      });

      // Trigger parent notification if absent
      if (validatedData.status === 'absent') {
        await attendanceRepo.triggerParentNotification(attendanceRecord.id);
      }

      return NextResponse.json({
        success: true,
        data: attendanceRecord,
        message: 'Attendance record created successfully',
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating attendance record:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    );
  }
}