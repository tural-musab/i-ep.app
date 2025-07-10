import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant/current-tenant';
import { logAuditEvent } from '@/lib/audit';
import * as Sentry from '@sentry/nextjs';

// Teacher data interface
interface CreateTeacherData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  subjects?: string[];
  specialties?: string[];
}

/**
 * GET /api/teachers
 * List all teachers in the current tenant
 */
export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    { 
      op: "http.server",
      name: "GET /api/teachers" 
    },
    async () => {
      try {
        // Authentication check
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        // Get tenant information
        const tenant = await getCurrentTenant();
        if (!tenant) {
          return NextResponse.json(
            { error: 'Tenant not found' },
            { status: 400 }
          );
        }

        // Authorization check - admin, teacher can view teachers
        // @ts-expect-error - NextAuth user type doesn't include role
        const userRole = session.user.role;
        if (!['admin', 'teacher'].includes(userRole)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }

        // Parse query parameters
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);
        const search = url.searchParams.get('search') || '';

        const supabase = createServerSupabaseClient();

        // Build the query for teachers
        let query = supabase
          .from('users')
          .select(`
            id,
            email,
            first_name,
            last_name,
            metadata,
            created_at,
            updated_at,
            is_active
          `)
          .eq('tenant_id', tenant.id)
          .eq('role', 'teacher')
          .is('deleted_at', null);

        // Add search filter
        if (search) {
          query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        // Add pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        // Execute query
        const { data: teachers, error: teachersError, count } = await query;

        if (teachersError) {
          console.error('Teachers query error:', teachersError);
          throw teachersError;
        }

        const totalPages = Math.ceil((count || 0) / limit);

        // Log audit event
        await logAuditEvent(
          tenant.id,
          session.user.id || '',
          'list',
          'teacher',
          '',
          {},
          { count: teachers?.length || 0 }
        );

        return NextResponse.json({
          data: teachers || [],
          pagination: {
            current: page,
            total: count || 0,
            pages: totalPages,
            limit: limit
          }
        });

      } catch (error) {
        console.error('Teachers GET error:', error);
        Sentry.captureException(error);
        
        return NextResponse.json(
          { error: 'Failed to fetch teachers' },
          { status: 500 }
        );
      }
    }
  );
}

/**
 * POST /api/teachers
 * Create a new teacher
 */
export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    { 
      op: "http.server",
      name: "POST /api/teachers" 
    },
    async () => {
      try {
        // Authentication check
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        // Get tenant information
        const tenant = await getCurrentTenant();
        if (!tenant) {
          return NextResponse.json(
            { error: 'Tenant not found' },
            { status: 400 }
          );
        }

        // Authorization check - only admin can create teachers
        // @ts-expect-error - NextAuth user type doesn't include role
        const userRole = session.user.role;
        if (!['admin'].includes(userRole)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }

        // Parse request body
        const body: CreateTeacherData = await request.json();
        
        // Validate required fields
        if (!body.first_name || !body.last_name || !body.email) {
          return NextResponse.json(
            { error: 'Missing required fields: first_name, last_name, email' },
            { status: 400 }
          );
        }

        const supabase = createServerSupabaseClient();

        // Check if email already exists
        const { data: existingTeacher, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('tenant_id', tenant.id)
          .eq('email', body.email)
          .maybeSingle();

        if (checkError) {
          console.error('Check error:', checkError);
          throw checkError;
        }

        if (existingTeacher) {
          return NextResponse.json(
            { error: 'Email already exists' },
            { status: 409 }
          );
        }

        // Create user record - Use type assertion to bypass strict typing
        const userData = {
          tenant_id: tenant.id,
          email: body.email,
          first_name: body.first_name,
          last_name: body.last_name,
          role: 'teacher',
          is_active: true,
          metadata: {
            phone: body.phone,
            address: body.address,
            subjects: body.subjects || [],
            specialties: body.specialties || []
          }
        } as any;

        const { data: newTeacher, error: teacherError } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single();

        if (teacherError) {
          console.error('Teacher creation error:', teacherError);
          throw teacherError;
        }

        // Log audit event
        await logAuditEvent(
          tenant.id,
          session.user.id || '',
          'create',
          'teacher',
          newTeacher.id,
          {},
          { teacher_data: userData }
        );

        return NextResponse.json({
          message: 'Teacher created successfully',
          data: newTeacher
        }, { status: 201 });

      } catch (error) {
        console.error('Teachers POST error:', error);
        Sentry.captureException(error);
        
        return NextResponse.json(
          { error: 'Failed to create teacher' },
          { status: 500 }
        );
      }
    }
  );
} 