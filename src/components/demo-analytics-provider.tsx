/**
 * Demo Analytics Provider Component
 * Automatically initializes demo analytics tracking across the application
 */

'use client';

import React, { useEffect, createContext, useContext, ReactNode } from 'react';
import { initDemoAnalytics, getDemoAnalytics, DemoAnalytics } from '@/lib/analytics/demo-analytics';
import { useDemoAnalytics } from '@/lib/analytics/use-demo-analytics';

interface DemoAnalyticsContextType {
  analytics: DemoAnalytics | null;
  trackFeature: (featureName: string, metadata?: Record<string, any>) => void;
  trackPage: (page: string, metadata?: Record<string, any>) => void;
  trackConversion: (conversionType: string, successful: boolean, metadata?: Record<string, any>) => void;
  trackEvent: (eventName: string, eventType?: 'page_view' | 'feature_interaction' | 'conversion_attempt' | 'error' | 'completion', metadata?: Record<string, any>) => void;
  trackDemoCompletion: () => void;
}

const DemoAnalyticsContext = createContext<DemoAnalyticsContextType | null>(null);

export function useDemoAnalyticsContext(): DemoAnalyticsContextType {
  const context = useContext(DemoAnalyticsContext);
  if (!context) {
    throw new Error('useDemoAnalyticsContext must be used within a DemoAnalyticsProvider');
  }
  return context;
}

interface DemoAnalyticsProviderProps {
  children: ReactNode;
  enabled?: boolean;
  config?: {
    realtimeTracking?: boolean;
    trackPageViews?: boolean;
    trackErrors?: boolean;
    enablePerformanceTracking?: boolean;
  };
}

