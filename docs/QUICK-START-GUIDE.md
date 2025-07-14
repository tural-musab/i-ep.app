# İ-EP.APP - Quick Start Guide for Claude Code

> Bu dosya Claude Code assistant'ın projeye hızlı başlaması için hazırlanmıştır.

## 🚀 Hızlı Başlangıç

### 1. Projeyi Anla
```bash
# İlk olarak bu dosyayı oku
cat /CLAUDE.md

# Detaylı analiz için
cat /ANALIZ-RAPORU.md
```

### 2. Mevcut Durum Kontrol
```bash
# Git durumu
git status

# Dependency'ler
npm install

# Development server
npm run dev
```

### 3. Yaygın Sorular ve Çözümler

#### "Proje ne durumda?"
- **Genel Puan**: 84/100
- **Güçlü**: Technical architecture, Security, Storage
- **Eksik**: Core academic features (35/100)
- **Öncelik**: Grade management, Assignment system

#### "Hangi teknolojiler kullanılıyor?"
- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind
- **Backend**: Supabase, NextAuth.js, PostgreSQL
- **Deployment**: Vercel, Docker

#### "Ne yapmalıyım?"
1. **Kritik**: Core academic features (Grade, Assignment, Attendance)
2. **Önemli**: Performance optimization (Middleware 124 kB)
3. **Gelişim**: UX improvements, CI/CD pipeline

## 📋 Hızlı Komutlar

### Development
```bash
npm run dev                 # Development server
npm run build              # Production build
npm run start              # Production server
```

### Testing
```bash
npm run test               # Unit tests
npm run test:e2e          # E2E tests
npm run test:coverage     # Coverage report
```

### Database
```bash
npx supabase db reset     # Reset database
npx supabase db push      # Push migrations
npx supabase db pull      # Pull schema
```

## 🔍 Hızlı Analiz Komutları

### Proje Durumu
```bash
# Dosya boyutları
du -sh src/middleware.ts   # Should be <50 kB (currently 124 kB)

# Test coverage
npm run test:coverage

# Bundle analyze
npm run build:analyze
```

### Önemli Lokasyonlar
```bash
/src/middleware.ts           # Performance bottleneck
/src/app/dashboard/page.tsx  # Main dashboard
/src/lib/storage/index.ts    # Storage abstraction
/supabase/migrations/        # Database schema
```

## 🎯 Tipik Görevler

### 1. Feature Development
- Grade management system
- Assignment creation/submission
- Attendance tracking
- Parent communication

### 2. Performance Optimization
- Middleware size reduction
- API response time improvement
- Bundle size optimization

### 3. UX Enhancement
- Navigation improvements
- Mobile optimization
- Data visualization

### 4. DevOps Setup
- GitHub Actions CI/CD
- Automated testing
- Deployment optimization

---

**Not**: Her yeni konuşmada önce `/CLAUDE.md` dosyasını okuyun!