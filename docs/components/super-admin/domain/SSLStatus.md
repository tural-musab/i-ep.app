# SSLStatus Komponenti

SSL sertifika durumunu görüntüleyen ve yöneten komponent.

## Özellikler

- SSL durum gösterimi
- Otomatik yenileme takibi
- Sertifika detayları
- Manuel yenileme
- Hata yönetimi
- Bildirim sistemi

## Props

```typescript
interface SSLStatusProps {
  /** Domain adresi */
  domain: string;
  
  /** Tenant ID */
  tenantId: string;
  
  /** Yenileme yapıldığında çağrılır */
  onRenew?: () => void;
  
  /** Hata durumunda çağrılır */
  onError?: (error: SSLError) => void;
  
  /** Otomatik kontrol aralığı (ms) */
  checkInterval?: number;
  
  /** Bildirim gösterme ayarı */
  showNotifications?: boolean;
}

interface SSLCertificate {
  status: SSLStatus;
  issuer: string;
  validFrom: string;
  validUntil: string;
  domains: string[];
  algorithm: string;
  fingerprint: string;
  serialNumber: string;
}

interface SSLError {
  code: SSLErrorCode;
  message: string;
  details?: any;
}

type SSLStatus = 'valid' | 'expired' | 'expiring_soon' | 'invalid' | 'pending';
type SSLErrorCode = 'VALIDATION_FAILED' | 'RATE_LIMIT' | 'DNS_ERROR' | 'INTERNAL_ERROR';
```

## Kullanım

```tsx
import { SSLStatus } from '@components/super-admin/domain';

export default function DomainSSLPage() {
  const handleRenew = () => {
    showSuccess('SSL sertifikası yenileme başlatıldı');
  };

  const handleError = (error: SSLError) => {
    showError(`SSL hatası: ${error.message}`);
  };

  return (
    <SSLStatus
      domain="example.com"
      tenantId="tenant_123"
      onRenew={handleRenew}
      onError={handleError}
      checkInterval={300000}
      showNotifications
    />
  );
}
```

## Durum Gösterimi

### Geçerli Sertifika
```tsx
<SSLBadge
  status="valid"
  expiresIn={30}
  showDays
/>
```

### Yakında Sona Erecek
```tsx
<SSLBadge
  status="expiring_soon"
  expiresIn={7}
  showWarning
/>
```

### Süresi Dolmuş
```tsx
<SSLBadge
  status="expired"
  showError
/>
```

## API Entegrasyonu

```typescript
// SSL durumu kontrolü
const checkSSLStatus = async () => {
  const response = await fetch(`/api/tenants/${tenantId}/domains/${domain}/ssl`);
  return response.json();
};

// Sertifika yenileme
const renewCertificate = async () => {
  const response = await fetch(
    `/api/tenants/${tenantId}/domains/${domain}/ssl/renew`,
    { method: 'POST' }
  );
  return response.json();
};

// Sertifika detayları
const getCertificateDetails = async () => {
  const response = await fetch(
    `/api/tenants/${tenantId}/domains/${domain}/ssl/details`
  );
  return response.json();
};
```

## Durum Yönetimi

```typescript
const [certificate, setCertificate] = useState<SSLCertificate>();
const [isChecking, setIsChecking] = useState(false);

useEffect(() => {
  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const status = await checkSSLStatus();
      setCertificate(status);
      
      if (status.status === 'expiring_soon') {
        showExpiryWarning(status.validUntil);
      }
    } catch (error) {
      onError?.(error);
    } finally {
      setIsChecking(false);
    }
  };

  const interval = setInterval(checkStatus, checkInterval);
  checkStatus();

  return () => clearInterval(interval);
}, [domain, checkInterval]);
```

## Bildirim Sistemi

```typescript
const showExpiryWarning = (expiryDate: string) => {
  const daysLeft = differenceInDays(new Date(expiryDate), new Date());
  
  if (daysLeft <= 7) {
    showNotification({
      type: 'warning',
      title: 'SSL Sertifikası Sona Eriyor',
      message: `Sertifikanız ${daysLeft} gün içinde sona erecek.`
    });
  }
};
```

## Erişilebilirlik

- ARIA labels
- Status announcements
- Color contrast
- Focus management
- Loading states

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 768px | Detaylı görünüm |
| < 768px | Özet görünüm |

## Test

```typescript
describe('SSLStatus', () => {
  it('displays certificate status', async () => {
    render(
      <SSLStatus
        domain="example.com"
        tenantId="tenant_123"
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('SSL Sertifikası Geçerli')).toBeInTheDocument();
    });
  });

  it('handles renewal', async () => {
    const onRenew = jest.fn();
    render(
      <SSLStatus
        domain="example.com"
        tenantId="tenant_123"
        onRenew={onRenew}
      />
    );
    
    await userEvent.click(screen.getByText('Yenile'));
    expect(onRenew).toHaveBeenCalled();
  });

  it('shows expiry warning', async () => {
    jest.useFakeTimers();
    render(
      <SSLStatus
        domain="example.com"
        tenantId="tenant_123"
        showNotifications
      />
    );
    
    // Simulate near expiry
    mockCertificateStatus({
      status: 'expiring_soon',
      validUntil: addDays(new Date(), 5)
    });
    
    await waitFor(() => {
      expect(screen.getByText('5 gün içinde sona erecek')).toBeInTheDocument();
    });
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { SSLStatus } from './SSLStatus';

export default {
  title: 'Super Admin/SSLStatus',
  component: SSLStatus
};

const Template: Story = (args) => <SSLStatus {...args} />;

export const Valid = Template.bind({});
Valid.args = {
  domain: 'example.com',
  tenantId: 'tenant_123'
};

export const ExpiringSoon = Template.bind({});
ExpiringSoon.args = {
  domain: 'example.com',
  tenantId: 'tenant_123',
  certificate: {
    status: 'expiring_soon',
    validUntil: '2024-04-01T00:00:00Z'
  }
};

export const Error = Template.bind({});
Error.args = {
  domain: 'example.com',
  tenantId: 'tenant_123',
  certificate: {
    status: 'invalid'
  }
};
```

## Bağımlılıklar

- date-fns
- @headlessui/react
- clsx
- react-query

## Stil Özelleştirme

```tsx
<SSLStatus
  className="ssl-status"
  badgeClassName="status-badge"
  detailsClassName="cert-details"
  customStyles={{
    valid: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    error: 'bg-red-50 text-red-700'
  }}
/>
```

## Best Practices

1. Düzenli durum kontrolü yap
2. Sertifika yaklaşan son kullanma tarihlerini izle
3. Yenileme işlemlerini logla
4. DNS değişikliklerini takip et
5. Hata durumlarını detaylı raporla 