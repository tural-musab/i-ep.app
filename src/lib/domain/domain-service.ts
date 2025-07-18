/**
 * Domain Yönetim Servisi
 *
 * Bu modül, Cloudflare Domain Manager'ı kullanarak domain yönetimi için servis katmanı sağlar.
 * Tenant oluşturma ve yönetme süreçlerine entegre edilebilir.
 */

// Vercel API ile domain yönetimini aktifleştir
process.env.USE_VERCEL_DOMAINS = 'true';

import {
  CloudflareDomainManager,
  DomainStatus,
  DomainVerificationResult,
} from './cloudflare-domain-manager';
import { VercelDomainManager } from './vercel-domain-manager';
import { createServerSupabaseClient } from '../supabase/server';
import { TenantDomainError } from '../errors/tenant-errors';
import { DomainProvider } from './types';
import {
  verifyDomainConfiguration,
  checkDNSConfiguration,
  checkSSLStatus,
} from './domain-verification';

export interface DomainRecord {
  id: string;
  tenant_id: string;
  domain: string;
  is_primary: boolean;
  is_verified: boolean;
  type: 'subdomain' | 'custom';
  created_at: string;
  verified_at?: string | null;
}

export interface VerificationDetails {
  dnsConfigured: boolean;
  sslActive: boolean;
  lastChecked: Date;
  message?: string;
}

/**
 * Domain servis sınıfı
 */
export class DomainService {
  private domainManager: DomainProvider;

  constructor() {
    // Vercel domain manager'ı kullan (Cloudflare için interface uyumluluğu sağlanmalı)
    console.log('Vercel Domain Manager aktif edildi');
    this.domainManager = new VercelDomainManager();
  }

