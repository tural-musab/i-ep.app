# İ-EP.APP Dokümantasyon Auto-Sync Sistemi

## 🎯 Genel Bakış

Bu sistem, İ-EP.APP projesinde dokümantasyon iyileştirme planının proje ilerlemesiyle otomatik olarak senkronize edilmesini sağlar. Sistem, proje dosyalarındaki değişiklikleri izler ve dokümantasyon planını gerçek zamanlı olarak günceller.

## 🔧 Sistem Bileşenleri

### 1. Auto-Sync Script (`scripts/doc-sync.js`)

Ana senkronizasyon scripti olup şu işlevleri yerine getirir:

- **Dosya İzleme**: Proje dosyalarındaki değişiklikleri izler
- **Durum Toplama**: PROGRESS.md, sprint planlama ve storage implementation durumunu analiz eder
- **HTML Güncelleme**: Dokümantasyon iyileştirme planını otomatik günceller
- **Real-time Sync**: Değişiklikleri anında yansıtır

### 2. Package.json Scripts

```bash
# Tek seferlik senkronizasyon
npm run doc:sync

# Sürekli izleme modu
npm run doc:watch

# Proje durumunu görüntüle
npm run doc:status
```

### 3. GitHub Actions Workflow (`.github/workflows/doc-sync.yml`)

Otomatik CI/CD entegrasyonu:

- **Trigger Events**: Push, PR ve manual trigger desteği
- **File Monitoring**: Belirli dosyalardaki değişiklikleri izler
- **Auto Commit**: Güncellenen dokümantasyonu otomatik commit eder
- **Summary Reports**: Detailed workflow summaries

## 📁 İzlenen Dosyalar

Sistem şu dosyalardaki değişiklikleri izler:

| Dosya                         | Açıklama                | Senkronizasyon Etkisi           |
| ----------------------------- | ----------------------- | ------------------------------- |
| `PROGRESS.md`                 | Proje ilerleme durumu   | Progress yüzdesi, sprint durumu |
| `SPRINT-PLANNING-2025.md`     | Sprint planlama         | Aktif sprint, sprint status     |
| `PROJECT-STATUS-REPORT-*.md`  | Proje durum raporları   | Genel proje durumu              |
| `DEVELOPMENT-ROADMAP-2025.md` | Geliştirme yol haritası | Roadmap güncellemeleri          |
| `src/lib/storage/**`          | Storage implementation  | Storage completion status       |

## 🎯 Hedef Dosya

Ana hedef dosya: `docs-site/docs/meta/dokumantasyon-iyilestirme-plani-2025.html`

Bu dosya şu bilgileri otomatik günceller:

- ✅ Proje ilerleme yüzdeleri
- 🚀 Sprint completion durumu
- 💾 Storage implementation progress
- 📅 Son güncelleme tarihleri
- 🔄 Gerçek zamanlı sync status

## 🚀 Kurulum ve Kullanım

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Manuel Senkronizasyon

```bash
# Tek seferlik güncelleme
npm run doc:sync
```

### 3. Sürekli İzleme

```bash
# Development modunda sürekli izleme
npm run doc:watch
```

### 4. Proje Durumu Kontrolü

```bash
# Mevcut proje durumunu görüntüle
npm run doc:status
```

## 🔄 Çalışma Mantığı

### 1. File Watching

Script, chokidar kullanarak dosya değişikliklerini izler:

```javascript
const watcher = chokidar.watch([
  'PROGRESS.md',
  'SPRINT-PLANNING-2025.md',
  'PROJECT-STATUS-REPORT-*.md',
  'src/lib/storage/**',
]);
```

### 2. Status Gathering

Değişiklik tespit edildiğinde:

- PROGRESS.md'den ilerleme yüzdesini okur
- Sprint planlama dosyasından aktif sprint'i bulur
- Storage implementation durumunu kontrol eder
- Son güncelleme tarihlerini toplar

### 3. HTML Update

