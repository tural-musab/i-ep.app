import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { resolveTenantFromDomain, TenantInfo } from './lib/tenant/tenant-domain-resolver';
import { logAccessDenied } from './lib/audit';
import { createRequestLogger } from './middleware/logger';

/**
 * Tenant izolasyonu ve yönlendirme middleware
 * Referans: docs/architecture/multi-tenant-strategy.md, URL Tabanlı Tenant Ayrımı
 */
export async function middleware(request: NextRequest) {
  // Request logging başlat
  const requestLogger = createRequestLogger(request);
  
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get('host') || '';
  
  // Supabase auth middleware client oluştur
  const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() });
  
  // Mevcut oturumu al
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Auth durumunu headerda tut
  const response = NextResponse.next();
  
  // Super-admin sayfaları için özel kontrol
  if (pathname.startsWith('/super-admin')) {
    if (!session) {
      // Oturum yoksa giriş sayfasına yönlendir
      const loginUrl = new URL('/auth/giris', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      const response = NextResponse.redirect(loginUrl);
      requestLogger.finish(response);
      return response;
    }
    
    // Kullanıcı super_admin rolünde mi kontrol et
    const isSuperAdmin = session.user.app_metadata?.role === 'super_admin';
    if (!isSuperAdmin) {
      console.warn(`Super admin erişim yetkisi yok: ${session.user.email}`);
      const response = NextResponse.redirect(new URL('/auth/yetkisiz', request.url));
      requestLogger.finish(response);
      return response;
    }
    
    // Super admin erişimi onaylandı, devam et
    return NextResponse.next();
  }
  
  // Localhost kontrolü - geliştirme ortamında sadece header'ları ayarla
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const devResponse = await addTenantHeadersInDevelopment(request);
    
    // Geliştirme ortamında Auth headerlarını kopyala
    if (session) {
      devResponse.headers.set('x-auth-user-id', session.user.id);
      devResponse.headers.set('x-auth-user-email', session.user.email || '');
      devResponse.headers.set('x-auth-user-role', session.user.app_metadata?.role || 'user');
      
      // Kullanıcının erişebileceği tenant'lar
      const allowedTenants = session.user.user_metadata?.allowed_tenants || '[]';
      devResponse.headers.set('x-auth-allowed-tenants', typeof allowedTenants === 'string' ? allowedTenants : JSON.stringify(allowedTenants));
    }
    
    return devResponse;
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
  response.headers.set('x-tenant-id', tenantInfo.id);
  response.headers.set('x-tenant-hostname', hostname);
  response.headers.set('x-tenant-name', tenantInfo.name || '');
  response.headers.set('x-tenant-primary', String(tenantInfo.isPrimary));
  response.headers.set('x-tenant-custom-domain', String(tenantInfo.isCustomDomain));
  
  // Auth headerlarını ekle
  if (session) {
    response.headers.set('x-auth-user-id', session.user.id);
    response.headers.set('x-auth-user-email', session.user.email || '');
    response.headers.set('x-auth-user-role', session.user.app_metadata?.role || 'user');
    
    // Kullanıcının erişebileceği tenant'lar
    const allowedTenants = session.user.user_metadata?.allowed_tenants || '[]';
    response.headers.set('x-auth-allowed-tenants', typeof allowedTenants === 'string' ? allowedTenants : JSON.stringify(allowedTenants));
    
    // Tenant erişim kontrolü
    const isSuperAdmin = session.user.app_metadata?.role === 'super_admin';
    const allowedTenantsArray = typeof allowedTenants === 'string' 
      ? JSON.parse(allowedTenants) 
      : (Array.isArray(allowedTenants) ? allowedTenants : []);
    
    // Super admin'ler tüm tenant'lara erişebilir
    // Normal kullanıcılar sadece izin verilen tenant'lara erişebilir
    const canAccessTenant = isSuperAdmin || 
      session.user.user_metadata?.tenant_id === tenantInfo.id ||
      allowedTenantsArray.includes(tenantInfo.id);
    
    // Kullanıcının bu tenant'a erişim yetkisi yoksa ve koruma altındaki bir sayfaya erişmeye çalışıyorsa
    if (!canAccessTenant && isProtectedPath(pathname)) {
      console.warn(`Kullanıcının tenant erişim yetkisi yok: ${session.user.email} -> ${tenantInfo.id}`);
      
      // Erişim reddedildi logunu kaydet
      try {
        await logAccessDenied(
          session.user.id,
          tenantInfo.id,
          'public',
          'tenant_access',
          'GET',
          'tenant_access_denied',
          {
            path: pathname,
            email: session.user.email,
            requested_tenant: tenantInfo.id,
            allowed_tenants: allowedTenantsArray,
            user_tenant: session.user.user_metadata?.tenant_id,
            role: session.user.app_metadata?.role || 'user',
            ip: request.headers.get('x-forwarded-for') || 'unknown'
          }
        ).catch(e => console.error('Middleware erişim reddi log hatası:', e));
      } catch (error) {
        console.error('Erişim reddi log hatası:', error);
      }
      
      return NextResponse.redirect(new URL('/auth/yetkisiz', request.url));
    }
    
    // Tenant bilgisini kullanıcı metadatasına ekle/güncelle
    const updateUserMetadata = async () => {
      // Son erişilen tenant'ları tut (maksimum 5)
      let lastAccessedTenants = session.user.user_metadata?.last_accessed_tenants || [];
      if (typeof lastAccessedTenants === 'string') {
        try {
          lastAccessedTenants = JSON.parse(lastAccessedTenants);
        } catch (e) {
          lastAccessedTenants = [];
        }
      }
      
      if (!Array.isArray(lastAccessedTenants)) {
        lastAccessedTenants = [];
      }
      
      // Şu anki tenant'ı listeye ekle (eğer zaten yoksa)
      if (!lastAccessedTenants.includes(tenantInfo.id)) {
        lastAccessedTenants.unshift(tenantInfo.id);
        // Maksimum 5 tenant tut
        if (lastAccessedTenants.length > 5) {
          lastAccessedTenants = lastAccessedTenants.slice(0, 5);
        }
      } else {
        // Zaten listede varsa, en başa taşı
        lastAccessedTenants = [
          tenantInfo.id,
          ...lastAccessedTenants.filter((id: string) => id !== tenantInfo.id)
        ];
      }
      
      // Kullanıcı metadatasını güncelle
      await supabase.auth.updateUser({
        data: { 
          tenant_id: tenantInfo.id,
          tenant_name: tenantInfo.name,
          last_tenant_access: new Date().toISOString(),
          last_accessed_tenants: lastAccessedTenants
        }
      });
    };
    
    // Tenant değişmişse, kullanıcı metadatasını güncelle
    if (canAccessTenant && (!session.user.user_metadata?.tenant_id || session.user.user_metadata?.tenant_id !== tenantInfo.id)) {
      updateUserMetadata().catch(err => {
        console.error('Kullanıcı metadata güncelleme hatası:', err);
      });
    }
  } else if (isProtectedPath(pathname)) {
    // Oturum yoksa ve korumalı bir sayfaya erişmeye çalışıyorsa, giriş sayfasına yönlendir
    try {
      await logAccessDenied(
        'anonymous',
        tenantInfo?.id || 'unknown',
        'public',
        'tenant_access',
        'GET',
        'unauthenticated_access',
        {
          path: pathname,
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        }
      ).catch(e => console.error('Middleware erişim reddi log hatası:', e));
    } catch (error) {
      console.error('Anonim erişim reddi log hatası:', error);
    }
    
    const loginUrl = new URL('/auth/giris', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
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
    pathname.startsWith('/api/super-admin') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname === '/auth/giris' ||
    pathname === '/auth/sifremi-unuttum' ||
    pathname === '/auth/sifre-yenile' ||
    pathname === '/auth/yetkisiz'
  );
}

/**
 * Korumalı path kontrolü
 */
function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/profil') ||
    pathname.startsWith('/ogrenci') ||
    pathname.startsWith('/ogretmen') ||
    pathname.startsWith('/rapor') ||
    pathname.startsWith('/ayarlar')
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