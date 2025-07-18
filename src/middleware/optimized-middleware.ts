import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

/**
 * Optimized Middleware for İ-EP.APP
 * Performance-focused implementation
 * Sprint 2 PF-001: Middleware Performance Optimization
 */

// Cache for tenant resolution (in-memory cache for better performance)
const tenantCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Optimized tenant resolution with caching
async function resolveTenantOptimized(hostname: string) {
  const cacheKey = `tenant_${hostname}`;
  const cached = tenantCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Import tenant resolver only when needed
  const { resolveTenantFromDomain } = await import('../lib/tenant/tenant-domain-resolver');
  const tenantInfo = await resolveTenantFromDomain(hostname);

  // Cache the result
  tenantCache.set(cacheKey, {
    data: tenantInfo,
    timestamp: Date.now(),
  });

  return tenantInfo;
}

// Pre-compiled protected paths for faster lookup
const PROTECTED_PATHS = new Set([
  '/dashboard',
  '/admin',
  '/super-admin',
  '/profile',
  '/settings',
  '/api/admin',
  '/api/super-admin',
]);

// Optimized path checking
function isProtectedPath(pathname: string): boolean {
  return (
    PROTECTED_PATHS.has(pathname) ||
    pathname.startsWith('/dashboard/') ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/super-admin/') ||
    pathname.startsWith('/api/admin/') ||
    pathname.startsWith('/api/super-admin/')
  );
}

// Main middleware function - optimized
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get('host') || '';

  // Early return for static assets and public paths
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logo.') ||
    pathname.startsWith('/auth/')
  ) {
    return NextResponse.next();
  }

  // Rate limiting - simplified check
  const rateLimitCheck = await checkRateLimit(request);
  if (rateLimitCheck) {
    return rateLimitCheck;
  }

  const response = NextResponse.next();

  // Parallel operations for better performance
  const [tenantInfo, session] = await Promise.all([
    resolveTenantOptimized(hostname),
    getOptimizedSession(request),
  ]);

  // Set essential headers only
  response.headers.set('x-tenant-id', tenantInfo.id);
  response.headers.set('x-tenant-hostname', hostname);

  // Super-admin path handling
  if (pathname.startsWith('/super-admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/giris', request.url));
    }

    if (session.user.app_metadata?.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/auth/yetkisiz', request.url));
    }

    return response;
  }

  // Protected path handling
  if (isProtectedPath(pathname)) {
    if (!session) {
      const loginUrl = new URL('/auth/giris', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Simplified tenant access check
    const hasAccess =
      session.user.app_metadata?.role === 'super_admin' ||
      session.user.user_metadata?.tenant_id === tenantInfo.id;

    if (!hasAccess) {
      return NextResponse.redirect(new URL('/auth/yetkisiz', request.url));
    }

    // Set auth headers for protected paths only
    response.headers.set('x-auth-user-id', session.user.id);
    response.headers.set('x-auth-user-role', session.user.app_metadata?.role || 'user');
  }

  return response;
}

// Optimized session retrieval with caching
async function getOptimizedSession(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

// Simplified rate limiting
async function checkRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const pathname = request.nextUrl.pathname;

  // Only rate limit API endpoints
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  // Import rate limiter only when needed
  const { rateLimiterMiddleware } = await import('./rateLimiter');
  return rateLimiterMiddleware(request);
}

// Optimized config
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.* (logo files)
     * - manifest.json (PWA manifest)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.|manifest.json).*)',
  ],
};
