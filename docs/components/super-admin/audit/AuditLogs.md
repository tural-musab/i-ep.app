# AuditLogs Komponenti

Sistem denetim loglarını görüntüleyen ve analiz eden komponent.

## Özellikler

- Log listesi görüntüleme
- Gelişmiş filtreleme
- Gerçek zamanlı takip
- Log detayları
- Log dışa aktarma
- İstatistik görünümü
- Alarm yönetimi

## Props

```typescript
interface AuditLogsProps {
  /** Tenant ID */
  tenantId?: string;
  
  /** Sayfa başına kayıt sayısı */
  pageSize?: number;
  
  /** Varsayılan filtreler */
  defaultFilters?: AuditLogFilters;
  
  /** Varsayılan sıralama */
  defaultSort?: SortConfig;
  
  /** Gerçek zamanlı takip aktif mi */
  liveTracking?: boolean;
  
  /** Log seçildiğinde çağrılır */
  onLogSelect?: (log: AuditLogEntry) => void;
  
  /** Alarm durumunda çağrılır */
  onAlert?: (alert: LogAlert) => void;
  
  /** Görünüm tipi */
  viewType?: 'table' | 'timeline' | 'grid';
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: LogCategory;
  severity: LogSeverity;
  actor: {
    id: string;
    type: 'user' | 'system' | 'service';
    name: string;
    role?: string;
  };
  target: {
    id: string;
    type: string;
    name: string;
  };
  changes?: {
    before: any;
    after: any;
  };
  metadata: Record<string, any>;
  tenant?: {
    id: string;
    name: string;
  };
}

interface AuditLogFilters {
  dateRange?: [Date, Date];
  categories?: LogCategory[];
  severity?: LogSeverity[];
  actors?: string[];
  actions?: string[];
  targets?: string[];
  tenant?: string;
  search?: string;
}

type LogCategory = 'auth' | 'data' | 'config' | 'security' | 'system' | 'tenant';
type LogSeverity = 'info' | 'warning' | 'error' | 'critical';
```

## Kullanım

```tsx
import { AuditLogs } from '@components/super-admin/audit';

export default function AuditLogsPage() {
  const handleLogSelect = (log: AuditLogEntry) => {
    showLogDetails(log);
  };

  const handleAlert = (alert: LogAlert) => {
    notifySecurityTeam(alert);
  };

  return (
    <AuditLogs
      pageSize={50}
      defaultFilters={{
        dateRange: [subDays(new Date(), 7), new Date()],
        severity: ['error', 'critical']
      }}
      defaultSort={{
        field: 'timestamp',
        direction: 'desc'
      }}
      liveTracking={true}
      onLogSelect={handleLogSelect}
      onAlert={handleAlert}
      viewType="table"
    />
  );
}
```

## Tablo Kolonları

```tsx
const columns: Column<AuditLogEntry>[] = [
  {
    id: 'timestamp',
    header: 'Zaman',
    cell: (row) => format(new Date(row.timestamp), 'dd.MM.yyyy HH:mm:ss'),
    sortable: true
  },
  {
    id: 'severity',
    header: 'Önem',
    cell: (row) => <SeverityBadge severity={row.severity} />,
    sortable: true
  },
  {
    id: 'action',
    header: 'İşlem',
    cell: (row) => row.action,
    sortable: true
  },
  {
    id: 'actor',
    header: 'Aktör',
    cell: (row) => (
      <ActorInfo
        name={row.actor.name}
        type={row.actor.type}
        role={row.actor.role}
      />
    ),
    sortable: true
  },
  {
    id: 'target',
    header: 'Hedef',
    cell: (row) => (
      <TargetInfo
        name={row.target.name}
        type={row.target.type}
      />
    ),
    sortable: true
  }
];
```

## API Entegrasyonu

