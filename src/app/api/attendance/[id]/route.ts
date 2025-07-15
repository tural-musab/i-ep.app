/**
 * Attendance API - Individual Record Route
 * İ-EP.APP - Attendance Management System
 * 
 * Endpoints:
 * - GET /api/attendance/[id] - Get specific attendance record
 * - PUT /api/attendance/[id] - Update attendance record
 * - DELETE /api/attendance/[id] - Delete attendance record
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AttendanceRepository } from '@/lib/repository/attendance-repository';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { z } from 'zod';

// Validation schemas
const AttendanceUpdateSchema = z.object({
  status: z.enum(['present', 'absent', 'late', 'excused', 'sick']).optional(),
  timeIn: z.string().optional(),
  timeOut: z.string().optional(),
  notes: z.string().optional(),
  excuseReason: z.string().optional(),
  excuseDocument: z.string().optional(),
});

/**
 * GET /api/attendance/[id]
 * Retrieve specific attendance record
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Validate attendance ID
    const attendanceId = z.string().uuid().parse(params.id);
    
    // Initialize repository
    const attendanceRepo = new AttendanceRepository(supabase, tenantId);
    
    // Get attendance record
    const attendanceRecord = await attendanceRepo.getAttendanceById(attendanceId);
    
    if (!attendanceRecord) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: attendanceRecord,
    });

  } catch (error) {
    console.error('Error fetching attendance record:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid attendance ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch attendance record' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/attendance/[id]
 * Update attendance record
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Validate attendance ID
    const attendanceId = z.string().uuid().parse(params.id);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = AttendanceUpdateSchema.parse(body);
    
    // Initialize repository
    const attendanceRepo = new AttendanceRepository(supabase, tenantId);
    
    // Check if attendance record exists
    const existingRecord = await attendanceRepo.getAttendanceById(attendanceId);
    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    // Update attendance record
    const updatedRecord = await attendanceRepo.updateAttendance(attendanceId, {
      ...validatedData,
      markedBy: session.user.id, // Update who made the change
    });

    // Trigger parent notification if status changed to absent
    if (validatedData.status === 'absent' && existingRecord.status !== 'absent') {
      await attendanceRepo.triggerParentNotification(attendanceId);
    }

    return NextResponse.json({
      success: true,
      data: updatedRecord,
      message: 'Attendance record updated successfully',
    });

  } catch (error) {
    console.error('Error updating attendance record:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update attendance record' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/attendance/[id]
 * Delete attendance record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Validate attendance ID
    const attendanceId = z.string().uuid().parse(params.id);
    
    // Initialize repository
    const attendanceRepo = new AttendanceRepository(supabase, tenantId);
    
    // Check if attendance record exists
    const existingRecord = await attendanceRepo.getAttendanceById(attendanceId);
    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    // Delete attendance record
    await attendanceRepo.deleteAttendance(attendanceId);

    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting attendance record:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid attendance ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete attendance record' },
      { status: 500 }
    );
  }
}