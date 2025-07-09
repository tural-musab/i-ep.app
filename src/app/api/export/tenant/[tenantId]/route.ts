/**
 * Tenant Veri Dışa Aktarma API
 * 
 * Bu API, tenant verilerini CSV, JSON veya Excel formatlarında dışa aktarma
 * işlemlerini sağlar. KVKK ve GDPR gereksinimlerine uygun şekilde veri dışa aktarma
 * yeteneği sunar.
 */

import { NextRequest, NextResponse } from "next/server";
import { exportTenantTable, exportFullTenant, exportQueryResults, ExportFormat } from "@/lib/export/tenant-export";
import { createTenantSupabaseClient } from "@/lib/supabase/server";
import { validateTenantAccess } from "@/lib/auth/permissions";
import { getLogger } from "@/lib/utils/logger";

// Logger
const logger = getLogger('export-api');

// Kabul edilen format tipleri
const VALID_FORMATS: ExportFormat[] = ['json', 'csv', 'excel', 'sql'];

/**
 * Tam tenant verilerini dışa aktarır
 * 
 * GET /api/export/tenant/[tenantId]/full?format=json
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const tenantId = params.tenantId;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') as ExportFormat || 'json';
    
    // Format geçerliliğini kontrol et
    if (!VALID_FORMATS.includes(format)) {
      return NextResponse.json(
        { error: `Geçersiz format. Desteklenen formatlar: ${VALID_FORMATS.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Yetki kontrolü
    const authorized = await validateTenantAccess(tenantId, { requiredRole: 'admin' });
    if (!authorized) {
      return NextResponse.json(
        { error: "Bu tenant için dışa aktarma yetkiniz bulunmuyor" },
        { status: 403 }
      );
    }
    
    // Tam tenant dışa aktarma işlemi
    const exportResult = await exportFullTenant(tenantId, { format });
    
    if (!exportResult.success) {
      return NextResponse.json(
        { error: exportResult.error || "Dışa aktarma başarısız oldu" },
        { status: 500 }
      );
    }
    
    // Yanıt başlıklarını ayarla
    const headers: HeadersInit = {
      'Content-Disposition': `attachment; filename=${exportResult.filename}`,
    };
    
    // Format'a göre content type ayarla
    switch (format) {
      case 'json':
        headers['Content-Type'] = 'application/json';
        break;
      case 'csv':
        headers['Content-Type'] = 'text/csv';
        break;
      case 'excel':
        headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'sql':
        headers['Content-Type'] = 'application/sql';
        break;
    }
    
    // Başarılı yanıt döndür
    return new NextResponse(exportResult.data, { headers });
  } catch (error) {
    logger.error('Tenant dışa aktarma hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu" },
      { status: 500 }
    );
  }
}

/**
 * Özel sorgu ile veri dışa aktarır
 * 
 * POST /api/export/tenant/[tenantId]
 * 
 * Örnek istek gövdesi:
 * {
 *   "format": "csv",
 *   "tableName": "users",
 *   "fields": ["id", "name", "email"],
 *   "filter": { "role": "student" },
 *   "sortBy": "name",
 *   "sortDirection": "asc",
 *   "limit": 100
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const requestBody = await request.json();
    
    // İstek parametrelerini al
    const {
      format = 'json',
      tableName,
      fields,
      filter,
      sortBy,
      sortDirection = 'asc',
      limit,
      query
    } = requestBody;
    
    // Format geçerliliğini kontrol et
    if (!VALID_FORMATS.includes(format)) {
      return NextResponse.json(
        { error: `Geçersiz format. Desteklenen formatlar: ${VALID_FORMATS.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Yetki kontrolü
    const authorized = await validateTenantAccess(tenantId, { requiredRole: 'admin' });
    if (!authorized) {
      return NextResponse.json(
        { error: "Bu tenant için dışa aktarma yetkiniz bulunmuyor" },
        { status: 403 }
      );
    }
    
    let exportResult;
    
    // Özel SQL sorgusu mu yoksa tablo dışa aktarımı mı?
    if (query) {
      // Özel sorgu dışa aktarımı
      exportResult = await exportQueryResults(tenantId, query, { format });
    } else if (tableName) {
      // Tablo dışa aktarımı
      exportResult = await exportTenantTable(tenantId, tableName, {
        format,
        fields,
        filterCondition: filter,
        sortBy,
        sortDirection: sortDirection as 'asc' | 'desc',
        limit
      });
    } else {
      return NextResponse.json(
        { error: "Tablo adı veya özel sorgu belirtilmelidir" },
        { status: 400 }
      );
    }
    
    if (!exportResult.success) {
      return NextResponse.json(
        { error: exportResult.error || "Dışa aktarma başarısız oldu" },
        { status: 500 }
      );
    }
    
    // Yanıt başlıklarını ayarla
    const headers: HeadersInit = {
      'Content-Disposition': `attachment; filename=${exportResult.filename}`,
    };
    
    // Format'a göre content type ayarla
    switch (format) {
      case 'json':
        headers['Content-Type'] = 'application/json';
        break;
      case 'csv':
        headers['Content-Type'] = 'text/csv';
        break;
      case 'excel':
        headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'sql':
        headers['Content-Type'] = 'application/sql';
        break;
    }
    
    // Başarılı yanıt döndür
    return new NextResponse(exportResult.data, { headers });
  } catch (error) {
    logger.error('Tenant dışa aktarma hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu" },
      { status: 500 }
    );
  }
} 