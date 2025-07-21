/**
 * Tenant domain çözümleme kütüphanesi
 *
 * Bu kütüphane, domain adresinden tenant bilgilerini çıkarır ve middleware için kullanılır.
 * Referans: docs/architecture/multi-tenant-strategy.md, docs/domain-management.md
 */

import { createServerSupabaseClient } from '../supabase/server';

/**
 * Tenant bilgisi
 */
export interface TenantInfo {
  id: string;
  name?: string;
  domain: string;
  isPrimary: boolean;
  isCustomDomain: boolean;
}

/**
 * Domain bilgisinden tenant ID'sini çözer
 * @param domain Domain adresi
 * @returns Tenant bilgisi veya null
 */
export async function resolveTenantFromDomain(domain: string): Promise<TenantInfo | null> {
  try {
    // Development environment için fallback tenant
    if (
      process.env.NODE_ENV === 'development' &&
      (domain === 'localhost:3000' || domain === 'localhost' || domain === '127.0.0.1:3000')
    ) {
      return {
        id: 'demo-tenant-id',
        name: 'Demo Tenant',
        domain: domain,
        isPrimary: true,
        isCustomDomain: false,
      };
    }

    // Subdomain kontrolü
    const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app';
    if (domain.endsWith(`.${BASE_DOMAIN}`)) {
      const subdomain = domain.replace(`.${BASE_DOMAIN}`, '');
      return await getTenantBySubdomain(subdomain);
    }

    // Özel domain kontrolü - tenant_domains tablosundan sorgula
    return await getTenantByCustomDomain(domain);
  } catch (error) {
    console.error('Tenant tespit hatası:', error);

    // Development için fallback
    if (process.env.NODE_ENV === 'development') {
      return {
        id: 'demo-tenant-id',
        name: 'Demo Tenant',
        domain: domain,
        isPrimary: true,
        isCustomDomain: false,
      };
    }

    return null;
  }
}

/**
 * Subdomain'e göre tenant bilgisini getirir
 * @param subdomain Tenant subdomain'i
 * @returns Tenant bilgisi veya null
 */
async function getTenantBySubdomain(subdomain: string): Promise<TenantInfo | null> {
  try {
    if (!subdomain || subdomain === 'www') {
      return null;
    }

    // Supabase istemcisi
    const supabase = createServerSupabaseClient();

    // Tenants tablosundan tenant bilgilerini al
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('subdomain', subdomain)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.warn(`Subdomain için tenant bulunamadı: ${subdomain}`, error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      domain: `${subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app'}`,
      isPrimary: true, // Subdomain her zaman primer kabul edilir
      isCustomDomain: false,
    };
  } catch (error) {
    console.error('Subdomain tenant tespit hatası:', error);
    return null;
  }
}

/**
 * Özel domain'e göre tenant bilgisini getirir
 * @param domain Özel domain adresi
 * @returns Tenant bilgisi veya null
 */
async function getTenantByCustomDomain(domain: string): Promise<TenantInfo | null> {
  try {
    if (!domain) {
      return null;
    }

    // Supabase istemcisi
    const supabase = createServerSupabaseClient();

    // tenant_domains tablosundan domain bilgilerini al
    const { data, error } = await supabase
      .from('tenant_domains')
      .select('id, tenant_id, domain, is_primary, is_verified, tenants(id, name)')
      .eq('domain', domain)
      .eq('is_verified', true) // Sadece doğrulanmış domainler
      .eq('type', 'custom')
      .single();

    if (error || !data || !data.tenants) {
      console.warn(`Özel domain için tenant bulunamadı: ${domain}`, error);
      return null;
    }

    return {
      id: data.tenant_id,
      name: (data.tenants as any).name,
      domain: domain,
      isPrimary: data.is_primary,
      isCustomDomain: true,
    };
  } catch (error) {
    console.error('Özel domain tenant tespit hatası:', error);
    return null;
  }
}
