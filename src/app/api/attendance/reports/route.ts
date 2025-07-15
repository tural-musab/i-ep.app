/**
 * Attendance Reports API Route
 * İ-EP.APP - Attendance Management System
 * 
 * Endpoints:
 * - GET /api/attendance/reports - Generate attendance reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AttendanceRepository } from '@/lib/repository/attendance-repository';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { z } from 'zod';

// Validation schemas
const ReportQuerySchema = z.object({
  type: z.enum(['summary', 'detailed', 'student', 'class', 'daily', 'monthly']),
  format: z.enum(['json', 'csv', 'pdf']).optional().default('json'),
  classId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  includeStats: z.string().transform(Boolean).optional().default(true),
});

/**
 * GET /api/attendance/reports
 * Generate attendance reports
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
    
    const validatedQuery = ReportQuerySchema.parse(queryParams);
    
    // Initialize repository
    const attendanceRepo = new AttendanceRepository(supabase, tenantId);
    
    // Set date range defaults
    const startDate = validatedQuery.startDate 
      ? new Date(validatedQuery.startDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1); // First day of current month
    
    const endDate = validatedQuery.endDate 
      ? new Date(validatedQuery.endDate)
      : new Date(); // Today

    let reportData;

    switch (validatedQuery.type) {
      case 'summary':
        reportData = await generateSummaryReport(
          attendanceRepo,
          validatedQuery.classId,
          startDate,
          endDate
        );
        break;

      case 'detailed':
        reportData = await generateDetailedReport(
          attendanceRepo,
          validatedQuery.classId,
          validatedQuery.studentId,
          startDate,
          endDate
        );
        break;

      case 'student':
        if (!validatedQuery.studentId) {
          return NextResponse.json(
            { error: 'Student ID is required for student report' },
            { status: 400 }
          );
        }
        
        reportData = await generateStudentReport(
          attendanceRepo,
          validatedQuery.studentId,
          startDate,
          endDate
        );
        break;

      case 'class':
        if (!validatedQuery.classId) {
          return NextResponse.json(
            { error: 'Class ID is required for class report' },
            { status: 400 }
          );
        }
        
        reportData = await generateClassReport(
          attendanceRepo,
          validatedQuery.classId,
          startDate,
          endDate
        );
        break;

      case 'daily':
        reportData = await generateDailyReport(
          attendanceRepo,
          validatedQuery.classId,
          endDate // Use end date as the specific day
        );
        break;

      case 'monthly':
        reportData = await generateMonthlyReport(
          attendanceRepo,
          validatedQuery.classId,
          startDate,
          endDate
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }

    // Handle different output formats
    if (validatedQuery.format === 'json') {
      return NextResponse.json({
        success: true,
        data: reportData,
        metadata: {
          type: validatedQuery.type,
          format: validatedQuery.format,
          generatedAt: new Date().toISOString(),
          dateRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        },
      });
    } else if (validatedQuery.format === 'csv') {
      const csvData = convertToCSV(reportData, validatedQuery.type);
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="attendance-report-${validatedQuery.type}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (validatedQuery.format === 'pdf') {
      // PDF generation will be implemented later
      return NextResponse.json(
        { error: 'PDF format not yet implemented' },
        { status: 501 }
      );
    }

  } catch (error) {
    console.error('Error generating attendance report:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate attendance report' },
      { status: 500 }
    );
  }
}

/**
 * Generate summary report with overall statistics
 */
async function generateSummaryReport(
  attendanceRepo: AttendanceRepository,
  classId?: string,
  startDate?: Date,
  endDate?: Date
) {
  // Get overall statistics
  const summaryData = await attendanceRepo.getAttendanceReport(
    classId,
    startDate,
    endDate
  );

  // Get additional statistics
  const chronicAbsentees = await attendanceRepo.getChronicAbsentees(classId);
  const perfectAttendance = await attendanceRepo.getPerfectAttendanceStudents(
    classId,
    startDate,
    endDate
  );

  return {
    summary: {
      totalRecords: summaryData.length,
      dateRange: { startDate, endDate },
      classId,
    },
    chronicAbsentees,
    perfectAttendance,
    records: summaryData,
  };
}

/**
 * Generate detailed report with all attendance records
 */
async function generateDetailedReport(
  attendanceRepo: AttendanceRepository,
  classId?: string,
  studentId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const detailedData = await attendanceRepo.getAttendanceReport(
    classId,
    startDate,
    endDate,
    studentId
  );

  return {
    summary: {
      totalRecords: detailedData.length,
      dateRange: { startDate, endDate },
      classId,
      studentId,
    },
    records: detailedData,
  };
}

/**
 * Generate student-specific report
 */
async function generateStudentReport(
  attendanceRepo: AttendanceRepository,
  studentId: string,
  startDate?: Date,
  endDate?: Date
) {
  const studentStats = await attendanceRepo.getStudentAttendanceStats(
    studentId,
    startDate,
    endDate
  );

  const studentRecords = await attendanceRepo.getAttendanceReport(
    undefined,
    startDate,
    endDate,
    studentId
  );

  const attendanceTrends = await attendanceRepo.getAttendanceTrends(studentId);

  return {
    statistics: studentStats,
    records: studentRecords,
    trends: attendanceTrends,
  };
}

/**
 * Generate class-specific report
 */
async function generateClassReport(
  attendanceRepo: AttendanceRepository,
  classId: string,
  startDate?: Date,
  endDate?: Date
) {
  const classRecords = await attendanceRepo.getAttendanceReport(
    classId,
    startDate,
    endDate
  );

  const classSummary = await attendanceRepo.getClassAttendanceSummary(
    classId,
    endDate || new Date()
  );

  return {
    summary: classSummary,
    records: classRecords,
  };
}

/**
 * Generate daily report
 */
async function generateDailyReport(
  attendanceRepo: AttendanceRepository,
  classId?: string,
  date?: Date
) {
  const targetDate = date || new Date();
  
  const dailyRecords = await attendanceRepo.getAttendanceReport(
    classId,
    targetDate,
    targetDate
  );

  let classSummary;
  if (classId) {
    classSummary = await attendanceRepo.getClassAttendanceSummary(
      classId,
      targetDate
    );
  }

  return {
    date: targetDate,
    summary: classSummary,
    records: dailyRecords,
  };
}

/**
 * Generate monthly report
 */
async function generateMonthlyReport(
  attendanceRepo: AttendanceRepository,
  classId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const monthlyRecords = await attendanceRepo.getAttendanceReport(
    classId,
    startDate,
    endDate
  );

  // Group by month
  const monthlyData = monthlyRecords.reduce((acc, record) => {
    const month = new Date(record.date).toISOString().substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(record);
    return acc;
  }, {} as Record<string, typeof monthlyRecords>);

  return {
    dateRange: { startDate, endDate },
    monthlyData,
    totalRecords: monthlyRecords.length,
  };
}

/**
 * Convert report data to CSV format
 */
function convertToCSV(data: any, reportType: string): string {
  if (!data || !data.records || data.records.length === 0) {
    return 'No data available\n';
  }

  const records = data.records;
  const headers = Object.keys(records[0]);
  
  // Create CSV header
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  records.forEach((record: any) => {
    const values = headers.map(header => {
      const value = record[header];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    });
    csv += values.join(',') + '\n';
  });

  return csv;
}