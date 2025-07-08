# TenantList Komponenti

Tenant listesini tablo formatında görüntüleyen ve yönetmeyi sağlayan komponent.

## Özellikler

- Sayfalama
- Sıralama
- Filtreleme
- Toplu işlemler
- Responsive tasarım
- CSV/Excel export

## Props

```typescript
interface TenantListProps {
  /** Sayfa başına gösterilecek kayıt sayısı */
  pageSize?: number;
  
  /** Varsayılan sıralama kolonu */
  defaultSortColumn?: string;
  
  /** Varsayılan sıralama yönü */
  defaultSortDirection?: 'asc' | 'desc';
  
  /** Özel filtre komponenti */
  FilterComponent?: React.ComponentType<FilterProps>;
  
  /** Seçili tenant değiştiğinde çağrılır */
  onTenantSelect?: (tenant: Tenant) => void;
  
  /** Toplu işlem yapıldığında çağrılır */
  onBulkAction?: (action: string, tenants: Tenant[]) => void;
}

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  subscription: {
    plan: string;
    validUntil: string;
  };
}

interface FilterProps {
  onFilterChange: (filters: TenantFilter) => void;
}

interface TenantFilter {
  status?: string[];
  search?: string;
  dateRange?: [Date, Date];
}
```

## Kullanım

```tsx
import { TenantList } from '@components/super-admin/tenant';

export default function TenantsPage() {
  const handleTenantSelect = (tenant: Tenant) => {
    console.log('Selected tenant:', tenant);
  };

  const handleBulkAction = (action: string, tenants: Tenant[]) => {
    console.log('Bulk action:', action, tenants);
  };

  return (
    <TenantList
      pageSize={10}
      defaultSortColumn="createdAt"
      defaultSortDirection="desc"
      onTenantSelect={handleTenantSelect}
      onBulkAction={handleBulkAction}
    />
  );
}
```

## API Entegrasyonu

Komponent, `/api/tenants` endpoint'ini kullanarak veri alışverişi yapar:

```typescript
// Tenant listesi alma
const { data, isLoading } = useQuery(['tenants', filters], () =>
  fetch('/api/tenants', {
    params: {
      page,
      limit: pageSize,
      ...filters
    }
  })
);

// Tenant durumu güncelleme
const { mutate } = useMutation((data: UpdateTenantData) =>
  fetch(`/api/tenants/${data.id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
);
```

## Tablo Kolonları

| Kolon | Açıklama | Sıralanabilir | Filtrelenebilir |
|-------|----------|---------------|-----------------|
| İsim | Tenant adı | ✓ | ✓ |
| Domain | Tenant domaini | ✓ | ✓ |
| Durum | Aktif/Askıya alınmış/Silinmiş | ✓ | ✓ |
| Plan | Abonelik planı | ✓ | ✓ |
| Oluşturulma | Oluşturulma tarihi | ✓ | ✓ |
| İşlemler | Düzenleme/Silme butonları | ✗ | ✗ |

## Toplu İşlemler

- Seçili tenantları aktifleştir
- Seçili tenantları askıya al
- Seçili tenantları sil
- Seçili tenantların planını güncelle

## Filtreleme

- Durum filtresi (çoklu seçim)
- Metin arama (isim ve domain)
- Tarih aralığı
- Plan filtresi

## Erişilebilirlik

- ARIA etiketleri
- Klavye navigasyonu
- Yüksek kontrast desteği
- Screen reader uyumluluğu

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 1024px | Tam tablo görünümü |
| 768px - 1024px | Bazı kolonlar gizlenir |
| < 768px | Kart görünümüne geçer |

## Performans

- Sayfalama ile lazy loading
- Debounced arama
- Memoized render
- Optimized re-render

## Hata Yönetimi

```tsx
try {
  // API çağrısı
} catch (error) {
  if (error.status === 401) {
    // Yetki hatası
    showUnauthorizedError();
  } else if (error.status === 429) {
    // Rate limit hatası
    showRateLimitError();
  } else {
    // Genel hata
    showGeneralError();
  }
}
```

## Test

```typescript
describe('TenantList', () => {
  it('renders tenant list correctly', () => {
    render(<TenantList />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('handles pagination', async () => {
    render(<TenantList />);
    await userEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Page 2')).toBeInTheDocument();
  });

  it('handles sorting', async () => {
    render(<TenantList />);
    await userEvent.click(screen.getByText('Name'));
    expect(screen.getByText('▲')).toBeInTheDocument();
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { TenantList } from './TenantList';

export default {
  title: 'Super Admin/TenantList',
  component: TenantList
};

const Template: Story = (args) => <TenantList {...args} />;

export const Default = Template.bind({});
Default.args = {
  pageSize: 10
};

export const WithFilters = Template.bind({});
WithFilters.args = {
  pageSize: 10,
  FilterComponent: CustomFilter
};
```

## Bağımlılıklar

- @tanstack/react-table
- @tanstack/react-query
- date-fns
- clsx
- @headlessui/react

## Stil Özelleştirme

```tsx
<TenantList
  className="custom-table"
  rowClassName={(tenant) =>
    clsx('hover:bg-gray-50', {
      'bg-red-50': tenant.status === 'suspended'
    })
  }
/>
```

## Best Practices

1. Filtreleri URL'de tut
2. Seçimleri local storage'da sakla
3. Bulk işlemleri confirm et
4. Rate limit kontrolü yap
5. Error boundary kullan 