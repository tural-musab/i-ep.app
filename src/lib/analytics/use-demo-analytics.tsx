/**
 * React Hook for Demo Analytics
 * Easy integration with React components for demo tracking
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { DemoAnalytics, initDemoAnalytics, getDemoAnalytics } from './demo-analytics';

export interface UseDemoAnalyticsOptions {
  trackPageView?: boolean;
  autoTrackComponents?: boolean;
  enableErrorTracking?: boolean;
}

export function useDemoAnalytics(options: UseDemoAnalyticsOptions = {}) {
  const {
    trackPageView = true,
    autoTrackComponents = true,
    enableErrorTracking = true,
  } = options;

  const analytics = useRef<DemoAnalytics | null>(null);
  const currentPage = useRef<string>('');

  useEffect(() => {
    // Initialize analytics if not already done
    if (!analytics.current) {
      analytics.current = initDemoAnalytics();
    }

    // Track page view on mount if enabled
    if (trackPageView && typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (currentPage.current !== pathname) {
        currentPage.current = pathname;
        analytics.current?.trackPageView(pathname, {
          title: document.title,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Setup error tracking if enabled
    if (enableErrorTracking) {
      const handleError = (event: ErrorEvent) => {
        analytics.current?.trackEvent({
          eventType: 'error',
          eventName: 'javascript_error',
          metadata: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
          },
        });
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        analytics.current?.trackEvent({
          eventType: 'error',
          eventName: 'unhandled_promise_rejection',
          metadata: {
            reason: event.reason?.toString(),
          },
        });
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, [trackPageView, enableErrorTracking]);

  // Track feature interaction
  const trackFeature = useCallback((featureName: string, metadata?: Record<string, any>) => {
    analytics.current?.trackFeatureInteraction(featureName, metadata);
  }, []);

  // Track page view manually
  const trackPage = useCallback((page: string, metadata?: Record<string, any>) => {
    analytics.current?.trackPageView(page, metadata);
  }, []);

  // Track conversion
  const trackConversion = useCallback((conversionType: string, successful: boolean, metadata?: Record<string, any>) => {
    analytics.current?.trackConversion(conversionType, successful, metadata);
  }, []);

  // Track custom event
  const trackEvent = useCallback((eventName: string, eventType: 'page_view' | 'feature_interaction' | 'conversion_attempt' | 'error' | 'completion' = 'feature_interaction', metadata?: Record<string, any>) => {
    analytics.current?.trackEvent({
      eventType,
      eventName,
      metadata,
    });
  }, []);

  // Track demo completion
  const trackDemoCompletion = useCallback(() => {
    analytics.current?.trackDemoCompletion();
  }, []);

  // Get current session metrics
  const getSessionMetrics = useCallback(() => {
    return analytics.current?.getSessionMetrics() || {};
  }, []);

  return {
    trackFeature,
    trackPage,
    trackConversion,
    trackEvent,
    trackDemoCompletion,
    getSessionMetrics,
    analytics: analytics.current,
  };
}

/**
 * Component wrapper for automatic feature tracking
 */
export function withDemoTracking<T extends React.ComponentType<any>>(
  Component: T,
  featureName: string,
  trackingOptions?: {
    trackMount?: boolean;
    trackUnmount?: boolean;
    trackProps?: boolean;
  }
): T {
  const TrackedComponent = (props: React.ComponentProps<T>) => {
    const { trackFeature, trackEvent } = useDemoAnalytics();
    const mounted = useRef(false);

    useEffect(() => {
      if (!mounted.current) {
        mounted.current = true;

        // Track component mount
        if (trackingOptions?.trackMount !== false) {
          trackFeature(`${featureName}_viewed`);
        }

        return () => {
          // Track component unmount
          if (trackingOptions?.trackUnmount) {
            trackEvent(`${featureName}_closed`);
          }
        };
      }
    }, [trackFeature, trackEvent]);

    // Track prop changes
    useEffect(() => {
      if (mounted.current && trackingOptions?.trackProps) {
        trackEvent(`${featureName}_props_changed`, 'feature_interaction', {
          propsKeys: Object.keys(props),
        });
      }
    }, [props, trackEvent]);

    return <Component {...props} />;
  };

  // Preserve display name
  TrackedComponent.displayName = `withDemoTracking(${Component.displayName || Component.name})`;

  return TrackedComponent as T;
}

