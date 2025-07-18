# İ-EP.APP - Günlük TODO Takibi İçin Dosya Rehberi

> **Oluşturulma**: 16 Temmuz 2025  
> **Amaç**: Günlük geliştirme workflow'u için dosya takip rehberi  
> **Hedef**: Karışıklık olmadan, net prioritelerle geliştirme yapmak  
> **Güncellenme**: Her sprint değişikliğinde

## 📋 Günlük TODO Takibi İçin Dosya Rehberi

### 🎯 **Günlük Geliştirme Başlangıcı (Her Sabah 09:00)**

#### **1. İlk Okunacak Dosya:**

```
/sprints/CURRENT-SPRINT-STATUS.md
```

- **Neden**: Güncel sprint durumu ve bugünkü görevler
- **Okuma süresi**: 2-3 dakika
- **Ne öğrenirsiniz**: Hangi Phase'deyiz, bugün ne yapacağız

#### **2. İkinci Okunacak Dosya:**

```
/ACTION-PLAN-OPTIMIZATION.md
```

- **Neden**: Acil eylem maddeleri ve immediate tasks
- **Okuma süresi**: 1-2 dakika
- **Ne öğrenirsiniz**: Bugünkü prioriteler ve acil işler

### 🕐 **Öğle Arası Kontrol (12:00)**

#### **Progress Güncellemesi:**

```
/sprints/CURRENT-SPRINT-STATUS.md
```

- **Yapacağınız**: Sabah yaptıklarınızı "✅ Complete" olarak işaretleyin
- **Süre**: 1 dakika
- **Amaç**: İlerleme takibi

### 🌆 **Gün Sonu Değerlendirme (17:30)**

#### **1. Gün Sonu Güncellemesi:**

```
/sprints/CURRENT-SPRINT-STATUS.md
```

- **Yapacağınız**: Günün tüm tamamladıklarını işaretleyin
- **Yarın için**: Planlamayı yapın

#### **2. Haftalık Kontrol (Sadece Cuma):**

```
/docs-site/docs/PROGRESS.md
```

- **Yapacağınız**: Haftalık progress güncellemesi
- **Süre**: 5 dakika

### 📊 **Haftalık Planning (Pazartesi)**

#### **Hafta Başı Rutini:**

1. **`/docs-site/docs/PROGRESS.md`** - Genel ilerleme durumu (5 dakika)
2. **`/FOUNDATION-FIRST-STRATEGY.md`** - Hangi phase'deyiz kontrol (3 dakika)
3. **`/REALISTIC-TIMELINE-2025.md`** - Timeline'a uyum kontrol (2 dakika)

### 🚨 **Acil Durum Referansları**

#### **Sorun Yaşadığınızda:**

```
/SETUP-TODO-LIST.md
```

- **Neden**: Environment setup sorunları
- **Kapsar**: Database, dependencies, config

#### **Stratejik Karar Verirken:**

```
/FOUNDATION-FIRST-STRATEGY.md
```

- **Neden**: Proje stratejisi ve phase hedefleri
- **Kapsar**: Öncelikler, success criteria

### 🎯 **Özetçe - Günlük Minimum 3 Dosya**

#### **Sabah (5 dakika toplam):**

1. `/sprints/CURRENT-SPRINT-STATUS.md` ← **EN ÖNEMLİ**
2. `/ACTION-PLAN-OPTIMIZATION.md` ← **ACİL EYLEMLER**

#### **Akşam (2 dakika):**

1. `/sprints/CURRENT-SPRINT-STATUS.md` ← **GÜNCELLEME**

#### **Haftalık (10 dakika - sadece Pazartesi/Cuma):**

1. `/docs-site/docs/PROGRESS.md` ← **GENEL DURUM**

### 💡 **Pro İpucu**

**En kritik dosya**: `CURRENT-SPRINT-STATUS.md` - Bu tek dosya bile %90 yeterli!

**Neden**: Bu dosya şu anda Phase 6.1'deyiz, Frontend-Backend Integration kritik, ve güncel sprint durumu bilgisini içeriyor.

**Hızlı Start**: Sadece bu dosyayı okuyarak günlük geliştime başlayabilirsiniz. Diğer dosyalar gerektiğinde referans için.

---

