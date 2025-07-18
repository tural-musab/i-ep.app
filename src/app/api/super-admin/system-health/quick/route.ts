/**
 * Super Admin Quick System Health Check
 * Sprint 7: Hızlı sistem sağlığı kontrolü
 *
 * GET /api/super-admin/system-health/quick
 *
 * Bu endpoint kritik bileşenlerin hızlı sağlık kontrolünü yapar:
 * - Database bağlantısı (ping)
 * - Redis bağlantısı (ping)
 */

import { NextRequest, NextResponse } from 'next/server';
import { SystemHealthService } from '@/lib/system/system-health';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('super-admin-quick-health');

/**
 * Super Admin yetki kontrolü
 */
async function validateSuperAdminAccess(
  request: NextRequest
): Promise<{ authorized: boolean; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'Authorization header missing or invalid' };
    }

    const token = authHeader.split(' ')[1];
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return { authorized: false, error: 'Invalid or expired token' };
    }

    const { data: isSuperAdmin, error: roleError } = await supabaseAdmin.rpc('is_super_admin');

    if (roleError || !isSuperAdmin) {
      return { authorized: false, error: 'Super admin access required' };
    }

    return { authorized: true };
  } catch (error) {
    logger.error('Super admin validation error:', error);
    return { authorized: false, error: 'Authentication verification failed' };
  }
}

/**
 * GET /api/super-admin/system-health/quick
 * Hızlı sistem sağlığı kontrolü
 *
 * @swagger
 * /api/super-admin/system-health/quick:
 *   get:
 *     summary: Quick system health check
 *     description: Returns basic health status of critical components (Database, Redis). Optimized for frequent polling.
 *     tags:
 *       - Super Admin
 *       - System Health
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quick health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy]
 *                     timestamp:
 *                       type: string
 *                       format: date-time
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
        },
        { status: 401 }
      );
    }

    // Hızlı sağlık kontrolü
    logger.info('Performing quick system health check');
    const quickResult = await SystemHealthService.quickHealthCheck();

    return NextResponse.json({
      success: true,
      data: quickResult,
      timestamp,
    });
  } catch (error) {
    logger.error('Quick health check failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Quick health check failed',
        timestamp,
      },
      { status: 500 }
    );
  }
}
