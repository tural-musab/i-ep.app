import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

/**
 * Kullanıcının mevcut tenant bilgilerini getiren API
 *
 * Bu API, oturum açmış kullanıcının mevcut tenant bilgilerini ve
 * erişim izni olan diğer tenant'ları döndürür.
 */
export async function GET() {
  try {
    // Supabase istemcisi oluştur
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Kullanıcı oturumunu kontrol et
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Oturum açılmamış' }, { status: 401 });
    }

    const { user } = session;
    const isSuperAdmin = user.app_metadata?.role === 'super_admin';

    // Kullanıcının mevcut tenant bilgisini al
    const currentTenantId = user.user_metadata?.tenant_id || user.user_metadata?.current_tenant;

    if (!currentTenantId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir tenant'a atanmamış" },
        { status: 404 }
      );
    }

    // Tenant bilgilerini getir
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, subdomain, plan_type, is_active, created_at, updated_at')
      .eq('id', currentTenantId)
      .single();

    if (tenantError || !tenantData) {
      return NextResponse.json({ error: 'Tenant bilgileri bulunamadı' }, { status: 404 });
    }

    // Tenant'ın primary domain bilgisini al
    const { data: primaryDomainData } = await supabase
      .from('tenant_domains')
      .select('domain')
      .eq('tenant_id', currentTenantId)
      .eq('is_primary', true)
      .single();

    const primaryDomain =
      primaryDomainData?.domain ||
      `${tenantData.subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app'}`;

    // Tenant aktif değilse uyarı ekle
    const tenantWarnings = [];
    if (!tenantData.is_active) {
      tenantWarnings.push('Bu tenant şu anda aktif değil');
    }

    // Kullanıcının erişim izni olan tenant'ları al
    let accessibleTenants: Array<{ id: string; name: string; subdomain: string }> = [];

    if (isSuperAdmin) {
      // Super admin tüm active tenant'lara erişebilir
      const { data: allTenants } = await supabase
        .from('tenants')
        .select('id, name, subdomain')
        .eq('is_active', true);

      accessibleTenants = allTenants || [];
    } else {
      // Kullanıcının izin verilen tenant'larını kontrol et
      let allowedTenants = user.user_metadata?.allowed_tenants || [];
      if (typeof allowedTenants === 'string') {
        try {
          allowedTenants = JSON.parse(allowedTenants);
        } catch {
          allowedTenants = [];
        }
      }

      if (!Array.isArray(allowedTenants)) {
        allowedTenants = [];
      }

      // Birincil tenant'ı da listeye ekle (eğer zaten yoksa)
      const primaryTenantId = user.user_metadata?.primary_tenant_id;
      if (primaryTenantId && !allowedTenants.includes(primaryTenantId)) {
        allowedTenants.push(primaryTenantId);
      }

      // Boş liste kontrolü
      if (allowedTenants.length > 0) {
        // Kullanıcının erişim izni olan tenant'ların bilgilerini getir
        const { data: tenants } = await supabase
          .from('tenants')
          .select('id, name, subdomain')
          .in('id', allowedTenants)
          .eq('is_active', true);

        accessibleTenants = tenants || [];
      }
    }

    // Son erişilen tenant'ları al
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

    // Yanıt verilerini hazırla
    return NextResponse.json({
      currentTenant: {
        id: tenantData.id,
        name: tenantData.name,
        subdomain: tenantData.subdomain,
        planType: tenantData.plan_type,
        isActive: tenantData.is_active,
        primaryDomain: primaryDomain,
        createdAt: tenantData.created_at,
        updatedAt: tenantData.updated_at,
      },
      accessibleTenants,
      lastAccessedTenants,
      warnings: tenantWarnings,
      isSuperAdmin,
    });
  } catch (error) {
    console.error('Tenant bilgileri alınırken hata:', error);

    return NextResponse.json(
      {
        error: 'Tenant bilgileri alınırken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
