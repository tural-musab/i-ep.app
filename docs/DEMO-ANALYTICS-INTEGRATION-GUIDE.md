# Demo Analytics Integration Guide

> **Comprehensive demo analytics and tracking system for demo.i-ep.app**
> 
> **Created**: 22 Temmuz 2025  
> **Purpose**: Privacy-compliant demo usage analytics with Turkish education context  
> **Status**: Production-ready implementation  

## 🎯 Overview

This guide provides complete implementation details for the demo analytics system that tracks demo.i-ep.app usage, feature interactions, and conversion metrics while maintaining GDPR/KVKK compliance.

## 🏗️ Architecture

```
Demo Analytics System Architecture:
├── Client-Side Tracking
│   ├── /src/lib/analytics/demo-analytics.ts          # Core analytics engine
│   ├── /src/lib/analytics/use-demo-analytics.ts      # React hooks
│   └── /src/components/demo-analytics-provider.tsx   # Provider component
├── API Endpoints
│   ├── /src/app/api/analytics/demo-events/route.ts   # Single event tracking
│   ├── /src/app/api/analytics/demo-events/batch/route.ts  # Batch event processing
│   ├── /src/app/api/analytics/location/route.ts      # Anonymous location detection
│   └── /src/app/api/analytics/demo-dashboard/route.ts  # Dashboard data API
├── Database Schema
│   └── /supabase/migrations/20250722000000_create_demo_analytics_system.sql
├── Dashboard UI
│   └── /src/components/demo-analytics-dashboard.tsx  # Admin dashboard
└── Utilities
    └── /src/lib/rate-limit.ts                       # Rate limiting for APIs
```

## 🚀 Quick Start

### 1. Database Setup

Deploy the analytics database schema:

```bash
# Apply the migration
npx supabase db push

# Verify tables created
npx supabase db pull
```

### 2. Environment Variables

Add to your `.env.local`:

```env
# Demo Analytics Configuration
NEXT_PUBLIC_DEMO_ANALYTICS_ENABLED=true
NEXT_PUBLIC_DEMO_DOMAIN=demo.i-ep.app

# Rate Limiting (if not already configured)
UPSTASH_REDIS_URL=your-redis-url
UPSTASH_REDIS_TOKEN=your-redis-token
```

### 3. App Integration

Wrap your demo application with the analytics provider:

```tsx
// src/app/demo/layout.tsx or src/app/layout.tsx
import DemoAnalyticsProvider from '@/components/demo-analytics-provider';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoAnalyticsProvider
      enabled={process.env.NEXT_PUBLIC_DEMO_ANALYTICS_ENABLED === 'true'}
      config={{
        realtimeTracking: true,
        trackPageViews: true,
        trackErrors: true,
        enablePerformanceTracking: true,
      }}
    >
      {children}
    </DemoAnalyticsProvider>
  );
}
```

### 4. Component Tracking

Track features in your components:

```tsx
// Automatic tracking with hooks
import { useDemoFeatureTracking } from '@/components/demo-analytics-provider';

function AssignmentDashboard() {
  const { trackFeatureView, trackFeatureInteraction } = useDemoFeatureTracking('assignment_dashboard');

  useEffect(() => {
    trackFeatureView({ loadTime: performance.now() });
  }, []);

  const handleCreateAssignment = () => {
    trackFeatureInteraction('create_assignment_clicked');
    // ... your logic
  };

  return (
    <div>
      <button onClick={handleCreateAssignment}>
        Create Assignment
      </button>
    </div>
  );
}
```

### 5. Admin Dashboard

Add the analytics dashboard to your admin panel:

```tsx
// src/app/admin/analytics/page.tsx
import DemoAnalyticsDashboard from '@/components/demo-analytics-dashboard';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <DemoAnalyticsDashboard />
    </div>
  );
}
```

## 📊 Tracked Metrics

### Session Metrics
- **Session Duration**: Time spent in demo
- **Completion Rate**: % of users who complete full demo
- **Role Distribution**: Usage by admin/teacher/student/parent roles
- **Geographic Data**: Country-level usage (privacy-compliant)

### Feature Interactions
- **Feature Usage**: Which features are most popular by role
- **Click Tracking**: Button and navigation interactions
- **Form Analytics**: Form completion and abandonment rates
- **Error Tracking**: JavaScript errors and API failures

### Conversion Metrics
- **Trial Signups**: Demo to trial conversion rate
- **Contact Form**: Demo to contact form completion
- **Feature Interest**: Which features drive conversions
- **Funnel Analysis**: User journey through demo flow

### Performance Metrics
- **Page Load Times**: Average load performance
- **API Response Times**: Backend performance monitoring
- **First Contentful Paint**: Frontend rendering performance
- **Time to Interactive**: User experience quality

## 🔒 Privacy Compliance

### GDPR/KVKK Compliance Features

1. **Anonymous Tracking**: No PII collection
2. **IP Anonymization**: Last octet removed from IPv4, last 80 bits from IPv6
3. **User Agent Sanitization**: Only browser and OS info retained
4. **Consent Management**: Privacy banner with opt-in/opt-out
5. **Data Retention**: Automatic cleanup after 90 days
6. **Right to Erasure**: Session-based data, no persistent user tracking