/**
 * Hook for tracking form interactions
 */
export function useDemoFormTracking(formName: string) {
  const { trackFeature, trackEvent } = useDemoAnalytics();

  const trackFormStart = useCallback(() => {
    trackFeature(`${formName}_started`);
  }, [formName, trackFeature]);

  const trackFieldFocus = useCallback((fieldName: string) => {
    trackEvent(`${formName}_field_focused`, 'feature_interaction', {
      fieldName,
    });
  }, [formName, trackEvent]);

  const trackFieldBlur = useCallback((fieldName: string, hasValue: boolean) => {
    trackEvent(`${formName}_field_completed`, 'feature_interaction', {
      fieldName,
      hasValue,
    });
  }, [formName, trackEvent]);

  const trackFormSubmit = useCallback((successful: boolean, errors?: string[]) => {
    trackEvent(`${formName}_submitted`, successful ? 'conversion_attempt' : 'feature_interaction', {
      successful,
      errors,
    });
  }, [formName, trackEvent]);

  const trackFormAbandon = useCallback((completedFields: number, totalFields: number) => {
    trackEvent(`${formName}_abandoned`, 'feature_interaction', {
      completedFields,
      totalFields,
      completionRate: completedFields / totalFields,
    });
  }, [formName, trackEvent]);

  return {
    trackFormStart,
    trackFieldFocus,
    trackFieldBlur,
    trackFormSubmit,
    trackFormAbandon,
  };
}

/**
 * Hook for tracking user journey through demo
 */
export function useDemoJourneyTracking() {
  const { trackEvent, trackDemoCompletion } = useDemoAnalytics();
  const journey = useRef<string[]>([]);

  const trackJourneyStep = useCallback((stepName: string, metadata?: Record<string, any>) => {
    journey.current.push(stepName);
    
    trackEvent(`journey_step_${stepName}`, 'feature_interaction', {
      ...metadata,
      stepNumber: journey.current.length,
      journeyPath: journey.current.join(' -> '),
    });
  }, [trackEvent]);

  const trackJourneyCompletion = useCallback((completionType: 'full' | 'partial' = 'full') => {
    trackDemoCompletion();
    
    trackEvent('journey_completed', 'completion', {
      completionType,
      totalSteps: journey.current.length,
      journeyPath: journey.current.join(' -> '),
    });
  }, [trackEvent, trackDemoCompletion]);

  const getCurrentJourney = useCallback(() => {
    return [...journey.current];
  }, []);

  return {
    trackJourneyStep,
    trackJourneyCompletion,
    getCurrentJourney,
  };
}

/**
 * Hook for tracking performance metrics
 */
export function useDemoPerformanceTracking() {
  const { trackEvent } = useDemoAnalytics();

  useEffect(() => {
    // Track page load performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      const trackPerformance = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          trackEvent('page_performance', 'page_view', {
            loadTime: navigation.loadEventEnd - navigation.navigationStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
            timeToInteractive: navigation.domInteractive - navigation.navigationStart,
          });
        }
      };

      // Wait for page to fully load
      if (document.readyState === 'complete') {
        setTimeout(trackPerformance, 100);
      } else {
        window.addEventListener('load', () => {
          setTimeout(trackPerformance, 100);
        });
      }
    }
  }, [trackEvent]);

  const trackCustomPerformance = useCallback((metricName: string, value: number, metadata?: Record<string, any>) => {
    trackEvent(`performance_${metricName}`, 'feature_interaction', {
      value,
      ...metadata,
    });
  }, [trackEvent]);

  return {
    trackCustomPerformance,
  };
}