/**
 * Server-side render süreçlerinde mevcut tenant bilgilerine erişim
 * Referans: docs/architecture/multi-tenant-strategy.md
 */

import { headers } from 'next/headers';
import { TenantInfo } from './tenant-domain-resolver';
import { createServerSupabaseClient } from '../supabase/server';

/**
 * Server tarafında çalışan bileşenler ve API route'ları için 
 * current tenant bilgisini header'lardan alır.
 * 
 * @returns Mevcut tenant bilgisi veya null
 */
export async function getCurrentTenant(): Promise<TenantInfo | null> {
  try {
    const headersList = headers();
    
    // Header'lardan tenant bilgilerini al
    const tenantId = headersList.get('x-tenant-id');
    const tenantHostname = headersList.get('x-tenant-hostname');
    const tenantName = headersList.get('x-tenant-name');
    const isPrimary = headersList.get('x-tenant-primary') === 'true';
    const isCustomDomain = headersList.get('x-tenant-custom-domain') === 'true';
    
    if (!tenantId || !tenantHostname) {
      return null;
    }
    
    // Temel tenant bilgisi
    const tenant: TenantInfo = {
      id: tenantId,
      name: tenantName || undefined,
      domain: tenantHostname,
      isPrimary: isPrimary,
      isCustomDomain: isCustomDomain
    };
    
    // Eğer tenant adı belirtilmemişse, veritabanından al
    if (!tenant.name) {
      const supabase = createServerSupabaseClient();
      const { data } = await supabase
        .from('tenants')
        .select('name')
        .eq('id', tenantId)
        .single();
        
      if (data) {
        tenant.name = data.name;
      }
    }
    
    return tenant;
  } catch (error) {
    console.error('Tenant bilgisi alınamadı:', error);
    return null;
  }
}

/**
 * Tenant domain bilgisini oluşturur
 * 
 * @param subdomain Tenant subdomain
 * @returns Tam domain adresi
 */
export function buildTenantDomain(subdomain: string): string {
  const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app';
  return `${subdomain}.${BASE_DOMAIN}`;
}

/**
 * Tenant için tam URL oluşturur
 * 
 * @param subdomain Tenant subdomain
 * @param path URL yolu (opsiyonel)
 * @returns Tam URL
 */
export function buildTenantUrl(subdomain: string, path = '/'): string {
  const domain = buildTenantDomain(subdomain);
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  return `${protocol}://${domain}${path.startsWith('/') ? path : `/${path}`}`;
} 