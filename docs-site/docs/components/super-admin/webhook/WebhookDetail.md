# WebhookDetail Komponenti

Webhook detaylarını görüntülemek ve yönetmek için kullanılan detay komponenti.

## Özellikler

- Webhook detayları görüntüleme
- Teslimat geçmişi
- Performans metrikleri
- Durum izleme
- Güvenlik ayarları
- Event filtreleri
- Retry yapılandırması

## Props

```typescript
interface WebhookDetailProps {
  /** Webhook ID */
  webhookId: string;
  
  /** Webhook verisi */
  webhook?: WebhookData;
  
  /** Düzenleme modu */
  editMode?: boolean;
  
  /** Webhook güncellendiğinde çağrılır */
  onUpdate?: (updates: Partial<WebhookConfig>) => Promise<void>;
  
  /** Webhook silindiğinde çağrılır */
  onDelete?: () => Promise<void>;
  
  /** Webhook test edildiğinde çağrılır */
  onTest?: () => Promise<TestResult>;
  
  /** Yenileme aralığı (ms) */
  refreshInterval?: number;
  
  /** Teslimat geçmişi sayfa boyutu */
  deliveryHistoryPageSize?: number;
  
  /** Metrik zaman aralığı */
  metricsTimeRange?: TimeRange;
}

interface TimeRange {
  start: string;
  end: string;
  interval: '1h' | '1d' | '1w' | '1m';
}

interface DeliveryRecord {
  id: string;
  timestamp: string;
  event: string;
  status: 'success' | 'failed';
  statusCode?: number;
  duration: number;
  requestSize: number;
  responseSize?: number;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface MetricsData {
  period: TimeRange;
  metrics: {
    deliveryCount: number;
    successRate: number;
    averageDuration: number;
    errorRates: Record<string, number>;
    statusCodes: Record<string, number>;
  };
  trends: {
    successRate: Point[];
    duration: Point[];
    volume: Point[];
  };
}

interface Point {
  timestamp: string;
  value: number;
}
```

## Kullanım

```tsx
import { WebhookDetail } from '@components/super-admin/webhook';

export default function WebhookDetailPage() {
  const { webhookId } = useParams();
  
  const handleUpdate = async (updates: Partial<WebhookConfig>) => {
    try {
      await updateWebhook(webhookId, updates);
      showSuccess('Webhook başarıyla güncellendi');
    } catch (error) {
      showError('Webhook güncellenemedi');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWebhook(webhookId);
      showSuccess('Webhook başarıyla silindi');
      router.push('/webhooks');
    } catch (error) {
      showError('Webhook silinemedi');
    }
  };

  const handleTest = async () => {
    try {
      const result = await testWebhook(webhookId);
      if (result.success) {
        showSuccess('Test başarılı');
      } else {
        showError(`Test başarısız: ${result.error?.message}`);
      }
      return result;
    } catch (error) {
      showError('Test yapılamadı');
      throw error;
    }
  };

  return (
    <WebhookDetail
      webhookId={webhookId}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onTest={handleTest}
      refreshInterval={30000}
      deliveryHistoryPageSize={50}
      metricsTimeRange={{
        start: subDays(new Date(), 7),
        end: new Date(),
        interval: '1d'
      }}
    />
  );
}
```

## Detay Bölümleri

### Genel Bilgiler
```tsx
<GeneralInfo
  webhook={webhook}
  onEdit={handleEdit}
  editMode={editMode}
/>
```

### Güvenlik Ayarları
```tsx
<SecuritySettings
  config={webhook.security}
  onUpdate={handleSecurityUpdate}
  onTest={handleSecurityTest}
/>
```

### Teslimat Geçmişi
```tsx
<DeliveryHistory
  webhookId={webhookId}
  pageSize={deliveryHistoryPageSize}
  onRetry={handleRetry}
/>
```

### Performans Metrikleri
```tsx
<PerformanceMetrics
  webhookId={webhookId}
  timeRange={metricsTimeRange}
  showTrends
/>
```

## API Entegrasyonu

```typescript
// Webhook detayı alma
const fetchWebhookDetail = async (id: string) => {
  const response = await fetch(`/api/webhooks/${id}`);
  return response.json();
};

// Teslimat geçmişi alma
const fetchDeliveryHistory = async (params: {
  webhookId: string;
  page: number;
  pageSize: number;
}) => {
  const response = await fetch(
    `/api/webhooks/${params.webhookId}/deliveries?` +
    new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize)
    })
  );
  return response.json();
};

// Metrik verisi alma
const fetchMetrics = async (params: {
  webhookId: string;
  timeRange: TimeRange;
}) => {
  const response = await fetch(
    `/api/webhooks/${params.webhookId}/metrics?` +
    new URLSearchParams({
      start: params.timeRange.start,
      end: params.timeRange.end,
      interval: params.timeRange.interval
    })
  );
  return response.json();
};
```

