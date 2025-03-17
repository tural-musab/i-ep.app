# Felaketten Kurtarma Planı

## Genel Bakış

Bu doküman, Maarif Okul Portalı SaaS platformunun beklenmedik bir felaketle karşılaşması durumunda, hizmet sürekliliğini sağlamak ve verileri korumak için izlenecek stratejileri, prosedürleri ve metrikleri tanımlar. Felaketten kurtarma planı, kritik verilerin ve sistemlerin korunması, kesinti sürelerinin minimuma indirilmesi ve normal operasyonlara hızlı geri dönüşün sağlanması amacıyla hazırlanmıştır.

## Yönetici Özeti

Maarif Okul Portalı Felaketten Kurtarma Planı, çeşitli felaket senaryolarında iş sürekliliğini sağlamak ve veri kaybını en aza indirmek için kapsamlı bir çerçeve sunmaktadır. Plan, farklı abonelik seviyelerine göre ölçeklenebilir hizmet seviyesi hedefleri (RTO ve RPO) tanımlamakta ve modern teknolojik altyapı ile desteklenmektedir.

Temel hedeflerimiz:
* **Güvenilirlik**: Kritik eğitim verilerinin korunması ve sürekliliğinin sağlanması
* **Hızlı Kurtarma**: Abonelik seviyesine göre optimize edilmiş kurtarma süreleri
* **Şeffaflık**: Olay sırasında ve sonrasında açık iletişim
* **Sürekli İyileştirme**: Düzenli testler ve değerlendirmelerle planın güncellenmesi

Planımız, teknik detayların yanı sıra organizasyonel sorumlulukları, iletişim stratejilerini ve yasal gereklilikleri de kapsamaktadır. Bu sayede Maarif Okul Portalı, kullanıcılarına güvenilir ve dayanıklı bir eğitim yönetim platformu sunmaya devam edecektir.

## Temel Prensipler

Felaketten kurtarma stratejimiz aşağıdaki temel prensipler üzerine inşa edilmiştir:

1. **Veri Bütünlüğü**: Tüm kritik veriler, felaket senaryolarında bile korunmalıdır
2. **Hizmet Sürekliliği**: Hizmet kesintileri minimize edilmeli ve kritik işlevler önceliklendirilerek devam ettirilmelidir
3. **Şeffaflık ve İletişim**: Felaket durumlarında tüm paydaşlarla açık ve düzenli iletişim sağlanmalıdır
4. **Düzenli Test ve İyileştirme**: Kurtarma planları ve prosedürleri düzenli olarak test edilmeli ve iyileştirilmelidir
5. **Tenant İzolasyonu**: Kurtarma süreçlerinde tenant izolasyonu korunmalı ve veriler karışmamalıdır

## Risk Değerlendirmesi ve Felaket Senaryoları

### Risk Kategorileri

Maarif Okul Portalı için aşağıdaki risk kategorileri tanımlanmıştır:

| Risk Kategorisi | Açıklama | Olasılık | Etki |
|-----------------|----------|----------|------|
| Doğal Afetler | Deprem, sel, yangın gibi doğal felaketler | Düşük | Yüksek |
| Altyapı Hataları | Elektrik kesintisi, ağ problemleri, donanım arızaları | Orta | Yüksek |
| Siber Saldırılar | DDoS, ransomware, veri ihlalleri | Orta | Yüksek |
| Veri Bozulması | Veritabanı bozulmaları, sistem hataları | Orta | Orta |
| İnsan Hatası | Yanlış yapılandırma, yanlışlıkla silme | Orta | Orta-Yüksek |
| Tedarikçi Hatası | Bulut hizmeti sağlayıcı kesintileri, SaaS servis kesintileri | Düşük | Orta-Yüksek |

### Kritik Felaket Senaryoları

#### Senaryo 1: Veritabanı Bozulması veya Veri Kaybı
- **Etki**: Tenant verilerine erişilememe, hizmet kesintisi
- **Olası Nedenler**: Yazılım hataları, insan hatası, siber saldırı
- **Kurtarma Stratejisi**: Yedeklerden geri yükleme, point-in-time recovery

#### Senaryo 2: Ana Veritabanı Sunucusu Arızası
- **Etki**: Tam platform kesintisi
- **Olası Nedenler**: Donanım arızası, altyapı sorunları
- **Kurtarma Stratejisi**: Yedek sunucuya geçiş, yüksek kullanılabilirlik mimarisi

#### Senaryo 3: Bölgesel Veri Merkezi Kesintisi
- **Etki**: Tam platform kesintisi
- **Olası Nedenler**: Doğal afet, güç kesintisi, network sorunları
- **Kurtarma Stratejisi**: Çoklu bölge yedekliliği, alternatif bölgeye failover

#### Senaryo 4: Kapsamlı Siber Saldırı veya Veri İhlali
- **Etki**: Veri güvenliği ihlali, güven kaybı, düzenleyici sonuçlar
- **Olası Nedenler**: Hedefli saldırı, zero-day açık, içeriden tehdit
- **Kurtarma Stratejisi**: İhlal yalıtımı, temiz sistemden geri yükleme, güvenlik denetimi

## Kurtarma Hedefleri

Maarif Okul Portalı'nın hizmet seviyesi anlaşmaları (SLA) ve tenant beklentileri doğrultusunda aşağıdaki kurtarma hedefleri belirlenmiştir:

