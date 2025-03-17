import { Tenant } from '@/types/tenant';
import { DomainService } from '../domain/domain-service';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getTenantSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase bağlantısı oluştur
 */
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Yeni tenant (okul) oluştur
 * @param name Okul adı
 * @param subdomain Subdomain
 * @param adminEmail Yönetici e-posta adresi
 * @param planType Plan türü
 * @returns Oluşturulan tenant
 */
export async function createTenant(
  name: string,
  subdomain: string,
  adminEmail: string,
  planType: 'free' | 'standard' | 'premium' = 'free'
): Promise<Tenant> {
  // 1. Tenant kaydı oluştur
  const { data: tenantData, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert({
      name,
      subdomain,
      plan_type: planType,
      settings: {
        allowParentRegistration: true,
        allowTeacherRegistration: true,
        languagePreference: 'tr',
        timeZone: 'Europe/Istanbul',
      },
      is_active: true,
    })
    .select()
    .single();

  if (tenantError) {
    throw new Error(`Tenant oluşturma hatası: ${tenantError.message}`);
  }

  const tenantId = tenantData.id;

  // 2. Tenant şeması oluştur
  const { error: schemaError } = await supabaseAdmin.rpc('create_tenant_schema', {
    tenant_id: tenantId,
  });

  if (schemaError) {
    // Schema oluşturma hatası durumunda tenant kaydını temizle
    await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    throw new Error(`Tenant şeması oluşturma hatası: ${schemaError.message}`);
  }

  // 3. Temel tabloları oluştur (SQL fonksiyonu içerisinde yapılacak)

  // 4. İlk admin kullanıcısını oluştur
  const tenantClient = getTenantSupabaseClient(tenantId);
  
  const { error: userError } = await tenantClient
    .from('users')
    .insert({
      email: adminEmail,
      full_name: 'Sistem Yöneticisi',
      role: 'admin',
    });

  if (userError) {
    throw new Error(`Admin kullanıcı oluşturma hatası: ${userError.message}`);
  }

  // Tenant nesnesini oluştur ve döndür
  return {
    id: tenantId,
    name,
    subdomain,
    planType,
    createdAt: new Date(tenantData.created_at),
    settings: tenantData.settings as TenantSettings,
    isActive: tenantData.is_active,
  };
}

/**
 * Tenant bilgilerini ID'ye göre getirir
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  try {
    // Demo verileri
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
    
    // Gerçek uygulamada Supabase'den sorgu
    // const supabase = createSupabaseClient();
    // const { data, error } = await supabase
    //   .from('tenants')
    //   .select('*')
    //   .eq('id', tenantId)
    //   .single();
    
    // if (error || !data) {
    //   console.error('Tenant ID arama hatası:', error);
    //   return null;
    // }
    
    // return {
    //   id: data.id,
    //   name: data.name,
    //   subdomain: data.subdomain,
    //   planType: data.plan_type,
    //   createdAt: new Date(data.created_at),
    //   settings: data.settings,
    //   isActive: data.is_active
    // };
    
    return null; // Demo dışında henüz tenant desteklenmiyor
  } catch (error) {
    console.error('Tenant servisi hatası:', error);
    return null;
  }
}

/**
 * Tenant bilgilerini subdomain'e göre getirir
 */
export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  try {
    // Demo verileri (gerçek uygulamada Supabase'den gelecek)
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
    
    // Gerçek uygulamada Supabase'den sorgu
    // const supabase = createSupabaseClient();
    // const { data, error } = await supabase
    //   .from('tenants')
    //   .select('*')
    //   .eq('subdomain', subdomain)
    //   .single();
    
    // if (error || !data) {
    //   console.error('Tenant arama hatası:', error);
    //   return null;
    // }
    
    // return {
    //   id: data.id,
    //   name: data.name,
    //   subdomain: data.subdomain,
    //   planType: data.plan_type,
    //   createdAt: new Date(data.created_at),
    //   settings: data.settings,
    //   isActive: data.is_active
    // };
    
    return null; // Demo dışında henüz tenant desteklenmiyor
  } catch (error) {
    console.error('Tenant servisi hatası:', error);
    return null;
  }
}

/**
 * Tenant ayarlarını günceller
 */
