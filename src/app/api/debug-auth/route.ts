/**
 * Debug Authentication API
 * Tests authentication state for debugging purposes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, getTenantIdFromHeaders } from '@/lib/auth/server-session';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Debug Auth: Starting authentication debug...');

    // 1. Test NextAuth session
    const nextAuthSession = await getServerSession(authOptions);
    console.log('🔧 Debug Auth: NextAuth session:', nextAuthSession ? 'EXISTS' : 'NULL');

    // 2. Test Supabase session
    const supabase = createServerSupabaseClient();
    const {
      data: { session: supabaseSession },
      error: supabaseError,
    } = await supabase.auth.getSession();
    console.log(
      '🔧 Debug Auth: Supabase session:',
      supabaseSession ? 'EXISTS' : 'NULL',
      supabaseError ? `ERROR: ${supabaseError.message}` : 'NO ERROR'
    );

    // 3. Test hybrid auth function
    const hybridUser = await getAuthenticatedUser(request);
    console.log('🔧 Debug Auth: Hybrid user:', hybridUser ? 'EXISTS' : 'NULL');

    // 4. Test tenant headers
    const tenantId = getTenantIdFromHeaders(request);
    console.log('🔧 Debug Auth: Tenant ID from headers:', tenantId);

    // 5. Check cookies
    const cookies = request.cookies.getAll();
    console.log('🔧 Debug Auth: Cookies count:', cookies.length);

    // 6. Check headers
    const authHeader = request.headers.get('authorization');
    const host = request.headers.get('host');
    console.log('🔧 Debug Auth: Auth header:', authHeader ? 'EXISTS' : 'NULL');
    console.log('🔧 Debug Auth: Host:', host);

    return NextResponse.json({
      debug: {
        nextAuth: {
          hasSession: !!nextAuthSession,
          user: nextAuthSession?.user
            ? {
                email: nextAuthSession.user.email,
                role: (nextAuthSession.user as any).role,
              }
            : null,
        },
        supabase: {
          hasSession: !!supabaseSession,
          error: supabaseError?.message || null,
          user: supabaseSession?.user
            ? {
                email: supabaseSession.user.email,
                role:
                  supabaseSession.user.app_metadata?.role ||
                  supabaseSession.user.user_metadata?.role,
              }
            : null,
        },
        hybrid: {
          hasUser: !!hybridUser,
          user: hybridUser
            ? {
                email: hybridUser.email,
                role: hybridUser.role,
                tenantId: hybridUser.tenantId,
              }
            : null,
        },
        request: {
          tenantId: tenantId,
          host: host,
          hasAuthHeader: !!authHeader,
          cookieCount: cookies.length,
          cookies: cookies.map((c) => ({ name: c.name, hasValue: !!c.value })),
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('🔧 Debug Auth: Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
