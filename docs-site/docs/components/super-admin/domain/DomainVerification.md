# DomainVerification Komponenti

Domain doğrulama sürecini yöneten ve görselleştiren komponent.

## Özellikler

- DNS kayıt kontrolü
- Otomatik yenileme
- Adım adım rehberlik
- Kopyala-yapıştır desteği
- SSL sertifika durumu
- Hata düzeltme önerileri

## Props

```typescript
interface DomainVerificationProps {
  /** Tenant ID */
  tenantId: string;
  
  /** Domain adresi */
  domain: string;
  
  /** Doğrulama tamamlandığında çağrılır */
  onVerified?: () => void;
  
  /** Doğrulama başarısız olduğunda çağrılır */
  onError?: (error: VerificationError) => void;
  
  /** Otomatik kontrol aralığı (ms) */
  checkInterval?: number;
  
  /** Maksimum deneme sayısı */
  maxAttempts?: number;
}

interface VerificationError {
  code: 'DNS_NOT_PROPAGATED' | 'RECORD_NOT_FOUND' | 'INVALID_RECORD' | 'SSL_ERROR';
  message: string;
  details?: any;
}

interface VerificationStatus {
  status: 'pending' | 'checking' | 'verified' | 'failed';
  dnsRecord?: {
    type: string;
    name: string;
    value: string;
  };
  ssl?: {
    status: 'pending' | 'active' | 'error';
    expiresAt?: string;
  };
}
```

## Kullanım

```tsx
import { DomainVerification } from '@components/super-admin/domain';

export default function VerifyDomainPage() {
  const handleVerified = () => {
    showSuccess('Domain başarıyla doğrulandı');
    router.push('/domains');
  };

  const handleError = (error: VerificationError) => {
    showError(`Doğrulama hatası: ${error.message}`);
  };

  return (
    <DomainVerification
      tenantId="tenant_123"
      domain="example.com"
      onVerified={handleVerified}
      onError={handleError}
      checkInterval={30000}
      maxAttempts={10}
    />
  );
}
```

## Doğrulama Adımları

### 1. DNS Kaydı Oluşturma
```tsx
<DNSInstructions
  record={{
    type: 'TXT',
    name: '_iqraedu-verify.example.com',
    value: 'iqraedu-verify=abc123'
  }}
  onCopy={() => copyToClipboard(record.value)}
/>
```

### 2. Propagasyon Bekleme
```tsx
<PropagationStatus
  startTime={startTime}
  expectedTime={300000}
  currentStatus={status}
/>
```

### 3. SSL Sertifika Oluşturma
```tsx
<SSLStatus
  status={sslStatus}
  domain={domain}
  onRetry={handleRetry}
/>
```

## API Entegrasyonu

```typescript
// Domain durumu kontrolü
const checkDomainStatus = async () => {
  const response = await fetch(`/api/tenants/${tenantId}/domains/verify`, {
    method: 'POST',
    body: JSON.stringify({ domain })
  });
  return response.json();
};

// SSL sertifika durumu
const checkSSLStatus = async () => {
  const response = await fetch(`/api/tenants/${tenantId}/domains/ssl`);
  return response.json();
};
```

## Durum Yönetimi

```typescript
const [status, setStatus] = useState<VerificationStatus>({
  status: 'pending',
  dnsRecord: {
    type: 'TXT',
    name: `_iqraedu-verify.${domain}`,
    value: generateVerificationToken()
  }
});

useEffect(() => {
  const interval = setInterval(async () => {
    const newStatus = await checkDomainStatus();
    setStatus(newStatus);
    
    if (newStatus.status === 'verified') {
      clearInterval(interval);
      onVerified?.();
    }
  }, checkInterval);

  return () => clearInterval(interval);
}, []);
```

## Hata İşleme

```typescript
const handleVerificationError = (error: VerificationError) => {
  switch (error.code) {
    case 'DNS_NOT_PROPAGATED':
      return showPropagationHelp();
    case 'RECORD_NOT_FOUND':
      return showDNSInstructions();
    case 'INVALID_RECORD':
      return showRecordComparison(error.details);
    case 'SSL_ERROR':
      return showSSLTroubleshooting();
    default:
      return showGeneralError();
  }
};
```

## Progress Gösterimi

```tsx
<VerificationProgress
  steps={[
    {
      label: 'DNS Kaydı',
      status: dnsVerified ? 'complete' : 'pending'
    },
    {
      label: 'Propagasyon',
      status: propagated ? 'complete' : dnsVerified ? 'current' : 'waiting'
    },
    {
      label: 'SSL Sertifika',
      status: sslReady ? 'complete' : propagated ? 'current' : 'waiting'
    }
  ]}
/>
```

## Erişilebilirlik

- Live region güncellemeleri
- Progress durumu bildirimleri
- Klavye ile kopyalama
- Yardım metinleri
- Focus yönetimi

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 1024px | Yan yana adımlar |
| 768px - 1024px | Dikey adımlar |
| < 768px | Basitleştirilmiş görünüm |

## Test

```typescript
describe('DomainVerification', () => {
  it('shows DNS instructions initially', () => {
    render(<DomainVerification domain="example.com" />);
    expect(screen.getByText('DNS Kaydı Ekleyin')).toBeInTheDocument();
  });

  it('updates status periodically', async () => {
    jest.useFakeTimers();
    render(<DomainVerification domain="example.com" checkInterval={1000} />);
    
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.getByText('Kontrol Ediliyor')).toBeInTheDocument();
    });
  });

  it('handles verification success', async () => {
    const onVerified = jest.fn();
    render(
      <DomainVerification
        domain="example.com"
        onVerified={onVerified}
      />
    );
    
    // Simulate verification
    await waitFor(() => {
      expect(onVerified).toHaveBeenCalled();
    });
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { DomainVerification } from './DomainVerification';

export default {
  title: 'Super Admin/DomainVerification',
  component: DomainVerification
};

const Template: Story = (args) => <DomainVerification {...args} />;

export const Initial = Template.bind({});
Initial.args = {
  domain: 'example.com'
};

export const Verifying = Template.bind({});
Verifying.args = {
  domain: 'example.com',
  status: {
    status: 'checking',
    dnsRecord: {
      type: 'TXT',
      name: '_iqraedu-verify.example.com',
      value: 'verification-token'
    }
  }
};

export const Success = Template.bind({});
Success.args = {
  domain: 'example.com',
  status: {
    status: 'verified',
    ssl: {
      status: 'active',
      expiresAt: '2025-03-20T10:00:00Z'
    }
  }
};
```

## Bağımlılıklar

- @tanstack/react-query
- date-fns
- clsx
- @headlessui/react
- react-copy-to-clipboard

## Stil Özelleştirme

```tsx
<DomainVerification
  className="max-w-3xl mx-auto"
  stepClassName="verification-step"
  recordClassName="dns-record"
  buttonClassName="verify-button"
/>
```

## Best Practices

1. DNS kayıtlarını açık göster
2. Propagasyon süresini belirt
3. Otomatik yenileme durumunu göster
4. Hata mesajlarını detaylandır
5. SSL durumunu takip et 