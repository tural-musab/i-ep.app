/**
 * Cloudflare Domain Yönetim Kütüphanesi
 *
 * Bu modül, Cloudflare API kullanarak tenant domainlerinin yönetimini sağlar.
 * - Subdomain oluşturma
 * - Özel domain ekleme
 * - DNS kayıtlarını yapılandırma
 * - SSL sertifikaları yönetme
 */

// @ts-ignore // Cloudflare tiplemesi için
import Cloudflare from 'cloudflare';
import { TenantDomainError } from '../errors/tenant-errors';

export interface DomainConfig {
  domain: string;
  type: 'subdomain' | 'custom';
  tenantId: string;
  targetIp?: string;
  isPrimary?: boolean;
}

export interface DomainVerificationResult {
  verified: boolean;
  errors?: string[];
}

export interface DomainStatus {
  domain: string;
  dnsConfigured: boolean;
  sslActive: boolean;
  errors?: string[];
}

export class CloudflareDomainManager {
  private client: any;
  private zoneId: string;
  private baseDomain: string;

  constructor() {
    // Cloudflare API erişim bilgileri
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const email = process.env.CLOUDFLARE_EMAIL;
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || '';
    this.baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app';

    if (!apiToken) {
      throw new Error('CLOUDFLARE_API_TOKEN çevre değişkeni tanımlanmamış');
    }

    // Cloudflare istemcisini oluştur
    this.client = new Cloudflare({
      token: apiToken,
      email,
    });
  }

  /**
   * Subdomain oluştur (tenant için)
   */
  async createSubdomain(subdomain: string, tenantId: string): Promise<DomainStatus> {
    try {
      // Subdomain formatını kontrol et
      if (!this.isValidSubdomain(subdomain)) {
        throw new TenantDomainError(
          subdomain,
          'Geçersiz subdomain formatı. Sadece küçük harfler, rakamlar ve tire kullanılabilir.'
        );
      }

      const fullDomain = `${subdomain}.${this.baseDomain}`;

      // DNS kaydı ekle (A record)
      await this.client.dnsRecords.add(this.zoneId, {
        type: 'CNAME',
        name: subdomain,
        content: process.env.NEXT_PUBLIC_APP_URL || 'i-ep.app',
        ttl: 1, // Auto
        proxied: true, // Cloudflare proxy aktif
      });

      // SSL sertifikasını oluştur ve doğrula
      const sslActive = await this.ensureSSLForDomain(fullDomain);

      return {
        domain: fullDomain,
        dnsConfigured: true,
        sslActive,
      };
    } catch (error: any) {
      console.error('Subdomain oluşturma hatası:', error);
      throw new TenantDomainError(
        subdomain,
        `Subdomain oluşturulurken hata oluştu: ${error.message || 'Bilinmeyen hata'}`
      );
    }
  }

  /**
   * Özel domain ekle (tenant için)
   */
  async addCustomDomain(domain: string, tenantId: string): Promise<DomainStatus> {
    try {
      // Domain formatını kontrol et
      if (!this.isValidDomain(domain)) {
        throw new TenantDomainError(domain, 'Geçersiz domain formatı.');
      }

      // Doğrulama durumunu izle ve domain yapılandırma bilgilerini döndür
      return {
        domain,
        dnsConfigured: false,
        sslActive: false,
        errors: [
          'Domain DNS ayarlarını yapılandırmanız gerekiyor.',
          `CNAME kaydı ekleyin: ${domain} -> ${this.baseDomain}`,
        ],
      };
    } catch (error: any) {
      console.error('Özel domain ekleme hatası:', error);
      throw new TenantDomainError(
        domain,
        `Özel domain eklenirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`
      );
    }
  }

  /**
   * Domain DNS yapılandırmasını doğrula
   */
  async verifyDomainConfiguration(domain: string): Promise<DomainVerificationResult> {
    try {
      // DNS çözümlemesi kontrolü yap
      const dnsResponse = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${domain}&type=CNAME`,
        {
          headers: {
            Accept: 'application/dns-json',
          },
        }
      );

      const dnsData = await dnsResponse.json();

      // CNAME kaydı var mı ve hedef bizim base domain'imiz mi?
      const isConfigured =
        dnsData.Answer &&
        dnsData.Answer.some(
          (record: any) =>
            record.type === 5 && // CNAME tipi
            record.data.includes(this.baseDomain)
        );

      if (!isConfigured) {
        return {
          verified: false,
          errors: [
            'DNS yapılandırması doğrulanamadı. CNAME kaydı bulunamadı veya yanlış yapılandırılmış.',
          ],
        };
      }

      // SSL durumunu kontrol et
      const sslActive = await this.ensureSSLForDomain(domain);

      return {
        verified: true,
      };
    } catch (error: any) {
      console.error('Domain doğrulama hatası:', error);
      return {
        verified: false,
        errors: [`Domain doğrulaması sırasında hata oluştu: ${error.message || 'Bilinmeyen hata'}`],
      };
    }
  }

  /**
   * Domain'i sil (tenant için)
   */
  async deleteDomain(domain: string): Promise<boolean> {
    try {
      // Subdomain mı kontrol et (base domain ile bitiyorsa)
      const isSubdomain = domain.endsWith(`.${this.baseDomain}`);

      if (isSubdomain) {
        // Subdomain'i ana domainimizden çıkar
        const subdomain = domain.replace(`.${this.baseDomain}`, '');

        // DNS kayıtlarını bul ve sil
        const dnsRecords = await this.client.dnsRecords.browse(this.zoneId);

        const targetRecord = dnsRecords.result.find(
          (record: any) => record.name === domain || record.name === subdomain
        );

        if (targetRecord) {
          await this.client.dnsRecords.del(this.zoneId, targetRecord.id);
        }
      }

      return true;
    } catch (error: any) {
      console.error('Domain silme hatası:', error);
      return false;
    }
  }

  /**
   * Domain'i doğrula ve SSL sertifikasını oluştur
   */
  private async ensureSSLForDomain(domain: string): Promise<boolean> {
    try {
      // Custom hostname oluştur ve SSL iste
      await this.client.customHostnames.add(this.zoneId, {
        hostname: domain,
        ssl: {
          method: 'http',
          type: 'dv',
          settings: {
            http2: 'on',
            min_tls_version: '1.2',
          },
        },
      });

      return true;
    } catch (error: any) {
      console.error('SSL yapılandırma hatası:', error);
      return false;
    }
  }

  /**
   * Geçerli bir subdomain formatı mı kontrol et
   */
  private isValidSubdomain(subdomain: string): boolean {
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
    return subdomainRegex.test(subdomain);
  }

  /**
   * Geçerli bir domain formatı mı kontrol et
   */
  private isValidDomain(domain: string): boolean {
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }
}
