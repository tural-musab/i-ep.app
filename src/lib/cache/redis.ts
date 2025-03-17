import { Redis } from '@upstash/redis';

// Upstash Redis bağlantısı
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || '',
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
    const cachedData = await redis.get<T>(cacheKey);
    return cachedData;
  } catch (error) {
    console.error('Önbellekten veri alınırken hata oluştu:', error);
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
    await redis.set(cacheKey, value, { ex: expirySeconds });
  } catch (error) {
    console.error('Önbelleğe veri kaydedilirken hata oluştu:', error);
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
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Önbellek temizlenirken hata oluştu:', error);
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
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`${tenantId} için önbellek temizlenirken hata oluştu:`, error);
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
    };

    return descriptor;
  };
} 