# TenantCreate Komponenti

Yeni tenant oluşturmak için kullanılan form komponenti.

## Özellikler

- Form validasyonu
- Alan maskeleme
- Domain kullanılabilirlik kontrolü
- Çoklu adımlı form
- Progress göstergesi
- Otomatik doldurma önerileri

## Props

```typescript
interface TenantCreateProps {
  /** Form gönderildiğinde çağrılır */
  onSubmit?: (data: TenantCreateData) => Promise<void>;
  
  /** İptal edildiğinde çağrılır */
  onCancel?: () => void;
  
  /** Başlangıç değerleri */
  initialValues?: Partial<TenantCreateData>;
  
  /** Form durumu */
  status?: 'idle' | 'submitting' | 'success' | 'error';
  
  /** Özel validasyon kuralları */
  validationRules?: ValidationRules;
}

interface TenantCreateData {
  name: string;
  domain: string;
  plan: string;
  adminUser: {
    email: string;
    firstName: string;
    lastName: string;
  };
  features?: string[];
  customDomain?: string;
}

interface ValidationRules {
  name?: ValidationRule;
  domain?: ValidationRule;
  email?: ValidationRule;
}

interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  validate?: (value: any) => boolean | string;
}
```

## Kullanım

```tsx
import { TenantCreate } from '@components/super-admin/tenant';

export default function CreateTenantPage() {
  const handleSubmit = async (data: TenantCreateData) => {
    try {
      await createTenant(data);
      showSuccess('Tenant başarıyla oluşturuldu');
    } catch (error) {
      showError('Tenant oluşturulurken hata oluştu');
    }
  };

  return (
    <TenantCreate
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      initialValues={{
        plan: 'premium'
      }}
    />
  );
}
```

## Form Adımları

### 1. Temel Bilgiler
- Tenant adı
- Subdomain
- Plan seçimi

### 2. Admin Kullanıcı
- E-posta
- Ad
- Soyad

### 3. Özellikler
- Feature flag seçimi
- Özel domain (opsiyonel)
- Ek ayarlar

### 4. Onay
- Özet bilgiler
- Kullanım koşulları
- Oluşturma onayı

## API Entegrasyonu

```typescript
// Domain kullanılabilirlik kontrolü
const checkDomain = async (domain: string) => {
  const response = await fetch('/api/domains/check', {
    method: 'POST',
    body: JSON.stringify({ domain })
  });
  return response.json();
};

// Tenant oluşturma
const createTenant = async (data: TenantCreateData) => {
  const response = await fetch('/api/tenants', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
};
```

## Validasyon Kuralları

```typescript
const validationRules = {
  name: {
    required: 'Tenant adı zorunludur',
    minLength: {
      value: 3,
      message: 'En az 3 karakter olmalıdır'
    },
    pattern: {
      value: /^[a-zA-Z0-9-]+$/,
      message: 'Sadece harf, rakam ve tire kullanılabilir'
    }
  },
  domain: {
    required: 'Domain zorunludur',
    pattern: {
      value: /^[a-z0-9-]+$/,
      message: 'Sadece küçük harf, rakam ve tire kullanılabilir'
    },
    validate: async (value) => {
      const { available } = await checkDomain(value);
      return available || 'Bu domain kullanımda';
    }
  },
  email: {
    required: 'E-posta zorunludur',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Geçerli bir e-posta adresi giriniz'
    }
  }
};
```

## Form State Yönetimi

```typescript
import { useForm } from 'react-hook-form';

const {
  register,
  handleSubmit,
  watch,
  formState: { errors, isSubmitting }
} = useForm<TenantCreateData>({
  defaultValues: initialValues,
  resolver: yupResolver(schema)
});
```

## Progress Göstergesi

```tsx
<ProgressBar
  steps={[
    { label: 'Temel Bilgiler', completed: step > 1 },
    { label: 'Admin Kullanıcı', completed: step > 2 },
    { label: 'Özellikler', completed: step > 3 },
    { label: 'Onay', completed: step > 4 }
  ]}
  currentStep={step}
/>
```

## Erişilebilirlik

- Form kontrolleri için label kullanımı
- Error mesajları için aria-invalid
- Required alanlar için aria-required
- Klavye navigasyonu
- Focus yönetimi

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 1024px | Yan yana form grupları |
| 768px - 1024px | Tek kolon form |
| < 768px | Basitleştirilmiş görünüm |

## Hata Yönetimi

```tsx
const handleError = (error: any) => {
  if (error.code === 'DOMAIN_TAKEN') {
    setError('domain', {
      type: 'manual',
      message: 'Bu domain zaten kullanımda'
    });
  } else if (error.code === 'INVALID_PLAN') {
    setError('plan', {
      type: 'manual',
      message: 'Geçersiz plan seçimi'
    });
  } else {
    setError('root', {
      type: 'manual',
      message: 'Bir hata oluştu'
    });
  }
};
```

## Test

```typescript
describe('TenantCreate', () => {
  it('validates required fields', async () => {
    render(<TenantCreate />);
    await userEvent.click(screen.getByText('Oluştur'));
    expect(screen.getByText('Tenant adı zorunludur')).toBeInTheDocument();
  });

  it('checks domain availability', async () => {
    render(<TenantCreate />);
    await userEvent.type(screen.getByLabelText('Domain'), 'test');
    await waitFor(() => {
      expect(screen.getByText('Bu domain kullanımda')).toBeInTheDocument();
    });
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { TenantCreate } from './TenantCreate';

export default {
  title: 'Super Admin/TenantCreate',
  component: TenantCreate,
  argTypes: {
    status: {
      control: {
        type: 'select',
        options: ['idle', 'submitting', 'success', 'error']
      }
    }
  }
};

const Template: Story = (args) => <TenantCreate {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const WithInitialValues = Template.bind({});
WithInitialValues.args = {
  initialValues: {
    plan: 'premium',
    features: ['feature1', 'feature2']
  }
};
```

## Bağımlılıklar

- react-hook-form
- @hookform/resolvers/yup
- yup
- clsx
- @headlessui/react

## Stil Özelleştirme

```tsx
<TenantCreate
  className="max-w-2xl mx-auto"
  formClassName="space-y-6"
  fieldClassName="form-field"
  buttonClassName="btn-primary"
/>
```

## Best Practices

1. Form state'i URL'de tut
2. Adımlar arası veriyi sakla
3. Input debouncing kullan
4. Async validasyon cache'le
5. Progress otomatik kaydet 