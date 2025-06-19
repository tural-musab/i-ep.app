import { Tenant } from '@/types/tenant';
import * as tenantService from './tenant-service';
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Domain veya subdomain ile tenant bilgilerini getir
 */
export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  try {
    const supabase = createServerSupabaseClient();
    const subdomain = extractTenantFromSubdomain(domain);
    
    if (!subdomain) return null;
    
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', subdomain)
      .single();
      
    if (error || !data) {
      // Özel domain kontrolü
      const { data: customDomainData, error: customDomainError } = await supabase
        .from('tenant_domains')
        .select('tenant_id, tenants(*)')
        .eq('domain', domain)
        .single();
        
      if (customDomainError || !customDomainData || !customDomainData.tenants) {
        return null;
      }
      
      // Database'den gelen veriyi Tenant tipine dönüştür
      const tenantData = customDomainData.tenants as any;
      return {
        id: tenantData.id,
        name: tenantData.name,
        subdomain: tenantData.subdomain,
        planType: tenantData.plan_type as 'free' | 'standard' | 'premium',
        createdAt: new Date(tenantData.created_at),
        settings: tenantData.settings || {
          allowParentRegistration: true,
          allowTeacherRegistration: true,
          languagePreference: 'tr',
          timeZone: 'Europe/Istanbul'
        },
        isActive: tenantData.is_active
      };
    }
    
    // Database'den gelen veriyi Tenant tipine dönüştür
    return {
      id: data.id,
      name: data.name,
      subdomain: data.subdomain,
      planType: data.plan_type as 'free' | 'standard' | 'premium',
      createdAt: new Date(data.created_at),
      settings: data.settings || {
        allowParentRegistration: true,
        allowTeacherRegistration: true,
        languagePreference: 'tr',
        timeZone: 'Europe/Istanbul'
      },
      isActive: data.is_active
    };
  } catch (error) {
    console.error('getTenantByDomain error:', error);
    return null;
  }
}

/**
 * Subdomain ile tenant bilgilerini getir
 */
export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  // Gerçek uygulamada Supabase'den veritabanı sorgusu yapılacak
  // Bu şimdilik demo amaçlı
  
  if (subdomain === 'demo') {
    return {
      id: 'demo-tenant-id',
      name: 'Demo Okul',
      subdomain: 'demo',
      planType: 'premium',
      createdAt: new Date(),
      settings: {
        allowParentRegistration: true,
        allowTeacherRegistration: true,
        languagePreference: 'tr',
        timeZone: 'Europe/Istanbul',
        primaryColor: '#4a86e8',
        secondaryColor: '#ff9900'
      },
      isActive: true
    };
  }
  
  return null;
}

/**
 * Tenant ID ile tenant bilgilerini getir
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  // Gerçek uygulamada Supabase'den veritabanı sorgusu yapılacak
  // Bu şimdilik demo amaçlı
  
  if (tenantId === 'demo-tenant-id') {
    return {
      id: 'demo-tenant-id',
      name: 'Demo Okul',
      subdomain: 'demo',
      planType: 'premium',
      createdAt: new Date(),
      settings: {
        allowParentRegistration: true,
        allowTeacherRegistration: true,
        languagePreference: 'tr',
        timeZone: 'Europe/Istanbul',
        primaryColor: '#4a86e8',
        secondaryColor: '#ff9900'
      },
      isActive: true
    };
  }
  
  return null;
}

/**
 * Mevcut tenant ID'sini al. Client veya server tarafında çalışır.
 */
export async function getTenantId(req?: NextRequest): Promise<string | null> {
  try {
    // Client-side tenant ID kontrolü
    if (typeof window !== 'undefined') {
      // Local storage'dan tenant ID'sini al
      const storedTenantId = localStorage.getItem('tenantId');
      if (storedTenantId) return storedTenantId;
      
      // Subdomain'den tenant ID'sini oluştur
      const hostname = window.location.hostname;
      const subdomain = extractTenantFromSubdomain(hostname);
      
      if (subdomain === 'demo') {
        return 'tenant_demo_id';
      } else if (subdomain) {
        return `tenant_${subdomain}`;
      }
      return null;
    } 
    // Server-side tenant ID kontrolü - Edge API uyumlu
    else if (req) {
      const tenantIdCookie = req.cookies.get('tenant-id')?.value;
      
      if (tenantIdCookie) {
        return tenantIdCookie;
      }
      
      const subdomainCookie = req.cookies.get('subdomain')?.value;
      if (subdomainCookie) {
        if (subdomainCookie === 'demo') {
          return 'tenant_demo_id';
        } else {
          return `tenant_${subdomainCookie}`;
        }
      }
      
      const hostname = req.headers.get('host') || '';
      const subdomain = extractTenantFromSubdomain(hostname);
      
      if (subdomain === 'demo') {
        return 'tenant_demo_id';
      } else if (subdomain) {
        return `tenant_${subdomain}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('getTenantId error:', error);
    return null;
  }
}

/**
 * Tenant'ın belirli bir özelliğinin etkin olup olmadığını kontrol et
 */
export function isFeatureEnabled(tenant: Tenant, featureName: string): boolean {
  // Bu basit implementasyon, gerçek uygulamada
  // tenant tipine göre özellik kontrolü yapacak
  
  // Premium planın tüm özelliklere erişimi var
  if (tenant.planType === 'premium') return true;
  
  // Standart planda bazı özellikler var
  if (tenant.planType === 'standard') {
    return !['advanced_analytics', 'custom_branding', 'api_access'].includes(featureName);
  }
  
  // Ücretsiz planda temel özellikler var
  return ['basic_dashboard', 'student_management', 'simple_grading'].includes(featureName);
}

/**
 * Alt alan adından tenant ID'sini ayıklar
 */
export function extractTenantFromSubdomain(host: string): string | null {
  // 'okul1.i-ep.app' gibi bir alan adından 'okul1' kısmını çıkar
  const mainDomain = process.env.NEXT_PUBLIC_DOMAIN || 'i-ep.app';
  
  if (!host.includes(mainDomain)) {
    return null;
  }
  
  // Alt alan adını çıkar
  const subdomain = host
    .replace(`.${mainDomain}`, '')
    .replace(`https://`, '')
    .replace(`http://`, '');
  
  return subdomain;
}

/**
 * HTTP isteğinden mevcut tenant bilgilerini al
 */
export async function getCurrentTenant(req?: NextRequest): Promise<Tenant | null> {
  try {
    // API Routes veya Edge functions için
    if (req) {
      const hostname = req.headers.get('host') || '';
      return await getTenantByDomain(hostname);
    } 
    // Client-side için
    else if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return await getTenantByDomain(hostname);
    }
    // Middleware veya default davranış
    else {
      return null;
    }
  } catch (error) {
    console.error('getCurrentTenant error:', error);
    return null;
  }
}

/**
 * Tenant'a özgü bir URL oluşturur
 */
export function createTenantUrl(subdomain: string, path: string = '/'): string {
  const mainDomain = process.env.NEXT_PUBLIC_DOMAIN || 'i-ep.app';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  
  return `${protocol}://${subdomain}.${mainDomain}${path}`;
}

/**
 * Belirtilen URL'in hangi tenant'a ait olduğunu tespit eder
 */
export function detectTenantFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    return extractTenantFromSubdomain(parsedUrl.hostname);
  } catch (error) {
    console.error('URL parse hatası:', error);
    return null;
  }
} 