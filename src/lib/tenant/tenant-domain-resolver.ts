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
    // Extract domain from BASE_URL
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://i-ep.app';
    const BASE_DOMAIN = new URL(BASE_URL).hostname;
    if (domain.endsWith(`.${BASE_DOMAIN}`)) {
      const subdomain = domain.replace(`.${BASE_DOMAIN}`, '');
      return await getTenantBySubdomain(subdomain);
    }

    // Custom domain check - query from tenant_domains table
    return await getTenantByCustomDomain(domain);
  } catch (error) {
    console.error('Tenant resolution error:', error);

    // Development fallback
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

    // Production environment için staging subdomain fallback
    if (subdomain === 'staging') {
      return {
        id: 'staging-tenant-id',
        name: 'Staging Environment',
        domain: `staging.${new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://i-ep.app').hostname}`,
        isPrimary: true,
        isCustomDomain: false,
      };
    }

    // Supabase istemcisi - production'da hata durumunda fallback
    try {
      const supabase = createServerSupabaseClient();

      // Get tenant info from tenants table
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('subdomain', subdomain)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.warn(`No tenant found for subdomain: ${subdomain}`, error);
        // Return fallback tenant for known subdomains
        return createFallbackTenant(subdomain);
      }

      return {
        id: data.id,
        name: data.name,
        domain: `${subdomain}.${new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://i-ep.app').hostname}`,
        isPrimary: true, // Subdomain is always considered primary
        isCustomDomain: false,
      };
    } catch (supabaseError) {
      console.error('Supabase connection failed in getTenantBySubdomain:', supabaseError);
      // Return fallback tenant when Supabase is unavailable
      return createFallbackTenant(subdomain);
    }
  } catch (error) {
    console.error('Subdomain tenant resolution error:', error);
    return createFallbackTenant(subdomain);
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

    // Supabase istemcisi - production'da hata durumunda fallback
    try {
      const supabase = createServerSupabaseClient();

      // Get domain info from tenant_domains table
      const { data, error } = await supabase
        .from('tenant_domains')
        .select('id, tenant_id, domain, is_primary, is_verified, tenants(id, name)')
        .eq('domain', domain)
        .eq('is_verified', true) // Only verified domains
        .eq('type', 'custom')
        .single();

      if (error || !data || !data.tenants) {
        console.warn(`No tenant found for custom domain: ${domain}`, error);
        return null;
      }

      return {
        id: data.tenant_id,
        name: (data.tenants as any).name,
        domain: domain,
        isPrimary: data.is_primary,
        isCustomDomain: true,
      };
    } catch (supabaseError) {
      console.error('Supabase connection failed in getTenantByCustomDomain:', supabaseError);
      // Return null for custom domains when Supabase is unavailable
      return null;
    }
  } catch (error) {
    console.error('Custom domain tenant resolution error:', error);
    return null;
  }
}

/**
 * Creates a fallback tenant for known subdomains when database is unavailable
 * @param subdomain The subdomain to create fallback for
 * @returns Fallback tenant info or null
 */
function createFallbackTenant(subdomain: string): TenantInfo | null {
  // Known staging/development subdomains
  const knownSubdomains = ['staging', 'dev', 'test', 'demo'];
  
  if (knownSubdomains.includes(subdomain)) {
    return {
      id: `${subdomain}-fallback-tenant-id`,
      name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Environment`,
      domain: `${subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app'}`,
      isPrimary: true,
      isCustomDomain: false,
    };
  }
  
  // For unknown subdomains, return null to trigger redirect
  return null;
}
