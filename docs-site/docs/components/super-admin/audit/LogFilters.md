# LogFilters Komponenti

Denetim loglarını filtrelemek için kullanılan komponent.

## Özellikler

- Gelişmiş filtreleme
- Tarih aralığı seçimi
- Çoklu seçim desteği
- Özel filtre kaydetme
- Hızlı filtreler
- Filtre önerileri
- Filtre geçmişi

## Props

```typescript
interface LogFiltersProps {
  /** Aktif filtreler */
  filters?: LogFilterConfig;

  /** Varsayılan filtreler */
  defaultFilters?: LogFilterConfig;

  /** Filtre değiştiğinde çağrılır */
  onFilterChange?: (filters: LogFilterConfig) => void;

  /** Filtre kaydedildiğinde çağrılır */
  onFilterSave?: (filter: SavedFilter) => void;

  /** Kaydedilmiş filtreler */
  savedFilters?: SavedFilter[];

  /** Filtre önerileri */
  suggestions?: FilterSuggestion[];

  /** Filtre geçmişi */
  history?: FilterHistory[];

  /** Kompakt görünüm */
  compact?: boolean;
}

interface LogFilterConfig {
  dateRange?: [Date, Date];
  categories?: LogCategory[];
  severity?: LogSeverity[];
  actors?: string[];
  actions?: string[];
  targets?: string[];
  tenant?: string;
  search?: string;
  metadata?: Record<string, any>;
}

interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  config: LogFilterConfig;
  isGlobal?: boolean;
  createdBy?: string;
  createdAt: string;
}

interface FilterSuggestion {
  id: string;
  name: string;
  description: string;
  config: Partial<LogFilterConfig>;
  priority: number;
}

interface FilterHistory {
  id: string;
  config: LogFilterConfig;
  timestamp: string;
  results: number;
}
```

## Kullanım

```tsx
import { LogFilters } from '@components/super-admin/audit';

export default function AuditPage() {
  const [filters, setFilters] = useState<LogFilterConfig>({
    dateRange: [startOfDay(subDays(new Date(), 7)), endOfDay(new Date())],
    severity: ['error', 'critical'],
  });

  const handleFilterChange = (newFilters: LogFilterConfig) => {
    setFilters(newFilters);
    fetchLogs(newFilters);
  };

  const handleFilterSave = async (filter: SavedFilter) => {
    await saveFilter(filter);
    showSuccess('Filtre kaydedildi');
  };

  return (
    <LogFilters
      filters={filters}
      defaultFilters={{
        dateRange: [startOfDay(subDays(new Date(), 30)), endOfDay(new Date())],
      }}
      onFilterChange={handleFilterChange}
      onFilterSave={handleFilterSave}
      savedFilters={savedFilters}
      suggestions={suggestions}
      history={filterHistory}
      compact={false}
    />
  );
}
```

## Filtre Grupları

### Tarih Aralığı

```tsx
<DateRangeFilter value={filters.dateRange} onChange={handleDateRangeChange} presets={datePresets} />
```

### Kategori ve Önem

```tsx
<CategoryFilter
  selected={filters.categories}
  onChange={handleCategoryChange}
  showCounts
/>

<SeverityFilter
  selected={filters.severity}
  onChange={handleSeverityChange}
  showIcons
/>
```

### Aktör ve Hedef

```tsx
<ActorFilter
  selected={filters.actors}
  onChange={handleActorChange}
  suggestions={actorSuggestions}
/>

<TargetFilter
  selected={filters.targets}
  onChange={handleTargetChange}
  groupByType
/>
```

## API Entegrasyonu

```typescript
// Filtre kaydetme
const saveFilter = async (filter: SavedFilter) => {
  const response = await fetch('/api/audit-logs/filters', {
    method: 'POST',
    body: JSON.stringify(filter),
  });
  return response.json();
};

// Filtre önerileri alma
const fetchSuggestions = async () => {
  const response = await fetch('/api/audit-logs/filters/suggestions');
  return response.json();
};

// Filtre geçmişi alma
const fetchHistory = async () => {
  const response = await fetch('/api/audit-logs/filters/history');
  return response.json();
};
```

## Filtre İşleme

