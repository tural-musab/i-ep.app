# WebhookStats Komponenti

Webhook istatistiklerini görüntülemek ve analiz etmek için kullanılan istatistik komponenti.

## Özellikler

- Başarı oranı
- Teslimat metrikleri
- Hata dağılımı
- Trend analizi
- Performans göstergeleri
- Durum özeti
- Zaman bazlı filtreleme

## Props

```typescript
interface WebhookStatsProps {
  /** Webhook ID */
  webhookId: string;

  /** İstatistik verisi */
  stats?: WebhookStatsData;

  /** Zaman aralığı */
  timeRange?: TimeRange;

  /** Yenileme aralığı (ms) */
  refreshInterval?: number;

  /** Trend gösterimi */
  showTrends?: boolean;

  /** Grafik gösterimi */
  showCharts?: boolean;

  /** Detay seviyesi */
  detailLevel?: 'basic' | 'detailed' | 'advanced';

  /** Özel metrikler */
  customMetrics?: CustomMetric[];

  /** Görünüm tipi */
  viewType?: 'cards' | 'table' | 'mixed';
}

interface WebhookStatsData {
  summary: {
    total: number;
    success: number;
    failed: number;
    avgDuration: number;
    avgSize: number;
  };
  trends: {
    successRate: TrendPoint[];
    duration: TrendPoint[];
    volume: TrendPoint[];
  };
  errors: {
    type: string;
    count: number;
    percentage: number;
  }[];
  statusCodes: {
    code: string;
    count: number;
    percentage: number;
  }[];
  performance: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

interface TrendPoint {
  timestamp: string;
  value: number;
}

interface CustomMetric {
  key: string;
  name: string;
  type: 'number' | 'percentage' | 'duration';
  aggregation: 'sum' | 'avg' | 'max' | 'min';
}

interface TimeRange {
  start: string;
  end: string;
  interval: '1h' | '1d' | '1w' | '1m';
}
```

## Kullanım

```tsx
import { WebhookStats } from '@components/super-admin/webhook';

export default function WebhookStatsPage() {
  const { webhookId } = useParams();

  return (
    <WebhookStats
      webhookId={webhookId}
      timeRange={{
        start: subDays(new Date(), 7),
        end: new Date(),
        interval: '1d',
      }}
      showTrends
      showCharts
      detailLevel="detailed"
      refreshInterval={30000}
      viewType="mixed"
      customMetrics={[
        {
          key: 'avgResponseSize',
          name: 'Ortalama Yanıt Boyutu',
          type: 'number',
          aggregation: 'avg',
        },
      ]}
    />
  );
}
```

## İstatistik Kartları

```tsx
<StatsCards stats={stats.summary} showTrends={showTrends} className="grid grid-cols-4 gap-4" />
```

## Trend Grafikleri

```tsx
<TrendCharts data={stats.trends} timeRange={timeRange} height={300} showLegend />
```

## Hata Analizi

```tsx
<ErrorAnalysis errors={stats.errors} statusCodes={stats.statusCodes} showDistribution />
```

## API Entegrasyonu

```typescript
// İstatistik verisi alma
const fetchWebhookStats = async (params: { webhookId: string; timeRange: TimeRange }) => {
  const response = await fetch(
    `/api/webhooks/${params.webhookId}/stats?` +
      new URLSearchParams({
        start: params.timeRange.start,
        end: params.timeRange.end,
        interval: params.timeRange.interval,
      })
  );
  return response.json();
};

// Özel metrik verisi alma
const fetchCustomMetrics = async (params: {
  webhookId: string;
  metrics: CustomMetric[];
  timeRange: TimeRange;
}) => {
  const response = await fetch(`/api/webhooks/${params.webhookId}/custom-metrics`, {
    method: 'POST',
    body: JSON.stringify({
      metrics: params.metrics,
      timeRange: params.timeRange,
    }),
  });
  return response.json();
};
```

## Veri Görselleştirme

```tsx
<MetricsChart
  data={stats.trends.successRate}
  type="area"
  height={200}
  colors={{
    success: '#10B981',
    failed: '#EF4444',
  }}
  xAxis={{
    type: 'time',
    format: 'HH:mm',
  }}
  yAxis={{
    type: 'percentage',
    min: 0,
    max: 100,
  }}
/>
```

