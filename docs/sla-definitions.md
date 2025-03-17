
Burada:
- **Toplam Dakika**: Bir ayda toplam dakika sayısı
- **Kesinti Dakikaları**: Planlanmamış kesinti süresinin toplam dakika sayısı

#### Planlı Bakım Pencereleri

Planlı bakım çalışmaları genellikle aşağıdaki zaman dilimlerinde gerçekleştirilir:

- **Gün**: Cumartesi veya Pazar
- **Saat**: 00:00 - 06:00 (Türkiye saati)

Planlı bakım, aşağıdaki şekilde bildirilecektir:
- Premium kullanıcılar: En az 7 gün önceden
- Standard kullanıcılar: En az 5 gün önceden
- Free kullanıcılar: En az 3 gün önceden

Planlı bakım süreleri, çalışma süresi hesaplamasına dahil edilmez.

### Performans Taahhütleri

#### Sayfa Yükleme Süreleri

| Metrik | Free | Standard | Premium |
|--------|------|----------|---------|
| Ortalama Sayfa Yükleme Süresi | < 5 saniye | < 3 saniye | < 2 saniye |
| %95 Yükleme Süresi | < 8 saniye | < 5 saniye | < 3 saniye |

#### API Yanıt Süreleri

| Metrik | Free | Standard | Premium |
|--------|------|----------|---------|
| Ortalama API Yanıt Süresi | < 1000 ms | < 800 ms | < 500 ms |
| %95 API Yanıt Süresi | < 3000 ms | < 2000 ms | < 1000 ms |

Bu performans metrikleri:
- Türkiye içindeki standart internet bağlantıları için geçerlidir
- İstemci tarafındaki ağ sorunları veya tarayıcı performans sorunları hariç tutulur
- Statik içerik dağıtım ağı (CDN) üzerinden sunulan içeriği içerir

### Veri Yedekleme ve Kurtarma

#### Yedekleme Sıklığı

| Plan | Sıklık | Saklama Süresi | Kurtarma Talebi |
|------|--------|----------------|-----------------|
| Free | Günlük | 7 gün | Ücretli |
| Standard | Günlük | 30 gün | Ayda 1 ücretsiz |
| Premium | Saatlik | 90 gün | Sınırsız ücretsiz |

#### Veri Kurtarma Süresi (RTO)

| Plan | Normal Kurtarma | Hızlı Kurtarma |
|------|-----------------|----------------|
| Free | 48 saat içinde | Ücretli - 24 saat |
| Standard | 24 saat içinde | Ücretli - 12 saat |
| Premium | 4 saat içinde | Ücretsiz - 2 saat |

### Teknik Destek Taahhütleri

#### Olay Sınıflandırması

| Öncelik | Tanım |
|---------|-------|
| **Kritik** | Platformun tamamen veya önemli işlevlerinin kullanılamaz durumda olması. Tüm kullanıcılar veya kullanıcıların büyük çoğunluğu etkilenmiştir. Örnekler: Oturum açma çalışmıyor, veri görüntülenemiyor, sistem çökmüş durumda. |
| **Önemli** | Önemli işlevlerin bozuk veya yavaş çalışması. Kullanıcıların önemli bir kısmı etkilenmiştir. Örnekler: Belirli raporlar alınamıyor, sistem yavaş çalışıyor, bazı özellikler kullanılamıyor. |
| **Normal** | Belirli özellikler beklendiği gibi çalışmıyor ancak iş akışını tamamen engellemiyor. Örnekler: Küçük hata mesajları, bazı UI sorunları, küçük işlev hataları. |
| **Düşük** | Küçük hatalar veya iyileştirme önerileri. İş akışını etkilemez. Örnekler: UI geliştirme talepleri, dokümantasyon soruları, küçük kozmetik hatalar. |

#### Yanıt ve Çözüm Süreleri

| Plan | Öncelik | İlk Yanıt | Hedef Çözüm Süresi |
|------|---------|-----------|-------------------|
| **Free** | Tüm olaylar | 24 iş saati | En iyi çaba |
| **Standard** | Kritik | 8 iş saati | 48 saat |
|  | Önemli | 16 iş saati | 72 saat |
|  | Normal | 24 iş saati | En iyi çaba |
|  | Düşük | 48 iş saati | En iyi çaba |
| **Premium** | Kritik | 2 saat (7/24) | 8 saat |
|  | Önemli | 4 iş saati | 24 saat |
|  | Normal | 8 iş saati | 72 saat |
|  | Düşük | 16 iş saati | En iyi çaba |

