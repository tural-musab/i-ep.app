import * as Sentry from '@sentry/nextjs';

/**
 * Hata bilgisini yapılandırılmış şekilde Sentry'ye raporlar
 *
 * @param error - Raporlanacak hata
 * @param context - Hata ile ilgili ek bilgiler
 * @param tags - Filtreleme ve gruplandırma için etiketler
 * @param level - Hata seviyesi (fatal, error, warning, info, debug)
 */
export function reportError(
  error: unknown,
  context: Record<string, unknown> = {},
  tags: Record<string, string> = {},
  level: Sentry.SeverityLevel = 'error'
): void {
  // Tenant ID ekleme (kullanılabilirse)
  if (typeof window !== 'undefined') {
    const tenantId = localStorage.getItem('currentTenantId');
    if (tenantId) {
      tags.tenant_id = tenantId;
    }
  }

  if (error instanceof Error) {
    // Mevcut kullanıcı bilgisini ayarla (varsa)
    if (context.userId) {
      Sentry.setUser({ id: String(context.userId) });
    }

    // Etiketleri ayarla
    Object.keys(tags).forEach((tagKey) => {
      Sentry.setTag(tagKey, tags[tagKey]);
    });

    // Ek bağlam verilerini ekle
    Sentry.setContext('additionalData', context);

    // Hatayı raporla
    Sentry.captureException(error, {
      level,
      tags,
      extra: context,
    });
  } else {
    // Error olmayan değerler için
    Sentry.captureMessage(typeof error === 'string' ? error : 'Bilinmeyen hata', {
      level,
      tags,
      extra: { ...context, originalError: error },
    });
  }
}

/**
 * API isteği sırasında oluşan hataları raporlamak için özel fonksiyon
 */
export function reportApiError(
  error: unknown,
  apiInfo: {
    endpoint: string;
    method: string;
    statusCode?: number;
    requestData?: unknown;
  },
  userId?: string
): void {
  reportError(
    error,
    {
      userId,
      api: apiInfo.endpoint,
      method: apiInfo.method,
      statusCode: apiInfo.statusCode,
      requestData: apiInfo.requestData,
    },
    {
      error_type: 'api_error',
      endpoint: apiInfo.endpoint,
    }
  );
}

/**
 * Kullanıcı etkileşimi sırasında oluşan hataları raporlamak için özel fonksiyon
 */
export function reportUIError(
  error: unknown,
  uiInfo: {
    component: string;
    action: string;
    additionalData?: unknown;
  },
  userId?: string
): void {
  reportError(
    error,
    {
      userId,
      component: uiInfo.component,
      action: uiInfo.action,
      additionalData: uiInfo.additionalData,
    },
    {
      error_type: 'ui_error',
      component: uiInfo.component,
    }
  );
}

/**
 * Performans izleme için işlem başlatma
 *
 * Not: Bu fonksiyon Sentry.startTransaction API'si güncellendiği için şu anda aktif olarak kullanılmıyor.
 * Gerekirse Sentry'nin güncel API'sine göre uyarlanabilir.
 */
export function startPerformanceTracking(
  name: string,
  op: string,
  data?: Record<string, unknown>
): { name: string; op: string; data?: Record<string, unknown>; finish: () => void } | undefined {
  try {
    // Sentry API değişikliği nedeniyle fonksiyon şu anda bir mock döndürüyor
    // Gerçek implementasyon için güncel Sentry dökümanlarına bakınız
    console.log(`Performance tracking başlatıldı: ${name} (${op})`);

    // Basit bir mock transaction nesnesi
    return {
      name,
      op,
      data,
      finish: () => console.log(`Performance tracking tamamlandı: ${name}`),
    };
  } catch (e) {
    console.error('Performans izleme başlatılamadı:', e);
    return undefined;
  }
}

/**
 * Redis ile ilgili hataları raporlamak için özel fonksiyon
 */
export function reportRedisError(
  error: unknown,
  operation: string,
  key?: string,
  tenantId?: string
): void {
  reportError(
    error,
    {
      operation,
      key,
      tenantId,
    },
    {
      error_type: 'redis_error',
      operation,
    }
  );
}

/**
 * Temant ile ilgili hataları raporlamak için özel fonksiyon
 */
export function reportTenantError(
  error: unknown,
  tenantId: string,
  operation: string,
  additionalData?: unknown
): void {
  reportError(
    error,
    {
      tenantId,
      operation,
      additionalData,
    },
    {
      error_type: 'tenant_error',
      tenant_id: tenantId,
      operation,
    }
  );
}
