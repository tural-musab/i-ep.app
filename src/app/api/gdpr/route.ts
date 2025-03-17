/**
 * Maarif Okul Portalı - GDPR/KVKK Veri Silme API
 * 
 * Bu API, kullanıcıların GDPR (Genel Veri Koruma Yönetmeliği) ve KVKK (Kişisel Verilerin Korunması Kanunu)
 * kapsamında veri silme haklarını kullanabilmelerini sağlar.
 * 
 * Desteklenen işlemler:
 * - Kullanıcı verilerini tamamen silme (hard delete)
 * - Kullanıcı verilerini geçici olarak silme (soft delete)
 * - Kullanıcı verilerini anonimleştirme
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { deleteUserData, DeletionOptions } from '@/lib/gdpr/data-deletion';
import { getLogger } from '@/lib/utils/logger';
import { getCurrentTenant } from '@/lib/tenant/tenant-utils';

// Logger
const logger = getLogger('gdpr-api');

/**
 * POST /api/gdpr
 * 
 * Kullanıcı verilerini GDPR/KVKK uyumlu şekilde siler
 */
export async function POST(request: NextRequest) {
  try {
    // İstek gövdesini al
    const body = await request.json();
    
    // Gerekli alanları kontrol et
    if (!body.userId || !body.tenantId || !body.type) {
      return NextResponse.json(
        { error: 'Eksik parametreler: userId, tenantId ve type alanları zorunludur' },
        { status: 400 }
      );
    }
    
    // Yetkilendirme kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Yetkilendirme başarısız: Bearer token gerekli' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Yetkilendirme başarısız: Geçersiz token' },
        { status: 401 }
      );
    }
    
    // Tenant kontrolü
    const tenant = await getCurrentTenant(request);
    if (!tenant || tenant.id !== body.tenantId) {
      return NextResponse.json(
        { error: 'Yetkilendirme başarısız: Tenant erişim hatası' },
        { status: 403 }
      );
    }
    
    // Kullanıcı kendisi için mi istek yapıyor yoksa admin mi?
    const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'superadmin';
    const isSelfRequest = user.id === body.userId;
    
    if (!isAdmin && !isSelfRequest) {
      return NextResponse.json(
        { error: 'Yetkilendirme başarısız: Başka bir kullanıcının verilerini silme yetkiniz yok' },
        { status: 403 }
      );
    }
    
    // Silme seçeneklerini hazırla
    const deletionOptions: DeletionOptions = {
      type: body.type,
      exportDataBeforeDeletion: body.exportDataBeforeDeletion || true,
      retentionPeriodDays: body.retentionPeriodDays || 30,
      notifyUser: body.notifyUser !== false,
      notifyAdmin: body.notifyAdmin !== false,
      reason: body.reason || (isSelfRequest ? 'Kullanıcı talebi' : 'Yönetici talebi')
    };
    
    // Silme işlemini gerçekleştir
    const result = await deleteUserData(body.userId, body.tenantId, deletionOptions);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Veri silme işlemi başarısız oldu' },
        { status: 500 }
      );
    }
    
    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      message: `Kullanıcı verileri başarıyla ${
        body.type === 'hard' ? 'silindi' : 
        body.type === 'soft' ? 'geçici olarak silindi' : 
        'anonimleştirildi'
      }`,
      result
    });
    
  } catch (error) {
    logger.error('GDPR veri silme API hatası:', error);
    
    return NextResponse.json(
      { 
        error: 'Veri silme işlemi sırasında bir hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gdpr
 * 
 * Kullanıcının veri silme isteklerini listeler
 */
export async function GET(request: NextRequest) {
  try {
    // URL parametrelerini al
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const tenantId = searchParams.get('tenantId');
    
    // Yetkilendirme kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Yetkilendirme başarısız: Bearer token gerekli' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Yetkilendirme başarısız: Geçersiz token' },
        { status: 401 }
      );
    }
    
    // Tenant kontrolü
    const tenant = await getCurrentTenant(request);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Yetkilendirme başarısız: Tenant erişim hatası' },
        { status: 403 }
      );
    }
    
    // Kullanıcı kendisi için mi istek yapıyor yoksa admin mi?
    const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'superadmin';
    const isSelfRequest = userId && user.id === userId;
    
    // Sorgu oluştur
    let query = supabaseAdmin
      .from('gdpr_deletion_requests')
      .select('*');
    
    // Tenant filtresini uygula
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    } else if (tenant) {
      query = query.eq('tenant_id', tenant.id);
    }
    
    // Kullanıcı filtresini uygula
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (!isAdmin) {
      // Admin değilse sadece kendi isteklerini görebilir
      query = query.eq('user_id', user.id);
    }
    
    // Sorguyu çalıştır
    const { data, error } = await query.order('requested_at', { ascending: false });
    
    if (error) {
      return NextResponse.json(
        { error: 'Veri silme istekleri alınırken bir hata oluştu' },
        { status: 500 }
      );
    }
    
    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      requests: data
    });
    
  } catch (error) {
    logger.error('GDPR veri silme istekleri listeleme hatası:', error);
    
    return NextResponse.json(
      { 
        error: 'Veri silme istekleri listelenirken bir hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 