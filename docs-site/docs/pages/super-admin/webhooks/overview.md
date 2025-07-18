# Webhook Yönetimi Sayfası

Super Admin panelinde webhook yönetimi için kullanılan sayfa yapısı.

## Sayfa Yapısı

```
/webhooks
  ├── /                  # Ana liste sayfası
  ├── /create           # Yeni webhook oluşturma
  ├── /:id              # Webhook detay sayfası
  └── /:id/stats        # Webhook istatistikleri
```

## Özellikler

- Webhook listesi görüntüleme ve yönetme
- Yeni webhook oluşturma
- Webhook detaylarını görüntüleme ve düzenleme
- Webhook istatistiklerini analiz etme
- Webhook durumlarını izleme
- Webhook güvenlik ayarlarını yönetme

## Komponentler

### WebhookList

- Webhook listesi görüntüleme
- Filtreleme ve arama
- Durum izleme
- Toplu işlemler
- Sayfalama ve sıralama

### WebhookCreate

- Webhook yapılandırma
- Event seçimi
- Güvenlik ayarları
- Test aracı
- Şablon desteği

### WebhookDetail

- Webhook detayları
- Teslimat geçmişi
- Performans metrikleri
- Durum izleme
- Güvenlik ayarları

### WebhookStats

- Başarı oranı
- Teslimat metrikleri
- Hata dağılımı
- Trend analizi
- Performans göstergeleri

## Sayfa Örnekleri

### Ana Liste Sayfası

```tsx
// pages/super-admin/webhooks/index.tsx
import { WebhookList } from '@components/super-admin/webhook';

export default function WebhooksPage() {
  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Webhooklar</h1>
        <p className="text-gray-600">Sistem webhook'larını yönetin ve izleyin</p>
      </header>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="primary" href="/super-admin/webhooks/create">
            Yeni Webhook
          </Button>
          <Button variant="secondary" onClick={handleRefresh}>
            Yenile
          </Button>
        </div>

        <div className="flex gap-2">
          <Select
            value={view}
            onChange={setView}
            options={[
              { value: 'default', label: 'Varsayılan Görünüm' },
              { value: 'compact', label: 'Kompakt Görünüm' },
              { value: 'detailed', label: 'Detaylı Görünüm' },
            ]}
          />
          <Button variant="ghost" onClick={toggleStats}>
            {showStats ? 'İstatistikleri Gizle' : 'İstatistikleri Göster'}
          </Button>
        </div>
      </div>

      <WebhookList pageSize={10} showStats={showStats} view={view} refreshInterval={30000} />
    </div>
  );
}
```

### Oluşturma Sayfası

```tsx
// pages/super-admin/webhooks/create.tsx
import { WebhookCreate } from '@components/super-admin/webhook';

export default function CreateWebhookPage() {
  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Yeni Webhook</h1>
        <p className="text-gray-600">Yeni bir webhook yapılandırın</p>
      </header>

      <WebhookCreate onSubmit={handleSubmit} onCancel={() => router.back()} />
    </div>
  );
}
```

### Detay Sayfası

```tsx
// pages/super-admin/webhooks/[id].tsx
import { WebhookDetail } from '@components/super-admin/webhook';

export default function WebhookDetailPage() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <header className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Webhook Detayı</h1>
            <p className="text-gray-600">Webhook ayarlarını yönetin ve izleyin</p>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" href={`/super-admin/webhooks/${id}/stats`}>
              İstatistikler
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Sil
            </Button>
          </div>
        </div>
      </header>

      <WebhookDetail webhookId={id} refreshInterval={30000} />
    </div>
  );
}
```

### İstatistik Sayfası

```tsx
// pages/super-admin/webhooks/[id]/stats.tsx
import { WebhookStats } from '@components/super-admin/webhook';

export default function WebhookStatsPage() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <header className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Webhook İstatistikleri</h1>
            <p className="text-gray-600">Webhook performansını ve metriklerini analiz edin</p>
          </div>

          <div className="flex gap-2">
            <DateRangePicker value={timeRange} onChange={setTimeRange} />
            <Select
              value={interval}
              onChange={setInterval}
              options={[
                { value: '1h', label: 'Saatlik' },
                { value: '1d', label: 'Günlük' },
                { value: '1w', label: 'Haftalık' },
              ]}
            />
          </div>
        </div>
      </header>

      <WebhookStats
        webhookId={id}
        timeRange={timeRange}
        showTrends
        showCharts
        refreshInterval={30000}
        detailLevel="detailed"
      />
    </div>
  );
}
```

## Stil Rehberi

### Renkler

```css
:root {
  --webhook-success: #10b981;
  --webhook-error: #ef4444;
  --webhook-warning: #f59e0b;
  --webhook-info: #6366f1;
}
```

### Tipografi

```css
.webhook-title {
  @apply text-2xl font-bold text-gray-900;
}

.webhook-subtitle {
  @apply text-sm text-gray-600;
}

.webhook-label {
  @apply text-sm font-medium text-gray-700;
}
```

### Komponent Stilleri

```css
.webhook-card {
  @apply rounded-lg border bg-white p-4 shadow-sm;
}

.webhook-stats-card {
  @apply rounded-lg border bg-white p-6 shadow-sm;
}

.webhook-form {
  @apply max-w-3xl space-y-6;
}

.webhook-table {
  @apply min-w-full divide-y divide-gray-200;
}
```

## Best Practices

1. Sayfa yüklemelerini optimize et
2. İstatistik verilerini önbelleğe al
3. Webhook durumlarını düzenli kontrol et
4. Hata durumlarını yönet
5. Kullanıcı geri bildirimlerini göster
6. Performans metriklerini izle
7. Güvenlik kontrollerini uygula
8. Responsive tasarımı destekle
9. Erişilebilirlik standartlarına uy
10. Test kapsamını geniş tut
