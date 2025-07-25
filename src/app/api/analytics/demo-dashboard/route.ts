/**
 * Demo Analytics Dashboard API
 * Provides aggregated demo metrics for monitoring dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schema for query parameters
const DashboardQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(['24h', '7d', '30d', '90d']).default('7d'),
  timezone: z.string().default('UTC'),
});

/**
 * GET /api/analytics/demo-dashboard
 * Get comprehensive demo analytics dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication - only admin users can access analytics
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin (in production, implement proper role checking)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = DashboardQuerySchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      period: searchParams.get('period'),
      timezone: searchParams.get('timezone'),
    });

    // Calculate date range based on period
    const dateRange = calculateDateRange(queryParams.period, queryParams.timezone);
    const startDate = queryParams.startDate || dateRange.start;
    const endDate = queryParams.endDate || dateRange.end;

    // Fetch dashboard data in parallel
    const [
      overviewMetrics,
      roleDistribution,
      geographicData,
      popularFeatures,
      timeSeriesData,
      conversionFunnel,
      performanceMetrics,
      realtimeData,
    ] = await Promise.all([
      getOverviewMetrics(supabase, startDate, endDate),
      getRoleDistribution(supabase, startDate, endDate),
      getGeographicData(supabase, startDate, endDate),
      getPopularFeatures(supabase, startDate, endDate),
      getTimeSeriesData(supabase, startDate, endDate, queryParams.period),
      getConversionFunnel(supabase, startDate, endDate),
      getPerformanceMetrics(supabase, startDate, endDate),
      getRealtimeData(supabase),
    ]);

    const dashboardData = {
      overview: overviewMetrics,
      roleDistribution,
      geographic: geographicData,
      features: popularFeatures,
      timeSeries: timeSeriesData,
      conversion: conversionFunnel,
      performance: performanceMetrics,
      realtime: realtimeData,
      metadata: {
        period: queryParams.period,
        startDate,
        endDate,
        timezone: queryParams.timezone,
        generatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Demo analytics dashboard error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate date range based on period
 */
function calculateDateRange(period: string, timezone: string) {
  const now = new Date();
  let start: Date;

  switch (period) {
    case '24h':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return {
    start: start.toISOString(),
    end: now.toISOString(),
  };
}

/**
 * Get overview metrics
 */
async function getOverviewMetrics(supabase: any, startDate: string, endDate: string) {
  const [sessionsResult, eventsResult, conversionsResult] = await Promise.all([
    supabase
      .from('demo_sessions')
      .select('id, duration, completed')
      .gte('start_time', startDate)
      .lte('start_time', endDate),
    
    supabase
      .from('demo_events')
      .select('event_type')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate),
    
    supabase
      .from('demo_sessions')
      .select('conversion_action')
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .not('conversion_action', 'is', null),
  ]);

  const sessions = sessionsResult.data || [];
  const events = eventsResult.data || [];
  const conversions = conversionsResult.data || [];

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s: any) => s.completed).length;
  const averageSessionDuration = sessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0) / totalSessions || 0;
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const conversionRate = totalSessions > 0 ? (conversions.length / totalSessions) * 100 : 0;

  return {
    totalSessions,
    totalEvents: events.length,
    averageSessionDuration: Math.round(averageSessionDuration / 1000), // Convert to seconds
    completionRate: Math.round(completionRate * 100) / 100,
    conversionRate: Math.round(conversionRate * 100) / 100,
    totalConversions: conversions.length,
  };
}

/**
 * Get role distribution
 */
async function getRoleDistribution(supabase: any, startDate: string, endDate: string) {
  const { data: sessions } = await supabase
    .from('demo_sessions')
    .select('role, duration, completed')
    .gte('start_time', startDate)
    .lte('start_time', endDate);

  const roleStats = (sessions || []).reduce((acc: any, session: any) => {
    const role = session.role;
    if (!acc[role]) {
      acc[role] = { sessions: 0, totalDuration: 0, completions: 0 };
    }
    acc[role].sessions += 1;
    acc[role].totalDuration += session.duration || 0;
    acc[role].completions += session.completed ? 1 : 0;
    return acc;
  }, {});

  return Object.entries(roleStats).map(([role, stats]: [string, any]) => ({
    role,
    sessions: stats.sessions,
    averageDuration: Math.round((stats.totalDuration / stats.sessions) / 1000) || 0,
    completionRate: Math.round((stats.completions / stats.sessions) * 100 * 100) / 100,
  }));
}

/**
 * Get geographic data
 */
