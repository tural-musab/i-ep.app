/**
 * Assignment API Endpoints
 * İ-EP.APP - Assignment Management System
 * Multi-tenant architecture with proper authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { AssignmentRepository } from '@/lib/repository/assignment-repository';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
  rubric: z.array(z.object({
    criteria: z.string(),
    points: z.number(),
    description: z.string().optional()
  })).optional(),
  metadata: z.record(z.any()).optional()
});

// Validation schema for assignment updates
const UpdateAssignmentSchema = CreateAssignmentSchema.partial().extend({
  status: z.enum(['draft', 'published', 'completed', 'archived']).optional(),
  is_graded: z.boolean().optional()
});

// Query parameters schema
const QueryParamsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  class_id: z.string().uuid().optional(),
  teacher_id: z.string().uuid().optional(),
  type: z.enum(['homework', 'exam', 'project', 'quiz', 'presentation']).optional(),
  status: z.enum(['draft', 'published', 'completed', 'archived']).optional(),
  subject: z.string().optional(),
  due_date_from: z.string().datetime().optional(),
  due_date_to: z.string().datetime().optional(),
  search: z.string().optional()
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
 * GET /api/assignments
 * List assignments with filtering, pagination, and search
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
      search
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
      search: search ? {
        fields: ['title', 'description', 'instructions'],
        term: search
      } : undefined,
      sort: {
        field: 'due_date',
        order: 'asc' as const
      }
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
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assignments
 * Create a new assignment
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
    const validatedData = CreateAssignmentSchema.parse(body);

    // Verify user has permission to create assignment for this class
    const userId = session.user.id;
    const userRole = session.user.app_metadata?.role || 'user';
    
    // For now, allow teachers and admins to create assignments
    // TODO: Add more granular permission checks
    if (!['teacher', 'admin', 'super_admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // Create assignment with tenant context
    const assignmentData = {
      ...validatedData,
      tenant_id: tenantId,
      created_by: userId,
      status: 'draft' as const
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
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/assignments
 * Bulk update assignments
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

    // Parse request body
    const body = await request.json();
    const { ids, updates } = z.object({
      ids: z.array(z.string().uuid()),
      updates: UpdateAssignmentSchema
    }).parse(body);

    // Verify permissions
    const userRole = session.user.app_metadata?.role || 'user';
    if (!['teacher', 'admin', 'super_admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // Perform bulk update
    const updatedAssignments = await assignmentRepo.bulkUpdate(ids, updates);

    return NextResponse.json({
      success: true,
      updated_count: updatedAssignments.length,
      assignments: updatedAssignments
    });

  } catch (error) {
    console.error('Error bulk updating assignments:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/assignments
 * Bulk delete assignments
 */
export async function DELETE(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { ids } = z.object({
      ids: z.array(z.string().uuid())
    }).parse(body);

    // Verify permissions
    const userRole = session.user.app_metadata?.role || 'user';
    if (!['teacher', 'admin', 'super_admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // Perform bulk delete
    const deletedCount = await assignmentRepo.bulkDelete(ids);

    return NextResponse.json({
      success: true,
      deleted_count: deletedCount
    });

  } catch (error) {
    console.error('Error bulk deleting assignments:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}