import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantFromDomain, TenantInfo } from './lib/tenant/tenant-domain-resolver';

/**
 * Tenant izolasyonu ve yönlendirme middleware
 * Referans: docs/architecture/multi-tenant-strategy.md, URL Tabanlı Tenant Ayrımı
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get('host') || '';
  
  // Localhost kontrolü - geliştirme ortamında sadece header'ları ayarla
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return addTenantHeadersInDevelopment(request);
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
  const tenantInfo = await resolveTenantFromDomain(hostname);
  
  // Tenant bulunamadı veya aktif değil
  if (!tenantInfo) {
    console.warn(`Tenant bulunamadı veya aktif değil: ${hostname}`);
    return NextResponse.redirect(new URL(`https://${BASE_DOMAIN}`, request.url));
  }
  
  // Tenant okumak için header'a tenant bilgisi ekle
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenantInfo.id);
  response.headers.set('x-tenant-hostname', hostname);
  response.headers.set('x-tenant-name', tenantInfo.name || '');
  response.headers.set('x-tenant-primary', String(tenantInfo.isPrimary));
  response.headers.set('x-tenant-custom-domain', String(tenantInfo.isCustomDomain));
  
  return response;
}

/**
 * Geliştirme ortamında tenant bilgilerini headerlarla ekler
 */
function addTenantHeadersInDevelopment(request: NextRequest): NextResponse {
  // Localhost'ta URL üzerinden tenant parametresini okuyabiliriz
  const searchParams = request.nextUrl.searchParams;
  const tenantParam = searchParams.get('tenant');
  
  const response = NextResponse.next();
  
  if (tenantParam) {
    response.headers.set('x-tenant-id', tenantParam);
    response.headers.set('x-tenant-hostname', `${tenantParam}.localhost`);
    response.headers.set('x-tenant-name', `Development Tenant (${tenantParam})`);
    response.headers.set('x-tenant-primary', 'true');
    response.headers.set('x-tenant-custom-domain', 'false');
  } else {
    // Varsayılan test tenant'ı
    response.headers.set('x-tenant-id', 'test-tenant');
    response.headers.set('x-tenant-hostname', 'test-tenant.localhost');
    response.headers.set('x-tenant-name', 'Test Tenant');
    response.headers.set('x-tenant-primary', 'true');
    response.headers.set('x-tenant-custom-domain', 'false');
  }
  
  return response;
}

/**
 * Public path kontrolü
 */
function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images')
  );
}

/**
 * Domain'in ana domain olup olmadığını kontrol eder
 */
function isBaseDomain(hostname: string, baseDomain: string): boolean {
  return hostname === baseDomain || hostname === `www.${baseDomain}`;
}

/**
 * Ana domain isteklerini yönetir
 */
function handleBaseDomainRequest(request: NextRequest, pathname: string): NextResponse {
  // Ana domain'de sadece lansman sayfalarına ve auth sayfalarına erişim izni
  if (
    pathname === '/' ||
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
    // Sistem dosyalarını hariç tut
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 