import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyTenantAccess, requireRole } from '@/lib/auth/server-session';
import { logAuditEvent } from '@/lib/audit';
import { User } from '@/types/auth';
import * as Sentry from '@sentry/nextjs';

// Create student data interface
interface CreateStudentData {
  first_name: string;
  last_name: string;
  email?: string;
  student_number: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  class_id?: string;
  parent_id?: string;
  phone?: string;
  address?: string;
}

/**
 * GET /api/students
 * List all students in the current tenant
 */
export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/students',
    },
    async () => {
      try {
        // Verify authentication and tenant access
        const authResult = await verifyTenantAccess(request);
        if (!authResult) {
          return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { user, tenantId } = authResult;

        // Authorization check - admin, teacher can view students
        if (!['admin', 'teacher', 'parent'].includes(user.role)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Parse query parameters
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);
        const search = url.searchParams.get('search') || '';

        const supabase = createServerSupabaseClient();

        // Build the query for students
        let query = supabase
          .from('users')
          .select(
            `
            id,
            email,
            first_name,
            last_name,
            metadata,
            created_at,
            updated_at,
            is_active
          `
          )
          .eq('tenant_id', tenantId)
          .eq('role', 'student')
          .is('deleted_at', null);

        // Add search filter
        if (search) {
          query = query.or(
            `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
          );
        }

        // Add pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        // Execute query
        const { data: students, error: studentsError, count } = await query;

        if (studentsError) {
          console.error('Students query error:', studentsError);
          throw studentsError;
        }

        const totalPages = Math.ceil((count || 0) / limit);

        // Log audit event
        await logAuditEvent(
          tenantId,
          user.id,
          'list',
          'student',
          '',
          {},
          { count: students?.length || 0 }
        );

        return NextResponse.json({
          data: students || [],
          pagination: {
            current: page,
            total: count || 0,
            pages: totalPages,
            limit: limit,
          },
        });
      } catch (error) {
        console.error('Students GET error:', error);
        Sentry.captureException(error);

        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
      }
    }
  );
}

/**
 * POST /api/students
 * Create a new student
 */
export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/students',
    },
    async () => {
      try {
        // Verify authentication and require admin role
        const user = await requireRole(request, ['admin']);
        if (!user) {
          return NextResponse.json({ error: 'Authentication required or insufficient permissions' }, { status: 401 });
        }

        const tenantId = user.tenantId;

        // Parse request body
        const body: CreateStudentData = await request.json();

        // Validate required fields
        if (!body.first_name || !body.last_name || !body.student_number) {
          return NextResponse.json(
            { error: 'Missing required fields: first_name, last_name, student_number' },
            { status: 400 }
          );
        }

        const supabase = createServerSupabaseClient();

        // Check if student number already exists in metadata
        const { data: existingStudent, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('role', 'student')
          .contains('metadata', { student_number: body.student_number })
          .maybeSingle();

        if (checkError) {
          console.error('Check error:', checkError);
          throw checkError;
        }

        if (existingStudent) {
          return NextResponse.json({ error: 'Student number already exists' }, { status: 409 });
        }

        // Create user record
        const userData = {
          tenant_id: tenantId,
          email: body.email || `${body.student_number}@student.local`,
          first_name: body.first_name,
          last_name: body.last_name,
          role: 'student',
          is_active: true,
          metadata: {
            student_number: body.student_number,
            birth_date: body.birth_date,
            gender: body.gender,
            phone: body.phone,
            address: body.address,
          },
        };

        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single();

        if (userError) {
          console.error('User creation error:', userError);
          throw userError;
        }

        // Log audit event
        await logAuditEvent(
          tenantId,
          user.id,
          'create',
          'student',
          newUser.id,
          {},
          { student_data: userData }
        );

        return NextResponse.json(
          {
            message: 'Student created successfully',
            data: newUser,
          },
          { status: 201 }
        );
      } catch (error) {
        console.error('Students POST error:', error);
        Sentry.captureException(error);

        return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
      }
    }
  );
}