### Kurtarma Süresi Hedefi (RTO)

RTO, bir felaket sonrası sistemin kabul edilebilir bir seviyede çalışır duruma getirilmesi için geçmesi kabul edilebilir maksimum süredir.

| Abonelik Planı | Kritik Fonksiyonlar RTO | Tam Sistem RTO |
|----------------|-------------------------|----------------|
| Free | 24 saat | 48 saat |
| Standard | 8 saat | 24 saat |
| Premium | 4 saat | 12 saat |

### Kurtarma Noktası Hedefi (RPO)

RPO, bir felaket durumunda kabul edilebilir veri kaybı süresini belirtir.

| Abonelik Planı | RPO |
|----------------|-----|
| Free | 24 saat |
| Standard | 6 saat |
| Premium | 1 saat |

## Felaketten Kurtarma Stratejileri

### Veri Yedekleme ve Replikasyon

#### Veritabanı Yedekleme Stratejisi

```bash
# Örnek yedekleme zamanlaması (crontab)
# Premium tenant'lar için saatlik WAL arşivleme
0 * * * * /scripts/backup/archive_wal_premium_tenants.sh

# Standard tenant'lar için 6 saatlik yedekleme
0 */6 * * * /scripts/backup/backup_standard_tenants.sh

# Free tenant'lar için günlük yedekleme
0 2 * * * /scripts/backup/backup_free_tenants.sh
```

#### Çoklu Bölge Replikasyonu

```typescript
// lib/replication/config.ts
export const replicationConfig = {
  primaryRegion: 'eu-west-1', // Ana bölge (Avrupa - İrlanda)
  secondaryRegions: [
    {
      region: 'eu-central-1', // İkincil bölge (Avrupa - Frankfurt)
      syncType: 'async', // Asenkron replikasyon
      priority: 1 // Failover önceliği
    },
    {
      region: 'eu-south-1', // Üçüncül bölge (Avrupa - Milano)
      syncType: 'async',
      priority: 2
    }
  ],
  replicationTriggers: {
    premium: {
      maxLagSeconds: 60, // Premium tenant'lar için maksimum replikasyon gecikmesi
      alertThresholdSeconds: 30
    },
    standard: {
      maxLagSeconds: 360, // Standard tenant'lar için maksimum replikasyon gecikmesi
      alertThresholdSeconds: 180
    },
    free: {
      maxLagSeconds: 1440, // Free tenant'lar için maksimum replikasyon gecikmesi
      alertThresholdSeconds: 720
    }
  }
};
```

### Yüksek Kullanılabilirlik Mimarisi

Maarif Okul Portalı, yüksek kullanılabilirlik sağlamak için aşağıdaki mimari bileşenleri kullanır:

#### Veritabanı Yüksek Kullanılabilirliği

- **PostgreSQL Streaming Replication**: Ana veritabanı sunucusu, 1 senkron ve 2 asenkron replikaya sahiptir
- **Otomatik Failover**: Patroni/Stolon kullanılarak otomatik failover mekanizması
- **Connection Pooling**: PgBouncer ile veritabanı bağlantı havuzu yönetimi

```yaml
# patroni.yml örneği
scope: maarifportal
namespace: /service/
name: postgresql0

restapi:
  listen: 0.0.0.0:8008
  connect_address: 10.0.0.1:8008

etcd:
  hosts: 10.0.0.2:2379,10.0.0.3:2379,10.0.0.4:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576
    postgresql:
      use_pg_rewind: true
      parameters:
        max_connections: 500
        shared_buffers: 8GB
        wal_level: replica
        hot_standby: "on"
        wal_keep_segments: 100
        max_wal_senders: 10
        max_replication_slots: 10
        hot_standby_feedback: "on"
```

#### Uygulama Katmanı Yüksek Kullanılabilirliği

- **Çoklu İnstans**: Uygulama sunucuları birden fazla instansta çalışır
- **Otomatik Ölçeklendirme**: Trafik yüküne göre otomatik ölçeklendirme
- **Yük Dengeleme**: Bölge içi ve bölgeler arası yük dengeleme

#### Storage Yüksek Kullanılabilirliği

- **Çoklu Kopya**: Tüm dosyalar en az 3 kopya olarak saklanır
- **Çoklu Bölge**: Kritik dosyalar farklı bölgelerde yedeklenir
- **Nesne Depolama**: AWS S3 veya uyumlu nesne depolama kullanımı

### Felaket Kurtarma Altyapısı

#### Özel Felaket Kurtarma Ortamı 

Premium abonelikler için, fiziksel ayrı bir felaket kurtarma ortamı:

```typescript
// lib/disaster-recovery/dr-environment.ts
interface DREnvironment {
  id: string;
  region: string;
  status: 'standby' | 'active' | 'testing';
  lastSyncTime: Date;
  readyForFailover: boolean;
  currentLagSeconds: number;
}

// DR Ortamına failover kararı
function shouldFailoverToDR(
  currentIncident: Incident,
  drEnvironment: DREnvironment
): boolean {
  // Failover kararı mantığı
  if (
    currentIncident.severity === 'critical' &&
    currentIncident.estimatedResolutionTime > 4 * 60 * 60 * 1000 && // 4 saat
    drEnvironment.readyForFailover &&
    drEnvironment.currentLagSeconds < 3600 // 1 saat
  ) {
    return true;
  }
  
  return false;
}
```