#### Destek Kanalları ve Çalışma Saatleri

| Plan | Destek Kanalları | Çalışma Saatleri |
|------|------------------|------------------|
| **Free** | E-posta | İş saatleri (09:00-18:00, Pazartesi-Cuma) |
| **Standard** | E-posta, İletişim Formu | İş saatleri (09:00-18:00, Pazartesi-Cuma) |
| **Premium** | E-posta, İletişim Formu, Telefon | 7/24 (Kritik olaylar için) <br> İş saatleri (Diğer olaylar için) |

## SLA Ölçümü ve Raporlama

### Ölçüm Metodolojisi

#### Çalışma Süresi İzleme

Sistem erişilebilirliği aşağıdaki yöntemlerle izlenir:
- Harici izleme hizmetleri (Pingdom, StatusCake, UptimeRobot)
- Çeşitli coğrafi lokasyonlardan düzenli kontroller
- Sistem API endpoint'lerine düzenli sağlık kontrolleri
- CDN ve uygulama katmanı performans metrikleri

Kesinti, aşağıdaki durumlarda gerçekleşmiş kabul edilir:
- Sistemin tüm kullanıcılar için tamamen erişilemez olması
- Temel işlevlerin (oturum açma, temel veri görüntüleme, vb.) çalışmaması
- Sistemin 5 dakikadan uzun süre yanıt vermemesi

#### Performans İzleme

Sistem performansı aşağıdaki metriklerle izlenir:
- Gerçek kullanıcı ölçümleri (RUM - Real User Monitoring)
- Sentetik işlem izleme (kritik işlemler için)
- Sunucu yanıt süreleri ve kaynak kullanımı
- CDN ve tarayıcı önbellek performansı

### Raporlama

#### SLA Raporları

SLA performans raporları aşağıdaki şekilde sunulacaktır:

| Plan | Rapor Sıklığı | Rapor İçeriği |
|------|---------------|---------------|
| **Free** | İstek üzerine | Basit çalışma süresi raporu |
| **Standard** | Aylık | Çalışma süresi, performans özeti |
| **Premium** | Haftalık | Detaylı çalışma süresi, performans, olay ve çözüm süreleri |

Premium kullanıcılar için özel bir dashboard üzerinden SLA metriklerine gerçek zamanlı erişim sağlanacaktır.

## SLA İhlali ve Telafi

### İhlal Durumunda Kredilendirme

Taahhüt edilen SLA seviyelerinin altında kalan performans durumunda aşağıdaki telafi mekanizmaları uygulanacaktır:

#### Çalışma Süresi SLA İhlalleri

| Plan | Kesinti Süresi | Kredi |
|------|----------------|-------|
| **Free** | SLA yok | SLA yok |
| **Standard** | %99.5 - %99.0 | Aylık ücretin %10'u |
|  | %99.0 - %98.0 | Aylık ücretin %25'i |
|  | < %98.0 | Aylık ücretin %50'si |
| **Premium** | %99.9 - %99.5 | Aylık ücretin %10'u |
|  | %99.5 - %99.0 | Aylık ücretin %25'i |
|  | < %99.0 | Aylık ücretin %50'si |

#### Destek Yanıt Süresi SLA İhlalleri

| Plan | Gecikme | Kredi |
|------|---------|-------|
| **Free** | SLA yok | SLA yok |
| **Standard** | > 2x taahhüt | Aylık ücretin %5'i |
| **Premium** | > 1.5x taahhüt | Aylık ücretin %5'i |
|  | > 2x taahhüt | Aylık ücretin %10'u |

### Kredi Talep Süreci

SLA ihlali durumunda kredi talep süreci aşağıdaki şekilde işleyecektir:

