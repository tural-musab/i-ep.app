/**
 * File Upload API Endpoint
 * İ-EP.APP - Storage System
 * Handles file uploads for assignments and other features
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { storage } from '@/lib/storage';
import { validateFile } from '@/lib/storage/utils/file-validator';
import { generateStoragePath } from '@/lib/storage/utils/path-generator';

// Validation schema for upload parameters
const UploadParamsSchema = z.object({
  type: z.enum(['assignment', 'profile', 'document', 'image']),
  category: z.string().optional(),
  assignment_id: z.string().uuid().optional(),
  public: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  tenant_id: z.string().uuid().optional(),
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
 * POST /api/storage/upload
 * Upload files to storage system
 */
export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse and validate upload parameters
    const uploadParams = Object.fromEntries(
      Array.from(formData.entries())
        .filter(([key]) => key !== 'file')
        .map(([key, value]) => [key, value.toString()])
    );

    const {
      type,
      category,
      assignment_id,
      public: isPublic,
    } = UploadParamsSchema.parse(uploadParams);

    // Validate file
    const validationResult = validateFile(file, type);
    if (!validationResult.isValid) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    // Check permissions for assignment uploads
    if (type === 'assignment' && assignment_id) {
      const userRole = session.user.app_metadata?.role || 'user';
      const userId = session.user.id;

      // Verify assignment exists and user has permission
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .select('id, teacher_id, class_id')
        .eq('id', assignment_id)
        .eq('tenant_id', tenantId)
        .single();

      if (assignmentError || !assignment) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
      }

      // Check if user can upload to this assignment
      const canUpload =
        userRole === 'super_admin' ||
        userRole === 'admin' ||
        (userRole === 'teacher' && assignment.teacher_id === userId) ||
        userRole === 'student'; // Students can submit assignments

      if (!canUpload) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Generate storage path
    const storagePath = generateStoragePath({
      tenantId,
      userId: session.user.id,
      type,
      category,
      fileName: file.name,
      assignmentId: assignment_id,
    });

    // Upload file
    const uploadResult = await storage.upload(file, storagePath, {
      isPublic,
      metadata: {
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString(),
        type,
        category,
        assignmentId: assignment_id,
        tenantId,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
      },
    });

    // Store file metadata in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        id: uploadResult.id,
        tenant_id: tenantId,
        name: file.name,
        path: storagePath,
        size_bytes: file.size,
        mime_type: file.type,
        storage_provider: uploadResult.provider,
        category: type,
        is_public: isPublic || false,
        uploaded_by: session.user.id,
        metadata: uploadResult.metadata,
        assignment_id: assignment_id || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the upload if database insertion fails
      // File is already uploaded to storage
    }

    return NextResponse.json({
      success: true,
      file: {
        id: uploadResult.id,
        name: file.name,
        path: storagePath,
        size: file.size,
        mimeType: file.type,
        url: uploadResult.publicUrl,
        provider: uploadResult.provider,
        metadata: uploadResult.metadata,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid upload parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/storage/upload
 * Get upload configuration and limits
 */
export async function GET() {
  try {
    const config = {
      maxFileSize: {
        assignment: 50 * 1024 * 1024, // 50MB
        profile: 5 * 1024 * 1024, // 5MB
        document: 100 * 1024 * 1024, // 100MB
        image: 10 * 1024 * 1024, // 10MB
      },
      allowedMimeTypes: {
        assignment: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/zip',
          'application/x-rar-compressed',
        ],
        profile: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        document: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      },
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching upload config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
