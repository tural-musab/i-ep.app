# İ-EP.APP Proje Takip Dosyaları ve Sistematik Workflow

## 📁 Ana Takip Dosyaları

### 🗂️ Tier 1: Günlük Operasyonel Dosyalar

#### 1. `/CLAUDE.md` - 🎯 **EN KRITIK**

- **Amaç**: Claude için proje context ve talimatlar
- **İçerik**: Güncel proje durumu, teknik stack, phase bilgisi
- **Güncellenme**: Her major milestone'da
- **Kullanım**: Her Claude konuşmasında otomatik okunur

#### 2. `/sprints/CURRENT-SPRINT-STATUS.md` - 📋 **GÜNLÜK TAKIP**

- **Amaç**: Güncel sprint durumu ve daily tasks
- **İçerik**: Bugünkü görevler, phase durumu, immediate actions
- **Güncellenme**: Günde 2-3 kez (sabah, öğle, akşam)
- **Kullanım**: Her geliştirme başlangıcında

#### 3. `/GUNLUK-TODO-TAKIP-REHBERI.md` - 🔄 **WORKFLOW REHBERI**

- **Amaç**: Günlük workflow talimatları
- **İçerik**: Hangi dosyayı ne zaman okuyacağınız
- **Güncellenme**: Phase değişikliklerinde
- **Kullanım**: Workflow confuse olduğunda

### 🗂️ Tier 2: Stratejik Planlama Dosyaları

#### 4. `/docs-site/docs/PROGRESS.md` - 📊 **GENEL PROGRESS**

- **Amaç**: Comprehensive proje durumu
- **İçerik**: Tamamlanan/eksik features, test coverage, achievements
- **Güncellenme**: Haftada 1-2 kez (major updates)
- **Kullanım**: Haftalık review ve reporting

#### 5. `/ACTION-PLAN-OPTIMIZATION.md` - 🚨 **ACIL EYLEMLER**

- **Amaç**: Immediate actions ve critical tasks
- **İçerik**: Bu hafta yapılacaklar, critical priorities
- **Güncellenme**: Phase başlangıçlarında
- **Kullanım**: Sabah planning'de kontrol

#### 6. `/FOUNDATION-FIRST-STRATEGY.md` - 🏗️ **STRATEJI DOKÜMANI**

- **Amaç**: Proje geliştirme stratejisi ve phase planları
- **İçerik**: Phase definitions, success criteria, methodology
- **Güncellenme**: Strategic pivots'larda
- **Kullanım**: Stratejik kararlar alırken

### 🗂️ Tier 3: Setup ve Support Dosyaları

#### 7. `/SETUP-TODO-LIST.md` - 🔧 **TEKNIK SETUP**

- **Amaç**: Environment ve technical setup tasks
- **İçerik**: Database, dependencies, configuration
- **Güncellenme**: Technical issues'larda
- **Kullanım**: Setup problems yaşandığında

#### 8. `/REALISTIC-TIMELINE-2025.md` - 📅 **TIMELINE PLANLAMA**

- **Amaç**: Gerçekçi zaman planlaması
- **İçerik**: Phase timelines, milestone dates
- **Güncellenme**: Timeline revisions'larda
- **Kullanım**: Timeline planning'de

## 🔄 Sistematik Workflow - Günlük Operasyon

### Sabah Rutini (09:00) - 5 dakika

```bash
Sıra 1: sprints/CURRENT-SPRINT-STATUS.md        # 3 dakika
├── Hangi Phase'deyiz?
├── Bugünkü priority tasks neler?
└── Acil blocker var mı?

Sıra 2: ACTION-PLAN-OPTIMIZATION.md     # 2 dakika
├── Immediate actions kontrol
├── Critical tasks priority
└── Bu hafta deadlines
```

### Öğle Güncellemesi (12:00) - 1 dakika

```bash
sprints/CURRENT-SPRINT-STATUS.md güncelle
├── Sabah task'larını ✅ Complete yap
├── Blocker varsa not et
└── Öğleden sonra plan'ı netleştir
```

### Akşam Değerlendirmesi (17:30) - 2 dakika

```bash
sprints/CURRENT-SPRINT-STATUS.md güncelle
├── Günün tüm task'larını ✅ Complete yap
├── Yarın için 1-2 priority task belirle
└── Weekly progress note ekle
```

## 📋 Haftalık Review Cycle

### Pazartesi Sabahı (Hafta Başı) - 10 dakika