```typescript
const processFilters = (filters: LogFilterConfig) => {
  // Boş değerleri temizle
  const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value != null && value !== '' && value.length !== 0) {
      acc[key] = value;
    }
    return acc;
  }, {});

  // Tarih aralığını normalize et
  if (cleanFilters.dateRange) {
    cleanFilters.dateRange = [
      startOfDay(cleanFilters.dateRange[0]),
      endOfDay(cleanFilters.dateRange[1]),
    ];
  }

  return cleanFilters;
};
```

## Filtre Önerileri

```typescript
const generateSuggestions = (logs: AuditLogEntry[]) => {
  // En sık kullanılan kategoriler
  const topCategories = countBy(logs, 'category');

  // En çok hata üreten aktörler
  const errorActors = logs
    .filter((log) => log.severity === 'error')
    .reduce((acc, log) => {
      acc[log.actor.id] = (acc[log.actor.id] || 0) + 1;
      return acc;
    }, {});

  return [
    {
      id: 'common_errors',
      name: 'Sık Karşılaşılan Hatalar',
      config: {
        severity: ['error'],
        actors: Object.keys(errorActors).slice(0, 5),
      },
    },
    // Diğer öneriler...
  ];
};
```

## Erişilebilirlik

- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Clear error states

## Responsive Davranış

| Ekran Boyutu   | Davranış     |
| -------------- | ------------ |
| > 1024px       | Yatay düzen  |
| 768px - 1024px | Izgara düzen |
| < 768px        | Dikey düzen  |

## Test

```typescript
describe('LogFilters', () => {
  it('applies default filters', () => {
    render(
      <LogFilters
        defaultFilters={{
          severity: ['error']
        }}
      />
    );

    expect(screen.getByText('Hata')).toBeChecked();
  });

  it('handles filter changes', async () => {
    const onFilterChange = jest.fn();
    render(
      <LogFilters
        onFilterChange={onFilterChange}
      />
    );

    await userEvent.click(screen.getByText('Kategori'));
    await userEvent.click(screen.getByText('Güvenlik'));

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: ['security']
      })
    );
  });

  it('saves custom filter', async () => {
    const onFilterSave = jest.fn();
    render(
      <LogFilters
        onFilterSave={onFilterSave}
      />
    );

    await userEvent.click(screen.getByText('Filtreyi Kaydet'));
    await userEvent.type(screen.getByLabelText('Filtre Adı'), 'Test Filter');
    await userEvent.click(screen.getByText('Kaydet'));

    expect(onFilterSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Filter'
      })
    );
  });

  it('shows filter history', async () => {
    render(
      <LogFilters
        history={[
          {
            id: '1',
            config: { severity: ['error'] },
            timestamp: new Date().toISOString(),
            results: 100
          }
        ]}
      />
    );

    await userEvent.click(screen.getByText('Geçmiş'));
    expect(screen.getByText('100 sonuç')).toBeInTheDocument();
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { LogFilters } from './LogFilters';

export default {
  title: 'Super Admin/LogFilters',
  component: LogFilters
};

const Template: Story = (args) => <LogFilters {...args} />;

export const Default = Template.bind({});
Default.args = {
  defaultFilters: {
    dateRange: [new Date('2024-01-01'), new Date()]
  }
};

export const WithSavedFilters = Template.bind({});
WithSavedFilters.args = {
  savedFilters: [
    {
      id: '1',
      name: 'Kritik Hatalar',
      config: {
        severity: ['critical']
      }
    }
  ]
};

export const Compact = Template.bind({});
Compact.args = {
  compact: true
};

export const WithSuggestions = Template.bind({});
WithSuggestions.args = {
  suggestions: [
    {
      id: '1',
      name: 'Son 24 Saat Hataları',
      config: {
        dateRange: [subHours(new Date(), 24), new Date()],
        severity: ['error', 'critical']
      }
    }
  ]
};
```

## Bağımlılıklar

- @headlessui/react
- date-fns
- react-datepicker
- @tanstack/react-query
- clsx

## Stil Özelleştirme

```tsx
<LogFilters
  className="log-filters"
  groupClassName="filter-group"
  controlClassName="filter-control"
  customStyles={{
    group: {
      base: 'rounded-lg border p-4',
      active: 'border-blue-500',
    },
    control: {
      base: 'form-input',
      invalid: 'border-red-500',
    },
  }}
/>
```

## Best Practices

1. URL'de filtre durumunu tut
2. Filtre geçmişini sakla
3. Performansı optimize et
4. Sık kullanılan filtreleri öner
5. Filtre kombinasyonlarını doğrula
