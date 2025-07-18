/**
 * Assignment Submissions API Endpoints
 * İ-EP.APP - Assignment Management System
 * Handles assignment submissions (GET, POST)
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { AssignmentRepository } from '@/lib/repository/assignment-repository';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Validation schema for submission creation
const CreateSubmissionSchema = z.object({
  student_id: z.string().uuid('Invalid student ID'),
  content: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Validation schema for submission updates
const UpdateSubmissionSchema = z.object({
  content: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  score: z.number().min(0).optional(),
  feedback: z.string().optional(),
  status: z.enum(['submitted', 'graded', 'returned', 'late']).optional(),
  metadata: z.record(z.any()).optional(),
});

// Query parameters schema
const QueryParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  student_id: z.string().uuid().optional(),
  status: z.enum(['submitted', 'graded', 'returned', 'late']).optional(),
  include_feedback: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  sort_by: z.enum(['submission_date', 'score', 'student_name']).optional(),
});

/**
 * Get tenant ID from headers (set by middleware)
 */
function getTenantId(): string {
  const headersList = headers();
  const tenantId = headersList.get('x-tenant-id');

  if (!tenantId) {
    throw new Error('Tenant ID not found in headers');
  }

  return tenantId;
}

/**
 * GET /api/assignments/[id]/submissions
 * Get all submissions for a specific assignment
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Validate assignment ID
    const assignmentId = z.string().uuid().parse(params.id);

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);

    const { page, limit, student_id, status, include_feedback, sort_by } =
      QueryParamsSchema.parse(queryParams);

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // Verify assignment exists
    const assignment = await assignmentRepo.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Build filters
    const filters: any = { assignment_id: assignmentId };
    if (student_id) filters.student_id = student_id;
    if (status) filters.status = status;

    // Build query options
    const options = {
      page,
      limit,
      filters,
      sort: {
        field: sort_by || 'submission_date',
        order: 'desc' as const,
      },
      includeRelations: true,
      includeFeedback: include_feedback,
    };

    // Check permissions: Students can only see their own submissions
    const userId = session.user.id;
    const userRole = session.user.app_metadata?.role || 'user';

    if (userRole === 'student') {
      // Students can only see their own submissions
      filters.student_id = userId;
    } else if (userRole === 'teacher') {
      // Teachers can see submissions for assignments they created
      if (assignment.teacher_id !== userId) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }
    // Admins and super admins can see all submissions

    // Fetch submissions
    const result = await assignmentRepo.getSubmissions(assignmentId, options);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching submissions:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/assignments/[id]/submissions
 * Create a new submission for an assignment
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Validate assignment ID
    const assignmentId = z.string().uuid().parse(params.id);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateSubmissionSchema.parse(body);

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // Verify assignment exists and is published
    const assignment = await assignmentRepo.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (assignment.status !== 'published') {
      return NextResponse.json({ error: 'Assignment is not published' }, { status: 400 });
    }

    // Check if assignment is past due date
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const isLate = now > dueDate;

    // Verify user permissions
    const userId = session.user.id;
    const userRole = session.user.app_metadata?.role || 'user';

    // Students can only submit their own work
    if (userRole === 'student' && validatedData.student_id !== userId) {
      return NextResponse.json(
        { error: 'Students can only submit their own work' },
        { status: 403 }
      );
    }

    // Check if submission already exists
    const existingSubmission = await assignmentRepo.getSubmission(
      assignmentId,
      validatedData.student_id
    );
    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Submission already exists for this student' },
        { status: 409 }
      );
    }

    // Create submission
    const submissionData = {
      assignment_id: assignmentId,
      student_id: validatedData.student_id,
      content: validatedData.content,
      attachments: validatedData.attachments || [],
      status: isLate ? ('late' as const) : ('submitted' as const),
      submission_date: new Date().toISOString(),
      metadata: {
        ...validatedData.metadata,
        submitted_by: userId,
        is_late: isLate,
        submitted_at: new Date().toISOString(),
      },
    };

    const newSubmission = await assignmentRepo.createSubmission(submissionData);

    return NextResponse.json(newSubmission, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/assignments/[id]/submissions
 * Bulk update submissions (for grading)
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Validate assignment ID
    const assignmentId = z.string().uuid().parse(params.id);

    // Parse request body
    const body = await request.json();
    const { submission_updates } = z
      .object({
        submission_updates: z.array(
          z.object({
            submission_id: z.string().uuid(),
            updates: UpdateSubmissionSchema,
          })
        ),
      })
      .parse(body);

    // Verify user permissions
    const userId = session.user.id;
    const userRole = session.user.app_metadata?.role || 'user';

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // Verify assignment exists and user has permission to grade
    const assignment = await assignmentRepo.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Only teachers who created the assignment, admins, or super admins can grade
    const canGrade =
      userRole === 'super_admin' ||
      userRole === 'admin' ||
      (userRole === 'teacher' && assignment.teacher_id === userId);

    if (!canGrade) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Process bulk updates
    const updatedSubmissions = [];
    for (const { submission_id, updates } of submission_updates) {
      const updatedSubmission = await assignmentRepo.updateSubmission(submission_id, {
        ...updates,
        graded_by: userId,
        graded_at: new Date().toISOString(),
      });

      if (updatedSubmission) {
        updatedSubmissions.push(updatedSubmission);
      }
    }

    return NextResponse.json({
      success: true,
      updated_count: updatedSubmissions.length,
      submissions: updatedSubmissions,
    });
  } catch (error) {
    console.error('Error bulk updating submissions:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
