# İ-EP.APP Audit Scripts

Bu klasör, İ-EP.APP projesinin kod kalitesi, güvenlik, performans ve tutarlılığını kontrol etmek için kullanılan audit scriptlerini içerir.

## 🚀 Hızlı Başlangıç

Tüm audit'leri çalıştırmak için:

```bash
cd audit-scripts
chmod +x run-all-audits.sh
./run-all-audits.sh
```

## 📋 Mevcut Audit Scriptleri

### 1. comprehensive-audit.sh
**Kapsamlı Kod Kalitesi Denetimi**

Kontrol ettikleri:
- TypeScript 'any' type kullanımı
- ESLint hataları
- Repository pattern tutarlılığı
- Test coverage
- Güvenlik açıkları
- Bağımlılık güncelliği
- Build durumu
- API endpoint sağlığı

Kullanım:
```bash
./comprehensive-audit.sh
```

### 2. database-consistency-check.sh
**Database-Code Tutarlılık Kontrolü**

Kontrol ettikleri:
- Database tabloları vs TypeScript interface'leri
- RLS policy varlığı
- Foreign key ilişkileri
- Orphaned kod/tablo tespiti
- Data type tutarlılığı

Kullanım:
```bash
./database-consistency-check.sh
```

### 3. performance-audit.sh
**Performans Analizi**

Kontrol ettikleri:
- Bundle size analizi
- Code splitting kullanımı
- Image optimization
- Dependency boyutları
- Middleware performansı
- Database query optimizasyonu
- Client-side optimization (memo, callbacks)
- API optimization (pagination, caching)

Kullanım:
```bash
./performance-audit.sh
```

### 4. run-all-audits.sh
**Master Audit Runner**

Tüm audit'leri sırayla çalıştırır ve sonuçları organize eder.

## 📊 Audit Sonuçları

Audit sonuçları `audit-results/` klasöründe timestamp'li alt klasörlerde saklanır:

```
audit-results/
└── audit_20250718_143000/
    ├── comprehensive-audit-results.txt
    ├── database-consistency-results.txt
    ├── performance-audit-results.txt
    └── AUDIT-REPORT.md
```

## 📝 Audit Raporu Hazırlama

1. Audit'leri çalıştırın
2. Oluşan `AUDIT-REPORT.md` dosyasını açın
3. Audit sonuçlarına göre bulguları doldurun
4. Action item'ları belirleyin
5. Takip edilecek metrikleri güncelleyin

## 🎯 Önerilen Audit Sıklığı

- **Haftalık**: Performance audit (development sırasında)
- **Sprint Sonu**: Comprehensive audit
- **Release Öncesi**: Tüm audit'ler
- **Major Feature Sonrası**: Database consistency check

## 🔧 Script Özelleştirme

Script'leri projenizin ihtiyaçlarına göre özelleştirebilirsiniz:

### Yeni kontrol eklemek:
```bash
# comprehensive-audit.sh içine yeni bir bölüm ekleyin
echo -e "${BLUE}X. YENİ KONTROL${NC}"
echo "------------------------"
# Kontrol kodunuzu ekleyin
```

### Threshold değerlerini değiştirmek:
Script'lerdeki skorlama mantığında kullanılan değerleri güncelleyin.

## 🚨 Kritik Eşik Değerleri

- **Any type kullanımı**: 0 (hiç olmamalı)
- **Console.log**: < 50 (production'da olmamalı)
- **Test coverage**: > 60%
- **Bundle size**: < 500KB (target)
- **API response time**: < 200ms
- **Outdated dependencies**: < 5

## 💡 İpuçları

1. **CI/CD Entegrasyonu**: Bu script'leri GitHub Actions'a ekleyebilirsiniz
2. **Pre-commit Hook**: Kritik kontrolleri commit öncesi çalıştırabilirsiniz
3. **Scheduled Runs**: Cron job ile düzenli audit'ler ayarlayabilirsiniz
4. **Custom Metrics**: Projeye özel metrikler ekleyebilirsiniz

## 🐛 Sorun Giderme

### Script çalışmıyor
```bash
chmod +x *.sh
```

### Command not found hataları
Gerekli tool'ları yükleyin:
```bash
npm install -g madge depcheck
```

### Audit çok uzun sürüyor
Performance-intensive kontrolleri comment out edebilirsiniz.

## 📈 Gelecek Geliştirmeler

- [ ] JSON/CSV format export
- [ ] Grafik dashboard entegrasyonu
- [ ] Slack/Discord notification
- [ ] Historical trend tracking
- [ ] AI-powered recommendation engine

---

**Son Güncelleme**: 18 Temmuz 2025
**Maintainer**: İ-EP Development Team
