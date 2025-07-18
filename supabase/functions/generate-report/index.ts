// Iqra Eğitim Portalı - Rapor Oluşturma Edge Functions
// Bu edge function, belirli bir tenant için eğitim raporları oluşturur.
// RLS politikalarına uyumludur ve yetkilendirme gerektirir.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ReportRequest {
  reportType: 'student' | 'class' | 'school' | 'attendance' | 'grade';
  tenantId: string;
  filters?: {
    classId?: string;
    studentId?: string;
    subjectId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

// PDF oluşturmak için basit bir yardımcı fonksiyon (gerçekte daha kapsamlı olacaktır)
async function generatePDF(data: any): Promise<Uint8Array> {
  // Gerçek uygulamada burada PDF oluşturma kütüphanesi kullanılacak
  // Şimdilik basit bir metin temsili döndürüyoruz
  const encoder = new TextEncoder();
  return encoder.encode(JSON.stringify(data, null, 2));
}

// Rapor verilerini hazırlayan fonksiyon
async function prepareReportData(
  reportRequest: ReportRequest,
  supabase: SupabaseClient
): Promise<any> {
  const { reportType, tenantId, filters } = reportRequest;
  const schemaName = `tenant_${tenantId}`;

  // Rapor tipine göre uygun sorguyu oluştur
  switch (reportType) {
    case 'student': {
      // Öğrenci raporu
      const { data, error } = await supabase
        .from(`${schemaName}.students`)
        .select(
          `
          id, 
          first_name, 
          last_name, 
          birth_date,
          class_students(
            id,
            class:classes(
              name, 
              grade_level
            )
          ),
          grades(
            grade_value,
            grade_type,
            assessment_date,
            subject:subjects(name)
          ),
          attendances(
            date,
            status
          )
        `
        )
        .eq('id', filters?.studentId);

      if (error) throw error;
      return {
        reportType: 'Öğrenci Raporu',
        generatedAt: new Date().toISOString(),
        data,
      };
    }

    case 'class': {
      // Sınıf raporu
      const { data, error } = await supabase
        .from(`${schemaName}.classes`)
        .select(
          `
          id,
          name,
          grade_level,
          school_year,
          class_students(
            student:students(
              id,
              first_name,
              last_name
            )
          ),
          class_teachers(
            teacher:teachers(
              id,
              first_name,
              last_name
            ),
            subject:subjects(
              id,
              name
            )
          )
        `
        )
        .eq('id', filters?.classId);

      if (error) throw error;
      return {
        reportType: 'Sınıf Raporu',
        generatedAt: new Date().toISOString(),
        data,
      };
    }

    case 'attendance': {
      // Yoklama raporu
      const query = supabase.from(`${schemaName}.attendances`).select(`
          id,
          date,
          status,
          student:students(
            id,
            first_name,
            last_name
          ),
          class:classes(
            id,
            name,
            grade_level
          )
        `);

      // Filtreleri uygula
      if (filters?.classId) {
        query.eq('class_id', filters.classId);
      }

      if (filters?.studentId) {
        query.eq('student_id', filters.studentId);
      }

      if (filters?.dateRange) {
        query.gte('date', filters.dateRange.start);
        query.lte('date', filters.dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      return {
        reportType: 'Yoklama Raporu',
        generatedAt: new Date().toISOString(),
        filters,
        data,
      };
    }

    case 'grade': {
      // Not raporu
      const query = supabase.from(`${schemaName}.grades`).select(`
          id,
          grade_value,
          grade_type,
          assessment_date,
          student:students(
            id,
            first_name,
            last_name
          ),
          subject:subjects(
            id,
            name
          ),
          teacher:teachers(
            id,
            first_name,
            last_name
          )
        `);

      // Filtreleri uygula
      if (filters?.studentId) {
        query.eq('student_id', filters.studentId);
      }

      if (filters?.subjectId) {
        query.eq('subject_id', filters.subjectId);
      }

      if (filters?.dateRange) {
        query.gte('assessment_date', filters.dateRange.start);
        query.lte('assessment_date', filters.dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      return {
        reportType: 'Not Raporu',
        generatedAt: new Date().toISOString(),
        filters,
        data,
      };
    }

    case 'school': {
      // Okul genel raporu
      const classesQuery = supabase.from(`${schemaName}.classes`).select('*');

      const studentsQuery = supabase.from(`${schemaName}.students`).select('count');

      const teachersQuery = supabase.from(`${schemaName}.teachers`).select('count');

      const [classesResult, studentsResult, teachersResult] = await Promise.all([
        classesQuery,
        studentsQuery,
        teachersQuery,
      ]);

      if (classesResult.error || studentsResult.error || teachersResult.error) {
        throw new Error('Okul raporu oluşturulurken hata oluştu');
      }

      return {
        reportType: 'Okul Genel Raporu',
        generatedAt: new Date().toISOString(),
        data: {
          classes: classesResult.data,
          studentCount: studentsResult.count,
          teacherCount: teachersResult.count,
        },
      };
    }

    default:
      throw new Error(`Bilinmeyen rapor tipi: ${reportType}`);
  }
}

// Ana API handler fonksiyonu
serve(async (req) => {
  // CORS kontrolü
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Yalnızca POST isteklerini işle
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // İstek gövdesini JSON olarak ayrıştır
    const requestData: ReportRequest = await req.json();

    // Gerekli alanları kontrol et
    if (!requestData.reportType || !requestData.tenantId) {
      return new Response(
        JSON.stringify({ error: 'Eksik parametreler: reportType ve tenantId gereklidir' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Supabase istemcisini oluştur
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // Kullanıcı kimliğini doğrula
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Rapor verisini hazırla
    const reportData = await prepareReportData(requestData, supabaseClient);

    // PDF dosyası oluştur
    const pdfBuffer = await generatePDF(reportData);

    // İsteğe bağlı olarak PDF'i depolamada sakla
    const timestamp = new Date().getTime();
    const fileName = `reports/${requestData.tenantId}/${requestData.reportType}_${timestamp}.pdf`;

    const { error: uploadError } = await supabaseClient.storage
      .from('reports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('PDF yükleme hatası:', uploadError);
      // Yükleme hatası olsa bile işleme devam et, sadece logla
    }

    // Rapor için bir veritabanı kaydı oluştur
    const { error: dbError } = await supabaseClient.from('report_logs').insert({
      tenant_id: requestData.reportType,
      report_type: requestData.reportType,
      created_by: user.id,
      file_path: fileName,
      filters: requestData.filters,
    });

    if (dbError) {
      console.error('Rapor kaydı oluşturma hatası:', dbError);
      // Veritabanı hatası olsa bile işleme devam et, sadece logla
    }

    // PDF'i kullanıcıya doğrudan gönder
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${requestData.reportType}_report.pdf"`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Rapor oluşturma hatası:', error);

    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
