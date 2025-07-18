/**
 * File Management API Endpoint
 * İ-EP.APP - Storage System
 * Handles file operations (download, delete, info)
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { storage } from '@/lib/storage';

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
 * GET /api/storage/files/[id]
 * Download or get file info
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = getTenantId();
    const supabase = await createServerSupabaseClient();

    // Verify authentication for non-public files
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    // Validate file ID
    const fileId = z.string().uuid().parse(params.id);

    // Get file metadata from database
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('tenant_id', tenantId)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check permissions for private files
    if (!file.is_public) {
      if (authError || !session) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const userId = session.user.id;
      const userRole = session.user.app_metadata?.role || 'user';

      // Check if user can access this file
      const canAccess =
        userRole === 'super_admin' || userRole === 'admin' || file.uploaded_by === userId;

      // For assignment files, check if user is teacher or student of the assignment
      if (!canAccess && file.assignment_id) {
        const { data: assignment } = await supabase
          .from('assignments')
          .select('teacher_id, class_id')
          .eq('id', file.assignment_id)
          .eq('tenant_id', tenantId)
          .single();

        if (assignment) {
          const isTeacher = assignment.teacher_id === userId;
          const isStudent = userRole === 'student'; // Additional class membership check needed

          if (isTeacher || isStudent) {
            // Allow access
          } else {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
          }
        }
      } else if (!canAccess) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Check if request wants file info or download
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'info') {
      // Return file metadata
      return NextResponse.json({
        id: file.id,
        name: file.name,
        size: file.size_bytes,
        mimeType: file.mime_type,
        category: file.category,
        isPublic: file.is_public,
        uploadedBy: file.uploaded_by,
        uploadedAt: file.created_at,
        metadata: file.metadata,
      });
    }

    // Download file
    if (file.is_public) {
      // For public files, redirect to direct URL
      const publicUrl = storage.getPublicUrl(fileId);
      return NextResponse.redirect(publicUrl);
    } else {
      // For private files, stream through our server
      const fileBlob = await storage.download(fileId);

      return new NextResponse(fileBlob, {
        headers: {
          'Content-Type': file.mime_type,
          'Content-Length': file.size_bytes.toString(),
          'Content-Disposition': `attachment; filename="${file.name}"`,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('Error handling file request:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/storage/files/[id]
 * Delete a file
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

    // Validate file ID
    const fileId = z.string().uuid().parse(params.id);

    // Get file metadata
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('tenant_id', tenantId)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check permissions
    const userId = session.user.id;
    const userRole = session.user.app_metadata?.role || 'user';

    const canDelete =
      userRole === 'super_admin' || userRole === 'admin' || file.uploaded_by === userId;

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Delete from storage
    await storage.delete(fileId);

    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)
      .eq('tenant_id', tenantId);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      // File is already deleted from storage, log but don't fail
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/storage/files/[id]
 * Update file metadata
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

    // Validate file ID
    const fileId = z.string().uuid().parse(params.id);

    // Parse request body
    const body = await request.json();
    const updateData = z
      .object({
        name: z.string().optional(),
        is_public: z.boolean().optional(),
        metadata: z.record(z.any()).optional(),
      })
      .parse(body);

    // Get existing file
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('tenant_id', tenantId)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check permissions
    const userId = session.user.id;
    const userRole = session.user.app_metadata?.role || 'user';

    const canUpdate =
      userRole === 'super_admin' || userRole === 'admin' || file.uploaded_by === userId;

    if (!canUpdate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update file metadata
    const { data: updatedFile, error: updateError } = await supabase
      .from('files')
      .update({
        name: updateData.name || file.name,
        is_public: updateData.is_public !== undefined ? updateData.is_public : file.is_public,
        metadata: updateData.metadata || file.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fileId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update file' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      file: {
        id: updatedFile.id,
        name: updatedFile.name,
        size: updatedFile.size_bytes,
        mimeType: updatedFile.mime_type,
        isPublic: updatedFile.is_public,
        metadata: updatedFile.metadata,
        updatedAt: updatedFile.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating file:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
