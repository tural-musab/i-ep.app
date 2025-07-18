# WebhookList Komponenti

Webhook listesini görüntülemek ve yönetmek için kullanılan tablo komponenti.

## Özellikler

- Webhook listesi görüntüleme
- Filtreleme ve arama
- Durum izleme
- Toplu işlemler
- Sayfalama
- Sıralama
- İstatistikler

## Props

```typescript
interface WebhookListProps {
  /** Tenant ID */
  tenantId?: string;

  /** Sayfa başına webhook sayısı */
  pageSize?: number;

  /** Varsayılan sıralama */
  defaultSort?: SortConfig;

  /** Varsayılan filtreler */
  defaultFilters?: FilterConfig;

  /** Webhook silindiğinde çağrılır */
  onDelete?: (id: string) => Promise<void>;

  /** Webhook güncellendiğinde çağrılır */
  onUpdate?: (id: string, updates: Partial<WebhookConfig>) => Promise<void>;

  /** Webhook seçildiğinde çağrılır */
  onSelect?: (webhook: WebhookData) => void;

  /** Yenileme aralığı (ms) */
  refreshInterval?: number;

  /** Tablo görünümü */
  view?: 'default' | 'compact' | 'detailed';

  /** İstatistikleri göster */
  showStats?: boolean;
}

interface WebhookData extends WebhookConfig {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: WebhookStatus;
  stats: {
    total: number;
    success: number;
    failed: number;
    lastDelivery?: {
      timestamp: string;
      status: 'success' | 'failed';
      statusCode?: number;
      duration?: number;
    };
  };
}

interface WebhookStatus {
  active: boolean;
  health: 'healthy' | 'degraded' | 'failing';
  lastCheck: string;
  issues?: {
    code: string;
    message: string;
    severity: 'warning' | 'error';
  }[];
}

interface SortConfig {
  field: keyof WebhookData;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  search?: string;
  status?: WebhookStatus['health'][];
  events?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}
```

## Kullanım

```tsx
import { WebhookList } from '@components/super-admin/webhook';

export default function WebhooksPage() {
  const handleDelete = async (id: string) => {
    try {
      await deleteWebhook(id);
      showSuccess('Webhook başarıyla silindi');
    } catch (error) {
      showError('Webhook silinemedi');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<WebhookConfig>) => {
    try {
      await updateWebhook(id, updates);
      showSuccess('Webhook başarıyla güncellendi');
    } catch (error) {
      showError('Webhook güncellenemedi');
    }
  };

  return (
    <WebhookList
      pageSize={10}
      defaultSort={{ field: 'createdAt', direction: 'desc' }}
      onDelete={handleDelete}
      onUpdate={handleUpdate}
      showStats
      refreshInterval={30000}
    />
  );
}
```

## Tablo Kolonları

```tsx
const columns: Column<WebhookData>[] = [
  {
    id: 'status',
    header: 'Durum',
    cell: (row) => <WebhookStatusBadge status={row.status} />,
    sortable: true,
  },
  {
    id: 'name',
    header: 'İsim',
    cell: (row) => (
      <div>
        <div className="font-medium">{row.name}</div>
        <div className="text-sm text-gray-500">{row.url}</div>
      </div>
    ),
    sortable: true,
  },
  {
    id: 'events',
    header: 'Eventler',
    cell: (row) => <EventTags events={row.events} />,
    sortable: false,
  },
  {
    id: 'stats',
    header: 'İstatistikler',
    cell: (row) => <WebhookStats stats={row.stats} />,
    sortable: true,
  },
  {
    id: 'lastDelivery',
    header: 'Son Teslimat',
    cell: (row) => row.stats.lastDelivery && <LastDeliveryInfo delivery={row.stats.lastDelivery} />,
    sortable: true,
  },
  {
    id: 'actions',
    header: '',
    cell: (row) => <WebhookActions webhook={row} onDelete={onDelete} />,
  },
];
```

## API Entegrasyonu

```typescript
// Webhook listesi alma
const fetchWebhooks = async (params: {
  page: number;
  pageSize: number;
  sort?: SortConfig;
  filters?: FilterConfig;
}) => {
  const response = await fetch(
    '/api/webhooks?' +
      new URLSearchParams({
        ...params,
        sort: JSON.stringify(params.sort),
        filters: JSON.stringify(params.filters),
      })
  );
  return response.json();
};

// Webhook silme
const deleteWebhook = async (id: string) => {
  const response = await fetch(`/api/webhooks/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

