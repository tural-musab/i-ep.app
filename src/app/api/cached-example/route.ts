import { getCachedValue, setCachedValue } from '@/lib/cache/redis';
import { NextRequest, NextResponse } from 'next/server';

// Cached example data type
interface CachedExampleData {
  message: string;
  timestamp: string;
  randomValue: string;
}

/**
 * GET /api/cached-example
 *
 * Redis önbelleğinin kullanımını gösteren örnek API endpoint
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key') || 'example-key';
  // Demo amaçlı test tenant ID'si
  const tenantId = searchParams.get('tenant') || 'test-tenant';

  try {
    // Önbellekte değer var mı kontrol et
    let value = await getCachedValue<CachedExampleData>(tenantId, key);
    let fromCache = true;

    // Eğer değer yoksa, oluştur ve önbelleğe kaydet
    if (!value) {
      fromCache = false;
      value = {
        message: 'Bu bir örnek önbellek değeridir',
        timestamp: new Date().toISOString(),
        randomValue: Math.random().toString(36).substring(2, 15),
      };

      // 30 saniye TTL ile önbelleğe kaydet
      await setCachedValue(tenantId, key, value, 30);
    }

    return NextResponse.json({
      data: value,
      meta: {
        fromCache,
        key,
        tenantId,
        cacheKey: `tenant:${tenantId}:${key}`,
        message: fromCache
          ? '🚀 Değer önbellekten alındı'
          : '⚡ Değer yeni oluşturuldu ve önbelleğe kaydedildi (30 sn TTL)',
      },
    });
  } catch (error) {
    console.error('Önbellek hatası:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Önbellek işlemi başarısız oldu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}
