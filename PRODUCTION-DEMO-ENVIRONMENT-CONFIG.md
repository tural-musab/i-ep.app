# İ-EP.APP Production Demo Environment Configuration

> **Objective**: Complete environment configuration checklist for demo.i-ep.app deployment
> 
> **Generated**: July 22, 2025 - Phase 6.2 Production Demo Setup

## 📋 Environment Variables Configuration

### 1. Vercel Production Environment Variables

```bash
# Application Configuration
NEXT_PUBLIC_APP_NAME="İ-EP.APP Demo"
NEXT_PUBLIC_APP_URL="https://demo.i-ep.app"
NEXT_PUBLIC_DOMAIN="demo.i-ep.app"
NEXT_PUBLIC_BASE_DOMAIN="i-ep.app"
NODE_ENV="production"
VERCEL_ENV="production"

# Demo Mode Configuration
NEXT_PUBLIC_DEMO_MODE="true"
NEXT_PUBLIC_DEMO_TENANT_ID="demo-tenant-production-2025"
NEXT_PUBLIC_ENABLE_DEMO_RESET="true"
NEXT_PUBLIC_DEMO_RESET_INTERVAL="24"

# Supabase Production Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[your-project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-supabase-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[your-supabase-service-role-key]"

# NextAuth Configuration
NEXTAUTH_URL="https://demo.i-ep.app"
NEXTAUTH_SECRET="[generate-32-character-secret]"

# Storage Configuration
CLOUDFLARE_API_TOKEN="[your-cloudflare-token]"
CLOUDFLARE_ACCOUNT_ID="[your-cloudflare-account-id]"
CLOUDFLARE_ZONE_ID="[your-zone-id]"

# Performance & Caching
UPSTASH_REDIS_URL="[your-redis-url]"
UPSTASH_REDIS_TOKEN="[your-redis-token]"

# Monitoring & Analytics
SENTRY_DSN="[your-sentry-dsn]"
SENTRY_ENVIRONMENT="demo"
VERCEL_ANALYTICS_ID="[auto-generated]"

# Rate Limiting (Demo Environment)
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX="200"
RATE_LIMIT_DEMO_MAX="500"

# Email Configuration (Demo)
EMAIL_FROM="demo@i-ep.app"
EMAIL_SERVER_HOST="[your-smtp-host]"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="[your-smtp-user]"
EMAIL_SERVER_PASSWORD="[your-smtp-password]"
```

### 2. Required Environment Variables Checklist

#### Application Core (Required)
- [ ] `NEXT_PUBLIC_APP_URL` - Demo domain URL
- [ ] `NEXT_PUBLIC_DOMAIN` - Demo domain
- [ ] `NEXT_PUBLIC_DEMO_MODE` - Enable demo features
- [ ] `NEXT_PUBLIC_DEMO_TENANT_ID` - Demo tenant identifier
- [ ] `NODE_ENV` - Production environment

#### Authentication (Required)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `NEXTAUTH_URL` - NextAuth callback URL
- [ ] `NEXTAUTH_SECRET` - NextAuth session secret

#### Storage & CDN (Required)
- [ ] `CLOUDFLARE_API_TOKEN` - CloudflareR2 access
- [ ] `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account
- [ ] `CLOUDFLARE_ZONE_ID` - DNS zone management

#### Performance (Optional but Recommended)
- [ ] `UPSTASH_REDIS_URL` - Redis caching URL
- [ ] `UPSTASH_REDIS_TOKEN` - Redis access token

#### Monitoring (Optional but Recommended)
- [ ] `SENTRY_DSN` - Error tracking
- [ ] `SENTRY_ENVIRONMENT` - Environment tag

#### Communication (Optional)
- [ ] `EMAIL_SERVER_HOST` - SMTP configuration
- [ ] `EMAIL_SERVER_USER` - SMTP credentials
- [ ] `EMAIL_SERVER_PASSWORD` - SMTP password

## 🌐 DNS Configuration

### 1. Primary Domain Configuration

```bash
# DNS Records for demo.i-ep.app
Type: CNAME
Name: demo
Value: cname.vercel-dns.com
TTL: Auto (or 300 seconds)
```

### 2. Verification Steps

```bash
# Check DNS propagation
dig demo.i-ep.app CNAME
nslookup demo.i-ep.app

# Verify SSL certificate
curl -I https://demo.i-ep.app
openssl s_client -servername demo.i-ep.app -connect demo.i-ep.app:443
```

### 3. Alternative DNS Providers

#### Cloudflare DNS
```bash
# Via Cloudflare Dashboard
demo    CNAME    cname.vercel-dns.com    Auto    Proxied: No
```

#### AWS Route 53
```bash
# Route 53 Record
Name: demo.i-ep.app
Type: CNAME
Value: cname.vercel-dns.com
TTL: 300
```

#### Google Domains
```bash
# Google Domains DNS
Host: demo
Type: CNAME
Data: cname.vercel-dns.com
TTL: 3600
```

## 🔧 Vercel Project Configuration

### 1. Domain Configuration

```bash
# Add domain via Vercel CLI
vercel domains add demo.i-ep.app