  /**
   * Subdomain oluştur ve tenant'a ekle
   * Referans: docs/deployment/cloudflare-setup.md, Subdomain ve Tenant Yönetimi bölümü
   */
  async createSubdomain(tenantId: string, subdomain: string): Promise<DomainRecord> {
    console.log(`Tenant için subdomain oluşturuluyor: ${tenantId}, ${subdomain}`);

    // Subdomain formatını kontrol et
    const subdomainRegex = /^[a-z0-9][a-z0-9\-]{1,61}[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      throw new TenantDomainError(
        subdomain,
        'Subdomain yalnızca küçük harf, rakam ve tire içerebilir ve 2-63 karakter uzunluğunda olmalıdır.'
      );
    }

    // Yasaklı subdomain'leri kontrol et
    const reservedSubdomains = [
      'www',
      'api',
      'admin',
      'app',
      'auth',
      'billing',
      'dashboard',
      'docs',
      'support',
    ];
    if (reservedSubdomains.includes(subdomain)) {
      throw new TenantDomainError(
        subdomain,
        'Bu subdomain kullanılamaz çünkü sistem tarafından rezerve edilmiştir.'
      );
    }

    // Vercel aracılığıyla subdomain oluştur
    const success = await this.domainManager.createSubdomain({
      id: tenantId,
      subdomain: subdomain,
    });

    if (!success) {
      throw new TenantDomainError(
        subdomain,
        'Subdomain oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      );
    }

    // Veritabanına domain kaydını ekle
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app';
    const domain = await this.saveDomainRecord({
      tenant_id: tenantId,
      domain: `${subdomain}.${baseDomain}`,
      is_primary: true, // İlk subdomain primary olur
      is_verified: true, // Subdomain'ler otomatik olarak doğrulanır
      type: 'subdomain',
      verified_at: new Date().toISOString(),
    });

    console.log(`Subdomain başarıyla oluşturuldu: ${domain.domain}`);
    return domain;
  }

  /**
   * Özel domain ekle ve tenant'a bağla
   * Referans: docs/deployment/cloudflare-setup.md, Özel Domain Entegrasyonu bölümü
   */
  async addCustomDomain(
    tenantId: string,
    domain: string,
    isPrimary = false
  ): Promise<{
    domainRecord: DomainRecord;
    verificationInstructions: any;
  }> {
    console.log(`Tenant için özel domain ekleniyor: ${tenantId}, ${domain}`);

    // Domain formatını kontrol et
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
    if (!domainRegex.test(domain)) {
      throw new TenantDomainError(
        domain,
        'Geçersiz domain formatı. Domain yalnızca küçük harf, rakam, tire ve nokta içerebilir.'
      );
    }

    // Vercel aracılığıyla özel domain ekle
    const setupResult = await this.domainManager.setupCustomDomain({ id: tenantId }, domain);

    if (!setupResult.success) {
      throw new TenantDomainError(
        domain,
        setupResult.verificationDetails?.error || 'Özel domain eklenirken bir hata oluştu.'
      );
    }

    // Veritabanına domain kaydını ekle
    const domainRecord = await this.saveDomainRecord({
      tenant_id: tenantId,
      domain,
      is_primary: isPrimary,
      is_verified: false, // Kullanıcı DNS ayarlarını yapılandırmalı
      type: 'custom',
      verified_at: null,
    });

    console.log(`Özel domain başarıyla eklendi, doğrulama bekleniyor: ${domain}`);
    return {
      domainRecord,
      verificationInstructions: setupResult.verificationDetails,
    };
  }

  /**
   * Domain yapılandırmasını doğrula
   * Referans: docs/domain-management.md, Domain Doğrulama Süreci bölümü
   */
  async verifyDomain(domainId: string): Promise<VerificationDetails> {
    console.log(`Domain doğrulaması başlatılıyor: ${domainId}`);

    // Domain kaydını getir
    const domain = await this.getDomainById(domainId);

    if (!domain) {
      throw new TenantDomainError('unknown', 'Domain kaydı bulunamadı');
    }

    // Yapılandırmayı doğrula
    const verificationResult = await verifyDomainConfiguration(domain.domain);

    // Domain doğrulandıysa veritabanını güncelle
    if (verificationResult.verified && !domain.is_verified) {
      await this.updateDomainVerification(domainId, true, new Date().toISOString());
      console.log(`Domain başarıyla doğrulandı: ${domain.domain}`);
    }

    return {
      dnsConfigured: verificationResult.dnsConfigured,
      sslActive: verificationResult.sslActive,
      lastChecked: new Date(),
      message: verificationResult.message,
    };
  }

  /**
   * Domain sil
   * Referans: docs/api-endpoints.md, Domain Silme bölümü
   */
  async deleteDomain(domainId: string): Promise<boolean> {
    console.log(`Domain silme işlemi başlatılıyor: ${domainId}`);

    // Domain kaydını getir
    const domain = await this.getDomainById(domainId);

    if (!domain) {
      throw new TenantDomainError('unknown', 'Domain kaydı bulunamadı');
    }

    // Tenant'ın primary domain'i mi kontrol et
    if (domain.is_primary) {
      throw new TenantDomainError(
        domain.domain,
        "Primary domain silinemez. Önce başka bir domain'i primary olarak ayarlayın."
      );
    }

    // Domain tipine göre silme işlemi
    let deleted = false;

    if (domain.type === 'subdomain') {
      // Subdomain için basedomain'i çıkar
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app';
      const subdomain = domain.domain.replace(`.${baseDomain}`, '');

      deleted = await this.domainManager.removeSubdomain(domain.tenant_id, subdomain);
    } else {
      // Özel domain sil
      deleted = await this.domainManager.removeSubdomain(domain.tenant_id, domain.domain);
    }

    if (!deleted) {
      throw new TenantDomainError(domain.domain, 'Domain silinirken bir hata oluştu');
    }

    // Veritabanından sil
    await this.deleteDomainRecord(domainId);
    console.log(`Domain başarıyla silindi: ${domain.domain}`);

    return true;
  }

  /**
   * Domain listesi getir
   * Referans: docs/api-endpoints.md, Domain Listesi bölümü
   */
  async getDomains(filters?: {
    tenantId?: string;
    type?: 'subdomain' | 'custom';
    isVerified?: boolean;
  }): Promise<DomainRecord[]> {
    console.log('Domain listesi alınıyor, filtreler:', filters);

    const supabase = createServerSupabaseClient();
    let query = supabase.from('tenant_domains').select('*');

    // Filtreleri uygula
    if (filters?.tenantId) {
      query = query.eq('tenant_id', filters.tenantId);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.isVerified !== undefined) {
      query = query.eq('is_verified', filters.isVerified);
    }

    // Sıralama
    query = query
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Domain listesi alınırken hata:', error);
      throw error;
    }

    // Tip dönüşümü yaparak DomainRecord olarak döndür
    return (data || []).map((item: any) => ({
      ...item,
      type: item.type as 'subdomain' | 'custom',
    }));
  }

