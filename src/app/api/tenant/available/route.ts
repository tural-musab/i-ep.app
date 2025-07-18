import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

// Tenant tipi
interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  plan_type: string;
  is_active: boolean;
  created_at: string;
}

// Last accessed tenant tipi
interface LastAccessedTenant {
  id: string;
  name: string;
  subdomain: string;
  planType: string;
  isActive: boolean;
  primaryDomain?: string;
}

/**
 * Kullanıcının erişebileceği tüm tenant'ları listeleyen API
 *
 * Bu API, oturum açmış kullanıcının erişim izni olan tüm tenant'ları,
 * son erişilen tenant'lar da dahil olmak üzere döndürür.
 * Super adminler için tüm aktif tenant'lar listelenir.
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

    // Kullanıcının erişim izni olan tenant'ları al
    let accessibleTenants: TenantData[] = [];

    if (isSuperAdmin) {
      // Super admin tüm active tenant'lara erişebilir
      const { data: allTenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, name, subdomain, plan_type, is_active, created_at')
        .eq('is_active', true)
        .order('name');

      if (tenantsError) {
        return NextResponse.json(
          { error: 'Tenant listesi alınamadı', details: tenantsError.message },
          { status: 500 }
        );
      }

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

      if (allowedTenants.length === 0) {
        // Hiç tenant erişimi yoksa boş liste döndür
        return NextResponse.json({ tenants: [], lastAccessed: [] });
      }

      // Kullanıcının erişim izni olan tenant'ların bilgilerini getir
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, name, subdomain, plan_type, is_active, created_at')
        .in('id', allowedTenants)
        .eq('is_active', true)
        .order('name');

      if (tenantsError) {
        return NextResponse.json(
          { error: 'Tenant listesi alınamadı', details: tenantsError.message },
          { status: 500 }
        );
      }

      accessibleTenants = tenants || [];
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

    // Son erişilen tenant'ların detaylarını getir
    const lastAccessedDetails: LastAccessedTenant[] = [];

    if (lastAccessedTenants.length > 0) {
      const { data: lastAccessed } = await supabase
        .from('tenants')
        .select('id, name, subdomain, plan_type, is_active')
        .in('id', lastAccessedTenants)
        .eq('is_active', true);

      // Son erişilenleri orijinal sırada tut
      if (lastAccessed && lastAccessed.length > 0) {
        lastAccessedTenants.forEach((tenantId: string) => {
          const tenant = lastAccessed.find((t) => t.id === tenantId);
          if (tenant) {
            lastAccessedDetails.push({
              id: tenant.id,
              name: tenant.name,
              subdomain: tenant.subdomain,
              planType: tenant.plan_type,
              isActive: tenant.is_active,
            });
          }
        });
      }
    }

    // Mevcut tenant'ın ID'sini al
    const currentTenantId = user.user_metadata?.tenant_id || user.user_metadata?.current_tenant;

    // Tüm erişilebilir tenant'ların primary domain'lerini al
    const primaryDomains: Record<string, string> = {};

    if (accessibleTenants.length > 0) {
      const tenantIds = accessibleTenants.map((t) => t.id);

      const { data: domainRecords } = await supabase
        .from('tenant_domains')
        .select('tenant_id, domain')
        .in('tenant_id', tenantIds)
        .eq('is_primary', true);

      if (domainRecords && domainRecords.length > 0) {
        domainRecords.forEach((record: { tenant_id: string; domain: string }) => {
          primaryDomains[record.tenant_id] = record.domain;
        });
      }
    }

    // Temiz veri formatına dönüştür
    const formattedTenants = accessibleTenants.map((tenant) => {
      // İlgili tenant için primary domain'i al veya varsayılan subdomain'i kullan
      const primaryDomain =
        primaryDomains[tenant.id] ||
        `${tenant.subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app'}`;

      return {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        planType: tenant.plan_type,
        isActive: tenant.is_active,
        createdAt: tenant.created_at,
        primaryDomain: primaryDomain,
        isCurrent: tenant.id === currentTenantId,
      };
    });

    // Son erişilen tenant'ların primary domain'lerini de ekle
    if (lastAccessedDetails.length > 0 && Object.keys(primaryDomains).length > 0) {
      lastAccessedDetails.forEach((tenant) => {
        if (primaryDomains[tenant.id]) {
          tenant.primaryDomain = primaryDomains[tenant.id];
        } else {
          tenant.primaryDomain = `${tenant.subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app'}`;
        }
      });
    }

    return NextResponse.json({
      tenants: formattedTenants,
      lastAccessed: lastAccessedDetails,
      currentTenantId,
      isSuperAdmin,
    });
  } catch (error) {
    console.error('Erişilebilir tenant listesi alınırken hata:', error);

    return NextResponse.json(
      {
        error: 'Tenant listesi alınırken bir hata oluştu',
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