# Or via Vercel Dashboard
Project Settings > Domains > Add Domain > demo.i-ep.app
```

### 2. Build Configuration

```bash
# Build Command (default)
npm run build

# Output Directory (default)
.next

# Install Command (default)
npm install

# Root Directory
./
```

### 3. Framework Preset

```bash
Framework Preset: Next.js
Node.js Version: 18.x (Latest LTS)
Region: Washington, D.C., USA (iad1)
```

### 4. Environment Variables Setup

```bash
# Set via Vercel CLI
vercel env add NEXT_PUBLIC_DEMO_MODE production
vercel env add NEXT_PUBLIC_DEMO_TENANT_ID production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXTAUTH_URL production

# Or bulk import via Vercel Dashboard
Project Settings > Environment Variables > Import > .env
```

## 🗄️ Database Migration Plan

### 1. Production Database Setup

#### Migration Strategy
- **Approach**: Additive migrations only
- **Isolation**: Demo tenant data completely isolated
- **Rollback**: Demo data can be reset without affecting other tenants
- **Backup**: Automated daily backups via Supabase

#### Required Migrations
```sql
-- 1. Ensure demo tenant exists
scripts/production-demo-setup.sql

-- 2. Create demo domain mapping
INSERT INTO tenant_domains (tenant_id, domain, type, is_verified)
VALUES ('demo-tenant-production-2025', 'demo.i-ep.app', 'custom', true);

-- 3. Set up RLS policies for demo isolation
-- (Already handled in existing migration files)
```

### 2. Demo Data Seeding

#### Data Categories
- **Tenants**: 1 demo school tenant
- **Classes**: 8 classes across 4 grade levels (5-8)
- **Subjects**: 20 Turkish curriculum subjects
- **Students**: 10 sample students with realistic data
- **Teachers**: 5 sample teachers with specializations
- **Assignments**: 5 sample assignments with Turkish context
- **Attendance**: 30 days of realistic attendance data
- **Grades**: Sample grades following Turkish grading system

#### Data Isolation
```sql
-- All demo data uses consistent tenant_id
tenant_id = 'demo-tenant-production-2025'

-- RLS policies ensure complete isolation
CREATE POLICY "demo_tenant_isolation" ON students
FOR ALL USING (tenant_id = current_tenant_id());
```

### 3. Data Reset Mechanism

#### Automated Reset (Every 24 hours)
```javascript
// Vercel Cron Job (vercel.json)
{
  "crons": [{
    "path": "/api/demo/reset-data",
    "schedule": "0 2 * * *"
  }]
}
```

#### Manual Reset Endpoint
```bash
# Admin endpoint for manual reset
POST https://demo.i-ep.app/api/admin/reset-demo
Authorization: Bearer [admin-token]
```

## 👥 Demo Users Configuration

### 1. Production Demo Users

```javascript
const DEMO_USERS = {
  admin: {
    email: 'admin@demo.i-ep.app',
    password: 'DemoAdmin2025!',
    role: 'admin',
    name: 'Demo Yönetici',
    permissions: ['full_access', 'user_management', 'system_settings']
  },
  teacher: {
    email: 'teacher@demo.i-ep.app',
    password: 'DemoTeacher2025!',
    role: 'teacher', 
    name: 'Demo Öğretmen',
    subject: 'Matematik',
    classes: ['demo-class-5a', 'demo-class-6a']
  },
  student: {
    email: 'student@demo.i-ep.app',
    password: 'DemoStudent2025!',
    role: 'student',
    name: 'Demo Öğrenci',
    class: 'demo-class-5a',
    student_number: '2024001'
  },
  parent: {
    email: 'parent@demo.i-ep.app',
    password: 'DemoParent2025!',
    role: 'parent',
    name: 'Demo Veli',
    children: ['demo-student-001']
  }
};
```

### 2. User Creation Process

```bash
# Create demo users via script
node scripts/create-demo-users-production.js

# Verify users in Supabase Dashboard
# Auth > Users > Filter by demo.i-ep.app domain
```

### 3. Role-based Access Configuration

#### Admin User
- Full system access
- User management capabilities
- System configuration access
- All reporting and analytics

#### Teacher User  
- Class and subject management
- Assignment creation and grading
- Attendance tracking for assigned classes
- Student progress monitoring

#### Student User
- Personal dashboard access
- Assignment submission
- Grade viewing
- Attendance history

#### Parent User
- Child's academic information
- Communication with teachers
- Attendance notifications
- Progress reports

## 🔐 Security Configuration

### 1. Production Security Headers

```javascript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https://demo.i-ep.app https://*.supabase.co;
      connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com;
    `.replace(/\s+/g, ' ').trim()
  }
];
```

### 2. Rate Limiting Configuration

