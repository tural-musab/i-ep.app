# Multi-Tenant Mimari Stratejisi

## Genel Bakış

Iqra Eğitim Portalı SaaS, çok kiracılı (multi-tenant) bir mimari üzerine inşa edilmiştir. Bu mimari, farklı eğitim kurumlarının (tenant'lar) aynı uygulama kodu ve altyapı üzerinden, ancak izole edilmiş veri ve konfigürasyonlarla hizmet almasını sağlar. Bu doküman, sistemimizin multi-tenant mimarisinin temel prensiplerini, tasarım kararlarını ve uygulama detaylarını açıklar.

## Tenant Tanımı ve Yapısı

**Tenant**: Sistemimizde bir tenant, genellikle tek bir eğitim kurumunu (okul, kolej, dershane vb.) temsil eder. Her tenant:

- Benzersiz bir tanımlayıcı (UUID)
- Alt alan adı (subdomain) veya özel alan adı
- İzole edilmiş veri kümesi
- Kendine özel ayarlar ve konfigürasyonlar
- Belirli bir abonelik planı
- Kullanıcı ve yetki yapısı

içerir.

## Hibrit İzolasyon Yaklaşımı

Tenant verilerinin izolasyonu için hibrit bir yaklaşım benimsiyoruz:

### 1. Şema Bazlı İzolasyon

Her tenant için PostgreSQL veritabanında ayrı bir şema oluşturulur:

```sql
CREATE SCHEMA tenant_{tenant_id};
```

Bu şemalar şu tabloları içerir:
- Kullanıcılar ve roller
- Öğrenci bilgileri
- Öğretmen bilgileri
- Sınıf ve ders bilgileri
- Not ve devamsızlık kayıtları
- Tenant-specific ayarlar

### 2. Prefix Bazlı İzolasyon

Yüksek performans gerektiren veya çapraz tenant erişimi gerekebilecek bazı veriler için ortak şemada prefix ayrımı kullanılır:

```sql
CREATE TABLE public.tenant_usage_metrics (
  tenant_id UUID REFERENCES public.tenants(id),
  metric_name TEXT,
  metric_value NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE
);
```

### İzolasyon Stratejisinin Avantajları

- **Güvenlik**: Şema bazlı izolasyon, RLS (Row Level Security) politikalarıyla birlikte güçlü güvenlik sağlar
- **Performans**: Tenant-specific indeksler ve optimizasyonlar yapılabilir
- **Ölçeklenebilirlik**: Büyük tenant'lar için ayrı veritabanlarına geçiş imkanı
- **Bakım**: Tenant bazlı yedekleme ve geri yükleme
- **Esneklik**: Tenant-specific şema değişiklikleri ve özelleştirmeler

## Tenant Tanımlama ve Yönlendirme

### URL Tabanlı Tenant Ayrımı

Tenant'lar için iki URL stratejisi desteklenir:

1. **Subdomain Tabanlı**: `okul-adi.i-ep.app`
2. **Özel Domain**: `portal.okul-adi.edu.tr` (Premium planda)

### Tenant Tanımlama Süreci

1. **İstek Alımı**: Bir HTTP isteği geldiğinde
2. **Domain Analizi**: Middleware tarafından domain/subdomain analizi
3. **Tenant Tespiti**: İlgili tenant ID ve bilgilerinin veritabanından alınması
4. **Context Oluşturma**: Tenant bilgilerinin istek context'ine eklenmesi
5. **Yönlendirme**: Tenant'a özel route ve controller'lara yönlendirme

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTenantByDomain } from '@/lib/tenant';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Ana domain kontrolü
  const isRootDomain = hostname === 'i-ep.app' || 
                        hostname === 'www.i-ep.app';
  
  if (isRootDomain) {
    // Ana site için işlem yok
    return NextResponse.next();
  }
  
  // Subdomain'i çıkar
  const subdomain = hostname.split('.')[0];
  
  // Tenant bilgisini al
  const tenant = await getTenantByDomain(hostname);
  
  if (!tenant) {
    // Tenant bulunamadı, 404 veya ana sayfaya yönlendir
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Tenant bilgisini request'e ekle
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenant.id);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth endpoints (to avoid breaking third party auth providers)
     * 2. /_next (Next.js internals)
     * 3. /static (public files)
     */
    '/((?!api/auth|_next|static).*)',
  ],
};
```

## Tenant Context ve State Yönetimi

### React Context API ile Tenant Bilgisi Paylaşımı

```typescript
// TenantContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { Tenant } from '@/types';

interface TenantContextProps {
  tenant: Tenant | null;
  isLoading: boolean;
  features: Set<string>;
  isFeatureEnabled: (feature: string) => boolean;
}

