# Iqra Eğitim Portalı Backend İyileştirme Planı

Bu doküman, Iqra Eğitim Portalı projesinin backend yapısını ADR dokümanlarıyla tam uyumlu hale getirmek için sistematik bir yaklaşım sunmaktadır. Her bir aşama ve görev, tamamlandıkça işaretlenecektir.

## PROGRESS.md ile İlişki

Bu backend iyileştirme planı, projenin ana ilerleme belgesinde (PROGRESS.md) yer alan görevlerle doğrudan ilişkilidir. Aşağıda, backend iyileştirme planındaki aşamaların PROGRESS.md'deki hangi bölümlerle eşleştiğini görebilirsiniz:

| Backend İyileştirme Planı | PROGRESS.md İlgili Bölümler |
|---------------------------|------------------------------|
| Aşama 1: Temel Backend Yapılandırması | 2.1 Kimlik Doğrulama ve Güvenlik, 1.4 Veritabanı ve Çok Kiracılı Backend |
| Aşama 2: Performans ve İzleme | 5.4 Performans Optimizasyonu ve Ölçeklendirme, Teknik Borçlar ve İyileştirmeler |
| Aşama 3: Domain ve SSL Yönetimi | 2.2 Domain Yönetimi ve Kurumsal Doğrulama |
| Aşama 4: API ve Realtime Entegrasyonu | 5.1 API ve Entegrasyon Katmanı, 6.3 Gerçek Zamanlı İşbirliği |
| Aşama 5: Super Admin Paneli Geliştirme | 2.7 Super Admin Paneli Geliştirme |
| Aşama 6: Entegrasyon ve Test | 6.1 Kalite ve Güvenlik, 3.4 Güvenlik Denetimi ve Performans |

Her iyileştirme aşaması tamamlandığında, PROGRESS.md dosyasındaki ilgili öğeler güncellenmelidir. Bu doğrultuda, her aşamanın başında ilgili PROGRESS.md bölümleri belirtilmiştir.

## Aşama 1: Temel Backend Yapılandırması (1-2 Hafta)
> *İlgili PROGRESS.md bölümleri: 2.1 Kimlik Doğrulama ve Güvenlik, 1.4 Veritabanı ve Çok Kiracılı Backend*

### 1.1 RLS Politikaları Genişletilmesi ✅

- [x] Tenant şemaları için RLS politikaları standardizasyonu
- [x] Temel rol tabanlı erişim kontrollerinin tanımlanması
  - [x] Super Admin erişim kontrolü
  - [x] Tenant Admin erişim kontrolü
  - [x] Öğretmen erişim kontrolü
  - [x] Öğrenci erişim kontrolü
  - [x] Veli erişim kontrolü
- [x] Tenant'lar arası erişim engellerinin oluşturulması
- [x] Özel durum kontrolleri için fonksiyonların geliştirilmesi
  - [x] Öğretmenlerin sadece kendi sınıflarına erişimi
  - [x] Öğrencilerin sadece kendi notlarına erişimi
  - [x] Velilerin sadece kendi çocuklarının verilerine erişimi
- [x] RLS politikaları için denetim mekanizması oluşturulması
- [x] Kapsamlı güvenlik test senaryolarının oluşturulması

### 1.2 Tenant-Aware Kimlik Doğrulama

- [ ] Supabase Auth entegrasyonunun tenant sistemine uyarlanması
- [ ] Tenant belirleme mekanizmasının oluşturulması
- [ ] Multi-tenant oturum yönetiminin geliştirilmesi
- [ ] Kullanıcı davet sistemi oluşturulması

### 1.3 API Endpoint Yapılandırması

- [ ] RESTful API endpoint'lerinin tanımlanması
- [ ] RLS politikalarına uygun API erişim kontrollerinin yapılandırılması
- [ ] API belgelendirme sistemi kurulumu
- [ ] API sürüm yönetiminin planlanması

## Aşama 2: Performans ve İzleme (1-2 Hafta)
> *İlgili PROGRESS.md bölümleri: 5.4 Performans Optimizasyonu ve Ölçeklendirme, Teknik Borçlar ve İyileştirmeler*