  /**
   * Tenant'a ait tüm domainleri getir
   */
  async getDomainsByTenantId(tenantId: string): Promise<DomainRecord[]> {
    return this.getDomains({ tenantId });
  }

  /**
   * Primary domain'i değiştir
   * Referans: docs/api-endpoints.md, Primary Domain Ayarlama bölümü
   */
  async setPrimaryDomain(domainId: string, tenantId: string): Promise<boolean> {
    console.log(`Primary domain ayarlanıyor: ${domainId} for tenant ${tenantId}`);

    const supabase = createServerSupabaseClient();

    // Domain doğrulanmış mı kontrol et
    const domain = await this.getDomainById(domainId);

    if (!domain) {
      throw new TenantDomainError('unknown', 'Domain kaydı bulunamadı');
    }

    if (!domain.is_verified) {
      throw new TenantDomainError(
        domain.domain,
        "Doğrulanmamış bir domain'i primary olarak ayarlayamazsınız."
      );
    }

    if (domain.tenant_id !== tenantId) {
      throw new TenantDomainError(domain.domain, "Bu domain belirtilen tenant'a ait değil.");
    }

    // Önce tüm domainleri non-primary yap
    const { error: updateError } = await supabase
      .from('tenant_domains')
      .update({ is_primary: false })
      .eq('tenant_id', tenantId);

    if (updateError) {
      console.error('Domainler güncellenirken hata:', updateError);
      throw updateError;
    }

    // Seçilen domain'i primary yap
    const { error: primaryError } = await supabase
      .from('tenant_domains')
      .update({ is_primary: true })
      .eq('id', domainId)
      .eq('tenant_id', tenantId);

    if (primaryError) {
      console.error('Primary domain ayarlanırken hata:', primaryError);
      throw primaryError;
    }

    console.log(`Primary domain başarıyla ayarlandı: ${domain.domain}`);
    return true;
  }

  /**
   * SSL durumunu kontrol et
   * Referans: docs/api-endpoints.md, SSL Durum Kontrolü bölümü
   */
  async checkSSLStatus(domainId: string): Promise<{
    domain: string;
    sslActive: boolean;
    details?: any;
  }> {
    // Domain kaydını getir
    const domain = await this.getDomainById(domainId);

    if (!domain) {
      throw new TenantDomainError('unknown', 'Domain kaydı bulunamadı');
    }

    // SSL durumunu kontrol et
    const sslResult = await checkSSLStatus(domain.domain);

    return {
      domain: domain.domain,
      sslActive: sslResult.active,
      details: sslResult.details,
    };
  }

  // Private yardımcı metodlar

  /**
   * Domain kaydı oluştur
   */
  private async saveDomainRecord(domainData: {
    tenant_id: string;
    domain: string;
    is_primary: boolean;
    is_verified: boolean;
    type: 'subdomain' | 'custom';
    verified_at: string | null;
  }): Promise<DomainRecord> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('tenant_domains')
      .insert({
        ...domainData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Domain kaydı oluşturulurken hata:', error);
      throw error;
    }

    return data as DomainRecord;
  }

  /**
   * Domain kaydını ID'ye göre getir
   */
  async getDomainById(domainId: string): Promise<DomainRecord | null> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('tenant_domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Domain kaydı alınırken hata:', error);
      throw error;
    }

    return data as DomainRecord;
  }

  /**
   * Domain doğrulama durumunu güncelle
   */
  private async updateDomainVerification(
    domainId: string,
    isVerified: boolean,
    verifiedAt?: string
  ): Promise<void> {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('tenant_domains')
      .update({
        is_verified: isVerified,
        verified_at: verifiedAt,
      })
      .eq('id', domainId);

    if (error) {
      console.error('Domain doğrulama durumu güncellenirken hata:', error);
      throw error;
    }
  }

  /**
   * Domain kaydını sil
   */
  private async deleteDomainRecord(domainId: string): Promise<void> {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.from('tenant_domains').delete().eq('id', domainId);

    if (error) {
      console.error('Domain kaydı silinirken hata:', error);
      throw error;
    }
  }
}
