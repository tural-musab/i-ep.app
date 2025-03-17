import { NextRequest, NextResponse } from 'next/server';
import { extractTenantFromSubdomain } from './lib/tenant/tenant-utils';

// Tenant izolasyonu ve doğrulama için middleware
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get('host') || '';
  
  // Localhost kontrolü - geliştirme ortamında yönlendirme yapmayı engelle
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return NextResponse.next();
  }
  
  // Sistem yönetimi ve auth gibi genel pathler için izolasyon kontrolü yok
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images')
  ) {
    return NextResponse.next();
  }
  
  // Ana domain üzerindeki lansman sayfaları için tenant kontrolü yok
  const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-es.app';
  if (hostname === BASE_DOMAIN || hostname === `www.${BASE_DOMAIN}`) {
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
  
  // Subdomainden tenant bilgisini çıkar
  const subdomain = extractTenantFromSubdomain(hostname);
  
  // Eğer subdomain yoksa ve ana domain de değilse (örn. doğrudan IP ile erişim) 
  // ana sayfaya yönlendir
  if (!subdomain) {
    return NextResponse.redirect(new URL(`https://${BASE_DOMAIN}`, request.url));
  }
  
  // Tenant varlık ve erişim kontrolü 
  // (bu kısmı daha gelişmiş tenant doğrulama ile değiştirebilirsiniz)
  
  // Tenant okumak için header'a tenant bilgisi ekle
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', subdomain);
  response.headers.set('x-tenant-hostname', hostname);
  
  return response;
}

// Middleware hangi pathler için çalışacak
export const config = {
  matcher: [
    // Sistem dosyalarını hariç tut
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 