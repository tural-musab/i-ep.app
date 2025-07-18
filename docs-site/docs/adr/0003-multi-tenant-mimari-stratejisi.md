# 0003. Multi-Tenant Mimari Stratejisi

## Bağlam

Iqra Eğitim Portalı, çok sayıda eğitim kurumuna (okullar, kolejler, dershaneler) aynı uygulama kodu ve altyapısı üzerinden hizmet sağlayacak bir SaaS uygulaması olarak tasarlanmıştır. Bu yapıda, her bir eğitim kurumu bir tenant (kiracı) olarak kabul edilmektedir.

Multi-tenant mimarinin tasarımında aşağıdaki gereksinimler ve kısıtlamalar dikkate alınmıştır:

- **Güvenlik**: Tenantlar arasında veri sızıntısı olmamalı ve her tenant yalnızca kendi verilerine erişebilmelidir
- **Performans**: Sistem, çok sayıda tenanta hizmet verirken bile yüksek performans sağlamalıdır
- **Ölçeklenebilirlik**: Artan tenant sayısı ve veri hacmine uyum sağlayabilecek yapıda olmalıdır
- **Özelleştirilebilirlik**: Her tenant, kendi ihtiyaçlarına göre belirli özelleştirmeler yapabilmelidir
- **Bakım ve Operasyon**: Sistem bakımı ve güncelleme süreçleri verimli ve kolay olmalıdır
- **Maliyet Etkinliği**: Altyapı kaynaklarının optimum kullanımı ile maliyet kontrolü sağlanmalıdır

Multi-tenant veri izolasyonu için farklı yaklaşımlar değerlendirilmiştir:

1. **Tenant Başına Ayrı Veritabanı**: Her tenant için tamamen ayrı bir veritabanı
2. **Şema Bazlı İzolasyon**: Aynı veritabanında tenant başına ayrı şemalar
3. **Tablo Bazlı İzolasyon**: Her tablonun tenant başına ayrı kopyası
4. **Satır Bazlı İzolasyon**: Aynı tabloda tenant_id sütunu ile ayırma

## Karar

Iqra Eğitim Portalı için **Hibrit İzolasyon** yaklaşımı benimsenmiştir. Bu yaklaşım aşağıdaki bileşenlerden oluşmaktadır:

1. **Şema Bazlı İzolasyon** (birincil yaklaşım):
   - Her tenant için PostgreSQL veritabanında ayrı bir şema oluşturulacaktır (tenant\_{tenant_id} şeklinde)
   - Tenant-specific veriler (öğrenciler, öğretmenler, sınıflar, notlar, vb.) bu şemalarda tutulacaktır

2. **Satır Bazlı İzolasyon** (tamamlayıcı yaklaşım):
   - Çapraz tenant analizleri gerektiren veya tenant başına düşük hacimli veriler için ortak şemada tenant_id ile ayrılmış tablolar kullanılacaktır
   - PostgreSQL Row Level Security (RLS) politikaları ile erişim kontrolü sağlanacaktır

## Durum

Kabul Edildi

## Tarih

2023-11-22

## Sonuçlar

### Olumlu

- **Güçlü İzolasyon**: Şema seviyesinde izolasyon, tenantlar arasında yüksek düzeyde güvenlik sağlar
- **Performans**: Tenant-specific şemalar, indeksler ve sorgu optimizasyonları için daha iyi olanak sunar
- **Esneklik**: Tenant-specific şema değişiklikleri ve özelleştirmeler daha kolay uygulanabilir
- **Ölçeklenebilirlik**: Büyük tenantlar gerektiğinde ayrı veritabanlarına taşınabilir
- **Kolay Yedekleme/Geri Yükleme**: Tenant bazında yedekleme ve geri yükleme işlemleri daha basittir
- **Daha İyi Kaynak Yönetimi**: Her tenant için ayrı bağlantı havuzları ve kaynak limitleri ayarlanabilir

### Olumsuz

- **Kompleksite**: Hibrit yaklaşım, tek bir izolasyon yöntemine göre daha karmaşıktır
- **Bağlantı Yönetimi**: Çok sayıda şema/veritabanı ile çalışmak, bağlantı yönetimini zorlaştırabilir
- **Şema Sayısı Sınırlaması**: PostgreSQL'in şema sayısı için belirli sınırları vardır (pratik limiti ~10,000)
- **Cross-Tenant Sorgular**: Şema bazlı yaklaşımda cross-tenant sorgular daha karmaşıktır

### Nötr

- Dinamik şema oluşturma ve yönetimi için ek kod/altyapı gerektirir
- Migration ve şema güncelleme işlemleri tüm tenantlar için otomatikleştirilmelidir
- Merkezi yapılandırma ve tenant metadata yönetimi için ek tablo/sistem gerektirir

## Alternatifler

### Tenant Başına Ayrı Veritabanı

- **Avantajlar**: En yüksek düzeyde izolasyon, bağımsız yedekleme/geri yükleme, tenant başına özelleştirme
- **Dezavantajlar**: Yüksek kaynak kullanımı, veritabanı bağlantı sayısı sınırlamaları, yönetim zorluğu

### Tek Şema, Tablo Bazlı İzolasyon (Tablo Adı Prefix'i)

- **Avantajlar**: Şema sınırlamalarını aşma, tenant bazında tablo özelleştirme
- **Dezavantajlar**: Veritabanı nesne sayısının hızla artması, sorgu karmaşıklığı

### Tek Şema, Satır Bazlı İzolasyon (RLS)

- **Avantajlar**: Basit yapı, kolay yönetim, cross-tenant sorgulama kolaylığı
- **Dezavantajlar**: Daha düşük izolasyon seviyesi, tüm sorgularda tenant filtresi gereksinimi, performans etkileri

## İlgili Kararlar

- [0002](0002-supabase-ve-postgres-kullanimi.md) Supabase ve PostgreSQL Kullanımı
- [0004](0004-cloudflare-ile-domain-yonetimi.md) Cloudflare ile Domain Yönetimi

## Kaynaklar

- [PostgreSQL Şema Dokümantasyonu](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [PostgreSQL Row Level Security (RLS)](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Multi-Tenant Data Architecture (Microsoft)](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/data-isolation)
- [SaaS Multi-Tenant Veri Mimarisi Kalıpları](https://aws.amazon.com/blogs/apn/multi-tenant-storage-strategies-for-saas-applications/)