## Erişilebilirlik

- Renk kontrastı
- ARIA etiketleri
- Klavye navigasyonu
- Ekran okuyucu desteği
- Tooltip erişilebilirliği
- Dinamik içerik bildirimleri

## Responsive Davranış

| Ekran Boyutu   | Davranış        |
| -------------- | --------------- |
| > 1024px       | Tam görünüm     |
| 768px - 1024px | Kompakt görünüm |
| < 768px        | Mobil görünüm   |

## Test

```typescript
describe('WebhookStats', () => {
  const mockStats = {
    summary: {
      total: 1000,
      success: 950,
      failed: 50,
      avgDuration: 250,
      avgSize: 1024
    },
    trends: {
      successRate: [
        { timestamp: '2024-03-20T10:00:00Z', value: 95 }
      ],
      duration: [
        { timestamp: '2024-03-20T10:00:00Z', value: 250 }
      ]
    }
  };

  it('renders stats summary', () => {
    render(
      <WebhookStats
        webhookId="1"
        stats={mockStats}
      />
    );

    expect(screen.getByText('95% başarı oranı')).toBeInTheDocument();
  });

  it('shows trend charts when enabled', () => {
    render(
      <WebhookStats
        webhookId="1"
        stats={mockStats}
        showTrends
      />
    );

    expect(screen.getByText('Trend Analizi')).toBeInTheDocument();
  });

  it('handles time range changes', async () => {
    render(
      <WebhookStats
        webhookId="1"
        stats={mockStats}
        timeRange={{
          start: '2024-03-13',
          end: '2024-03-20',
          interval: '1d'
        }}
      />
    );

    await userEvent.click(screen.getByText('Son 7 Gün'));
    expect(screen.getByText('13 Mar - 20 Mar')).toBeInTheDocument();
  });

  it('displays custom metrics', () => {
    render(
      <WebhookStats
        webhookId="1"
        stats={mockStats}
        customMetrics={[
          {
            key: 'avgResponseSize',
            name: 'Ortalama Yanıt Boyutu',
            type: 'number',
            aggregation: 'avg'
          }
        ]}
      />
    );

    expect(screen.getByText('Ortalama Yanıt Boyutu')).toBeInTheDocument();
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { WebhookStats } from './WebhookStats';

export default {
  title: 'Super Admin/WebhookStats',
  component: WebhookStats
};

const Template: Story = (args) => <WebhookStats {...args} />;

export const Default = Template.bind({});
Default.args = {
  webhookId: '1',
  stats: {
    summary: {
      total: 1000,
      success: 950,
      failed: 50,
      avgDuration: 250,
      avgSize: 1024
    },
    trends: {
      successRate: [
        { timestamp: '2024-03-20T10:00:00Z', value: 95 }
      ]
    }
  }
};

export const WithTrends = Template.bind({});
WithTrends.args = {
  ...Default.args,
  showTrends: true
};

export const WithCharts = Template.bind({});
WithCharts.args = {
  ...Default.args,
  showCharts: true
};

export const Loading = Template.bind({});
Loading.args = {
  webhookId: '1'
};

export const Error = Template.bind({});
Error.args = {
  webhookId: '1',
  error: new Error('İstatistikler yüklenemedi')
};
```

## Bağımlılıklar

- recharts
- date-fns
- @tanstack/react-query
- @headlessui/react
- clsx

## Stil Özelleştirme

```tsx
<WebhookStats
  className="stats-container"
  cardClassName="stat-card"
  chartClassName="stat-chart"
  customStyles={{
    card: {
      success: 'bg-green-50',
      error: 'bg-red-50',
    },
    chart: {
      grid: 'stroke-gray-200',
      tooltip: 'bg-white shadow-lg',
    },
  }}
/>
```

## Best Practices

1. Veriyi önbelleğe al
2. Grafikleri optimize et
3. Zaman aralığı seçimini sınırla
4. Hata oranlarını izle
5. Performans metriklerini takip et
