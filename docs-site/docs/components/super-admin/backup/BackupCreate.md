# BackupCreate Komponenti

Yeni yedekleme işlemi başlatmak için kullanılan form komponenti.

## Özellikler

- Yedekleme tipi seçimi
- Zamanlama seçenekleri
- İlerleme takibi
- Tenant seçimi
- Veri kapsamı belirleme
- Şifreleme seçenekleri
- Depolama hedefi seçimi

## Props

```typescript
interface BackupCreateProps {
  /** Tenant ID */
  tenantId?: string;

  /** Yedekleme başlatıldığında çağrılır */
  onBackupStart?: (config: BackupConfig) => Promise<void>;

  /** İptal edildiğinde çağrılır */
  onCancel?: () => void;

  /** İlerleme durumu değiştiğinde çağrılır */
  onProgressChange?: (progress: BackupProgress) => void;

  /** Varsayılan ayarlar */
  defaultSettings?: Partial<BackupSettings>;

  /** Kullanılabilir depolama hedefleri */
  storageTargets?: StorageTarget[];

  /** Form durumu */
  status?: 'idle' | 'validating' | 'starting' | 'in_progress' | 'completed' | 'error';
}

interface BackupConfig {
  type: BackupType;
  schedule?: BackupSchedule;
  scope: BackupScope;
  encryption?: EncryptionConfig;
  storage: StorageConfig;
  retention: RetentionPolicy;
  compression?: CompressionConfig;
  notification?: NotificationConfig;
}

interface BackupProgress {
  status: BackupStatus;
  percentage: number;
  currentStep: string;
  startTime: string;
  estimatedEndTime?: string;
  bytesProcessed: number;
  totalBytes: number;
  speed: number;
}

type BackupType = 'full' | 'incremental' | 'differential';
type BackupStatus = 'pending' | 'running' | 'completed' | 'failed';

interface StorageTarget {
  id: string;
  name: string;
  type: 'local' | 's3' | 'gcs' | 'azure';
  config: Record<string, any>;
}
```

## Kullanım

```tsx
import { BackupCreate } from '@components/super-admin/backup';

export default function CreateBackupPage() {
  const handleBackupStart = async (config: BackupConfig) => {
    try {
      await startBackup(config);
      showSuccess('Yedekleme başlatıldı');
      router.push('/backups');
    } catch (error) {
      showError('Yedekleme başlatılamadı');
    }
  };

  const handleProgressChange = (progress: BackupProgress) => {
    updateProgress(progress);
  };

  return (
    <BackupCreate
      tenantId="tenant_123"
      onBackupStart={handleBackupStart}
      onProgressChange={handleProgressChange}
      defaultSettings={{
        type: 'full',
        compression: {
          enabled: true,
          level: 'medium',
        },
      }}
      storageTargets={[
        {
          id: 's3_backup',
          name: 'AWS S3',
          type: 's3',
          config: {
            bucket: 'backups',
          },
        },
      ]}
    />
  );
}
```

## Form Bölümleri

### Temel Ayarlar

```tsx
<BackupBasicSettings type={type} onTypeChange={setType} scope={scope} onScopeChange={setScope} />
```

### Zamanlama

```tsx
<BackupScheduling
  schedule={schedule}
  onScheduleChange={setSchedule}
  showRecurrence={type === 'incremental'}
/>
```

### Depolama

```tsx
<BackupStorage
  targets={storageTargets}
  selected={selectedTarget}
  onTargetSelect={setSelectedTarget}
  config={storageConfig}
  onConfigChange={setStorageConfig}
/>
```

## API Entegrasyonu

```typescript
// Yedekleme başlatma
const startBackup = async (config: BackupConfig) => {
  const response = await fetch('/api/backups', {
    method: 'POST',
    body: JSON.stringify(config),
  });
  return response.json();
};

// İlerleme takibi
const trackProgress = async (backupId: string) => {
  const response = await fetch(`/api/backups/${backupId}/progress`);
  return response.json();
};

// Depolama hedefi doğrulama
const validateStorage = async (target: StorageTarget) => {
  const response = await fetch('/api/storage/validate', {
    method: 'POST',
    body: JSON.stringify(target),
  });
  return response.json();
};
```