## Kurtarma Ekipleri ve Sorumluluklar

### Kriz Yönetim Ekibi

| Rol | Sorumluluklar | İletişim Kanalı |
|-----|---------------|-----------------|
| Kriz Yöneticisi | Olay koordinasyonu, iletişim yönetimi, karar verme | Telefon, Slack |
| Teknik Lider | Teknik kurtarma stratejisi, ekip koordinasyonu | Slack, Video Konferans |
| İletişim Sorumlusu | Müşteri ve paydaş iletişimi | E-posta, Web site |
| İş Sürekliliği Sorumlusu | İş etkisi değerlendirmesi, önceliklendirme | Slack, E-posta |

### Teknik Kurtarma Ekibi

| Rol | Sorumluluklar | Yedek Personel |
|-----|---------------|----------------|
| Veritabanı Uzmanı | Veritabanı kurtarma operasyonları | 2 yedek uzman |
| Sistem Yöneticisi | Altyapı ve sunucu kurtarma | 2 yedek yönetici |
| Ağ Uzmanı | Ağ bağlantıları ve DNS yapılandırması | 1 yedek uzman |
| Güvenlik Uzmanı | Güvenlik ihlalleri, güvenli kurtarma süreçleri | 1 yedek uzman |

## Kurtarma Prosedürleri

### Felaket Durumu Tespiti ve Bildirimi

```typescript
// lib/monitoring/incident-detection.ts
export async function detectAndClassifyIncident(
  alertData: AlertData
): Promise<Incident | null> {
  // Alarm verilerini analiz et
  const incident = await analyzeAlertData(alertData);
  
  if (!incident) {
    return null; // Olay yok veya önemsiz
  }
  
  // Olayı sınıflandır
  await classifyIncidentSeverity(incident);
  
  // Olay kaydı oluştur
  await createIncidentRecord(incident);
  
  // İlgili ekiplere bildirim gönder
  await notifyIncidentTeam(incident);
  
  // Kurtarma sürecini başlat
  if (incident.severity === 'critical' || incident.severity === 'high') {
    await initiateRecoveryProcess(incident);
  }
  
  return incident;
}
```

### Veritabanı Kurtarma

#### Tam Veritabanı Kurtarma

```bash
#!/bin/bash

# Tam veritabanı kurtarma prosedürü
set -e

if [ $# -ne 2 ]; then
  echo "Kullanım: $0 <yedek_tarih_saat> <hedef_db_adı>"
  exit 1
fi

BACKUP_DATETIME=$1
TARGET_DB=$2
BACKUP_FILE="full_backup_${BACKUP_DATETIME}.dump"
S3_BACKUP_PATH="s3://maarifportal-backups/postgres/full/${BACKUP_FILE}"

echo "Kurtarma işlemi başlatılıyor: ${BACKUP_FILE} -> ${TARGET_DB}"

# 1. Yedekleme dosyasını S3'ten indir
echo "Yedek dosyası indiriliyor..."
aws s3 cp "${S3_BACKUP_PATH}" "/tmp/${BACKUP_FILE}"

# 2. Hedef veritabanını oluştur
echo "Hedef veritabanı oluşturuluyor..."
createdb -U postgres "${TARGET_DB}"

# 3. Yedeği geri yükle
echo "Yedek geri yükleniyor..."
pg_restore -U postgres -d "${TARGET_DB}" --clean --if-exists "/tmp/${BACKUP_FILE}"

# 4. Başarılı mı kontrol et
if [ $? -eq 0 ]; then
  echo "Veritabanı başarıyla kurtarıldı: ${TARGET_DB}"
  
  # 5. Status tablosunu güncelle
  psql -U postgres -d "${TARGET_DB}" -c "INSERT INTO public.recovery_status (recovery_time, source_backup, status, notes) VALUES (NOW(), '${BACKUP_FILE}', 'completed', 'Tam veritabanı kurtarma');"
  
  # 6. İşlem tamamlandı bildirimini gönder
  curl -X POST "${NOTIFICATION_WEBHOOK}" \
    -H "Content-Type: application/json" \
    -d '{"message":"Veritabanı kurtarma tamamlandı", "database":"'${TARGET_DB}'", "backup":"'${BACKUP_FILE}'"}'
else
  echo "Kurtarma sırasında hata oluştu!"
  exit 1
fi
```

#### Tenant Seviyesinde Kurtarma

