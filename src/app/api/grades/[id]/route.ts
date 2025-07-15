/**
 * Grade API - Individual Grade Route
 * İ-EP.APP - Grade Management System
 * 
 * Endpoints:
 * - GET /api/grades/[id] - Get specific grade record
 * - PUT /api/grades/[id] - Update grade record
 * - DELETE /api/grades/[id] - Delete grade record
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { GradeRepository } from '@/lib/repository/grade-repository';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { z } from 'zod';

// Validation schemas
const GradeUpdateSchema = z.object({
  gradeValue: z.number().min(0, 'Grade value must be positive').optional(),
  maxGrade: z.number().min(1, 'Max grade must be at least 1').optional(),
  weight: z.number().min(0).max(1).optional(),
  examName: z.string().optional(),
  description: z.string().optional(),
  gradeDate: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

const GradeCommentSchema = z.object({
  commentText: z.string().min(1, 'Comment text is required'),
  commentType: z.enum(['general', 'strength', 'improvement', 'recommendation']).optional().default('general'),
  isVisibleToStudent: z.boolean().optional().default(true),
  isVisibleToParent: z.boolean().optional().default(true),
});

/**
 * GET /api/grades/[id]
 * Retrieve specific grade record with optional details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = getTenantId();
    const supabase = await createServerSupabaseClient();
    
    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate grade ID
    const gradeId = z.string().uuid().parse(params.id);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeComments = searchParams.get('includeComments') === 'true';
    const includeCalculations = searchParams.get('includeCalculations') === 'true';
    const includeStudent = searchParams.get('includeStudent') === 'true';
    
    // Initialize repository
    const gradeRepo = new GradeRepository(supabase, tenantId);
    
    // Get grade record
    const grade = await gradeRepo.getGradeById(gradeId, {
      includeComments,
      includeCalculations,
      includeStudent,
    });
    
    if (!grade) {
      return NextResponse.json(
        { error: 'Grade record not found' },
        { status: 404 }
      );
    }

    // Verify user has permission to view this grade
    const hasPermission = await gradeRepo.verifyGradeViewPermission(
      gradeId,
      session.user.id
    );
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view this grade' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: grade,
    });

  } catch (error) {
    console.error('Error fetching grade:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid grade ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch grade' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/grades/[id]
 * Update grade record
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = getTenantId();
    const supabase = await createServerSupabaseClient();
    
    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate grade ID
    const gradeId = z.string().uuid().parse(params.id);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = GradeUpdateSchema.parse(body);
    
    // Initialize repository
    const gradeRepo = new GradeRepository(supabase, tenantId);
    
    // Check if grade exists
    const existingGrade = await gradeRepo.getGradeById(gradeId);
    if (!existingGrade) {
      return NextResponse.json(
        { error: 'Grade record not found' },
        { status: 404 }
      );
    }

    // Verify user has permission to update this grade
    const hasPermission = await gradeRepo.verifyGradingPermission(
      existingGrade.classId,
      existingGrade.subjectId,
      session.user.id
    );
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update this grade' },
        { status: 403 }
      );
    }

    // Validate grade constraints
    if (validatedData.gradeValue !== undefined && validatedData.maxGrade !== undefined) {
      if (validatedData.gradeValue > validatedData.maxGrade) {
        return NextResponse.json(
          { error: 'Grade value cannot exceed maximum grade' },
          { status: 400 }
        );
      }
    } else if (validatedData.gradeValue !== undefined) {
      if (validatedData.gradeValue > existingGrade.maxGrade) {
        return NextResponse.json(
          { error: 'Grade value cannot exceed maximum grade' },
          { status: 400 }
        );
      }
    }

    // Update grade record
    const updatedGrade = await gradeRepo.updateGrade(gradeId, {
      ...validatedData,
      gradeDate: validatedData.gradeDate ? new Date(validatedData.gradeDate) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: updatedGrade,
      message: 'Grade updated successfully',
    });

  } catch (error) {
    console.error('Error updating grade:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update grade' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/grades/[id]
 * Delete grade record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = getTenantId();
    const supabase = await createServerSupabaseClient();
    
    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate grade ID
    const gradeId = z.string().uuid().parse(params.id);
    
    // Initialize repository
    const gradeRepo = new GradeRepository(supabase, tenantId);
    
    // Check if grade exists
    const existingGrade = await gradeRepo.getGradeById(gradeId);
    if (!existingGrade) {
      return NextResponse.json(
        { error: 'Grade record not found' },
        { status: 404 }
      );
    }

    // Verify user has permission to delete this grade
    const hasPermission = await gradeRepo.verifyGradingPermission(
      existingGrade.classId,
      existingGrade.subjectId,
      session.user.id
    );
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this grade' },
        { status: 403 }
      );
    }

    // Delete grade record
    await gradeRepo.deleteGrade(gradeId);

    return NextResponse.json({
      success: true,
      message: 'Grade deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting grade:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid grade ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete grade' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/grades/[id]/comment
 * Add comment to grade record
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = getTenantId();
    const supabase = await createServerSupabaseClient();
    
    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate grade ID
    const gradeId = z.string().uuid().parse(params.id);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = GradeCommentSchema.parse(body);
    
    // Initialize repository
    const gradeRepo = new GradeRepository(supabase, tenantId);
    
    // Check if grade exists
    const existingGrade = await gradeRepo.getGradeById(gradeId);
    if (!existingGrade) {
      return NextResponse.json(
        { error: 'Grade record not found' },
        { status: 404 }
      );
    }

    // Verify user has permission to comment on this grade
    const hasPermission = await gradeRepo.verifyGradingPermission(
      existingGrade.classId,
      existingGrade.subjectId,
      session.user.id
    );
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to comment on this grade' },
        { status: 403 }
      );
    }

    // Add comment to grade
    const comment = await gradeRepo.addGradeComment(gradeId, {
      commentText: validatedData.commentText,
      commentType: validatedData.commentType,
      isVisibleToStudent: validatedData.isVisibleToStudent,
      isVisibleToParent: validatedData.isVisibleToParent,
      teacherId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: comment,
      message: 'Comment added successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding grade comment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}