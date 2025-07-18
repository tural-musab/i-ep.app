import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant/current-tenant';
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
        // Authentication check
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get tenant information
        const tenant = await getCurrentTenant();
        if (!tenant) {
          return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
        }

        // Authorization check - admin, teacher can view students
        // @ts-expect-error - NextAuth user type doesn't include role
        const userRole = session.user.role;
        if (!['admin', 'teacher', 'parent'].includes(userRole)) {
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
          .eq('tenant_id', tenant.id)
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
          tenant.id,
          session.user.id || '',
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
        // Authentication check
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get tenant information
        const tenant = await getCurrentTenant();
        if (!tenant) {
          return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
        }

        // Authorization check - only admin can create students
        const userRole = (session.user as User).role;
        if (!['admin'].includes(userRole)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

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
          .eq('tenant_id', tenant.id)
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
          tenant_id: tenant.id,
          email: body.email || `${body.student_number}@${tenant.name}.local`,
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
          tenant.id,
          session.user.id || '',
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
