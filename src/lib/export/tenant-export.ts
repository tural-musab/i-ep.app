/**
 * Iqra Eğitim Portalı - Tenant Veri Dışa Aktarma Modülü
 *
 * Bu modül, kiracı verilerinin CSV, JSON veya Excel formatlarında
 * dışa aktarılması için gerekli fonksiyonları içerir.
 * KVKK ve GDPR uyumlu veri taşınabilirliği sağlar.
 */

import { getTenantSupabaseClient } from '../supabase/server';
import { getLogger } from '../utils/logger';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// Logger
const logger = getLogger('tenant-export');

// Dışa aktarma formatları
export type ExportFormat = 'csv' | 'json' | 'excel';

// Dışa aktarma seçenekleri
export interface ExportOptions {
  format: ExportFormat;
  tables?: string[];
  filters?: Record<string, any>;
  includeRelations?: boolean;
  anonymizePersonalData?: boolean;
  maxRecords?: number;
}

// Dışa aktarma sonucu
export interface ExportResult {
  success: boolean;
  tenantId: string;
  format: ExportFormat;
  data?: any;
  tables?: string[];
  recordCount?: number;
  fileSize?: number;
  error?: string;
  timestamp: string;
}

/**
 * Kiracı verilerini dışa aktarır
 *
 * @param tenantId Kiracı ID'si
 * @param options Dışa aktarma seçenekleri
 * @returns Dışa aktarma sonucu
 */
