# 🔍 Evidence-Based Validation System - Günlük Kullanım Rehberi

> **Amaç**: Proje dosyalarında "tamamlandı" yazanların gerçekten tamamlanıp tamamlanmadığını kanıtlarla doğrulamak
> **Sistem**: Evidence-based validation ile %100 doğruluk kontrolü

## 🎯 Sistem Özeti

**Problem Çözümü:**

- ❌ **Eskiden**: PROGRESS.md'de "Assignment %100 tamamlandı" yazıyordu ama gerçekte eksikler vardı
- ✅ **Şimdi**: Konkret kanıtlarla (dosyalar, testler, API'ler) doğrulama yapılıyor

**Sonuç:** Evidence validator sistemi 5 kritik sistemin hiçbirinin tam tamamlanmadığını ortaya çıkardı!

## 📊 Son Validation Sonuçları

| Sistem             | İddia Edilen       | Gerçek Kanıt | Durum       |
| ------------------ | ------------------ | ------------ | ----------- |
| Assignment System  | ✅ %100 Tamamlandı | 🟠 %60 Kanıt | ❌ YETERSİZ |
| Attendance System  | ✅ %100 Tamamlandı | 🟠 %60 Kanıt | ❌ YETERSİZ |
| Grade System       | ✅ %100 Tamamlandı | 🔴 %45 Kanıt | ❌ YETERSİZ |
| Authentication     | ✅ %100 Tamamlandı | 🔴 %30 Kanıt | ❌ YETERSİZ |
| API Infrastructure | ✅ %100 Tamamlandı | 🔴 %30 Kanıt | ❌ YETERSİZ |

**Eşik Değer: %85** | **Mevcut Durum: 0/5 sistem doğrulandı**

## 🔄 Günlük Workflow

### **📅 Sabah Rutini (09:00) - 1 Dakika**

```bash
# Terminal'de çalıştır:
cd /path/to/i-ep.app
node scripts/tracking/sync-sources.js
```

**Bu komut:**

- ✅ Tüm tracking dosyalarını okur (PROGRESS.md, TODO.md, etc.)
- ✅ Evidence validation çalıştırır (kanıt toplama)
- ✅ Sonuçları unified-tracking.yaml'a kaydeder
- ✅ Özet rapor verir

**Beklenen Çıktı:**

```
🔄 Starting Unified Tracking Sync...
📊 Syncing traditional metrics...
🔍 Running evidence validation...
📊 Summary: 0/5 tasks verified
✅ Unified tracking sync completed!
```

### **📈 Dashboard Görüntüleme**

```bash
# Dashboard oluştur:
node scripts/tracking/generate-dashboard.js

# Dashboard'u görüntüle:
cat tracking/UNIFIED-DASHBOARD.md
```

**Ya da VS Code'da aç:**

- `tracking/UNIFIED-DASHBOARD.md` dosyasını aç
- Güncel evidence sonuçlarını gör

### **🕐 Akşam Güncellemesi (17:00) - 30 Saniye**

```bash
# Hızlı durum kontrolü:
node scripts/tracking/sync-sources.js
```

**Amacı:** Gün içinde yapılan değişikliklerin evidence score'larına etkisini görmek

## 🎨 Dashboard Örneği

```markdown
## 🔍 Evidence-Based Validation

| Task              | Claimed     | Evidence Score | Status    | Critical Issues |
| ----------------- | ----------- | -------------- | --------- | --------------- |
| Assignment System | ✅ Complete | 🟠 60%         | ❌ FAILED | 🔴 Found        |
| Attendance System | ✅ Complete | 🟠 60%         | ❌ FAILED | 🔴 Found        |
| Grade System      | ✅ Complete | 🔴 45%         | ❌ FAILED | 🔴 Found        |

### 🚨 Evidence Action Items

- **assignment_system_complete**: Score 60% - Needs evidence improvement
- **attendance_system_complete**: Score 60% - Needs evidence improvement
- **grade_system_complete**: Score 45% - Needs evidence improvement
```

## 🔍 Validation Detayları

### **Evidence Validator Türleri**

1. **file_exists**: Migration dosyaları var mı?
2. **api_endpoint**: API route dosyaları mevcut mu?
3. **test_suite**: Unit testler geçiyor mu?
4. **component_exists**: Frontend componentler var mı?
5. **auth_config**: Authentication config dosyaları mevcut mu?
6. **demo_users**: Demo kullanıcı scriptleri var mı?
7. **api_count**: Minimum API endpoint sayısı karşılanıyor mu?
8. **calculation_engine**: Grade hesaplama dosyaları var mı?
9. **turkish_grading**: Türk eğitim sistemi desteği var mı?

### **Puanlama Sistemi**

- **%85-100**: ✅ VERIFIED (Doğrulandı)
- **%70-84**: ⚠️ PARTIAL (Kısmi)
- **%50-69**: 🟠 INSUFFICIENT (Yetersiz)
- **%0-49**: 🔴 FAILED (Başarısız)

## 🚀 Otomatik Çalıştırma (GitHub Actions)

### **Otomatik Schedule**

- **Sabah 09:00**: Otomatik sync çalışır
- **Akşam 17:00**: Otomatik sync çalışır
- **Her değişiklik**: tracking dosyaları değiştiğinde otomatik çalışır

### **Manuel Tetikleme**

- GitHub'da Actions sekmesine git
- "Unified Tracking Sync" workflow'unu seç
- "Run workflow" butonuna bas

## 🎯 Haftalık Review Rutini

### **Pazartesi Sabahı (10 Dakika)**

```bash
# Detaylı evidence raporu:
node scripts/tracking/evidence-validator.js

# Full dashboard:
node scripts/tracking/generate-dashboard.js
```

**Review Soruları:**

1. Hangi sistemlerin evidence score'u arttı?
2. Hangi validatorlar hala başarısız?
3. Bu hafta hangi kanıtları tamamlamalıyım?

### **Cuma Akşamı (5 Dakika)**

```bash
# Haftalık progress kontrolü:
node scripts/tracking/sync-sources.js
cat tracking/UNIFIED-DASHBOARD.md
```

## 📝 Özel Kullanım Senaryoları

### **Scenario 1: Yeni Feature Tamamladım**

```bash
# Evidence durumunu kontrol et:
node scripts/tracking/sync-sources.js

# Hangi validatorlar hala başarısız?
# tracking/UNIFIED-DASHBOARD.md'yi incele
```

### **Scenario 2: Client'a Demo Öncesi**

```bash
# Tam durum raporu:
node scripts/tracking/evidence-validator.js

# Professional dashboard:
node scripts/tracking/generate-dashboard.js
```

### **Scenario 3: Development Planning**

```bash
# Mevcut evidence gaps:
cat tracking/UNIFIED-DASHBOARD.md

# Hangi validator türlerini önceliklendirmeliyim?
# Evidence Action Items bölümünü incele
```

## 🔧 Troubleshooting

### **Yaygın Hatalar**

1. **"ENOENT: no such file or directory"**

   ```bash
   # Çözüm: Doğru dizinde olduğunu kontrol et
   pwd  # /path/to/i-ep.app olmalı
   ```

2. **"Evidence validation failed"**

   ```bash
   # Normal - sistemin eksikleri tespit etmesi beklenen davranış
   # Dashboard'da detayları incele
   ```

3. **"js-yaml not found"**

   ```bash
   npm install js-yaml --save-dev
   ```

## 🎉 Başarı Kriterleri

### **Günlük Başarı**

- [ ] Sabah sync çalıştırıldı
- [ ] Dashboard kontrol edildi
- [ ] Evidence gaps belirlendi

### **Haftalık Başarı**

- [ ] En az 1 sistemin evidence score'u arttı
- [ ] Critical validatorlar tamamlandı
- [ ] Overall health iyileşti

### **Proje Başarısı**

- [ ] 5/5 sistem %85+ evidence score'una ulaştı
- [ ] Overall health: "HEALTHY"
- [ ] Evidence validation: "ALL VERIFIED"

---

**🚀 Bu sistem sayesinde artık belgelere değil, gerçek kanıtlara güveniyorsun!**

**Son Güncelleme**: 21 Temmuz 2025 - Evidence System v1.0