const TenantContext = createContext<TenantContextProps>({
  tenant: null,
  isLoading: true,
  features: new Set(),
  isFeatureEnabled: () => false
});

export const TenantProvider = ({ 
  children,
  initialTenant
}: { 
  children: ReactNode;
  initialTenant?: Tenant;
}) => {
  // Tenant state ve logic burada
  
  return (
    <TenantContext.Provider value={/* context değerleri */}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
```

### Server Components için Tenant Erişimi

```typescript
// lib/tenant-server.ts
import { headers } from 'next/headers';
import { getTenantById } from '@/lib/db';

export async function getCurrentTenant() {
  const headersList = headers();
  const tenantId = headersList.get('x-tenant-id');
  
  if (!tenantId) {
    return null;
  }
  
  return getTenantById(tenantId);
}
```

## Tenant Yönetim Süreci

### Tenant Yaşam Döngüsü

1. **Oluşturma**: Yeni bir okul kaydı yapıldığında
   - Tenant kaydı
   - Subdomain oluşturma
   - Veritabanı şeması oluşturma
   - Varsayılan konfigürasyon
   - İlk admin kullanıcısı

2. **Yapılandırma**: Tenant admin'inin ilk kurulumu
   - Okul profili
   - Logo ve marka özelleştirmesi
   - Kullanıcı yapısı
   - Akademik yapı

3. **İşletim**: Normal kullanım
   - Kullanım metrikleri takibi
   - Kaynak kullanımı izleme
   - SLA izleme
   - Yedekleme

4. **Askıya Alma**: Ödeme sorunları veya inaktivite durumunda
   - Sınırlı erişim
   - Yalnızca admin girişi
   - Veriler korunur

5. **Sonlandırma**: Abonelik iptali
   - Veri dışa aktarma
   - Veri silme süreçleri (KVKK uyumlu)
   - Tenant kaynakları geri toplama

### Tenant Oluşturma İşlevi

```typescript
// lib/tenant-management.ts
export async function createNewTenant(
  name: string,
  subdomain: string,
  adminEmail: string,
  planType: 'free' | 'standard' | 'premium'
): Promise<Tenant> {
  // 1. Tenant kaydı oluştur
  const tenant = await createTenantRecord(name, subdomain, planType);
  
  // 2. Tenant şeması oluştur
  await createTenantSchema(tenant.id);
  
  // 3. Temel tabloları oluştur
  await createTenantTables(tenant.id);
  
  // 4. Varsayılan rolleri ve izinleri oluştur
  await createDefaultRolesAndPermissions(tenant.id);
  
  // 5. Admin kullanıcıyı oluştur
  await createAdminUser(tenant.id, adminEmail);
  
  // 6. Bildirim gönder
  await sendWelcomeEmail(adminEmail, tenant);
  
  return tenant;
}
```

## Domain Yönetimi

### Subdomain ve Özel Domain Desteği
Her tenant için aşağıdaki domain yapıları desteklenmektedir:

1. **Subdomain yapısı**: `{tenant-subdomain}.i-ep.app`
   - Tüm tenantlar için otomatik olarak oluşturulur
   - Tenant oluşturulduğunda subdomain otomatik olarak atanır
   
2. **Özel domain yapısı**: `okuladi.com` veya `portal.okuladi.com`
   - Premium ve Standard plan kullanıcıları için sunulan ek özellik
   - Free plan kullanıcıları sadece subdomain kullanabilir
   - SSL sertifikaları otomatik olarak oluşturulur ve yönetilir

### Domain Yönetimi Teknik İmplementasyonu
- Cloudflare API kullanılarak DNS kayıtları ve SSL sertifikaları yönetilir
- Middleware seviyesinde subdomain ve özel domain tespiti yapılır
- Admin panelinden domain ekleme, silme ve doğrulama yönetimi yapılabilir

### Tenant Özelliklerine Göre Domain Kısıtlamaları
| Plan Türü | Subdomain | Özel Domain | SSL |
|-----------|-----------|-------------|-----|
| Free      | ✅        | ❌          | ✅  |
| Standard  | ✅        | ✅          | ✅  |
| Premium   | ✅        | ✅          | ✅  |

## Özellik Bayrakları (Feature Flags)

Her tenant'ın abonelik planına ve özel durumuna göre farklı özelliklere erişimi olacaktır.

### Özellik Bayrağı Yapısı

```typescript
// Veritabanı tablosu (public şemasında)
interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  is_premium: boolean;
  is_beta: boolean;
}

// Tenant-özellik ilişki tablosu
interface TenantFeature {
  tenant_id: string;
  feature_id: string;
  is_enabled: boolean;
  override_reason?: string;
  expires_at?: Date;
}
```

### Özellik Kontrolü

```typescript
// Hook kullanımı
import { useTenant } from '@/lib/hooks/use-tenant';

function MyComponent() {
  const { isFeatureEnabled } = useTenant();
  
  if (isFeatureEnabled('advanced_analytics')) {
    // Premium özelliği göster
  } else {
    // Basic özelliği göster veya upgrade CTA
  }
}

// Server tarafı kontrol
import { getCurrentTenant } from '@/lib/tenant-server';

export async function GET(request: Request) {
  const tenant = await getCurrentTenant();
  
  if (!tenant.features.includes('api_access')) {
    return new Response('Feature not available', { status: 403 });
  }
  
  // API işlemleri
}
```

## Tenant İzolasyonu Güvenliği

### Row Level Security (RLS) Politikaları

```sql
-- Tenant şemasındaki her tablo için RLS politikaları
ALTER TABLE tenant_{tenant_id}.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON tenant_{tenant_id}.users
  USING (current_setting('app.tenant_id')::uuid = '{tenant_id}'::uuid);
```

### API Güvenlik Katmanı

```typescript
// middleware/tenant-security.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function tenantSecurityMiddleware(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  const requestPath = request.nextUrl.pathname;
  
  // Tenant spesifik API path kontrolü
  if (requestPath.startsWith('/api/tenants/') && 
      !requestPath.includes(tenantId)) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized cross-tenant access' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    );
  }
  
  return NextResponse.next();
}
```

## Tenant Performans İzolasyonu

Yüksek kullanım trafiği olan tenant'ların diğer tenant'ları etkilememesi için:

### Kaynak Sınırlandırma

- API istek sayısı limitleri (plan bazlı)
- Veritabanı bağlantı havuzu izolasyonu
- Redis önbellek bölümlendirme
- Storage kullanım limitleri

### Performans İzleme

- Tenant bazlı API yanıt süreleri
- Veritabanı sorgu performansı izleme
- Kaynak tüketimi alarmları

```typescript
// API rate limiting örneği
import rateLimit from 'express-rate-limit';
import { getTenantPlanLimits } from '@/lib/tenant';

