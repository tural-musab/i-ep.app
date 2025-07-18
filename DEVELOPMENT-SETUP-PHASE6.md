# İ-EP.APP Local Development Setup - Phase 6

## 🚀 Quick Start

Bu dokümantasyon Phase 6 (Frontend-Backend Integration) için local development ortamının kurulumunu açıklar.

## 📋 Kurulum Adımları

### 1. Docker Environment'ı Başlatın

```bash
# Mevcut container'ları durdurun ve temizleyin
docker-compose down -v

# Yeni container'ları başlatın
docker-compose up -d

# Supabase local kullanıyorsanız
docker-compose --profile supabase up -d
```

### 2. Migration'ları Çalıştırın

```bash
# Supabase migration'larını çalıştırın
npm run supabase:migrate

# Veya manuel olarak
npx supabase db push
```

### 3. Demo Kullanıcıları Oluşturun

```bash
# Demo kullanıcıları oluştur
node scripts/create-demo-users.js
```

### 4. Development Server'ı Başlatın

```bash
# Development server
npm run dev
```

## 🔐 Demo Hesaplar

Tüm hesaplar için şifre: **demo123**

| Rol      | Email                 | Açıklama             |
| -------- | --------------------- | -------------------- |
| Admin    | <admin@demo.local>    | Yönetici hesabı      |
| Öğretmen | <teacher1@demo.local> | Matematik öğretmeni  |
| Öğretmen | <teacher2@demo.local> | Türkçe öğretmeni     |
| Öğrenci  | <student1@demo.local> | 5-A sınıfı öğrencisi |
| Veli     | <parent1@demo.local>  | Ahmet'in velisi      |

## 🎯 Quick Login Özelliği

Login sayfasında (<http://localhost:3000/auth/giris>) development modunda "Hızlı Giriş" butonları görünecektir:

- **Admin**: Tüm sisteme erişim
- **Öğretmen**: Ödev, yoklama, not girişi
- **Öğrenci**: Ödev görüntüleme, not takibi
- **Veli**: Çocuk takibi, mesajlaşma

## 📊 Demo Data İçeriği

### Okul Bilgileri

- **Tenant ID**: localhost-tenant
- **Okul Adı**: Demo İlköğretim Okulu
- **Domain**: localhost:3000

### Sınıflar

- 5-A Sınıfı (5 öğrenci)
- 5-B Sınıfı (5 öğrenci)
- 6-A Sınıfı
- 6-B Sınıfı

### Dersler

- Matematik
- Türkçe
- Fen Bilgisi
- Sosyal Bilgiler
- İngilizce

### Ödevler

- 5 adet aktif ödev
- Farklı derslere dağıtılmış
- 3-7 gün arası teslim süreleri

### Yoklama Kayıtları

- Son 5 günlük yoklama verisi
- %85 devam, %10 geç kalma, %5 devamsızlık oranı

### Notlar

- Her öğrenci için rastgele notlar (70-100 arası)
- 1. dönem not bilgileri
- Harf notları (AA-FF sistemi)

### Veli Mesajları

- 3 örnek mesaj
- Farklı öncelik seviyeleri

## 🛠️ Troubleshooting

### Problem: Login olmuyor

**Çözüm**:

1. Demo kullanıcıların oluşturulduğundan emin olun: `node scripts/create-demo-users.js`
2. Supabase service key'in .env.local'de tanımlı olduğundan emin olun

### Problem: Tenant bulunamadı hatası

**Çözüm**:

1. Migration'ların çalıştığından emin olun
2. seed.sql dosyasının import edildiğini kontrol edin

### Problem: API'ler 401 veriyor

**Çözüm**:

1. Middleware'de tenant ID'nin 'localhost-tenant' olduğunu kontrol edin
2. NextAuth configuration'ı kontrol edin

## 📝 Notlar

- Bu setup sadece development içindir
- Production'da gerçek authentication kullanılmalıdır
- Demo data her Docker restart'ta sıfırlanır (volume temizlenirse)

## 🔄 Güncellemeler

### Phase 6 Değişiklikleri

1. ✅ Demo data seed sistemi eklendi
2. ✅ Quick login butonları eklendi
3. ✅ Middleware tenant ID güncellendi
4. ✅ Docker compose seed volume eklendi

### Sonraki Adımlar

1. Frontend component'lerini API'lere bağlama
2. Mock data'ları kaldırma
3. E2E test senaryoları yazma
