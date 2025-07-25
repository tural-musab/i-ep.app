/**
 * Demo Analytics System for demo.i-ep.app
 * Privacy-compliant tracking for demo usage, feature interactions, and conversion metrics
 */

export interface DemoSession {
  id: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  locale: string;
  country?: string;
  referrer?: string;
  userAgent: string;
  screenResolution: string;
  completed: boolean;
  conversionAction?: string;
}

export interface DemoEvent {
  sessionId: string;
  eventType: 'page_view' | 'feature_interaction' | 'conversion_attempt' | 'error' | 'completion';
  eventName: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  page: string;
  feature?: string;
  duration?: number;
}

export interface DemoMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  completionRate: number;
  conversionRate: number;
  popularFeatures: Array<{
    name: string;
    interactions: number;
    role: string;
  }>;
  geographicData: Array<{
    country: string;
    sessions: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    sessions: number;
    conversions: number;
  }>;
  roleDistribution: Array<{
    role: string;
    sessions: number;
    averageDuration: number;
  }>;
}

export class DemoAnalytics {
  private sessionId: string | null = null;
  private session: DemoSession | null = null;
  private events: DemoEvent[] = [];
  private config: DemoAnalyticsConfig;

  constructor(config: DemoAnalyticsConfig) {
    this.config = config;
    this.initializeSession();
  }

  /**
   * Initialize a new demo session
   */
  async initializeSession(): Promise<void> {
    // Only initialize if on demo domain
    if (!this.isDemoEnvironment()) {
      return;
    }

    try {
      // Generate anonymous session ID
      this.sessionId = this.generateSessionId();
      
      // Detect user role from URL or context
      const role = this.detectUserRole();
      
      // Get anonymous location data (GDPR compliant)
      const locationData = await this.getAnonymousLocationData();
      
      this.session = {
        id: this.sessionId,
        role,
        startTime: new Date(),
        locale: this.getLocale(),
        country: locationData?.country,
        referrer: this.sanitizeReferrer(),
        userAgent: this.sanitizeUserAgent(),
        screenResolution: this.getScreenResolution(),
        completed: false,
      };

      // Track session start
      await this.trackEvent({
        eventType: 'page_view',
        eventName: 'session_start',
        page: window.location.pathname,
        metadata: {
          isNewVisitor: this.isNewVisitor(),
          hasSeenPrivacyNotice: this.hasSeenPrivacyNotice(),
        },
      });

      // Set up session end tracking
      this.setupSessionEndTracking();
      
    } catch (error) {
      console.warn('Demo analytics initialization failed:', error);
    }
  }

  /**
   * Track a demo event
   */
  async trackEvent(event: Partial<DemoEvent>): Promise<void> {
    if (!this.sessionId || !this.session) {
      return;
    }

    const demoEvent: DemoEvent = {
      sessionId: this.sessionId,
      eventType: event.eventType || 'page_view',
      eventName: event.eventName || 'unknown',
      timestamp: new Date(),
      role: this.session.role,
      page: event.page || window.location.pathname,
      feature: event.feature,
      duration: event.duration,
      metadata: event.metadata || {},
    };

    this.events.push(demoEvent);

    // Send event to analytics endpoint
    if (this.config.realtimeTracking) {
      await this.sendEvent(demoEvent);
    }

    // Track in local storage for backup
    this.storeEventLocally(demoEvent);
  }

