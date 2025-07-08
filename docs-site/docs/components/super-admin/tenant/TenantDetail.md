# TenantDetail Komponenti

Tenant detay bilgilerini görüntüleyen ve yöneten komponent.

## Özellikler

- Genel bilgi görüntüleme
- Kullanım istatistikleri
- Abonelik yönetimi
- Kullanıcı yönetimi
- Domain yönetimi
- Aktivite logları
- Yedekleme yönetimi

## Props

```typescript
interface TenantDetailProps {
  /** Tenant ID */
  tenantId: string;
  
  /** Görüntülenecek sekmeler */
  tabs?: TabType[];
  
  /** Aktif sekme */
  activeTab?: string;
  
  /** Sekme değiştiğinde çağrılır */
  onTabChange?: (tab: string) => void;
  
  /** Tenant güncellendiğinde çağrılır */
  onTenantUpdate?: (tenant: TenantData) => void;
  
  /** Hata durumunda çağrılır */
  onError?: (error: Error) => void;
}

interface TenantData {
  id: string;
  name: string;
  domain: string;
  status: TenantStatus;
  createdAt: string;
  subscription: {
    plan: string;
    validUntil: string;
    features: string[];
    limits: {
      users: number;
      storage: number;
      bandwidth: number;
    };
  };
  usage: {
    users: {
      total: number;
      active: number;
    };
    storage: {
      used: number;
      total: number;
    };
    bandwidth: {
      monthly: number;
      limit: number;
    };
  };
  customization: {
    logo?: string;
    theme?: ThemeConfig;
    settings?: Record<string, any>;
  };
}

type TabType = 'overview' | 'users' | 'domains' | 'subscription' | 'activity' | 'backups' | 'settings';
type TenantStatus = 'active' | 'suspended' | 'deleted';
```

## Kullanım

```tsx
import { TenantDetail } from '@components/super-admin/tenant';

export default function TenantDetailPage() {
  const { tenantId } = useParams();
  
  const handleTenantUpdate = async (tenant: TenantData) => {
    try {
      await updateTenant(tenant);
      showSuccess('Tenant başarıyla güncellendi');
    } catch (error) {
      showError('Tenant güncellenirken hata oluştu');
    }
  };

  return (
    <TenantDetail
      tenantId={tenantId}
      tabs={['overview', 'users', 'subscription', 'activity']}
      activeTab="overview"
      onTenantUpdate={handleTenantUpdate}
    />
  );
}
```

## Sekmeler

### Overview
```tsx
<OverviewTab
  tenant={tenant}
  stats={stats}
  onStatusChange={handleStatusChange}
/>
```

### Users
```tsx
<UsersTab
  users={users}
  onUserAdd={handleUserAdd}
  onUserRemove={handleUserRemove}
  onRoleChange={handleRoleChange}
/>
```

### Subscription
```tsx
<SubscriptionTab
  subscription={subscription}
  plans={availablePlans}
  onPlanChange={handlePlanChange}
  onFeatureToggle={handleFeatureToggle}
/>
```

### Activity
```tsx
<ActivityTab
  logs={activityLogs}
  filters={logFilters}
  onFilterChange={handleFilterChange}
/>
```

## API Entegrasyonu

```typescript
// Tenant detayı alma
const { data: tenant, isLoading } = useQuery(
  ['tenant', tenantId],
  () => fetchTenantDetails(tenantId)
);

// Tenant güncelleme
const { mutate: updateTenant } = useMutation(
  (data: Partial<TenantData>) =>
    fetch(`/api/tenants/${tenantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
);

// Kullanım istatistikleri
const { data: stats } = useQuery(
  ['tenant-stats', tenantId],
  () => fetchTenantStats(tenantId),
  {
    refetchInterval: 60000 // Her dakika güncelle
  }
);
```

## Veri Modelleri

### Kullanıcı
```typescript
interface TenantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
}

type UserRole = 'admin' | 'teacher' | 'student';
type UserStatus = 'active' | 'inactive' | 'blocked';
```

### Aktivite Logu
```typescript
interface ActivityLog {
  id: string;
  action: string;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  details: Record<string, any>;
}
```

## Erişilebilirlik

- Tab panelleri için ARIA labels
- Keyboard navigation
- Focus management
- Status announcements
- Interactive elements

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 1200px | Tam genişlik, yan panel |
| 768px - 1200px | Tam genişlik, üst panel |
| < 768px | Tekli görünüm, sekmeler menüde |

## Hata Yönetimi

```typescript
const handleError = (error: Error) => {
  if (error.name === 'NotFoundError') {
    router.push('/404');
  } else if (error.name === 'AuthorizationError') {
    router.push('/403');
  } else {
    showErrorNotification(error.message);
  }
};
```

## Test

```typescript
describe('TenantDetail', () => {
  it('loads tenant details', async () => {
    render(<TenantDetail tenantId="test-tenant" />);
    
    await waitFor(() => {
      expect(screen.getByText('Tenant Detayları')).toBeInTheDocument();
    });
  });

  it('handles tab switching', async () => {
    render(<TenantDetail tenantId="test-tenant" />);
    
    await userEvent.click(screen.getByText('Kullanıcılar'));
    expect(screen.getByText('Kullanıcı Listesi')).toBeInTheDocument();
  });

  it('updates tenant status', async () => {
    const onTenantUpdate = jest.fn();
    render(
      <TenantDetail
        tenantId="test-tenant"
        onTenantUpdate={onTenantUpdate}
      />
    );
    
    await userEvent.click(screen.getByText('Askıya Al'));
    expect(onTenantUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'suspended' })
    );
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { TenantDetail } from './TenantDetail';

export default {
  title: 'Super Admin/TenantDetail',
  component: TenantDetail,
  parameters: {
    layout: 'fullscreen'
  }
};

const Template: Story = (args) => <TenantDetail {...args} />;

export const Default = Template.bind({});
Default.args = {
  tenantId: 'test-tenant',
  tabs: ['overview', 'users', 'subscription', 'activity']
};

export const Loading = Template.bind({});
Loading.args = {
  tenantId: 'loading-tenant'
};

export const WithError = Template.bind({});
WithError.args = {
  tenantId: 'error-tenant'
};
```

## Bağımlılıklar

- @tanstack/react-query
- @headlessui/react
- date-fns
- recharts
- clsx

## Stil Özelleştirme

```tsx
<TenantDetail
  className="tenant-detail"
  tabClassName="detail-tab"
  contentClassName="tab-content"
  statClassName="stat-card"
  customStyles={{
    header: 'bg-primary-700',
    tabs: 'border-b border-gray-200',
    content: 'p-6'
  }}
/>
```

## Best Practices

1. Veriyi önbelleğe al
2. Optimistik güncellemeler kullan
3. Sekme durumunu URL'de tut
4. Yetkilendirme kontrolü yap
5. İşlem geçmişini logla 