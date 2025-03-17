# Yedekleme ve Geri Yükleme Prosedürleri

## Genel Bakış

Maarif Okul Portalı SaaS platformu, eğitim kurumlarının kritik verilerini barındırdığından, kapsamlı ve güvenilir bir yedekleme ve geri yükleme stratejisi hayati öneme sahiptir. Bu doküman, platformumuzun veri yedekleme ve geri yükleme prosedürlerini, tenant izolasyonu dikkate alınarak detaylandırır.

## Temel Prensipler

Yedekleme ve geri yükleme stratejimiz aşağıdaki prensiplere dayanmaktadır:

1. **Veri Bütünlüğü**: Tüm yedeklemeler, verilerin bütünlüğünü ve tutarlılığını korumalıdır
2. **Tenant İzolasyonu**: Her tenant'ın verileri izole edilmiş şekilde yedeklenmeli ve geri yüklenebilmelidir
3. **Otomatik ve Manuel Süreçler**: Hem otomatik hem de manuel yedekleme ve geri yükleme süreçleri desteklenmelidir
4. **Çoklu Saklama Noktaları**: Yedekler birden fazla coğrafi konumda saklanmalıdır
5. **Düzenli Test**: Yedekleme ve geri yükleme prosedürleri düzenli olarak test edilmelidir
6. **KVKK Uyumluluğu**: Tüm süreçler, Kişisel Verilerin Korunması Kanunu gereksinimlerini karşılamalıdır

## Veri Sınıflandırması

Yedekleme stratejimiz, verileri aşağıdaki kategorilere ayırır:

### 1. Kritik Sistem Verileri
- Tenant kayıtları ve yapılandırmaları
- Kullanıcı hesapları ve kimlik doğrulama verileri
- Abonelik ve ödeme bilgileri
- Sistem yapılandırma verileri

### 2. Tenant-Spesifik Veriler
- Öğrenci ve öğretmen kayıtları
- Akademik veriler (sınıflar, dersler, notlar)
- Ödevler ve değerlendirmeler
- Devam/devamsızlık kayıtları
- İletişim ve mesajlaşma verileri

### 3. Dosya ve Medya Verileri
- Öğrenci ve personel fotoğrafları
- Belgeler ve ödev teslim dosyaları
- Ders materyalleri ve sunumlar
- Tenant logo ve görsel varlıkları

## Yedekleme Stratejisi

### PostgreSQL Veritabanı Yedekleme

#### Düzenli Tam Yedeklemeler

Tüm veritabanı, günlük olarak tam yedeklenir:

```bash
# PostgreSQL tam yedekleme script örneği
#!/bin/bash

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/postgres"
S3_BUCKET="maarifportal-backups"

# Tam veritabanı yedeği
pg_dump -U postgres -F custom -f "$BACKUP_DIR/full_backup_$TIMESTAMP.dump" maarifportal_db

# Yedekleme başarılı mı kontrol et
if [ $? -eq 0 ]; then
  echo "Tam yedekleme başarılı: full_backup_$TIMESTAMP.dump"
  
  # Yedekleri S3'e yükle
  aws s3 cp "$BACKUP_DIR/full_backup_$TIMESTAMP.dump" "s3://$S3_BUCKET/postgres/full/"
  
  # 30 günden eski yerel yedekleri temizle
  find "$BACKUP_DIR" -name "full_backup_*.dump" -mtime +30 -delete
else
  echo "Yedekleme başarısız!" | mail -s "Maarif Portal Yedekleme Hatası" admin@maarifportal.com
fi
```

#### Tenant-Bazlı Yedeklemeler

Her tenant için ayrı şema yedeklemeleri, günlük olarak gerçekleştirilir:

```bash
#!/bin/bash

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/postgres/tenants"
S3_BUCKET="maarifportal-backups"

# Tüm tenant ID'lerini listele
TENANT_IDS=$(psql -U postgres -d maarifportal_db -t -c "SELECT id FROM public.tenants WHERE is_active = true;")

# Her tenant için şema yedeği al
for TENANT_ID in $TENANT_IDS; do
  TENANT_ID=$(echo $TENANT_ID | tr -d ' ')
  echo "Tenant yedekleniyor: $TENANT_ID"
  
  # Tenant şemasını yedekle
  pg_dump -U postgres -F custom -n "tenant_$TENANT_ID" -f "$BACKUP_DIR/tenant_${TENANT_ID}_$TIMESTAMP.dump" maarifportal_db
  
  # Yedekleme başarılı mı kontrol et
  if [ $? -eq 0 ]; then
    echo "Tenant yedekleme başarılı: tenant_${TENANT_ID}_$TIMESTAMP.dump"
    
    # Yedekleri S3'e yükle
    aws s3 cp "$BACKUP_DIR/tenant_${TENANT_ID}_$TIMESTAMP.dump" "s3://$S3_BUCKET/postgres/tenants/$TENANT_ID/"
    
    # 14 günden eski yerel tenant yedeklerini temizle
    find "$BACKUP_DIR" -name "tenant_${TENANT_ID}_*.dump" -mtime +14 -delete
  else
    echo "Tenant $TENANT_ID yedekleme başarısız!" | mail -s "Maarif Portal Tenant Yedekleme Hatası" admin@maarifportal.com
  fi
done
```

#### WAL (Write-Ahead Log) Arşivleme

Point-in-time recovery için WAL dosyaları sürekli olarak arşivlenir:

```bash
# postgresql.conf yapılandırması
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /var/lib/postgresql/archive/%f && cp %p /var/lib/postgresql/archive/%f'
```

