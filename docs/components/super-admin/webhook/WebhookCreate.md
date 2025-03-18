# WebhookCreate Komponenti

Yeni webhook oluşturmak için kullanılan form komponenti.

## Özellikler

- Webhook yapılandırma
- Event seçimi
- Güvenlik ayarları
- Test aracı
- Şablon desteği
- Doğrulama
- Önizleme

## Props

```typescript
interface WebhookCreateProps {
  /** Tenant ID */
  tenantId?: string;
  
  /** Başlangıç değerleri */
  initialValues?: Partial<WebhookConfig>;
  
  /** Form gönderildiğinde çağrılır */
  onSubmit?: (config: WebhookConfig) => Promise<void>;
  
  /** İptal edildiğinde çağrılır */
  onCancel?: () => void;
  
  /** Test yapıldığında çağrılır */
  onTest?: (config: WebhookConfig) => Promise<TestResult>;
  
  /** Kullanılabilir eventler */
  availableEvents?: WebhookEvent[];
  
  /** Şablonlar */
  templates?: WebhookTemplate[];
  
  /** Form durumu */
  status?: 'idle' | 'validating' | 'testing' | 'submitting' | 'success' | 'error';
}

interface WebhookConfig {
  name: string;
  description?: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  events: string[];
  headers?: Record<string, string>;
  security: {
    type: 'none' | 'basic' | 'bearer' | 'hmac';
    username?: string;
    password?: string;
    token?: string;
    secret?: string;
  };
  retry: {
    enabled: boolean;
    maxAttempts?: number;
    backoff?: {
      type: 'fixed' | 'exponential';
      interval: number;
    };
  };
  filters?: {
    condition: 'and' | 'or';
    rules: FilterRule[];
  };
  transform?: {
    template: string;
    contentType: string;
  };
}

interface WebhookEvent {
  id: string;
  name: string;
  description: string;
  category: string;
  payload: Record<string, any>;
}

interface WebhookTemplate {
  id: string;
  name: string;
  description: string;
  config: Partial<WebhookConfig>;
}

interface FilterRule {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

interface TestResult {
  success: boolean;
  statusCode?: number;
  duration?: number;
  response?: any;
  error?: {
    code: string;
    message: string;
  };
}
```

## Kullanım

```tsx
import { WebhookCreate } from '@components/super-admin/webhook';

export default function CreateWebhookPage() {
  const handleSubmit = async (config: WebhookConfig) => {
    try {
      await createWebhook(config);
      showSuccess('Webhook başarıyla oluşturuldu');
      router.push('/webhooks');
    } catch (error) {
      showError('Webhook oluşturulamadı');
    }
  };

  const handleTest = async (config: WebhookConfig) => {
    return await testWebhook(config);
  };

  return (
    <WebhookCreate
      initialValues={{
        method: 'POST',
        retry: {
          enabled: true,
          maxAttempts: 3
        }
      }}
      onSubmit={handleSubmit}
      onTest={handleTest}
      availableEvents={events}
      templates={templates}
    />
  );
}
```

## Form Bölümleri

### Temel Bilgiler
```tsx
<BasicInfoSection
  values={values}
  errors={errors}
  onChange={handleChange}
/>
```

### Event Seçimi
```tsx
<EventSelector
  events={availableEvents}
  selected={values.events}
  onSelect={handleEventSelect}
  groupByCategory
/>
```

### Güvenlik Ayarları
```tsx
<SecuritySettings
  type={values.security.type}
  onChange={handleSecurityChange}
  onTest={handleSecurityTest}
/>
```

## API Entegrasyonu

```typescript
// Webhook oluşturma
const createWebhook = async (config: WebhookConfig) => {
  const response = await fetch('/api/webhooks', {
    method: 'POST',
    body: JSON.stringify(config)
  });
  return response.json();
};

// Webhook test
const testWebhook = async (config: WebhookConfig) => {
  const response = await fetch('/api/webhooks/test', {
    method: 'POST',
    body: JSON.stringify(config)
  });
  return response.json();
};

// Event listesi alma
const fetchEvents = async () => {
  const response = await fetch('/api/webhooks/events');
  return response.json();
};
```

## Form Validasyonu

