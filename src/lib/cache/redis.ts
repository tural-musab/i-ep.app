import { createClient, RedisClientType } from 'redis';
import { reportRedisError } from '@/utils/error-reporting';

// Redis Cloud bağlantısı
export const redis: RedisClientType = createClient({
  url: process.env.UPSTASH_REDIS_URL || '',
});

// Redis bağlantısını otomatik olarak aç
redis.connect().catch((err: Error) => {
  console.error('Redis bağlantısı hatası:', err);
  reportRedisError(err, 'connect');
});

/**
 * Önbellek anahtarı oluştur (tenant izolasyonu sağlar)
 */
export function createCacheKey(tenantId: string, key: string): string {
  return `tenant:${tenantId}:${key}`;
}

/**
 * Değeri önbellekten al
 */
export async function getCachedValue<T>(
  tenantId: string,
  key: string
): Promise<T | null> {
  try {
    const cacheKey = createCacheKey(tenantId, key);
    const cachedData = await redis.get(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Önbellekten veri alınırken hata oluştu:', error);
    reportRedisError(error, 'get', key, tenantId);
    return null;
  }
}

/**
 * Değeri önbelleğe kaydet
 */
export async function setCachedValue<T>(
  tenantId: string,
  key: string,
  value: T,
  expirySeconds = 3600 // 1 saat
): Promise<void> {
  try {
    const cacheKey = createCacheKey(tenantId, key);
    await redis.set(cacheKey, JSON.stringify(value), {
      EX: expirySeconds
    });
  } catch (error) {
    console.error('Önbelleğe veri kaydedilirken hata oluştu:', error);
    reportRedisError(error, 'set', key, tenantId);
  }
}

/**
 * Önbellekteki bir değeri sil
 */
export async function deleteCachedValue(
  tenantId: string,
  key: string
): Promise<void> {
  try {
    const cacheKey = createCacheKey(tenantId, key);
    await redis.del(cacheKey);
  } catch (error) {
    console.error('Önbellekteki veri silinirken hata oluştu:', error);
    reportRedisError(error, 'delete', key, tenantId);
  }
}

/**
 * Belirli bir kalıba uyan tüm önbellek anahtarlarını temizle
 */
export async function clearCachePattern(
  tenantId: string,
  pattern: string
): Promise<void> {
  try {
    const cachePattern = createCacheKey(tenantId, pattern);
    const keys = await redis.keys(cachePattern);
    
    if (keys && keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error('Önbellek temizlenirken hata oluştu:', error);
    reportRedisError(error, 'clearPattern', pattern, tenantId);
  }
}

/**
 * Tenant'a ait tüm önbellekleri temizle
 */
export async function clearTenantCache(tenantId: string): Promise<void> {
  try {
    const cachePattern = createCacheKey(tenantId, '*');
    const keys = await redis.keys(cachePattern);
    
    if (keys && keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error(`${tenantId} için önbellek temizlenirken hata oluştu:`, error);
    reportRedisError(error, 'clearTenantCache', '*', tenantId);
  }
}

/**
 * Önbellekleme decorator'ü (sınıf metotları için)
 */
export function Cached(
  expirySeconds: number = 3600,
  keyGenerator?: (tenantId: string, ...args: any[]) => string
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // İlk parametrenin tenantId olduğunu varsayıyoruz
      const tenantId = args[0];
      
      if (!tenantId) {
        return originalMethod.apply(this, args);
      }

      // Önbellek anahtarını oluştur
      const key = keyGenerator
        ? keyGenerator(tenantId, ...args.slice(1))
        : `${propertyKey}:${JSON.stringify(args.slice(1))}`;
      
      try {
        // Önbellekten veriyi almaya çalış
        const cachedValue = await getCachedValue(tenantId, key);
        
        if (cachedValue !== null) {
          return cachedValue;
        }

        // Önbellekte yoksa, metodu çalıştır
        const result = await originalMethod.apply(this, args);
        
        // Sonucu önbelleğe ekle
        if (result !== null && result !== undefined) {
          await setCachedValue(tenantId, key, result, expirySeconds);
        }
        
        return result;
      } catch (error) {
        console.error(`Önbellekleme hatası (${propertyKey}):`, error);
        reportRedisError(error, 'decorator', propertyKey, tenantId);
        // Hata durumunda orijinal metodu çalıştır
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
} 