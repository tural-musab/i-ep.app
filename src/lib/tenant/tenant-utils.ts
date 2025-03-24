import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { TenantSettings, Tenant } from '@/types/tenant';

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
        
      if (customDomainError || !customDomainData) {
        return null;
      }
      
      const settings = customDomainData.tenants.settings as Record<string, unknown>;
      return {
        id: customDomainData.tenants.id,
        name: customDomainData.tenants.name,
        subdomain: customDomainData.tenants.subdomain,
        planType: customDomainData.tenants.plan_type as 'free' | 'standard' | 'premium',
        createdAt: new Date(customDomainData.tenants.created_at),
        settings: {
          allowParentRegistration: settings?.allowParentRegistration as boolean ?? false,
          allowTeacherRegistration: settings?.allowTeacherRegistration as boolean ?? false,
          languagePreference: settings?.languagePreference as 'tr' | 'en' ?? 'tr',
          timeZone: settings?.timeZone as string ?? 'Europe/Istanbul',
          primaryColor: settings?.primaryColor as string,
          secondaryColor: settings?.secondaryColor as string,
          logoUrl: settings?.logoUrl as string,
          favIconUrl: settings?.favIconUrl as string,
          customCss: settings?.customCss as string,
          smsProvider: settings?.smsProvider as 'netgsm' | 'twilio' | 'none',
          emailProvider: settings?.emailProvider as 'smtp' | 'aws' | 'none',
          notificationSettings: settings?.notificationSettings as TenantSettings['notificationSettings']
        },
        isActive: customDomainData.tenants.is_active
      };
    }
    
    const settings = data.settings as Record<string, unknown>;
    return {
      id: data.id,
      name: data.name,
      subdomain: data.subdomain,
      planType: data.plan_type as 'free' | 'standard' | 'premium',
      createdAt: new Date(data.created_at),
      settings: {
        allowParentRegistration: settings?.allowParentRegistration as boolean ?? false,
        allowTeacherRegistration: settings?.allowTeacherRegistration as boolean ?? false,
        languagePreference: settings?.languagePreference as 'tr' | 'en' ?? 'tr',
        timeZone: settings?.timeZone as string ?? 'Europe/Istanbul',
        primaryColor: settings?.primaryColor as string,
        secondaryColor: settings?.secondaryColor as string,
        logoUrl: settings?.logoUrl as string,
        favIconUrl: settings?.favIconUrl as string,
        customCss: settings?.customCss as string,
        smsProvider: settings?.smsProvider as 'netgsm' | 'twilio' | 'none',
        emailProvider: settings?.emailProvider as 'smtp' | 'aws' | 'none',
        notificationSettings: settings?.notificationSettings as TenantSettings['notificationSettings']
      },
      isActive: data.is_active
    };
  } catch (error) {
    console.error('getTenantByDomain error:', error);
    return null;
  }
}

export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  const supabase = createServerSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', subdomain)
      .single();
      
    if (error || !data) return null;
    
    const settings = data.settings as Record<string, unknown>;
    return {
      id: data.id,
      name: data.name,
      subdomain: data.subdomain,
      planType: data.plan_type as 'free' | 'standard' | 'premium',
      createdAt: new Date(data.created_at),
      settings: {
        allowParentRegistration: settings?.allowParentRegistration as boolean ?? false,
        allowTeacherRegistration: settings?.allowTeacherRegistration as boolean ?? false,
        languagePreference: settings?.languagePreference as 'tr' | 'en' ?? 'tr',
        timeZone: settings?.timeZone as string ?? 'Europe/Istanbul',
        primaryColor: settings?.primaryColor as string,
        secondaryColor: settings?.secondaryColor as string,
        logoUrl: settings?.logoUrl as string,
        favIconUrl: settings?.favIconUrl as string,
        customCss: settings?.customCss as string,
        smsProvider: settings?.smsProvider as 'netgsm' | 'twilio' | 'none',
        emailProvider: settings?.emailProvider as 'smtp' | 'aws' | 'none',
        notificationSettings: settings?.notificationSettings as TenantSettings['notificationSettings']
      },
      isActive: data.is_active
    };
  } catch (error) {
    console.error('getTenantBySubdomain error:', error);
    return null;
  }
}

export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const supabase = createServerSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
      
    if (error || !data) return null;
    
    const settings = data.settings as Record<string, unknown>;
    return {
      id: data.id,
      name: data.name,
      subdomain: data.subdomain,
      planType: data.plan_type as 'free' | 'standard' | 'premium',
      createdAt: new Date(data.created_at),
      settings: {
        allowParentRegistration: settings?.allowParentRegistration as boolean ?? false,
        allowTeacherRegistration: settings?.allowTeacherRegistration as boolean ?? false,
        languagePreference: settings?.languagePreference as 'tr' | 'en' ?? 'tr',
        timeZone: settings?.timeZone as string ?? 'Europe/Istanbul',
        primaryColor: settings?.primaryColor as string,
        secondaryColor: settings?.secondaryColor as string,
        logoUrl: settings?.logoUrl as string,
        favIconUrl: settings?.favIconUrl as string,
        customCss: settings?.customCss as string,
        smsProvider: settings?.smsProvider as 'netgsm' | 'twilio' | 'none',
        emailProvider: settings?.emailProvider as 'smtp' | 'aws' | 'none',
        notificationSettings: settings?.notificationSettings as TenantSettings['notificationSettings']
      },
      isActive: data.is_active
    };
  } catch (error) {
    console.error('getTenantById error:', error);
    return null;
  }
}

export function getTenantId(req?: NextRequest): string | null {
  try {
    if (typeof window !== 'undefined') {
      // Client-side
      const storedTenantId = localStorage.getItem('tenant-id');
      if (storedTenantId) return storedTenantId;
      
      const hostname = window.location.hostname;
      return extractTenantFromSubdomain(hostname);
    }
    
    // Server-side
    if (!req) return null;
    
    const tenantId = req.cookies.get('tenant-id')?.value;
    if (tenantId) return tenantId;
    
    const hostname = req.headers.get('host') || '';
    return extractTenantFromSubdomain(hostname);
  } catch (error) {
    console.error('getTenantId error:', error);
    return null;
  }
}

export function isFeatureEnabled(tenant: Tenant, featureName: string): boolean {
  if (tenant.planType === 'premium') return true;
  
  if (tenant.planType === 'standard') {
    return !['advanced_analytics', 'custom_branding', 'api_access'].includes(featureName);
  }
  
  return ['basic_dashboard', 'student_management', 'simple_grading'].includes(featureName);
}

export function extractTenantFromSubdomain(domain: string): string | null {
  if (!domain) return null;
  
  const parts = domain.split('.');
  if (parts.length < 2) return null;
  
  if (domain.includes('localhost')) {
    return 'tenant_local_id';
  }
  
  return parts[0];
}

export async function getCurrentTenant(req?: NextRequest): Promise<Tenant | null> {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return null;
    
    return await getTenantById(tenantId);
  } catch (error) {
    console.error('getCurrentTenant error:', error);
    return null;
  }
}

export function createTenantUrl(subdomain: string, path: string = '/'): string {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'i-ep.app';
  return `https://${subdomain}.${domain}${path}`;
}

export function detectTenantFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return extractTenantFromSubdomain(urlObj.hostname);
  } catch (error) {
    console.error('detectTenantFromUrl error:', error);
    return null;
  }
} 