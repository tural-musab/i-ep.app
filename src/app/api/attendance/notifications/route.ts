/**
 * Attendance Notifications API Route
 * İ-EP.APP - Attendance Management System
 *
 * Endpoints:
 * - GET /api/attendance/notifications - Get attendance notifications
 * - POST /api/attendance/notifications - Send attendance notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AttendanceRepository } from '@/lib/repository/attendance-repository';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { z } from 'zod';

// Validation schemas
const NotificationQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  status: z.enum(['pending', 'sent', 'delivered', 'failed']).optional(),
  type: z.enum(['sms', 'email', 'push']).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

const NotificationSendSchema = z.object({
  attendanceRecordId: z.string().uuid('Invalid attendance record ID'),
  notificationType: z.enum(['sms', 'email', 'push']).optional().default('email'),
  customMessage: z.string().optional(),
  recipientOverride: z.string().email().optional(),
});

const BulkNotificationSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  notificationType: z.enum(['sms', 'email', 'push']).optional().default('email'),
  statusFilter: z.enum(['absent', 'late']).optional().default('absent'),
  customMessage: z.string().optional(),
});

/**
 * GET /api/attendance/notifications
 * Retrieve attendance notifications
 */
export async function GET(request: NextRequest) {
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = NotificationQuerySchema.parse(queryParams);

    // Initialize repository
    const attendanceRepo = new AttendanceRepository(supabase, tenantId);

    // Get notifications
    const notifications = await attendanceRepo.getAttendanceNotifications({
      studentId: validatedQuery.studentId,
      parentId: validatedQuery.parentId,
      status: validatedQuery.status,
      type: validatedQuery.type,
      limit: validatedQuery.limit || 50,
      offset: validatedQuery.offset || 0,
    });

    // Get total count for pagination
    const totalCount = await attendanceRepo.getAttendanceNotificationsCount({
      studentId: validatedQuery.studentId,
      parentId: validatedQuery.parentId,
      status: validatedQuery.status,
      type: validatedQuery.type,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        total: totalCount,
        limit: validatedQuery.limit || 50,
        offset: validatedQuery.offset || 0,
        hasMore: (validatedQuery.offset || 0) + (validatedQuery.limit || 50) < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching attendance notifications:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch attendance notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/notifications
 * Send attendance notifications
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
    const attendanceRepo = new AttendanceRepository(supabase, tenantId);

    // Check if this is a bulk notification request
    if (body.classId && body.date) {
      // Bulk notification
      const validatedData = BulkNotificationSchema.parse(body);

      // Get all attendance records for the class on the specified date
      const attendanceRecords = await attendanceRepo.getAttendanceRecords({
        classId: validatedData.classId,
        date: new Date(validatedData.date),
        status: validatedData.statusFilter,
      });

      if (attendanceRecords.length === 0) {
        return NextResponse.json(
          { error: 'No attendance records found matching the criteria' },
          { status: 404 }
        );
      }

      // Send notifications for each record
      const notificationPromises = attendanceRecords.map((record) =>
        attendanceRepo.sendAttendanceNotification(
          record.id,
          validatedData.notificationType,
          validatedData.customMessage
        )
      );

      const results = await Promise.allSettled(notificationPromises);
      const successful = results.filter((result) => result.status === 'fulfilled').length;
      const failed = results.filter((result) => result.status === 'rejected').length;

      return NextResponse.json({
        success: true,
        message: `Bulk notifications sent: ${successful} successful, ${failed} failed`,
        results: {
          total: attendanceRecords.length,
          successful,
          failed,
        },
      });
    } else {
      // Single notification
      const validatedData = NotificationSendSchema.parse(body);

      // Verify attendance record exists
      const attendanceRecord = await attendanceRepo.getAttendanceById(
        validatedData.attendanceRecordId
      );

      if (!attendanceRecord) {
        return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
      }

      // Send notification
      const notification = await attendanceRepo.sendAttendanceNotification(
        validatedData.attendanceRecordId,
        validatedData.notificationType,
        validatedData.customMessage,
        validatedData.recipientOverride
      );

      return NextResponse.json({
        success: true,
        data: notification,
        message: 'Attendance notification sent successfully',
      });
    }
  } catch (error) {
    console.error('Error sending attendance notification:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to send attendance notification' }, { status: 500 });
  }
}

/**
 * PUT /api/attendance/notifications
 * Update notification status (for webhook callbacks)
 */
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantId();
    const supabase = await createServerSupabaseClient();

    // Verify authentication or webhook signature
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, status, deliveredAt, errorMessage } = body;

    // Validate required fields
    if (!notificationId || !status) {
      return NextResponse.json(
        { error: 'notificationId and status are required' },
        { status: 400 }
      );
    }

    // Initialize repository
    const attendanceRepo = new AttendanceRepository(supabase, tenantId);

    // Update notification status
    const updatedNotification = await attendanceRepo.updateNotificationStatus(
      notificationId,
      status,
      deliveredAt ? new Date(deliveredAt) : undefined,
      errorMessage
    );

    return NextResponse.json({
      success: true,
      data: updatedNotification,
      message: 'Notification status updated successfully',
    });
  } catch (error) {
    console.error('Error updating notification status:', error);

    return NextResponse.json({ error: 'Failed to update notification status' }, { status: 500 });
  }
}