export async function updateTenantSettings(
  tenantId: string,
  settings: Partial<TenantSettings>
): Promise<TenantSettings> {
  // Önce mevcut ayarları al
  const tenant = await getTenantById(tenantId);
  
  if (!tenant) {
    throw new Error('Tenant bulunamadı');
  }
  
  // Yeni ayarları mevcut ayarlarla birleştir
  const updatedSettings = { ...tenant.settings, ...settings };
  
  // Ayarları güncelle
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .update({ settings: updatedSettings })
    .eq('id', tenantId)
    .select('settings')
    .single();
    
  if (error) {
    throw new Error(`Tenant ayarları güncelleme hatası: ${error.message}`);
  }
  
  return data.settings as TenantSettings;
}

/**
 * Tenant'ı askıya alır veya aktifleştirir
 */
export async function setTenantActiveStatus(
  tenantId: string, 
  isActive: boolean
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('tenants')
    .update({ is_active: isActive })
    .eq('id', tenantId);
    
  if (error) {
    throw new Error(`Tenant durumu güncelleme hatası: ${error.message}`);
  }
}

/**
 * Tenant kullanım metriklerini kaydeder
 */
export async function recordTenantUsageMetric(
  tenantId: string,
  metricName: string,
  metricValue: number
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('tenant_usage_metrics')
    .insert({
      tenant_id: tenantId,
      metric_name: metricName,
      metric_value: metricValue,
    });
    
  if (error) {
    throw new Error(`Tenant kullanım metriği kaydetme hatası: ${error.message}`);
  }
}

/**
 * Tenant güncelle
 * @param tenantId Tenant ID
 * @param data Güncellenecek veriler
 * @returns İşlem başarısı
 */