Toplanan bilgilerle HTML dosyasını günceller:

- Progress card'larındaki yüzdeleri günceller
- Sprint durumunu yansıtır
- Storage completion status'unu günceller
- Update timestamp'ini yeniler

### 4. Auto Commit (GitHub Actions)

GitHub Actions workflow'u:

- Dosya değişikliklerini tespit eder
- Senkronizasyon script'ini çalıştırır
- Güncellenen dokümantasyonu commit eder
- Summary report oluşturur

## ⚙️ Konfigürasyon

### Environment Variables

```bash
# Auto-sync aktifleştirme
ENABLE_DOC_SYNC=true

# Sync interval (ms)
DOC_SYNC_INTERVAL=5000

# Log seviyesi
DOC_SYNC_LOG_LEVEL=info
```

### Custom Configuration

`scripts/doc-sync.js` dosyasında CONFIG objesini düzenleyerek:

```javascript
const CONFIG = {
  watchFiles: [
    'PROGRESS.md',
    'SPRINT-PLANNING-2025.md',
    // Yeni dosyalar eklenebilir
  ],
  targetFile: 'docs-site/docs/meta/dokumantasyon-iyilestirme-plani-2025.html',
  // Diğer ayarlar...
};
```

## 📊 Monitoring ve Logging

### 1. Console Logging

Script çalışma durumu hakkında detaylı log verir:

```
📊 Proje durumu toplanıyor...
✅ Dokümantasyon planı güncellendi
🔄 Senkronizasyon tamamlandı!
```

### 2. GitHub Actions Summary

CI/CD workflow'unda detaylı summary report:

- Senkronizasyon durumu
- Güncellenen dosyalar
- Error handling
- Performance metrics

### 3. Error Handling

Comprehensive error handling:

- File access errors
- Parse errors
- Network issues
- Permission problems

## 🛠️ Troubleshooting

### Common Issues

1. **Dosya bulunamadı hatası**

   ```bash
   # Dosya yollarını kontrol et
   npm run doc:status
   ```

2. **Permission errors**

   ```bash
   # Dosya izinlerini kontrol et
   ls -la docs-site/docs/meta/
   ```

3. **Chokidar watch errors**
   ```bash
   # Chokidar'ı yeniden yükle
   npm install chokidar --force
   ```

### Debug Mode

```bash
# Debug modunda çalıştır
DEBUG=doc-sync npm run doc:watch
```

## 🔮 Gelecek Geliştirmeler

### Planlanan Özellikler

- [ ] **Slack/Discord Integration**: Senkronizasyon notification'ları
- [ ] **Advanced Analytics**: Dokümantasyon usage metrics
- [ ] **Multi-format Support**: Markdown, PDF auto-generation
- [ ] **Template System**: Configurable documentation templates
- [ ] **Conflict Resolution**: Merge conflict handling
- [ ] **Backup System**: Auto-backup before updates

### Enhancement Ideas

- **AI-powered Content**: ChatGPT entegrasyonu ile akıllı content generation
- **Visual Progress**: Charts ve graphs ile progress visualization
- **Multi-language**: Türkçe/İngilizce dual-language support
- **API Integration**: REST API ile external system integration

## 📝 Katkıda Bulunma

### Development Workflow

1. Script'i geliştir: `scripts/doc-sync.js`
2. Test et: `npm run doc:sync`
3. GitHub Actions'ı test et: Push yaparak workflow'u test et
4. Documentation'ı güncelle: Bu README'yi güncelle

### Code Style

- ES6+ JavaScript
- Comprehensive error handling
- Detailed logging
- Clean, readable code
- TypeScript migration planned

## 📄 License

Bu auto-sync sistemi İ-EP.APP projesinin bir parçasıdır ve aynı lisans altında dağıtılır.

---

**Son Güncelleme**: 14 Ocak 2025
**Versiyon**: 1.0.0
**Maintainer**: İ-EP.APP Development Team
