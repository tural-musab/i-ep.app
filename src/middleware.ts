import { NextRequest, NextResponse } from 'next/server';
import { applyJWTHeadersToResponse, resolveJWTTenantAuth } from './lib/auth/jwt-tenant-resolver';
import { withSecurityHeaders } from './lib/security/headers';
import {
  apiRateLimit,
  applyRateLimitHeaders,
  authRateLimit,
  ipRateLimit,
} from './lib/security/rate-limiter';

// Pre-compiled protected paths for faster lookup
const PROTECTED_PATHS = new Set(['/dashboard', '/admin', '/super-admin', '/profile', '/settings']);

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

/**
 * Enhanced security middleware with comprehensive protection
 * Referans: docs/architecture/multi-tenant-strategy.md, URL Tabanlı Tenant Ayrımı
 */
export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    const hostname = request.headers.get('host') || '';

    console.log('🔧 Middleware: Processing request', pathname, 'hostname:', hostname);

    // Early return for static assets
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/static/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/logo.')
    ) {
      console.log('🔧 Middleware: Early return for static path:', pathname);
      return NextResponse.next();
    }

    // IP-based rate limiting for DDoS protection
    const ipLimit = await ipRateLimit(request);
    if (!ipLimit.allowed) {
      const response = new NextResponse('Too Many Requests', { status: 429 });
      applyRateLimitHeaders(response.headers, ipLimit);
      return response;
    }

    // Authentication endpoint rate limiting
    if (pathname.startsWith('/api/auth/')) {
      let endpoint: 'login' | 'register' | 'passwordReset' | 'mfa' = 'login';

      if (pathname.includes('/register') || pathname.includes('/kayit')) {
        endpoint = 'register';
      } else if (pathname.includes('/reset') || pathname.includes('/sifremi-unuttum')) {
        endpoint = 'passwordReset';
      } else if (pathname.includes('/mfa') || pathname.includes('/two-factor')) {
        endpoint = 'mfa';
      }

      const authLimit = await authRateLimit(request, endpoint);
      if (!authLimit.allowed) {
        const response = new NextResponse(
          JSON.stringify({
            error: 'Too many authentication attempts. Please try again later.',
            retryAfter: authLimit.retryAfter,
          }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          }
        );
        applyRateLimitHeaders(response.headers, authLimit);
        return response;
      }
    }

    // API endpoint rate limiting
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
      let category: 'default' | 'upload' | 'sensitive' = 'default';

      if (pathname.includes('/upload') || pathname.includes('/file')) {
        category = 'upload';
      } else if (
        pathname.includes('/admin') ||
        pathname.includes('/delete') ||
        pathname.includes('/update')
      ) {
        category = 'sensitive';
      }

      const apiLimit = await apiRateLimit(request, category);
      if (!apiLimit.allowed) {
        const response = new NextResponse(
          JSON.stringify({
            error: 'API rate limit exceeded. Please slow down your requests.',
            retryAfter: apiLimit.retryAfter,
          }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          }
        );
        applyRateLimitHeaders(response.headers, apiLimit);
        return response;
      }
    }

    // Use JWT-based tenant and auth resolution
    const fallbackTenantId =
      hostname.includes('localhost') || hostname.includes('127.0.0.1')
        ? 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        : undefined;

    const { tenant, auth } = await resolveJWTTenantAuth(request, fallbackTenantId);

    let response = NextResponse.next();

    // Apply security headers
    response = withSecurityHeaders()(request);

    // Apply tenant and auth headers using safe header writing
    response = applyJWTHeadersToResponse(response, tenant, auth);

    // Super-admin pages access control
    if (pathname.startsWith('/super-admin')) {
      if (!auth || !auth.userId) {
        const loginUrl = new URL('/auth/giris', request.url);
        loginUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(loginUrl);
      }

      const isSuperAdmin = auth.role === 'super_admin';
      if (!isSuperAdmin) {
        return NextResponse.redirect(new URL('/auth/yetkisiz', request.url));
      }

      return response;
    }

    // Public path handling
    if (isPublicPath(pathname)) {
      return response;
    }

    // Base domain handling
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://i-ep.app';
    const BASE_DOMAIN = new URL(BASE_URL).hostname;
    if (isBaseDomain(hostname, BASE_DOMAIN)) {
      return handleBaseDomainRequest(request, pathname);
    }

    // Tenant access control
    if ((!tenant || !tenant.isActive) && process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(new URL(`https://${BASE_DOMAIN}`, request.url));
    }

    // Protected path access control
    if (isProtectedPath(pathname)) {
      if (!auth || !auth.userId) {
        const loginUrl = new URL('/auth/giris', request.url);
        loginUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Check tenant access permissions
      const isSuperAdmin = auth.role === 'super_admin';
      const canAccessTenant =
        isSuperAdmin ||
        (tenant && (auth.tenantId === tenant.id || auth.allowedTenants.includes(tenant.id)));

      if (!canAccessTenant) {
        return NextResponse.redirect(new URL('/auth/yetkisiz', request.url));
      }
    }

    // Apply CORS headers
    const corsHeaders = getCorsHeaders(hostname);
    if (corsHeaders) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  } catch (error) {
    console.error('🚨 Middleware Error:', error);
    console.error('🚨 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      pathname: request.nextUrl.pathname,
      hostname: request.headers.get('host'),
    });

    // In case of middleware error, allow request to continue
    // This prevents 500 MIDDLEWARE_INVOCATION_FAILED
    return NextResponse.next();
  }
}

