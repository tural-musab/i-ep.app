import { NextRequest, NextResponse } from 'next/server';
import { exportTenantTable, exportFullTenant, exportUserDataForGDPR, ExportOptions, ExportFormat, ExportResult } from '@/lib/export/tenant-export';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * @swagger
 * /api/export:
 *   post:
 *     summary: Tenant verilerini dışa aktarır
 *     description: Belirtilen formatta ve türde tenant verilerini dışa aktarır
 *     tags:
 *       - Export
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exportType
 *               - format
 *             properties:
 *               exportType:
 *                 type: string
 *                 enum: ['table', 'full', 'user']
 *                 description: Dışa aktarma türü
 *               format:
 *                 type: string
 *                 enum: ['json', 'csv', 'excel']
 *                 description: Dışa aktarma formatı
 *               tableName:
 *                 type: string
 *                 description: Dışa aktarılacak tablo adı (exportType=table ise zorunlu)
 *               userId:
 *                 type: string
 *                 description: Dışa aktarılacak kullanıcı ID (exportType=user ise zorunlu)
 *               includeRelations:
 *                 type: boolean
 *                 description: İlişkili verilerin dahil edilip edilmeyeceği
 *               anonymizePersonalData:
 *                 type: boolean
 *                 description: Kişisel verilerin anonimleştirilip anonimleştirilmeyeceği
 *               maxRecords:
 *                 type: number
 *                 description: Maksimum kayıt sayısı
 *     responses:
 *       200:
 *         description: Dışa aktarma başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 filename:
 *                   type: string
 *                 format:
 *                   type: string
 *                 recordCount:
 *                   type: number
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Kimlik doğrulama hatası
 *       403:
 *         description: Yetkisiz erişim
 */
export async function POST(request: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmalısınız' },
        { status: 401 }
      );
    }
    
    // Kullanıcı yetki kontrolü (sadece admin ve manager rollerine izin ver)
    if (!['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }
    
    // Tenant ID al - getTenantId async fonksiyon
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID bulunamadı' },
        { status: 400 }
      );
    }
    
    // İstek gövdesini ayrıştır
    const body = await request.json();
    const { 
      exportType, 
      format, 
      tableName, 
      userId,
      includeRelations,
      anonymizePersonalData,
      maxRecords
    } = body;
    
    // Zorunlu alanların kontrolü
    if (!exportType || !format) {
      return NextResponse.json(
        { error: 'exportType ve format alanları zorunludur' },
        { status: 400 }
      );
    }
    
    // Format geçerliliği kontrolü
    const validFormats: ExportFormat[] = ['json', 'csv', 'excel'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: 'Desteklenmeyen format. Desteklenen formatlar: json, csv, excel' },
        { status: 400 }
      );
    }
    
    // Export tipine göre ek alan kontrolü
    if (exportType === 'table' && !tableName) {
      return NextResponse.json(
        { error: 'tableName alanı zorunludur' },
        { status: 400 }
      );
    }
    
    if (exportType === 'user' && !userId) {
      return NextResponse.json(
        { error: 'userId alanı zorunludur' },
        { status: 400 }
      );
    }
    
    // Export ayarlarını hazırla
    const exportOptions: ExportOptions = {
      format: format as ExportFormat,
      includeRelations,
      anonymizePersonalData,
      maxRecords
    };
    
    let result: ExportResult;
    
    // Export tipine göre ilgili fonksiyonu çağır
    switch (exportType) {
      case 'table':
        result = await exportTenantTable(tenantId, tableName, exportOptions);
        break;
        
      case 'full':
        result = await exportFullTenant(tenantId, exportOptions);
        break;
        
      case 'user':
        result = await exportUserDataForGDPR(userId, tenantId, format as ExportFormat);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Geçersiz export tipi. Desteklenen tipler: table, full, user' },
          { status: 400 }
        );
    }
    
    // Hata durumunu kontrol et
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Dışa aktarma sırasında bir hata oluştu' },
        { status: 500 }
      );
    }
    
    // Dışa aktarma formatına göre yanıt döndür
    const filename = `export_${result.tenantId}_${result.tables?.join('_') || 'data'}_${new Date().toISOString().split('T')[0]}.${format}`;
    
    switch (format) {
      case 'json':
      case 'csv':
        // JSON veya CSV doğrudan indirilebilir veri döndür
        const headers = new Headers();
        headers.append('Content-Disposition', `attachment; filename=${filename}`);
        headers.append('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
        
        return new NextResponse(JSON.stringify(result.data), {
          status: 200,
          headers
        });
        
      case 'excel':
        // Excel için binary veri döndür
        const excelHeaders = new Headers();
        excelHeaders.append('Content-Disposition', `attachment; filename=${filename}`);
        excelHeaders.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        return new NextResponse(JSON.stringify(result.data), {
          status: 200,
          headers: excelHeaders
        });
        
      default:
        return NextResponse.json({
          success: true,
          filename: filename,
          format: result.format,
          recordCount: result.recordCount,
          downloadLink: `/api/download/export/${filename}`
        });
    }
    
  } catch (error: any) {
    console.error('Export API hatası:', error);
    return NextResponse.json(
      { error: error.message || 'İşlem sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/export:
 *   get:
 *     summary: Dışa aktarma seçeneklerini listeler
 *     description: Desteklenen dışa aktarma formatlarını ve tiplerini listeler
 *     tags:
 *       - Export
 *     responses:
 *       200:
 *         description: Dışa aktarma seçenekleri listesi
 */
export async function GET() {
  return NextResponse.json({
    availableFormats: ['json', 'csv', 'excel', 'sql'],
    exportTypes: [
      { 
        id: 'table', 
        name: 'Tablo Dışa Aktarma', 
        description: 'Tek bir tabloyu dışa aktarır',
        requiredFields: ['tableName']
      },
      { 
        id: 'full', 
        name: 'Tenant Tam Dışa Aktarma', 
        description: 'Tenant\'a ait tüm tabloları dışa aktarır'
      },
      { 
        id: 'user', 
        name: 'Kullanıcı Veri Dışa Aktarma (KVKK)', 
        description: 'KVKK veri taşınabilirlik hakkı için kullanıcı verilerini dışa aktarır',
        requiredFields: ['userId']
      }
    ],
    options: {
      includeMetadata: 'Meta verileri dahil et',
      filterCondition: 'Filtreleme koşulu',
      sortBy: 'Sıralama alanı',
      sortDirection: 'Sıralama yönü (asc/desc)',
      limit: 'Maksimum kayıt sayısı',
      includeDeletedRecords: 'Silinmiş kayıtları dahil et'
    }
  });
} 