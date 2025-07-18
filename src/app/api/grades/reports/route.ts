/**
 * Grade Reports API Route
 * İ-EP.APP - Grade Management System
 *
 * Endpoints:
 * - GET /api/grades/reports - Generate comprehensive grade reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { GradeRepository } from '@/lib/repository/grade-repository';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { z } from 'zod';

// Validation schemas
const ReportQuerySchema = z.object({
  type: z.enum([
    'transcript',
    'progress',
    'summary',
    'detailed',
    'class',
    'subject',
    'comparative',
  ]),
  format: z.enum(['json', 'csv', 'pdf']).optional().default('json'),
  studentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  semester: z.string().transform(Number).optional(),
  academicYear: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  includeComments: z.string().transform(Boolean).optional().default(false),
  includeStatistics: z.string().transform(Boolean).optional().default(true),
  includeAnalytics: z.string().transform(Boolean).optional().default(false),
  includeCharts: z.string().transform(Boolean).optional().default(false),
  gradeTypes: z.string().optional(),
});

/**
 * GET /api/grades/reports
 * Generate comprehensive grade reports
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

    const validatedQuery = ReportQuerySchema.parse(queryParams);

    // Initialize repository
    const gradeRepo = new GradeRepository(supabase, tenantId);

    // Set date range defaults
    const startDate = validatedQuery.startDate
      ? new Date(validatedQuery.startDate)
      : new Date(new Date().getFullYear(), 0, 1); // January 1st of current year

    const endDate = validatedQuery.endDate ? new Date(validatedQuery.endDate) : new Date(); // Today

    // Parse grade types if provided
    const gradeTypes = validatedQuery.gradeTypes
      ? validatedQuery.gradeTypes.split(',').map((type) => type.trim())
      : undefined;

    let reportData;

    switch (validatedQuery.type) {
      case 'transcript':
        if (!validatedQuery.studentId) {
          return NextResponse.json(
            { error: 'Student ID is required for transcript report' },
            { status: 400 }
          );
        }

        reportData = await generateTranscriptReport(
          gradeRepo,
          validatedQuery.studentId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeComments,
          validatedQuery.includeStatistics
        );
        break;

      case 'progress':
        if (!validatedQuery.studentId) {
          return NextResponse.json(
            { error: 'Student ID is required for progress report' },
            { status: 400 }
          );
        }

        reportData = await generateProgressReport(
          gradeRepo,
          validatedQuery.studentId,
          validatedQuery.subjectId,
          startDate,
          endDate,
          validatedQuery.includeAnalytics
        );
        break;

      case 'summary':
        reportData = await generateSummaryReport(
          gradeRepo,
          validatedQuery.classId,
          validatedQuery.subjectId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeStatistics
        );
        break;

      case 'detailed':
        reportData = await generateDetailedReport(
          gradeRepo,
          validatedQuery.classId,
          validatedQuery.subjectId,
          validatedQuery.studentId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeComments,
          gradeTypes
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
          gradeRepo,
          validatedQuery.classId,
          validatedQuery.subjectId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeStatistics,
          validatedQuery.includeAnalytics
        );
        break;

      case 'subject':
        if (!validatedQuery.subjectId) {
          return NextResponse.json(
            { error: 'Subject ID is required for subject report' },
            { status: 400 }
          );
        }

        reportData = await generateSubjectReport(
          gradeRepo,
          validatedQuery.subjectId,
          validatedQuery.classId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeStatistics,
          validatedQuery.includeAnalytics
        );
        break;

      case 'comparative':
        reportData = await generateComparativeReport(
          gradeRepo,
          validatedQuery.classId,
          validatedQuery.subjectId,
          validatedQuery.semester,
          validatedQuery.academicYear,
          validatedQuery.includeAnalytics
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
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
          parameters: {
            studentId: validatedQuery.studentId,
            classId: validatedQuery.classId,
            subjectId: validatedQuery.subjectId,
            semester: validatedQuery.semester,
            academicYear: validatedQuery.academicYear,
            includeComments: validatedQuery.includeComments,
            includeStatistics: validatedQuery.includeStatistics,
            includeAnalytics: validatedQuery.includeAnalytics,
          },
        },
      });
    } else if (validatedQuery.format === 'csv') {
      const csvData = convertToCSV(reportData, validatedQuery.type);

      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="grade-report-${validatedQuery.type}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (validatedQuery.format === 'pdf') {
      // PDF generation will be implemented later
      return NextResponse.json({ error: 'PDF format not yet implemented' }, { status: 501 });
    }
  } catch (error) {
    console.error('Error generating grade report:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

/**
 * Generate student transcript report
 */
