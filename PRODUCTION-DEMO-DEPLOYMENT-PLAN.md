# İ-EP.APP Production Demo Deployment Plan

> **Phase 6.2**: Production Demo Environment Setup for demo.i-ep.app
> 
> **Generated**: July 22, 2025
> 
> **Context**: Phase 6.1 Frontend-Backend Integration 100% complete - all 8 API endpoints working successfully

## 📋 Executive Summary

This document provides a comprehensive deployment strategy for setting up demo.i-ep.app as a production demo environment showcasing the Turkish educational management system capabilities.

### Current Status
- ✅ **Local Demo**: Fully functional with 4 demo users and Turkish educational data
- ✅ **API Integration**: All 8 core API endpoints working (Assignment, Attendance, Grade, Student management)
- ✅ **Authentication**: Complete role-based system (admin, teacher, student, parent)
- ✅ **Multi-tenant Architecture**: Production-ready with RLS policies
- 🎯 **Next Step**: Deploy production demo environment at demo.i-ep.app

## 🎯 Deployment Strategy

### 1. Production Demo Architecture

```
demo.i-ep.app (Production Demo)
├── Frontend: Next.js 15.4.1 on Vercel
├── Database: Supabase Production (shared with main)
├── Authentication: Supabase Auth + NextAuth.js
├── Storage: Supabase Storage + CloudflareR2
├── Monitoring: Sentry + Vercel Analytics
└── Demo Tenant: "demo" subdomain isolation
```

### 2. Multi-Tenant Demo Configuration

Based on research findings, we'll implement **Row-Level Security (RLS)** approach:

- **Demo Tenant ID**: `demo-tenant-production-2025`
- **Hostname**: `demo.i-ep.app`
- **Isolation**: Complete data isolation via RLS policies
- **Demo Data**: Istanbul Demo Ortaokulu with Turkish curriculum

## 🔧 Environment Configuration

### 1. Vercel Configuration

#### Domain Setup
```bash
# Add custom domain to Vercel project
vercel domains add demo.i-ep.app

# Configure DNS (CNAME record)
demo.i-ep.app -> cname.vercel-dns.com
```

#### Environment Variables for Production Demo
```bash
# Application Configuration
NEXT_PUBLIC_APP_URL="https://demo.i-ep.app"
NEXT_PUBLIC_DOMAIN="demo.i-ep.app" 
NODE_ENV="production"
VERCEL_ENV="production"

# Demo Tenant Configuration
NEXT_PUBLIC_DEMO_TENANT_ID="demo-tenant-production-2025"
NEXT_PUBLIC_DEMO_MODE="true"
NEXT_PUBLIC_BASE_DOMAIN="i-ep.app"

# Supabase Configuration (Production)
NEXT_PUBLIC_SUPABASE_URL="${PRODUCTION_SUPABASE_URL}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${PRODUCTION_SUPABASE_ANON_KEY}"
SUPABASE_SERVICE_ROLE_KEY="${PRODUCTION_SUPABASE_SERVICE_ROLE_KEY}"

# NextAuth Configuration
NEXTAUTH_URL="https://demo.i-ep.app"
NEXTAUTH_SECRET="${PRODUCTION_NEXTAUTH_SECRET}"

# Storage & Performance
CLOUDFLARE_API_TOKEN="${PRODUCTION_CLOUDFLARE_TOKEN}"
CLOUDFLARE_ACCOUNT_ID="${PRODUCTION_CLOUDFLARE_ACCOUNT_ID}"
UPSTASH_REDIS_URL="${PRODUCTION_REDIS_URL}"
UPSTASH_REDIS_TOKEN="${PRODUCTION_REDIS_TOKEN}"

# Monitoring
SENTRY_DSN="${PRODUCTION_SENTRY_DSN}"
SENTRY_ENVIRONMENT="demo"
```

### 2. Next.js Configuration Updates

#### Update `next.config.js`
```javascript
// Add demo domain to image optimization
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'demo.i-ep.app',
      port: '',
      pathname: '/**',
    },
    // ... existing patterns
  ],
},
```

### 3. Middleware Enhancement

