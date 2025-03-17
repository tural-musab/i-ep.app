/**
 * Cloudflare Domain API entegrasyonu
 * Bu modül, tenant domainlerinin Cloudflare DNS ile otomatik yapılandırılmasını sağlar
 * Referans: docs/architecture/domain-management.md, docs/architecture/domain-management-guide.md
 */

import { env } from "@/env.mjs";

const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4";

interface CloudflareDomainConfig {
  subdomain: string;
  rootDomain: string;
  proxied?: boolean;
  ttl?: number;
  priority?: number;
}

interface CloudflareResponse {
  success: boolean;
  errors: any[];
  messages: any[];
  result?: any;
}

/**
 * DNS kaydı oluşturma için Cloudflare API'sine istek gönderir
 */
export async function createDnsRecord({
  subdomain,
  rootDomain,
  proxied = true,
  ttl = 1,
  priority = 10,
}: CloudflareDomainConfig): Promise<CloudflareResponse> {
  try {
    // Cloudflare zone ID'sini al
    const zoneId = await getZoneId(rootDomain);
    if (!zoneId) {
      return {
        success: false,
        errors: [{ message: `${rootDomain} için zone bulunamadı` }],
        messages: [],
      };
    }

    // API isteği için gerekli headers
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
    };

    // Tam domain adını oluştur
    const fullDomain = subdomain ? `${subdomain}.${rootDomain}` : rootDomain;

    // Vercel'in uygulama URL'i
    const vercelDomain = env.VERCEL_URL || "i-es.app";

    // DNS kaydı oluşturma isteği gönder
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: "CNAME",
          name: fullDomain,
          content: vercelDomain,
          ttl,
          priority,
          proxied,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        errors: errorData.errors || [{ message: "API isteği başarısız oldu" }],
        messages: errorData.messages || [],
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Cloudflare API hatası:", error);
    return {
      success: false,
      errors: [{ message: `API isteği sırasında hata: ${error}` }],
      messages: [],
    };
  }
}

/**
 * Belirtilen domain için DNS kaydını siler
 */
export async function deleteDnsRecord(
  subdomain: string,
  rootDomain: string
): Promise<CloudflareResponse> {
  try {
    // Cloudflare zone ID'sini al
    const zoneId = await getZoneId(rootDomain);
    if (!zoneId) {
      return {
        success: false,
        errors: [{ message: `${rootDomain} için zone bulunamadı` }],
        messages: [],
      };
    }

    // API isteği için gerekli headers
    const headers = {
      Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
    };

    // Tam domain adını oluştur
    const fullDomain = `${subdomain}.${rootDomain}`;

    // Önce DNS kaydının ID'sini bul
    const recordId = await getDnsRecordId(zoneId, fullDomain);
    if (!recordId) {
      return {
        success: false,
        errors: [{ message: `${fullDomain} için DNS kaydı bulunamadı` }],
        messages: [],
      };
    }

    // DNS kaydını silme isteği gönder
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records/${recordId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        errors: errorData.errors || [{ message: "API isteği başarısız oldu" }],
        messages: errorData.messages || [],
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Cloudflare API hatası:", error);
    return {
      success: false,
      errors: [{ message: `API isteği sırasında hata: ${error}` }],
      messages: [],
    };
  }
}

/**
 * Domain için zone ID'sini bulur
 */
async function getZoneId(domain: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones?name=${domain}`,
      {
        headers: {
          Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Zone sorgusu başarısız oldu:", await response.text());
      return null;
    }

    const data = await response.json();
    if (!data.success || !data.result.length) {
      return null;
    }

    return data.result[0].id;
  } catch (error) {
    console.error("Zone ID alınamadı:", error);
    return null;
  }
}

/**
 * Belirtilen domain için DNS kaydının ID'sini bulur
 */
async function getDnsRecordId(
  zoneId: string,
  domain: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records?name=${domain}`,
      {
        headers: {
          Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error("DNS kaydı sorgusu başarısız oldu:", await response.text());
      return null;
    }

    const data = await response.json();
    if (!data.success || !data.result.length) {
      return null;
    }

    return data.result[0].id;
  } catch (error) {
    console.error("DNS kaydı ID'si alınamadı:", error);
    return null;
  }
}

/**
 * Yeni bir tenant oluşturulduğunda DNS kaydı oluşturur
 */
export async function setupTenantDomain(
  tenantId: string,
  subdomain: string
): Promise<CloudflareResponse> {
  // Varsayılan root domain
  const rootDomain = env.ROOT_DOMAIN || "i-es.app";

  // DNS kaydını oluştur
  const result = await createDnsRecord({
    subdomain,
    rootDomain,
  });

  if (result.success) {
    console.log(`${subdomain}.${rootDomain} için DNS kaydı oluşturuldu`);
  } else {
    console.error(`DNS kaydı oluşturulamadı:`, result.errors);
  }

  return result;
}

/**
 * Tenant silindiğinde DNS kaydını siler
 */
export async function removeTenantDomain(
  tenantId: string,
  subdomain: string
): Promise<CloudflareResponse> {
  // Varsayılan root domain
  const rootDomain = env.ROOT_DOMAIN || "i-es.app";

  // DNS kaydını sil
  const result = await deleteDnsRecord(subdomain, rootDomain);

  if (result.success) {
    console.log(`${subdomain}.${rootDomain} için DNS kaydı silindi`);
  } else {
    console.error(`DNS kaydı silinemedi:`, result.errors);
  }

  return result;
}

/**
 * Özel domain için DNS doğrulaması yapar
 */
export async function verifyCustomDomain(
  domain: string
): Promise<{ success: boolean; validationRecord?: string; error?: string }> {
  try {
    // Domain doğrulama işlemleri (CNAME veya TXT kayıtları kontrol edilir)
    // Bu örnek basitleştirilmiştir, gerçek uygulamada daha kapsamlı olmalıdır

    // DNS sorgusu yapılır
    const vercelDomain = env.VERCEL_URL || "i-es.app";
    
    // Burada gerçek bir DNS sorgusu yapılmalıdır
    // Şimdilik basit bir simülasyon
    const isValid = domain.includes(".");

    if (isValid) {
      return {
        success: true,
        validationRecord: `${domain} CNAME ${vercelDomain}`,
      };
    } else {
      return {
        success: false,
        error: "Geçersiz domain formatı",
      };
    }
  } catch (error) {
    console.error("Domain doğrulama hatası:", error);
    return {
      success: false,
      error: `Doğrulama sırasında hata: ${error}`,
    };
  }
} 