```bash
Sıra 1: sprints/CURRENT-SPRINT-STATUS.md        # 3 dakika
├── Yeni hafta planning
├── Previous week achievements review
└── Bu hafta goals setting

Sıra 2: PROGRESS.md                      # 5 dakika
├── Major achievements update
├── Completion percentages review
└── Phase progress assessment

Sıra 3: FOUNDATION-FIRST-STRATEGY.md    # 2 dakika
├── Current phase validation
├── Strategy alignment check
└── Next phase preparation
```

### Cuma Akşamı (Hafta Sonu) - 7 dakika

```bash
Sıra 1: sprints/CURRENT-SPRINT-STATUS.md        # 2 dakika
├── Week completion summary
├── Achievements capture
└── Next week preparation

Sıra 2: PROGRESS.md                      # 5 dakika
├── Weekly progress update
├── Completion percentage update
├── New achievements documentation
└── Next week goals setting
```

## 🎯 Dosya İlişki Şeması

```
CLAUDE.md (Context)
    ↓
sprints/CURRENT-SPRINT-STATUS.md (Daily Hub)
    ↓                    ↓
ACTION-PLAN-OPTIMIZATION.md    PROGRESS.md
    ↓                    ↓
GUNLUK-TODO-TAKIP-REHBERI.md  FOUNDATION-FIRST-STRATEGY.md
    ↓                    ↓
SETUP-TODO-LIST.md    REALISTIC-TIMELINE-2025.md

Günlük Kullanım:
- sprints/CURRENT-SPRINT-STATUS.md
- ACTION-PLAN-OPTIMIZATION.md
- GUNLUK-TODO-TAKIP-REHBERI.md

Haftalık Review:
- PROGRESS.md
- FOUNDATION-FIRST-STRATEGY.md
- REALISTIC-TIMELINE-2025.md

Problem Solving:
- SETUP-TODO-LIST.md
- CLAUDE.md
```

## 🔧 Dosya Updating Sırası

### Major Milestone Tamamlandığında

```bash
1. sprints/CURRENT-SPRINT-STATUS.md          # Achievement note
2. PROGRESS.md                       # Completion percentage update
3. CLAUDE.md                         # Context update
4. ACTION-PLAN-OPTIMIZATION.md       # Next priorities
```

### Phase Değişikliğinde

```bash
1. FOUNDATION-FIRST-STRATEGY.md      # Phase transition
2. sprints/CURRENT-SPRINT-STATUS.md          # New phase goals
3. ACTION-PLAN-OPTIMIZATION.md       # New immediate actions
4. CLAUDE.md                         # Context update
5. REALISTIC-TIMELINE-2025.md        # Timeline adjustment
```

### Problem/Blocker Yaşandığında

```bash
1. SETUP-TODO-LIST.md               # Technical issues
2. sprints/CURRENT-SPRINT-STATUS.md         # Blocker documentation
3. ACTION-PLAN-OPTIMIZATION.md      # Resolution actions
```

## 💡 Best Practices

### DO's ✅

- **Her sabah sprints/CURRENT-SPRINT-STATUS.md ile başla**
- **Günde en fazla 2 ana dosya güncelle**
- **Hızlı, focused updates yap**
- **Achievements'ları immediate capture et**
- **Weekly review'ları skip etme**

### DON'Ts ❌

- **Birden fazla dosyayı aynı anda güncelleme**
- **5 dakikadan fazla planning yapma**
- **Eski arşiv dosyalarını okuma**
- **Complex analysis yapmaya çalışma**

## 🚀 Current Status (18 Temmuz 2025)

**Active Phase**: Phase 6.1 Frontend-Backend Integration  
**Primary Focus**: sprints/CURRENT-SPRINT-STATUS.md + ACTION-PLAN-OPTIMIZATION.md  
**Weekly Review**: PROGRESS.md (Cuma güncellemesi yapıldı)  
**Next Major Update**: CLAUDE.md (Phase 6.1 completion'da)

## 📊 Workflow Özeti

### Günlük Minimum (8 dakika/gün)

- **Sabah**: 5 dakika planning
- **Öğle**: 1 dakika update
- **Akşam**: 2 dakika review

### Haftalık Minimum (17 dakika/hafta)

- **Pazartesi**: 10 dakika hafta başı planning
- **Cuma**: 7 dakika hafta sonu review

### **Toplam**: Günde 8 dakika + haftada 17 dakika = **Tam kontrol!**

---

**Bu sistemle** günlük 5 dakika planning + haftada 10 dakika review ile tam kontrol sağlayabilirsiniz!

**Dosya Sahibi**: İ-EP.APP Development Team  
**Son Güncelleme**: 18 Temmuz 2025  
**Durum**: Aktif Kullanımda  
**Öncelik**: Kritik (Günlük workflow için temel)