#### Update `src/middleware.ts`
```typescript
// Add demo tenant resolution
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Production demo tenant
  if (hostname === 'demo.i-ep.app') {
    const tenantHeaders = new Headers(request.headers);
    tenantHeaders.set('x-tenant-id', 'demo-tenant-production-2025');
    tenantHeaders.set('x-tenant-hostname', 'demo.i-ep.app');
    tenantHeaders.set('x-tenant-name', 'İstanbul Demo Ortaokulu');
    tenantHeaders.set('x-tenant-primary', 'true');
    tenantHeaders.set('x-tenant-custom-domain', 'true');
    
    return NextResponse.next({
      request: {
        headers: tenantHeaders,
      },
    });
  }
  
  // ... existing middleware logic
}
```

## 🗄️ Database Configuration

### 1. Production Demo Tenant Migration

#### Create Demo Tenant
```sql
-- Production Demo Tenant
INSERT INTO tenants (
  id, 
  name, 
  subdomain,
  domain, 
  settings, 
  is_active,
  created_at, 
  updated_at
) VALUES (
  'demo-tenant-production-2025',
  'İstanbul Demo Ortaokulu',
  'demo',
  'demo.i-ep.app',
  '{
    "features": ["assignments", "attendance", "grades", "parent_communication", "analytics"],
    "theme": "professional",
    "language": "tr",
    "timezone": "Europe/Istanbul",
    "academic_year": "2024-2025",
    "school_type": "ortaokul",
    "demo_mode": true,
    "max_students": 200,
    "max_teachers": 20
  }'::jsonb,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  settings = EXCLUDED.settings,
  updated_at = NOW();
```

### 2. Demo Users Configuration

#### Production Demo Authentication
```typescript
// Demo users for production demo
export const DEMO_USERS = {
  admin: {
    email: 'admin@demo.i-ep.app',
    password: 'DemoAdmin2025!',
    role: 'admin',
    name: 'Demo Yönetici'
  },
  teacher: {
    email: 'teacher@demo.i-ep.app', 
    password: 'DemoTeacher2025!',
    role: 'teacher',
    name: 'Demo Öğretmen'
  },
  student: {
    email: 'student@demo.i-ep.app',
    password: 'DemoStudent2025!',
    role: 'student', 
    name: 'Demo Öğrenci'
  },
  parent: {
    email: 'parent@demo.i-ep.app',
    password: 'DemoParent2025!',
    role: 'parent',
    name: 'Demo Veli'
  }
};
```

### 3. Demo Data Seed

#### Educational Demo Content
```sql
-- Turkish Educational System Demo Data
-- Classes (5-8th grades)
INSERT INTO classes (id, tenant_id, name, grade_level, section, academic_year, capacity)
VALUES 
  ('demo-class-5a', 'demo-tenant-production-2025', '5-A Sınıfı', 5, 'A', '2024-2025', 30),
  ('demo-class-6a', 'demo-tenant-production-2025', '6-A Sınıfı', 6, 'A', '2024-2025', 28),
  ('demo-class-7a', 'demo-tenant-production-2025', '7-A Sınıfı', 7, 'A', '2024-2025', 32),
  ('demo-class-8a', 'demo-tenant-production-2025', '8-A Sınıfı', 8, 'A', '2024-2025', 29);

-- Turkish Curriculum Subjects
INSERT INTO subjects (id, tenant_id, name, code, grade_level)
VALUES
  ('demo-subj-matematik', 'demo-tenant-production-2025', 'Matematik', 'MAT', 5),
  ('demo-subj-turkce', 'demo-tenant-production-2025', 'Türkçe', 'TUR', 5),
  ('demo-subj-fen', 'demo-tenant-production-2025', 'Fen Bilimleri', 'FEN', 5),
  ('demo-subj-sosyal', 'demo-tenant-production-2025', 'Sosyal Bilgiler', 'SOS', 5);

-- Sample assignments with Turkish educational context
INSERT INTO assignments (id, tenant_id, title, description, subject_id, class_id, due_date, status)
VALUES
  ('demo-assign-1', 'demo-tenant-production-2025', 'Kesirler Konusu Çalışma Kağıdı', 
   'Matematik dersi kesirler konusu uygulama soruları', 'demo-subj-matematik', 'demo-class-5a', 
   '2025-08-01', 'active'),
  ('demo-assign-2', 'demo-tenant-production-2025', 'Hikaye Yazma Etkinliği',
   'Türkçe dersi yaratıcı yazma ödevi - kısa hikaye', 'demo-subj-turkce', 'demo-class-5a',
   '2025-08-05', 'active');
```