```typescript
const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Webhook adı zorunludur')
    .min(3, 'En az 3 karakter olmalıdır'),
  url: yup
    .string()
    .required('URL zorunludur')
    .url('Geçerli bir URL giriniz'),
  events: yup
    .array()
    .of(yup.string())
    .min(1, 'En az bir event seçilmelidir'),
  security: yup.object().shape({
    type: yup.string().required('Güvenlik tipi seçilmelidir'),
    secret: yup.string().when('type', {
      is: 'hmac',
      then: yup.string().required('Secret zorunludur')
    })
  })
});
```

## Test Aracı

```tsx
<WebhookTester
  config={values}
  onTest={handleTest}
  showResponse
  showLatency
/>
```

## Erişilebilirlik

- Form kontrolleri için label kullanımı
- Error mesajları için aria-invalid
- Required alanlar için aria-required
- Test sonuçları için live region
- Klavye navigasyonu

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 1024px | Yan yana form grupları |
| 768px - 1024px | Tek kolon form |
| < 768px | Basitleştirilmiş görünüm |

## Test

```typescript
describe('WebhookCreate', () => {
  it('validates required fields', async () => {
    render(<WebhookCreate />);
    
    await userEvent.click(screen.getByText('Oluştur'));
    expect(screen.getByText('Webhook adı zorunludur')).toBeInTheDocument();
  });

  it('handles event selection', async () => {
    render(
      <WebhookCreate
        availableEvents={[
          { id: 'user.created', name: 'Kullanıcı Oluşturuldu' }
        ]}
      />
    );
    
    await userEvent.click(screen.getByText('Event Seç'));
    await userEvent.click(screen.getByText('Kullanıcı Oluşturuldu'));
    
    expect(screen.getByText('1 event seçildi')).toBeInTheDocument();
  });

  it('tests webhook configuration', async () => {
    const onTest = jest.fn().mockResolvedValue({
      success: true,
      statusCode: 200
    });
    
    render(
      <WebhookCreate
        onTest={onTest}
      />
    );
    
    await userEvent.click(screen.getByText('Test Et'));
    expect(screen.getByText('Test başarılı')).toBeInTheDocument();
  });

  it('applies template', async () => {
    render(
      <WebhookCreate
        templates={[
          {
            id: '1',
            name: 'Slack Notification',
            config: {
              url: 'https://hooks.slack.com/...',
              method: 'POST'
            }
          }
        ]}
      />
    );
    
    await userEvent.click(screen.getByText('Şablon Kullan'));
    await userEvent.click(screen.getByText('Slack Notification'));
    
    expect(screen.getByDisplayValue('https://hooks.slack.com/...'))
      .toBeInTheDocument();
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { WebhookCreate } from './WebhookCreate';

export default {
  title: 'Super Admin/WebhookCreate',
  component: WebhookCreate
};

const Template: Story = (args) => <WebhookCreate {...args} />;

export const Default = Template.bind({});
Default.args = {
  availableEvents: [
    {
      id: 'user.created',
      name: 'Kullanıcı Oluşturuldu',
      category: 'user'
    }
  ]
};

export const WithTemplate = Template.bind({});
WithTemplate.args = {
  templates: [
    {
      id: '1',
      name: 'Slack Notification',
      config: {
        url: 'https://hooks.slack.com/...',
        method: 'POST'
      }
    }
  ]
};

export const Testing = Template.bind({});
Testing.args = {
  status: 'testing'
};

export const WithError = Template.bind({});
WithError.args = {
  status: 'error'
};
```

## Bağımlılıklar

- react-hook-form
- @hookform/resolvers/yup
- yup
- @monaco-editor/react
- @headlessui/react

## Stil Özelleştirme

```tsx
<WebhookCreate
  className="webhook-form"
  sectionClassName="form-section"
  fieldClassName="form-field"
  buttonClassName="form-button"
  customStyles={{
    header: 'bg-gray-50',
    section: 'border rounded-lg p-4',
    test: {
      success: 'bg-green-50',
      error: 'bg-red-50'
    }
  }}
/>
```

## Best Practices

1. URL'leri doğrula
2. Güvenlik bilgilerini koru
3. Test sonuçlarını logla
4. Retry mekanizması ekle
5. Event filtrelerini optimize et 