async function generateTranscriptReport(
  gradeRepo: GradeRepository,
  studentId: string,
  semester?: number,
  academicYear?: string,
  includeComments: boolean = false,
  includeStatistics: boolean = true
) {
  const studentInfo = await gradeRepo.getStudentInfo(studentId);

  const grades = await gradeRepo.getStudentGrades(studentId, {
    semester,
    academicYear,
    includeComments,
    includeCalculations: true,
  });

  const calculations = await gradeRepo.getStudentGradeCalculations(
    studentId,
    semester,
    academicYear
  );

  let statistics = null;
  if (includeStatistics) {
    statistics = await gradeRepo.getStudentGradeStatistics(
      studentId,
      undefined,
      semester,
      academicYear
    );
  }

  const gpa = await gradeRepo.calculateStudentGPA(studentId, semester, academicYear);

  return {
    studentInfo,
    grades: grades.map((grade) => ({
      ...grade,
      comments: includeComments ? grade.comments : undefined,
    })),
    calculations,
    statistics,
    gpa,
    summary: {
      totalGrades: grades.length,
      completedSubjects: calculations.length,
      passingGrades: calculations.filter((calc) => calc.isPassing).length,
      honorRollSubjects: calculations.filter((calc) => calc.isHonorRoll).length,
    },
  };
}

/**
 * Generate student progress report
 */
async function generateProgressReport(
  gradeRepo: GradeRepository,
  studentId: string,
  subjectId?: string,
  startDate?: Date,
  endDate?: Date,
  includeAnalytics: boolean = false
) {
  const studentInfo = await gradeRepo.getStudentInfo(studentId);

  const progressData = await gradeRepo.getStudentProgress(studentId, subjectId, startDate, endDate);

  const trends = await gradeRepo.getStudentGradeTrends(studentId, subjectId, startDate, endDate);

  let analytics = null;
  if (includeAnalytics) {
    analytics = await gradeRepo.getStudentAnalytics(studentId, subjectId, startDate, endDate);
  }

  return {
    studentInfo,
    progressData,
    trends,
    analytics,
    summary: {
      totalGrades: progressData.grades.length,
      averageGrade: progressData.overallAverage,
      improvement: progressData.improvement,
      strengths: progressData.strengths,
      areasForImprovement: progressData.areasForImprovement,
    },
  };
}

/**
 * Generate summary report
 */
async function generateSummaryReport(
  gradeRepo: GradeRepository,
  classId?: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  includeStatistics: boolean = true
) {
  const summaryData = await gradeRepo.getGradeSummary(classId, subjectId, semester, academicYear);

  let statistics = null;
  if (includeStatistics) {
    if (classId && subjectId) {
      statistics = await gradeRepo.getClassGradeStatistics(
        classId,
        subjectId,
        semester,
        academicYear
      );
    } else if (classId) {
      statistics = await gradeRepo.getClassOverallStatistics(classId, semester, academicYear);
    } else if (subjectId) {
      statistics = await gradeRepo.getSubjectGradeStatistics(
        subjectId,
        undefined,
        semester,
        academicYear
      );
    }
  }

  return {
    summary: summaryData,
    statistics,
    dateRange: {
      semester,
      academicYear,
    },
  };
}

/**
 * Generate detailed report
 */
async function generateDetailedReport(
  gradeRepo: GradeRepository,
  classId?: string,
  subjectId?: string,
  studentId?: string,
  semester?: number,
  academicYear?: string,
  includeComments: boolean = false,
  gradeTypes?: string[]
) {
  const detailedData = await gradeRepo.getDetailedGradeReport(
    classId,
    subjectId,
    studentId,
    semester,
    academicYear,
    gradeTypes,
    includeComments
  );

  const breakdown = await gradeRepo.getGradeBreakdown(
    classId,
    subjectId,
    studentId,
    semester,
    academicYear,
    gradeTypes
  );

  return {
    grades: detailedData,
    breakdown,
    summary: {
      totalGrades: detailedData.length,
      gradeTypes: [...new Set(detailedData.map((grade) => grade.gradeType))],
      dateRange: {
        earliest:
          detailedData.length > 0
            ? Math.min(...detailedData.map((g) => new Date(g.gradeDate).getTime()))
            : null,
        latest:
          detailedData.length > 0
            ? Math.max(...detailedData.map((g) => new Date(g.gradeDate).getTime()))
            : null,
      },
    },
  };
}

/**
 * Generate class report
 */
