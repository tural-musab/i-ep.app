/**
 * Tenant erişim kontrolü modülü
 *
 * Bu modül, kullanıcıların tenant verilerine erişim hakkını
 * RLS fonksiyonlarını kullanarak kontrol eder.
 */

import { createServerSupabaseClient } from '../supabase/server';
import { TenantNotFoundError, TenantAccessDeniedError } from '../errors/tenant-errors';

/**
 * Kullanıcının belirli bir tenant'a erişim hakkını kontrol eder
 *
 * @param userId Kontrol edilecek kullanıcı ID'si
 * @param tenantId Erişilmek istenen tenant ID'si
 * @returns Erişim hakkı varsa true, yoksa false
 */
export async function checkTenantAccess(userId: string, tenantId: string): Promise<boolean> {
  try {
    if (!userId || !tenantId) {
      return false;
    }

    const supabase = createServerSupabaseClient();

    // Önce süper admin kontrolü yap
    const { data: isSuperAdmin, error: superAdminError } = await supabase.rpc('is_super_admin');

    if (superAdminError) {
      console.error('Süper admin kontrolü hatası:', superAdminError);
    } else if (isSuperAdmin) {
      // Süper admin her tenant'a erişebilir
      return true;
    }

    // Sonra tenant admin kontrolü yap
    const { data: isTenantAdmin, error: tenantAdminError } = await supabase.rpc('is_tenant_admin', {
      tenant_id: tenantId,
    });

    if (tenantAdminError) {
      console.error('Tenant admin kontrolü hatası:', tenantAdminError);
      return false;
    }

    return !!isTenantAdmin;
  } catch (error) {
    console.error('Tenant erişim kontrolü hatası:', error);
    return false;
  }
}

/**
 * Kullanıcının belirli bir öğrenciye erişim hakkını kontrol eder
 *
 * @param teacherId Öğretmen ID'si
 * @param studentId Öğrenci ID'si
 * @returns Erişim hakkı varsa true, yoksa false
 */
export async function checkTeacherStudentAccess(
  teacherId: string,
  studentId: string
): Promise<boolean> {
  try {
    if (!teacherId || !studentId) {
      return false;
    }

    const supabase = createServerSupabaseClient();

    // Önce süper admin kontrolü yap
    const { data: isSuperAdmin, error: superAdminError } = await supabase.rpc('is_super_admin');

    if (superAdminError) {
      console.error('Süper admin kontrolü hatası:', superAdminError);
    } else if (isSuperAdmin) {
      // Süper admin her öğrenciye erişebilir
      return true;
    }

    // Sonra öğretmenin öğrenciye erişim kontrolü yap
    const { data: hasAccess, error: accessError } = await supabase.rpc('teacher_has_student', {
      teacher_id: teacherId,
      student_id: studentId,
    });

    if (accessError) {
      console.error('Öğretmen-öğrenci erişim kontrolü hatası:', accessError);
      return false;
    }

    return !!hasAccess;
  } catch (error) {
    console.error('Öğretmen-öğrenci erişim kontrolü hatası:', error);
    return false;
  }
}

/**
 * Kullanıcının belirli bir sınıfa erişim hakkını kontrol eder
 *
 * @param teacherId Öğretmen ID'si
 * @param classId Sınıf ID'si
 * @returns Erişim hakkı varsa true, yoksa false
 */
export async function checkTeacherClassAccess(
  teacherId: string,
  classId: string
): Promise<boolean> {
  try {
    if (!teacherId || !classId) {
      return false;
    }

    const supabase = createServerSupabaseClient();

    // Önce süper admin kontrolü yap
    const { data: isSuperAdmin, error: superAdminError } = await supabase.rpc('is_super_admin');

    if (superAdminError) {
      console.error('Süper admin kontrolü hatası:', superAdminError);
    } else if (isSuperAdmin) {
      // Süper admin her sınıfa erişebilir
      return true;
    }

    // Sonra öğretmenin sınıfa erişim kontrolü yap
    const { data: hasAccess, error: accessError } = await supabase.rpc('teacher_has_class', {
      teacher_id: teacherId,
      class_id: classId,
    });

    if (accessError) {
      console.error('Öğretmen-sınıf erişim kontrolü hatası:', accessError);
      return false;
    }

    return !!hasAccess;
  } catch (error) {
    console.error('Öğretmen-sınıf erişim kontrolü hatası:', error);
    return false;
  }
}

/**
 * Erişim reddedildiğinde kayıt tut
 *
 * @param userId Erişimi reddedilen kullanıcı ID'si
 * @param tenantId İlgili tenant ID'si
 * @param schemaName Şema adı
 * @param tableName Tablo adı
 * @param operation İşlem türü (okuma, yazma, silme vb)
 * @param reason Reddetme nedeni
 * @param details Ek detaylar
 */
export async function logAccessDenied(
  userId: string,
  tenantId: string,
  schemaName: string,
  tableName: string,
  operation: string,
  reason: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();

    // SQL sorgusu kullanarak doğrudan audit şemasına ekleme yapalım
    await supabase.rpc('execute_raw_query', {
      query_text: `
        INSERT INTO audit.access_denied_logs (
          user_id, tenant_id, schema_name, table_name, 
          command, error_message, session_info, timestamp
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
      `,
      params: [
        userId,
        tenantId,
        schemaName,
        tableName,
        operation,
        reason,
        JSON.stringify(details || {}),
        new Date().toISOString(),
      ],
    });
  } catch (error) {
    console.error('Erişim reddi kayıt hatası:', error);
  }
}

/**
 * Belirli bir tenant için erişim reddi loglarını getir
 *
 * @param tenantId İlgili tenant ID'si
 * @param startDate Başlangıç tarihi (isteğe bağlı)
 * @param endDate Bitiş tarihi (isteğe bağlı)
 * @returns Erişim reddi logları
 */
export async function getAccessDeniedLogs(
  tenantId: string,
  startDate?: Date,
  endDate?: Date
): Promise<any[]> {
  try {
    const supabase = createServerSupabaseClient();

    // SQL sorgusu kullanarak erişim reddi loglarını getir
    const { data, error } = await supabase.rpc('execute_raw_query', {
      query_text: `
        SELECT 
          schema_name,
          table_name,
          command,
          COUNT(*) as denied_count,
          MAX(timestamp) as most_recent_timestamp,
          MIN(error_message) as sample_error_message
        FROM audit.access_denied_logs
        WHERE tenant_id = $1
          AND timestamp BETWEEN $2 AND $3
        GROUP BY schema_name, table_name, command
        ORDER BY denied_count DESC
      `,
      params: [
        tenantId,
        startDate?.toISOString() || new Date(Date.now() - 86400000).toISOString(), // Son 24 saat
        endDate?.toISOString() || new Date().toISOString(),
      ],
    });

    if (error) {
      console.error('Erişim reddi logları getirme hatası:', error);
      return [];
    }

    return (data as any[]) || [];
  } catch (error) {
    console.error('Erişim reddi logları getirme hatası:', error);
    return [];
  }
}