## 📅 **Günlük Workflow Örnekleri**

### **Tipik Pazartesi Sabahı:**

1. `/sprints/CURRENT-SPRINT-STATUS.md` oku (3 dk)
2. `/ACTION-PLAN-OPTIMIZATION.md` kontrol et (2 dk)
3. `/docs-site/docs/PROGRESS.md` haftalık duruma bak (5 dk)
4. **Toplam**: 10 dakika - Hafta için hazırsın!

### **Tipik Salı-Perşembe Sabahı:**

1. `/sprints/CURRENT-SPRINT-STATUS.md` oku (3 dk)
2. `/ACTION-PLAN-OPTIMIZATION.md` kontrol et (2 dk)
3. **Toplam**: 5 dakika - Günlük geliştirme için hazırsın!

### **Tipik Cuma Akşamı:**

1. `/sprints/CURRENT-SPRINT-STATUS.md` güncelle (2 dk)
2. `/docs-site/docs/PROGRESS.md` haftalık progress güncelle (5 dk)
3. **Toplam**: 7 dakika - Hafta tamamlandı!

---

## 🔄 **Workflow Optimizasyonu**

### **Zaman Tasarrufu İpuçları:**

#### **Sabah (5 dakika max):**

- Sadece "## 🎯 Current Sprint Overview" bölümünü oku
- "### 📋 Today's Priority Tasks" listesine bak
- Acil işler varsa `ACTION-PLAN-OPTIMIZATION.md` kontrol et

#### **Öğle (1 dakika max):**

- Sadece bugünkü task'ları ✅ veya ⏳ olarak işaretle
- Yeni blocker varsa not et

#### **Akşam (2 dakika max):**

- Günün tüm task'larını ✅ Complete yap
- Yarın için 1-2 priority task belirle

### **Karışıklık Önleme:**

#### **Yapmayın:**

- ❌ Birden fazla dosyayı aynı anda güncelleme
- ❌ Eski arşiv dosyalarını okuma
- ❌ 5 dakikadan fazla planning yapma

#### **Yapın:**

- ✅ Her zaman `/sprints/CURRENT-SPRINT-STATUS.md` ile başlayın
- ✅ Günde en fazla 2 ana dosya okuyun
- ✅ Hızlı, odaklanmış güncellemeler yapın

---

## 🎯 **Kritik Hatırlatmalar**

### **Şu Anda (Phase 6.1 - ACTIVE):**

- **Ana Odak**: Frontend-Backend Integration + Mock Data Replacement
- **Kritik Dosya**: `/sprints/CURRENT-SPRINT-STATUS.md`
- **Günlük Rutini**: 5 dakika sabah + 2 dakika akşam
- **Sprint Süresi**: 18-25 Temmuz 2025 (7 gün)
- **Progress**: 72% → 78% hedef

### **Gelecek Phase'lerde:**

- Phase 6.2: API Integration Testing
- Phase 7: Production Deployment
- Phase 8: Advanced Features

### **Sistem Değişiklikleri:**

- Her phase değişikliğinde bu dosya güncellenecek
- Dosya öncelikleri sprint'e göre değişebilir
- Workflow süreleri deneyimle optimize edilecek

---

## 📊 **Başarı Metrikleri**

### **Günlük Başarı:**

- [ ] 5 dakikada günlük planning tamamlandı
- [ ] Tüm priority task'lar belirlendi
- [ ] Gün sonu güncellemesi yapıldı

### **Haftalık Başarı:**

- [ ] Sprint progress güncellendi
- [ ] Haftalık hedefler belirlendi
- [ ] Öncelikler netleştirildi

### **Sistem Başarısı:**

- [ ] Karışıklık yaşanmadı
- [ ] Dosya arama süresi azaldı
- [ ] Geliştirme hızı arttı

---

**Dosya Sahibi**: Development Team  
**Son Güncelleme**: 18 Temmuz 2025  
**Sonraki Güncelleme**: Phase 6.2 başlangıcında  
**Durum**: Aktif Kullanımda  
**Öncelik**: Yüksek (Günlük kullanım için kritik)

> 🚀 **Başarı Notu**: Bu rehberle artık her gün net olarak ne yapacağınızı bilecek, karışıklık yaşamadan odaklanmış geliştirme yapabileceksiniz!
