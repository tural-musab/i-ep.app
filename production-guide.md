# İ-EP.APP Production Guide

## Overview
This guide provides comprehensive information for deploying and maintaining İ-EP.APP in production environment.

## System Architecture

### Frontend
- **Framework**: Next.js 15.2.2 with App Router
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: React hooks and context
- **Authentication**: NextAuth.js with Supabase integration

### Backend
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (R2 migration ready)
- **Caching**: Upstash Redis
- **API**: Next.js API routes

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase PostgreSQL
- **Cache**: Upstash Redis
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry
- **CI/CD**: GitHub Actions

## Deployment Process

### 1. Pre-Deployment Preparation
```bash
# 1. Run all tests
npm run test:ci
npm run test:security

# 2. Build application
npm run build

# 3. Verify environment variables
npm run validate:env
```

### 2. Database Migration
```bash
# 1. Connect to production database
npx supabase link --project-ref YOUR_PROJECT_REF

# 2. Run migrations
npx supabase db push

# 3. Verify migrations
npx supabase db diff
```

### 3. Vercel Deployment
```bash
# 1. Deploy to staging
vercel --prod --target staging

# 2. Run smoke tests
npm run test:smoke

# 3. Deploy to production
vercel --prod --target production
```

## Environment Configuration

### Production Environment Variables
```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://i-ep.app
NEXTAUTH_URL=https://i-ep.app
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=your-token

# Monitoring
SENTRY_DSN=https://...
SENTRY_PROJECT=i-ep-app
SENTRY_ORG=your-org

# Payment
IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key
IYZICO_BASE_URL=https://api.iyzipay.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## Security Configuration

### 1. Security Headers
```typescript
// next.config.js
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
    key: 'X-XSS-Protection',
    value: '1; mode=block'
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
  }
];
```

### 2. Rate Limiting
- API endpoints: 100 requests/minute
- Authentication: 5 attempts/minute
- File uploads: 10 uploads/minute

### 3. CORS Configuration
```typescript
// Allowed origins
const allowedOrigins = [
  'https://i-ep.app',
  'https://www.i-ep.app',
  'https://admin.i-ep.app'
];
```

## Performance Optimization

### 1. Caching Strategy
- **Static Assets**: CDN caching (1 year)
- **API Responses**: Redis caching (5 minutes)
- **Database Queries**: Connection pooling
- **Images**: Next.js Image optimization

### 2. Performance Targets
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

### 3. Bundle Optimization
- Code splitting by route
- Tree shaking enabled
- Compression enabled
- Image optimization

## Monitoring and Alerting

### 1. Application Monitoring
```typescript
// Health check endpoint
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      storage: await checkStorage()
    }
  };
  
  return Response.json(health);
}
```

### 2. Error Tracking
- **Sentry**: Automatic error capture
- **Custom Logging**: Application-specific logs
- **Performance Monitoring**: Request tracing

### 3. Uptime Monitoring
- **External Service**: Pingdom/UptimeRobot
- **Check Frequency**: 1-minute intervals
- **Alert Threshold**: 2 failed checks

## Backup and Recovery

### 1. Database Backup
```bash
# Daily automated backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Point-in-time recovery available
# RPO: 1 hour, RTO: 1 hour
```

### 2. File Storage Backup
- **Assets**: Daily backup to S3
- **Configuration**: Version controlled
- **Recovery Time**: 15 minutes

### 3. Disaster Recovery
1. **Primary Failure**: Auto-failover to secondary
2. **Database Failure**: Restore from backup
3. **Complete Outage**: Full system restoration

## Troubleshooting

### 1. Common Issues

#### Database Connection Issues
```bash
# Check database status
npx supabase status

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
SELECT * FROM pg_stat_activity;
```

#### Performance Issues
```bash
# Check slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

# Monitor memory usage
htop

# Check Redis performance
redis-cli info memory
```

#### Authentication Issues
```bash
# Check Supabase auth status
npx supabase functions logs --project-ref YOUR_REF

# Verify JWT tokens
# Check user session in database
```

### 2. Emergency Procedures

#### Service Outage
1. **Immediate Response**: Check monitoring dashboard
2. **Identify Issue**: Review error logs
3. **Communicate**: Update status page
4. **Resolve**: Apply fix or rollback
5. **Post-Incident**: Conduct review

#### Security Incident
1. **Assess Impact**: Determine scope
2. **Contain**: Isolate affected systems
3. **Investigate**: Analyze security logs
4. **Remediate**: Apply security patches
5. **Report**: Document incident

## Maintenance

### 1. Regular Maintenance
- **Daily**: Monitor dashboard review
- **Weekly**: Performance analysis
- **Monthly**: Security audit
- **Quarterly**: Architecture review

### 2. Updates
- **Dependencies**: Monthly security updates
- **Framework**: Quarterly major updates
- **Database**: Annual major updates
- **Infrastructure**: As needed

### 3. Capacity Planning
- **User Growth**: Monitor monthly
- **Database Size**: Track growth trends
- **Performance**: Analyze bottlenecks
- **Scaling**: Plan infrastructure changes

## Team Responsibilities

### 1. DevOps Team
- Infrastructure maintenance
- Deployment management
- Monitoring and alerting
- Security updates

### 2. Development Team
- Code quality
- Feature development
- Bug fixes
- Testing

### 3. Support Team
- User support
- Issue triage
- Documentation
- Training

## Contact Information
- **DevOps**: devops@i-ep.app
- **Development**: dev@i-ep.app
- **Support**: support@i-ep.app
- **Emergency**: emergency@i-ep.app

---

**Version**: 1.0
**Last Updated**: Sprint 12 - Final Testing & Deployment
**Next Review**: Post-deployment review