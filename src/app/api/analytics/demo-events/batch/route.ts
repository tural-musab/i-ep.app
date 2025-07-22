/**
 * Demo Analytics Batch Events API
 * Collects multiple demo events and session data in a single request
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

// Validation schemas
const DemoEventSchema = z.object({
  sessionId: z.string(),
  eventType: z.enum(['page_view', 'feature_interaction', 'conversion_attempt', 'error', 'completion']),
  eventName: z.string(),
  timestamp: z.string(),
  role: z.enum(['admin', 'teacher', 'student', 'parent']),
  page: z.string(),
  feature: z.string().optional(),
  duration: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

const DemoSessionSchema = z.object({
  id: z.string(),
  role: z.enum(['admin', 'teacher', 'student', 'parent']),
  startTime: z.string(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  locale: z.string(),
  country: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string(),
  screenResolution: z.string(),
  completed: z.boolean(),
  conversionAction: z.string().optional(),
});

const DemoBatchEventsSchema = z.object({
  sessionId: z.string(),
  session: DemoSessionSchema,
  events: z.array(DemoEventSchema),
});

/**
 * POST /api/analytics/demo-events/batch
 * Store multiple demo events and session data
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (10 batch requests per minute per IP)
    const rateLimitResult = await rateLimit(request, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      keyGenerator: (req) => `demo_batch_${req.ip || 'anonymous'}`,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many batch requests' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedBatch = DemoBatchEventsSchema.parse(body);

    // Only process events from demo environment
    const origin = request.headers.get('origin') || '';
    const referer = request.headers.get('referer') || '';
    
    if (!isDemoOrigin(origin) && !isDemoOrigin(referer)) {
      return NextResponse.json(
        { error: 'Unauthorized origin' },
        { status: 403 }
      );
    }

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Start transaction-like operation
    try {
      // 1. Store or update session data
      const { error: sessionError } = await supabase
        .from('demo_sessions')
        .upsert({
          id: validatedBatch.session.id,
          role: validatedBatch.session.role,
          start_time: validatedBatch.session.startTime,
          end_time: validatedBatch.session.endTime,
          duration: validatedBatch.session.duration,
          locale: validatedBatch.session.locale,
          country: validatedBatch.session.country,
          referrer: validatedBatch.session.referrer,
          user_agent: validatedBatch.session.userAgent,
          screen_resolution: validatedBatch.session.screenResolution,
          completed: validatedBatch.session.completed,
          conversion_action: validatedBatch.session.conversionAction,
          ip_hash: hashIP(request.ip || 'unknown'),
          user_agent_hash: hashUserAgent(request.headers.get('user-agent') || ''),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (sessionError) {
        console.error('Failed to store demo session:', sessionError);
        return NextResponse.json(
          { error: 'Failed to store session data' },
          { status: 500 }
        );
      }

      // 2. Store all events
      const eventsToInsert = validatedBatch.events.map(event => ({
        session_id: event.sessionId,
        event_type: event.eventType,
        event_name: event.eventName,
        timestamp: event.timestamp,
        role: event.role,
        page: event.page,
        feature: event.feature,
        duration: event.duration,
        metadata: event.metadata || {},
        ip_hash: hashIP(request.ip || 'unknown'),
        user_agent_hash: hashUserAgent(request.headers.get('user-agent') || ''),
        created_at: new Date().toISOString(),
      }));

      if (eventsToInsert.length > 0) {
        const { error: eventsError } = await supabase
          .from('demo_events')
          .insert(eventsToInsert);

        if (eventsError) {
          console.error('Failed to store demo events:', eventsError);
          return NextResponse.json(
            { error: 'Failed to store events' },
            { status: 500 }
          );
        }
      }

      // 3. Update session metrics
      await updateSessionMetrics(supabase, validatedBatch.session);

      return NextResponse.json({ 
        success: true,
        sessionId: validatedBatch.sessionId,
        eventsProcessed: validatedBatch.events.length,
      });

    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Failed to store batch data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Demo analytics batch error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid batch data', details: error.errors },
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
 * Helper function to check if origin is from demo environment
 */
function isDemoOrigin(origin: string): boolean {
  const demoOrigins = [
    'https://demo.i-ep.app',
    'http://demo.localhost:3000',
    'http://localhost:3000', // Allow localhost for development
  ];

  return demoOrigins.some(allowed => origin.startsWith(allowed));
}

/**
 * Privacy-compliant IP hashing
 */
function hashIP(ip: string): string {
  // Remove last octet from IPv4 or last 80 bits from IPv6 for privacy
  if (ip.includes('.')) {
    // IPv4
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  } else if (ip.includes(':')) {
    // IPv6 - keep first 48 bits only
    const parts = ip.split(':');
    return `${parts[0]}:${parts[1]}:${parts[2]}::`;
  }
  
  return 'anonymous';
}

/**
 * Privacy-compliant user agent hashing
 */
function hashUserAgent(userAgent: string): string {
  // Extract only browser and OS information
  const browserMatch = userAgent.match(/(Firefox|Chrome|Safari|Edge|Opera)\/[\d.]+/);
  const osMatch = userAgent.match(/(Windows|Mac|Linux|iOS|Android)/);
  
  const browser = browserMatch ? browserMatch[1] : 'Unknown';
  const os = osMatch ? osMatch[1] : 'Unknown';
  
  return `${browser} on ${os}`;
}

/**
 * Update session metrics for real-time analytics
 */
async function updateSessionMetrics(supabase: any, session: any) {
  try {
    // Calculate session metrics
    const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
    
    // Upsert daily metrics
    await supabase
      .from('demo_daily_metrics')
      .upsert({
        date: sessionDate,
        role: session.role,
        sessions_count: 1,
        total_duration: session.duration || 0,
        completions_count: session.completed ? 1 : 0,
        conversions_count: session.conversionAction ? 1 : 0,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'date,role',
      });

    // Update real-time counters
    await supabase.rpc('increment_demo_metrics', {
      p_date: sessionDate,
      p_role: session.role,
      p_duration: session.duration || 0,
      p_completed: session.completed,
      p_converted: !!session.conversionAction,
    });

  } catch (error) {
    console.warn('Failed to update session metrics:', error);
    // Don't fail the main request if metrics update fails
  }
}