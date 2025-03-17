/**
 * Domain Yönetim Servisi
 * 
 * Bu modül, Cloudflare Domain Manager'ı kullanarak domain yönetimi için servis katmanı sağlar.
 * Tenant oluşturma ve yönetme süreçlerine entegre edilebilir.
 */

import { CloudflareDomainManager, DomainStatus, DomainVerificationResult } from './cloudflare-domain-manager';
import { createServerSupabaseClient } from '../supabase/server';
import { TenantDomainError } from '../errors/tenant-errors';

export interface DomainRecord {
  id: string;
  tenant_id: string;
  domain: string;
  is_primary: boolean;
  is_verified: boolean;
  type: 'subdomain' | 'custom';
  created_at: Date;
  verified_at?: Date;
}

/**
 * Domain servis sınıfı
 */
export class DomainService {
  private domainManager: CloudflareDomainManager;
  
  constructor() {
    this.domainManager = new CloudflareDomainManager();
  }
  
  /**
   * Subdomain oluştur ve tenant'a ekle
   */
  async createSubdomain(subdomain: string, tenantId: string): Promise<DomainRecord> {
    // Subdomain oluştur
    const domainStatus = await this.domainManager.createSubdomain(subdomain, tenantId);
    
    // Veritabanına kaydet
    const domain = await this.saveDomainRecord({
      tenant_id: tenantId,
      domain: domainStatus.domain,
      is_primary: true, // İlk subdomain primary olur
      is_verified: domainStatus.dnsConfigured && domainStatus.sslActive,
      type: 'subdomain',
      verified_at: (domainStatus.dnsConfigured && domainStatus.sslActive) ? new Date() : undefined
    });
    
    return domain;
  }
  
  /**
   * Özel domain ekle ve tenant'a bağla
   */
  async addCustomDomain(domain: string, tenantId: string, isPrimary = false): Promise<DomainRecord> {
    // Özel domain ekle
    const domainStatus = await this.domainManager.addCustomDomain(domain, tenantId);
    
    // Veritabanına kaydet
    const domainRecord = await this.saveDomainRecord({
      tenant_id: tenantId,
      domain: domainStatus.domain,
      is_primary: isPrimary,
      is_verified: false, // Kullanıcı DNS ayarlarını yapılandırmalı
      type: 'custom',
      verified_at: undefined
    });
    
    return domainRecord;
  }
  
  /**
   * Domain yapılandırmasını doğrula
   */
  async verifyDomain(domainId: string): Promise<boolean> {
    // Domain kaydını getir
    const domain = await this.getDomainById(domainId);
    
    if (!domain) {
      throw new TenantDomainError('unknown', 'Domain kaydı bulunamadı');
    }
    
    // Yapılandırmayı doğrula
    const verificationResult = await this.domainManager.verifyDomainConfiguration(domain.domain);
    
    if (verificationResult.verified) {
      // Doğrulama başarılı, domain kaydını güncelle
      await this.updateDomainVerification(domainId, true, new Date());
      return true;
    }
    
    return false;
  }
  
  /**
   * Domain sil
   */
  async deleteDomain(domainId: string): Promise<boolean> {
    // Domain kaydını getir
    const domain = await this.getDomainById(domainId);
    
    if (!domain) {
      throw new TenantDomainError('unknown', 'Domain kaydı bulunamadı');
    }
    
    // Tenant'ın primary domain'i mi kontrol et
    if (domain.is_primary) {
      throw new TenantDomainError(
        domain.domain, 
        'Primary domain silinemez. Önce başka bir domain\'i primary olarak ayarlayın.'
      );
    }
    
    // Cloudflare'dan sil
    const deleted = await this.domainManager.deleteDomain(domain.domain);
    
    if (!deleted) {
      throw new TenantDomainError(domain.domain, 'Domain silinirken bir hata oluştu');
    }
    
    // Veritabanından sil
    await this.deleteDomainRecord(domainId);
    
    return true;
  }
  
  /**
   * Tenant'a ait tüm domainleri getir
   */
  async getDomainsByTenantId(tenantId: string): Promise<DomainRecord[]> {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('tenant_domains')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    return data || [];
  }
  
  /**
   * Primary domain'i değiştir
   */
  async setPrimaryDomain(domainId: string, tenantId: string): Promise<boolean> {
    const supabase = createServerSupabaseClient();
    
    // Domain doğrulanmış mı kontrol et
    const domain = await this.getDomainById(domainId);
    
    if (!domain) {
      throw new TenantDomainError('unknown', 'Domain kaydı bulunamadı');
    }
    
    if (!domain.is_verified) {
      throw new TenantDomainError(
        domain.domain, 
        'Doğrulanmamış bir domain\'i primary olarak ayarlayamazsınız.'
      );
    }
    
    // Önce tüm domainleri non-primary yap
    const { error: updateError } = await supabase
      .from('tenant_domains')
      .update({ is_primary: false })
      .eq('tenant_id', tenantId);
      
    if (updateError) {
      throw updateError;
    }
    
    // Seçilen domain'i primary yap
    const { error: primaryError } = await supabase
      .from('tenant_domains')
      .update({ is_primary: true })
      .eq('id', domainId)
      .eq('tenant_id', tenantId);
      
    if (primaryError) {
      throw primaryError;
    }
    
    return true;
  }
  
  // Private yardımcı metodlar
  
  /**
   * Domain kaydı oluştur
   */
  private async saveDomainRecord(domainData: Omit<DomainRecord, 'id' | 'created_at'>): Promise<DomainRecord> {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('tenant_domains')
      .insert({
        ...domainData,
        created_at: new Date()
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  /**
   * Domain kaydını ID'ye göre getir
   */
  private async getDomainById(domainId: string): Promise<DomainRecord | null> {
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
      throw error;
    }
    
    return data;
  }
  
  /**
   * Domain doğrulama durumunu güncelle
   */
  private async updateDomainVerification(
    domainId: string, 
    isVerified: boolean, 
    verifiedAt?: Date
  ): Promise<void> {
    const supabase = createServerSupabaseClient();
    
    const { error } = await supabase
      .from('tenant_domains')
      .update({
        is_verified: isVerified,
        verified_at: verifiedAt
      })
      .eq('id', domainId);
      
    if (error) {
      throw error;
    }
  }
  
  /**
   * Domain kaydını sil
   */
  private async deleteDomainRecord(domainId: string): Promise<void> {
    const supabase = createServerSupabaseClient();
    
    const { error } = await supabase
      .from('tenant_domains')
      .delete()
      .eq('id', domainId);
      
    if (error) {
      throw error;
    }
  }
} 