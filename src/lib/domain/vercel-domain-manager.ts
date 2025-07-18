/**
 * Vercel Domain Manager
 *
 * Bu modül, Vercel API kullanarak domain yönetimi sağlar.
 * Tenant oluşturma ve domain doğrulama süreçlerine entegre edilebilir.
 * Referans Belgeler: docs/domain-management.md, docs/deployment/cloudflare-setup.md
 */

import { DomainProvider } from './types';
import { DomainVerificationStatus } from './types';

export class VercelDomainManager implements DomainProvider {
  private config: {
    apiToken: string;
    teamId?: string;
    projectId: string;
    baseDomain: string;
  };

  constructor(config?: {
    apiToken?: string;
    teamId?: string;
    projectId?: string;
    baseDomain?: string;
  }) {
    this.config = {
      apiToken: config?.apiToken || process.env.VERCEL_API_TOKEN || '',
      teamId: config?.teamId || process.env.VERCEL_TEAM_ID,
      projectId: config?.projectId || process.env.VERCEL_PROJECT_ID || '',
      baseDomain: config?.baseDomain || process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app',
    };
  }

  /**
   * Tenant için yeni bir subdomain oluşturur
   * Referans: docs/deployment/cloudflare-setup.md, Otomatik Subdomain Oluşturma kısmı
   */
  async createSubdomain(tenant: { id: string; subdomain: string }): Promise<boolean> {
    try {
      console.log(
        `Vercel API: Subdomain oluşturuluyor: ${tenant.subdomain}.${this.config.baseDomain}`
      );

      const domain = `${tenant.subdomain}.${this.config.baseDomain}`;

      // Vercel API'ye domain ekleme isteği
      const response = await fetch(
        `https://api.vercel.com/v10/projects/${this.config.projectId}/domains`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: domain,
            ...(this.config.teamId ? { teamId: this.config.teamId } : {}),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Vercel domain ekleme hatası:', data);
        return false;
      }

      console.log(`Vercel API: Domain başarıyla eklendi: ${domain}`);
      return true;
    } catch (error) {
      console.error('Vercel domain ekleme işleminde hata:', error);
      return false;
    }
  }

  /**
   * Tenant için özel domain ekler ve doğrulama bilgilerini döndürür
   * Referans: docs/domain-management.md, Özel Domain Doğrulama kısmı
   */
  async setupCustomDomain(
    tenant: { id: string },
    customDomain: string
  ): Promise<{ success: boolean; verificationDetails?: any }> {
    try {
      console.log(`Vercel API: Özel domain kurulumu başlatılıyor: ${customDomain}`);

      // 1. Önce domain formatını kontrol et
      const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
      if (!domainRegex.test(customDomain)) {
        return {
          success: false,
          verificationDetails: {
            error: 'Geçersiz domain formatı',
            instructions: 'Domain yalnızca küçük harf, rakam, tire ve nokta içerebilir.',
          },
        };
      }

      // 2. Vercel API'ye domain ekleme isteği
      const response = await fetch(
        `https://api.vercel.com/v10/projects/${this.config.projectId}/domains`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: customDomain,
            ...(this.config.teamId ? { teamId: this.config.teamId } : {}),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Vercel özel domain ekleme hatası:', data);
        return {
          success: false,
          verificationDetails: {
            error: data.error?.message || 'Özel domain eklenirken bir hata oluştu',
            code: data.error?.code,
          },
        };
      }

      // 3. Doğrulama yönergelerini hazırla
      const verificationDetails = {
        domain: customDomain,
        type: 'CNAME',
        value: 'cname.vercel-dns.com',
        message: 'Domain DNS ayarlarınızda bir CNAME kaydı oluşturun',
        instructions: `
          DNS sağlayıcınızda aşağıdaki CNAME kaydını oluşturun:
          
          Type: CNAME
          Name: ${customDomain.includes('.') ? '@' : customDomain}
          Value: cname.vercel-dns.com
          TTL: 3600 (veya Auto)
        `,
        verificationToken: data.verification ? data.verification.domain : undefined,
      };

      console.log(`Vercel API: Özel domain eklendi, doğrulama bekleniyor: ${customDomain}`);
      return { success: true, verificationDetails };
    } catch (error) {
      console.error('Vercel özel domain ekleme işleminde hata:', error);
      return {
        success: false,
        verificationDetails: {
          error: 'Domain eklenirken beklenmeyen bir hata oluştu',
        },
      };
    }
  }

  /**
   * Domain DNS konfigürasyonunu ve SSL durumunu kontrol eder
   * Referans: docs/domain-management.md, Domain Doğrulama Süreci kısmı
   */
  async verifyCustomDomain(domain: string): Promise<DomainVerificationStatus> {
    try {
      console.log(`Vercel API: Domain doğrulama kontrolü başlatılıyor: ${domain}`);

      // Vercel API'den domain durumunu kontrol et
      const response = await fetch(
        `https://api.vercel.com/v9/projects/${this.config.projectId}/domains/${domain}/status`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json',
          },
          ...(this.config.teamId ? { body: JSON.stringify({ teamId: this.config.teamId }) } : {}),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error('Vercel domain durumu kontrolü hatası:', data);
        return {
          domain,
          verified: false,
          status: 'error',
          lastChecked: new Date(),
          error: data.error?.message || 'Domain durumu kontrol edilirken bir hata oluştu',
        };
      }

      const data = await response.json();

      // Domain durumunu analiz et
      const verified = data.verified === true;
      const sslActive = data.sslActive === true || data.ssl?.configured === true;

      let status: 'pending' | 'active' | 'error' = 'pending';

      if (verified && sslActive) {
        status = 'active';
      } else if (data.error) {
        status = 'error';
      }

      console.log(
        `Vercel API: Domain durumu: ${domain} - Doğrulandı: ${verified}, SSL: ${sslActive}, Durum: ${status}`
      );

      return {
        domain,
        verified,
        status,
        lastChecked: new Date(),
        error: data.error?.message,
      };
    } catch (error) {
      console.error('Vercel domain doğrulama işleminde hata:', error);
      return {
        domain,
        verified: false,
        status: 'error',
        lastChecked: new Date(),
        error: 'Domain doğrulama işlemi sırasında bir hata oluştu',
      };
    }
  }

  /**
   * Domain kaydını kaldırır
   * Referans: docs/api-endpoints.md, Domain Silme kısmı
   */
  async removeSubdomain(tenantId: string, subdomain: string): Promise<boolean> {
    try {
      const domain = `${subdomain}.${this.config.baseDomain}`;
      console.log(`Vercel API: Domain siliniyor: ${domain}`);

      // Vercel API'den domain silme isteği
      const response = await fetch(
        `https://api.vercel.com/v9/projects/${this.config.projectId}/domains/${domain}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json',
          },
          ...(this.config.teamId ? { body: JSON.stringify({ teamId: this.config.teamId }) } : {}),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error('Vercel domain silme hatası:', data);
        return false;
      }

      console.log(`Vercel API: Domain başarıyla silindi: ${domain}`);
      return true;
    } catch (error) {
      console.error('Vercel domain silme işleminde hata:', error);
      return false;
    }
  }
}
