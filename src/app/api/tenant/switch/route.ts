import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

/**
 * Kullanıcının tenant'ını değiştiren API
 *
 * Bu API yalnızca oturum açmış ve hedef tenant'a erişim izni olan kullanıcılar tarafından kullanılabilir.
 * Super adminler tüm tenant'lara erişebilirken, diğer kullanıcılar yalnızca izin verilen tenant'lara erişebilir.
 */
export async function POST(request: Request) {
  try {
    // Supabase istemcisi oluştur
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // İstek gövdesini al
    const { targetTenantId } = await request.json();

    if (!targetTenantId) {
      return NextResponse.json({ error: 'Geçerli bir tenant ID belirtilmelidir' }, { status: 400 });
    }

    // Kullanıcı oturumunu kontrol et
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Oturum açılmamış' }, { status: 401 });
    }

    const { user } = session;

    // Kullanıcının tenant erişim izni var mı kontrol et
    const isSuperAdmin = user.app_metadata?.role === 'super_admin';

    // Super admin değilse erişim izni kontrol et
    if (!isSuperAdmin) {
      // Kullanıcının izin verilen tenant'larını kontrol et
      const allowedTenants = user.user_metadata?.allowed_tenants || [];
      const parsedAllowedTenants =
        typeof allowedTenants === 'string'
          ? JSON.parse(allowedTenants)
          : Array.isArray(allowedTenants)
            ? allowedTenants
            : [];

      const canAccessTenant =
        parsedAllowedTenants.includes(targetTenantId) ||
        user.user_metadata?.primary_tenant_id === targetTenantId;

      if (!canAccessTenant) {
        return NextResponse.json({ error: "Bu tenant'a erişim yetkiniz yok" }, { status: 403 });
      }
    }

    // Tenant bilgilerini kontrol et
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, subdomain, plan_type, is_active')
      .eq('id', targetTenantId)
      .single();

    if (tenantError || !tenantData) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 });
    }

    // Tenant aktif değilse erişime izin verme
    if (!tenantData.is_active) {
      return NextResponse.json({ error: 'Bu tenant şu anda aktif değil' }, { status: 403 });
    }

    // Tenant'ın primary domain'ini al
    const { data: primaryDomainData } = await supabase
      .from('tenant_domains')
      .select('domain')
      .eq('tenant_id', targetTenantId)
      .eq('is_primary', true)
      .single();

    // Primary domain veya varsayılan subdomain'i kullan
    const primaryDomain =
      primaryDomainData?.domain ||
      `${tenantData.subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app'}`;

    // Son erişilen tenant'ları tut (maksimum 5)
    let lastAccessedTenants = user.user_metadata?.last_accessed_tenants || [];
    if (typeof lastAccessedTenants === 'string') {
      try {
        lastAccessedTenants = JSON.parse(lastAccessedTenants);
      } catch {
        lastAccessedTenants = [];
      }
    }

    if (!Array.isArray(lastAccessedTenants)) {
      lastAccessedTenants = [];
    }

    // Şu anki tenant'ı listeye ekle (eğer zaten yoksa)
    if (!lastAccessedTenants.includes(targetTenantId)) {
      lastAccessedTenants.unshift(targetTenantId);
      // Maksimum 5 tenant tut
      if (lastAccessedTenants.length > 5) {
        lastAccessedTenants = lastAccessedTenants.slice(0, 5);
      }
    } else {
      // Zaten listede varsa, en başa taşı
      lastAccessedTenants = [
        targetTenantId,
        ...lastAccessedTenants.filter((id: string) => id !== targetTenantId),
      ];
    }

    // Kullanıcı metadatasını güncelle
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        tenant_id: targetTenantId,
        tenant_name: tenantData.name,
        current_tenant: targetTenantId,
        last_tenant_access: new Date().toISOString(),
        last_accessed_tenants: lastAccessedTenants,
      },
    });

    if (updateError) {
      return NextResponse.json(
        { error: 'Kullanıcı metadata güncellenirken hata oluştu', details: updateError.message },
        { status: 500 }
      );
    }

    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      tenant: {
        id: tenantData.id,
        name: tenantData.name,
        subdomain: tenantData.subdomain,
        planType: tenantData.plan_type,
        primaryDomain: primaryDomain,
      },
    });
  } catch (error: unknown) {
    console.error('Tenant değiştirme hatası:', error);

    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: 'Tenant değiştirme işlemi sırasında bir hata oluştu', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS isteklerini kabul et (CORS için)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
