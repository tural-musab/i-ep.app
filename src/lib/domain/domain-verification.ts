/**
 * Domain Doğrulama İşlemleri
 * 
 * Bu modül, özel domainlerin DNS yapılandırması ve SSL durumunu kontrol 
 * eden fonksiyonları içerir.
 * 
 * Referans belgeler:
 * - docs/domain-management.md: Domain Doğrulama Süreci bölümü
 * - docs/deployment/cloudflare-setup.md: Özel Domain Entegrasyonu bölümü
 */

import { VercelDomainManager } from './vercel-domain-manager';

/**
 * Bir domain'in DNS konfigürasyonunu kontrol eder
 * Referans: docs/domain-management.md, Özel Domain Doğrulama bölümü
 */
export async function checkDNSConfiguration(domain: string): Promise<{
  configured: boolean;
  error?: string;
  details?: Record<string, any>;
}> {
  try {
    console.log(`DNS konfigürasyonu kontrol ediliyor: ${domain}`);
    
    // Vercel API kullanarak domain durumu kontrolü
    const vercelManager = new VercelDomainManager();
    const verificationResult = await vercelManager.verifyCustomDomain(domain);
    
    if (!verificationResult.verified) {
      return {
        configured: false,
        error: verificationResult.error || 'DNS kaydı bulunamadı veya yanlış yapılandırılmış',
        details: {
          lastChecked: verificationResult.lastChecked,
          status: verificationResult.status
        }
      };
    }
    
    return {
      configured: true,
      details: {
        lastChecked: verificationResult.lastChecked,
        status: verificationResult.status
      }
    };
  } catch (error) {
    console.error('DNS konfigürasyon kontrolü sırasında hata:', error);
    return {
      configured: false,
      error: 'DNS yapılandırması kontrol edilirken bir hata oluştu'
    };
  }
}

/**
 * Bir domain'in SSL sertifikası durumunu kontrol eder
 * Referans: docs/domain-management.md, SSL Sertifikaları bölümü
 */
export async function checkSSLStatus(domain: string): Promise<{
  active: boolean;
  error?: string;
  details?: Record<string, any>;
}> {
  try {
    console.log(`SSL durumu kontrol ediliyor: ${domain}`);
    
    // Vercel API kullanarak SSL durumu kontrolü
    const vercelManager = new VercelDomainManager();
    const verificationResult = await vercelManager.verifyCustomDomain(domain);
    
    // SSL durumunu belirle (status active ise SSL aktif demektir)
    if (verificationResult.status === 'active') {
      return {
        active: true,
        details: {
          lastChecked: verificationResult.lastChecked,
          status: verificationResult.status
        }
      };
    }
    
    return {
      active: false,
      error: verificationResult.error || 'SSL sertifikası henüz aktif değil',
      details: {
        lastChecked: verificationResult.lastChecked,
        status: verificationResult.status
      }
    };
  } catch (error) {
    console.error('SSL durum kontrolü sırasında hata:', error);
    return {
      active: false,
      error: 'SSL durumu kontrol edilirken bir hata oluştu'
    };
  }
}

/**
 * Bir domain'in tam doğrulama sürecini gerçekleştirir
 * Referans: docs/domain-management.md, Domain Doğrulama Süreci bölümü
 */
export async function verifyDomainConfiguration(domain: string): Promise<{
  verified: boolean;
  dnsConfigured: boolean;
  sslActive: boolean;
  message?: string;
  details?: Record<string, any>;
}> {
  try {
    console.log(`Domain doğrulama başlatıldı: ${domain}`);
    
    // 1. DNS kaydı kontrolü
    const dnsResult = await checkDNSConfiguration(domain);
    
    if (!dnsResult.configured) {
      return {
        verified: false,
        dnsConfigured: false,
        sslActive: false,
        message: dnsResult.error || 'DNS kaydı bulunamadı veya yanlış yapılandırılmış',
        details: dnsResult.details
      };
    }
    
    // 2. SSL durumu kontrolü
    const sslResult = await checkSSLStatus(domain);
    
    // 3. Sonucu değerlendir
    const verified = dnsResult.configured && sslResult.active;
    
    return {
      verified,
      dnsConfigured: dnsResult.configured,
      sslActive: sslResult.active,
      message: verified 
        ? 'Domain başarıyla doğrulandı' 
        : (sslResult.active 
           ? 'Domain doğrulandı ancak SSL sertifikası hazırlanıyor' 
           : 'DNS kaydı doğrulandı, SSL sertifikası henüz hazır değil'),
      details: {
        dns: dnsResult.details,
        ssl: sslResult.details,
        lastChecked: new Date()
      }
    };
  } catch (error) {
    console.error('Domain doğrulama hatası:', error);
    return {
      verified: false,
      dnsConfigured: false,
      sslActive: false,
      message: 'Domain doğrulama sırasında bir hata oluştu'
    };
  }
}

/**
 * Doğrulama durumundan insan tarafından okunabilir mesaj oluşturur
 */
export function getVerificationStatusMessage(status: {
  verified: boolean;
  dnsConfigured: boolean;
  sslActive: boolean;
}): string {
  if (status.verified) {
    return 'Domain doğrulandı ve aktif durumda';
  }
  
  if (status.dnsConfigured && !status.sslActive) {
    return 'DNS yapılandırması doğru, SSL sertifikası hazırlanıyor (5-10 dakika sürebilir)';
  }
  
  if (!status.dnsConfigured) {
    return 'DNS kaydı henüz doğrulanamadı. Lütfen DNS ayarlarınızı kontrol edin.';
  }
  
  return 'Domain doğrulama bekliyor';
} 