async function generateClassReport(
  gradeRepo: GradeRepository,
  classId: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  includeStatistics: boolean = true,
  includeAnalytics: boolean = false
) {
  const classInfo = await gradeRepo.getClassInfo(classId);

  const classGrades = await gradeRepo.getClassGrades(classId, subjectId, semester, academicYear);

  let statistics = null;
  if (includeStatistics) {
    statistics = await gradeRepo.getClassGradeStatistics(
      classId,
      subjectId,
      semester,
      academicYear
    );
  }

  let analytics = null;
  if (includeAnalytics) {
    analytics = await gradeRepo.getClassAnalytics(classId, subjectId, semester, academicYear);
  }

  const studentSummaries = await gradeRepo.getClassStudentSummaries(
    classId,
    subjectId,
    semester,
    academicYear
  );

  return {
    classInfo,
    statistics,
    analytics,
    studentSummaries,
    summary: {
      totalStudents: studentSummaries.length,
      totalGrades: classGrades.length,
      passingStudents: studentSummaries.filter((s) => s.isPassing).length,
      honorRollStudents: studentSummaries.filter((s) => s.isHonorRoll).length,
    },
  };
}

/**
 * Generate subject report
 */
async function generateSubjectReport(
  gradeRepo: GradeRepository,
  subjectId: string,
  classId?: string,
  semester?: number,
  academicYear?: string,
  includeStatistics: boolean = true,
  includeAnalytics: boolean = false
) {
  const subjectInfo = await gradeRepo.getSubjectInfo(subjectId);

  const subjectGrades = await gradeRepo.getSubjectGrades(
    subjectId,
    classId,
    semester,
    academicYear
  );

  let statistics = null;
  if (includeStatistics) {
    statistics = await gradeRepo.getSubjectGradeStatistics(
      subjectId,
      classId,
      semester,
      academicYear
    );
  }

  let analytics = null;
  if (includeAnalytics) {
    analytics = await gradeRepo.getSubjectAnalytics(subjectId, classId, semester, academicYear);
  }

  const gradeTypeBreakdown = await gradeRepo.getSubjectGradeTypeBreakdown(
    subjectId,
    classId,
    semester,
    academicYear
  );

  return {
    subjectInfo,
    statistics,
    analytics,
    gradeTypeBreakdown,
    summary: {
      totalGrades: subjectGrades.length,
      classes: classId ? 1 : [...new Set(subjectGrades.map((g) => g.classId))].length,
      students: [...new Set(subjectGrades.map((g) => g.studentId))].length,
      gradeTypes: [...new Set(subjectGrades.map((g) => g.gradeType))],
    },
  };
}

/**
 * Generate comparative report
 */
async function generateComparativeReport(
  gradeRepo: GradeRepository,
  classId?: string,
  subjectId?: string,
  semester?: number,
  academicYear?: string,
  includeAnalytics: boolean = false
) {
  const comparativeData = await gradeRepo.getComparativeData(
    classId,
    subjectId,
    semester,
    academicYear
  );

  const benchmarks = await gradeRepo.getGradeBenchmarks(classId, subjectId, semester, academicYear);

  let analytics = null;
  if (includeAnalytics) {
    analytics = await gradeRepo.getComparativeAnalytics(classId, subjectId, semester, academicYear);
  }

  return {
    comparativeData,
    benchmarks,
    analytics,
    summary: {
      totalComparisons: comparativeData.length,
      bestPerforming: comparativeData.find((data) => data.rank === 1),
      averagePerformance:
        comparativeData.reduce((sum, data) => sum + data.average, 0) / comparativeData.length,
    },
  };
}

/**
 * Convert report data to CSV format
 */
function convertToCSV(data: any, reportType: string): string {
  let csvData = '';

  switch (reportType) {
    case 'transcript':
      csvData = convertTranscriptToCSV(data);
      break;
    case 'progress':
      csvData = convertProgressToCSV(data);
      break;
    case 'summary':
      csvData = convertSummaryToCSV(data);
      break;
    case 'detailed':
      csvData = convertDetailedToCSV(data);
      break;
    case 'class':
      csvData = convertClassToCSV(data);
      break;
    case 'subject':
      csvData = convertSubjectToCSV(data);
      break;
    case 'comparative':
      csvData = convertComparativeToCSV(data);
      break;
    default:
      csvData = 'Report type not supported for CSV export\n';
  }

  return csvData;
}

/**
 * Convert transcript data to CSV
 */
