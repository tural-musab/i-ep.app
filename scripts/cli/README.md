# İ-EP.APP CLI Aracı

Bu CLI aracı, İ-EP.APP platformu için tenant yönetimi ve veritabanı işlemlerini kolaylaştırmak amacıyla geliştirilmiştir.

## Kurulum

```bash
# CLI aracını global olarak yükle
cd scripts/cli
npm install -g .

# veya yerel olarak çalıştır
cd scripts/cli
npm install
```

## Kullanım

### Tenant Yönetimi

```bash
# Yeni tenant oluştur
i-ep tenant:create

# Tenant'ları listele
i-ep tenant:list
i-ep tenant:list --status active
i-ep tenant:list --limit 20

# Tenant detaylarını görüntüle
i-ep tenant:get <tenant-id>

# Tenant güncelle
i-ep tenant:update <tenant-id>

# Tenant sil
i-ep tenant:delete <tenant-id>
```

### Veritabanı İşlemleri

```bash
# Tenant için veritabanı şeması oluştur
i-ep db:schema-generate <tenant-id>

# Veritabanı bağlantısını test et
i-ep db:test-connection
```

## Örnekler

### Yeni Tenant Oluşturma

```bash
i-ep tenant:create
```

Bu komut, size aşağıdaki bilgileri soracak:
- Tenant adı
- Subdomain
- Admin e-posta adresi
- Abonelik planı

### Tenant Listeleme ve Filtreleme

```bash
# Tüm tenant'ları listele
i-ep tenant:list

# Sadece aktif tenant'ları listele
i-ep tenant:list --status active

# 20 tenant'ı listele
i-ep tenant:list --limit 20
```

### Tenant Detaylarını Görüntüleme

```bash
i-ep tenant:get 123e4567-e89b-12d3-a456-426614174999
```

Bu komut, tenant'ın aşağıdaki bilgilerini gösterecek:
- Temel bilgiler (ID, ad, subdomain, vb.)
- Durum ve abonelik planı
- Özellikler
- Tema ayarları
- İstatistikler (kullanıcı, öğrenci, sınıf sayıları)

### Tenant Güncelleme

```bash
i-ep tenant:update 123e4567-e89b-12d3-a456-426614174999
```

Bu komut, tenant'ın mevcut değerlerini göstererek güncellemenize olanak tanır:
- Tenant adı
- Durum (aktif, pasif, deneme)
- Abonelik planı
- Ana renk ve ikincil renk
- Etkin özellikler

### Tenant Silme

```bash
i-ep tenant:delete 123e4567-e89b-12d3-a456-426614174999
```

Bu komut, tenant'ı silmeden önce onay ister. Onaylandığında, tenant ve ilişkili tüm verileri kalıcı olarak silinir.

### Veritabanı Şeması Oluşturma

```bash
i-ep db:schema-generate 123e4567-e89b-12d3-a456-426614174999
```

Bu komut, belirtilen tenant için PostgreSQL şeması ve temel tabloları oluşturur:
- Kullanıcılar tablosu
- Öğrenciler tablosu
- Sınıflar tablosu
- Öğretmenler tablosu
- Yoklama tablosu
- Notlar tablosu

Ayrıca tenant izolasyonu için RLS (Row Level Security) politikalarını da yapılandırır.

## Sorun Giderme

### Hata: Supabase ortam değişkenleri ayarlanmamış

```
Hata: Supabase ortam değişkenleri ayarlanmamış. .env.local dosyasını kontrol edin.
```

Çözüm: `.env.local` dosyasında aşağıdaki değişkenlerin doğru şekilde ayarlandığından emin olun:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

### Hata: Tenant bulunamadı

```
Hata: ID'si "123..." olan tenant bulunamadı
```

Çözüm: Doğru tenant ID'sini kullandığınızdan emin olun. Tüm tenant'ları listelemek için `i-ep tenant:list` komutunu kullanabilirsiniz.

## Katkıda Bulunma

1. Bu repo'yu fork edin
2. Yeni bir özellik dalı oluşturun: `git checkout -b my-new-feature`
3. Değişikliklerinizi commit edin: `git commit -am 'Add some feature'`
4. Dalınızı uzak sunucuya gönderin: `git push origin my-new-feature`
5. Pull Request açın 