1. Kullanıcı, ihlali tespit ettikten sonra 30 gün içinde yazılı olarak talepte bulunmalıdır
2. Talep, destekleyici verileri (tarih/saat, etkilenen işlevler, hata mesajları) içermelidir
3. Maarif Okul Portalı ekibi talebi 10 iş günü içinde değerlendirecektir
4. Onaylanan krediler, bir sonraki fatura dönemine indirim olarak yansıtılacaktır
5. Yıllık ödeme yapan müşteriler için, kredi abonelik süresine eklenecektir

## SLA Dışı Tutulan Durumlar

Aşağıdaki durumlar SLA taahhütleri dışında tutulur:

1. **Planlı Bakım**: Önceden duyurulan bakım pencereleri
2. **Mücbir Sebepler**: Doğal afetler, terör saldırıları, grevler, devlet kısıtlamaları
3. **Kullanıcı Kaynaklı Sorunlar**: Yanlış kullanım, API limitlerinin aşılması, vb.
4. **Üçüncü Taraf Sorunları**: Entegre edilen harici servislerin kesintileri
5. **Ağ Sorunları**: İnternet servis sağlayıcı sorunları, kullanıcı ağı sorunları
6. **Güvenlik Tehditleri**: DDoS saldırıları ve diğer kötü niyetli aktiviteler
7. **Hesap Askıya Alınması**: Sözleşme ihlali, ödeme sorunları nedeniyle askıya alınan hesaplar

## SLA Değişiklikleri

Maarif Okul Portalı, bu SLA'da değişiklik yapma hakkını saklı tutar. Değişiklikler aşağıdaki şekilde bildirilecektir:

| Plan | Bildirim Süresi |
|------|-----------------|
| **Free** | 30 gün önceden |
| **Standard** | 60 gün önceden |
| **Premium** | 90 gün önceden |

Değişiklikler, e-posta ve platform içi bildirimlerle kullanıcılara iletilecektir. Mevcut aboneler için, değişiklikler genellikle bir sonraki abonelik yenileme döneminde geçerli olacaktır.

## İzleme ve Olay Yönetimi

### Sistem İzleme

Maarif Okul Portalı, aşağıdaki izleme altyapısını kullanarak hizmet seviyelerini sürekli olarak izler:

```typescript
// monitoring/config.ts örneği
export const monitoringConfig = {
  uptimeChecks: [
    {
      name: 'Main Application',
      endpoint: 'https://app.maarifportal.com/api/health',
      interval: 60, // saniye
      regions: ['eu-west-1', 'eu-central-1', 'eu-south-1'],
      alertThreshold: 120, // saniye
    },
    {
      name: 'Authentication Service',
      endpoint: 'https://auth.maarifportal.com/health',
      interval: 30,
      regions: ['eu-west-1', 'eu-central-1', 'eu-south-1'],
      alertThreshold: 60,
    },
    // Diğer endpoint'ler...
  ],
  
  performanceMonitoring: {
    pageLoadSampleRate: 0.1, // %10 örnekleme
    apiResponseSampleRate: 0.2, // %20 örnekleme
    slowThresholds: {
      pageLoad: 5000, // 5 saniye
      apiResponse: 1000, // 1 saniye
    }
  },
  
  alertChannels: [
    {
      type: 'slack',
      webhook: process.env.ALERT_SLACK_WEBHOOK,
      severity: ['critical', 'high'],
    },
    {
      type: 'email',
      recipients: ['oncall@maarifportal.com'],
      severity: ['critical', 'high', 'medium'],
    },
    {
      type: 'sms',
      recipients: ['+905XXXXXXXXX'],
      severity: ['critical'],
    }
  ],
  
  escalationPolicy: {
    gracePeriod: 15, // dakika
    levels: [
      {
        timeout: 10, // dakika
        contacts: ['primary-oncall@maarifportal.com'],
      },
      {
        timeout: 20,
        contacts: ['secondary-oncall@maarifportal.com', '+905XXXXXXXXX'],
      },
      {
        timeout: 30,
        contacts: ['cto@maarifportal.com', '+905XXXXXXXXX'],
      }
    ]
  }
};
```

### Olay Yanıt Prosedürü

Bir kesinti veya performans sorunu tespit edildiğinde izlenecek prosedür:

1. **Tespit & Triaj**:
   - Otomatik izleme sistemi sorunu tespit eder
   - Nöbetçi mühendis bilgilendirilir
   - Sorunun etkisi ve kapsamı değerlendirilir

