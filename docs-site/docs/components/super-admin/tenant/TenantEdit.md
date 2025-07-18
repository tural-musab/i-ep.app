# TenantEdit Komponenti

Tenant bilgilerini düzenlemeyi sağlayan form komponenti.

## Özellikler

- Form validasyonu
- Çoklu sekme düzenleme
- Değişiklik takibi
- Otomatik kaydetme
- Sürüm geçmişi
- İşlem onaylama
- Eşzamanlı düzenleme kontrolü

## Props

```typescript
interface TenantEditProps {
  /** Tenant ID */
  tenantId: string;

  /** Başlangıç değerleri */
  initialValues?: Partial<TenantEditData>;

  /** Düzenlenebilir alanlar */
  editableFields?: EditableField[];

  /** Form gönderildiğinde çağrılır */
  onSubmit?: (data: TenantEditData) => Promise<void>;

  /** İptal edildiğinde çağrılır */
  onCancel?: () => void;

  /** Değişiklik olduğunda çağrılır */
  onChange?: (data: Partial<TenantEditData>) => void;

  /** Form durumu */
  status?: FormStatus;
}

interface TenantEditData {
  name: string;
  domain: string;
  status: TenantStatus;
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
  settings: {
    timezone: string;
    language: string;
    dateFormat: string;
    theme: ThemeConfig;
  };
  customization: {
    logo?: string;
    favicon?: string;
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  security: {
    mfa: boolean;
    passwordPolicy: PasswordPolicy;
    ipRestrictions: string[];
  };
}

type EditableField = keyof TenantEditData | `subscription.${keyof TenantEditData['subscription']}`;
type FormStatus = 'idle' | 'editing' | 'saving' | 'success' | 'error';
```

## Kullanım

```tsx
import { TenantEdit } from '@components/super-admin/tenant';

export default function EditTenantPage() {
  const { tenantId } = useParams();
  const { tenant } = useTenant(tenantId);

  const handleSubmit = async (data: TenantEditData) => {
    try {
      await updateTenant(tenantId, data);
      showSuccess('Tenant başarıyla güncellendi');
      router.push(`/tenants/${tenantId}`);
    } catch (error) {
      showError('Tenant güncellenirken hata oluştu');
    }
  };

  return (
    <TenantEdit
      tenantId={tenantId}
      initialValues={tenant}
      editableFields={['name', 'status', 'subscription.plan', 'subscription.features']}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  );
}
```

## Form Sekmeleri

### Genel Bilgiler

```tsx
<GeneralInfoTab values={values} errors={errors} onChange={handleChange} />
```

### Abonelik

```tsx
<SubscriptionTab
  values={values.subscription}
  plans={availablePlans}
  features={availableFeatures}
  onChange={handleSubscriptionChange}
/>
```

### Özelleştirme

```tsx
<CustomizationTab
  values={values.customization}
  onLogoUpload={handleLogoUpload}
  onColorChange={handleColorChange}
/>
```

### Güvenlik

```tsx
<SecurityTab
  values={values.security}
  onMfaToggle={handleMfaToggle}
  onPolicyChange={handlePolicyChange}
/>
```

## API Entegrasyonu

```typescript
// Tenant güncelleme
const updateTenant = async (data: TenantEditData) => {
  const response = await fetch(`/api/tenants/${tenantId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
};