async function getGeographicData(supabase: any, startDate: string, endDate: string) {
  const { data: sessions } = await supabase
    .from('demo_sessions')
    .select('country')
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .not('country', 'is', null);

  const countryStats = (sessions || []).reduce((acc: any, session: any) => {
    const country = session.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(countryStats)
    .map(([country, sessions]) => ({ country, sessions }))
    .sort((a: any, b: any) => b.sessions - a.sessions)
    .slice(0, 10); // Top 10 countries
}

/**
 * Get popular features
 */
async function getPopularFeatures(supabase: any, startDate: string, endDate: string) {
  const { data: events } = await supabase
    .from('demo_events')
    .select('feature, role')
    .eq('event_type', 'feature_interaction')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .not('feature', 'is', null);

  const featureStats = (events || []).reduce((acc: any, event: any) => {
    const key = `${event.feature}_${event.role}`;
    if (!acc[key]) {
      acc[key] = { feature: event.feature, role: event.role, interactions: 0 };
    }
    acc[key].interactions += 1;
    return acc;
  }, {});

  return Object.values(featureStats)
    .sort((a: any, b: any) => b.interactions - a.interactions)
    .slice(0, 20); // Top 20 features
}

/**
 * Get time series data
 */
async function getTimeSeriesData(supabase: any, startDate: string, endDate: string, period: string) {
  const interval = period === '24h' ? 'hour' : 'day';
  
  const { data: sessions } = await supabase
    .from('demo_sessions')
    .select('start_time, conversion_action')
    .gte('start_time', startDate)
    .lte('start_time', endDate);

  // Group by time interval
  const timeSeriesMap = (sessions || []).reduce((acc: any, session: any) => {
    const date = new Date(session.start_time);
    const key = interval === 'hour' 
      ? `${date.toISOString().split('T')[0]} ${date.getHours()}:00`
      : date.toISOString().split('T')[0];
    
    if (!acc[key]) {
      acc[key] = { date: key, sessions: 0, conversions: 0 };
    }
    acc[key].sessions += 1;
    if (session.conversion_action) {
      acc[key].conversions += 1;
    }
    return acc;
  }, {});

  return Object.values(timeSeriesMap).sort((a: any, b: any) => a.date.localeCompare(b.date));
}

/**
 * Get conversion funnel
 */
async function getConversionFunnel(supabase: any, startDate: string, endDate: string) {
  const { data: events } = await supabase
    .from('demo_events')
    .select('session_id, event_type, event_name')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .in('event_name', ['session_start', 'feature_used', 'demo_completed', 'conversion_attempt']);

  const sessionFunnels = (events || []).reduce((acc: any, event: any) => {
    const sessionId = event.session_id;
    if (!acc[sessionId]) {
      acc[sessionId] = new Set();
    }
    acc[sessionId].add(event.event_name);
    return acc;
  }, {});

  const funnelSteps = ['session_start', 'feature_used', 'demo_completed', 'conversion_attempt'];
  const stepCounts = funnelSteps.map(step => ({
    step,
    count: Object.values(sessionFunnels).filter((steps: any) => steps.has(step)).length,
  }));

  return stepCounts.map((step, index) => ({
    ...step,
    conversionRate: index > 0 ? Math.round((step.count / stepCounts[0].count) * 100 * 100) / 100 : 100,
  }));
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics(supabase: any, startDate: string, endDate: string) {
  const { data: events } = await supabase
    .from('demo_events')
    .select('metadata')
    .eq('event_name', 'page_performance')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate);

  const performanceData = (events || []).map((e: any) => e.metadata).filter(Boolean);

  if (performanceData.length === 0) {
    return {
      averageLoadTime: 0,
      averageDOMContentLoaded: 0,
      averageFirstContentfulPaint: 0,
      averageTimeToInteractive: 0,
    };
  }

  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
  const avg = (values: number[]) => sum(values) / values.length;

  const loadTimes = performanceData.map((p: any) => p.loadTime).filter(Boolean);
  const domTimes = performanceData.map((p: any) => p.domContentLoaded).filter(Boolean);
  const fcpTimes = performanceData.map((p: any) => p.firstContentfulPaint).filter(Boolean);
  const ttiTimes = performanceData.map((p: any) => p.timeToInteractive).filter(Boolean);

  return {
    averageLoadTime: Math.round(avg(loadTimes)) || 0,
    averageDOMContentLoaded: Math.round(avg(domTimes)) || 0,
    averageFirstContentfulPaint: Math.round(avg(fcpTimes)) || 0,
    averageTimeToInteractive: Math.round(avg(ttiTimes)) || 0,
  };
}

/**
 * Get realtime data (last 1 hour)
 */
async function getRealtimeData(supabase: any) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const [activeSessionsResult, recentEventsResult] = await Promise.all([
    supabase
      .from('demo_sessions')
      .select('id, role')
      .gte('start_time', oneHourAgo)
      .is('end_time', null),
    
    supabase
      .from('demo_events')
      .select('event_type')
      .gte('timestamp', oneHourAgo)
      .order('timestamp', { ascending: false })
      .limit(100),
  ]);

  return {
    activeSessions: (activeSessionsResult.data || []).length,
    recentEvents: (recentEventsResult.data || []).length,
    activeRoles: [...new Set((activeSessionsResult.data || []).map((s: any) => s.role))],
  };
}