// Webhook güncelleme
const updateWebhook = async (id: string, updates: Partial<WebhookConfig>) => {
  const response = await fetch(`/api/webhooks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return response.json();
};
```

## Filtreleme

```tsx
<WebhookFilters value={filters} onChange={setFilters} availableEvents={events} />
```

## İstatistikler

```tsx
<WebhookStats
  stats={{
    total: webhook.stats.total,
    success: webhook.stats.success,
    failed: webhook.stats.failed,
    lastDelivery: webhook.stats.lastDelivery,
  }}
  showChart
  showTrends
/>
```

## Erişilebilirlik

- Tablo başlıkları için aria-sort
- Sıralama butonları için aria-label
- Durum göstergeleri için aria-label
- Eylem butonları için aria-label
- Klavye navigasyonu
- Screen reader desteği

## Responsive Davranış

| Ekran Boyutu   | Davranış               |
| -------------- | ---------------------- |
| > 1024px       | Tüm kolonlar görünür   |
| 768px - 1024px | Bazı kolonlar gizlenir |
| < 768px        | Kart görünümü          |

## Test

```typescript
describe('WebhookList', () => {
  const mockWebhooks = [
    {
      id: '1',
      name: 'Test Webhook',
      url: 'https://test.com/webhook',
      events: ['user.created'],
      status: {
        active: true,
        health: 'healthy',
        lastCheck: '2024-03-20T10:00:00Z'
      },
      stats: {
        total: 100,
        success: 95,
        failed: 5
      }
    }
  ];

  it('renders webhook list', () => {
    render(<WebhookList webhooks={mockWebhooks} />);
    expect(screen.getByText('Test Webhook')).toBeInTheDocument();
  });

  it('handles sorting', async () => {
    render(<WebhookList webhooks={mockWebhooks} />);

    await userEvent.click(screen.getByText('İsim'));
    expect(screen.getByLabelText('İsme göre artan sıralama')).toBeInTheDocument();
  });

  it('handles filtering', async () => {
    render(<WebhookList webhooks={mockWebhooks} />);

    await userEvent.type(screen.getByPlaceholderText('Ara...'), 'test');
    expect(screen.getByText('Test Webhook')).toBeInTheDocument();
  });

  it('handles webhook deletion', async () => {
    const onDelete = jest.fn();
    render(<WebhookList webhooks={mockWebhooks} onDelete={onDelete} />);

    await userEvent.click(screen.getByLabelText('Webhook sil'));
    await userEvent.click(screen.getByText('Onayla'));

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('shows webhook stats', () => {
    render(<WebhookList webhooks={mockWebhooks} showStats />);

    expect(screen.getByText('95% başarı oranı')).toBeInTheDocument();
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { WebhookList } from './WebhookList';

export default {
  title: 'Super Admin/WebhookList',
  component: WebhookList
};

const Template: Story = (args) => <WebhookList {...args} />;

export const Default = Template.bind({});
Default.args = {
  webhooks: [
    {
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
  ]
};

export const WithStats = Template.bind({});
WithStats.args = {
  ...Default.args,
  showStats: true
};

export const Loading = Template.bind({});
Loading.args = {
  loading: true
};

export const Empty = Template.bind({});
Empty.args = {
  webhooks: []
};

export const WithError = Template.bind({});
WithError.args = {
  error: new Error('Webhooklar yüklenemedi')
};
```

## Bağımlılıklar

- @tanstack/react-table
- @tanstack/react-query
- date-fns
- recharts
- @headlessui/react
- clsx

## Stil Özelleştirme

```tsx
<WebhookList
  className="webhook-table"
  rowClassName="table-row"
  headerClassName="table-header"
  cellClassName="table-cell"
  customStyles={{
    table: 'border rounded-lg overflow-hidden',
    row: {
      healthy: 'bg-green-50',
      failing: 'bg-red-50',
    },
    stats: {
      success: 'text-green-600',
      failed: 'text-red-600',
    },
  }}
/>
```

## Best Practices

1. Performans optimizasyonu için sanal liste kullan
2. Webhook durumlarını düzenli kontrol et
3. İstatistikleri önbelleğe al
4. Hata durumlarını yönet
5. Webhook sağlığını izle
