/**
 * Assignment Individual API Endpoints
 * İ-EP.APP - Assignment Management System
 * Handles individual assignment operations (GET, PUT, DELETE)
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { AssignmentRepository } from '@/lib/repository/assignment-repository';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Validation schema for assignment updates
const UpdateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().optional(),
  type: z.enum(['homework', 'exam', 'project', 'quiz', 'presentation']).optional(),
  subject: z.string().min(1, 'Subject is required').max(100, 'Subject too long').optional(),
  class_id: z.string().uuid('Invalid class ID').optional(),
  teacher_id: z.string().uuid('Invalid teacher ID').optional(),
  due_date: z.string().datetime('Invalid due date').optional(),
  max_score: z
    .number()
    .min(1, 'Max score must be positive')
    .max(1000, 'Max score too high')
    .optional(),
  instructions: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  rubric: z
    .array(
      z.object({
        criteria: z.string(),
        points: z.number(),
        description: z.string().optional(),
      })
    )
    .optional(),
  metadata: z.record(z.any()).optional(),
  status: z.enum(['draft', 'published', 'completed', 'archived']).optional(),
  is_graded: z.boolean().optional(),
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
 * GET /api/assignments/[id]
 * Get a specific assignment by ID
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

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // Check if we want detailed information (with relations)
    const url = new URL(request.url);
    const includeRelations = url.searchParams.get('include_relations') === 'true';
    const includeStatistics = url.searchParams.get('include_statistics') === 'true';

    // Fetch assignment
    const assignment = await assignmentRepo.findById(assignmentId, {
      includeRelations,
      includeStatistics,
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid assignment ID', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/assignments/[id]
 * Update a specific assignment
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UpdateAssignmentSchema.parse(body);

    // Verify user has permission to update assignment
    const userId = session.user.id;
    const userRole = session.user.app_metadata?.role || 'user';

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // Check if assignment exists and user has permission
    const existingAssignment = await assignmentRepo.findById(assignmentId);
    if (!existingAssignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Permission check: Only teachers who created the assignment, admins, or super admins can update
    const canUpdate =
      userRole === 'super_admin' ||
      userRole === 'admin' ||
      (userRole === 'teacher' && existingAssignment.teacher_id === userId);

    if (!canUpdate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update assignment
    const updatedAssignment = await assignmentRepo.update(assignmentId, {
      ...validatedData,
      updated_by: userId,
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error('Error updating assignment:', error);

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
 * DELETE /api/assignments/[id]
 * Delete a specific assignment
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verify user has permission to delete assignment
    const userId = session.user.id;
    const userRole = session.user.app_metadata?.role || 'user';

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // Check if assignment exists and user has permission
    const existingAssignment = await assignmentRepo.findById(assignmentId);
    if (!existingAssignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Permission check: Only teachers who created the assignment, admins, or super admins can delete
    const canDelete =
      userRole === 'super_admin' ||
      userRole === 'admin' ||
      (userRole === 'teacher' && existingAssignment.teacher_id === userId);

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if assignment has submissions
    const hasSubmissions = await assignmentRepo.hasSubmissions(assignmentId);
    if (hasSubmissions) {
      // Don't allow deletion of assignments with submissions
      // Instead, archive them
      const archivedAssignment = await assignmentRepo.update(assignmentId, {
        status: 'archived',
        updated_by: userId,
      });

      return NextResponse.json({
        success: true,
        message: 'Assignment archived instead of deleted due to existing submissions',
        assignment: archivedAssignment,
      });
    }

    // Delete assignment
    const deleted = await assignmentRepo.delete(assignmentId);

    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid assignment ID', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