### 2.1 Veritabanı Performans İyileştirmeleri
- [ ] Sık kullanılan sorgular için indeks oluşturma
- [ ] Compound indeksleme stratejisi belirleme
- [ ] PostgreSQL EXPLAIN ANALYZE ile sorgu planlarını inceleme
- [ ] Kritik sorgular için Materialized View'lar oluşturma
- [ ] Partition stratejisi değerlendirme (büyük tablalar için)
- [ ] Query optimizasyonu ve n+1 sorgu problemlerini çözme

### 2.2 Caching Sistemi Yapılandırması
- [ ] Tenant-specific önbellekleme stratejisi belirleme
- [ ] Sık erişilen verilerin önbelleklemesini yapılandırma
- [ ] Önbellek invalidasyon mekanizmaları oluşturma
- [ ] Redis key yapısını tenant/rol bazlı standartlaştırma
- [ ] Redis performans metrikleri izleme
- [ ] Cache hit/miss oranları izleme ve raporlama

### 2.3 İzleme ve Loglama
- [ ] SQL performans metrikleri toplama
- [ ] RLS politikaları için denetim loglama sistemi
- [ ] Tenant erişim loglarını yapılandırma
- [ ] Hata loglarını yapılandırma ve izleme
- [ ] Super Admin paneli için izleme API'lerini oluşturma
- [ ] Kritik olayları izleme ve bildirim mekanizmaları

## Aşama 3: Domain ve SSL Yönetimi (1 Hafta)
> *İlgili PROGRESS.md bölümü: 2.2 Domain Yönetimi ve Kurumsal Doğrulama*

### 3.1 Domain Yönetim Otomasyonu
- [ ] Cloudflare API entegrasyonunu genişletme
- [ ] Domain doğrulama sürecini otomatikleştirme (DNS/CNAME/TXT)
- [ ] Özel domain durumu izleme sistemi geliştirme
- [ ] Domain değişikliklerini loglama ve izleme
- [ ] Domain yönetimi için web hook'ları yapılandırma
- [ ] Domain eklemek için self-servis akışı oluşturma

### 3.2 SSL Sertifika Yönetimi
- [ ] Cloudflare SSL sertifika API entegrasyonu
- [ ] Sertifika süresi izleme ve otomatik yenileme
- [ ] Sertifika durumu izleme ve raporlama
- [ ] Hata durumlarını yönetme ve bildirme mekanizmaları
- [ ] Alternatif SSL sağlayıcılarına geçiş senaryoları planlama
- [ ] Wildcard sertifika yönetimi

## Aşama 4: API ve Realtime Entegrasyonu (1-2 Hafta)
> *İlgili PROGRESS.md bölümleri: 5.1 API ve Entegrasyon Katmanı, 6.3 Gerçek Zamanlı İşbirliği*

### 4.1 Edge Functions Yapılandırması
- [ ] Temel Edge Function şablonları oluşturma
- [ ] Tenant-specific işlemler için fonksiyonlar geliştirme
- [ ] Webhook işlemleri için fonksiyonlar oluşturma
- [ ] Zamanlı görevler için fonksiyonlar yapılandırma
- [ ] Edge Functions için hata işleme ve loglama mekanizmaları
- [ ] Function test ve deployment süreçlerini otomatikleştirme

### 4.2 Realtime API Konfigürasyonu
- [ ] Realtime kanallarını tenant bazlı izole etme
- [ ] RLS politikalarını Realtime erişimi için güncelleme
- [ ] Broadcast optimizasyonları yapma
- [ ] Realtime bağlantı limitleri ve ölçeklendirme stratejisi belirleme
- [ ] Presence API ile kullanıcı çevrimiçi durumu izleme
- [ ] Mesajlaşma ve bildirim sistemleri için Realtime yapılandırması

## Aşama 5: Super Admin Paneli Geliştirme (2 Hafta)
> *İlgili PROGRESS.md bölümü: 2.7 Super Admin Paneli Geliştirme*