export default function DemoAnalyticsProvider({
  children,
  enabled = true,
  config = {},
}: DemoAnalyticsProviderProps) {
  const {
    trackFeature,
    trackPage,
    trackConversion,
    trackEvent,
    trackDemoCompletion,
    analytics,
  } = useDemoAnalytics({
    trackPageView: config.trackPageViews !== false,
    enableErrorTracking: config.trackErrors !== false,
  });

  useEffect(() => {
    // Only initialize if enabled and in demo environment
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const hostname = window.location.hostname;
    const isDemoEnv = (
      hostname === 'demo.i-ep.app' ||
      hostname === 'demo.localhost' ||
      (hostname === 'localhost' && window.location.pathname.includes('/demo'))
    );

    if (!isDemoEnv) {
      return;
    }

    // Initialize analytics with provided config
    initDemoAnalytics({
      realtimeTracking: config.realtimeTracking !== false,
      privacyCompliant: true,
      trackingDomain: hostname,
      enableGeolocation: true,
      enablePerformanceTracking: config.enablePerformanceTracking !== false,
      enableErrorTracking: config.trackErrors !== false,
      sessionTimeoutMinutes: 30,
    });

    // Track initial page load
    trackPage(window.location.pathname, {
      title: document.title,
      referrer: document.referrer || undefined,
      initialLoad: true,
    });

    // Set up visibility change tracking
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackEvent('page_hidden', 'page_view', {
          hiddenAt: new Date().toISOString(),
        });
      } else {
        trackEvent('page_visible', 'page_view', {
          visibleAt: new Date().toISOString(),
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up beforeunload tracking
    const handleBeforeUnload = () => {
      const analytics = getDemoAnalytics();
      if (analytics) {
        analytics.endSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, config, trackPage, trackEvent]);

  // Provide context value
  const contextValue: DemoAnalyticsContextType = {
    analytics,
    trackFeature,
    trackPage,
    trackConversion,
    trackEvent,
    trackDemoCompletion,
  };

  return (
    <DemoAnalyticsContext.Provider value={contextValue}>
      {children}
      {enabled && <PrivacyBanner />}
    </DemoAnalyticsContext.Provider>
  );
}

/**
 * Privacy-compliant banner for demo analytics
 */
function PrivacyBanner() {
  const [showBanner, setShowBanner] = React.useState(false);

  useEffect(() => {
    // Only show if user hasn't seen it before
    const hasSeenBanner = localStorage.getItem('demo_privacy_notice_seen');
    if (!hasSeenBanner) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('demo_privacy_notice_seen', 'true');
    setShowBanner(false);
    
    // Track privacy consent
    const { trackEvent } = useDemoAnalyticsContext();
    trackEvent('privacy_consent_given', 'feature_interaction', {
      consentTimestamp: new Date().toISOString(),
    });
  };

  const handleDecline = () => {
    localStorage.setItem('demo_privacy_notice_seen', 'declined');
    setShowBanner(false);
    
    // Disable analytics tracking
    const analytics = getDemoAnalytics();
    if (analytics) {
      analytics.endSession();
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            Demo Kullanım Analizi
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Demo deneyiminizi geliştirmek için anonim kullanım verilerini topluyoruz. 
            Kişisel bilgilerinizi saklamıyoruz ve verileriniz KVKK/GDPR uyumlu olarak işlenmektedir.
          </p>
        </div>
        
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Reddet
          </button>
          <button
            onClick={handleAccept}
            className="bg-blue-600 text-white text-xs px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for tracking specific demo features easily
 */
export function useDemoFeatureTracking(featureName: string) {
  const { trackFeature, trackEvent } = useDemoAnalyticsContext();

  const trackFeatureView = React.useCallback((metadata?: Record<string, any>) => {
    trackFeature(`${featureName}_viewed`, metadata);
  }, [featureName, trackFeature]);

  const trackFeatureInteraction = React.useCallback((action: string, metadata?: Record<string, any>) => {
    trackFeature(`${featureName}_${action}`, metadata);
  }, [featureName, trackFeature]);

  const trackFeatureCompletion = React.useCallback((metadata?: Record<string, any>) => {
    trackFeature(`${featureName}_completed`, metadata);
  }, [featureName, trackFeature]);

  const trackFeatureError = React.useCallback((error: string, metadata?: Record<string, any>) => {
    trackEvent(`${featureName}_error`, 'error', {
      error,
      ...metadata,
    });
  }, [featureName, trackEvent]);

  return {
    trackFeatureView,
    trackFeatureInteraction,
    trackFeatureCompletion,
    trackFeatureError,
  };
}

/**
 * Higher-order component for automatic feature tracking
 */
export function withDemoFeatureTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureName: string,
  options: {
    trackMount?: boolean;
    trackUnmount?: boolean;
    trackProps?: boolean;
    trackInteractions?: boolean;
  } = {}
) {
  const {
    trackMount = true,
    trackUnmount = false,
    trackProps = false,
    trackInteractions = true,
  } = options;

  return function TrackedComponent(props: P) {
    const { trackFeature, trackEvent } = useDemoAnalyticsContext();
    const mounted = React.useRef(false);
    const interactionCount = React.useRef(0);

    React.useEffect(() => {
      if (!mounted.current) {
        mounted.current = true;

        if (trackMount) {
          trackFeature(`${featureName}_mounted`);
        }

        return () => {
          if (trackUnmount) {
            trackEvent(`${featureName}_unmounted`, 'feature_interaction', {
              interactionCount: interactionCount.current,
              sessionDuration: Date.now() - performance.now(),
            });
          }
        };
      }
    }, [trackFeature, trackEvent]);

    React.useEffect(() => {
      if (mounted.current && trackProps) {
        trackEvent(`${featureName}_props_updated`, 'feature_interaction', {
          propsCount: Object.keys(props as object).length,
        });
      }
    }, [props, trackEvent]);

    // Wrap component with interaction tracking
    const wrappedProps = React.useMemo(() => {
      if (!trackInteractions) {
        return props;
      }

      const wrapped = { ...props } as any;

      // Track common interaction props
      const interactionProps = ['onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur'];
      
      interactionProps.forEach((propName) => {
        if (wrapped[propName]) {
          const originalHandler = wrapped[propName];
          wrapped[propName] = (...args: any[]) => {
            interactionCount.current++;
            trackEvent(`${featureName}_${propName.toLowerCase()}`, 'feature_interaction', {
              interactionCount: interactionCount.current,
            });
            return originalHandler(...args);
          };
        }
      });

      return wrapped;
    }, [props, trackEvent]);

    return <WrappedComponent {...wrappedProps} />;
  };
}