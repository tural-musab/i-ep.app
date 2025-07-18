# BackupList Komponenti

Yedekleme işlemlerini listeleyen ve yöneten komponent.

## Özellikler

- Yedekleme listesi görüntüleme
- Filtreleme ve arama
- Sıralama
- Toplu işlemler
- Detay görüntüleme
- İndirme yönetimi
- Durum takibi

## Props

```typescript
interface BackupListProps {
  /** Tenant ID */
  tenantId?: string;

  /** Sayfa başına kayıt sayısı */
  pageSize?: number;

  /** Varsayılan sıralama */
  defaultSort?: SortConfig;

  /** Varsayılan filtreler */
  defaultFilters?: BackupFilters;

  /** Yedekleme seçildiğinde çağrılır */
  onBackupSelect?: (backup: BackupItem) => void;

  /** Toplu işlem yapıldığında çağrılır */
  onBulkAction?: (action: BulkAction, backups: BackupItem[]) => void;

  /** Yenileme aralığı (ms) */
  refreshInterval?: number;

  /** Görünüm tipi */
  viewType?: 'table' | 'grid' | 'list';
}

interface BackupItem {
  id: string;
  type: BackupType;
  status: BackupState;
  createdAt: string;
  completedAt?: string;
  size?: number;
  files?: number;
  tenant?: {
    id: string;
    name: string;
  };
  storage: {
    target: string;
    path: string;
  };
  retention: {
    policy: string;
    expiresAt?: string;
  };
}

interface BackupFilters {
  status?: BackupState[];
  type?: BackupType[];
  dateRange?: [Date, Date];
  tenant?: string;
  storage?: string;
  size?: [number, number];
}

interface SortConfig {
  field: keyof BackupItem;
  direction: 'asc' | 'desc';
}

type BulkAction = 'delete' | 'download' | 'restore' | 'verify';
```

## Kullanım

```tsx
import { BackupList } from '@components/super-admin/backup';

export default function BackupsPage() {
  const handleBackupSelect = (backup: BackupItem) => {
    router.push(`/backups/${backup.id}`);
  };

  const handleBulkAction = async (action: BulkAction, backups: BackupItem[]) => {
    switch (action) {
      case 'delete':
        await deleteBackups(backups.map((b) => b.id));
        break;
      case 'download':
        await downloadBackups(backups.map((b) => b.id));
        break;
      // ... diğer işlemler
    }
  };

  return (
    <BackupList
      pageSize={20}
      defaultSort={{
        field: 'createdAt',
        direction: 'desc',
      }}
      defaultFilters={{
        status: ['completed'],
        dateRange: [subDays(new Date(), 30), new Date()],
      }}
      onBackupSelect={handleBackupSelect}
      onBulkAction={handleBulkAction}
      refreshInterval={30000}
      viewType="table"
    />
  );
}
```

## Tablo Kolonları

```tsx
const columns: Column<BackupItem>[] = [
  {
    id: 'status',
    header: 'Durum',
    cell: (row) => <BackupStatusBadge status={row.status} />,
    sortable: true,
  },
  {
    id: 'type',
    header: 'Tip',
    cell: (row) => row.type,
    sortable: true,
  },
  {
    id: 'createdAt',
    header: 'Oluşturulma',
    cell: (row) => format(new Date(row.createdAt), 'dd.MM.yyyy HH:mm'),
    sortable: true,
  },
  {
    id: 'size',
    header: 'Boyut',
    cell: (row) => formatBytes(row.size),
    sortable: true,
  },
  {
    id: 'tenant',
    header: 'Tenant',
    cell: (row) => row.tenant?.name,
    sortable: true,
  },
  {
    id: 'actions',
    header: 'İşlemler',
    cell: (row) => <BackupActions backup={row} onAction={handleAction} />,
  },
];
```

## API Entegrasyonu

```typescript
// Yedekleme listesi alma
const fetchBackups = async (params: ListParams) => {
  const response = await fetch('/api/backups', {
    method: 'GET',
    params: {
      page: params.page,
      limit: params.pageSize,
      sort: `${params.sort.field}:${params.sort.direction}`,
      ...params.filters,
    },
  });
  return response.json();
};

// Toplu silme
const deleteBackups = async (ids: string[]) => {
  const response = await fetch('/api/backups/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
  return response.json();
};

// Toplu indirme
const downloadBackups = async (ids: string[]) => {
  const response = await fetch('/api/backups/bulk-download', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
  return response.blob();
};
```

## Filtreleme

```tsx
<BackupFilters
  filters={filters}
  onFilterChange={handleFilterChange}
  tenants={tenants}
  storageTargets={storageTargets}
/>
```

## Toplu İşlemler

```tsx
<BackupBulkActions
  selectedBackups={selected}
  onAction={handleBulkAction}
  disabled={!selected.length}
/>
```

## Erişilebilirlik

- Tablo başlıkları için aria-sort
- Seçim kontrolleri için aria-selected
- Durum bildirimleri için live region
- Klavye navigasyonu
- Focus yönetimi

## Responsive Davranış

| Ekran Boyutu   | Davranış           |
| -------------- | ------------------ |
| > 1200px       | Tam tablo görünümü |
| 768px - 1200px | Gizlenmiş kolonlar |
| < 768px        | Liste görünümü     |

## Test

```typescript
describe('BackupList', () => {
  it('renders backup list', async () => {
    render(
      <BackupList
        pageSize={10}
        defaultSort={{ field: 'createdAt', direction: 'desc' }}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  it('handles filtering', async () => {
    render(<BackupList />);

    await userEvent.click(screen.getByText('Filtrele'));
    await userEvent.click(screen.getByText('Tamamlandı'));

    expect(screen.getByText('1 filtre aktif')).toBeInTheDocument();
  });

  it('handles bulk actions', async () => {
    const onBulkAction = jest.fn();
    render(
      <BackupList
        onBulkAction={onBulkAction}
      />
    );

    await userEvent.click(screen.getByRole('checkbox', { name: 'Tümünü seç' }));
    await userEvent.click(screen.getByText('Toplu İşlem'));
    await userEvent.click(screen.getByText('Sil'));

    expect(onBulkAction).toHaveBeenCalledWith(
      'delete',
      expect.any(Array)
    );
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { BackupList } from './BackupList';

export default {
  title: 'Super Admin/BackupList',
  component: BackupList
};

const Template: Story = (args) => <BackupList {...args} />;

export const Default = Template.bind({});
Default.args = {
  pageSize: 10,
  viewType: 'table'
};

export const WithFilters = Template.bind({});
WithFilters.args = {
  defaultFilters: {
    status: ['completed'],
    dateRange: [new Date('2024-01-01'), new Date()]
  }
};

export const Loading = Template.bind({});
Loading.args = {
  loading: true
};

export const Empty = Template.bind({});
Empty.args = {
  data: []
};
```

## Bağımlılıklar

- @tanstack/react-table
- @tanstack/react-query
- date-fns
- bytes
- @headlessui/react

## Stil Özelleştirme

```tsx
<BackupList
  className="backup-list"
  tableClassName="data-table"
  rowClassName={(backup) =>
    clsx('backup-row', {
      'bg-red-50': backup.status === 'failed',
      'bg-green-50': backup.status === 'completed',
    })
  }
  customStyles={{
    header: 'bg-gray-50',
    cell: 'px-4 py-2',
    pagination: 'mt-4',
  }}
/>
```

## Best Practices

1. Sayfalama kullan
2. Filtreleri URL'de tut
3. Seçimleri önbelleğe al
4. Toplu işlemleri onayla
5. Durum güncellemelerini optimize et
