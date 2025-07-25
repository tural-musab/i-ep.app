import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant/current-tenant';
import { logAuditEvent } from '@/lib/audit';
import * as Sentry from '@sentry/nextjs';

/**
 * GET /api/assignments/statistics
 * Get assignment statistics for the current tenant
 * Used by dashboard to display assignment metrics
 */
export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/assignments/statistics',
    },
    async () => {
      try {
        // Authentication check with development mode bypass
        let session = await getServerSession(authOptions);
        
        // DEVELOPMENT MODE: Create mock session if no real session
        if (!session && process.env.NODE_ENV === 'development') {
          console.log('🔧 [DEV] No session found, creating mock session for development');
          session = {
            user: {
              id: 'b21d6d69-3c4e-406d-9e5c-c929ad64095b',
              email: 'admin@demo.local',
              name: 'Demo Admin',
              role: 'admin'
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          } as any;
        }
        
        if (!session || !session.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get tenant information
        const tenant = await getCurrentTenant();
        if (!tenant) {
          return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
        }

        // Authorization check - admin, teacher can view statistics
        // @ts-expect-error - NextAuth user type doesn't include role
        const userRole = session.user.role;
        if (!['admin', 'teacher'].includes(userRole)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // DEVELOPMENT MODE: Return mock data to bypass database issues
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 [DEV] Returning mock assignment statistics for development');
          const mockStats = {
            totalAssignments: 15,
            activeAssignments: 8,
            completedAssignments: 7,
            pendingGrades: 12,
            completionRate: 78,
            averageGrade: 85.4,
            recentAssignments: [
              {
                id: '1',
                title: 'Matematik Problemleri Çözümü',
                subject: 'Matematik',
                due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'published',
                submission_count: 23
              },
              {
                id: '2', 
                title: 'Fen Bilgisi Deney Raporu',
                subject: 'Fen Bilgisi',
                due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'published',
                submission_count: 18
              },
              {
                id: '3',
                title: 'İngilizce Kelime Testi', 
                subject: 'İngilizce',
                due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'published',
                submission_count: 25
              }
            ]
          };

          return NextResponse.json(mockStats);
        }

        const supabase = createServerSupabaseClient();

        // Get assignment counts by status
        const [
          totalAssignmentsResult,
          activeAssignmentsResult,
          completedAssignmentsResult,
          pendingGradesResult,
          submissionsResult,
        ] = await Promise.all([
          // Total assignments
          supabase
            .from('assignments')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .is('deleted_at', null),

          // Active assignments
          supabase
            .from('assignments')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .eq('status', 'published')
            .is('deleted_at', null),

          // Completed assignments (past due date)
          supabase
            .from('assignments')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .eq('status', 'published')
            .lt('due_date', new Date().toISOString())
            .is('deleted_at', null),

          // Assignments with pending grades (submitted but not graded)
          supabase
            .from('assignment_submissions')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .eq('status', 'submitted')
            .is('grade', null)
            .is('deleted_at', null),

          // All submissions for completion rate calculation
          supabase
            .from('assignment_submissions')
            .select(
              `
              id,
              assignment_id,
              status,
              grade,
              assignments!assignment_submissions_assignment_id_fkey (
                id,
                status
              )
            `
            )
            .eq('tenant_id', tenant.id)
            .is('deleted_at', null),
        ]);

        // Handle query errors
        if (totalAssignmentsResult.error) throw totalAssignmentsResult.error;
        if (activeAssignmentsResult.error) throw activeAssignmentsResult.error;
        if (completedAssignmentsResult.error) throw completedAssignmentsResult.error;
        if (pendingGradesResult.error) throw pendingGradesResult.error;
        if (submissionsResult.error) throw submissionsResult.error;

        // Calculate statistics
        const totalAssignments = totalAssignmentsResult.count || 0;
        const activeAssignments = activeAssignmentsResult.count || 0;
        const completedAssignments = completedAssignmentsResult.count || 0;
        const pendingGrades = pendingGradesResult.count || 0;

        // Calculate average score and completion rate from submissions
        const submissions = submissionsResult.data || [];
        const gradedSubmissions = submissions.filter((s) => s.grade !== null);
        const averageScore =
          gradedSubmissions.length > 0
            ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) /
              gradedSubmissions.length
            : 0;

        // Calculate completion rate (submitted vs total possible submissions)
        const activeSubmissions = submissions.filter(
          (s) => s.assignments && s.assignments.status === 'published'
        );
        const submittedCount = activeSubmissions.filter(
          (s) => s.status === 'submitted' || s.status === 'graded'
        ).length;
        const completionRate =
          activeSubmissions.length > 0 ? (submittedCount / activeSubmissions.length) * 100 : 0;

        const statistics = {
          totalAssignments,
          activeAssignments,
          completedAssignments,
          pendingGrades,
          averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
          completionRate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
          gradedSubmissions: gradedSubmissions.length,
          totalSubmissions: submissions.length,
        };

        // Log audit event
        await logAuditEvent(
          tenant.id,
          session.user.id || '',
          'view',
          'assignment_statistics',
          '',
          {},
          { statistics }
        );

        return NextResponse.json(statistics);
      } catch (error) {
        console.error('Assignment statistics error:', error);
        Sentry.captureException(error);

        return NextResponse.json(
          { error: 'Failed to fetch assignment statistics' },
          { status: 500 }
        );
      }
    }
  );
}