## 🚀 Deployment Process

### Phase 1: Environment Setup (30 minutes)

#### 1.1 Vercel Configuration
```bash
# Configure custom domain
vercel domains add demo.i-ep.app

# Set environment variables
vercel env add NEXT_PUBLIC_DEMO_MODE production
vercel env add NEXT_PUBLIC_DEMO_TENANT_ID production
# ... (all production demo env vars)
```

#### 1.2 DNS Configuration
```bash
# DNS Records (via Cloudflare/Domain Registrar)
demo.i-ep.app    CNAME    cname.vercel-dns.com
```

### Phase 2: Database Migration (20 minutes)

#### 2.1 Production Demo Tenant Setup
```bash
# Run production demo tenant migration
npx supabase db push --include-all --db-url $PRODUCTION_SUPABASE_URL

# Apply demo data seed
psql $PRODUCTION_SUPABASE_URL -f scripts/production-demo-seed.sql
```

#### 2.2 Demo User Creation
```bash
# Create demo users via Supabase Auth API
node scripts/create-demo-users-production.js
```

### Phase 3: Code Deployment (15 minutes)

#### 3.1 Production Demo Branch
```bash
# Create production demo branch
git checkout -b production-demo
git push origin production-demo

# Deploy to Vercel
vercel --prod --branch production-demo
```

#### 3.2 Domain Verification
```bash
# Verify domain is accessible
curl -I https://demo.i-ep.app
curl -I https://demo.i-ep.app/api/health
```

### Phase 4: Testing & Validation (25 minutes)

#### 4.1 Authentication Testing
- ✅ admin@demo.i-ep.app login
- ✅ teacher@demo.i-ep.app login  
- ✅ student@demo.i-ep.app login
- ✅ parent@demo.i-ep.app login

#### 4.2 API Integration Testing
- ✅ Assignment Management APIs
- ✅ Attendance Tracking APIs
- ✅ Grade Management APIs
- ✅ Student Management APIs

#### 4.3 UI/UX Validation
- ✅ Turkish localization working
- ✅ Role-based dashboards functional
- ✅ Demo data displaying correctly
- ✅ File upload/download working

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
```javascript
// Vercel Web Analytics for demo usage
export const analytics = {
  enabled: process.env.VERCEL_ANALYTICS_ID,
  debug: false,
  beforeSend: (event) => ({
    ...event,
    demo_mode: true,
    tenant_id: 'demo-tenant-production-2025'
  })
};
```

### 2. Sentry Error Tracking
```javascript
// Sentry configuration for demo environment
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'demo',
  beforeSend: (event) => ({
    ...event,
    tags: {
      ...event.tags,
      demo_mode: true,
      tenant_id: 'demo-tenant-production-2025'
    }
  })
});
```

### 3. Performance Monitoring
- **Core Web Vitals**: Target <2.5s LCP, <100ms FID, <0.1 CLS
- **API Response Time**: <200ms average
- **Database Query Time**: <50ms average
- **Bundle Size**: <500KB main bundle

## 🔐 Security Configuration

### 1. CORS Configuration
```javascript
// API route CORS for demo domain
const corsOptions = {
  origin: ['https://demo.i-ep.app', 'https://i-ep.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id']
};
```

### 2. Rate Limiting
```javascript
// Demo-specific rate limits
const demoRateLimits = {
  api: '100 requests/minute/tenant',
  auth: '20 attempts/minute/ip',
  upload: '10 files/minute/user'
};
```

