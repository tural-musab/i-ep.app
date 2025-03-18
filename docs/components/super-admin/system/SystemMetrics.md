# SystemMetrics Komponenti

Sistem metriklerini görselleştiren ve analiz eden komponent.

## Özellikler

- Gerçek zamanlı metrik takibi
- Özelleştirilebilir grafikler
- Metrik karşılaştırma
- Eşik değer uyarıları
- Trend analizi
- Veri dışa aktarma

## Props

```typescript
interface SystemMetricsProps {
  /** Görüntülenecek metrikler */
  metrics?: MetricType[];
  
  /** Zaman aralığı */
  timeRange?: TimeRange;
  
  /** Yenileme aralığı (ms) */
  refreshInterval?: number;
  
  /** Grafik tipi */
  chartType?: 'line' | 'bar' | 'area';
  
  /** Eşik değerleri */
  thresholds?: MetricThresholds;
  
  /** Metrik değiştiğinde çağrılır */
  onMetricChange?: (metric: MetricData) => void;
  
  /** Eşik aşıldığında çağrılır */
  onThresholdExceeded?: (alert: ThresholdAlert) => void;
}

interface MetricData {
  name: string;
  value: number;
  timestamp: string;
  change?: {
    value: number;
    percentage: number;
  };
}

interface TimeRange {
  start: Date;
  end: Date;
  interval: '1m' | '5m' | '15m' | '1h' | '1d';
}

interface MetricThresholds {
  [key: string]: {
    warning: number;
    critical: number;
  };
}

interface ThresholdAlert {
  metric: string;
  value: number;
  threshold: number;
  level: 'warning' | 'critical';
  timestamp: string;
}
```

## Kullanım

```tsx
import { SystemMetrics } from '@components/super-admin/system';

export default function MetricsPage() {
  const handleMetricChange = (metric: MetricData) => {
    console.log('Metric updated:', metric);
  };

  const handleThresholdExceeded = (alert: ThresholdAlert) => {
    notifyAdmin(`Metrik eşiği aşıldı: ${alert.metric}`);
  };

  return (
    <SystemMetrics
      metrics={['cpu', 'memory', 'disk', 'network']}
      timeRange={{
        start: subHours(new Date(), 24),
        end: new Date(),
        interval: '5m'
      }}
      refreshInterval={30000}
      chartType="line"
      thresholds={{
        cpu: { warning: 80, critical: 90 },
        memory: { warning: 85, critical: 95 }
      }}
      onMetricChange={handleMetricChange}
      onThresholdExceeded={handleThresholdExceeded}
    />
  );
}
```

## Metrik Tipleri

### Sistem Metrikleri
- CPU Kullanımı
- Bellek Kullanımı
- Disk I/O
- Ağ Trafiği

### Uygulama Metrikleri
- Response Time
- Error Rate
- Request Count
- Active Users

### Tenant Metrikleri
- Aktif Tenant Sayısı
- Storage Kullanımı
- API Kullanımı
- Kullanıcı Sayısı

## API Entegrasyonu

```typescript
// Metrik verisi alma
const fetchMetrics = async (params: MetricParams) => {
  const response = await fetch('/api/system/metrics', {
    method: 'GET',
    params: {
      metrics: params.metrics.join(','),
      from: params.timeRange.start.toISOString(),
      to: params.timeRange.end.toISOString(),
      interval: params.timeRange.interval
    }
  });
  return response.json();
};

// Gerçek zamanlı metrik takibi
const subscribeToMetrics = (callback: (metric: MetricData) => void) => {
  const ws = new WebSocket('wss://api.iqraedu.com/metrics');
  
  ws.onmessage = (event) => {
    const metric = JSON.parse(event.data);
    callback(metric);
  };

  return () => ws.close();
};
```

## Grafik Komponentleri

### Line Chart
```tsx
<MetricLineChart
  data={metricData}
  xAxis="timestamp"
  yAxis="value"
  series={['cpu', 'memory']}
  thresholds={thresholds}
/>
```

