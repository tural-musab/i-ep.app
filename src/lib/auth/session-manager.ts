import { withAdminClient } from '@/lib/supabase/admin';
import { NextRequest } from 'next/server';

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  // Session timeout periods (in milliseconds)
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  ABSOLUTE_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
  WARNING_BEFORE_TIMEOUT: 5 * 60 * 1000, // 5 minutes warning

  // Session extension
  EXTEND_ON_ACTIVITY: true,
  MIN_EXTENSION_INTERVAL: 60 * 1000, // 1 minute

  // Security settings
  SECURE_COOKIE: process.env.NODE_ENV === 'production',
  SAME_SITE: 'lax' as const,
  HTTP_ONLY: true,

  // Session storage
  COOKIE_NAME: 'iep-session',
  SESSION_PREFIX: 'session:',
} as const;

/**
 * Session data interface
 */
export interface SessionData {
  id: string;
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  mfaVerified: boolean;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Session manager for handling user sessions
 */
export class SessionManager {
  /**
   * Create a new session
   */
  static async createSession(
    userId: string,
    tenantId: string,
    role: string,
    email: string,
    request?: NextRequest
  ): Promise<SessionData> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_CONFIG.ABSOLUTE_TIMEOUT);

    const sessionData: SessionData = {
      id: crypto.randomUUID(),
      userId,
      tenantId,
      role,
      email,
      mfaVerified: false,
      createdAt: now,
      lastActivityAt: now,
      expiresAt,
      ipAddress: request?.ip || request?.headers.get('x-forwarded-for') || undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
    };

    // Store session in database
    await withAdminClient(async (client) => {
      const { error } = await client.from('user_sessions').insert({
        id: sessionData.id,
        user_id: userId,
        session_token: this.generateSessionToken(sessionData.id),
        mfa_verified: false,
        ip_address: sessionData.ipAddress,
        user_agent: sessionData.userAgent,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        last_activity_at: now.toISOString(),
      });

      if (error) {
        console.error('Failed to create session:', error);
        throw new Error('Session creation failed');
      }
    });

