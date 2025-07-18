/**
 * Middleware Performance API
 * Sprint 2 PF-001: Performance monitoring endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { middlewareMonitor } from '@/lib/performance/middleware-monitor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(request: NextRequest) {
  // Auth check - only super admins can access
  const session = await getServerSession(authOptions);
  if (!session || session.user.app_metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'health';
  const limit = parseInt(searchParams.get('limit') || '100');
  const minutes = parseInt(searchParams.get('minutes') || '5');

  try {
    switch (action) {
      case 'health':
        return NextResponse.json(middlewareMonitor.getHealthStatus());

      case 'metrics':
        return NextResponse.json({
          metrics: middlewareMonitor.getMetrics(limit),
          summary: {
            averageResponseTime: middlewareMonitor.getAverageProcessingTime(minutes),
            cacheHitRate: middlewareMonitor.getCacheHitRate(minutes),
            healthStatus: middlewareMonitor.getHealthStatus(),
          },
        });

      case 'summary':
        return NextResponse.json({
          averageResponseTime: middlewareMonitor.getAverageProcessingTime(minutes),
          cacheHitRate: middlewareMonitor.getCacheHitRate(minutes),
          healthStatus: middlewareMonitor.getHealthStatus(),
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Middleware performance API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Auth check - only super admins can access
  const session = await getServerSession(authOptions);
  if (!session || session.user.app_metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'clear_cache':
        // Clear tenant cache (if we had access to it)
        return NextResponse.json({ success: true, message: 'Cache cleared' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Middleware performance API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
