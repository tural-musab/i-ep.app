# Iqra Eğitim Portalı Supabase Kurulum Talimatları

Bu belge, Iqra Eğitim Portalı'nın Supabase kurulumunu adım adım açıklamaktadır.

## 1. Supabase Hesabı Oluşturma

1. [Supabase](https://supabase.com/) sitesine gidin ve bir hesap oluşturun
2. Hesabınızı doğrulayın ve giriş yapın

## 2. Yeni Proje Oluşturma

1. "New Project" butonuna tıklayın
2. Proje için aşağıdaki bilgileri girin:
   - **Name**: `iqra-egitim-portali` (veya istediğiniz başka bir isim)
   - **Database Password**: Güçlü bir şifre oluşturun ve güvenli bir yerde saklayın
   - **Region**: `West Europe (Frankfurt)` (veya size en yakın bölge)
   - **Pricing Plan**: Başlangıç için "Free Tier" seçilebilir
3. "Create new project" butonuna tıklayın ve projenin oluşturulmasını bekleyin

## 3. SQL Dosyalarını Uygulama

Supabase projeniz oluşturulduktan sonra, veritabanı yapısını kurmak için iki yöntem kullanabilirsiniz:

### A. Supabase Studio ile Kurulum

1. Sol menüden "SQL Editor" sekmesine tıklayın
2. "New Query" butonuna tıklayın
3. `sql/setup.sql` dosyasının içeriğini kopyalayıp SQL editörüne yapıştırın
4. "Run" butonuna tıklayarak scripti çalıştırın

### B. Komut Satırı (CLI) ile Kurulum

1. Supabase CLI'yi yükleyin (henüz yüklemediyseniz):
   ```bash
   npm install -g supabase
   ```

2. Supabase CLI'yi kullanarak oturum açın:
   ```bash
   supabase login
   ```

3. Proje dizinine gidin:
   ```bash
   cd /path/to/i-ep.app
   ```

4. SQL dosyalarını Supabase projenize uygulayın:
   ```bash
   # Supabase'den proje URL'nizi ve anahtarınızı alın
   supabase db execute --file ./sql/setup.sql
   ```

## 4. Supabase Kimlik Doğrulama Ayarları

1. Sol menüden "Authentication" sekmesine tıklayın
2. "Settings" alt menüsüne tıklayın
3. "Email Auth" bölümünde aşağıdaki ayarları yapın:
   - "Enable Email Signup" seçeneğini aktif edin
   - "Enable Email Confirmations" seçeneğini aktif edin
   - Diğer kimlik doğrulama seçeneklerini ihtiyacınıza göre yapılandırın

4. "URL Configuration" bölümünde:
   - **Site URL**: `https://i-ep.app` (veya geliştirme ortamı için `http://localhost:3000`)
   - **Redirect URLs**: 
     - `https://i-ep.app/auth/callback`
     - `https://*.i-ep.app/auth/callback`
     - `http://localhost:3000/auth/callback` (geliştirme için)

## 5. Storage Buckets Oluşturma

1. Sol menüden "Storage" sekmesine tıklayın
2. "New Bucket" butonuna tıklayın
3. Aşağıdaki bucket'ları oluşturun:
   - `avatars` - Kullanıcı profil resimleri için
   - `school-logos` - Okul logoları için
   - `assignments` - Ödev dosyaları için
   - `submissions` - Ödev teslim dosyaları için
   - `public` - Genel dosyalar için

4. Her bucket için gerekli RLS politikalarını ayarlayın:
   ```sql
   -- Örnek: avatars bucket politikası
   CREATE POLICY "Herkes kendi avatar'ını yükleyebilir"
   ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (
     bucket_id = 'avatars' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   
   CREATE POLICY "Herkes kendi avatar'ını güncelleyebilir"
   ON storage.objects
   FOR UPDATE TO authenticated
   USING (
     bucket_id = 'avatars' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   
   CREATE POLICY "Avatarlar herkese görünür"
   ON storage.objects
   FOR SELECT TO authenticated
   USING (bucket_id = 'avatars');
   ```

## 6. Edge Functions Kurulumu (Opsiyonel)

İleri seviye özellikler için Edge Functions kullanılabilir:

1. Sol menüden "Edge Functions" sekmesine tıklayın
2. "New Function" butonuna tıklayın
3. İhtiyaç duyulan fonksiyonları ekleyin, örneğin:
   - `generate-tenant-schema` - Yeni tenant oluşturma
   - `process-webhook` - Webhook isteklerini işleme
   - `send-notifications` - Bildirim gönderme

## 7. Ortam Değişkenlerini Yapılandırma

1. Proje ayarlarından "API" sekmesine tıklayın 
2. `SUPABASE_URL` ve `SUPABASE_ANON_KEY` değerlerini kopyalayın
3. Projenizin `.env.local` dosyasını aşağıdaki gibi düzenleyin:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 8. Güvenlik Kontrolleri

1. RLS politikalarının düzgün çalıştığından emin olun
2. Üretim ortamında tüm şifreleri değiştirin
3. "SQL Editor" kullanarak bazı basit sorgular çalıştırarak tenant izolasyonunu test edin

## 9. Demo Tenant Kontrolleri

1. `management.tenants` tablosunda demo tenant'ın doğru şekilde oluşturulduğunu kontrol edin
2. Demo tenant şemasının ve tablolarının oluşturulduğunu doğrulayın
3. Demo tenant kullanıcılarının oluşturulduğunu ve erişim yetkilerinin doğru ayarlandığını kontrol edin

## Sorun Giderme

- **Hata**: "Relation does not exist" 
  **Çözüm**: SQL dosyalarını sırasıyla tekrar çalıştırın, şemaların önce oluşturulduğundan emin olun

- **Hata**: "Permission denied" 
  **Çözüm**: RLS politikalarını kontrol edin, doğru kullanıcı rolü ve tenant erişimi sağlandığından emin olun

- **Hata**: "Function not found" 
  **Çözüm**: Uzantıların doğru yüklendiğini kontrol edin, gerekirse `02_extensions.sql` dosyasını tekrar çalıştırın

## İleri Seviye Yapılandırma

- **Veritabanı Yedekleme**: Supabase projenizi düzenli olarak yedekleyin
- **Webhook Entegrasyonları**: Ödeme sistemleri, bildirim servisleri vb. için webhook'ları yapılandırın
- **SMTP Ayarları**: E-posta bildirimleri için SMTP sunucusu yapılandırın
- **Redis Entegrasyonu**: Performans optimizasyonu için Redis önbellek yapılandırmasını tamamlayın

---

Bu kurulum talimatlarını takip ederek Iqra Eğitim Portalı'nın Supabase backend altyapısını başarıyla kurmuş olacaksınız. Sorunlarla karşılaşırsanız veya daha fazla yardıma ihtiyacınız olursa, geliştirici ekibine başvurun. 