2. **İlk Yanıt**:
   - Sorunu araştırmak ve izole etmek için ilk adımlar atılır
   - Premium müşteriler için durum güncellemesi gönderilir
   - Statü sayfası güncellenir

3. **İletişim**:
   - Etkinin kapsamına bağlı olarak iletişim planı uygulanır
   - Eğer etki büyükse, tüm etkilenen müşterilere bildirim gönderilir
   - Düzenli statü güncellemeleri sağlanır

4. **Çözüm**:
   - Teknik ekip sorunu çözmek için çalışır
   - Geçici çözümler uygulanır
   - Kalıcı çözüm geliştirilir ve uygulanır

5. **Kurtarma**:
   - Normal hizmet düzeyleri yeniden sağlanır
   - Etkilenen sistemler doğrulanır
   - Veri tutarlılığı kontrol edilir

6. **Olay Sonrası**:
   - Kapsamlı bir olay sonrası analiz yapılır
   - Kök neden analizi tamamlanır
   - Tekrarlanmaması için önlemler alınır
   - Etkilenen müşterilere olay raporu sağlanır (Premium Plan)

## Hizmet İyileştirme ve Gözden Geçirme

### Düzenli SLA Performans Değerlendirmesi

Maarif Okul Portalı, SLA performansını sürekli olarak değerlendirir ve iyileştirir:

- **Aylık Gözden Geçirme**: Operasyonel ekip, aylık SLA performans metriklerini gözden geçirir
- **Çeyrek Dönem Değerlendirmesi**: Yönetim ekibi, çeyrek dönemlik SLA eğilimlerini analiz eder
- **Yıllık SLA Revizyonu**: SLA gereksinimleri yıllık olarak gözden geçirilir ve güncellenir

### Müşteri Geri Bildirimi

Hizmet kalitesinin sürekli iyileştirilmesi için:

- Düzenli müşteri memnuniyet anketleri
- Destek etkileşimleri sonrası alınan geri bildirimler
- Odak grup toplantıları (Premium müşteriler için)
- Ürün geri bildirim kanalları ve özellik istekleri

Bu geri bildirimler, SLA taahhütlerinin ve hizmet kalitesinin iyileştirilmesi için kullanılır.

## Kurtarma ve İş Sürekliliği

### Felaket Kurtarma Planı

Maarif Okul Portalı, geniş çaplı kesintilere karşı kapsamlı bir felaket kurtarma planına sahiptir:

```typescript
// recovery/disaster-recovery-config.ts örneği
export const disasterRecoveryConfig = {
  primary: {
    region: 'eu-west-1',
    databases: {
      main: {
        instanceType: 'db.r5.2xlarge',
        multiAZ: true,
        backupStrategy: 'continuous',
      },
      reporting: {
        instanceType: 'db.r5.large',
        multiAZ: true,
        backupStrategy: 'daily',
      }
    },
    storage: {
      type: 's3',
      buckets: ['maarifportal-prod-data', 'maarifportal-prod-files'],
      replicationEnabled: true,
    }
  },
  
  secondary: {
    region: 'eu-central-1',
    databases: {
      main: {
        instanceType: 'db.r5.2xlarge',
        syncType: 'async',
        lagAlert: 300, // saniye
      },
      reporting: {
        instanceType: 'db.r5.large',
        syncType: 'async',
        lagAlert: 3600, // saniye
      }
    },
    storage: {
      type: 's3',
      buckets: ['maarifportal-dr-data', 'maarifportal-dr-files'],
    }
  },
  
  rto: {
    free: 48 * 60 * 60, // 48 saat (saniye)
    standard: 24 * 60 * 60, // 24 saat
    premium: 4 * 60 * 60, // 4 saat
  },
  
  rpo: {
    free: 24 * 60 * 60, // 24 saat
    standard: 12 * 60 * 60, // 12 saat
    premium: 1 * 60 * 60, // 1 saat
  },
  
  testSchedule: {
    fullDrTest: 'YEARLY',
    componentTests: 'QUARTERLY',
    backupVerification: 'WEEKLY',
  }
};
```

