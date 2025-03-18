# Cloudflare Entegrasyon Rehberi

Bu rehber, Iqra Eğitim Portalı'nın Cloudflare entegrasyonu için detaylı kurulum ve yapılandırma adımlarını açıklar. Cloudflare, projemizde DNS yönetimi, CDN, ve özel domain entegrasyonu için kullanılmaktadır.

## İçerik

1. [Giriş](#giriş)
2. [Cloudflare Hesap Kurulumu](#cloudflare-hesap-kurulumu)
3. [Ana Domain Yapılandırması](#ana-domain-yapılandırması)
4. [Subdomain ve Tenant Yönetimi](#subdomain-ve-tenant-yönetimi)
5. [Özel Domain Entegrasyonu](#özel-domain-entegrasyonu)
6. [DNS Yönetimi API Entegrasyonu](#dns-yönetimi-api-entegrasyonu)
7. [CDN ve Performans Optimizasyonu](#cdn-ve-performans-optimizasyonu)
8. [SSL/TLS Yapılandırması](#ssltls-yapılandırması)
9. [Güvenlik Önlemleri](#güvenlik-önlemleri)
10. [Cloudflare Workers (Opsiyonel)](#cloudflare-workers-opsiyonel)
11. [İzleme ve Sorun Giderme](#i̇zleme-ve-sorun-giderme)
12. [İlgili Kaynaklar](#i̇lgili-kaynaklar)

## Giriş

Cloudflare, Iqra Eğitim Portalı'nın altyapısında aşağıdaki amaçlar için kullanılmaktadır:

- Ana domain (`i-ep.app`) ve subdomain (`tenant.i-ep.app`) DNS yönetimi
- Premium tenant'lar için özel domain doğrulama ve yapılandırma (`okul.kendi-domaini.com`)
- SSL/TLS sertifikaları sağlama
- İçerik Dağıtım Ağı (CDN) ve önbellek hizmetleri
- DDoS koruması ve güvenlik önlemleri

Bu rehber, geliştirme ekibinin Cloudflare'i doğru şekilde yapılandırması ve multi-tenant yapımızla entegre etmesi için adım adım talimatlar sunar.

## Cloudflare Hesap Kurulumu

### 1. Hesap Oluşturma ve Yapılandırma

1. [Cloudflare'e kaydolun](https://dash.cloudflare.com/sign-up) veya mevcut hesabınıza giriş yapın
2. E-posta adresinizi doğrulayın
3. Güvenlik için iki faktörlü kimlik doğrulamayı (2FA) etkinleştirin:
   - Cloudflare Dashboard > Profil > Authentication
   - "Add Authentication App" seçeneğini tıklayın
   - QR kodunu tarayın veya kodu kimlik doğrulama uygulamanıza girin
   - Doğrulama kodunu girerek 2FA'yı tamamlayın

### 2. Kullanıcı Rolleri ve İzinler

Büyük ekipler için, ekip üyeleri için uygun erişim rolleri atayın:

1. Cloudflare Dashboard > "Members" sekmesine gidin
2. "Invite Member" butonuna tıklayın
3. Ekip üyesinin e-posta adresini ve rolünü girin:
   - **Admin**: Tam erişim (sadece proje liderleri için)
   - **DNS Editor**: Sadece DNS kayıtlarını düzenleyebilir
   - **Analytics**: Sadece analitik verilerini görüntüleyebilir

## Ana Domain Yapılandırması

### 1. Ana Domain Ekleme

1. Cloudflare Dashboard'a giriş yapın
2. "Add a Site" butonuna tıklayın
3. Ana domain adınızı (örn. `i-ep.app`) girin
4. "Free Plan" seçin (başlangıç için yeterlidir, daha sonra ihtiyaca göre yükseltilebilir)
5. Cloudflare tarafından bulunan DNS kayıtlarınızı gözden geçirin
6. Cloudflare'in sunduğu name server'ları domain kaydınızı yaptığınız registrar'a (örn. GoDaddy, Namecheap) ekleyin
7. DNS propagasyonunun tamamlanmasını bekleyin (24-48 saat sürebilir)

### 2. DNS Kayıtları Yapılandırma

Cloudflare Dashboard'da aşağıdaki temel DNS kayıtlarını oluşturun:

1. Ana domain için A kaydı:
   - **Type**: A
   - **Name**: @
   - **IPv4 address**: Vercel'in IP adresi veya load balancer IP'si
   - **TTL**: Auto
   - **Proxy status**: Proxied (turuncu bulut)

2. www subdomain için CNAME:
   - **Type**: CNAME
   - **Name**: www
   - **Target**: cname.vercel-dns.com
   - **TTL**: Auto
   - **Proxy status**: Proxied

3. Wildcard subdomain için CNAME:
   - **Type**: CNAME
   - **Name**: *
   - **Target**: cname.vercel-dns.com
   - **TTL**: Auto
   - **Proxy status**: Proxied

4. MX kayıtları (e-posta servisi için):
   - E-posta sağlayıcınızın talimatlarına göre yapılandırın

### 3. SSL/TLS Ayarları

1. Cloudflare Dashboard > "SSL/TLS" sekmesine gidin
2. "Overview" bölümünde, SSL/TLS şifreleme modunu "Full" veya "Full (Strict)" olarak ayarlayın
3. "Edge Certificates" bölümünde:
   - "Always Use HTTPS" seçeneğini etkinleştirin
   - "Automatic HTTPS Rewrites" seçeneğini etkinleştirin
   - "Certificate Transparency Monitoring" seçeneğini etkinleştirin
4. "Origin Server" bölümünde, Vercel veya diğer orijin sunucunuzla güvenli iletişim için bir Origin Sertifikası oluşturun (gerekirse)

## Subdomain ve Tenant Yönetimi

### 1. Subdomain Stratejisi

Iqra Eğitim Portalı, her tenant için bir subdomain kullanır (örn. `okul-adi.i-ep.app`). Tüm subdomain'ler, wildcard DNS kaydı (*.i-ep.app) sayesinde otomatik olarak Vercel'e yönlendirilir.

### 2. Otomatik Subdomain Oluşturma

Yeni tenant oluşturulduğunda, subdomain için özel bir DNS kaydı oluşturmaya gerek yoktur, çünkü wildcard kaydı tüm subdomain'leri kapsar. Ancak, tenant kayıtlarını izleme ve doğrulama amacıyla bir veritabanı tablosunda subdomain'leri takip etmelisiniz.

```typescript
// src/lib/cloudflare/domains.ts
import { env } from '@/env.mjs';

interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
  accountId: string;
}

function getCloudflareConfig(): CloudflareConfig {
  return {
    apiToken: env.CLOUDFLARE_API_TOKEN,
    zoneId: env.CLOUDFLARE_ZONE_ID,
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
  };
}

export async function validateSubdomain(subdomain: string): Promise<{ valid: boolean; message?: string }> {
  // Subdomain format kontrolü (a-z, 0-9, ve tire)
  const subdomainRegex = /^[a-z0-9][a-z0-9\-]{1,61}[a-z0-9]$/;
  if (!subdomainRegex.test(subdomain)) {
    return {
      valid: false,
      message: 'Subdomain yalnızca küçük harf, rakam ve tire içerebilir ve 2-63 karakter uzunluğunda olmalıdır.',
    };
  }

  // Yasaklı subdomain'ler (rezerve edilmiş kelimeler)
  const reservedSubdomains = ['www', 'api', 'admin', 'app', 'auth', 'billing', 'dashboard', 'docs', 'support'];
  if (reservedSubdomains.includes(subdomain)) {
    return {
      valid: false,
      message: 'Bu subdomain kullanılamaz çünkü sistem tarafından rezerve edilmiştir.',
    };
  }

  return { valid: true };
}
```

## Özel Domain Entegrasyonu

Premium tenant'lar için özel domain desteği sunuyoruz (örn. `okul-adı.kendi-domaini.com`).

### 1. Özel Domain Doğrulama

Bir tenant özel domain eklemek istediğinde, domain sahipliğini doğrulamalısınız:

```typescript
// src/lib/cloudflare/domains.ts
export async function verifyCustomDomain(domain: string): Promise<{ 
  success: boolean; 
  validationRecord?: string;
  error?: string 
}> {
  try {
    const cf = getCloudflareConfig();
    const vercelDomain = env.VERCEL_URL || "i-ep.app";
    
    // Domain formatını kontrol et
    if (!domain.match(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/)) {
      return { 
        success: false, 
        error: 'Geçersiz domain formatı' 
      };
    }
    
    // Doğrulama için gerekli DNS kaydı
    const validationRecord = `${domain} CNAME ${vercelDomain}`;
    
    return { 
      success: true,
      validationRecord 
    };
  } catch (error) {
    console.error('Domain doğrulama hatası:', error);
    return { 
      success: false, 
      error: 'Domain doğrulama işlemi sırasında bir hata oluştu' 
    };
  }
}
```

### 2. Özel Domain DNS Ayarları

Kullanıcılara, özel domainlerini Iqra Eğitim Portalı'na bağlamak için aşağıdaki DNS kayıtlarını eklemeleri gerektiğini belirtin:

1. CNAME kaydı oluşturun:
   - **Type**: CNAME
   - **Name**: @ veya subdomain (örn. okul)
   - **Target**: cname.vercel-dns.com
   - **TTL**: Auto/3600

2. CNAME doğrulama kaydı oluşturun:
   - Kullanıcıya gösterilen doğrulama kaydını takip edin

### 3. Özel Domain Bağlama

Kullanıcı DNS kayıtlarını yapılandırdıktan sonra, özel domaini tenant'a bağlayın:

```typescript
// src/lib/cloudflare/domains.ts
export async function attachCustomDomain(tenantId: string, domain: string): Promise<{ 
  success: boolean; 
  error?: string 
}> {
  try {
    // Özel domaini tenant kayıtlarına ekle
    const { error } = await supabaseAdmin
      .from('tenants')
      .update({ custom_domain: domain })
      .eq('id', tenantId);
      
    if (error) throw error;
    
    // Özel domain kontrolünü zamanla
    await scheduleCustomDomainVerification(tenantId, domain);
    
    return { success: true };
  } catch (error) {
    console.error('Özel domain bağlama hatası:', error);
    return { 
      success: false, 
      error: 'Özel domain bağlama işlemi sırasında bir hata oluştu' 
    };
  }
}

// Periyodik olarak özel domain durumunu kontrol et
async function scheduleCustomDomainVerification(tenantId: string, domain: string): Promise<void> {
  // Burada periyodik kontrol için bir zamanlayıcı kurabilirsiniz
  // Örnek: Her gün domain kaydının hala geçerli olup olmadığını kontrol et
}
```

## DNS Yönetimi API Entegrasyonu

### 1. Cloudflare API Anahtarı Oluşturma

1. Cloudflare Dashboard > "Profile" > "API Tokens" sekmesine gidin
2. "Create Token" butonuna tıklayın
3. "Edit zone DNS" şablonunu seçin
4. İzinleri yapılandırın:
   - **Zone - DNS**: Edit
   - **Zone - Zone**: Read
5. **Zone Resources**: Include > Specific zone > i-ep.app
6. Token'i oluşturun ve güvenli bir yerde saklayın

### 2. API Entegrasyonu

Cloudflare API'sini kullanarak DNS kayıtlarını programatik olarak yönetebilirsiniz:

```typescript
// src/lib/cloudflare/api.ts
import { env } from '@/env.mjs';

export interface CloudflareDNSRecord {
  id?: string;
  type: 'A' | 'CNAME' | 'TXT' | 'MX';
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

export async function createDNSRecord(record: CloudflareDNSRecord): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        },
        body: JSON.stringify(record),
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.errors[0]?.message || 'DNS kaydı oluşturma hatası');
    }

    return { 
      success: true, 
      id: data.result.id 
    };
  } catch (error) {
    console.error('Cloudflare DNS kaydı oluşturma hatası:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export async function getDNSRecords(parameters: { type?: string; name?: string; }): Promise<{ 
  success: boolean; 
  records?: CloudflareDNSRecord[]; 
  error?: string 
}> {
  try {
    let url = `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records`;
    
    // URL parametreleri ekleme
    if (parameters.type || parameters.name) {
      const params = new URLSearchParams();
      if (parameters.type) params.append('type', parameters.type);
      if (parameters.name) params.append('name', parameters.name);
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.errors[0]?.message || 'DNS kayıtlarını getirme hatası');
    }

    return { 
      success: true, 
      records: data.result 
    };
  } catch (error) {
    console.error('Cloudflare DNS kayıtlarını getirme hatası:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export async function updateDNSRecord(recordId: string, record: Partial<CloudflareDNSRecord>): Promise<{ 
  success: boolean; 
  error?: string 
}> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        },
        body: JSON.stringify(record),
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.errors[0]?.message || 'DNS kaydı güncelleme hatası');
    }

    return { success: true };
  } catch (error) {
    console.error('Cloudflare DNS kaydı güncelleme hatası:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export async function deleteDNSRecord(recordId: string): Promise<{ 
  success: boolean; 
  error?: string 
}> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records/${recordId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.errors[0]?.message || 'DNS kaydı silme hatası');
    }

    return { success: true };
  } catch (error) {
    console.error('Cloudflare DNS kaydı silme hatası:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

## CDN ve Performans Optimizasyonu

### 1. Cloudflare CDN Yapılandırması

1. Cloudflare Dashboard > "Speed" > "Optimization" sekmesine gidin
2. Aşağıdaki ayarları yapılandırın:
   - **Auto Minify**: HTML, CSS ve JavaScript'i sıkıştırmak için etkinleştirin
   - **Brotli**: Daha verimli sıkıştırma için etkinleştirin
   - **Early Hints**: Tarayıcı ön yükleme için etkinleştirin
   - **HTTP/2 ve HTTP/3**: Modern protokolleri etkinleştirin
   - **Rocket Loader**: JavaScript yükleme performansını artırmak için etkinleştirin (isteğe bağlı)

### 2. Önbellek Ayarları

1. Cloudflare Dashboard > "Caching" sekmesine gidin
2. "Configuration" bölümünde:
   - **Caching Level**: Standard
   - **Browser Cache TTL**: 4 hours
   - **Always Online**: Enable
3. Page Rules oluşturarak belirli URL'ler için özel önbellek davranışı tanımlayın:
   - Statik dosyalar için daha uzun önbellek süreleri
   - API endpoint'leri için önbelleği devre dışı bırakma

### 3. Page Rules Oluşturma

1. Cloudflare Dashboard > "Rules" > "Page Rules" sekmesine gidin
2. "Create Page Rule" butonuna tıklayın
3. Statik içerik için kural oluşturun:
   - **URL**: `*i-ep.app/_next/static/*`
   - **Setting**: Cache Level - Cache Everything
   - **Edge Cache TTL**: 30 days
4. API için kural oluşturun:
   - **URL**: `*i-ep.app/api/*`
   - **Setting**: Cache Level - Bypass Cache
5. İstatik varlıklar için kural oluşturun:
   - **URL**: `*i-ep.app/assets/*`
   - **Setting**: Cache Level - Cache Everything
   - **Browser Cache TTL**: 7 days

## SSL/TLS Yapılandırması

### 1. SSL Modu Seçimi

1. Cloudflare Dashboard > "SSL/TLS" > "Overview" sekmesine gidin
2. SSL modunu "Full (Strict)" olarak ayarlayın
   - Bu mod, Cloudflare ile origin sunucu arasında güvenli ve doğrulanmış bir SSL bağlantısı gerektirir
   - Origin sunucunuzda (Vercel) da valid bir SSL sertifikası olmalıdır

### 2. Sertifika Türleri

Cloudflare, ana domain ve tüm subdomain'ler için otomatik olarak SSL sertifikaları sağlar:

1. **Universal SSL**: Tüm domain ve subdomain'ler için otomatik olarak sağlanır
2. **Advanced Certificate Manager** (isteğe bağlı): Özel SSL sertifikaları için kullanılabilir
3. **Origin Server Sertifikaları**: Cloudflare ile origin sunucu arasındaki bağlantı için

### 3. SSL/TLS Uygulamaları

1. Cloudflare Dashboard > "SSL/TLS" > "Edge Certificates" sekmesine gidin
2. Aşağıdaki seçenekleri yapılandırın:
   - **Always Use HTTPS**: Enabled
   - **Automatic HTTPS Rewrites**: Enabled
   - **Certificate Transparency Monitoring**: Enabled
   - **Minimum TLS Version**: TLS 1.2
   - **Opportunistic Encryption**: Enabled
   - **TLS 1.3**: Enabled
   - **HSTS (HTTP Strict Transport Security)**: Enabled (6 ay ile başlayın)

## Güvenlik Önlemleri

### 1. Temel Güvenlik Ayarları

1. Cloudflare Dashboard > "Security" > "Settings" sekmesine gidin
2. Aşağıdaki güvenlik özelliklerini yapılandırın:
   - **Bot Fight Mode**: Enabled
   - **Challenge Passage**: 30 minutes
   - **Browser Integrity Check**: Enabled
   - **Security Level**: Medium

### 2. Web Application Firewall (WAF)

1. Cloudflare Dashboard > "Security" > "WAF" sekmesine gidin
2. "Managed Rules" bölümünde:
   - Cloudflare Managed Ruleset: On
   - OWASP Core Ruleset: On
3. "Custom Rules" bölümünde, özel güvenlik kuralları oluşturun:
   - Admin sayfaları için IP kısıtlamaları
   - Belirli ülkelerden erişim engelleme (gerekirse)
   - Rate limiting kuralları

### 3. DDoS Koruması

Cloudflare, otomatik olarak DDoS (Distributed Denial of Service) saldırılarına karşı koruma sağlar. Ek güvenlik için:

1. Cloudflare Dashboard > "Security" > "DDoS" sekmesine gidin
2. "HTTP DDoS Attack Protection" seviyesini "Medium" veya "High" olarak ayarlayın
3. "Network-Layer DDoS Attack Protection"ı etkinleştirin

## Cloudflare Workers (Opsiyonel)

Cloudflare Workers, edge'de çalışan JavaScript fonksiyonlarıdır ve çeşitli amaçlar için kullanılabilir.

### 1. Temel Worker Oluşturma

1. Cloudflare Dashboard > "Workers & Pages" sekmesine gidin
2. "Create a Service" butonuna tıklayın
3. Servis adı verin (örn. `i-ep-app-edge`)
4. Worker oluşturun:

```javascript
// Örnek: Tenant subdomain'lerine göre yönlendirme
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const hostname = url.hostname
  
  // Subdomain'i ayıkla
  const domainParts = hostname.split('.')
  if (domainParts.length > 2 && !hostname.startsWith('www.')) {
    const subdomain = domainParts[0]
    
    // Özel işlemler veya yönlendirmeler
    if (subdomain === 'status') {
      // Örn: Status sayfasına yönlendir
      return Response.redirect('https://status.i-ep.app', 301)
    }
    
    // Buradan tenant bilgilerini kontrol edebilir veya özel başlıklar ekleyebilirsiniz
  }
  
  // Normal işleme devam et
  return fetch(request)
}
```

### 2. Worker Routes Tanımlama

1. Worker servisinizi seçin
2. "Triggers" > "Add Route" tıklayın
3. Route pattern ekleyin: `*i-ep.app/*`
4. "Add Route" tıklayarak kaydedin

### 3. Worker KV Entegrasyonu (isteğe bağlı)

Tenant bilgilerini önbelleğe almak için KV (Key-Value) depolama kullanabilirsiniz:

1. "Workers & Pages" > "KV" sekmesine gidin
2. "Create Namespace" tıklayın ve bir ad verin (örn. `TENANT_DATA`)
3. Worker'ınızı KV namespace'e bağlayın:
   - Worker'ınızı seçin > "Settings" > "Variables"
   - "KV Namespace Bindings" altında "Add binding" tıklayın
   - Variable name: `TENANT_DATA`
   - KV namespace: Oluşturduğunuz namespace'i seçin
4. Worker kodunuzu KV kullanımı için güncelleyin:

```javascript
async function handleRequest(request) {
  const url = new URL(request.url)
  const hostname = url.hostname
  
  // Subdomain'i ayıkla
  const domainParts = hostname.split('.')
  if (domainParts.length > 2 && !hostname.startsWith('www.')) {
    const subdomain = domainParts[0]
    
    // KV'den tenant verilerini al
    const tenantData = await TENANT_DATA.get(subdomain, { type: "json" })
    
    if (tenantData) {
      // Tenant verilerine göre işlem yap
      const modifiedRequest = new Request(request)
      modifiedRequest.headers.set('X-Tenant-ID', tenantData.id)
      return fetch(modifiedRequest)
    }
  }
  
  return fetch(request)
}
```

## İzleme ve Sorun Giderme

### 1. Cloudflare Analytics

1. Cloudflare Dashboard > "Analytics" sekmesine gidin
2. Aşağıdaki istatistikleri izleyin:
   - **Traffic**: Ziyaretçi sayısı, coğrafi dağılım, bot trafiği
   - **Performance**: Sayfa yükleme süreleri, önbellek oranı
   - **Security**: Engellenen tehditler, güvenlik olayları
   - **Workers**: Worker kullanımı ve performansı (kullanıyorsanız)

### 2. Loglar ve Sorun Giderme

1. Cloudflare Dashboard > "Logs" > "Log Filters" sekmesine gidin (Enterprise abonelik gerektirir)
2. Loglarda şunları arayın:
   - 5xx hataları
   - Yavaş istekler
   - Engellenen istekler
   - CDN cache miss'leri

### 3. Özel Domain Sorunları

Kullanıcılar özel domain bağlamada sorun yaşıyorsa:

1. DNS kayıtlarının doğru yapılandırıldığını kontrol edin
2. DNS propagasyonunun tamamlanması için yeterli süre beklendiğinden emin olun (24-48 saat)
3. SSL sertifikası oluşturulurken oluşabilecek hataları kontrol edin
4. CNAME hedef adresinin doğru olduğunu doğrulayın

## İlgili Kaynaklar

- [Cloudflare API Dokümantasyonu](https://developers.cloudflare.com/api)
- [Next.js ile Cloudflare Entegrasyonu](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site)
- [Cloudflare Workers Dokümantasyonu](https://developers.cloudflare.com/workers)
- [Multi-Tenant DNS Yapılandırması](../architecture/multi-tenant-strategy.md)
- [Felaketten Kurtarma Planı](./disaster-recovery.md) 