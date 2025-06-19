# SystemHealth Komponenti

Sistem sağlık durumunu izleyen ve raporlayan komponent.

## Özellikler

- Servis durumu takibi
- Performans metrikleri
- Kaynak kullanımı
- Hata oranları
- Uptime takibi
- Alarm yönetimi
- Gerçek zamanlı izleme

## Props

```typescript
interface SystemHealthProps {
  /** İzlenecek servisler */
  services?: ServiceConfig[];
  
  /** Yenileme aralığı (ms) */
  refreshInterval?: number;
  
  /** Alarm eşikleri */
  thresholds?: HealthThresholds;
  
  /** Durum değiştiğinde çağrılır */
  onStatusChange?: (status: SystemStatus) => void;
  
  /** Alarm durumunda çağrılır */
  onAlert?: (alert: HealthAlert) => void;
  
  /** Detay seviyesi */
  detailLevel?: 'basic' | 'detailed' | 'debug';
}

interface ServiceConfig {
  id: string;
  name: string;
  type: ServiceType;
  endpoint: string;
  timeout?: number;
  dependencies?: string[];
}

interface HealthThresholds {
  cpu: {
    warning: number;
    critical: number;
  };
  memory: {
    warning: number;
    critical: number;
  };
  disk: {
    warning: number;
    critical: number;
  };
  responseTime: {
    warning: number;
    critical: number;
  };
  errorRate: {
    warning: number;
    critical: number;
  };
}

interface SystemStatus {
  overall: HealthStatus;
  timestamp: string;
  services: Record<string, ServiceHealth>;
  metrics: SystemMetrics;
  alerts: HealthAlert[];
}

interface ServiceHealth {
  status: HealthStatus;
  latency: number;
  lastCheck: string;
  message?: string;
  details?: Record<string, any>;
}

type ServiceType = 'database' | 'cache' | 'storage' | 'api' | 'queue' | 'worker';
type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
```

## Kullanım

```tsx
import { SystemHealth } from '@components/super-admin/system';

export default function HealthMonitoringPage() {
  const handleStatusChange = (status: SystemStatus) => {
    if (status.overall !== 'healthy') {
      notifyTeam(`Sistem durumu: ${status.overall}`);
    }
  };

  const handleAlert = (alert: HealthAlert) => {
    createIncident(alert);
  };

  return (
    <SystemHealth
      services={[
        {
          id: 'db',
          name: 'PostgreSQL',
          type: 'database',
          endpoint: '/api/health/db'
        },
        {
          id: 'redis',
          name: 'Redis',
          type: 'cache',
          endpoint: '/api/health/redis'
        },
        {
          id: 's3',
          name: 'S3 Storage',
          type: 'storage',
          endpoint: '/api/health/storage'
        }
      ]}
      refreshInterval={30000}
      thresholds={{
        cpu: { warning: 80, critical: 90 },
        memory: { warning: 85, critical: 95 },
        disk: { warning: 85, critical: 90 },
        responseTime: { warning: 1000, critical: 3000 },
        errorRate: { warning: 0.01, critical: 0.05 }
      }}
      onStatusChange={handleStatusChange}
      onAlert={handleAlert}
      detailLevel="detailed"
    />
  );
}
```

## Durum Gösterimi

### Servis Durumu
```tsx
<ServiceStatus
  service={service}
  metrics={metrics}
  dependencies={dependencies}
/>
```

### Sağlık Göstergesi
```tsx
<HealthIndicator
  status={status}
  lastUpdated={lastCheck}
  showTimestamp
/>
```

### Metrik Grafiği
```tsx
<MetricGraph
  data={metricHistory}
  type="line"
  thresholds={thresholds}
/>
```

## API Entegrasyonu

```typescript
// Sağlık kontrolü
const checkHealth = async (service: ServiceConfig) => {
  const response = await fetch(service.endpoint, {
    timeout: service.timeout
  });
  return response.json();
};

// Metrik toplama
const collectMetrics = async () => {
  const response = await fetch('/api/system/health/metrics');
  return response.json();
};

// Alarm durumu
const checkAlerts = async () => {
  const response = await fetch('/api/system/health/alerts');
  return response.json();
};
```

## Durum Yönetimi