export async function updateTenant(
  tenantId: string,
  data: Partial<Omit<Tenant, 'id' | 'createdAt'>>
): Promise<boolean> {
  try {
    // Subdomain değişiyorsa formatını kontrol et
    if (data.subdomain) {
      data.subdomain = data.subdomain.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
      
      // Veritabanında aynı subdomain ile başka tenant var mı kontrol et
      /*
      const { data: existingTenant, error: checkError } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('subdomain', data.subdomain)
        .neq('id', tenantId)
        .single();
      
      if (existingTenant) {
        throw new Error(`Bu subdomain zaten kullanılıyor: ${data.subdomain}`);
      }
      */
    }
    
    // Veritabanında tenant'ı güncelle
    /*
    const { error } = await supabaseAdmin
      .from('tenants')
      .update({
        name: data.name,
        subdomain: data.subdomain,
        plan_type: data.planType,
        settings: data.settings,
        is_active: data.isActive
      })
      .eq('id', tenantId);
    
    if (error) {
      throw new Error(`Tenant güncelleme hatası: ${error.message}`);
    }
    */
    
    // Subdomain değişiyorsa, domain servisini güncelle
    if (data.subdomain && process.env.ENABLE_DOMAIN_MANAGEMENT === 'true') {
      // Eski subdomain'i al
      /*
      const { data: oldTenant, error: fetchError } = await supabaseAdmin
        .from('tenants')
        .select('subdomain')
        .eq('id', tenantId)
        .single();
      
      if (fetchError || !oldTenant) {
        throw new Error(`Tenant bilgisi alınamadı: ${fetchError?.message}`);
      }
      */
      const oldSubdomain = 'old-subdomain'; // Gerçek uygulamada veritabanından alınacak
      
      // Eski subdomain ile yeni subdomain farklıysa
      if (oldSubdomain !== data.subdomain) {
        const domainService = new DomainService();
        
        // Eski domain kaydını sil (domainId burada bilinmediği için önce veritabanından alınmalı)
        // Demo için burada doğrudan CloudflareDomainManager'daki removeSubdomain fonksiyonu değil,
        // DomainService'teki removeDomain fonksiyonu kullanılmalıdır
        
        // Eski subdomain için domain ID'yi al ve sil
        // Gerçek uygulamada bu kod, subdomain'e karşılık gelen domain kaydını bulup ID'sini alacak
        const oldDomainId = 'old-domain-id';
        await domainService.removeDomain(oldDomainId);
        
        // Yeni subdomain oluştur
        const newTenant: Tenant = {
          id: tenantId,
          name: 'Tenant Name', // Bu demo için, gerçek uygulamada veritabanından alınacak
          subdomain: data.subdomain,
          planType: 'free', // Bu demo için, gerçek uygulamada veritabanından alınacak
          createdAt: new Date(),
          settings: {
            allowParentRegistration: true,
            allowTeacherRegistration: true,
            languagePreference: 'tr',
            timeZone: 'Europe/Istanbul'
          },
          isActive: true
        };
        
        const subdomainCreated = await domainService.createSubdomain(newTenant);
        
        if (!subdomainCreated) {
          console.error(`Tenant için yeni subdomain oluşturulamadı: ${tenantId}`);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Tenant güncelleme hatası:', error);
    return false;
  }
}

/**
 * Tüm tenant'ları listele
 */
export async function getAllTenants(): Promise<Tenant[]> {
  try {
    // Demo verileri
    return [
      {
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
      }
    ];
    
    // Gerçek uygulamada Supabase'den sorgu
    // const supabase = createSupabaseClient();
    // const { data, error } = await supabase
    //   .from('tenants')
    //   .select('*')
    //   .eq('is_active', true);
    
    // if (error || !data) {
    //   console.error('Tenant listesi hatası:', error);
    //   return [];
    // }
    
    // return data.map(item => ({
    //   id: item.id,
    //   name: item.name,
    //   subdomain: item.subdomain,
    //   planType: item.plan_type,
    //   createdAt: new Date(item.created_at),
    //   settings: item.settings,
    //   isActive: item.is_active
    // }));
  } catch (error) {
    console.error('Tenant servisi hatası:', error);
    return [];
  }
}

/**
 * Yeni tenant oluştur
 */
export async function createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt'>): Promise<Tenant | null> {
  try {
    // Gerçek uygulamada Supabase'e kayıt
    // const supabase = createSupabaseClient();
    // const { data, error } = await supabase
    //   .from('tenants')
    //   .insert({
    //     name: tenantData.name,
    //     subdomain: tenantData.subdomain,
    //     plan_type: tenantData.planType,
    //     settings: tenantData.settings,
    //     is_active: tenantData.isActive
    //   })
    //   .single();
    
    // if (error || !data) {
    //   console.error('Tenant oluşturma hatası:', error);
    //   return null;
    // }
    
    // return {
    //   id: data.id,
    //   name: data.name,
    //   subdomain: data.subdomain,
    //   planType: data.plan_type,
    //   createdAt: new Date(data.created_at),
    //   settings: data.settings,
    //   isActive: data.is_active
    // };
    
    // Demo yanıtı
    return {
      id: 'new-tenant-id',
      name: tenantData.name,
      subdomain: tenantData.subdomain,
      planType: tenantData.planType,
      createdAt: new Date(),
      settings: tenantData.settings,
      isActive: tenantData.isActive
    };
  } catch (error) {
    console.error('Tenant oluşturma hatası:', error);
    return null;
  }
}

/**
 * Tenant bilgilerini güncelle
 */
export async function updateTenant(tenantId: string, tenantData: Partial<Tenant>): Promise<Tenant | null> {
  try {
    // Demo yanıtı
    if (tenantId === 'demo-tenant-id') {
      return {
        id: 'demo-tenant-id',
        name: tenantData.name || 'Demo Okul',
        subdomain: 'demo',
        planType: tenantData.planType || 'premium',
        createdAt: new Date(),
        settings: tenantData.settings || {
          allowParentRegistration: true,
          allowTeacherRegistration: true,
          languagePreference: 'tr',
          timeZone: 'Europe/Istanbul',
          primaryColor: '#4a86e8',
          secondaryColor: '#ff9900'
        },
        isActive: tenantData.isActive !== undefined ? tenantData.isActive : true
      };
    }
    
    // Gerçek uygulamada Supabase'e güncelleme
    // const updateData: any = {};
    // if (tenantData.name) updateData.name = tenantData.name;
    // if (tenantData.planType) updateData.plan_type = tenantData.planType;
    // if (tenantData.settings) updateData.settings = tenantData.settings;
    // if (tenantData.isActive !== undefined) updateData.is_active = tenantData.isActive;
    
    // const supabase = createSupabaseClient();
    // const { data, error } = await supabase
    //   .from('tenants')
    //   .update(updateData)
    //   .eq('id', tenantId)
    //   .single();
    
    // if (error || !data) {
    //   console.error('Tenant güncelleme hatası:', error);
    //   return null;
    // }
    
    return null; // Demo dışında henüz tenant desteklenmiyor
  } catch (error) {
    console.error('Tenant güncelleme hatası:', error);
    return null;
  }
} 