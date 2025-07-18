/**
 * Parent Communication Messages API
 * POST /api/parent-communication/messages - Send new message
 * GET /api/parent-communication/messages - Get messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant/current-tenant';
import { ParentCommunicationRepository } from '@/lib/repository/parent-communication-repository';

// Input validation schema
const createMessageSchema = z.object({
  parent_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  student_id: z.string().uuid(),
  subject: z.string().min(1).max(255),
  message: z.string().min(1),
  message_type: z.enum(['inquiry', 'concern', 'compliment', 'meeting_request', 'general']).default('general'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  is_anonymous: z.boolean().default(false),
  scheduled_for: z.string().datetime().optional(),
  attachments: z.array(z.string()).optional(),
});

const getMessagesSchema = z.object({
  parent_id: z.string().uuid().optional(),
  teacher_id: z.string().uuid().optional(),
  student_id: z.string().uuid().optional(),
  status: z.enum(['sent', 'delivered', 'read', 'replied', 'archived']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current tenant
    const tenant = await getCurrentTenant();
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

    // Initialize repository
    const repo = new ParentCommunicationRepository(supabase, tenant.id);

    // Create message
    const message = await repo.createMessage({
      ...validatedData,
      status: 'sent' as const,
    });

    return NextResponse.json({
      success: true,
      data: message,
    });

  } catch (error) {
    console.error('Error creating parent message:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current tenant
    const tenant = await getCurrentTenant();
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryData = {
      parent_id: searchParams.get('parent_id') || undefined,
      teacher_id: searchParams.get('teacher_id') || undefined,
      student_id: searchParams.get('student_id') || undefined,
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    };

    const validatedQuery = getMessagesSchema.parse(queryData);

    // Initialize repository
    const repo = new ParentCommunicationRepository(supabase, tenant.id);

    let messages;

    if (validatedQuery.parent_id) {
      messages = await repo.getMessagesByParent(
        validatedQuery.parent_id,
        validatedQuery.status,
        validatedQuery.limit
      );
    } else if (validatedQuery.teacher_id) {
      messages = await repo.getMessagesByTeacher(
        validatedQuery.teacher_id,
        validatedQuery.status,
        validatedQuery.limit
      );
    } else if (validatedQuery.student_id) {
      messages = await repo.getMessagesByStudent(
        validatedQuery.student_id,
        validatedQuery.limit
      );
    } else {
      return NextResponse.json(
        { error: 'At least one of parent_id, teacher_id, or student_id is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        total: messages.length,
      },
    });

  } catch (error) {
    console.error('Error fetching parent messages:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}