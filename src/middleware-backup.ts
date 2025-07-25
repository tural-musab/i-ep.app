import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { resolveTenantFromDomain } from './lib/tenant/tenant-domain-resolver';
import { withSecurityHeaders } from './lib/security/headers';

// Performance optimization: Tenant cache
const tenantCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Optimized tenant resolution with caching
async function resolveTenantOptimized(hostname: string) {
  const cacheKey = `tenant_${hostname}`;
  const cached = tenantCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { data: cached.data, fromCache: true };
  }

  const tenantInfo = await resolveTenantFromDomain(hostname);

  // Cache the result
  tenantCache.set(cacheKey, {
    data: tenantInfo,
    timestamp: Date.now(),
  });

  return { data: tenantInfo, fromCache: false };
}

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
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get('host') || '';

  console.log('🔧 Middleware: Processing request', pathname, 'hostname:', hostname);

  // Early return for static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logo.') ||
    pathname.startsWith('/auth/')
  ) {
    console.log('🔧 Middleware: Early return for static/auth path:', pathname);
    return NextResponse.next();
  }

  // Localhost kontrolü - geliştirme ortamı için basit response
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    console.log('🔧 Middleware: localhost detected, hostname:', hostname);
    return addTenantHeadersInDevelopment(request);
  }

  // Create supabase client for auth
  const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() });

  // Parallel operations for better performance
  const [tenantInfo, session] = await Promise.all([
    resolveTenantOptimized(hostname),
    supabase.auth.getSession().then(({ data: { session } }) => session),
  ]);

  let finalResponse = NextResponse.next();

  // Apply security headers
  finalResponse = withSecurityHeaders()(request);

  // Set essential headers only
  if (tenantInfo.data?.id) {
    finalResponse.headers.set('x-tenant-id', tenantInfo.data.id);
  }

  // Super-admin sayfaları için özel kontrol
  if (pathname.startsWith('/super-admin')) {
    if (!session) {
      const loginUrl = new URL('/auth/giris', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const isSuperAdmin = session.user.app_metadata?.role === 'super_admin';
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL('/auth/yetkisiz', request.url));
    }

    return NextResponse.next();
  }

  // Sistem yönetimi ve auth gibi genel pathler için izolasyon kontrolü yok
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Ana domain (ve www subdomain) üzerindeki lansman sayfaları için tenant kontrolü yok
  const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app';
  if (isBaseDomain(hostname, BASE_DOMAIN)) {
    return handleBaseDomainRequest(request, pathname);
  }

  // Domain bilgisinden tenant ID'sini tespit et
  const currentTenant = await resolveTenantFromDomain(hostname);

  // Tenant bulunamadı veya aktif değil
  if (!currentTenant) {
    return NextResponse.redirect(new URL(`https://${BASE_DOMAIN}`, request.url));
  }

  // Tenant okumak için header'a tenant bilgisi ekle
  finalResponse.headers.set('x-tenant-id', currentTenant.id);
  finalResponse.headers.set('x-tenant-hostname', hostname);
  finalResponse.headers.set('x-tenant-name', currentTenant.name || '');

  // Auth headerlarını ekle
  if (session) {
    finalResponse.headers.set('x-auth-user-id', session.user.id);
    finalResponse.headers.set('x-auth-user-email', session.user.email || '');
    finalResponse.headers.set('x-auth-user-role', session.user.app_metadata?.role || 'user');

    // Kullanıcının erişebileceği tenant'lar
    const allowedTenants = session.user.user_metadata?.allowed_tenants || '[]';
    finalResponse.headers.set(
      'x-auth-allowed-tenants',
      typeof allowedTenants === 'string' ? allowedTenants : JSON.stringify(allowedTenants)
    );

    // Tenant erişim kontrolü
    const isSuperAdmin = session.user.app_metadata?.role === 'super_admin';
    const allowedTenantsArray =
      typeof allowedTenants === 'string'
        ? JSON.parse(allowedTenants)
        : allowedTenants;

    // Kurum yöneticisi veya süper admin olmayan kullanıcılar için tenant kontrolü
    if (!isSuperAdmin && !allowedTenantsArray.includes(currentTenant.id)) {
      return NextResponse.redirect(new URL('/auth/yetkisiz', request.url));
    }
  }

  // Korumalı sayfalarda auth kontrolü
  if (isProtectedPath(pathname) && !session) {
    const loginUrl = new URL('/auth/giris', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  console.log(
    '🔧 Middleware: Successfully processed',
    pathname,
    tenantInfo.fromCache ? '(cached)' : '(fresh)',
    session ? 'authenticated' : 'anonymous'
  );

  return finalResponse;
}

// Helper functions
function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    '/',
    '/auth',
    '/api/health',
    '/api/ready',
    '/docs',
    '/privacy',
    '/terms',
    '/api-docs',
    '/sentry-example-page',
    '/developer',
    '/gdpr',
  ];

  return (
    publicPaths.includes(pathname) ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/docs/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/static/')
  );
}

function isBaseDomain(hostname: string, baseDomain: string): boolean {
  return hostname === baseDomain || hostname === `www.${baseDomain}`;
}

function handleBaseDomainRequest(request: NextRequest, pathname: string) {
  const publicPaths = ['/', '/auth', '/docs', '/api-docs', '/pricing', '/features', '/privacy', '/terms'];

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Diğer tüm istekler ana sayfa veya genel 404'e yönlendirilir
  return NextResponse.redirect(new URL('/', request.url));
}

function addTenantHeadersInDevelopment(request: NextRequest) {
  const response = NextResponse.next();

  // Development ortamında sabit tenant ID kullan
  response.headers.set('x-tenant-id', 'localhost-tenant-dev');
  response.headers.set('x-tenant-hostname', 'localhost:3000');
  response.headers.set('x-tenant-name', 'Development Tenant');
  response.headers.set('x-environment', 'development');

  console.log('🔧 Development headers added for localhost');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/((?!auth).*)', // API routes hariç auth
  ],
};