### 3. Content Security Policy
```javascript
// CSP for demo environment
const csp = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "https://vercel.live"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "https://demo.i-ep.app"],
  'connect-src': ["'self'", "https://*.supabase.co", "https://vitals.vercel-insights.com"]
};
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Verify Vercel project configuration
- [ ] Confirm all environment variables are set
- [ ] Test local build with production configuration
- [ ] Review security configurations
- [ ] Backup current production database (if applicable)

### Deployment
- [ ] Add demo.i-ep.app domain to Vercel project
- [ ] Configure DNS CNAME record
- [ ] Deploy production demo tenant migration
- [ ] Seed demo data to production database
- [ ] Create demo users via Supabase Auth
- [ ] Deploy application to Vercel
- [ ] Verify SSL certificate installation

### Post-Deployment
- [ ] Test all demo user logins
- [ ] Verify API endpoint functionality
- [ ] Confirm Turkish localization
- [ ] Test file upload/download features
- [ ] Monitor performance metrics
- [ ] Set up error tracking and alerts
- [ ] Document demo user credentials
- [ ] Create demo usage instructions

### Verification Tests
- [ ] Homepage loads at demo.i-ep.app
- [ ] Login flows work for all 4 roles
- [ ] Assignment creation and submission
- [ ] Attendance tracking functionality  
- [ ] Grade management system
- [ ] Parent communication portal
- [ ] Mobile responsiveness testing
- [ ] Performance audit (Lighthouse >90)

## 🔄 Maintenance & Updates

### Automated Updates
```yaml
# GitHub Actions for demo environment updates
name: Demo Environment Sync
on:
  push:
    branches: [main, production-demo]
  schedule:
    - cron: '0 2 * * 1' # Weekly Monday 2 AM UTC

jobs:
  sync-demo-data:
    runs-on: ubuntu-latest
    steps:
      - name: Refresh demo data
        run: node scripts/refresh-demo-data.js
      
  performance-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Lighthouse CI
        run: lhci autorun --upload.target=vercel
```

### Manual Maintenance (Monthly)
- [ ] Review demo data relevance
- [ ] Update academic year settings
- [ ] Clean up test uploads/files
- [ ] Review performance metrics
- [ ] Update demo user passwords
- [ ] Verify all integrations working

## 🎯 Success Metrics

### Performance Targets
- **Page Load Time**: <2 seconds
- **API Response Time**: <200ms average
- **Uptime**: >99.5%
- **Core Web Vitals**: All green scores

### User Experience Targets  
- **Demo Session Duration**: >5 minutes average
- **Feature Exploration**: >3 modules tested per session
- **Error Rate**: <1% of total requests
- **Mobile Usage**: >50% responsive design score

### Business Metrics
- **Demo Conversions**: Track demo→trial conversions
- **Feature Interest**: Monitor most-used features
- **Geographic Distribution**: Track international interest
- **Technical Feedback**: Collect performance feedback

## 📚 Documentation & Resources

### Demo Instructions
- **Demo URL**: https://demo.i-ep.app
- **Admin Access**: admin@demo.i-ep.app / DemoAdmin2025!
- **Teacher Access**: teacher@demo.i-ep.app / DemoTeacher2025!  
- **Student Access**: student@demo.i-ep.app / DemoStudent2025!
- **Parent Access**: parent@demo.i-ep.app / DemoParent2025!

### Technical Resources
- **Repository**: github.com/turanmusabosman/i-ep.app (production-demo branch)
- **Vercel Dashboard**: vercel.com/dashboard/projects/i-ep-app
- **Supabase Dashboard**: supabase.com/dashboard/projects
- **Monitoring**: sentry.io/projects/i-ep-demo

### Support Documentation
- **API Documentation**: demo.i-ep.app/api-docs
- **User Guides**: Turkish educational system workflows
- **Technical Specs**: Architecture and integration guides
- **Troubleshooting**: Common issues and solutions

---

**Generated by**: İ-EP.APP Development Team
**Version**: 1.0.0 
**Last Updated**: July 22, 2025
**Status**: Ready for Implementation (Phase 6.2)

This production demo deployment plan provides a comprehensive roadmap for establishing demo.i-ep.app as a fully functional showcase of the Turkish educational management system capabilities.