```typescript
// lib/disaster-recovery/tenant-recovery.ts
export async function recoverTenant(
  tenantId: string,
  targetDateTime: Date,
  options: RecoveryOptions = {}
): Promise<RecoveryResult> {
  const recovery: RecoveryResult = {
    tenantId,
    targetDateTime,
    status: 'in-progress',
    startTime: new Date(),
    steps: []
  };
  
  try {
    // 1. Tenant'ın yedeklerini bul
    const backup = await findClosestTenantBackup(tenantId, targetDateTime);
    recovery.steps.push({ 
      name: 'find-backup', 
      status: 'completed', 
      details: { backupId: backup.id } 
    });
    
    // 2. Tenant verilerini geçici şemaya geri yükle
    const tempSchemaName = `recovery_${tenantId}_${Date.now()}`;
    await restoreTenantToTempSchema(backup, tempSchemaName);
    recovery.steps.push({ 
      name: 'restore-to-temp', 
      status: 'completed', 
      details: { tempSchema: tempSchemaName } 
    });
    
    // 3. Veri doğrulama kontrollerini yap
    const validationResult = await validateRestoredTenantData(
      tempSchemaName, 
      tenantId
    );
    
    if (!validationResult.isValid && !options.skipValidation) {
      throw new Error(`Veri doğrulama hatası: ${validationResult.errors.join(', ')}`);
    }
    
    recovery.steps.push({ 
      name: 'validate-data', 
      status: 'completed', 
      details: { validation: validationResult } 
    });
    
    // 4. Mevcut şemayı yedekle (güvenlik için)
    await backupCurrentTenantSchema(tenantId);
    recovery.steps.push({ 
      name: 'backup-current', 
      status: 'completed' 
    });
    
    // 5. Kurtarılan verileri mevcut şemaya taşı
    await swapTenantSchemas(tempSchemaName, `tenant_${tenantId}`);
    recovery.steps.push({ 
      name: 'swap-schemas', 
      status: 'completed' 
    });
    
    // 6. Tenant storage verilerini geri yükle
    await recoverTenantStorage(tenantId, targetDateTime);
    recovery.steps.push({ 
      name: 'recover-storage', 
      status: 'completed' 
    });
    
    // 7. Tenant'ı aktifleştir
    await activateTenant(tenantId);
    
    recovery.status = 'completed';
    recovery.endTime = new Date();
    
    // 8. Kurtarma kaydını oluştur
    await logRecoveryEvent(recovery);
    
    return recovery;
  } catch (error) {
    recovery.status = 'failed';
    recovery.endTime = new Date();
    recovery.error = error.message;
    
    // Hata durumunda da kurtarma kaydı oluştur
    await logRecoveryEvent(recovery);
    
    throw error;
  }
}
```

### Bölgesel Failover (Bölge Değişimi)

```typescript
// lib/disaster-recovery/regional-failover.ts
export async function initiateRegionalFailover(
  sourceRegion: string,
  targetRegion: string,
  reason: string
): Promise<FailoverResult> {
  const failover: FailoverResult = {
    id: uuidv4(),
    sourceRegion,
    targetRegion,
    status: 'initiated',
    startTime: new Date(),
    reason,
    steps: []
  };
  
  try {
    // 1. Ön kontroller
    const preCheckResult = await performFailoverPreChecks(sourceRegion, targetRegion);
    failover.steps.push({ 
      name: 'pre-checks', 
      status: preCheckResult.success ? 'completed' : 'failed',
      details: preCheckResult
    });
    
    if (!preCheckResult.success) {
      throw new Error(`Failover ön kontrolü başarısız: ${preCheckResult.reason}`);
    }
    
    // 2. Failover bildirimi gönder
    await sendFailoverNotifications({
      type: 'start',
      regions: { from: sourceRegion, to: targetRegion },
      estimatedDowntime: preCheckResult.estimatedDowntime
    });
    
    // 3. Kaynak bölgede yazma işlemlerini durdur
    await setSourceRegionReadOnly(sourceRegion);
    failover.steps.push({ name: 'source-readonly', status: 'completed' });
    
    // 4. Replikasyonun tamamlanmasını bekle
    await waitForReplicationCatchup(sourceRegion, targetRegion);
    failover.steps.push({ name: 'replication-sync', status: 'completed' });
    
    // 5. Hedef bölge veritabanını aktifleştir
    await promoteTargetDatabase(targetRegion);
    failover.steps.push({ name: 'promote-target-db', status: 'completed' });
    
    // 6. DNS/Trafik yönlendirmesini değiştir
    await updateTrafficRouting(sourceRegion, targetRegion);
    failover.steps.push({ name: 'update-routing', status: 'completed' });
    
    // 7. Uygulama yapılandırmasını güncelle
    await updateAppConfiguration(targetRegion);
    failover.steps.push({ name: 'update-config', status: 'completed' });
    
    // 8. Sağlık kontrolleri
    const healthCheckResult = await performPostFailoverHealthChecks(targetRegion);
    
    if (!healthCheckResult.success) {
      failover.status = 'completed-with-issues';
      failover.issues = healthCheckResult.issues;
    } else {
      failover.status = 'completed';
    }
    
    failover.steps.push({ 
      name: 'health-checks', 
      status: healthCheckResult.success ? 'completed' : 'completed-with-issues',
      details: healthCheckResult
    });
    
    // 9. Tamamlanma bildirimi
    await sendFailoverNotifications({
      type: 'complete',
      regions: { from: sourceRegion, to: targetRegion },
      status: failover.status,
      issues: failover.issues
    });
    
    failover.endTime = new Date();
    await logFailoverEvent(failover);
    
    return failover;
  } catch (error) {
    failover.status = 'failed';
    failover.endTime = new Date();
    failover.error = error.message;
    
    // Bildirim gönder
    await sendFailoverNotifications({
      type: 'failed',
      regions: { from: sourceRegion, to: targetRegion },
      error: error.message
    });
    
    // Hata kaydı
    await logFailoverEvent(failover);
    
    throw error;
  }
}
```

### Verileri Temiz Bir Ortama Geri Yükleme

Siber saldırı sonrası temiz bir ortama verileri geri yükleme:

