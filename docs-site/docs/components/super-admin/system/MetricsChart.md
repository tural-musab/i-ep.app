# MetricsChart Komponenti

Sistem metriklerini görselleştiren ve analiz eden grafik komponenti.

## Özellikler

- Çoklu metrik görselleştirme
- Gerçek zamanlı güncelleme
- İnteraktif grafikler
- Özelleştirilebilir görünüm
- Veri analizi araçları
- Dışa aktarma seçenekleri
- Zaman aralığı kontrolü

## Props

```typescript
interface MetricsChartProps {
  /** Görüntülenecek metrikler */
  metrics: MetricConfig[];
  
  /** Veri noktaları */
  data: MetricDataPoint[];
  
  /** Grafik tipi */
  type?: ChartType;
  
  /** Zaman aralığı */
  timeRange?: TimeRange;
  
  /** Yenileme aralığı (ms) */
  refreshInterval?: number;
  
  /** Eşik değerleri */
  thresholds?: MetricThresholds;
  
  /** Grafik boyutu */
  dimensions?: Dimensions;
  
  /** Grafik tıklandığında çağrılır */
  onPointClick?: (point: MetricDataPoint) => void;
  
  /** Zaman aralığı değiştiğinde çağrılır */
  onTimeRangeChange?: (range: TimeRange) => void;
}

interface MetricConfig {
  id: string;
  name: string;
  unit: string;
  color?: string;
  aggregation?: AggregationType;
  formatter?: (value: number) => string;
}

interface MetricDataPoint {
  timestamp: string;
  values: Record<string, number>;
  annotations?: MetricAnnotation[];
}

interface MetricThresholds {
  [metricId: string]: {
    warning?: number;
    critical?: number;
    custom?: number[];
  };
}

interface Dimensions {
  width?: number;
  height?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

type ChartType = 'line' | 'area' | 'bar' | 'scatter';
type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count';
```

## Kullanım

```tsx
import { MetricsChart } from '@components/super-admin/system';

export default function MetricsPage() {
  const handlePointClick = (point: MetricDataPoint) => {
    showMetricDetails(point);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    updateMetricData(range);
  };

  return (
    <MetricsChart
      metrics={[
        {
          id: 'cpu',
          name: 'CPU Kullanımı',
          unit: '%',
          color: '#0088FE'
        },
        {
          id: 'memory',
          name: 'Bellek Kullanımı',
          unit: 'GB',
          color: '#00C49F'
        }
      ]}
      data={metricData}
      type="line"
      timeRange={{
        start: subHours(new Date(), 24),
        end: new Date()
      }}
      refreshInterval={60000}
      thresholds={{
        cpu: {
          warning: 80,
          critical: 90
        },
        memory: {
          warning: 85,
          critical: 95
        }
      }}
      dimensions={{
        width: 800,
        height: 400,
        margin: { top: 20, right: 30, bottom: 30, left: 40 }
      }}
      onPointClick={handlePointClick}
      onTimeRangeChange={handleTimeRangeChange}
    />
  );
}
```

## Grafik Tipleri

### Line Chart
```tsx
<MetricsChart
  type="line"
  metrics={metrics}
  data={data}
  options={{
    curve: 'monotone',
    showPoints: true,
    showArea: false
  }}
/>
```

### Area Chart
```tsx
<MetricsChart
  type="area"
  metrics={metrics}
  data={data}
  options={{
    stackOffset: 'none',
    fillOpacity: 0.3
  }}
/>
```

### Bar Chart
```tsx
<MetricsChart
  type="bar"
  metrics={metrics}
  data={data}
  options={{
    barSize: 20,
    stackOffset: 'none'
  }}
/>
```

## Veri İşleme

