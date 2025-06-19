# AuditLogDetail Komponenti

Denetim logu detaylarını görüntüleyen ve analiz eden komponent.

## Özellikler

- Detaylı log bilgileri
- Değişiklik karşılaştırma
- İlişkili loglar
- Zaman çizelgesi
- Metadata görüntüleme
- İlgili kaynaklar
- Aksiyon önerileri

## Props

```typescript
interface AuditLogDetailProps {
  /** Log ID */
  logId: string;
  
  /** Log verisi */
  log?: AuditLogEntry;
  
  /** İlişkili logları göster */
  showRelatedLogs?: boolean;
  
  /** Zaman çizelgesini göster */
  showTimeline?: boolean;
  
  /** Detay seviyesi */
  detailLevel?: 'basic' | 'detailed' | 'debug';
  
  /** Aksiyon seçildiğinde çağrılır */
  onActionSelect?: (action: LogAction) => void;
  
  /** Kapatıldığında çağrılır */
  onClose?: () => void;
  
  /** Modal görünümü */
  isModal?: boolean;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: LogCategory;
  severity: LogSeverity;
  actor: {
    id: string;
    type: 'user' | 'system' | 'service';
    name: string;
    role?: string;
    ip?: string;
    userAgent?: string;
  };
  target: {
    id: string;
    type: string;
    name: string;
    path?: string;
  };
  changes?: {
    before: any;
    after: any;
    diff?: string;
  };
  metadata: {
    requestId?: string;
    sessionId?: string;
    correlationId?: string;
    duration?: number;
    status?: number;
    error?: {
      code: string;
      message: string;
      stack?: string;
    };
  };
  context: {
    environment: string;
    region: string;
    version: string;
  };
  relatedLogs?: string[];
}

interface LogAction {
  type: ActionType;
  target: string;
  params?: Record<string, any>;
}

type ActionType = 'investigate' | 'rollback' | 'notify' | 'block' | 'escalate';
```

## Kullanım

```tsx
import { AuditLogDetail } from '@components/super-admin/audit';

export default function LogDetailPage() {
  const handleActionSelect = (action: LogAction) => {
    switch (action.type) {
      case 'investigate':
        startInvestigation(action.target);
        break;
      case 'rollback':
        rollbackChanges(action.target);
        break;
      case 'notify':
        notifyTeam(action.target, action.params);
        break;
    }
  };

  return (
    <AuditLogDetail
      logId="log_123"
      showRelatedLogs={true}
      showTimeline={true}
      detailLevel="detailed"
      onActionSelect={handleActionSelect}
      isModal={false}
    />
  );
}
```

## Detay Bölümleri

### Temel Bilgiler
```tsx
<LogBasicInfo
  timestamp={log.timestamp}
  action={log.action}
  category={log.category}
  severity={log.severity}
/>
```

### Aktör Bilgileri
```tsx
<ActorDetails
  actor={log.actor}
  showLocation={true}
  showDeviceInfo={true}
/>
```

### Değişiklik Karşılaştırma
```tsx
<ChangeDiff
  before={log.changes.before}
  after={log.changes.after}
  type="inline"
  showLineNumbers={true}
/>
```

## API Entegrasyonu

```typescript
// Log detayı alma
const fetchLogDetail = async (logId: string) => {
  const response = await fetch(`/api/audit-logs/${logId}`);
  return response.json();
};

// İlişkili logları alma
const fetchRelatedLogs = async (logId: string) => {
  const response = await fetch(`/api/audit-logs/${logId}/related`);
  return response.json();
};

// Aksiyon gerçekleştirme
const executeAction = async (action: LogAction) => {
  const response = await fetch('/api/audit-logs/actions', {
    method: 'POST',
    body: JSON.stringify(action)
  });
  return response.json();
};
```

## Değişiklik Analizi

```typescript
const analyzeChanges = (changes: Changes) => {
  const { before, after } = changes;
  
  // Değişen alanları bul
  const changedFields = Object.keys(after).filter(key => {
    return !isEqual(before[key], after[key]);
  });
  
  // Değişiklik özetini oluştur
  const summary = changedFields.map(field => ({
    field,
    oldValue: before[field],
    newValue: after[field],
    impact: assessImpact(field, before[field], after[field])
  }));
  
  return {
    changedFields,
    summary,
    riskLevel: calculateRiskLevel(summary)
  };
};
```

## Zaman Çizelgesi

```tsx
<LogTimeline
  log={log}
  relatedLogs={relatedLogs}
  showDetails={true}
  interactive={true}
/>
```

## Erişilebilirlik

- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader descriptions
- Color contrast

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 1024px | Yan yana paneller |
| 768px - 1024px | Sekmeli görünüm |
| < 768px | Tekli görünüm |

## Test

```typescript
describe('AuditLogDetail', () => {
  it('displays log details', async () => {
    render(
      <AuditLogDetail
        logId="test_log"
        detailLevel="detailed"
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Log Detayları')).toBeInTheDocument();
    });
  });

  it('shows change diff', async () => {
    render(
      <AuditLogDetail
        log={{
          changes: {
            before: { status: 'active' },
            after: { status: 'suspended' }
          }
        }}
      />
    );
    
    expect(screen.getByText('Değişiklikler')).toBeInTheDocument();
    expect(screen.getByText('active → suspended')).toBeInTheDocument();
  });

  it('handles actions', async () => {
    const onActionSelect = jest.fn();
    render(
      <AuditLogDetail
        logId="test_log"
        onActionSelect={onActionSelect}
      />
    );
    
    await userEvent.click(screen.getByText('İncele'));
    expect(onActionSelect).toHaveBeenCalledWith({
      type: 'investigate',
      target: 'test_log'
    });
  });

  it('shows related logs', async () => {
    render(
      <AuditLogDetail
        logId="test_log"
        showRelatedLogs={true}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('İlişkili Loglar')).toBeInTheDocument();
    });
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { AuditLogDetail } from './AuditLogDetail';

export default {
  title: 'Super Admin/AuditLogDetail',
  component: AuditLogDetail
};

const Template: Story = (args) => <AuditLogDetail {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  logId: 'test_log',
  detailLevel: 'basic'
};

export const WithChanges = Template.bind({});
WithChanges.args = {
  log: {
    changes: {
      before: { status: 'active', role: 'user' },
      after: { status: 'suspended', role: 'admin' }
    }
  }
};

export const WithRelatedLogs = Template.bind({});
WithRelatedLogs.args = {
  logId: 'test_log',
  showRelatedLogs: true,
  showTimeline: true
};

export const Modal = Template.bind({});
Modal.args = {
  logId: 'test_log',
  isModal: true
};
```

## Bağımlılıklar

- @monaco-editor/react
- diff
- date-fns
- @headlessui/react
- react-json-view

## Stil Özelleştirme

```tsx
<AuditLogDetail
  className="log-detail"
  headerClassName="detail-header"
  contentClassName="detail-content"
  timelineClassName="detail-timeline"
  customStyles={{
    header: 'bg-gray-50 border-b',
    content: 'p-6',
    diff: {
      added: 'bg-green-50',
      removed: 'bg-red-50'
    }
  }}
/>
```

## Best Practices

1. Değişiklikleri anlaşılır göster
2. İlişkili logları grupla
3. Kritik bilgileri vurgula
4. Performansı optimize et
5. Detay seviyesini kontrol et 