### 5.1 Super Admin Veri Yapısı
- [ ] Sistem metrikleri için tablolar oluşturma
- [ ] Denetim logları (audit logs) yapısı kurma
- [ ] Webhook yönetimi için tablolar oluşturma
- [ ] Yedekleme ve izleme için veri yapısı eklemeleri
- [ ] Kullanım ve performans metrikleri tabloları
- [ ] Tenant health izleme ve skorlama sistemi

### 5.2 Super Admin API'leri
- [ ] Tenant yönetimi için kapsamlı API'ler
- [ ] Sistem sağlığı izleme ve raporlama API'leri
- [ ] Kullanıcı yönetimi ve rolleri için API'ler
- [ ] Domain ve SSL yönetimi için API'ler
- [ ] Toplu işlemler için batch API'ler
- [ ] Admin operasyonları için güvenlik kontrollerini güçlendirme

## Aşama 6: Entegrasyon ve Test (2 Hafta)
> *İlgili PROGRESS.md bölümleri: 6.1 Kalite ve Güvenlik, 3.4 Güvenlik Denetimi ve Performans*

### 6.1 Backend-Frontend Entegrasyonu
- [ ] Frontend ile API kontratlarını güncelleme
- [ ] TypeScript tip tanımlarını güncelleme
- [ ] API istek/yanıt formatlarını standartlaştırma
- [ ] Frontend'in tenant-aware yapılarla entegrasyonu
- [ ] Error handling stratejilerini güncelleme
- [ ] Client-side ve server-side validasyon senkronizasyonu (Zod)

### 6.2 Kapsamlı Test
- [ ] RLS politikaları ve güvenlik testleri
- [ ] Performans testleri ve sorgu optimizasyonu
- [ ] Domain yönetimi ve SSL entegrasyonu testleri
- [ ] Çoklu tenant senaryoları ve izolasyon testleri
- [ ] Yük testleri ve ölçeklendirme kontrolü
- [ ] Otomatize end-to-end test senaryoları

## İş Planı ve Öncelikler

Bu iyileştirme planı, PROGRESS.md'de belirtilen hedeflere ulaşmak için aşağıdaki zaman çizelgesini takip edecektir:

### İlk Hafta:
1. [ ] RLS politikaları revizyonu ve tenant-aware kimlik doğrulama
2. [ ] Veritabanı şema optimizasyonu ve indeksleme
3. [ ] Tenant-specific Redis caching yapılandırması

### İkinci Hafta:
4. [ ] Domain yönetimi otomasyonu ve SSL sertifika sistemi
5. [ ] Super Admin veri yapısı ve temel API'ler
6. [ ] Temel izleme ve loglama sistemleri

### Üçüncü Hafta:
7. [ ] Edge Functions geliştirilmesi
8. [ ] Realtime API yapılandırması
9. [ ] Frontend entegrasyonunun ilk aşaması

### Dördüncü Hafta:
10. [ ] Kapsamlı test ve hata düzeltme
11. [ ] Eksik süreçlerin tamamlanması
12. [ ] Dokümantasyon ve bilgi transferi

## Devam Eden İzleme ve İyileştirme

- [ ] Periyodik güvenlik taramaları ve güncellemeleri
- [ ] Performans metrikleri izleme ve optimizasyon
- [ ] Tenant bazlı kullanım metrikleri ve analizleri
- [ ] Düzenli veritabanı bakımı ve indeks yeniden oluşturma
- [ ] Redis önbellek performansı ve optimizasyonu
- [ ] Gerçek kullanım verilerine dayalı ölçeklendirme ayarlamaları

## PROGRESS.md Güncellemesi

Bu iyileştirme planındaki her bir aşama tamamlandığında, PROGRESS.md dosyasında ilgili maddelerin durumu güncellenmelidir. Bu süreç şu şekilde yürütülecektir:

1. Aşama tamamlandığında, ilgili PROGRESS.md maddelerini `[ ]` → `[x]` olarak güncelle
2. Yeni eklenen özellikleri PROGRESS.md'ye ekle
3. İlerleme raporunu proje ekibiyle paylaş

Bu yaklaşım, geliştirme sürecinin şeffaflığını sağlayacak ve projenin genel durumunu daha net bir şekilde takip etmemize yardımcı olacaktır. 