```typescript
// lib/disaster-recovery/clean-environment-restore.ts
export async function restoreToCleanEnvironment(
  incidentId: string,
  lastKnownCleanDate: Date
): Promise<RestoreResult> {
  // 1. Temiz bir ortam oluştur
  const newEnvironment = await createCleanEnvironment();
  
  // 2. Saldırı öncesi son temiz yedekleri belirle
  const backupSet = await identifyCleanBackups(lastKnownCleanDate);
  
  // 3. Temel sistem tablolarını geri yükle
  await restoreSystemTables(newEnvironment, backupSet.systemBackup);
  
  // 4. Her tenant için kurtarma işlemi
  const tenantRestoreResults = [];
  
  for (const tenantBackup of backupSet.tenantBackups) {
    const result = await restoreTenantToCleanEnvironment(
      newEnvironment,
      tenantBackup.tenantId,
      tenantBackup.backupPath
    );
    
    tenantRestoreResults.push(result);
  }
  
  // 5. Güvenlik taraması yap
  const securityScanResult = await performSecurityScan(newEnvironment);
  
  if (!securityScanResult.clean) {
    throw new Error('Güvenlik taraması başarısız: Yeni ortamda potansiyel tehditler tespit edildi');
  }
  
  // 6. Yeni ortamı aktifleştir
  await switchToNewEnvironment(newEnvironment.id);
  
  return {
    environmentId: newEnvironment.id,
    restoreDate: new Date(),
    basedOnBackupDate: lastKnownCleanDate,
    tenantResults: tenantRestoreResults,
    securityScanResult
  };
}
```

## Test ve Tatbikat Stratejisi

### Test Takvimi

| Test Türü | Sıklık | Kapsam | Son Test |
|-----------|--------|--------|----------|
| Veritabanı Kurtarma Testi | Aylık | Rastgele seçilen tenant verilerinin geri yüklenmesi | 2023-12-15 |
| Failover Testi | 3 Aylık | Bölgeler arası failover | 2023-11-10 |
| Tam DR Tatbikatı | 6 Aylık | Tam sistem kurtarma senaryosu | 2023-10-22 |
| Veri Bütünlüğü Doğrulama | Haftalık | Yedeklerin bütünlük kontrolü | 2023-12-28 |

### Test Prosedürü

```typescript
// lib/disaster-recovery/testing.ts
export async function scheduleDRTest(
  testType: 'database' | 'failover' | 'full-dr' | 'data-integrity',
  params?: any
): Promise<TestSchedule> {
  // Test zamanlaması mantığı
  
  // Test için bildirim gönder
  await notifyDRTestTeam({
    testType,
    scheduledTime,
    requiredParticipants,
    preTestChecklist
  });
  
  return {
    id: uuidv4(),
    testType,
    status: 'scheduled',
    scheduledTime,
    params,
    requiredParticipants
  };
}

// Test yürütme
export async function executeDRTest(
  testId: string
): Promise<TestResult> {
  const test = await getScheduledTest(testId);
  
  if (!test) {
    throw new Error(`Test bulunamadı: ${testId}`);
  }
  
  switch (test.testType) {
    case 'database':
      return executeDataRestoreTest(test);
    case 'failover':
      return executeFailoverTest(test);
    case 'full-dr':
      return executeFullDRTest(test);
    case 'data-integrity':
      return executeDataIntegrityTest(test);
    default:
      throw new Error(`Bilinmeyen test türü: ${test.testType}`);
  }
}
```

### Test Raporu Örneği

```markdown
# Felaketten Kurtarma Test Raporu

## Test Bilgileri
- **Test ID**: DR-TEST-2023-12-15
- **Test Türü**: Veritabanı Kurtarma Testi
- **Tarih ve Saat**: 15 Aralık 2023, 22:00-00:30
- **Katılımcılar**: Ali Yılmaz (DBA), Ayşe Kaya (Sistem Yöneticisi), Mehmet Demir (Teknik Lider)

## Test Senaryosu
Premium müşteriye ait bir tenant veritabanının çökmesi ve son yedekten geri yüklenmesi senaryosu test edilmiştir.

## Test Adımları ve Sonuçları

1. **Tenant veritabanı şemasının silinmesi**
   - Başarıyla tamamlandı
   - Süre: 2 dakika

2. **Yedeklerin bulunması ve indirilmesi**
   - Başarıyla tamamlandı
   - En son yedek bulundu: tenant_abc123_20231215_180000.dump
   - Süre: 5 dakika

3. **Yedekten geri yükleme**
   - Başarıyla tamamlandı
   - Süre: 18 dakika
   - Geri yüklenen kayıt sayısı: 1,245,678

4. **Veri doğrulama kontrolü**
   - Başarıyla tamamlandı
   - Referans bütünlüğü: %100
   - İş mantığı testleri: Tümü başarılı
   - Süre: 15 dakika

5. **Tenant hizmet aktivasyonu**
   - Başarıyla tamamlandı
   - Süre: 3 dakika

## Toplam Kurtarma Süresi
43 dakika (RTO hedefi: 4 saat)

## Bulgular ve İyileştirme Önerileri

1. Yedekten geri yükleme süresi beklenenden uzun sürdü. İndekslerin paralel oluşturulması için yapılandırma değişikliği önerilir.

2. Veri doğrulama kontrollerinde daha fazla otomatizasyon gerekli. Özellikle iş mantığı testleri için kapsam genişletilmelidir.

3. Geri yükleme sırasında yeterli disk I/O performansı alınamadı. Dedicated IOPs yapılandırması önerilir.

## Sonuç
Test başarıyla tamamlanmıştır. Belirlenen RTO hedefinin altında kalınmıştır. Önerilen iyileştirmeler ile kurtarma süresinin daha da kısaltılması mümkündür.
```