/**
 * Get CORS headers for multi-domain support
 */
function getCorsHeaders(hostname: string): Record<string, string> {
  // Extract domain from BASE_URL for CORS configuration
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://i-ep.app';
  const baseDomain = new URL(BASE_URL).hostname;

  // Development mode: More restrictive CORS even in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  // Allowed origins for CORS (production and development)
  const allowedOrigins = [
    `https://${baseDomain}`,
    `https://demo.${baseDomain}`,
    `https://staging.${baseDomain}`,
    `https://demo-staging.${baseDomain}`,
    // Development localhost support for both HTTP and HTTPS
    ...(process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
          'https://localhost:3000',
          'http://127.0.0.1:3000',
          'https://127.0.0.1:3000',
          'http://localhost:3001',
          'https://localhost:3001',
        ]
      : []),
  ];

  // Check multiple origin formats for localhost
  const possibleOrigins = [
    `https://${hostname}`,
    `http://${hostname}`,
    hostname.includes('localhost') ? `http://${hostname}` : null,
    hostname.includes('localhost') ? `https://${hostname}` : null,
  ].filter(Boolean);

  const matchedOrigin = possibleOrigins.find((origin) => allowedOrigins.includes(origin!));

  // Only allow specific origins, no wildcards
  if (matchedOrigin) {
    return {
      'Access-Control-Allow-Origin': matchedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, x-tenant-id, x-auth-user, x-auth-tenant',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
      'Access-Control-Expose-Headers':
        'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
    };
  }

  // For subdomains of the base domain in production
  if (!isDevelopment && hostname.endsWith(`.${baseDomain}`)) {
    return {
      'Access-Control-Allow-Origin': `https://${hostname}`,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, x-tenant-id, x-auth-user, x-auth-tenant',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Expose-Headers':
        'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
    };
  }

  return {};
}

/**
 * Public path kontrolü
 */
function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/super-admin') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/logo.webp') ||
    pathname.startsWith('/logo.optimized.svg') ||
    pathname === '/auth/giris' ||
    pathname === '/auth/sifremi-unuttum' ||
    pathname === '/auth/sifre-yenile' ||
    pathname === '/auth/yetkisiz'
  );
}

/**
 * Domain'in ana domain olup olmadığını kontrol eder
 */
function isBaseDomain(hostname: string, baseDomain: string): boolean {
  return (
    hostname === baseDomain ||
    hostname === `www.${baseDomain}` ||
    hostname === `staging.${baseDomain}` ||
    hostname === `test.${baseDomain}` ||
    hostname === `dev.${baseDomain}`
  );
}

/**
 * Ana domain isteklerini yönetir
 */
function handleBaseDomainRequest(request: NextRequest, pathname: string): NextResponse {
  // Ana domain'de sadece lansman sayfalarına ve auth sayfalarına erişim izni
  if (
    pathname === '/' ||
    pathname === '/onboarding' ||
    pathname.startsWith('/onboarding/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/hakkimizda') ||
    pathname.startsWith('/iletisim') ||
    pathname.startsWith('/plan')
  ) {
    return NextResponse.next();
  }

  // Ana domaine gelen tenant-specific istekler ana sayfaya yönlendirilir
  return NextResponse.redirect(new URL('/', request.url));
}

// Middleware hangi pathler için çalışacak
export const config = {
  matcher: [
    // Tüm routes'ları dahil et, sadece gerçekten gerekli olanları hariç tut
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
    // API routes'ları özellikle dahil et
    '/api/(.*)',
  ],
};
