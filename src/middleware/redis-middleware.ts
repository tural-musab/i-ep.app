import { redis } from '@/lib/cache/redis';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Redis middleware - uygulama başlatılırken Redis bağlantısını kontrol eder
 * Bu middleware yalnızca ilgili path'lerde çalışır
 */
export async function middleware(request: NextRequest) {
  // Sadece redis health check api'yi hedef alan istekleri işle
  if (request.nextUrl.pathname === '/api/health/redis') {
    try {
      // Redis bağlantısını kontrol et
      await redis.ping();
      console.log('✅ Redis bağlantısı başarılı');
    } catch (error) {
      console.error('❌ Redis bağlantı hatası:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/health/redis'],
}; 