```typescript
const [status, setStatus] = useState<SystemStatus>();
const [alerts, setAlerts] = useState<HealthAlert[]>([]);

useEffect(() => {
  const monitor = async () => {
    try {
      const newStatus = await checkSystemHealth();
      setStatus(newStatus);
      
      if (newStatus.overall !== status?.overall) {
        onStatusChange?.(newStatus);
      }
      
      const newAlerts = checkThresholds(newStatus.metrics);
      if (newAlerts.length > 0) {
        setAlerts(newAlerts);
        newAlerts.forEach(onAlert);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const interval = setInterval(monitor, refreshInterval);
  monitor();

  return () => clearInterval(interval);
}, [refreshInterval]);
```

## Alarm Yönetimi

```typescript
const checkThresholds = (metrics: SystemMetrics): HealthAlert[] => {
  const alerts: HealthAlert[] = [];
  
  if (metrics.cpu > thresholds.cpu.critical) {
    alerts.push({
      type: 'cpu',
      level: 'critical',
      value: metrics.cpu,
      threshold: thresholds.cpu.critical,
      message: 'CPU kullanımı kritik seviyede'
    });
  }
  
  // Diğer metrik kontrolleri...
  
  return alerts;
};
```

## Erişilebilirlik

- Live region updates
- Status announcements
- Color-blind friendly indicators
- Keyboard navigation
- Screen reader optimizations

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 1200px | Tam dashboard görünümü |
| 768px - 1200px | Kompakt dashboard |
| < 768px | Liste görünümü |

## Test

```typescript
describe('SystemHealth', () => {
  it('monitors services', async () => {
    render(
      <SystemHealth
        services={[
          { id: 'test', name: 'Test', endpoint: '/health' }
        ]}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Sistem Sağlıklı')).toBeInTheDocument();
    });
  });

  it('triggers alerts', async () => {
    const onAlert = jest.fn();
    render(
      <SystemHealth
        services={[{ id: 'test', name: 'Test', endpoint: '/health' }]}
        thresholds={{
          cpu: { warning: 80, critical: 90 }
        }}
        onAlert={onAlert}
      />
    );
    
    // Simulate high CPU usage
    mockMetrics({ cpu: 95 });
    
    await waitFor(() => {
      expect(onAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cpu',
          level: 'critical'
        })
      );
    });
  });

  it('handles service dependencies', async () => {
    render(
      <SystemHealth
        services={[
          {
            id: 'api',
            name: 'API',
            endpoint: '/health/api',
            dependencies: ['db', 'cache']
          }
        ]}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Bağımlılıklar')).toBeInTheDocument();
    });
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { SystemHealth } from './SystemHealth';

export default {
  title: 'Super Admin/SystemHealth',
  component: SystemHealth
};

const Template: Story = (args) => <SystemHealth {...args} />;

export const Healthy = Template.bind({});
Healthy.args = {
  services: [
    { id: 'test', name: 'Test Service', endpoint: '/health' }
  ],
  status: {
    overall: 'healthy',
    services: {
      test: {
        status: 'healthy',
        latency: 50
      }
    }
  }
};

export const Degraded = Template.bind({});
Degraded.args = {
  services: [
    { id: 'test', name: 'Test Service', endpoint: '/health' }
  ],
  status: {
    overall: 'degraded',
    services: {
      test: {
        status: 'degraded',
        latency: 2000
      }
    }
  }
};

export const WithAlerts = Template.bind({});
WithAlerts.args = {
  services: [
    { id: 'test', name: 'Test Service', endpoint: '/health' }
  ],
  alerts: [
    {
      type: 'cpu',
      level: 'warning',
      message: 'Yüksek CPU kullanımı'
    }
  ]
};
```

## Bağımlılıklar

- @tanstack/react-query
- recharts
- date-fns
- socket.io-client
- @headlessui/react

## Stil Özelleştirme

```tsx
<SystemHealth
  className="health-dashboard"
  serviceClassName="service-card"
  metricClassName="metric-widget"
  alertClassName="alert-banner"
  customStyles={{
    healthy: 'bg-green-50 text-green-700',
    degraded: 'bg-yellow-50 text-yellow-700',
    unhealthy: 'bg-red-50 text-red-700'
  }}
/>
```

## Best Practices

1. Düzenli health check yap
2. Bağımlılıkları izle
3. Metrik geçmişini tut
4. Alarm eşiklerini yapılandır
5. İyileşme sürecini otomatikleştir 