### Gauge Chart
```tsx
<MetricGauge
  value={cpuUsage}
  min={0}
  max={100}
  thresholds={{
    warning: 80,
    critical: 90
  }}
/>
```

### Stat Card
```tsx
<MetricStatCard
  title="CPU Kullanımı"
  value={cpuUsage}
  unit="%"
  change={{
    value: 5,
    trend: 'up'
  }}
/>
```

## Veri İşleme

```typescript
// Metrik verisi işleme
const processMetricData = (data: MetricData[]) => {
  return data.map(metric => ({
    ...metric,
    value: roundToDecimal(metric.value, 2),
    change: calculateChange(metric.value, previousValue)
  }));
};

// Trend analizi
const analyzeTrend = (data: MetricData[]) => {
  const values = data.map(d => d.value);
  return {
    mean: calculateMean(values),
    median: calculateMedian(values),
    trend: calculateTrend(values)
  };
};
```

## Erişilebilirlik

- ARIA live regions
- Klavye navigasyonu
- Renk kontrastı
- Screen reader desteği
- Tooltip erişilebilirliği

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 1200px | 4 kolon grid |
| 768px - 1200px | 2 kolon grid |
| < 768px | Tek kolon |

## Test

```typescript
describe('SystemMetrics', () => {
  it('renders metrics correctly', () => {
    render(
      <SystemMetrics
        metrics={['cpu', 'memory']}
        timeRange={{
          start: new Date(),
          end: new Date(),
          interval: '5m'
        }}
      />
    );
    
    expect(screen.getByText('CPU Kullanımı')).toBeInTheDocument();
    expect(screen.getByText('Bellek Kullanımı')).toBeInTheDocument();
  });

  it('updates metrics periodically', async () => {
    jest.useFakeTimers();
    const onMetricChange = jest.fn();
    
    render(
      <SystemMetrics
        metrics={['cpu']}
        refreshInterval={1000}
        onMetricChange={onMetricChange}
      />
    );

    jest.advanceTimersByTime(1000);
    expect(onMetricChange).toHaveBeenCalled();
  });

  it('triggers threshold alerts', async () => {
    const onThresholdExceeded = jest.fn();
    
    render(
      <SystemMetrics
        metrics={['cpu']}
        thresholds={{
          cpu: { warning: 80, critical: 90 }
        }}
        onThresholdExceeded={onThresholdExceeded}
      />
    );

    // Simulate high CPU usage
    await act(async () => {
      mockMetricValue('cpu', 95);
    });

    expect(onThresholdExceeded).toHaveBeenCalledWith(
      expect.objectContaining({
        metric: 'cpu',
        level: 'critical'
      })
    );
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { SystemMetrics } from './SystemMetrics';

export default {
  title: 'Super Admin/SystemMetrics',
  component: SystemMetrics,
  argTypes: {
    chartType: {
      control: {
        type: 'select',
        options: ['line', 'bar', 'area']
      }
    }
  }
};

const Template: Story = (args) => <SystemMetrics {...args} />;

export const Default = Template.bind({});
Default.args = {
  metrics: ['cpu', 'memory', 'disk', 'network'],
  refreshInterval: 30000
};

export const WithThresholds = Template.bind({});
WithThresholds.args = {
  metrics: ['cpu', 'memory'],
  thresholds: {
    cpu: { warning: 80, critical: 90 },
    memory: { warning: 85, critical: 95 }
  }
};
```

## Bağımlılıklar

- @tanstack/react-query
- recharts
- date-fns
- websocket
- d3-scale

## Stil Özelleştirme

```tsx
<SystemMetrics
  className="metrics-dashboard"
  chartClassName="metric-chart"
  cardClassName="metric-card"
  gaugeClassName="metric-gauge"
  colors={{
    primary: '#0088FE',
    warning: '#FFC107',
    critical: '#FF4842'
  }}
/>
```

## Best Practices

1. Gerçek zamanlı veriyi optimize et
2. Veri noktalarını sınırla
3. Threshold uyarılarını grupla
4. Grafik performansını optimize et
5. Veri önbelleğe al 