```bash
# WAL dosyalarını S3'e yükleme script örneği
#!/bin/bash

ARCHIVE_DIR="/var/lib/postgresql/archive"
S3_BUCKET="maarifportal-backups"

# Yeni WAL dosyalarını bul ve S3'e yükle
find "$ARCHIVE_DIR" -type f -name "*.wal" -mmin -60 | while read -r wal_file; do
  aws s3 cp "$wal_file" "s3://$S3_BUCKET/postgres/wal/"
  
  # Başarılı yüklemeden sonra yerel dosyayı temizle (isteğe bağlı)
  # rm "$wal_file"
done
```

## Geri Yükleme Prosedürleri

### Tek Tenant Acil Geri Yükleme Kılavuzu

Bu kılavuz, tek bir tenant'ın acil durumda geri yüklenmesi için adım adım talimatları içerir.

#### Ön Koşullar
- Tenant ID
- AWS S3 erişim kimlik bilgileri
- PostgreSQL veritabanı erişimi

#### Geri Yükleme Adımları

1. **Tenant'ın En Son Yedeğini Belirle**

   ```bash
   aws s3 ls s3://maarifportal-backups/postgres/tenants/TENANT_ID/ --recursive | sort | tail -n 5
   ```

2. **Yedek Dosyasını İndir**

   ```bash
   aws s3 cp s3://maarifportal-backups/postgres/tenants/TENANT_ID/tenant_TENANT_ID_YYYYMMDD_HHMMSS.dump /tmp/
   ```

3. **Mevcut Tenant Şemasını Yedekle (İsteğe Bağlı Güvenlik Önlemi)**

   ```bash
   pg_dump -U postgres -F custom -n "tenant_TENANT_ID" -f "/tmp/tenant_TENANT_ID_before_restore.dump" maarifportal_db
   ```

4. **Şemayı Sil ve Yeniden Oluştur**

   ```bash
   psql -U postgres -d maarifportal_db -c "DROP SCHEMA IF EXISTS tenant_TENANT_ID CASCADE;"
   psql -U postgres -d maarifportal_db -c "CREATE SCHEMA tenant_TENANT_ID;"
   ```

5. **Yedeği Geri Yükle**

   ```bash
   pg_restore -U postgres -d maarifportal_db -n tenant_TENANT_ID /tmp/tenant_TENANT_ID_YYYYMMDD_HHMMSS.dump
   ```

6. **Storage Verilerini Geri Yükle**

   ```bash
   # Tenant storage verilerini S3'ten indir
   aws s3 sync s3://maarifportal-backups/storage/tenant-TENANT_ID/YYYYMMDD_HHMMSS/ /tmp/restore-storage/
   
   # Storage verilerini Supabase'e yükle (özel script kullanılır)
   node scripts/restore-storage.js --tenant=TENANT_ID --source=/tmp/restore-storage/
   ```

7. **Doğrulama Kontrolleri Yap**

   ```bash
   # Tablolardaki kayıt sayılarını kontrol et
   psql -U postgres -d maarifportal_db -c "SELECT COUNT(*) FROM tenant_TENANT_ID.users;"
   psql -U postgres -d maarifportal_db -c "SELECT COUNT(*) FROM tenant_TENANT_ID.students;"
   
   # Referans bütünlüğünü kontrol et
   # ...
   ```

8. **Tenant'ı Aktifleştir**

   ```bash
   psql -U postgres -d maarifportal_db -c "UPDATE public.tenants SET is_active = TRUE WHERE id = 'TENANT_ID';"
   ```

## KVKK Uyumluluğu

Maarif Okul Portalı SaaS platformu, Kişisel Verilerin Korunması Kanunu (KVKK) gereksinimlerini karşılamak için yedekleme ve geri yükleme süreçlerinde aşağıdaki önlemleri uygulamaktadır:

1. **Veri Şifreleme**:
   * Tüm yedekler, AES-256 algoritması kullanılarak şifrelenir
   * AWS S3'de sunucu taraflı şifreleme (SSE) kullanılır
   * Geri yükleme sırasında kimlik doğrulama ve yetkilendirme kontrolleri yapılır

2. **Veri Erişim Kontrolü**:
   * Yedekleme ve geri yükleme işlemlerine sadece yetkili personel erişebilir
   * Tüm yedekleme ve geri yükleme işlemleri loglanır
   * IP kısıtlaması ve multi-factor authentication (MFA) uygulanır

3. **Veri Silme**:
   * KVKK kapsamında silme talepleri için özel prosedürler
   * Tenant'ın talebi üzerine kalıcı veri silme ve yedeklerden çıkarma
   * Silme işlemlerinin dokümantasyonu ve belgelenmesi

## İyileştirme ve Yol Haritası

### Faz 1: Temel Yedekleme ve Geri Yükleme (MVP)
* Günlük tam veritabanı yedeklemeleri
* Temel tenant bazlı yedeklemeler
* Manuel geri yükleme prosedürleri
* Basit izleme ve bildirimler

### Faz 2: Gelişmiş Yedekleme Stratejisi (MVP + 3 Ay)
* Zamanlanmış tenant bazlı yedeklemeler
* WAL arşivleme ile point-in-time recovery
* Storage yedeklemeleri
* Gelişmiş izleme ve bildirimler

### Faz 3: Tam Otomatikleştirilmiş Çözüm (MVP + 6 Ay)
* Tam otomatik yedekleme ve doğrulama
* Self-servis tenant veri dışa/içe aktarma
* İleri düzey yedekleme analitiği ve raporlama
* Otomatik test ve doğrulama süreçleri

## İlgili Kaynaklar
* [Multi-Tenant Mimari Stratejisi](/docs/architecture/multi-tenant-strategy.md)
* [Veri İzolasyon Stratejisi](/docs/deployment/data-isolation.md)
* [Felaketten Kurtarma Planlaması](/docs/deployment/disaster-recovery.md)
* [Teknoloji Yığını](/docs/architecture/tech-stack.md)