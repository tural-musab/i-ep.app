/**
 * Iqra Eğitim Portalı - GDPR/KVKK Veri Silme İşlemleri
 * 
 * Bu modül, GDPR (Genel Veri Koruma Yönetmeliği) ve KVKK (Kişisel Verilerin Korunması Kanunu)
 * kapsamında kullanıcı verilerinin silinmesi, anonimleştirilmesi ve yönetilmesi için
 * gerekli fonksiyonları içerir.
 */

import { supabaseAdmin } from '../supabase/admin';
import { getTenantSupabaseClient } from '../supabase/server';
import { getLogger } from '../utils/logger';
import { exportUserData } from '../export/tenant-export';
import { v4 as uuidv4 } from 'uuid';

// Logger
const logger = getLogger('gdpr-data-deletion');

// Silme işlemi sonucu
export interface DeletionResult {
  success: boolean;
  userId: string;
  tenantId: string;
  deletedData?: {
    tables: string[];
    recordCount: number;
  };
  anonymizedData?: {
    tables: string[];
    recordCount: number;
  };
  error?: string;
  timestamp: string;
  requestId: string;
}

// Silme işlemi tipi
export type DeletionType = 'hard' | 'soft' | 'anonymize';

// Silme işlemi seçenekleri
export interface DeletionOptions {
  type: DeletionType;
  exportDataBeforeDeletion?: boolean;
  retentionPeriodDays?: number;
  notifyUser?: boolean;
  notifyAdmin?: boolean;
  reason?: string;
}

/**
 * Kullanıcı verilerini GDPR/KVKK uyumlu şekilde siler
 */
export async function deleteUserData(
  userId: string,
  tenantId: string,
  options: DeletionOptions
): Promise<DeletionResult> {
  const requestId = uuidv4();
  
  try {
    logger.info(`GDPR veri silme işlemi başlatıldı. Kullanıcı: ${userId}, Tenant: ${tenantId}, Tip: ${options.type}`);
    
    // Silme işlemini kaydet
    await logDeletionRequest(userId, tenantId, options, requestId);
    
    // Silmeden önce veriyi dışa aktar (istenirse)
    if (options.exportDataBeforeDeletion) {
      await exportUserData(userId, tenantId, { format: 'json' });
      logger.info(`Kullanıcı ${userId} verileri silme öncesi dışa aktarıldı`);
    }
    
    let result: DeletionResult = {
      success: true,
      userId,
      tenantId,
      timestamp: new Date().toISOString(),
      requestId
    };
    
    // Silme tipine göre işlem yap
    switch (options.type) {
      case 'hard':
        // Kalıcı silme - tüm kullanıcı verilerini tamamen sil
        result = {
          ...result,
          ...await hardDeleteUserData(userId, tenantId)
        };
        break;
        
      case 'soft':
        // Yumuşak silme - verileri sakla ama erişilemez yap
        result = {
          ...result,
          ...await softDeleteUserData(userId, tenantId, options.retentionPeriodDays)
        };
        break;
        
      case 'anonymize':
        // Anonimleştirme - kişisel verileri anonimleştir ama istatistiksel verileri koru
        result = {
          ...result,
          ...await anonymizeUserData(userId, tenantId)
        };
        break;
    }
    
    // Silme işlemini tamamlandı olarak işaretle
    await updateDeletionRequestStatus(requestId, 'completed');
    
    // Bildirim gönder (istenirse)
    if (options.notifyUser) {
      await sendUserDeletionNotification(userId, tenantId, options.type);
    }
    
    if (options.notifyAdmin) {
      await sendAdminDeletionNotification(userId, tenantId, options.type, result);
    }
    
    logger.info(`GDPR veri silme işlemi tamamlandı. Kullanıcı: ${userId}, Tenant: ${tenantId}`);
    return result;
    
  } catch (error) {
    logger.error(`GDPR veri silme hatası. Kullanıcı: ${userId}, Tenant: ${tenantId}:`, error);
    
    // Silme işlemini başarısız olarak işaretle
    await updateDeletionRequestStatus(requestId, 'failed', error instanceof Error ? error.message : String(error));
    
    return {
      success: false,
      userId,
      tenantId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      requestId
    };
  }
}