  /**
   * Track feature interaction
   */
  async trackFeatureInteraction(featureName: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'feature_interaction',
      eventName: 'feature_used',
      feature: featureName,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track page view
   */
  async trackPageView(page: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'page_view',
      eventName: 'page_viewed',
      page,
      metadata,
    });
  }

  /**
   * Track conversion attempt (trial signup, contact form, etc.)
   */
  async trackConversion(conversionType: string, successful: boolean, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'conversion_attempt',
      eventName: conversionType,
      metadata: {
        ...metadata,
        successful,
        timestamp: new Date().toISOString(),
      },
    });

    if (successful && this.session) {
      this.session.conversionAction = conversionType;
    }
  }

  /**
   * Track demo completion
   */
  async trackDemoCompletion(): Promise<void> {
    if (this.session) {
      this.session.completed = true;
      await this.trackEvent({
        eventType: 'completion',
        eventName: 'demo_completed',
        metadata: {
          totalEvents: this.events.length,
          sessionDuration: this.getSessionDuration(),
        },
      });
    }
  }

  /**
   * End current session
   */
  async endSession(): Promise<void> {
    if (!this.session) {
      return;
    }

    this.session.endTime = new Date();
    this.session.duration = this.getSessionDuration();

    await this.trackEvent({
      eventType: 'page_view',
      eventName: 'session_end',
      metadata: {
        sessionDuration: this.session.duration,
        totalEvents: this.events.length,
        completed: this.session.completed,
      },
    });

    // Send all pending events
    await this.flushEvents();
  }

  /**
   * Get current session metrics
   */
  getSessionMetrics(): Partial<DemoSession> {
    if (!this.session) {
      return {};
    }

    return {
      ...this.session,
      duration: this.getSessionDuration(),
    };
  }

  /**
   * Check if in demo environment
   */
  private isDemoEnvironment(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const hostname = window.location.hostname;
    return (
      hostname === 'demo.i-ep.app' ||
      hostname === 'demo.localhost' ||
      (hostname === 'localhost' && window.location.pathname.includes('/demo'))
    );
  }

  /**
   * Generate anonymous session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    return `demo_${timestamp}_${randomPart}`;
  }

  /**
   * Detect user role from URL or context
   */
  private detectUserRole(): 'admin' | 'teacher' | 'student' | 'parent' {
    const pathname = window.location.pathname;
    
    if (pathname.includes('/admin') || pathname.includes('/yonetici')) {
      return 'admin';
    } else if (pathname.includes('/teacher') || pathname.includes('/ogretmen')) {
      return 'teacher';
    } else if (pathname.includes('/parent') || pathname.includes('/veli')) {
      return 'parent';
    } else {
      return 'student'; // Default to student for general demo
    }
  }

  /**
   * Get anonymous location data (GDPR compliant)
   */
  private async getAnonymousLocationData(): Promise<{ country?: string } | null> {
    try {
      // Use Vercel's edge function for anonymous location detection
      const response = await fetch('/api/analytics/location', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Anonymous location detection failed:', error);
    }

    return null;
  }

  /**
   * Get locale information
   */
  private getLocale(): string {
    return navigator.language || 'tr-TR';
  }

  /**
   * Sanitize referrer (remove sensitive data)
   */
  private sanitizeReferrer(): string | undefined {
    const referrer = document.referrer;
    if (!referrer) return undefined;

    try {
      const url = new URL(referrer);
      // Only keep domain, remove query parameters and paths
      return url.hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Sanitize user agent (remove sensitive data)
   */
  private sanitizeUserAgent(): string {
    // Extract only browser and OS info, remove detailed version numbers
    const ua = navigator.userAgent;
    const browserMatch = ua.match(/(Firefox|Chrome|Safari|Edge|Opera)\/[\d.]+/);
    const osMatch = ua.match(/(Windows|Mac|Linux|iOS|Android)/);
    
    const browser = browserMatch ? browserMatch[1] : 'Unknown';
    const os = osMatch ? osMatch[1] : 'Unknown';
    
    return `${browser} on ${os}`;
  }

  /**
   * Get screen resolution (anonymized)
   */
  private getScreenResolution(): string {
    const width = screen.width;
    const height = screen.height;
    
    // Group into common categories to reduce fingerprinting
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    if (width <= 1440) return 'desktop';
    return 'large';
  }

  /**
   * Check if new visitor
   */
  private isNewVisitor(): boolean {
    return !localStorage.getItem('demo_visited_before');
  }

  /**
   * Check if user has seen privacy notice
   */
  private hasSeenPrivacyNotice(): boolean {
    return localStorage.getItem('demo_privacy_notice_seen') === 'true';
  }

  /**
   * Get current session duration
   */
  private getSessionDuration(): number {
    if (!this.session) return 0;
    const endTime = this.session.endTime || new Date();
    return endTime.getTime() - this.session.startTime.getTime();
  }

  /**
   * Setup session end tracking
   */
  private setupSessionEndTracking(): void {
    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.endSession();
      }
    });

    // Track session timeout (30 minutes of inactivity)
    let inactivityTimer: NodeJS.Timeout;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        this.endSession();
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, true);
    });

    resetInactivityTimer();
  }

  /**
   * Send event to analytics endpoint
   */
  private async sendEvent(event: DemoEvent): Promise<void> {
    try {
      await fetch('/api/analytics/demo-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Failed to send demo analytics event:', error);
    }
  }

  /**
   * Store event locally for backup
   */
  private storeEventLocally(event: DemoEvent): void {
    try {
      const stored = localStorage.getItem('demo_events') || '[]';
      const events = JSON.parse(stored);
      events.push(event);
      
      // Keep only last 100 events to prevent storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('demo_events', JSON.stringify(events));
      localStorage.setItem('demo_visited_before', 'true');
    } catch (error) {
      console.warn('Failed to store event locally:', error);
    }
  }

  /**
   * Send all pending events
   */
  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    try {
      await fetch('/api/analytics/demo-events/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          session: this.session,
          events: this.events,
        }),
      });

      this.events = [];
    } catch (error) {
      console.warn('Failed to flush demo analytics events:', error);
    }
  }
}

export interface DemoAnalyticsConfig {
  realtimeTracking: boolean;
  privacyCompliant: boolean;
  trackingDomain: string;
  enableGeolocation: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  sessionTimeoutMinutes: number;
}

export const defaultDemoAnalyticsConfig: DemoAnalyticsConfig = {
  realtimeTracking: true,
  privacyCompliant: true,
  trackingDomain: 'demo.i-ep.app',
  enableGeolocation: true,
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  sessionTimeoutMinutes: 30,
};

// Singleton instance for demo analytics
let demoAnalyticsInstance: DemoAnalytics | null = null;

export function initDemoAnalytics(config: Partial<DemoAnalyticsConfig> = {}): DemoAnalytics {
  if (!demoAnalyticsInstance) {
    const finalConfig = { ...defaultDemoAnalyticsConfig, ...config };
    demoAnalyticsInstance = new DemoAnalytics(finalConfig);
  }
  return demoAnalyticsInstance;
}

export function getDemoAnalytics(): DemoAnalytics | null {
  return demoAnalyticsInstance;
}