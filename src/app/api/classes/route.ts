/**
 * Classes API Endpoints
 * İ-EP.APP - Class Management System
 * Multi-tenant architecture with proper authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { verifyTenantAccess, requireRole } from '@/lib/auth/server-session';
import { ClassRepository } from '@/lib/repository/class-repository';

const classSchema = z.object({
  name: z
    .string()
    .min(2, 'Sınıf adı en az 2 karakter olmalıdır')
    .max(100, 'Sınıf adı en fazla 100 karakter olabilir'),
  grade: z
    .string()
    .min(1, 'Sınıf seviyesi gereklidir')
    .max(10, 'Sınıf seviyesi en fazla 10 karakter olabilir'),
  section: z
    .string()
    .min(1, 'Şube bilgisi gereklidir')
    .max(10, 'Şube bilgisi en fazla 10 karakter olabilir'),
  capacity: z
    .number()
    .min(1, 'Kapasite en az 1 olmalıdır')
    .max(50, 'Kapasite en fazla 50 olabilir'),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/, 'Örnek format: 2023-2024'),
  teacher_id: z.string().uuid().optional(),
  room_number: z.string().optional(),
  current_enrollment: z.number().min(0).default(0),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  description: z.string().optional(),
});

/**
 * GET /api/classes
 * List classes with proper tenant context
 */
export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/classes',
    },
    async () => {
      try {
        // Verify authentication and tenant access
        const authResult = await verifyTenantAccess(request);
        if (!authResult) {
          return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { user, tenantId } = authResult;

        // Initialize repository with tenant context
        const classRepo = new ClassRepository(tenantId);

        // Fetch classes using repository
        const result = await classRepo.findAll({
          page: 1,
          limit: 50, // Reasonable limit for classes
        });

        return NextResponse.json(result);
      } catch (error) {
        console.error('Error fetching classes:', error);
        Sentry.captureException(error);
        return NextResponse.json({ error: 'Sınıf listesi alınamadı' }, { status: 500 });
      }
    }
  );
}

/**
 * POST /api/classes
 * Create a new class
 */
export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/classes',
    },
    async () => {
      try {
        // Verify authentication and require admin/teacher role
        const user = await requireRole(request, ['admin', 'super_admin', 'teacher']);
        if (!user) {
          return NextResponse.json({ error: 'Authentication required or insufficient permissions' }, { status: 401 });
        }

        const tenantId = user.tenantId;

        // Parse and validate request body
        const body = await request.json();
        const validatedData = classSchema.parse(body);

        // Initialize repository
        const classRepo = new ClassRepository(tenantId);

        // Create class with tenant context
        const classData = {
          ...validatedData,
          tenant_id: tenantId,
          created_by: user.id,
        };

        const newClass = await classRepo.create(classData);

        return NextResponse.json(newClass, { status: 201 });
      } catch (error) {
        console.error('Error creating class:', error);
        Sentry.captureException(error);

        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Geçersiz sınıf bilgileri', details: error.errors },
            { status: 400 }
          );
        }

        return NextResponse.json({ error: 'Sınıf oluşturulamadı' }, { status: 500 });
      }
    }
  );
}

/**
 * PUT /api/classes
 * Update a class
 */
export async function PUT(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'PUT /api/classes',
    },
    async () => {
      try {
        // Verify authentication and require admin/teacher role
        const user = await requireRole(request, ['admin', 'super_admin', 'teacher']);
        if (!user) {
          return NextResponse.json({ error: 'Authentication required or insufficient permissions' }, { status: 401 });
        }

        const tenantId = user.tenantId;

        // Parse request body
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
          return NextResponse.json({ error: "Sınıf ID'si gerekli" }, { status: 400 });
        }

        const validatedData = classSchema.parse(updateData);

        // Initialize repository
        const classRepo = new ClassRepository(tenantId);

        // Update class
        const updatedClass = await classRepo.update(id, validatedData);

        return NextResponse.json(updatedClass);
      } catch (error) {
        console.error('Error updating class:', error);
        Sentry.captureException(error);

        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Geçersiz sınıf bilgileri', details: error.errors },
            { status: 400 }
          );
        }

        return NextResponse.json({ error: 'Sınıf güncellenemedi' }, { status: 500 });
      }
    }
  );
}