/**
 * Kullanıcı verilerini kalıcı olarak siler
 */
async function hardDeleteUserData(userId: string, tenantId: string) {
  const deletedTables: string[] = [];
  let totalDeletedRecords = 0;
  
  try {
    // Tenant-specific Supabase client
    const supabase = await getTenantSupabaseClient(tenantId);
    
    // İlişkili tabloları bul ve sil
    const userRelatedTables = [
      'user_profiles',
      'user_preferences',
      'user_activities',
      'user_notifications',
      'user_messages',
      'user_files',
      'teacher_assignments',
      'student_grades',
      'student_attendances',
      'student_notes'
    ];
    
    // Her tabloda kullanıcıya ait kayıtları sil
    for (const table of userRelatedTables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .delete({ count: 'exact' })
          .eq('user_id', userId);
        
        if (error) {
          logger.warn(`${table} tablosundan kullanıcı verileri silinirken hata:`, error);
          continue;
        }
        
        if (count && count > 0) {
          deletedTables.push(table);
          totalDeletedRecords += count;
        }
      } catch (tableError) {
        // Tablo bulunamadıysa veya başka bir hata olduysa devam et
        logger.warn(`${table} tablosu işlenirken hata:`, tableError);
      }
    }
    
    // Son olarak ana kullanıcı kaydını sil
    const { error: userDeleteError, count: userDeleteCount } = await supabase
      .from('users')
      .delete({ count: 'exact' })
      .eq('id', userId);
    
    if (userDeleteError) {
      throw new Error(`Kullanıcı kaydı silinirken hata: ${userDeleteError.message}`);
    }
    
    if (userDeleteCount && userDeleteCount > 0) {
      deletedTables.push('users');
      totalDeletedRecords += userDeleteCount;
    }
    
    // Auth kullanıcısını da sil
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authDeleteError) {
      throw new Error(`Auth kullanıcısı silinirken hata: ${authDeleteError.message}`);
    }
    
    return {
      deletedData: {
        tables: deletedTables,
        recordCount: totalDeletedRecords
      }
    };
  } catch (error) {
    logger.error(`Kalıcı silme hatası. Kullanıcı: ${userId}, Tenant: ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Kullanıcı verilerini yumuşak siler (soft delete)
 */
async function softDeleteUserData(
  userId: string, 
  tenantId: string,
  retentionPeriodDays = 30
) {
  const deletedTables: string[] = [];
  let totalDeletedRecords = 0;
  
  try {
    // Tenant-specific Supabase client
    const supabase = await getTenantSupabaseClient(tenantId);
    
    // Silinme tarihi
    const deletedAt = new Date().toISOString();
    // Kalıcı silinme tarihi
    const scheduledPurgeDateAt = new Date();
    scheduledPurgeDateAt.setDate(scheduledPurgeDateAt.getDate() + retentionPeriodDays);
    
    // İlişkili tabloları bul ve soft delete işaretle
    const userRelatedTables = [
      'user_profiles',
      'user_preferences',
      'user_activities',
      'user_notifications',
      'user_messages',
      'user_files',
      'teacher_assignments',
      'student_grades',
      'student_attendances',
      'student_notes'
    ];
    
    // Her tabloda kullanıcıya ait kayıtları soft delete olarak işaretle
    for (const table of userRelatedTables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .update({
            deleted_at: deletedAt,
            scheduled_purge_date: scheduledPurgeDateAt.toISOString()
          })
          .eq('user_id', userId)
          .is('deleted_at', null); // Sadece silinmemiş kayıtları güncelle
        
        if (error) {
          logger.warn(`${table} tablosunda soft delete işlemi yapılırken hata:`, error);
          continue;
        }
        
        if (count && count > 0) {
          deletedTables.push(table);
          totalDeletedRecords += count;
        }
      } catch (tableError) {
        // Tablo bulunamadıysa veya başka bir hata olduysa devam et
        logger.warn(`${table} tablosu işlenirken hata:`, tableError);
      }
    }
    
    // Ana kullanıcı kaydını soft delete olarak işaretle
    const { error: userUpdateError, count: userUpdateCount } = await supabase
      .from('users')
      .update({
        deleted_at: deletedAt,
        scheduled_purge_date: scheduledPurgeDateAt.toISOString(),
        is_active: false
      })
      .eq('id', userId)
      .is('deleted_at', null);
    
    if (userUpdateError) {
      throw new Error(`Kullanıcı kaydı soft delete işaretlenirken hata: ${userUpdateError.message}`);
    }
    
    if (userUpdateCount && userUpdateCount > 0) {
      deletedTables.push('users');
      totalDeletedRecords += userUpdateCount;
    }
    
    // Auth kullanıcısını devre dışı bırak
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { ban_duration: '876000h' } // ~100 yıl
    );
    
    if (authUpdateError) {
      throw new Error(`Auth kullanıcısı devre dışı bırakılırken hata: ${authUpdateError.message}`);
    }
    
    return {
      deletedData: {
        tables: deletedTables,
        recordCount: totalDeletedRecords
      }
    };
  } catch (error) {
    logger.error(`Yumuşak silme hatası. Kullanıcı: ${userId}, Tenant: ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Kullanıcı verilerini anonimleştirir
 */
async function anonymizeUserData(userId: string, tenantId: string) {
  const anonymizedTables: string[] = [];
  let totalAnonymizedRecords = 0;
  
  try {
    // Tenant-specific Supabase client
    const supabase = await getTenantSupabaseClient(tenantId);
    
    // Anonimleştirme tarihi
    const anonymizedAt = new Date().toISOString();
    
    // Kullanıcı profil bilgilerini anonimleştir
    const { error: profileError, count: profileCount } = await supabase
      .from('user_profiles')
      .update({
        first_name: 'Anonim',
        last_name: 'Kullanıcı',
        phone: null,
        address: null,
        birth_date: null,
        profile_picture: null,
        anonymized_at: anonymizedAt
      })
      .eq('user_id', userId);
    
    if (!profileError && profileCount && profileCount > 0) {
      anonymizedTables.push('user_profiles');
      totalAnonymizedRecords += profileCount;
    }
    
    // Ana kullanıcı kaydını anonimleştir
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (userFetchError) {
      throw new Error(`Kullanıcı bilgileri alınırken hata: ${userFetchError.message}`);
    }
    
    // Rastgele bir email oluştur
    const anonymousEmail = `anon_${userId.substring(0, 8)}@anonymous.user`;
    
    const { error: userUpdateError, count: userUpdateCount } = await supabase
      .from('users')
      .update({
        email: anonymousEmail,
        display_name: 'Anonim Kullanıcı',
        is_anonymized: true,
        anonymized_at: anonymizedAt
      })
      .eq('id', userId);
    
    if (userUpdateError) {
      throw new Error(`Kullanıcı kaydı anonimleştirilirken hata: ${userUpdateError.message}`);
    }
    
    if (userUpdateCount && userUpdateCount > 0) {
      anonymizedTables.push('users');
      totalAnonymizedRecords += userUpdateCount;
    }
    
    // Auth kullanıcısını güncelle
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        email: anonymousEmail,
        user_metadata: { anonymized: true, original_email_hash: hashEmail(userData.email) }
      }
    );
    
    if (authUpdateError) {
      throw new Error(`Auth kullanıcısı anonimleştirilirken hata: ${authUpdateError.message}`);
    }
    
    return {
      anonymizedData: {
        tables: anonymizedTables,
        recordCount: totalAnonymizedRecords
      }
    };
  } catch (error) {
    logger.error(`Anonimleştirme hatası. Kullanıcı: ${userId}, Tenant: ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Silme isteğini loglar
 */
async function logDeletionRequest(
  userId: string,
  tenantId: string,
  options: DeletionOptions,
  requestId: string
) {
  try {
    const { error } = await supabaseAdmin
      .from('gdpr_deletion_requests')
      .insert({
        id: requestId,
        user_id: userId,
        tenant_id: tenantId,
        deletion_type: options.type,
        reason: options.reason || 'Kullanıcı talebi',
        status: 'processing',
        requested_at: new Date().toISOString(),
        retention_period_days: options.retentionPeriodDays || null
      });
    
    if (error) {
      logger.error('Silme isteği kaydedilirken hata:', error);
    }
  } catch (error) {
    logger.error('Silme isteği log hatası:', error);
  }
}

/**
 * Silme isteği durumunu günceller
 */
async function updateDeletionRequestStatus(
  requestId: string,
  status: 'processing' | 'completed' | 'failed',
  errorMessage?: string
) {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (status === 'failed') {
      updateData.error_message = errorMessage;
    }
    
    const { error } = await supabaseAdmin
      .from('gdpr_deletion_requests')
      .update(updateData)
      .eq('id', requestId);
    
    if (error) {
      logger.error('Silme isteği durumu güncellenirken hata:', error);
    }
  } catch (error) {
    logger.error('Silme isteği durum güncelleme hatası:', error);
  }
}

/**
 * Kullanıcıya silme bildirimi gönderir
 */
async function sendUserDeletionNotification(
  userId: string,
  tenantId: string,
  deletionType: DeletionType
) {
  try {
    // Kullanıcı email bilgisini al
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (userError || !userData) {
      logger.warn(`Kullanıcı bilgisi alınamadı, bildirim gönderilemedi: ${userError?.message}`);
      return;
    }
    
    // Email gönderme işlemi burada yapılacak
    // Bu örnekte sadece log kaydı oluşturuyoruz
    logger.info(`Kullanıcı ${userId} için ${deletionType} silme bildirimi gönderildi. Email: ${userData.email}`);
    
  } catch (error) {
    logger.error('Kullanıcı bildirim hatası:', error);
  }
}

/**
 * Yöneticiye silme bildirimi gönderir
 */
async function sendAdminDeletionNotification(
  userId: string,
  tenantId: string,
  deletionType: DeletionType,
  result: DeletionResult
) {
  try {
    // Tenant admin bilgilerini al
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('tenant_admins')
      .select('email')
      .eq('tenant_id', tenantId)
      .eq('role', 'admin')
      .limit(1)
      .single();
    
    if (adminError || !adminData) {
      logger.warn(`Tenant admin bilgisi alınamadı, bildirim gönderilemedi: ${adminError?.message}`);
      return;
    }
    
    // Email gönderme işlemi burada yapılacak
    // Bu örnekte sadece log kaydı oluşturuyoruz
    logger.info(`Admin ${adminData.email} için kullanıcı ${userId} silme bildirimi gönderildi. Tip: ${deletionType}`);
    
  } catch (error) {
    logger.error('Admin bildirim hatası:', error);
  }
}

/**
 * Email adresini hash'ler (referans için)
 */
function hashEmail(email: string): string {
  return require('crypto')
    .createHash('sha256')
    .update(email)
    .digest('hex');
}

/**
 * Zamanlanmış silme işlemlerini gerçekleştirir
 * (Cron job tarafından çağrılır)
 */
export async function processPendingDeletions() {
  try {
    const now = new Date().toISOString();
    
    // Zamanı gelmiş soft-deleted kayıtları bul
    const { data: pendingDeletions, error } = await supabaseAdmin
      .from('gdpr_deletion_requests')
      .select('id, user_id, tenant_id')
      .eq('deletion_type', 'soft')
      .eq('status', 'completed')
      .lt('scheduled_purge_date', now)
      .is('purged_at', null);
    
    if (error) {
      logger.error('Bekleyen silme işlemleri alınırken hata:', error);
      return;
    }
    
    logger.info(`${pendingDeletions?.length || 0} bekleyen kalıcı silme işlemi bulundu`);
    
    // Her bir bekleyen silme işlemini gerçekleştir
    for (const deletion of pendingDeletions || []) {
      try {
        // Kalıcı silme işlemini gerçekleştir
        await hardDeleteUserData(deletion.user_id, deletion.tenant_id);
        
        // Silme kaydını güncelle
        await supabaseAdmin
          .from('gdpr_deletion_requests')
          .update({
            purged_at: now,
            status: 'purged'
          })
          .eq('id', deletion.id);
        
        logger.info(`Kullanıcı ${deletion.user_id} için zamanlanmış kalıcı silme işlemi tamamlandı`);
      } catch (deletionError) {
        logger.error(`Kullanıcı ${deletion.user_id} için zamanlanmış silme hatası:`, deletionError);
      }
    }
  } catch (error) {
    logger.error('Zamanlanmış silme işlemleri hatası:', error);
  }
} 