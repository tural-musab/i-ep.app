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
  try {
    const pathname = request.nextUrl.pathname;
    const hostname = request.headers.get('host') || '';

    console.log('🔧 Middleware: Processing request', pathname, 'hostname:', hostname);

    // PRODUCTION HOTFIX: Complete staging bypass with proper headers
    if (hostname === 'staging.i-ep.app') {
      console.log('🔧 Middleware: Staging environment - applying complete bypass');
      return addTenantHeadersForStaging(request);
    }

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

  // Localhost ve staging kontrolü - geliştirme/test ortamı için basit response
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
  // Extract domain from BASE_URL
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://i-ep.app';
  const BASE_DOMAIN = new URL(BASE_URL).hostname;
  if (isBaseDomain(hostname, BASE_DOMAIN)) {
    return handleBaseDomainRequest(request, pathname);
  }

  // Set CORS headers for multi-domain support
  const corsHeaders = getCorsHeaders(hostname);
  
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
        : Array.isArray(allowedTenants)
          ? allowedTenants
          : [];

    // Super admin'ler tüm tenant'lara erişebilir
    // Normal kullanıcılar sadece izin verilen tenant'lara erişebilir
    const canAccessTenant =
      isSuperAdmin ||
      session.user.user_metadata?.tenant_id === currentTenant.id ||
      allowedTenantsArray.includes(currentTenant.id);

    // Kullanıcının bu tenant'a erişim yetkisi yoksa ve koruma altındaki bir sayfaya erişmeye çalışıyorsa
    if (!canAccessTenant && isProtectedPath(pathname)) {
      return NextResponse.redirect(new URL('/auth/yetkisiz', request.url));
    }
  } else if (isProtectedPath(pathname)) {
    // Oturum yoksa ve korumalı bir sayfaya erişmeye çalışıyorsa, giriş sayfasına yönlendir
    const loginUrl = new URL('/auth/giris', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

    // Apply CORS headers to the final response
    if (corsHeaders) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        finalResponse.headers.set(key, value);
      });
    }
    
    return finalResponse;

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
 * Geliştirme ortamında tenant bilgilerini headerlarla ekler
 */
function addTenantHeadersInDevelopment(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  // Development için demo tenant
  const tenantId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  console.log('🔧 Middleware: Setting tenant headers, tenant-id:', tenantId);

  response.headers.set('x-tenant-id', tenantId); // actual database tenant ID
  response.headers.set('x-tenant-hostname', 'localhost:3000');
  response.headers.set('x-tenant-name', 'Demo İlköğretim Okulu');
  response.headers.set('x-tenant-primary', 'true');
  response.headers.set('x-tenant-custom-domain', 'false');

  return response;
}

/**
 * Staging ortamında tenant bilgilerini headerlarla ekler
 */
function addTenantHeadersForStaging(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  // Staging için demo tenant
  const tenantId = 'staging-tenant-id';
  console.log('🔧 Middleware: Setting staging tenant headers, tenant-id:', tenantId);

  response.headers.set('x-tenant-id', tenantId);
  response.headers.set('x-tenant-hostname', 'staging.i-ep.app');
  response.headers.set('x-tenant-name', 'Staging Demo Okulu');
  response.headers.set('x-tenant-primary', 'true');
  response.headers.set('x-tenant-custom-domain', 'false');

  return response;
}

/**
 * Get CORS headers for multi-domain support
 */
function getCorsHeaders(hostname: string): Record<string, string> {
  // Extract domain from BASE_URL for CORS configuration
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://i-ep.app';
  const baseDomain = new URL(BASE_URL).hostname;
  
  // Allowed origins for CORS
  const allowedOrigins = [
    `https://${baseDomain}`,
    `https://demo.${baseDomain}`,
    `https://staging.${baseDomain}`,
    `https://demo-staging.${baseDomain}`,
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
  ];

  const origin = `https://${hostname}`;
  const isAllowed = allowedOrigins.includes(origin) || 
                   hostname.includes('localhost') ||
                   hostname.endsWith(`.${baseDomain}`);

  if (isAllowed) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-id',
      'Access-Control-Allow-Credentials': 'true',
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