## Metrik Görselleştirme

```tsx
<MetricsChart
  data={metricsData.trends}
  type="line"
  height={300}
  series={[
    {
      name: 'Başarı Oranı',
      dataKey: 'successRate',
      color: '#10B981'
    },
    {
      name: 'Ortalama Süre',
      dataKey: 'duration',
      color: '#6366F1'
    }
  ]}
/>
```

## Erişilebilirlik

- Sekme bazlı navigasyon
- ARIA landmarks
- Dinamik içerik bildirimleri
- Klavye kısayolları
- Yüksek kontrast desteği
- Screen reader optimizasyonu

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 1024px | Yan yana bölümler |
| 768px - 1024px | Tek kolon, tam genişlik |
| < 768px | Sekmeli görünüm |

## Test

```typescript
describe('WebhookDetail', () => {
  const mockWebhook = {
    id: '1',
    name: 'Test Webhook',
    url: 'https://test.com/webhook',
    events: ['user.created'],
    status: {
      active: true,
      health: 'healthy',
      lastCheck: '2024-03-20T10:00:00Z'
    }
  };

  it('renders webhook details', () => {
    render(<WebhookDetail webhookId="1" webhook={mockWebhook} />);
    expect(screen.getByText('Test Webhook')).toBeInTheDocument();
  });

  it('handles webhook update', async () => {
    const onUpdate = jest.fn();
    render(
      <WebhookDetail
        webhookId="1"
        webhook={mockWebhook}
        onUpdate={onUpdate}
      />
    );
    
    await userEvent.click(screen.getByText('Düzenle'));
    await userEvent.type(screen.getByLabelText('Webhook Adı'), 'Updated Name');
    await userEvent.click(screen.getByText('Kaydet'));
    
    expect(onUpdate).toHaveBeenCalledWith({
      name: 'Updated Name'
    });
  });

  it('displays delivery history', async () => {
    render(
      <WebhookDetail
        webhookId="1"
        webhook={mockWebhook}
        deliveryHistoryPageSize={10}
      />
    );
    
    expect(await screen.findByText('Teslimat Geçmişi')).toBeInTheDocument();
  });

  it('shows performance metrics', async () => {
    render(
      <WebhookDetail
        webhookId="1"
        webhook={mockWebhook}
        metricsTimeRange={{
          start: '2024-03-13',
          end: '2024-03-20',
          interval: '1d'
        }}
      />
    );
    
    expect(await screen.findByText('Performans Metrikleri')).toBeInTheDocument();
  });

  it('handles webhook test', async () => {
    const onTest = jest.fn().mockResolvedValue({
      success: true,
      statusCode: 200
    });
    
    render(
      <WebhookDetail
        webhookId="1"
        webhook={mockWebhook}
        onTest={onTest}
      />
    );
    
    await userEvent.click(screen.getByText('Test Et'));
    expect(await screen.findByText('Test başarılı')).toBeInTheDocument();
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { WebhookDetail } from './WebhookDetail';

export default {
  title: 'Super Admin/WebhookDetail',
  component: WebhookDetail
};

const Template: Story = (args) => <WebhookDetail {...args} />;

export const Default = Template.bind({});
Default.args = {
  webhookId: '1',
  webhook: {
    id: '1',
    name: 'Test Webhook',
    url: 'https://test.com/webhook',
    events: ['user.created'],
    status: {
      active: true,
      health: 'healthy',
      lastCheck: '2024-03-20T10:00:00Z'
    }
  }
};

export const EditMode = Template.bind({});
EditMode.args = {
  ...Default.args,
  editMode: true
};

export const WithMetrics = Template.bind({});
WithMetrics.args = {
  ...Default.args,
  metricsTimeRange: {
    start: '2024-03-13',
    end: '2024-03-20',
    interval: '1d'
  }
};

export const Loading = Template.bind({});
Loading.args = {
  webhookId: '1'
};

export const Error = Template.bind({});
Error.args = {
  webhookId: '1',
  error: new Error('Webhook bulunamadı')
};
```

## Bağımlılıklar

- @tanstack/react-query
- date-fns
- recharts
- @headlessui/react
- @monaco-editor/react
- clsx

## Stil Özelleştirme

```tsx
<WebhookDetail
  className="webhook-detail"
  sectionClassName="detail-section"
  metricsClassName="metrics-section"
  historyClassName="history-section"
  customStyles={{
    header: 'bg-gray-50 p-4',
    section: 'border rounded-lg p-4 mb-4',
    metrics: {
      success: 'text-green-600',
      error: 'text-red-600'
    }
  }}
/>
```

## Best Practices

1. Gerçek zamanlı güncelleme için WebSocket kullan
2. Metrik verilerini önbelleğe al
3. Teslimat geçmişini sayfalı yükle
4. Hata durumlarını detaylı raporla
5. Güvenlik bilgilerini maskeleme 