```typescript
// Veri agregasyonu
const aggregateData = (data: MetricDataPoint[], interval: string) => {
  return data.reduce((acc, point) => {
    const bucket = roundToInterval(point.timestamp, interval);
    if (!acc[bucket]) {
      acc[bucket] = { timestamp: bucket, values: {} };
    }
    Object.entries(point.values).forEach(([metric, value]) => {
      if (!acc[bucket].values[metric]) {
        acc[bucket].values[metric] = [];
      }
      acc[bucket].values[metric].push(value);
    });
    return acc;
  }, {});
};

// Veri formatı dönüşümü
const formatChartData = (data: MetricDataPoint[], metrics: MetricConfig[]) => {
  return data.map(point => ({
    timestamp: point.timestamp,
    ...Object.entries(point.values).reduce((acc, [metric, value]) => {
      const config = metrics.find(m => m.id === metric);
      acc[metric] = config?.formatter?.(value) ?? value;
      return acc;
    }, {})
  }));
};
```

## Tooltip Özelleştirme

```tsx
<MetricsChart
  tooltipFormatter={(value, metric) => {
    const config = metrics.find(m => m.id === metric);
    return `${config.name}: ${value}${config.unit}`;
  }}
  tooltipLabelFormatter={(timestamp) => {
    return format(new Date(timestamp), 'dd MMM yyyy HH:mm');
  }}
/>
```

## Erişilebilirlik

- ARIA labels
- Keyboard navigation
- Screen reader descriptions
- Focus management
- Color contrast

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 1200px | Tam boyut grafik |
| 768px - 1200px | Orta boy grafik |
| < 768px | Mobil uyumlu grafik |

## Test

```typescript
describe('MetricsChart', () => {
  it('renders chart correctly', () => {
    render(
      <MetricsChart
        metrics={[
          { id: 'test', name: 'Test', unit: '%' }
        ]}
        data={testData}
      />
    );
    
    expect(screen.getByRole('img', { name: /metrics chart/i }))
      .toBeInTheDocument();
  });

  it('handles time range changes', async () => {
    const onTimeRangeChange = jest.fn();
    render(
      <MetricsChart
        metrics={[{ id: 'test', name: 'Test', unit: '%' }]}
        data={testData}
        onTimeRangeChange={onTimeRangeChange}
      />
    );
    
    await userEvent.click(screen.getByText('Son 24 Saat'));
    expect(onTimeRangeChange).toHaveBeenCalled();
  });

  it('shows tooltips on hover', async () => {
    render(
      <MetricsChart
        metrics={[{ id: 'test', name: 'Test', unit: '%' }]}
        data={testData}
      />
    );
    
    await userEvent.hover(screen.getByRole('img'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { MetricsChart } from './MetricsChart';

export default {
  title: 'Super Admin/MetricsChart',
  component: MetricsChart,
  argTypes: {
    type: {
      control: {
        type: 'select',
        options: ['line', 'area', 'bar', 'scatter']
      }
    }
  }
};

const Template: Story = (args) => <MetricsChart {...args} />;

export const LineChart = Template.bind({});
LineChart.args = {
  type: 'line',
  metrics: [
    { id: 'cpu', name: 'CPU', unit: '%' }
  ],
  data: generateTestData()
};

export const AreaChart = Template.bind({});
AreaChart.args = {
  type: 'area',
  metrics: [
    { id: 'memory', name: 'Memory', unit: 'GB' }
  ],
  data: generateTestData()
};

export const MultiMetric = Template.bind({});
MultiMetric.args = {
  type: 'line',
  metrics: [
    { id: 'cpu', name: 'CPU', unit: '%' },
    { id: 'memory', name: 'Memory', unit: 'GB' }
  ],
  data: generateTestData()
};
```

## Bağımlılıklar

- recharts
- date-fns
- d3-scale
- lodash
- react-use

## Stil Özelleştirme

```tsx
<MetricsChart
  className="metrics-chart"
  chartClassName="custom-chart"
  axisClassName="custom-axis"
  gridClassName="custom-grid"
  customStyles={{
    chart: {
      backgroundColor: '#f8f9fa'
    },
    axis: {
      stroke: '#dee2e6'
    },
    grid: {
      stroke: '#e9ecef'
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)'
    }
  }}
/>
```

## Best Practices

1. Veri noktalarını optimize et
2. Tooltip performansını iyileştir
3. Responsive davranışı test et
4. Erişilebilirlik kontrolü yap
5. Bellek kullanımını optimize et 