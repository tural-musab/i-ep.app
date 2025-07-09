/**
 * İlişkisel Kayıt Yönetim Sistemi (İLKYS) API
 * 
 * Bu API, modüler yapıda ilişkisel verilerin CRUD işlemlerini gerçekleştirir.
 * Multi-tenant izolasyonu ve yetkilendirme kontrolleri otomatik olarak uygulanır.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AuditLogService, AuditLogType } from '@/lib/audit/audit-log';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { TenantError, TenantIsolationError } from '@/lib/errors/tenant-errors';

// İzin verilen entity'ler
const ALLOWED_ENTITIES = [
  'students',
  'teachers',
  'classes',
  'courses',
  'lessons',
  'attendance',
  'grades',
  'exams',
  'homework',
  'announcements',
  'events',
  'documents',
  'reports'
];

// Entity/permission ilişkisi
const PERMISSION_MAP: Record<string, string> = {
  'students': 'student',
  'teachers': 'teacher',
  'classes': 'class',
  'courses': 'course',
  'lessons': 'lesson',
  'attendance': 'attendance',
  'grades': 'grade',
  'exams': 'exam',
  'homework': 'homework',
  'announcements': 'announcement',
  'events': 'event',
  'documents': 'document',
  'reports': 'report'
};

/**
 * Tenant izolasyonu ve yetkilendirme kontrolü
 */
async function verifyRequest(
  req: NextRequest, 
  entity: string, 
  action: 'read' | 'create' | 'update' | 'delete'
): Promise<{
  tenantId: string;
  entityTable: string;
  userId?: string;
  error?: NextResponse;
}> {
  try {
    // İzin verilen entity kontrolü
    if (!ALLOWED_ENTITIES.includes(entity)) {
      return {
        tenantId: '',
        entityTable: '',
        error: NextResponse.json(
          { error: `Geçersiz entity: ${entity}` },
          { status: 400 }
        )
      };
    }
    
    // Tenant ID'yi al
    const tenantId = getTenantId();
    if (!tenantId) {
      return {
        tenantId: '',
        entityTable: '',
        error: NextResponse.json(
          { error: 'Tenant bilgisi bulunamadı' },
          { status: 400 }
        )
      };
    }
    
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return {
        tenantId,
        entityTable: '',
        error: NextResponse.json(
          { error: 'Yetkilendirme hatası: Oturum gereklidir' },
          { status: 401 }
        )
      };
    }
    
    // Kullanıcı tenant erişim kontrolü
    const userId = session.user.id;
    const supabase = createServerSupabaseClient();
    
    const { data: userData, error: userError } = await supabase
      .from('tenant_users')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .single();
    
    if (userError || !userData) {
      return {
        tenantId,
        entityTable: '',
        error: NextResponse.json(
          { error: 'Bu tenant için yetkiniz yok' },
          { status: 403 }
        )
      };
    }
    
    // Yetki kontrolü
    const permissionBase = PERMISSION_MAP[entity] || entity;
    const requiredPermission = `${permissionBase}.${action}`;
    
    // Admin rolü tüm izinlere sahiptir
    if (userData.role !== 'admin') {
      // İzin kontrolü yapılacak (role_permissions tablosundan)
      const { data: permissions, error: permError } = await supabase
        .from('role_permissions')
        .select('permission')
        .eq('tenant_id', tenantId)
        .eq('role', userData.role);
      
      if (permError || !permissions) {
        return {
          tenantId,
          entityTable: '',
          error: NextResponse.json(
            { error: 'İzin sorgulama hatası' },
            { status: 500 }
          )
        };
      }
      
      const hasPermission = permissions.some(p => 
        p.permission === requiredPermission || 
        p.permission === `${permissionBase}.*` || 
        p.permission === '*'
      );
      
      if (!hasPermission) {
        // Yetkisiz erişim logla 
        await AuditLogService.logFromRequest(
          req,
          AuditLogType.API_ERROR,
          tenantId,
          'api',
          entity,
          `İzin hatası: ${userData.role} rolü ${requiredPermission} iznine sahip değil`,
          null,
          null,
          { requiredPermission }
        );
        
        return {
          tenantId,
          entityTable: '',
          error: NextResponse.json(
            { error: `Bu işlem için yetkiniz yok: ${requiredPermission}` },
            { status: 403 }
          )
        };
      }
    }
    
    // Entity tablosunu tenant şemasına göre oluştur
    const entityTable = `tenant_${tenantId}.${entity}`;
    
    return { tenantId, entityTable, userId };
  } catch (error) {
    console.error('İstek doğrulama hatası:', error);
    
    if (error instanceof TenantError) {
      return {
        tenantId: '',
        entityTable: '',
        error: NextResponse.json(
          { error: error.message, code: error.code },
          { status: 400 }
        )
      };
    }
    
    return {
      tenantId: '',
      entityTable: '',
      error: NextResponse.json(
        { error: 'Doğrulama hatası' },
        { status: 500 }
      )
    };
  }
}