## Dokümantasyon ve Bakım

### DR Dokümanının Bakımı

DR planı, aşağıdaki durumlarda güncellenmelidir:

1. Mimari değişiklikler yapıldığında
2. Önemli teknoloji değişiklikleri olduğunda
3. Test sonuçlarına göre iyileştirmeler belirlendiğinde
4. En az 6 ayda bir olacak şekilde düzenli gözden geçirme

### Doküman Versiyonlama

```markdown
| Versiyon | Tarih | Açıklama | Güncelleyen |
|----------|-------|----------|-------------|
| 1.0.0 | 2023-01-15 | İlk sürüm | Ali Yılmaz |
| 1.1.0 | 2023-04-22 | Multi-bölge stratejisi eklendi | Ayşe Kaya |
| 1.2.0 | 2023-09-10 | Premium tenant RTO/RPO güncellendi | Mehmet Demir |
| 2.0.0 | 2023-12-25 | Tam revizyon, yeni test prosedürleri | Ali Yılmaz |
```

## İletişim Planı

### Bildirim Matrisi

| Olay Türü | İç Paydaşlar | Müşteriler | Sıklık | Kanal |
|-----------|--------------|------------|--------|-------|
| Planlı Bakım | Tüm Ekip | Tüm Tenant'lar | Başlangıç, %50, Tamamlanma | E-posta, Dashboard |
| Kısa Süreli Kesinti (<30dk) | Teknik Ekip | Premium Tenant'lar | Başlangıç, Tamamlanma | Dashboard, SMS (Premium) |
| Uzun Süreli Kesinti (>30dk) | Tüm Ekip, Yönetim | Tüm Tenant'lar | Her 30 dakikada bir | E-posta, SMS, Dashboard, Sosyal Medya |
| Veri İhlali | Kriz Ekibi, Hukuk | Etkilenen Tenant'lar | Tespit, Analiz, Çözüm | Doğrudan İletişim, Resmi Bildirim |

### İletişim Şablonları

```typescript
// lib/communication/templates.ts
export const communicationTemplates = {
  plannedMaintenance: {
    subject: '{{tenant.name}} - Planlı Bakım Bildirimi',
    body: `
Değerli {{tenant.name}} Yöneticisi,

Maarif Okul Portalı'nın performansını ve güvenliğini artırmak için {{startDate}} tarihinde {{startTime}} - {{endTime}} saatleri arasında planlı bakım çalışması gerçekleştireceğiz.

**Bakım Detayları:**
- Tarih: {{startDate}}
- Başlangıç: {{startTime}}
- Tahmini Bitiş: {{endTime}}
- Etkilenen Hizmetler: {{affectedServices}}

Bakım sırasında sisteme erişiminiz kısıtlı olabilir veya kısa süreli kesintiler yaşayabilirsiniz. Tüm verileriniz güvende olacak ve hiçbir veri kaybı yaşanmayacaktır.

Sorularınız için destek ekibimize 7/24 ulaşabilirsiniz.

Saygılarımızla,
Maarif Okul Portalı Ekibi
`
  },
  
  incidentNotification: {
    subject: '{{tenant.name}} - Sistem Durumu Bildirimi {{status}}',
    body: `
Değerli {{tenant.name}} Yöneticisi,

Maarif Okul Portalı'nda şu anda {{incidentType}} kaynaklı bir sorun yaşanmaktadır.

**Durum Bilgisi:**
- Başlangıç Zamanı: {{startTime}}
- Durum: {{status}}
- Etkilenen Hizmetler: {{affectedServices}}
- Tahmini Çözüm Süresi: {{estimatedResolution}}

{{statusDetails}}

Teknik ekibimiz sorunu çözmek için çalışmaktadır. Gelişmeleri status.maarifportal.com adresinden takip edebilirsiniz.

Bu durumdan dolayı özür dileriz. Anlayışınız için teşekkür ederiz.

Saygılarımızla,
Maarif Okul Portalı Ekibi
`
  },
  
  recoveryComplete: {
    subject: '{{tenant.name}} - Sistem Normale Döndü',
    body: `
Değerli {{tenant.name}} Yöneticisi,

{{startTime}} saatinde başlayan sistem sorunu {{endTime}} itibarıyla çözülmüştür. Tüm hizmetlerimiz normal şekilde çalışmaktadır.

**Özet:**
- Sorun: {{incidentType}}
- Başlangıç: {{startTime}}
- Çözüm: {{endTime}}
- Toplam Süre: {{duration}}

{{resolutionDetails}}

Yaşanan kesintiden dolayı özür dileriz. Hizmet kalitemizi artırmak için gerekli önlemleri alıyoruz. Herhangi bir sorunla karşılaşırsanız 7/24 destek ekibimize ulaşabilirsiniz.

Saygılarımızla,
Maarif Okul Portalı Ekibi
`
  },
  
  dataBreachNotification: {
    subject: '{{tenant.name}} - Önemli Güvenlik Bildirimi',
    body: `
Değerli {{tenant.name}} Yöneticisi,

Maarif Okul Portalı'nda {{breachDate}} tarihinde bir veri güvenliği olayı tespit edilmiştir. Bu olay, sisteminize veya verilerinize erişimi etkilemiş olabilir.

