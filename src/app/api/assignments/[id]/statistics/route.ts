/**
 * Assignment Statistics API Endpoint
 * İ-EP.APP - Assignment Management System
 * Provides detailed statistics for assignments
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { AssignmentRepository } from '@/lib/repository/assignment-repository';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
 * GET /api/assignments/[id]/statistics
 * Get comprehensive statistics for a specific assignment
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

    // Validate assignment ID
    const assignmentId = z.string().uuid().parse(params.id);

    // Initialize repository
    const assignmentRepo = new AssignmentRepository(tenantId);

    // Verify assignment exists
    const assignment = await assignmentRepo.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const userId = session.user.id;
    const userRole = session.user.app_metadata?.role || 'user';
    
    // Only teachers who created the assignment, admins, or super admins can view statistics
    const canViewStats = userRole === 'super_admin' || 
                        userRole === 'admin' || 
                        (userRole === 'teacher' && assignment.teacher_id === userId);

    if (!canViewStats) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get comprehensive statistics
    const statistics = await assignmentRepo.getStatistics(assignmentId);

    // Calculate additional metrics
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const isOverdue = now > dueDate;
    const timeToDeadline = dueDate.getTime() - now.getTime();
    const daysToDeadline = Math.ceil(timeToDeadline / (1000 * 60 * 60 * 24));

    // Get submission status breakdown
    const submissionStats = await assignmentRepo.getSubmissionStatusBreakdown(assignmentId);

    // Get score distribution
    const scoreDistribution = await assignmentRepo.getScoreDistribution(assignmentId);

    // Get performance by class/subject analytics
    const performanceAnalytics = await assignmentRepo.getPerformanceAnalytics(assignmentId);

    const response = {
      assignment: {
        id: assignment.id,
        title: assignment.title,
        type: assignment.type,
        subject: assignment.subject,
        due_date: assignment.due_date,
        max_score: assignment.max_score,
        status: assignment.status,
        is_overdue: isOverdue,
        days_to_deadline: daysToDeadline
      },
      basic_stats: {
        total_submissions: statistics.total_submissions,
        graded_submissions: statistics.graded_submissions,
        pending_submissions: statistics.total_submissions - statistics.graded_submissions,
        completion_rate: statistics.completion_rate,
        average_score: statistics.average_score,
        median_score: statistics.median_score,
        highest_score: statistics.highest_score,
        lowest_score: statistics.lowest_score
      },
      submission_status: submissionStats,
      score_distribution: scoreDistribution,
      performance_analytics: performanceAnalytics,
      timeline: {
        created_at: assignment.created_at,
        due_date: assignment.due_date,
        last_submission: statistics.last_submission_date,
        last_graded: statistics.last_graded_date
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching assignment statistics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid assignment ID', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}