    return sessionData;
  }

  /**
   * Get session by ID
   */
  static async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const { data, error } = await withAdminClient(async (client) =>
        client
          .from('user_sessions')
          .select(
            `
            *,
            auth.users!inner(
              email,
              raw_user_meta_data
            )
          `
          )
          .eq('id', sessionId)
          .single()
      );

      if (error || !data) {
        return null;
      }

      // Check if session is expired
      if (new Date(data.expires_at) < new Date()) {
        await this.invalidateSession(sessionId);
        return null;
      }

      // Check idle timeout
      const lastActivity = new Date(data.last_activity_at);
      const idleTime = Date.now() - lastActivity.getTime();

      if (idleTime > SESSION_CONFIG.IDLE_TIMEOUT) {
        await this.invalidateSession(sessionId);
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        tenantId: data.auth.users.raw_user_meta_data?.tenant_id || '',
        role: data.auth.users.raw_user_meta_data?.role || 'user',
        email: data.auth.users.email || '',
        mfaVerified: data.mfa_verified || false,
        createdAt: new Date(data.created_at),
        lastActivityAt: new Date(data.last_activity_at),
        expiresAt: new Date(data.expires_at),
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
      };
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Update session activity
   */
  static async updateActivity(sessionId: string, extend: boolean = true): Promise<void> {
    const now = new Date();

    await withAdminClient(async (client) => {
      const updates: any = {
        last_activity_at: now.toISOString(),
      };

      // Extend session if configured
      if (extend && SESSION_CONFIG.EXTEND_ON_ACTIVITY) {
        const newExpiry = new Date(now.getTime() + SESSION_CONFIG.IDLE_TIMEOUT);
        updates.expires_at = newExpiry.toISOString();
      }

      const { error } = await client.from('user_sessions').update(updates).eq('id', sessionId);

      if (error) {
        console.error('Failed to update session activity:', error);
      }
    });
  }

  /**
   * Verify MFA for session
   */
  static async verifyMFAForSession(sessionId: string): Promise<void> {
    await withAdminClient(async (client) => {
      const { error } = await client
        .from('user_sessions')
        .update({
          mfa_verified: true,
          mfa_verified_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Failed to verify MFA for session:', error);
        throw new Error('MFA verification failed');
      }
    });
  }

  /**
   * Invalidate session
   */
  static async invalidateSession(sessionId: string): Promise<void> {
    await withAdminClient(async (client) => {
      const { error } = await client.from('user_sessions').delete().eq('id', sessionId);

      if (error) {
        console.error('Failed to invalidate session:', error);
      }
    });
  }

  /**
   * Invalidate all sessions for a user
   */
  static async invalidateAllUserSessions(userId: string): Promise<void> {
    await withAdminClient(async (client) => {
      const { error } = await client.from('user_sessions').delete().eq('user_id', userId);

      if (error) {
        console.error('Failed to invalidate user sessions:', error);
      }
    });
  }

  /**
   * Get active sessions for a user
   */
  static async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const { data, error } = await withAdminClient(async (client) =>
        client
          .from('user_sessions')
          .select('*')
          .eq('user_id', userId)
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
      );

      if (error || !data) {
        return [];
      }

      // Filter out idle sessions
      const activeSessions = data.filter((session) => {
        const lastActivity = new Date(session.last_activity_at);
        const idleTime = Date.now() - lastActivity.getTime();
        return idleTime <= SESSION_CONFIG.IDLE_TIMEOUT;
      });

      return activeSessions.map((session) => ({
        id: session.id,
        userId: session.user_id,
        tenantId: '', // Would need to fetch from user data
        role: '', // Would need to fetch from user data
        email: '', // Would need to fetch from user data
        mfaVerified: session.mfa_verified || false,
        createdAt: new Date(session.created_at),
        lastActivityAt: new Date(session.last_activity_at),
        expiresAt: new Date(session.expires_at),
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
      }));
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }

  /**
   * Check if session is about to expire
   */
  static isSessionExpiringSoon(session: SessionData): boolean {
    const timeUntilExpiry = session.expiresAt.getTime() - Date.now();
    const timeUntilIdle =
      SESSION_CONFIG.IDLE_TIMEOUT - (Date.now() - session.lastActivityAt.getTime());

    const minTimeRemaining = Math.min(timeUntilExpiry, timeUntilIdle);

    return minTimeRemaining <= SESSION_CONFIG.WARNING_BEFORE_TIMEOUT;
  }

  /**
   * Generate secure session token
   */
  private static generateSessionToken(sessionId: string): string {
    const timestamp = Date.now();
    const random = crypto.randomUUID();
    return `${SESSION_CONFIG.SESSION_PREFIX}${sessionId}-${timestamp}-${random}`;
  }

  /**
   * Clean up expired sessions (should be run periodically)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data, error } = await withAdminClient(async (client) =>
        client.rpc('cleanup_expired_sessions')
      );

      if (error) {
        console.error('Failed to cleanup expired sessions:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Session cleanup error:', error);
      return 0;
    }
  }
}

/**
 * Session middleware for checking and extending sessions
 */
export async function withSession(
  request: NextRequest,
  handler: (session: SessionData) => Promise<Response>
): Promise<Response> {
  const sessionId = request.cookies.get(SESSION_CONFIG.COOKIE_NAME)?.value;

  if (!sessionId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const session = await SessionManager.getSession(sessionId);

  if (!session) {
    return new Response('Session expired', { status: 401 });
  }

  // Check if session is expiring soon
  if (SessionManager.isSessionExpiringSoon(session)) {
    // Add warning header
    const response = await handler(session);
    response.headers.set('X-Session-Expiring-Soon', 'true');
    response.headers.set(
      'X-Session-Expires-In',
      String(Math.floor((session.expiresAt.getTime() - Date.now()) / 1000))
    );
    return response;
  }

  // Update activity
  await SessionManager.updateActivity(sessionId);

  return handler(session);
}

/**
 * Create session cookie
 */
export function createSessionCookie(sessionId: string): string {
  const maxAge = SESSION_CONFIG.ABSOLUTE_TIMEOUT / 1000; // Convert to seconds

  const cookieOptions = [
    `${SESSION_CONFIG.COOKIE_NAME}=${sessionId}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    `SameSite=${SESSION_CONFIG.SAME_SITE}`,
  ];

  if (SESSION_CONFIG.SECURE_COOKIE) {
    cookieOptions.push('Secure');
  }

  if (SESSION_CONFIG.HTTP_ONLY) {
    cookieOptions.push('HttpOnly');
  }

  return cookieOptions.join('; ');
}
