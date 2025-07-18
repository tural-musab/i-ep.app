/**
 * Super Admin System Health API
 * Sprint 7: Super Admin Paneli - Sistem Sağlığı Endpoint'i
 *
 * Bu endpoint sistem sağlığını kontrol eder ve sadece super admin'ler tarafından erişilebilir.
 *
 * GET /api/super-admin/system-health
 * GET /api/super-admin/system-health/quick
 */

import { NextRequest, NextResponse } from 'next/server';
import { SystemHealthService } from '@/lib/system/system-health';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getLogger } from '@/lib/utils/logger';
import { HealthCheckResponse } from '@/types/system-health';

const logger = getLogger('super-admin-health-api');

/**
 * Super Admin yetki kontrolü
 */
async function validateSuperAdminAccess(
  request: NextRequest
): Promise<{ authorized: boolean; error?: string }> {
  try {
    // Authorization header kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'Authorization header missing or invalid' };
    }

    const token = authHeader.split(' ')[1];

    // Supabase ile token doğrulama
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      logger.warn('Invalid or expired token in system health request');
      return { authorized: false, error: 'Invalid or expired token' };
    }

    // Super admin rolü kontrolü
    const { data: isSuperAdmin, error: roleError } = await supabaseAdmin.rpc('is_super_admin');

    if (roleError) {
      logger.error('Error checking super admin status:', roleError);
      return { authorized: false, error: 'Unable to verify admin status' };
    }

    if (!isSuperAdmin) {
      logger.warn(`Non-admin user attempted to access system health: ${user.email}`);
      return { authorized: false, error: 'Super admin access required' };
    }

    logger.info(`Super admin system health access granted: ${user.email}`);
    return { authorized: true };
  } catch (error) {
    logger.error('Super admin validation error:', error);
    return { authorized: false, error: 'Authentication verification failed' };
  }
}

/**
 * GET /api/super-admin/system-health
 * Tam sistem sağlığı raporu döndürür
 *
 * @swagger
 * /api/super-admin/system-health:
 *   get:
 *     summary: Comprehensive system health report
 *     description: Returns detailed health status of all system components (Database, Redis, SSL, etc.). Requires super admin access.
 *     tags:
 *       - Super Admin
 *       - System Health
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SystemHealthReport'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Super admin access required
 *       500:
 *         description: Health check failed
 */
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    // Super admin yetki kontrolü
    const { authorized, error: authError } = await validateSuperAdminAccess(request);
    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          error: authError || 'Unauthorized',
          timestamp,
        } satisfies HealthCheckResponse,
        { status: 401 }
      );
    }

    // Full health check
    logger.info('Performing comprehensive system health check');
    const healthReport = await SystemHealthService.generateHealthReport();

    // Log system status
    logger.info(`System health check completed: ${healthReport.overall.status}`, {
      status: healthReport.overall.status,
      uptime: healthReport.overall.uptime,
      checks: healthReport.overall.checks.length,
      failedChecks: healthReport.overall.checks.filter((c) => c.status === 'fail').length,
    });

    return NextResponse.json({
      success: true,
      data: healthReport,
      timestamp,
    } satisfies HealthCheckResponse);
  } catch (error) {
    logger.error('System health check failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp,
      } satisfies HealthCheckResponse,
      { status: 500 }
    );
  }
}

/**
 * Health check özeti döndüren alternatif endpoint
 * Bu endpoint cache'lenebilir ve daha sık çağrılabilir
 */
export async function HEAD(request: NextRequest) {
  try {
    const { authorized } = await validateSuperAdminAccess(request);
    if (!authorized) {
      return new NextResponse(null, { status: 401 });
    }

    const quickResult = await SystemHealthService.quickHealthCheck();
    const status = quickResult.status === 'healthy' ? 200 : 503;

    return new NextResponse(null, {
      status,
      headers: {
        'X-Health-Status': quickResult.status,
        'X-Health-Timestamp': quickResult.timestamp,
        'Cache-Control': 'no-cache, must-revalidate',
      },
    });
  } catch (error) {
    logger.error('HEAD health check failed:', error);
    return new NextResponse(null, { status: 500 });
  }
}