### Data Collected

```typescript
// Session Data (anonymous)
{
  sessionId: "demo_1234567890_xyz", // Generated, not linked to user
  role: "teacher",                   // Demo role selection
  duration: 180000,                  // Session length in ms
  locale: "tr-TR",                   // Browser locale
  country: "TR",                     // Country code only
  screenResolution: "desktop",       // Categorized (mobile/tablet/desktop)
  completed: true,                   // Demo completion status
  conversionAction: "trial_signup"   // Conversion type if any
}

// Event Data (anonymous)
{
  eventType: "feature_interaction",  // Event category
  eventName: "assignment_created",   // Specific event
  feature: "assignment_dashboard",   // Feature identifier
  page: "/demo/teacher/assignments", // Page path
  metadata: {                        // Additional context
    loadTime: 1200,
    featureUsed: "drag_drop_upload"
  }
}
```

## 🛠️ API Reference

### POST /api/analytics/demo-events

Track a single demo event:

```typescript
// Request
{
  sessionId: string;
  eventType: 'page_view' | 'feature_interaction' | 'conversion_attempt' | 'error' | 'completion';
  eventName: string;
  timestamp: string; // ISO datetime
  role: 'admin' | 'teacher' | 'student' | 'parent';
  page: string;
  feature?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

// Response
{
  success: boolean;
}
```

### POST /api/analytics/demo-events/batch

Track multiple events and session data:

```typescript
// Request
{
  sessionId: string;
  session: DemoSession;
  events: DemoEvent[];
}

// Response
{
  success: boolean;
  sessionId: string;
  eventsProcessed: number;
}
```

### GET /api/analytics/demo-dashboard

Get dashboard analytics (admin only):

```typescript
// Query Parameters
?period=7d&startDate=2025-07-15&endDate=2025-07-22&timezone=Europe/Istanbul

// Response
{
  overview: OverviewMetrics;
  roleDistribution: RoleStats[];
  geographic: GeographicStats[];
  features: FeatureUsageStats[];
  timeSeries: TimeSeriesData[];
  conversion: ConversionFunnelData[];
  performance: PerformanceMetrics;
  realtime: RealtimeData;
  metadata: MetadataInfo;
}
```

### GET /api/analytics/location

Get anonymous location data:

```typescript
// Response
{
  country: string;        // Country code (e.g., "TR")
  timezone: string;       // Timezone (e.g., "Europe/Istanbul")
  isEU: boolean;         // GDPR compliance flag
  continent: string;      // Continent name
}
```

## 🎛️ Configuration Options

### Analytics Provider Configuration

```typescript
interface DemoAnalyticsConfig {
  realtimeTracking: boolean;        // Send events immediately
  privacyCompliant: boolean;        // Enable privacy features
  trackingDomain: string;           // Allowed tracking domain
  enableGeolocation: boolean;       // Anonymous location tracking
  enablePerformanceTracking: boolean; // Performance metrics
  enableErrorTracking: boolean;     // Error event tracking
  sessionTimeoutMinutes: number;    // Session timeout (default: 30)
}
```

### Rate Limiting Configuration

```typescript
// Customizable rate limits for different endpoints
const rateLimits = {
  demoEvents: { windowMs: 60000, maxRequests: 100 },    // 100 events/min
  demoBatch: { windowMs: 60000, maxRequests: 10 },      // 10 batch/min
  demoLocation: { windowMs: 60000, maxRequests: 60 },   // 60 location/min
  demoDashboard: { windowMs: 60000, maxRequests: 30 },  // 30 dashboard/min
};
```

## 🧪 Testing

### Unit Testing

Test analytics tracking:

```typescript
import { DemoAnalytics } from '@/lib/analytics/demo-analytics';

describe('Demo Analytics', () => {
  it('should track feature interactions', async () => {
    const analytics = new DemoAnalytics(testConfig);
    await analytics.trackFeatureInteraction('test_feature', { key: 'value' });
    // Assert event was tracked
  });

  it('should handle privacy compliance', () => {
    // Test IP anonymization, consent management, etc.
  });
});
```

### Integration Testing

Test API endpoints:

```bash
# Test event tracking
curl -X POST http://localhost:3000/api/analytics/demo-events \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","eventType":"feature_interaction","eventName":"test",...}'

# Test dashboard API
curl -X GET "http://localhost:3000/api/analytics/demo-dashboard?period=7d" \
  -H "Authorization: Bearer <admin-token>"
```

### End-to-End Testing

Use Playwright for demo flow testing:

```typescript
// tests/demo-analytics.spec.ts
import { test, expect } from '@playwright/test';

test('demo analytics tracking', async ({ page }) => {
  await page.goto('/demo');
  
  // Accept privacy consent
  await page.click('[data-testid="privacy-accept"]');
  
  // Navigate through demo
  await page.click('[data-testid="teacher-role"]');
  await page.click('[data-testid="assignment-feature"]');
  
  // Verify analytics events were sent
  const analyticsRequests = page.waitForRequest(req => 
    req.url().includes('/api/analytics/demo-events')
  );
  
  expect(analyticsRequests).toBeTruthy();
});
```