## Form Validasyonu

```typescript
const validationSchema = yup.object().shape({
  type: yup
    .string()
    .required('Yedekleme tipi seçilmelidir')
    .oneOf(['full', 'incremental', 'differential']),
  scope: yup.object().shape({
    databases: yup.array().min(1, 'En az bir veritabanı seçilmelidir'),
    includeFiles: yup.boolean(),
    excludePaths: yup.array().of(yup.string()),
  }),
  storage: yup.object().shape({
    target: yup.string().required('Depolama hedefi seçilmelidir'),
    path: yup.string().required('Depolama yolu belirtilmelidir'),
  }),
  encryption: yup.object().shape({
    enabled: yup.boolean(),
    key: yup.string().when('enabled', {
      is: true,
      then: yup.string().required('Şifreleme anahtarı gereklidir'),
    }),
  }),
});
```

## İlerleme Gösterimi

```tsx
<BackupProgress status={status} progress={progress} showPercentage showSpeed showEstimatedTime />
```

## Erişilebilirlik

- Form kontrolleri için label kullanımı
- İlerleme durumu bildirimleri
- Hata mesajları için aria-invalid
- Klavye navigasyonu
- Focus yönetimi

## Responsive Davranış

| Ekran Boyutu   | Davranış                 |
| -------------- | ------------------------ |
| > 1024px       | Yan yana form grupları   |
| 768px - 1024px | Tek kolon form           |
| < 768px        | Basitleştirilmiş görünüm |

## Test

```typescript
describe('BackupCreate', () => {
  it('validates required fields', async () => {
    render(<BackupCreate />);

    await userEvent.click(screen.getByText('Yedekleme Başlat'));
    expect(screen.getByText('Yedekleme tipi seçilmelidir')).toBeInTheDocument();
  });

  it('handles backup start', async () => {
    const onBackupStart = jest.fn();
    render(<BackupCreate onBackupStart={onBackupStart} />);

    await userEvent.selectOptions(
      screen.getByLabelText('Yedekleme Tipi'),
      'full'
    );
    await userEvent.click(screen.getByText('Yedekleme Başlat'));

    expect(onBackupStart).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'full' })
    );
  });

  it('shows progress updates', async () => {
    const onProgressChange = jest.fn();
    render(
      <BackupCreate
        status="in_progress"
        onProgressChange={onProgressChange}
      />
    );

    // Simulate progress
    mockBackupProgress({
      status: 'running',
      percentage: 50,
      bytesProcessed: 1024,
      totalBytes: 2048
    });

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });
});
```

## Storybook

```typescript
import { Story } from '@storybook/react';
import { BackupCreate } from './BackupCreate';

export default {
  title: 'Super Admin/BackupCreate',
  component: BackupCreate
};

const Template: Story = (args) => <BackupCreate {...args} />;

export const Default = Template.bind({});
Default.args = {
  storageTargets: [
    {
      id: 's3',
      name: 'AWS S3',
      type: 's3'
    }
  ]
};

export const WithProgress = Template.bind({});
WithProgress.args = {
  status: 'in_progress',
  progress: {
    status: 'running',
    percentage: 35,
    currentStep: 'Veritabanı yedekleniyor'
  }
};

export const WithError = Template.bind({});
WithError.args = {
  status: 'error',
  error: 'Depolama hedefine bağlanılamadı'
};
```

## Bağımlılıklar

- react-hook-form
- @hookform/resolvers/yup
- yup
- @headlessui/react
- date-fns
- bytes

## Stil Özelleştirme

```tsx
<BackupCreate
  className="backup-form"
  formClassName="create-form"
  sectionClassName="form-section"
  buttonClassName="submit-button"
  customStyles={{
    progress: {
      bar: 'bg-blue-500',
      track: 'bg-gray-200',
    },
    status: {
      running: 'text-blue-600',
      completed: 'text-green-600',
      error: 'text-red-600',
    },
  }}
/>
```

## Best Practices

1. Yedekleme öncesi alan kontrolü yap
2. Şifreleme anahtarını güvenli sakla
3. İlerleme durumunu düzenli güncelle
4. Hata durumunda retry mekanizması kullan
5. Yedekleme loglarını tut