```typescript
// Log listesi alma
const fetchLogs = async (params: ListParams) => {
  const response = await fetch('/api/audit-logs', {
    method: 'GET',
    params: {
      page: params.page,
      limit: params.pageSize,
      sort: `${params.sort.field}:${params.sort.direction}`,
      ...params.filters
    }
  });
  return response.json();
};

// Gerçek zamanlı log takibi
const subscribeToLogs = (callback: (log: AuditLogEntry) => void) => {
  const ws = new WebSocket('wss://api.iqraedu.com/audit-logs/stream');
  
  ws.onmessage = (event) => {
    const log = JSON.parse(event.data);
    callback(log);
  };

  return () => ws.close();
};

// Log dışa aktarma
const exportLogs = async (format: 'csv' | 'json', filters: AuditLogFilters) => {
  const response = await fetch('/api/audit-logs/export', {
    method: 'POST',
    body: JSON.stringify({ format, filters })
  });
  return response.blob();
};
```

## Filtreleme

```tsx
<AuditLogFilters
  filters={filters}
  onFilterChange={handleFilterChange}
  categories={availableCategories}
  actors={availableActors}
  actions={availableActions}
/>
```

## İstatistik Görünümü

```tsx
<AuditLogStats
  data={logs}
  groupBy="category"
  timeRange={filters.dateRange}
  showChart
/>
```

## Erişilebilirlik

- Tablo başlıkları için aria-sort
- Filtreleme kontrolleri için aria-controls
- Log detayları için aria-expanded
- Klavye navigasyonu
- Screen reader desteği

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 1200px | Tam tablo görünümü |
| 768px - 1200px | Gizlenmiş kolonlar |
| < 768px | Liste görünümü |

## Test

```typescript
describe('AuditLogs', () => {
  it('renders log list', async () => {
    render(
      <AuditLogs
        pageSize={10}
        defaultSort={{ field: 'timestamp', direction: 'desc' }}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  it('handles filtering', async () => {
    render(<AuditLogs />);
    
    await userEvent.click(screen.getByText('Filtrele'));
    await userEvent.click(screen.getByText('Kritik'));
    
    expect(screen.getByText('1 filtre aktif')).toBeInTheDocument();
  });

  it('shows log details', async () => {
    const onLogSelect = jest.fn();
    render(
      <AuditLogs
        onLogSelect={onLogSelect}
      />
    );
    
    await userEvent.click(screen.getByText('Detaylar'));
    expect(onLogSelect).toHaveBeenCalled();
  });

  it('handles live tracking', async () => {
    render(
      <AuditLogs
        liveTracking={true}
      />
    );
    
    // Simulate new log
    mockWebSocket.emit('message', {
      action: 'user.login',
      severity: 'info'
    });
    
    await waitFor(() => {
      expect(screen.getByText('user.login')).toBeInTheDocument();
    });
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { AuditLogs } from './AuditLogs';

export default {
  title: 'Super Admin/AuditLogs',
  component: AuditLogs
};

const Template: Story = (args) => <AuditLogs {...args} />;

export const Default = Template.bind({});
Default.args = {
  pageSize: 10,
  viewType: 'table'
};

export const Timeline = Template.bind({});
Timeline.args = {
  viewType: 'timeline',
  defaultFilters: {
    severity: ['critical']
  }
};

export const WithStats = Template.bind({});
WithStats.args = {
  showStats: true,
  groupBy: 'category'
};

export const LiveTracking = Template.bind({});
LiveTracking.args = {
  liveTracking: true,
  autoScroll: true
};
```

## Bağımlılıklar

- @tanstack/react-table
- @tanstack/react-query
- date-fns
- recharts
- @headlessui/react

## Stil Özelleştirme

```tsx
<AuditLogs
  className="audit-logs"
  tableClassName="log-table"
  rowClassName={(log) =>
    clsx('log-row', {
      'bg-red-50': log.severity === 'critical',
      'bg-yellow-50': log.severity === 'warning'
    })
  }
  customStyles={{
    header: 'bg-gray-50',
    filters: 'border-b border-gray-200',
    stats: 'bg-white shadow-sm'
  }}
/>
```

## Best Practices

1. Performans optimizasyonu yap
2. Filtreleri URL'de tut
3. Kritik logları vurgula
4. Log detaylarını önbelleğe al
5. Gerçek zamanlı takibi optimize et 