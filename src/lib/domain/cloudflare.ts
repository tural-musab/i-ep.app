import { DomainProvider, CloudflareZoneConfig, DomainVerificationStatus } from './types';

export class CloudflareDomainManager implements DomainProvider {
  private config: CloudflareZoneConfig;
  
  constructor(config: CloudflareZoneConfig) {
    this.config = config;
  }
  
  /**
   * Tenant için yeni bir subdomain oluşturur
   * @param tenant Tenant bilgisi
   * @returns İşlem başarısı
   */
  async createSubdomain(tenant: { id: string; subdomain: string }): Promise<boolean> {
    try {
      // A kaydı ekle
      const aRecordResponse = await this.createDNSRecord({
        type: 'A',
        name: tenant.subdomain,
        content: process.env.APP_IP_ADDRESS || '127.0.0.1',
        ttl: 1,
        proxied: true
      });
      
      // CNAME kaydı ekle (www prefixi için)
      const cnameResponse = await this.createDNSRecord({
        type: 'CNAME',
        name: `www.${tenant.subdomain}`,
        content: `${tenant.subdomain}.${this.config.baseDomain}`,
        ttl: 1,
        proxied: true
      });
      
      return aRecordResponse && cnameResponse;
    } catch (error) {
      console.error('Subdomain oluşturma hatası:', error);
      return false;
    }
  }
  
  /**
   * Tenant için özel domain ekler
   * @param tenant Tenant bilgisi
   * @param customDomain Özel domain
   * @returns İşlem sonucu
   */
  async setupCustomDomain(tenant: { id: string }, customDomain: string): Promise<{success: boolean; verificationDetails?: any}> {
    try {
      // Cloudflare'e özel domain ekle
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/custom_hostnames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiToken}`
        },
        body: JSON.stringify({
          hostname: customDomain,
          ssl: {
            method: 'http',
            type: 'dv',
            settings: {
              http2: 'on',
              min_tls_version: '1.2'
            }
          }
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`Domain kurulumu başarısız: ${JSON.stringify(data.errors)}`);
      }
      
      return {
        success: true,
        verificationDetails: {
          id: data.result.id,
          status: data.result.status,
          ssl: data.result.ssl,
          verification_errors: data.result.verification_errors
        }
      };
    } catch (error) {
      console.error('Özel domain kurulumu hatası:', error);
      return { success: false };
    }
  }
  
  /**
   * Subdomain kaydını siler
   * @param tenantId Tenant ID
   * @param subdomain Silinecek subdomain
   * @returns İşlem başarısı
   */
  async removeSubdomain(tenantId: string, subdomain: string): Promise<boolean> {
    try {
      // Tüm DNS kayıtlarını listele
      const listResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/dns_records?name=${subdomain}.${this.config.baseDomain}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await listResponse.json();
      
      if (!data.success) {
        throw new Error(`DNS kayıtlarını listeleme hatası: ${JSON.stringify(data.errors)}`);
      }
      
      // Bulunan tüm kayıtları sil
      const deletePromises = data.result.map((record: any) => {
        return fetch(`https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/dns_records/${record.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json'
          }
        });
      });
      
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Subdomain silme hatası:', error);
      return false;
    }
  }
  
  /**
   * Özel domain doğrulamasını kontrol eder
   * @param domain Doğrulanacak domain
   * @returns Doğrulama durumu
   */
  async verifyCustomDomain(domain: string): Promise<DomainVerificationStatus> {
    try {
      // Cloudflare API ile domain durumunu kontrol etme
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/custom_hostnames?hostname=${domain}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Cloudflare domain durumu kontrolü hatası:', data.errors);
        return {
          domain,
          verified: false,
          status: 'error',
          lastChecked: new Date(),
          error: data.errors[0]?.message || 'Domain durumu kontrol edilirken bir hata oluştu'
        };
      }
      
      // Eğer domain kaydı varsa ve SSL aktifse
      const customHostname = data.result[0];
      
      if (customHostname) {
        const verified = customHostname.status === 'active';
        const sslActive = customHostname.ssl?.status === 'active';
        
        let status: 'pending' | 'active' | 'error' = 'pending';
        if (verified && sslActive) {
          status = 'active';
        } else if (customHostname.status === 'error') {
          status = 'error';
        }
        
        return {
          domain,
          verified,
          status,
          lastChecked: new Date(),
          error: customHostname.status === 'error' ? 'Domain yapılandırmasında hata' : undefined
        };
      }
      
      // Domain kaydı bulunamadı
      return {
        domain,
        verified: false,
        status: 'pending',
        lastChecked: new Date(),
        error: 'Cloudflare\'de domain kaydı bulunamadı'
      };
    } catch (error) {
      console.error('Cloudflare domain doğrulama işleminde hata:', error);
      return {
        domain,
        verified: false,
        status: 'error',
        lastChecked: new Date(),
        error: 'Domain doğrulama işlemi sırasında bir hata oluştu'
      };
    }
  }
  
  /**
   * DNS kaydı oluşturur
   * @param record DNS kaydı bilgileri
   * @returns İşlem başarısı
   */
  private async createDNSRecord(record: {
    type: 'A' | 'CNAME' | 'TXT';
    name: string;
    content: string;
    ttl: number;
    proxied: boolean;
  }): Promise<boolean> {
    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/dns_records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('DNS kaydı oluşturma hatası:', error);
      return false;
    }
  }
} 