// Logo yükleme
const uploadLogo = async (file: File) => {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await fetch(`/api/tenants/${tenantId}/logo`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

// Sürüm geçmişi
const fetchHistory = async () => {
  const response = await fetch(`/api/tenants/${tenantId}/history`);
  return response.json();
};
```

## Form Validasyonu

```typescript
const validationSchema = yup.object().shape({
  name: yup.string().required('Tenant adı zorunludur').min(3, 'En az 3 karakter olmalıdır'),
  domain: yup
    .string()
    .required('Domain zorunludur')
    .matches(/^[a-z0-9-]+$/, 'Geçersiz domain formatı'),
  subscription: yup.object().shape({
    plan: yup.string().required('Plan seçimi zorunludur'),
    validUntil: yup.date().required('Geçerlilik tarihi zorunludur'),
  }),
  security: yup.object().shape({
    ipRestrictions: yup
      .array()
      .of(yup.string().matches(/^(?:\d{1,3}\.){3}\d{1,3}$/, 'Geçersiz IP formatı')),
  }),
});
```

## Değişiklik Takibi

```typescript
const [changes, setChanges] = useState<Changes>({});
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```

## Eşzamanlı Düzenleme

```typescript
const [lockId, setLockId] = useState<string>();

useEffect(() => {
  const acquireLock = async () => {
    const lock = await fetch(`/api/tenants/${tenantId}/lock`, {
      method: 'POST',
    }).then((res) => res.json());

    setLockId(lock.id);
    return lock;
  };

  const releaseLock = async () => {
    if (lockId) {
      await fetch(`/api/tenants/${tenantId}/lock/${lockId}`, {
        method: 'DELETE',
      });
    }
  };

  acquireLock();
  return () => releaseLock();
}, [tenantId]);
```

## Erişilebilirlik

- Form kontrolleri için label kullanımı
- Error mesajları için aria-invalid
- Required alanlar için aria-required
- Değişiklik bildirimleri için live region
- Klavye navigasyonu

## Responsive Davranış

| Ekran Boyutu   | Davranış                 |
| -------------- | ------------------------ |
| > 1024px       | Yan yana form grupları   |
| 768px - 1024px | Tek kolon form           |
| < 768px        | Basitleştirilmiş görünüm |

## Test

```typescript
describe('TenantEdit', () => {
  it('validates required fields', async () => {
    render(<TenantEdit tenantId="test-tenant" />);

    await userEvent.click(screen.getByText('Kaydet'));
    expect(screen.getByText('Tenant adı zorunludur')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const onSubmit = jest.fn();
    render(
      <TenantEdit
        tenantId="test-tenant"
        onSubmit={onSubmit}
      />
    );

    await userEvent.type(screen.getByLabelText('Tenant Adı'), 'Test Tenant');
    await userEvent.click(screen.getByText('Kaydet'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Tenant' })
    );
  });

  it('tracks unsaved changes', async () => {
    render(<TenantEdit tenantId="test-tenant" />);

    await userEvent.type(screen.getByLabelText('Tenant Adı'), 'New Name');
    expect(screen.getByText('Kaydedilmemiş değişiklikler')).toBeInTheDocument();
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { TenantEdit } from './TenantEdit';

export default {
  title: 'Super Admin/TenantEdit',
  component: TenantEdit
};

const Template: Story = (args) => <TenantEdit {...args} />;

export const Default = Template.bind({});
Default.args = {
  tenantId: 'test-tenant',
  initialValues: {
    name: 'Test Tenant',
    domain: 'test-tenant',
    status: 'active'
  }
};

export const WithValidationErrors = Template.bind({});
WithValidationErrors.args = {
  tenantId: 'test-tenant',
  status: 'error'
};

export const ReadOnly = Template.bind({});
ReadOnly.args = {
  tenantId: 'test-tenant',
  editableFields: []
};
```

## Bağımlılıklar

- react-hook-form
- @hookform/resolvers/yup
- yup
- @headlessui/react
- date-fns
- clsx

## Stil Özelleştirme

```tsx
<TenantEdit
  className="tenant-edit-form"
  formClassName="edit-form"
  fieldClassName="form-field"
  buttonClassName="form-button"
  customStyles={{
    header: 'bg-gray-50',
    tabs: 'border-b border-gray-200',
    content: 'p-6',
  }}
/>
```

## Best Practices

1. Form state'i URL'de tut
2. Değişiklikleri otomatik kaydet
3. Validasyon mesajlarını anında göster
4. İşlem geçmişini tut
5. Eşzamanlı düzenlemeyi kontrol et
