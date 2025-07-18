# Süper Admin Komponentleri

Bu dizin, Süper Admin panelinde kullanılan React komponentlerini içerir.

## Komponent Kategorileri

1. [Tenant Yönetimi](#tenant-yönetimi)
2. [Domain Yönetimi](#domain-yönetimi)
3. [Sistem Yönetimi](#sistem-yönetimi)
4. [Yedekleme ve Geri Yükleme](#yedekleme-ve-geri-yükleme)
5. [Güvenlik ve Denetim](#güvenlik-ve-denetim)
6. [Webhook Yönetimi](#webhook-yönetimi)

## Ortak Özellikler

Tüm komponentler aşağıdaki özellikleri paylaşır:

- TypeScript ile yazılmıştır
- Tailwind CSS ile stillendirilmiştir
- Responsive tasarım prensiplerine uyar
- WCAG 2.1 AA erişilebilirlik standartlarına uyumludur
- React Query ile veri yönetimi yapar
- Error Boundary ile hata yönetimi sağlar

## Komponent Listesi

### Tenant Yönetimi

- [TenantList](./tenant/TenantList.md) - Tenant listesi tablosu
- [TenantCreate](./tenant/TenantCreate.md) - Yeni tenant oluşturma formu
- [TenantDetail](./tenant/TenantDetail.md) - Tenant detay görünümü
- [TenantEdit](./tenant/TenantEdit.md) - Tenant düzenleme formu

### Domain Yönetimi

- [DomainVerification](./domain/DomainVerification.md) - Domain doğrulama süreci
- [SSLStatus](./domain/SSLStatus.md) - SSL sertifika durumu

### Sistem Yönetimi

- [SystemMetrics](./system/SystemMetrics.md) - Sistem metrikleri grafikleri
- [SystemHealth](./system/SystemHealth.md) - Sistem sağlık durumu
- [MetricsChart](./system/MetricsChart.md) - Metrik görselleştirme

### Yedekleme ve Geri Yükleme

- [BackupCreate](./backup/BackupCreate.md) - Yedekleme başlatma
- [BackupStatus](./backup/BackupStatus.md) - Yedekleme durumu
- [BackupList](./backup/BackupList.md) - Yedekleme listesi

### Güvenlik ve Denetim

- [AuditLogs](./audit/AuditLogs.md) - Denetim logları tablosu
- [AuditLogDetail](./audit/AuditLogDetail.md) - Log detay görünümü
- [LogFilters](./audit/LogFilters.md) - Log filtreleme

### Webhook Yönetimi

- [WebhookCreate](./webhook/WebhookCreate.md) - Webhook oluşturma formu
- [WebhookList](./webhook/WebhookList.md) - Webhook listesi
- [WebhookEvents](./webhook/WebhookEvents.md) - Event seçici

## Kullanım Örneği

```tsx
import { TenantList, TenantCreate } from '@components/super-admin/tenant';

export default function TenantsPage() {
  return (
    <div className="p-6">
      <TenantCreate />
      <TenantList />
    </div>
  );
}
```

## Geliştirme

### Yeni Komponent Ekleme

1. İlgili kategori altında komponent dosyası oluştur
2. Storybook hikayesi ekle
3. Unit testleri yaz
4. Dokümantasyon oluştur

### Test

```bash
# Unit testleri çalıştır
npm run test

# Storybook'u başlat
npm run storybook
```

### Dokümantasyon

Her komponent için aşağıdaki bilgiler dokümante edilmelidir:

- Props
- Kullanım örnekleri
- Bağımlılıklar
- Edge cases
- Erişilebilirlik notları