## 📈 Dashboard Features

### Real-time Metrics
- **Active Sessions**: Currently active demo users
- **Live Events**: Events in the last hour
- **Active Roles**: Which roles are currently being demoed

### Overview Analytics
- **Total Sessions**: All demo sessions in period
- **Average Duration**: Mean session length
- **Completion Rate**: % of completed demos
- **Conversion Rate**: % of demos leading to conversions

### Role Analysis
- **Usage by Role**: Admin, teacher, student, parent breakdown
- **Role Performance**: Average duration and completion by role
- **Popular Features**: Most used features by each role

### Geographic Insights
- **Country Distribution**: Where demos are being accessed
- **Geographic Trends**: Usage patterns by region
- **Market Analysis**: Potential market insights from usage

### Feature Analytics
- **Feature Popularity**: Most interacted features
- **User Journey**: Common paths through demo
- **Abandonment Points**: Where users typically leave
- **Conversion Features**: Features that lead to conversions

### Performance Monitoring
- **Load Times**: Page and API performance metrics
- **Error Rates**: JavaScript and API error tracking
- **User Experience**: Core web vitals and performance scores

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Database migration applied
- [ ] Environment variables configured
- [ ] Rate limiting configured
- [ ] Privacy banner implemented
- [ ] Analytics provider integrated
- [ ] Admin dashboard accessible
- [ ] Error tracking enabled

### Monitoring

Set up monitoring for:
- API response times
- Error rates
- Analytics data ingestion
- Privacy compliance
- Database performance

### Maintenance

Regular tasks:
- Review privacy compliance
- Clean up old analytics data
- Monitor performance metrics
- Update tracking as features change
- Analyze demo effectiveness

## 🔧 Advanced Usage

### Custom Event Tracking

```typescript
// Track custom business events
const { trackEvent } = useDemoAnalyticsContext();

trackEvent('assignment_template_selected', 'feature_interaction', {
  templateType: 'mathematics',
  gradeLevel: '6th',
  complexity: 'advanced'
});
```

### Performance Monitoring

```typescript
// Track custom performance metrics
const { trackCustomPerformance } = useDemoPerformanceTracking();

trackCustomPerformance('api_response_time', responseTime, {
  endpoint: '/api/assignments',
  method: 'POST',
  status: 'success'
});
```

### Conversion Tracking

```typescript
// Track conversion attempts
const { trackConversion } = useDemoAnalyticsContext();

// Successful trial signup
trackConversion('trial_signup', true, {
  source: 'assignment_demo',
  plan: 'basic',
  coupon: 'DEMO2025'
});

// Failed conversion attempt
trackConversion('contact_form', false, {
  errorReason: 'invalid_email',
  retryAttempts: 2
});
```

## 📋 Troubleshooting

### Common Issues

1. **Events not being tracked**
   - Check if demo domain is correct
   - Verify privacy consent was given
   - Check browser console for errors

2. **Dashboard not loading**
   - Verify admin authentication
   - Check database connections
   - Review API rate limits

3. **Performance issues**
   - Monitor Redis connection
   - Check database query performance
   - Review rate limiting settings

### Debug Mode

Enable debug logging:

```typescript
// Enable in development
const analytics = initDemoAnalytics({
  debug: process.env.NODE_ENV === 'development',
});
```

## 🎯 Success Metrics

Track these KPIs to measure demo effectiveness:

### Engagement Metrics
- **Session Duration**: Target > 3 minutes average
- **Feature Interaction Rate**: Target > 5 interactions per session
- **Completion Rate**: Target > 60%
- **Return Visit Rate**: Users coming back to demo

### Conversion Metrics
- **Demo to Trial**: Target > 15% conversion rate
- **Demo to Contact**: Target > 5% contact form completion
- **Feature Interest**: Which features drive most conversions
- **Time to Conversion**: How long from demo to signup

### Quality Metrics
- **Error Rate**: Target < 1% of sessions
- **Performance**: Target < 2s average load time
- **Bounce Rate**: Target < 30% single-page sessions
- **User Satisfaction**: Inferred from completion and interaction rates

---

## 🎉 Implementation Complete!

The demo analytics system is now fully implemented with:

✅ **Privacy-Compliant Tracking**: GDPR/KVKK compliant anonymous analytics  
✅ **Comprehensive Metrics**: Session, feature, conversion, and performance tracking  
✅ **Real-time Dashboard**: Admin analytics dashboard with rich visualizations  
✅ **Multi-Role Support**: Tracking for admin, teacher, student, and parent roles  
✅ **Turkish Education Context**: Designed for Turkish school management demos  
✅ **Production Ready**: Rate limiting, error handling, and monitoring included  

The system provides actionable insights into demo usage while respecting user privacy and maintaining compliance with data protection regulations.