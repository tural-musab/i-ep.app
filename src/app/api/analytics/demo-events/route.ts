/**
 * Demo Analytics Events API
 * Collects and stores demo usage events
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
  timestamp: z.string().datetime(),
  role: z.enum(['admin', 'teacher', 'student', 'parent']),
  page: z.string(),
  feature: z.string().optional(),
  duration: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

const DemoBatchEventsSchema = z.object({
  sessionId: z.string(),
  session: z.object({
    id: z.string(),
    role: z.enum(['admin', 'teacher', 'student', 'parent']),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    duration: z.number().optional(),
    locale: z.string(),
    country: z.string().optional(),
    referrer: z.string().optional(),
    userAgent: z.string(),
    screenResolution: z.string(),
    completed: z.boolean(),
    conversionAction: z.string().optional(),
  }),
  events: z.array(DemoEventSchema),
});

/**
 * POST /api/analytics/demo-events
 * Store a single demo event
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (100 events per minute per IP)
    const rateLimitResult = await rateLimit(request, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      keyGenerator: (req) => `demo_events_${req.ip || 'anonymous'}`,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedEvent = DemoEventSchema.parse(body);

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

    // Store the event
    const { error } = await supabase
      .from('demo_events')
      .insert({
        session_id: validatedEvent.sessionId,
        event_type: validatedEvent.eventType,
        event_name: validatedEvent.eventName,
        timestamp: validatedEvent.timestamp,
        role: validatedEvent.role,
        page: validatedEvent.page,
        feature: validatedEvent.feature,
        duration: validatedEvent.duration,
        metadata: validatedEvent.metadata || {},
        ip_hash: hashIP(request.ip || 'unknown'), // Privacy-compliant IP hashing
        user_agent_hash: hashUserAgent(request.headers.get('user-agent') || ''),
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to store demo event:', error);
      return NextResponse.json(
        { error: 'Failed to store event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Demo analytics error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event data', details: error.errors },
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
 * GET /api/analytics/demo-events
 * Retrieve demo events (admin only)
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const role = searchParams.get('role');
    const eventType = searchParams.get('event_type');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabase
      .from('demo_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }

    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Failed to fetch demo events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    return NextResponse.json({ events });

  } catch (error) {
    console.error('Demo analytics fetch error:', error);
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