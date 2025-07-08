/**
 * Hata İşleme Yardımcıları
 * 
 * Bu modül, hata yakalama, loglama ve istemciye yanıt verme işlemleri için
 * yardımcı fonksiyonlar içerir.
 */

import { NextRequest, NextResponse } from 'next/server';
import { TenantError, TenantNotFoundError, TenantAccessDeniedError } from './tenant-errors';
import logger from '@/lib/logger';

interface ErrorResponseOptions {
  logError?: boolean;
  includeDetails?: boolean;
}

/**
 * API hatasını işle ve uygun NextResponse döndür
 */
export function handleApiError(
  error: unknown, 
  options: ErrorResponseOptions = { logError: true, includeDetails: false }
): NextResponse {
  const { logError, includeDetails } = options;
  
  if (logError) {
    logger.error({ err: error }, 'API hatası');
  }
  
  // TenantError türündeki hataları işle
  if (error instanceof TenantError) {
    const status = getStatusCodeForTenantError(error);
    
    return NextResponse.json(
      {
        error: error.name,
        message: error.message,
        code: error.code,
        ...(includeDetails && { details: (error as any).details })
      },
      { status }
    );
  }
  
  // Genel hatalar
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: 'ServerError',
        message: includeDetails ? error.message : 'Sunucu hatası oluştu',
        ...(includeDetails && { stack: error.stack })
      },
      { status: 500 }
    );
  }
  
  // Bilinmeyen hatalar
  return NextResponse.json(
    { 
      error: 'UnknownError',
      message: 'Bilinmeyen bir hata oluştu'
    },
    { status: 500 }
  );
}

/**
 * Tenant hatası için uygun HTTP durum kodu belirle
 */
function getStatusCodeForTenantError(error: TenantError): number {
  switch (error.constructor) {
    case TenantNotFoundError:
      return 404;
    case TenantAccessDeniedError:
      return 403;
    default:
      return 400;
  }
}

/**
 * API işleyicisi için hata yakalama kapsayıcısı
 */
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: ErrorResponseOptions = {}
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleApiError(error, options);
    }
  };
}

/**
 * Veritabanı işlemlerinde izolasyon kontrol yardımcısı
 */
export function assertTenantOwnership(
  requestTenantId: string, 
  resourceTenantId: string | null | undefined,
  errorMessage = 'Tenant izolasyon kontrolü başarısız oldu'
): void {
  if (!resourceTenantId || resourceTenantId !== requestTenantId) {
    throw new TenantAccessDeniedError(errorMessage);
  }
}

/**
 * Veritabanı sonuçlarında tenant izolasyonu doğrulama
 */
export function validateTenantResults<T extends { tenant_id?: string }>(
  tenantId: string,
  results: T[]
): T[] {
  // Sonuçların her birinin doğru tenant'a ait olduğunu doğrula
  const invalidResults = results.filter(item => 
    item.tenant_id && item.tenant_id !== tenantId
  );
  
  if (invalidResults.length > 0) {
    throw new TenantAccessDeniedError(
      `İzolasyon ihlali: ${invalidResults.length} sonuç farklı tenant'lara ait`
    );
  }
  
  return results;
} 