/**
 * Entity listesi döndür
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;
  const url = new URL(req.url);
  
  // İzolasyon kontrolü
  const { tenantId, entityTable, userId, error } = await verifyRequest(req, entity, 'read');
  if (error) return error;
  
  try {
    const supabase = createServerSupabaseClient();
    
    // Query parametrelerini al
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const orderBy = url.searchParams.get('orderBy') || 'created_at';
    const orderDir = (url.searchParams.get('orderDir') || 'desc') as 'asc' | 'desc';
    
    // Filtreleme için değerleri dinamik olarak al
    const filters: Record<string, string> = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (!['limit', 'offset', 'orderBy', 'orderDir', 'expand'].includes(key)) {
        filters[key] = value;
      }
    }
    
    // İlişkisel verileri genişletme (expand)
    const expand = url.searchParams.get('expand')?.split(',') || [];
    
    // Temel sorgu
    let query = supabase
      .from(entityTable)
      .select(expand.length > 0 ? `*, ${expand.join(', ')}` : '*')
      .order(orderBy, { ascending: orderDir === 'asc' })
      .range(offset, offset + limit - 1);
    
    // Filtreleri uygula
    Object.entries(filters).forEach(([key, value]) => {
      // Operatörleri işle: eq, gt, lt, gte, lte, in, like
      if (key.includes('[')) {
        const [field, operator] = key.split('[');
        const op = operator.replace(']', '');
        
        switch (op) {
          case 'eq':
            query = query.eq(field, value);
            break;
          case 'neq':
            query = query.neq(field, value);
            break;
          case 'gt':
            query = query.gt(field, value);
            break;
          case 'gte':
            query = query.gte(field, value);
            break;
          case 'lt':
            query = query.lt(field, value);
            break;
          case 'lte':
            query = query.lte(field, value);
            break;
          case 'like':
            query = query.like(field, `%${value}%`);
            break;
          case 'ilike':
            query = query.ilike(field, `%${value}%`);
            break;
          case 'in':
            query = query.in(field, value.split(','));
            break;
        }
      } else {
        // Basit eşitlik
        query = query.eq(key, value);
      }
    });
    
    // Sorguyu çalıştır
    const { data, error: queryError, count } = await query.count('exact');
    
    if (queryError) {
      console.error(`${entity} sorgu hatası:`, queryError);
      return NextResponse.json(
        { error: queryError.message },
        { status: 500 }
      );
    }
    
    // Başarılı istek logla
    await AuditLogService.logFromRequest(
      req,
      AuditLogType.API_ACCESS,
      tenantId,
      entity,
      'list',
      `${entity} listesini getirdi`,
      null,
      null,
      { 
        filters, 
        limit, 
        offset,
        count
      }
    );
    
    return NextResponse.json({
      data,
      meta: {
        total: count,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error(`${entity} listeleme hatası:`, error);
    
    // Hatayı logla
    await AuditLogService.logFromRequest(
      req,
      AuditLogType.API_ERROR,
      tenantId || 'unknown',
      entity,
      'list',
      `${entity} listeleme hatası: ${(error as Error).message}`,
      null,
      null,
      { error: (error as Error).stack }
    );
    
    return NextResponse.json(
      { error: 'Veri sorgulama hatası' },
      { status: 500 }
    );
  }
}

/**
 * Yeni kayıt oluştur
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;
  
  // İzolasyon kontrolü
  const { tenantId, entityTable, userId, error } = await verifyRequest(req, entity, 'create');
  if (error) return error;
  
  try {
    // JSON verilerini al
    const data = await req.json();
    
    // Temel metadata ekle
    const enrichedData = {
      ...data,
      tenant_id: tenantId,
      created_by: userId,
      updated_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Kayıt oluştur
    const supabase = createServerSupabaseClient();
    const { data: insertedData, error: insertError } = await supabase
      .from(entityTable)
      .insert(enrichedData)
      .select()
      .single();
    
    if (insertError) {
      console.error(`${entity} oluşturma hatası:`, insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }
    
    // Başarılı işlemi logla
    await AuditLogService.logFromRequest(
      req,
      AuditLogType.API_ACCESS,
      tenantId,
      entity,
      insertedData.id || 'new',
      `Yeni ${entity} kaydı oluşturuldu`,
      null,
      insertedData,
      { entityTable }
    );
    
    return NextResponse.json(insertedData, { status: 201 });
  } catch (error) {
    console.error(`${entity} oluşturma hatası:`, error);
    
    // Hatayı logla
    await AuditLogService.logFromRequest(
      req,
      AuditLogType.API_ERROR,
      tenantId || 'unknown',
      entity,
      'create',
      `${entity} oluşturma hatası: ${(error as Error).message}`,
      null,
      null,
      { error: (error as Error).stack }
    );
    
    return NextResponse.json(
      { error: 'Kayıt oluşturma hatası' },
      { status: 500 }
    );
  }
}

/**
 * Toplu kayıt değişiklikleri
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { entity: string } }
) {
  const entity = params.entity;
  
  // İzolasyon kontrolü
  const { tenantId, entityTable, userId, error } = await verifyRequest(req, entity, 'update');
  if (error) return error;
  
  try {
    // JSON verilerini al
    const { filter, data } = await req.json();
    
    if (!filter || Object.keys(filter).length === 0) {
      return NextResponse.json(
        { error: 'Filtreleme kriterleri gereklidir' },
        { status: 400 }
      );
    }
    
    // Metadata ekle
    const updateData = {
      ...data,
      updated_by: userId,
      updated_at: new Date().toISOString()
    };
    
    // Öncelikle ilgili verileri getir (audit log için)
    const supabase = createServerSupabaseClient();
    
    let query = supabase.from(entityTable).select('*');
    
    // Filtreleri uygula
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value as string);
    });
    
    const { data: previousData, error: selectError } = await query;
    
    if (selectError) {
      console.error(`${entity} sorgulama hatası:`, selectError);
      return NextResponse.json(
        { error: selectError.message },
        { status: 500 }
      );
    }
    
    // Güncelleme sorgusu oluştur
    let updateQuery = supabase.from(entityTable).update(updateData);
    
    // Filtreleri uygula
    Object.entries(filter).forEach(([key, value]) => {
      updateQuery = updateQuery.eq(key, value as string);
    });
    
    // Güncellemeyi gerçekleştir
    const { data: updatedData, error: updateError } = await updateQuery.select();
    
    if (updateError) {
      console.error(`${entity} güncelleme hatası:`, updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }
    
    // Başarılı işlemi logla
    await AuditLogService.logFromRequest(
      req,
      AuditLogType.API_ACCESS,
      tenantId,
      entity,
      'batch-update',
      `${updatedData.length} adet ${entity} kaydı güncellendi`,
      previousData,
      updatedData,
      { filter, entityTable }
    );
    
    return NextResponse.json({
      updated: updatedData.length,
      data: updatedData
    });
  } catch (error) {
    console.error(`${entity} toplu güncelleme hatası:`, error);
    
    // Hatayı logla
    await AuditLogService.logFromRequest(
      req,
      AuditLogType.API_ERROR,
      tenantId || 'unknown',
      entity,
      'batch-update',
      `${entity} toplu güncelleme hatası: ${(error as Error).message}`,
      null,
      null,
      { error: (error as Error).stack }
    );
    
    return NextResponse.json(
      { error: 'Kayıt güncelleme hatası' },
      { status: 500 }
    );
  }
}

/**
 * Toplu silme işlemi
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;
  
  // İzolasyon kontrolü
  const { tenantId, entityTable, userId, error } = await verifyRequest(req, entity, 'delete');
  if (error) return error;
  
  try {
    // JSON verilerini al
    const { filter } = await req.json();
    
    if (!filter || Object.keys(filter).length === 0) {
      return NextResponse.json(
        { error: 'Filtreleme kriterleri gereklidir' },
        { status: 400 }
      );
    }
    
    // Öncelikle ilgili verileri getir (audit log için)
    const supabase = createServerSupabaseClient();
    
    let query = supabase.from(entityTable).select('*');
    
    // Filtreleri uygula
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value as string);
    });
    
    const { data: previousData, error: selectError } = await query;
    
    if (selectError) {
      console.error(`${entity} sorgulama hatası:`, selectError);
      return NextResponse.json(
        { error: selectError.message },
        { status: 500 }
      );
    }
    
    // Silme sorgusu oluştur
    let deleteQuery = supabase.from(entityTable).delete();
    
    // Filtreleri uygula
    Object.entries(filter).forEach(([key, value]) => {
      deleteQuery = deleteQuery.eq(key, value as string);
    });
    
    // Silme işlemini gerçekleştir
    const { data: deletedData, error: deleteError } = await deleteQuery.select();
    
    if (deleteError) {
      console.error(`${entity} silme hatası:`, deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      );
    }
    
    // Başarılı işlemi logla
    await AuditLogService.logFromRequest(
      req,
      AuditLogType.API_ACCESS,
      tenantId,
      entity,
      'batch-delete',
      `${previousData.length} adet ${entity} kaydı silindi`,
      previousData,
      null,
      { filter, entityTable }
    );
    
    return NextResponse.json({
      deleted: previousData.length
    });
  } catch (error) {
    console.error(`${entity} toplu silme hatası:`, error);
    
    // Hatayı logla
    await AuditLogService.logFromRequest(
      req,
      AuditLogType.API_ERROR,
      tenantId || 'unknown',
      entity,
      'batch-delete',
      `${entity} toplu silme hatası: ${(error as Error).message}`,
      null,
      null,
      { error: (error as Error).stack }
    );
    
    return NextResponse.json(
      { error: 'Kayıt silme hatası' },
      { status: 500 }
    );
  }
} 