Felaket kurtarma planı hakkında detaylı bilgi için [Felaketten Kurtarma Planı](deployment/disaster-recovery.md) belgesine bakın.

### İş Sürekliliği Stratejisi

Maarif Okul Portalı, iş sürekliliğini sağlamak için:

- Çoklu bölge dağıtımı (EU-West ve EU-Central)
- Otomatik yük dengeleme ve ölçeklendirme
- Veri replikasyonu ve yedeklemeler
- 24/7 izleme ve uyarı sistemleri
- Eğitimli nöbetçi ekibi
- Düzenli felaket kurtarma tatbikatları

Premium müşteriler için, iş sürekliliği danışmanlığı ve özel kurtarma planları sunulmaktadır.

## Müşteri Sorumlulukları

SLA taahhütlerinin karşılanabilmesi için müşterilerin aşağıdaki sorumlulukları vardır:

1. **Güncel İletişim Bilgileri**: Geçerli iletişim bilgilerinin sağlanması ve güncel tutulması
2. **Zamanında Yanıt**: Destek ekibinin sorularına zamanında yanıt verilmesi
3. **Güvenlik Uygulamaları**: Güçlü parolalar kullanma, hesap bilgilerini koruma
4. **Kabul Edilebilir Kullanım**: Hizmet kullanım politikalarına uyma
5. **İzinsiz Değişiklikler**: API veya sistem kaynaklarına izinsiz müdahale etmeme
6. **Kaynak Kullanımı**: Adil kullanım politikalarına uyma ve kaynak limitlerini aşmama
7. **Zamanında Güncelleme**: İstemci tarafı yazılımların güncel tutulması
8. **Problem Bildirimi**: Sorunların zamanında ve doğru şekilde bildirilmesi

## İletişim ve Eskalasyon

### Destek İletişim Kanalları

| Plan | Kanal | İletişim Detayları | Yanıt Beklentisi |
|------|-------|-------------------|------------------|
| **Free** | E-posta | support@maarifportal.com | 24 iş saati |
| **Standard** | E-posta | support@maarifportal.com | 8-16 iş saati |
|  | İletişim Formu | Portal üzerinden | 8-16 iş saati |
| **Premium** | E-posta | premium-support@maarifportal.com | 2-8 saat |
|  | İletişim Formu | Portal üzerinden | 2-8 saat |
|  | Telefon | +90 212 XXX XX XX | Anında (7/24) |

### Eskalasyon Prosedürü

Sorunlar çözülmediğinde veya SLA ihlali durumunda izlenecek eskalasyon adımları:

#### Premium Plan

1. **Seviye 1**: Destek Yöneticisi
   - İletişim: support-manager@maarifportal.com
   - Yanıt Beklentisi: 2 saat

2. **Seviye 2**: Teknik Operasyonlar Direktörü
   - İletişim: technical-ops@maarifportal.com
   - Yanıt Beklentisi: 4 saat

3. **Seviye 3**: CTO
   - İletişim: cto@maarifportal.com
   - Yanıt Beklentisi: 24 saat

#### Standard Plan

1. **Seviye 1**: Destek Ekibi Lideri
   - İletişim: support-lead@maarifportal.com
   - Yanıt Beklentisi: 8 iş saati

2. **Seviye 2**: Müşteri Başarı Yöneticisi
   - İletişim: customer-success@maarifportal.com
   - Yanıt Beklentisi: 24 iş saati

## Sonuç

Bu SLA dokümanı, Maarif Okul Portalı'nın hizmet kalitesi taahhütlerini, ölçüm metodolojisini ve müşterilerin ihtiyaç duyabileceği tüm SLA detaylarını içerir. Bu taahhütler, platformun güvenilir, yüksek performanslı ve kullanıcı ihtiyaçlarına uygun bir hizmet sunmasını sağlamak için tasarlanmıştır.

SLA'nın güncel versiyonuna her zaman [portal.maarifportal.com/sla](https://portal.maarifportal.com/sla) adresinden erişilebilir.

## İlgili Dokümanlar

- [Proje Planı](project-plan.md)
- [Felaketten Kurtarma Planı](deployment/disaster-recovery.md)
- [Teknik Borç Yönetimi Stratejisi](technical-debt.md)
- [UX İzleme Planı](ux-monitoring-plan.md)