**Önemli Bilgiler:**
- Tespit Tarihi: {{detectionDate}}
- Etkilenen Veriler: {{affectedData}}
- Alınan Önlemler: {{securityMeasures}}

{{breachDetails}}

KVKK düzenlemeleri gereğince bu bildirimi yapma zorunluluğumuz bulunmaktadır. Güvenlik ekibimiz olayla ilgili detaylı inceleme yapmaktadır ve en kısa sürede daha fazla bilgi paylaşacağız.

Şifrenizi değiştirmenizi ve sistemde şüpheli aktivite görürseniz derhal bildirmenizi rica ederiz.

Saygılarımızla,
Maarif Okul Portalı Güvenlik Ekibi
`
  }
};

```

## Tenant-Spesifik Kurtarma Stratejileri

### Abonelik Planına Göre Kurtarma Stratejileri

```typescript
// lib/recovery/tenant-specific.ts
interface TenantRecoveryConfig {
  tenant_id: string;
  plan_type: 'free' | 'standard' | 'premium';
  rto_hours: number;
  rpo_hours: number;
  recovery_priority: number; // 1-5 (1 en yüksek)
  backup_frequency: string; // cron expression
  special_requirements?: string[];
  dedicated_resources?: boolean;
}

// Premium tenant'ların recovery yapılandırması
const premiumTenantConfig: Partial<TenantRecoveryConfig> = {
  plan_type: 'premium',
  rto_hours: 4,
  rpo_hours: 1,
  recovery_priority: 1,
  backup_frequency: '0 */1 * * *', // Saatlik
  dedicated_resources: true
};

// Standard tenant'ların recovery yapılandırması
const standardTenantConfig: Partial<TenantRecoveryConfig> = {
  plan_type: 'standard',
  rto_hours: 8,
  rpo_hours: 6,
  recovery_priority: 2,
  backup_frequency: '0 */6 * * *', // 6 saatte bir
  dedicated_resources: false
};

// Free tenant'ların recovery yapılandırması
const freeTenantConfig: Partial<TenantRecoveryConfig> = {
  plan_type: 'free',
  rto_hours: 24,
  rpo_hours: 24,
  recovery_priority: 3,
  backup_frequency: '0 0 * * *', // Günlük
  dedicated_resources: false
};

// Tenant'a özgü kurtarma yapılandırmasını al
export async function getTenantRecoveryConfig(
  tenantId: string
): Promise<TenantRecoveryConfig> {
  // Veritabanından tenant bilgisini al
  const tenant = await getTenantById(tenantId);
  
  if (!tenant) {
    throw new Error(`Tenant bulunamadı: ${tenantId}`);
  }
  
  // Plan tipine göre temel yapılandırmayı al
  let config: Partial<TenantRecoveryConfig>;
  
  switch (tenant.plan_type) {
    case 'premium':
      config = { ...premiumTenantConfig };
      break;
    case 'standard':
      config = { ...standardTenantConfig };
      break;
    case 'free':
    default:
      config = { ...freeTenantConfig };
      break;
  }
  
  // Tenant'a özgü özel yapılandırmaları ekle
  const customConfig = await getCustomTenantRecoveryConfig(tenantId);
  
  return {
    tenant_id: tenantId,
    ...config,
    ...customConfig
  } as TenantRecoveryConfig;
}

// Kurtarma önceliğine göre tenant'ları sırala
export async function getPrioritizedTenantsForRecovery(): Promise<TenantRecoveryConfig[]> {
  const allTenants = await getAllActiveTenants();
  const recoveryConfigs: TenantRecoveryConfig[] = [];
  
  for (const tenant of allTenants) {
    const config = await getTenantRecoveryConfig(tenant.id);
    recoveryConfigs.push(config);
  }
  
  // Öncelik ve plan tipine göre sırala
  return recoveryConfigs.sort((a, b) => {
    if (a.recovery_priority !== b.recovery_priority) {
      return a.recovery_priority - b.recovery_priority;
    }
    
    // Aynı öncelikte ise plan tipine göre sırala
    const planPriority = {
      'premium': 1,
      'standard': 2,
      'free': 3
    };
    
    return planPriority[a.plan_type] - planPriority[b.plan_type];
  });
}
```

## Kurtarma Metrikleri ve Değerlendirme

### Performans Metrikleri

