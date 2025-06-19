# BackupStatus Komponenti

Yedekleme işleminin durumunu ve detaylarını gösteren komponent.

## Özellikler

- Gerçek zamanlı durum takibi
- İlerleme gösterimi
- Detaylı log görüntüleme
- Hata raporlama
- İstatistik gösterimi
- İşlem kontrolü
- Dosya indirme

## Props

```typescript
interface BackupStatusProps {
  /** Yedekleme ID */
  backupId: string;
  
  /** Tenant ID */
  tenantId?: string;
  
  /** Yenileme aralığı (ms) */
  refreshInterval?: number;
  
  /** Detay seviyesi */
  detailLevel?: 'basic' | 'detailed' | 'debug';
  
  /** Durum değiştiğinde çağrılır */
  onStatusChange?: (status: BackupStatus) => void;
  
  /** Hata durumunda çağrılır */
  onError?: (error: BackupError) => void;
  
  /** İşlem kontrolü aktif mi */
  allowControl?: boolean;
}

interface BackupStatus {
  id: string;
  type: BackupType;
  status: BackupState;
  progress: {
    percentage: number;
    currentStep: string;
    startTime: string;
    endTime?: string;
    estimatedTimeLeft?: number;
    bytesProcessed: number;
    totalBytes: number;
    speed: number;
  };
  result?: {
    size: number;
    files: number;
    duration: number;
    compressionRatio: number;
    storageLocation: string;
  };
  error?: BackupError;
}

interface BackupError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  recoverable: boolean;
}

type BackupState = 'queued' | 'preparing' | 'running' | 'finalizing' | 'completed' | 'failed' | 'cancelled';
```

## Kullanım

```tsx
import { BackupStatus } from '@components/super-admin/backup';

export default function BackupStatusPage() {
  const handleStatusChange = (status: BackupStatus) => {
    if (status.status === 'completed') {
      notifySuccess('Yedekleme tamamlandı');
    }
  };

  const handleError = (error: BackupError) => {
    notifyError(`Yedekleme hatası: ${error.message}`);
  };

  return (
    <BackupStatus
      backupId="backup_123"
      tenantId="tenant_123"
      refreshInterval={5000}
      detailLevel="detailed"
      onStatusChange={handleStatusChange}
      onError={handleError}
      allowControl
    />
  );
}
```

## Durum Gösterimi

### İlerleme Çubuğu
```tsx
<BackupProgressBar
  percentage={progress.percentage}
  status={status}
  showLabel
  animated
/>
```

### Durum Detayları
```tsx
<BackupStatusDetails
  status={status}
  progress={progress}
  result={result}
  showSpeed
  showETA
/>
```

### Log Görüntüleyici
```tsx
<BackupLogViewer
  logs={logs}
  level={detailLevel}
  autoScroll
  searchable
/>
```

## API Entegrasyonu

```typescript
// Durum kontrolü
const checkStatus = async () => {
  const response = await fetch(`/api/backups/${backupId}/status`);
  return response.json();
};

// Log alma
const fetchLogs = async () => {
  const response = await fetch(`/api/backups/${backupId}/logs`);
  return response.json();
};

// İşlem kontrolü
const controlBackup = async (action: 'pause' | 'resume' | 'cancel') => {
  const response = await fetch(`/api/backups/${backupId}/control`, {
    method: 'POST',
    body: JSON.stringify({ action })
  });
  return response.json();
};

// Sonuç indirme
const downloadBackup = async () => {
  const response = await fetch(`/api/backups/${backupId}/download`);
  return response.blob();
};
```

## Durum Yönetimi

```typescript
const [status, setStatus] = useState<BackupStatus>();
const [logs, setLogs] = useState<BackupLog[]>([]);

useEffect(() => {
  const checkBackupStatus = async () => {
    try {
      const newStatus = await checkStatus();
      setStatus(newStatus);
      
      if (newStatus.status !== status?.status) {
        onStatusChange?.(newStatus);
      }
      
      if (newStatus.error) {
        onError?.(newStatus.error);
      }
    } catch (error) {
      console.error('Status check failed:', error);
    }
  };

  const interval = setInterval(checkBackupStatus, refreshInterval);
  checkBackupStatus();

  return () => clearInterval(interval);
}, [backupId, refreshInterval]);
```

## İstatistik Hesaplama

```typescript
const calculateStats = (status: BackupStatus) => {
  const duration = differenceInSeconds(
    new Date(status.progress.endTime || Date.now()),
    new Date(status.progress.startTime)
  );
  
  const speed = status.progress.bytesProcessed / duration;
  const compressionRatio = status.result
    ? 1 - (status.result.size / status.progress.totalBytes)
    : 0;
    
  return {
    duration,
    speed,
    compressionRatio
  };
};
```

## Erişilebilirlik

- Live region updates
- Progress announcements
- Status descriptions
- Error notifications
- Keyboard controls

## Responsive Davranış

| Ekran Boyutu | Davranış |
|--------------|----------|
| > 1024px | Tam detay görünümü |
| 768px - 1024px | Özet görünüm |
| < 768px | Minimal görünüm |

## Test

```typescript
describe('BackupStatus', () => {
  it('shows backup progress', async () => {
    render(
      <BackupStatus
        backupId="test_backup"
        refreshInterval={1000}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Yedekleme devam ediyor')).toBeInTheDocument();
    });
  });

  it('handles status changes', async () => {
    const onStatusChange = jest.fn();
    render(
      <BackupStatus
        backupId="test_backup"
        onStatusChange={onStatusChange}
      />
    );
    
    // Simulate status change
    mockBackupStatus({
      status: 'completed',
      progress: { percentage: 100 }
    });
    
    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'completed' })
      );
    });
  });

  it('allows backup control', async () => {
    render(
      <BackupStatus
        backupId="test_backup"
        allowControl
      />
    );
    
    await userEvent.click(screen.getByText('Duraklat'));
    expect(await screen.findByText('Devam Ettir')).toBeInTheDocument();
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { BackupStatus } from './BackupStatus';

export default {
  title: 'Super Admin/BackupStatus',
  component: BackupStatus
};

const Template: Story = (args) => <BackupStatus {...args} />;

export const Running = Template.bind({});
Running.args = {
  backupId: 'test_backup',
  status: {
    status: 'running',
    progress: {
      percentage: 45,
      currentStep: 'Dosyalar yedekleniyor'
    }
  }
};

export const Completed = Template.bind({});
Completed.args = {
  backupId: 'test_backup',
  status: {
    status: 'completed',
    result: {
      size: 1024 * 1024 * 100,
      files: 1000,
      duration: 3600
    }
  }
};

export const Failed = Template.bind({});
Failed.args = {
  backupId: 'test_backup',
  status: {
    status: 'failed',
    error: {
      code: 'STORAGE_ERROR',
      message: 'Depolama alanına yazılamadı'
    }
  }
};
```

## Bağımlılıklar

- @tanstack/react-query
- date-fns
- bytes
- react-virtualized
- @headlessui/react

## Stil Özelleştirme

```tsx
<BackupStatus
  className="backup-status"
  progressClassName="status-progress"
  detailsClassName="status-details"
  logsClassName="status-logs"
  customStyles={{
    progress: {
      bar: 'bg-blue-500',
      track: 'bg-gray-200'
    },
    status: {
      running: 'text-blue-600',
      completed: 'text-green-600',
      failed: 'text-red-600'
    }
  }}
/>
```

## Best Practices

1. Düzenli durum kontrolü yap
2. Log boyutunu sınırla
3. Hata durumlarını detaylı raporla
4. İşlem kontrolünü doğrula
5. Performans metriklerini izle 