export async function rateLimitMiddleware(req, res, next) {
  const tenantId = req.headers['x-tenant-id'];
  const tenant = await getTenantById(tenantId);
  const { requestsPerMinute } = getTenantPlanLimits(tenant.planType);
  
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 dakika
    max: requestsPerMinute,
    message: 'Too many requests from this tenant, please try again later'
  });
  
  return limiter(req, res, next);
}
```

## Tenant Ölçeklenebilirliği

### Yatay Ölçeklendirme Stratejisi

- Her tenant kendi şardalama grubu içinde yer alır
- Büyük tenant'lar için özel veritabanı sunucuları
- Coğrafi yakınlık bazlı tenant dağıtımı

### Dikey Ölçeklendirme

- Yüksek trafik tenant'lar için kaynak artırımı
- Premium plan tenant'larına ayrılmış kaynaklar
- Otomatik ölçeklendirme tetikleyicileri

## Büyük Ölçekli SaaS İçin Yol Haritası

### İlk Aşama (MVP)
- Şema bazlı izolasyon
- Basit tenant yönetimi
- Temel özellik bayrakları

### Orta Aşama
- Hibrit izolasyon (şema + prefix)
- Gelişmiş tenant yaşam döngüsü
- Otomatik ölçeklendirme

### İleri Aşama
- Tam coğrafi dağıtım
- Tenant bazlı şardalama
- İleri kaynak izolasyonu

## İyi Uygulamalar ve Prensipler

1. **Her zaman tenant ID doğrula**: Tüm API çağrılarında tenant ID varlığını ve doğruluğunu kontrol et
2. **Cross-tenant isteklerini engelle**: Tenant'lar arası veri erişimine izin verme
3. **Tenant context'i her zaman ilet**: API zincirleri boyunca tenant bilgisini koru
4. **Ortak kodda tenant farkındalığı**: Shared business logic bile tenant context'inden haberdar olmalı
5. **Tenant metrikleri topla**: Her tenant'ın kullanım ve performansını izle
6. **Düzenli izolasyon testleri yap**: Tenant izolasyonunu düzenli olarak test et ve denetle

## Kaynaklar ve Referanslar

- [Data Isolation Strategies](data-isolation.md)
- [Backup & Restore Procedures](../deployment/backup-restore.md)
- [Disaster Recovery Planning](../deployment/disaster-recovery.md)