```javascript
// Demo environment rate limits
const rateLimits = {
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 200, // 200 requests per minute (higher for demo)
    standardHeaders: true
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts
    skipSuccessfulRequests: true
  },
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 file uploads per minute
    keyGenerator: (req) => req.ip + req.user?.id
  }
};
```

### 3. CORS Configuration

```javascript
// API routes CORS settings
const corsOptions = {
  origin: [
    'https://demo.i-ep.app',
    'https://i-ep.app',
    process.env.NEXT_PUBLIC_APP_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization', 
    'x-tenant-id',
    'x-demo-mode'
  ]
};
```

## 📊 Monitoring & Analytics Configuration

### 1. Vercel Analytics

```javascript
// Vercel Web Analytics
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics 
        mode="production"
        debug={false}
        beforeSend={(event) => ({
          ...event,
          demo_mode: true,
          tenant_id: process.env.NEXT_PUBLIC_DEMO_TENANT_ID
        })}
      />
    </>
  );
}
```

### 2. Sentry Error Tracking

```javascript
// Sentry configuration for demo environment
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'demo',
  
  // Demo-specific settings
  beforeSend(event) {
    // Add demo context to all events
    event.tags = {
      ...event.tags,
      demo_mode: true,
      tenant_id: process.env.NEXT_PUBLIC_DEMO_TENANT_ID
    };
    
    // Filter out demo user PII
    if (event.user?.email?.includes('@demo.i-ep.app')) {
      event.user = {
        id: event.user.id,
        demo_user: true
      };
    }
    
    return event;
  },
  
  // Performance monitoring
  tracesSampleRate: 0.1,
  
  // Session replay for demo analysis
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
```

### 3. Custom Demo Analytics

```javascript
// Demo usage tracking
const trackDemoUsage = (event, properties = {}) => {
  // Track demo-specific events
  analytics.track(`demo_${event}`, {
    ...properties,
    demo_tenant_id: process.env.NEXT_PUBLIC_DEMO_TENANT_ID,
    demo_domain: 'demo.i-ep.app',
    timestamp: new Date().toISOString()
  });
};

// Usage examples
trackDemoUsage('user_login', { role: 'teacher' });
trackDemoUsage('feature_used', { feature: 'assignment_creation' });
trackDemoUsage('session_duration', { duration_minutes: 15 });
```

## 📋 Deployment Checklist

### Pre-Deployment Checklist

#### Code & Configuration
- [ ] All environment variables configured in Vercel
- [ ] DNS records properly configured
- [ ] SSL certificate verified
- [ ] Production build passes locally
- [ ] All tests passing
- [ ] Security headers configured
- [ ] Rate limiting enabled

#### Database & Users
- [ ] Demo tenant migration deployed
- [ ] Demo data seeded successfully
- [ ] Demo users created and verified
- [ ] RLS policies verified
- [ ] Backup strategy confirmed

#### Monitoring & Analytics
- [ ] Sentry error tracking configured
- [ ] Vercel Analytics enabled
- [ ] Custom demo tracking implemented
- [ ] Performance monitoring active

### Post-Deployment Verification

#### Functionality Testing
- [ ] Homepage loads at demo.i-ep.app
- [ ] All 4 demo users can login successfully
- [ ] Role-based dashboards working correctly
- [ ] Turkish localization displaying properly
- [ ] API endpoints responding correctly

#### Feature Testing
- [ ] Assignment creation and submission working
- [ ] Attendance tracking functional
- [ ] Grade management operational
- [ ] File upload/download working
- [ ] Parent communication features active

#### Performance & Security
- [ ] Page load times <3 seconds
- [ ] Core Web Vitals scoring >90
- [ ] Security headers present
- [ ] SSL certificate valid
- [ ] CORS policies working correctly

#### Monitoring & Analytics
- [ ] Error tracking receiving events
- [ ] Analytics data flowing
- [ ] Performance metrics available
- [ ] Custom demo tracking working

### Success Criteria

#### Technical Metrics
- **Uptime**: >99.5%
- **Page Load Time**: <3 seconds (95th percentile)
- **API Response Time**: <500ms average
- **Error Rate**: <1% of total requests
- **Security Score**: A+ rating on security headers

#### User Experience Metrics
- **Login Success Rate**: >95%
- **Feature Completion Rate**: >80% per session
- **Mobile Compatibility**: Fully responsive
- **Accessibility**: WCAG 2.1 AA compliance
- **Localization**: 100% Turkish content accuracy

#### Business Metrics
- **Demo Session Duration**: >5 minutes average
- **Feature Exploration**: >3 modules per session
- **Return Visitor Rate**: >30%
- **Conversion Tracking**: Lead capture functional
- **Feedback Collection**: Contact forms working

---

**Configuration Version**: 1.0.0
**Last Updated**: July 22, 2025
**Environment**: Production Demo
**Status**: Ready for Implementation

This comprehensive configuration guide ensures all aspects of the production demo environment are properly set up for demo.i-ep.app deployment.