import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyTenantAccess, requireRole } from '@/lib/auth/server-session';
import { logAuditEvent } from '@/lib/audit';
import * as Sentry from '@sentry/nextjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getTenantId } from '@/lib/tenant/tenant-utils';

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
      op: 'http.server',
      name: 'GET /api/teachers',
    },
    async () => {
      try {
        // Development environment bypass
        if (process.env.NODE_ENV === 'development') {
          const mockTeachers = [
            {
              id: 'teacher-1',
              email: 'fatma.ozdemir@school.com',
              first_name: 'Fatma',
              last_name: 'Özdemir',
              metadata: {
                phone: '555-0201',
                address: 'Ankara',
                subjects: ['Matematik', 'Fizik'],
                specialties: ['Analitik Geometri', 'Calculus']
              },
              created_at: '2024-01-10T08:00:00Z',
              updated_at: '2024-01-10T08:00:00Z',
              is_active: true
            },
            {
              id: 'teacher-2',
              email: 'ali.yilmaz@school.com',
              first_name: 'Ali',
              last_name: 'Yılmaz',
              metadata: {
                phone: '555-0202',
                address: 'İstanbul',
                subjects: ['Türkçe', 'Edebiyat'],
                specialties: ['Modern Türk Edebiyatı', 'Dil Bilgisi']
              },
              created_at: '2024-01-10T08:30:00Z',
              updated_at: '2024-01-10T08:30:00Z',
              is_active: true
            },
            {
              id: 'teacher-3',
              email: 'ayse.kara@school.com',
              first_name: 'Ayşe',
              last_name: 'Kara',
              metadata: {
                phone: '555-0203',
                address: 'İzmir',
                subjects: ['İngilizce'],
                specialties: ['Konuşma', 'Gramer']
              },
              created_at: '2024-01-10T09:00:00Z',
              updated_at: '2024-01-10T09:00:00Z',
              is_active: true
            }
          ];
          
          return NextResponse.json({
            data: mockTeachers,
            pagination: {
              current: 1,
              total: mockTeachers.length,
              pages: 1,
              limit: 10,
            },
          });
        }
        
        // Verify authentication and tenant access
        const authResult = await verifyTenantAccess(request);
        if (!authResult) {
          return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { user, tenantId } = authResult;

        // Authorization check - admin, teacher can view teachers
        if (!['admin', 'teacher'].includes(user.role)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
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
          .eq('role', 'teacher')
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
        const { data: teachers, error: teachersError, count } = await query;

        if (teachersError) {
          console.error('Teachers query error:', teachersError);
          throw teachersError;
        }

        const totalPages = Math.ceil((count || 0) / limit);

        // Log audit event
        await logAuditEvent(
          tenantId,
          user.id,
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
            limit: limit,
          },
        });
      } catch (error) {
        console.error('Teachers GET error:', error);
        Sentry.captureException(error);

        return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
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
      op: 'http.server',
      name: 'POST /api/teachers',
    },
    async () => {
      try {
        // Development environment bypass for POST
        if (process.env.NODE_ENV === 'development') {
          const mockNewTeacher = {
            id: 'teacher-new',
            email: 'newteacher@school.com',
            first_name: 'Yeni',
            last_name: 'Öğretmen',
            metadata: {
              phone: '555-0999',
              address: 'Ankara',
              subjects: ['Matematik'],
              specialties: ['Algebra']
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
          };
          
          return NextResponse.json(
            {
              message: 'Teacher created successfully',
              data: mockNewTeacher,
            },
            { status: 201 }
          );
        }
        
        // Verify authentication and require admin role
        const user = await requireRole(request, ['admin']);
        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required or insufficient permissions' },
            { status: 401 }
          );
        }

        const tenantId = user.tenantId;

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
          .eq('tenant_id', tenantId)
          .eq('email', body.email)
          .maybeSingle();

        if (checkError) {
          console.error('Check error:', checkError);
          throw checkError;
        }

        if (existingTeacher) {
          return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        // Create user record - Use type assertion to bypass strict typing
        const userData = {
          tenant_id: tenantId,
          email: body.email,
          first_name: body.first_name,
          last_name: body.last_name,
          role: 'teacher',
          is_active: true,
          metadata: {
            phone: body.phone,
            address: body.address,
            subjects: body.subjects || [],
            specialties: body.specialties || [],
          },
        } as {
          tenant_id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: string;
          is_active: boolean;
          metadata: {
            phone?: string;
            address?: string;
            subjects?: string[];
            specialties?: string[];
          };
        };

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
          tenantId,
          user.id,
          'create',
          'teacher',
          newTeacher.id,
          {},
          { teacher_data: userData }
        );

        return NextResponse.json(
          {
            message: 'Teacher created successfully',
            data: newTeacher,
          },
          { status: 201 }
        );
      } catch (error) {
        console.error('Teachers POST error:', error);
        Sentry.captureException(error);

        return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
      }
    }
  );
}
