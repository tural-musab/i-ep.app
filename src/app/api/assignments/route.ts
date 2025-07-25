/**
 * Assignment API Endpoints
 * İ-EP.APP - Assignment Management System
 * Multi-tenant architecture with proper authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AssignmentRepository } from '@/lib/repository/assignment-repository';
import { requireRole } from '@/lib/auth/server-session';
// Modern authentication pattern

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
    // SECURITY FIX: Require proper authentication
    const user = await requireRole(request, ['teacher', 'admin', 'super_admin', 'student']);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required or insufficient permissions' },
        { status: 401 }
      );
    }

    const tenantId = user.tenantId;
    console.log('🔧 Assignments API - Authenticated user:', { userId: user.id, role: user.role, tenantId });

    // For demo, return mock assignment data
    const mockAssignments = [
      {
        id: 'assignment-001',
        title: 'Türkçe Kompozisyon - Okulum',
        description: 'Okulunuz hakkında 200 kelimelik bir kompozisyon yazınız.',
        type: 'homework',
        subject: 'Türkçe',
        class_id: 'class-5a',
        teacher_id: user.id,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        max_score: 100,
        instructions: 'Kompozisyonunuzda giriş, gelişme ve sonuç bölümleri olsun.',
        status: 'published',
        is_graded: false,
        tenant_id: tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'assignment-002',
        title: 'Matematik - Kesirler Konusu',
        description: 'Kesirlerle toplama ve çıkarma işlemleri çalışma kağıdı.',
        type: 'homework',
        subject: 'Matematik',
        class_id: 'class-5a',
        teacher_id: user.id,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        max_score: 50,
        instructions: 'Tüm işlemleri gösteriniz.',
        status: 'published',
        is_graded: false,
        tenant_id: tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const result = {
      data: mockAssignments,
      pagination: {
        total: mockAssignments.length,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };

    console.log('✅ Assignments API - Returning mock data:', result);
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
      return NextResponse.json(
        { error: 'Authentication required or insufficient permissions' },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: 'Authentication required or insufficient permissions' },
        { status: 401 }
      );
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
    return NextResponse.json({ error: 'Bulk update not implemented yet' }, { status: 501 });
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
      return NextResponse.json(
        { error: 'Authentication required or insufficient permissions' },
        { status: 401 }
      );
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
    return NextResponse.json({ error: 'Bulk delete not implemented yet' }, { status: 501 });
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
