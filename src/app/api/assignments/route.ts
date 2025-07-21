/**
 * Assignment API Endpoints
 * İ-EP.APP - Assignment Management System
 * Multi-tenant architecture with proper authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AssignmentRepository } from '@/lib/repository/assignment-repository';
import { verifyTenantAccess, requireRole } from '@/lib/auth/server-session';

// Validation schema for assignment creation
const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  type: z.enum(['homework', 'exam', 'project', 'quiz', 'presentation']),
  subject: z.string().min(1, 'Subject is required').max(100, 'Subject too long'),
  class_id: z.string().uuid('Invalid class ID'),
  teacher_id: z.string().uuid('Invalid teacher ID'),
  due_date: z.string().datetime('Invalid due date'),
  max_score: z.number().min(1, 'Max score must be positive').max(1000, 'Max score too high'),
  instructions: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  rubric: z
    .array(
      z.object({
        criteria: z.string(),
        points: z.number(),
        description: z.string(),
      })
    )
    .optional(),
  metadata: z.record(z.any()).optional(),
});

// Validation schema for assignment updates
const UpdateAssignmentSchema = CreateAssignmentSchema.partial().extend({
  status: z.enum(['draft', 'published', 'completed', 'archived']).optional(),
  is_graded: z.boolean().optional(),
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
  class_id: z.string().uuid().optional(),
  teacher_id: z.string().uuid().optional(),
  type: z.enum(['homework', 'exam', 'project', 'quiz', 'presentation']).optional(),
  status: z.enum(['draft', 'published', 'completed', 'archived']).optional(),
  subject: z.string().optional(),
  due_date_from: z.string().datetime().optional(),
  due_date_to: z.string().datetime().optional(),
  search: z.string().optional(),
});


/**
 * GET /api/assignments
 * List assignments with filtering, pagination, and search
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and tenant access
    const authResult = await verifyTenantAccess(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { user, tenantId } = authResult;

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);

    const {
      page,
      limit,
      class_id,
      teacher_id,
      type,
      status,
      subject,
      due_date_from,
      due_date_to,
      search,
    } = QueryParamsSchema.parse(queryParams);

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // Build filters
    const filters: any = {};
    if (class_id) filters.class_id = class_id;
    if (teacher_id) filters.teacher_id = teacher_id;
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (subject) filters.subject = subject;

    // Build query options
    const options = {
      page,
      limit,
      filters,
      search: search
        ? {
            fields: ['title', 'description', 'instructions'],
            term: search,
          }
        : undefined,
      sort: {
        field: 'due_date',
        order: 'asc' as const,
      },
    };

    // Add date range filter if provided
    if (due_date_from || due_date_to) {
      options.filters.due_date = {};
      if (due_date_from) options.filters.due_date.gte = due_date_from;
      if (due_date_to) options.filters.due_date.lte = due_date_to;
    }

    // Fetch assignments
    const result = await assignmentRepo.findAll(options);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching assignments:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/assignments
 * Create a new assignment
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and require teacher/admin role
    const user = await requireRole(request, ['teacher', 'admin', 'super_admin']);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required or insufficient permissions' }, { status: 401 });
    }

    const tenantId = user.tenantId;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateAssignmentSchema.parse(body);

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // Create assignment with tenant context
    const assignmentData = {
      ...validatedData,
      tenant_id: tenantId,
      created_by: user.id,
      status: 'draft' as const,
      is_graded: false, // Add missing required field
    };

    const newAssignment = await assignmentRepo.create(assignmentData);

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);

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
 * PUT /api/assignments
 * Bulk update assignments
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication and require teacher/admin role
    const user = await requireRole(request, ['teacher', 'admin', 'super_admin']);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required or insufficient permissions' }, { status: 401 });
    }

    const tenantId = user.tenantId;

    // Parse request body
    const body = await request.json();
    const { ids, updates } = z
      .object({
        ids: z.array(z.string().uuid()),
        updates: UpdateAssignmentSchema,
      })
      .parse(body);

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // TODO: Implement bulk update functionality
    // For now, return not implemented error
    return NextResponse.json(
      { error: 'Bulk update not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error bulk updating assignments:', error);

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
 * DELETE /api/assignments
 * Bulk delete assignments
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication and require teacher/admin role
    const user = await requireRole(request, ['teacher', 'admin', 'super_admin']);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required or insufficient permissions' }, { status: 401 });
    }

    const tenantId = user.tenantId;

    // Parse request body
    const body = await request.json();
    const { ids } = z
      .object({
        ids: z.array(z.string().uuid()),
      })
      .parse(body);

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // TODO: Implement bulk delete functionality
    // For now, return not implemented error
    return NextResponse.json(
      { error: 'Bulk delete not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error bulk deleting assignments:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