export async function exportTenantData(
  tenantId: string,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    logger.info(
      `Tenant veri dışa aktarma başlatıldı. Tenant: ${tenantId}, Format: ${options.format}`
    );

    // Tenant-specific Supabase client
    const supabase = await getTenantSupabaseClient(tenantId);

    // Dışa aktarılacak tabloları belirle
    const tables = options.tables || (await getDefaultTables(tenantId));

    // Her tablodan veri çek
    const exportedData: Record<string, any[]> = {};
    let totalRecordCount = 0;

    for (const table of tables) {
      try {
        // Tablo verilerini sorgula
        let query = supabase.from(table).select('*');

        // Filtreleri uygula
        if (options.filters && options.filters[table]) {
          query = applyFilters(query, options.filters[table]);
        }

        // Maksimum kayıt sayısını sınırla
        if (options.maxRecords) {
          query = query.limit(options.maxRecords);
        }

        // Verileri çek
        const { data, error } = await query;

        if (error) {
          logger.warn(`${table} tablosu verileri alınırken hata:`, error);
          continue;
        }

        if (data && data.length > 0) {
          // Kişisel verileri anonimleştir (istenirse)
          const processedData = options.anonymizePersonalData
            ? anonymizeTableData(table, data)
            : data;

          exportedData[table] = processedData;
          totalRecordCount += processedData.length;
        }
      } catch (tableError) {
        logger.warn(`${table} tablosu işlenirken hata:`, tableError);
      }
    }

    // Verileri istenen formata dönüştür
    const formattedData = formatExportData(exportedData, options.format);

    // Dosya boyutunu hesapla (yaklaşık)
    const fileSize = calculateFileSize(formattedData);

    logger.info(
      `Tenant veri dışa aktarma tamamlandı. Tenant: ${tenantId}, Kayıt sayısı: ${totalRecordCount}`
    );

    return {
      success: true,
      tenantId,
      format: options.format,
      data: formattedData,
      tables,
      recordCount: totalRecordCount,
      fileSize,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`Tenant veri dışa aktarma hatası. Tenant: ${tenantId}:`, error);

    return {
      success: false,
      tenantId,
      format: options.format,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Belirli bir kullanıcının verilerini dışa aktarır
 *
 * @param userId Kullanıcı ID'si
 * @param tenantId Kiracı ID'si
 * @param options Dışa aktarma seçenekleri
 * @returns Dışa aktarma sonucu
 */
export async function exportUserData(
  userId: string,
  tenantId: string,
  options: Omit<ExportOptions, 'tables' | 'filters'>
): Promise<ExportResult> {
  // Kullanıcıya ait verileri filtrelemek için
  const userFilters: Record<string, any> = {
    users: { id: userId },
    user_profiles: { user_id: userId },
    user_preferences: { user_id: userId },
    user_activities: { user_id: userId },
    user_notifications: { user_id: userId },
    user_messages: { user_id: userId },
    user_files: { user_id: userId },
    teacher_assignments: { teacher_id: userId },
    student_grades: { student_id: userId },
    student_attendances: { student_id: userId },
    student_notes: { student_id: userId },
  };

  // Kullanıcıya ait tabloları belirle
  const userTables = Object.keys(userFilters);

  // Dışa aktarma işlemini gerçekleştir
  return exportTenantData(tenantId, {
    ...options,
    tables: userTables,
    filters: userFilters,
  });
}

/**
 * Kiracı verilerini tamamen dışa aktarır
 * GDPR ve KVKK uyumlu veri taşınabilirliği için kullanılır
 *
 * @param tenantId Kiracı ID'si
 * @param options Dışa aktarma seçenekleri
 * @returns Dışa aktarma sonucu
 */
export async function exportFullTenant(
  tenantId: string,
  options: Omit<ExportOptions, 'tables'>
): Promise<ExportResult> {
  // Tüm tabloları alarak dışa aktarma işlemini gerçekleştir
  return exportTenantData(tenantId, options);
}

/**
 * GDPR uyumlu kullanıcı verisi dışa aktarır
 *
 * @param userId Kullanıcı ID'si
 * @param tenantId Kiracı ID'si
 * @param format Dışa aktarma formatı
 * @returns Dışa aktarma sonucu
 */
export async function exportUserDataForGDPR(
  userId: string,
  tenantId: string,
  format: ExportFormat = 'json'
): Promise<ExportResult> {
  return exportUserData(userId, tenantId, {
    format,
    anonymizePersonalData: false,
    includeRelations: true,
  });
}

/**
 * Belirli bir tabloyu dışa aktarır
 *
 * @param tenantId Kiracı ID'si
 * @param tableName Tablo adı
 * @param options Dışa aktarma seçenekleri
 * @returns Dışa aktarma sonucu
 */
export async function exportTenantTable(
  tenantId: string,
  tableName: string,
  options: Omit<ExportOptions, 'tables'>
): Promise<ExportResult> {
  return exportTenantData(tenantId, {
    ...options,
    tables: [tableName],
  });
}

/**
 * Sorgu sonuçlarını dışa aktarır
 *
 * @param tenantId Kiracı ID'si
 * @param query Sorgu
 * @param tableName Sonuçların kaydedileceği tablo adı
 * @param format Dışa aktarma formatı
 * @returns Dışa aktarma sonucu
 */
export async function exportQueryResults(
  tenantId: string,
  query: string,
  tableName: string,
  format: ExportFormat = 'csv'
): Promise<ExportResult> {
  try {
    logger.info(`Sorgu sonuçları dışa aktarma başlatıldı. Tenant: ${tenantId}`);

    // Tenant-specific Supabase client
    const supabase = await getTenantSupabaseClient(tenantId);

    // SQL sorgusu çalıştır
    const { data, error } = await supabase.rpc('execute_raw_query', { query_text: query });

    if (error) {
      logger.error(`Sorgu çalıştırılırken hata:`, error);
      return {
        success: false,
        tenantId,
        format,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    // Verileri formata dönüştür
    const formattedData = formatExportData({ [tableName]: data }, format);

    // Dosya boyutunu hesapla
    const fileSize = calculateFileSize(formattedData);

    return {
      success: true,
      tenantId,
      format,
      data: formattedData,
      tables: [tableName],
      recordCount: data?.length || 0,
      fileSize,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`Sorgu sonuçları dışa aktarma hatası:`, error);
    return {
      success: false,
      tenantId,
      format,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Varsayılan dışa aktarılacak tabloları döndürür
 */
async function getDefaultTables(tenantId: string): Promise<string[]> {
  // Burada tenant şemasındaki tabloları dinamik olarak çekebiliriz
  // Şimdilik sabit bir liste döndürüyoruz
  return [
    'users',
    'user_profiles',
    'user_preferences',
    'classes',
    'students',
    'teachers',
    'grades',
    'attendances',
    'assignments',
    'exams',
    'courses',
  ];
}

/**
 * Sorguya filtreleri uygular
 */
function applyFilters(
  query: PostgrestFilterBuilder<any, any, any>,
  filters: Record<string, any>
): PostgrestFilterBuilder<any, any, any> {
  let filteredQuery = query;

  // Her filtre için
  Object.entries(filters).forEach(([field, value]) => {
    if (value === null) {
      filteredQuery = filteredQuery.is(field, null);
    } else if (Array.isArray(value)) {
      filteredQuery = filteredQuery.in(field, value);
    } else if (typeof value === 'object') {
      // Karmaşık filtreler için (gt, lt, vb.)
      Object.entries(value).forEach(([operator, operatorValue]) => {
        switch (operator) {
          case 'gt':
            filteredQuery = filteredQuery.gt(field, operatorValue);
            break;
          case 'gte':
            filteredQuery = filteredQuery.gte(field, operatorValue);
            break;
          case 'lt':
            filteredQuery = filteredQuery.lt(field, operatorValue);
            break;
          case 'lte':
            filteredQuery = filteredQuery.lte(field, operatorValue);
            break;
          case 'neq':
            filteredQuery = filteredQuery.neq(field, operatorValue);
            break;
          case 'like':
            filteredQuery = filteredQuery.like(field, `%${operatorValue}%`);
            break;
          case 'ilike':
            filteredQuery = filteredQuery.ilike(field, `%${operatorValue}%`);
            break;
        }
      });
    } else {
      filteredQuery = filteredQuery.eq(field, value);
    }
  });

  return filteredQuery;
}

/**
 * Tablo verilerini anonimleştirir
 */
function anonymizeTableData(table: string, data: any[]): any[] {
  // Tablo tipine göre anonimleştirme stratejisi belirle
  const personalDataFields: Record<string, string[]> = {
    users: ['email', 'phone', 'full_name'],
    user_profiles: ['first_name', 'last_name', 'phone', 'address', 'birth_date', 'profile_picture'],
    students: ['first_name', 'last_name', 'email', 'phone', 'address', 'birth_date', 'photo'],
    teachers: ['first_name', 'last_name', 'email', 'phone', 'address', 'birth_date', 'photo'],
  };

  // Bu tablo için anonimleştirilecek alanlar yoksa veriyi olduğu gibi döndür
  if (!personalDataFields[table]) {
    return data;
  }

  // Verileri anonimleştir
  return data.map((record) => {
    const anonymizedRecord = { ...record };

    personalDataFields[table].forEach((field) => {
      if (field in anonymizedRecord) {
        // Alan tipine göre anonimleştirme yap
        if (field.includes('name')) {
          anonymizedRecord[field] = 'Anonim';
        } else if (field.includes('email')) {
          anonymizedRecord[field] = `anon_${record.id?.substring(0, 8) || 'user'}@anonymous.user`;
        } else if (field.includes('phone')) {
          anonymizedRecord[field] = '0000000000';
        } else if (field.includes('address')) {
          anonymizedRecord[field] = 'Gizli Adres';
        } else if (field.includes('birth')) {
          anonymizedRecord[field] = null;
        } else if (field.includes('photo') || field.includes('picture')) {
          anonymizedRecord[field] = null;
        } else {
          anonymizedRecord[field] = '[Gizli Veri]';
        }
      }
    });

    return anonymizedRecord;
  });
}

/**
 * Verileri istenen formata dönüştürür
 */
function formatExportData(data: Record<string, any[]>, format: ExportFormat): any {
  switch (format) {
    case 'json':
      return data;

    case 'csv':
      // Her tablo için ayrı CSV oluştur
      const csvData: Record<string, string> = {};

      Object.entries(data).forEach(([table, records]) => {
        if (records.length === 0) return;

        // Başlık satırı
        const headers = Object.keys(records[0]);
        let csv = headers.join(',') + '\n';

        // Veri satırları
        records.forEach((record) => {
          const row = headers
            .map((header) => {
              const value = record[header];

              // CSV formatına uygun hale getir
              if (value === null || value === undefined) {
                return '';
              } else if (typeof value === 'object') {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
              } else if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`;
              } else {
                return value;
              }
            })
            .join(',');

          csv += row + '\n';
        });

        csvData[table] = csv;
      });

      return csvData;

    case 'excel':
      // Excel formatı için JSON verisini döndür
      // Gerçek uygulamada burada Excel dosyası oluşturulur
      return data;

    default:
      return data;
  }
}

/**
 * Veri boyutunu hesaplar (byte cinsinden)
 */
function calculateFileSize(data: any): number {
  const jsonString = JSON.stringify(data);
  return new TextEncoder().encode(jsonString).length;
}