function convertTranscriptToCSV(data: any): string {
  if (!data || !data.grades || data.grades.length === 0) {
    return 'No grades available\n';
  }

  const headers = [
    'Subject',
    'Grade Type',
    'Grade Value',
    'Max Grade',
    'Percentage',
    'Letter Grade',
    'GPA Points',
    'Exam Name',
    'Grade Date',
    'Semester',
    'Academic Year',
  ];

  let csv = headers.join(',') + '\n';

  data.grades.forEach((grade: any) => {
    const values = [
      grade.subjectName || '',
      grade.gradeType || '',
      grade.gradeValue || '',
      grade.maxGrade || '',
      grade.percentage || '',
      grade.letterGrade || '',
      grade.gpaPoints || '',
      grade.examName || '',
      grade.gradeDate || '',
      grade.semester || '',
      grade.academicYear || '',
    ];

    csv +=
      values
        .map((value) => {
          const strValue = String(value);
          if (strValue.includes(',') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        })
        .join(',') + '\n';
  });

  return csv;
}

/**
 * Convert progress data to CSV
 */
function convertProgressToCSV(data: any): string {
  if (!data || !data.progressData || !data.progressData.grades) {
    return 'No progress data available\n';
  }

  const headers = [
    'Date',
    'Subject',
    'Grade Type',
    'Grade Value',
    'Percentage',
    'Letter Grade',
    'Trend',
  ];

  let csv = headers.join(',') + '\n';

  data.progressData.grades.forEach((grade: any) => {
    const values = [
      grade.gradeDate || '',
      grade.subjectName || '',
      grade.gradeType || '',
      grade.gradeValue || '',
      grade.percentage || '',
      grade.letterGrade || '',
      grade.trend || '',
    ];

    csv +=
      values
        .map((value) => {
          const strValue = String(value);
          if (strValue.includes(',') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        })
        .join(',') + '\n';
  });

  return csv;
}

/**
 * Convert summary data to CSV
 */
function convertSummaryToCSV(data: any): string {
  if (!data || !data.summary) {
    return 'No summary data available\n';
  }

  const headers = ['Metric', 'Value'];
  let csv = headers.join(',') + '\n';

  Object.entries(data.summary).forEach(([key, value]) => {
    csv += `${key},${value}\n`;
  });

  if (data.statistics) {
    csv += '\nStatistics\n';
    Object.entries(data.statistics).forEach(([key, value]) => {
      csv += `${key},${value}\n`;
    });
  }

  return csv;
}

/**
 * Convert detailed data to CSV
 */
function convertDetailedToCSV(data: any): string {
  if (!data || !data.grades || data.grades.length === 0) {
    return 'No detailed data available\n';
  }

  const headers = [
    'Student Name',
    'Subject',
    'Grade Type',
    'Grade Value',
    'Max Grade',
    'Percentage',
    'Letter Grade',
    'Exam Name',
    'Grade Date',
    'Comments',
  ];

  let csv = headers.join(',') + '\n';

  data.grades.forEach((grade: any) => {
    const values = [
      grade.studentName || '',
      grade.subjectName || '',
      grade.gradeType || '',
      grade.gradeValue || '',
      grade.maxGrade || '',
      grade.percentage || '',
      grade.letterGrade || '',
      grade.examName || '',
      grade.gradeDate || '',
      grade.comments?.map((c: any) => c.commentText).join('; ') || '',
    ];

    csv +=
      values
        .map((value) => {
          const strValue = String(value);
          if (strValue.includes(',') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        })
        .join(',') + '\n';
  });

  return csv;
}

/**
 * Convert class data to CSV
 */
function convertClassToCSV(data: any): string {
  if (!data || !data.studentSummaries || data.studentSummaries.length === 0) {
    return 'No class data available\n';
  }

  const headers = [
    'Student Name',
    'Overall Average',
    'Letter Grade',
    'GPA',
    'Passing Status',
    'Honor Roll',
    'Total Grades',
  ];

  let csv = headers.join(',') + '\n';

  data.studentSummaries.forEach((student: any) => {
    const values = [
      student.studentName || '',
      student.overallAverage || '',
      student.letterGrade || '',
      student.gpa || '',
      student.isPassing ? 'Passing' : 'Not Passing',
      student.isHonorRoll ? 'Yes' : 'No',
      student.totalGrades || '',
    ];

    csv +=
      values
        .map((value) => {
          const strValue = String(value);
          if (strValue.includes(',') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        })
        .join(',') + '\n';
  });

  return csv;
}

/**
 * Convert subject data to CSV
 */
function convertSubjectToCSV(data: any): string {
  if (!data || !data.gradeTypeBreakdown) {
    return 'No subject data available\n';
  }

  const headers = ['Grade Type', 'Average', 'Count', 'Weight'];
  let csv = headers.join(',') + '\n';

  data.gradeTypeBreakdown.forEach((breakdown: any) => {
    const values = [
      breakdown.gradeType || '',
      breakdown.average || '',
      breakdown.count || '',
      breakdown.weight || '',
    ];

    csv += values.join(',') + '\n';
  });

  return csv;
}

/**
 * Convert comparative data to CSV
 */
function convertComparativeToCSV(data: any): string {
  if (!data || !data.comparativeData || data.comparativeData.length === 0) {
    return 'No comparative data available\n';
  }

  const headers = ['Entity', 'Average', 'Rank', 'Students', 'Grades'];
  let csv = headers.join(',') + '\n';

  data.comparativeData.forEach((comparison: any) => {
    const values = [
      comparison.entityName || '',
      comparison.average || '',
      comparison.rank || '',
      comparison.studentCount || '',
      comparison.gradeCount || '',
    ];

    csv += values.join(',') + '\n';
  });

  return csv;
}