```typescript
// lib/recovery/metrics.ts
interface RecoveryMetrics {
  incident_id: string;
  start_time: Date;
  detection_time: Date;
  resolution_time: Date;
  total_duration_minutes: number;
  detection_duration_minutes: number;
  recovery_duration_minutes: number;
  affected_tenants: number;
  affected_users: number;
  data_loss_assessment: 'none' | 'minimal' | 'significant' | 'severe';
  rto_success: boolean; // RTO hedefine ulaşıldı mı?
  rpo_success: boolean; // RPO hedefine ulaşıldı mı?
  customer_impact_score: number; // 1-10 (1 en düşük etki)
}

// Kurtarma performans raporu oluştur
export async function generateRecoveryPerformanceReport(
  incidentId: string
): Promise<RecoveryReport> {
  // Olay verilerini topla
  const incident = await getIncidentDetails(incidentId);
  const recoveryActions = await getRecoveryActions(incidentId);
  const affectedTenants = await getAffectedTenants(incidentId);
  
  // Metrikleri hesapla
  const metrics: RecoveryMetrics = {
    incident_id: incidentId,
    start_time: incident.start_time,
    detection_time: incident.detection_time,
    resolution_time: incident.resolution_time,
    total_duration_minutes: calculateDurationMinutes(
      incident.start_time, 
      incident.resolution_time
    ),
    detection_duration_minutes: calculateDurationMinutes(
      incident.start_time, 
      incident.detection_time
    ),
    recovery_duration_minutes: calculateDurationMinutes(
      incident.detection_time, 
      incident.resolution_time
    ),
    affected_tenants: affectedTenants.length,
    affected_users: calculateTotalAffectedUsers(affectedTenants),
    data_loss_assessment: assessDataLoss(incident, recoveryActions),
    rto_success: evaluateRTOSuccess(incident, affectedTenants),
    rpo_success: evaluateRPOSuccess(incident, recoveryActions),
    customer_impact_score: calculateCustomerImpactScore(incident, affectedTenants)
  };
  
  // SLA değerlendirmesi
  const slaEvaluation = evaluateSLACompliance(metrics, affectedTenants);
  
  // İyileştirme önerileri
  const improvementSuggestions = generateImprovementSuggestions(metrics, recoveryActions);
  
  return {
    metrics,
    slaEvaluation,
    improvementSuggestions,
    incidentSummary: summarizeIncident(incident),
    affectedTenantsSummary: summarizeAffectedTenants(affectedTenants),
    recoveryActionsSummary: summarizeRecoveryActions(recoveryActions)
  };
}
```

## KPI'lar ve Sürekli İyileştirme

### Performans İyileştirme Ölçümleri

```typescript
// lib/recovery/kpi.ts
// DR KPI'larını değerlendir
export async function evaluateDRPerformanceKPIs(
  timeRange: { start: Date, end: Date }
): Promise<DRPerformanceReport> {
  // İlgili zaman aralığındaki olayları al
  const incidents = await getIncidentsInTimeRange(timeRange);
  
  // KPI hesaplamaları
  const meanTimeToDetect = calculateMeanTimeToDetect(incidents);
  const meanTimeToRecover = calculateMeanTimeToRecover(incidents);
  const recoverySuccessRate = calculateRecoverySuccessRate(incidents);
  const dataLossFrequency = calculateDataLossFrequency(incidents);
  const rtoComplianceRate = calculateRTOComplianceRate(incidents);
  const rpoComplianceRate = calculateRPOComplianceRate(incidents);
  
  // Trendler ve karşılaştırmalar
  const detectionTimeComparison = compareWithPreviousPeriod(
    meanTimeToDetect, 
    'mean_time_to_detect',
    timeRange
  );
  
  const recoveryTimeComparison = compareWithPreviousPeriod(
    meanTimeToRecover, 
    'mean_time_to_recover',
    timeRange
  );
  
  // Sürekli iyileştirme puanı
  const continuousImprovementScore = calculateContinuousImprovementScore({
    meanTimeToDetect,
    meanTimeToRecover,
    recoverySuccessRate,
    rtoComplianceRate,
    rpoComplianceRate,
    detectionTimeComparison,
    recoveryTimeComparison
  });
  
  // İyileştirme alanları
  const improvementAreas = identifyImprovementAreas({
    meanTimeToDetect,
    meanTimeToRecover,
    recoverySuccessRate,
    dataLossFrequency,
    rtoComplianceRate,
    rpoComplianceRate
  });
  
  return {
    timeRange,
    incidentCount: incidents.length,
    meanTimeToDetect,
    meanTimeToRecover,
    recoverySuccessRate,
    dataLossFrequency,
    rtoComplianceRate,
    rpoComplianceRate,
    detectionTimeComparison,
    recoveryTimeComparison,
    continuousImprovementScore,
    improvementAreas,
    recommendations: generateRecommendations(improvementAreas)
  };
}
```

## Yasal ve Düzenleyici Uyumluluk

### KVKK Uyumluluğu

Maarif Okul Portalı, felaketten kurtarma planlamasında KVKK (Kişisel Verilerin Korunması Kanunu) gerekliliklerine uymak için aşağıdaki önlemleri almaktadır:

1. **Veri Bütünlüğü ve Gizliliği**:
   * Tüm yedekler şifrelenerek saklanır
   * İletim sırasında TLS kullanılır
   * Kurtarma işlemleri sırasında veri erişimi kısıtlanır

2. **Veri Silme Hakları**:
   * Silme talepleri yedekler dahil tüm sistemlerde uygulanır
   * Arşivlenen veriler için silme prosedürleri mevcuttur

3. **Veri İhlali Bildirimleri**:
   * İhlal tespit süreçleri
   * 72 saat içinde KVK Kurumu'na bildirim
   * Etkilenen veri sahiplerine bildirim mekanizmaları

4. **Sınır Aşırı Veri Transferi**:
   * Türkiye'deki birincil veri merkezinde veri saklama
   * Gerektiğinde uyumlu ülkelerde yedek saklama

## İlgili Kaynaklar
* [Yedekleme ve Geri Yükleme Prosedürleri](/docs/deployment/backup-restore.md)
* [Multi-Tenant Mimari Stratejisi](/docs/architecture/multi-tenant-strategy.md)
* [Veri İzolasyon Stratejisi](/docs/deployment/data-isolation.md)
* [Teknoloji Yığını](/docs/architecture/tech-stack.md)

