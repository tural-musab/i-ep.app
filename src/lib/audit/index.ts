/**
 * Audit/Denetim loglama modülü
 * 
 * Bu modül, sistemdeki işlemlerin denetim kayıtlarını yönetir ve
 * erişim reddi loglarına erişim sağlar.
 */

import { logAccessDenied, getAccessDeniedLogs } from '../tenant/tenant-access';

/**
 * Sistem işlemlerini logla (INSERT, UPDATE, DELETE)
 * 
 * Not: Bu işlemler veritabanı seviyesinde otomatik olarak
 * audit.log_activity tetikleyicisi ile yapılmaktadır
 */

// Tenant access modülünden export edilen fonksiyonları yeniden export et
export { logAccessDenied, getAccessDeniedLogs };

/**
 * Özel uygulamaların denetim logu
 * 
 * @param tenantId İlgili tenant ID'si
 * @param userId İşlemi yapan kullanıcı ID'si
 * @param action Yapılan işlem
 * @param entityType İşlem yapılan varlık türü
 * @param entityId İşlem yapılan varlık ID'si 
 * @param metadata Ek bilgiler
 */
export async function logAuditEvent(
  tenantId: string,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  oldData?: Record<string, any>,
  newData?: Record<string, any>,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Erişim reddi loglama fonksiyonunun altyapısını kullan
    await logAccessDenied(
      userId,
      tenantId,
      entityType, // Şema adı yerine entityType kullanıyoruz
      'audit_logs', // Tablo adı sabit
      action,
      'manual_audit_log', // Neden
      {
        old_data: oldData || null,
        new_data: newData || null,
        entity_id: entityId,
        metadata: metadata || {}
      }
    );
  } catch (error) {
    console.error('Audit log kayıt hatası:', error);
  }
} 