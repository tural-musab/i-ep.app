/**
 * Feature Gating Middleware
 * Sprint 1: Payment Integration Foundation
 *
 * Handles subscription-based feature access control
 * Integrates with subscription service to check plan limits and feature availability
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('feature-gating');

// ==========================================
// FEATURE GATING CONFIGURATION
// ==========================================

// Define routes that require specific features
export const FEATURE_PROTECTED_ROUTES: Record<string, string> = {
  '/dashboard/messaging': 'messaging',
  '/dashboard/reports/advanced': 'advanced_reports',
  '/dashboard/api': 'api_access',
  '/dashboard/custom-domain': 'custom_domain',
  '/dashboard/analytics': 'analytics',
  '/dashboard/integrations': 'integrations',
  '/dashboard/bulk-operations': 'bulk_operations',
  '/dashboard/white-label': 'white_label',
};

// Define resource limits
export const RESOURCE_PROTECTED_ROUTES: Record<string, { resource: string; action: string }> = {
  '/dashboard/students/create': { resource: 'students', action: 'create' },
  '/dashboard/teachers/create': { resource: 'teachers', action: 'create' },
  '/dashboard/classes/create': { resource: 'classes', action: 'create' },
};

// Free plan restrictions
export const FREE_PLAN_BLOCKED_ROUTES = [
  '/dashboard/messaging',
  '/dashboard/reports/advanced',
  '/dashboard/api',
  '/dashboard/custom-domain',
  '/dashboard/analytics',
  '/dashboard/integrations',
  '/dashboard/bulk-operations',
  '/dashboard/white-label',
];

// ==========================================
// FEATURE GATING TYPES
// ==========================================

export interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
  redirectTo?: string;
  upgradeRequired?: boolean;
  plan?: string;
  feature?: string;
}

export interface ResourceLimitResult {
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  limit?: number | null;
  resource?: string;
}

// ==========================================
// FEATURE ACCESS CHECKING
// ==========================================

/**
 * Check if tenant can access a feature-protected route
 */
export async function checkFeatureAccess(
  tenantId: string,
  pathname: string,
  request: NextRequest
): Promise<FeatureAccessResult> {
  try {
    // Check if route requires a specific feature
    const requiredFeature = FEATURE_PROTECTED_ROUTES[pathname];

    if (!requiredFeature) {
      // Route doesn't require special feature, allow access
      return { allowed: true };
    }

    // Get tenant's current subscription using database function
    const supabase = createServerSupabaseClient();

    // Use the database function to check feature access
    const { data: canUse, error } = await supabase.rpc('can_use_feature', {
      tenant_uuid: tenantId,
      feature_name: requiredFeature,
    });

    if (error) {
      logger.error('Failed to check feature access', {
        tenantId,
        feature: requiredFeature,
        pathname,
        error: error.message,
      });

      // On error, deny access for security
      return {
        allowed: false,
        reason: 'Unable to verify feature access',
        redirectTo: '/dashboard/billing',
      };
    }

    if (!canUse) {
      logger.info('Feature access denied', {
        tenantId,
        feature: requiredFeature,
        pathname,
      });

      return {
        allowed: false,
        reason: `Feature '${requiredFeature}' not available in your current plan`,
        redirectTo: '/dashboard/billing',
        upgradeRequired: true,
        feature: requiredFeature,
      };
    }

    logger.debug('Feature access granted', {
      tenantId,
      feature: requiredFeature,
      pathname,
    });

    return { allowed: true };
  } catch (error) {
    logger.error('Error checking feature access', {
      tenantId,
      pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // On error, deny access for security
    return {
      allowed: false,
      reason: 'Feature access check failed',
      redirectTo: '/dashboard',
    };
  }
}

/**
 * Check if tenant can perform resource creation (students, teachers, classes)
 */
export async function checkResourceLimit(
  tenantId: string,
  resourceType: 'students' | 'teachers' | 'classes',
  request: NextRequest
): Promise<ResourceLimitResult> {
  try {
    const supabase = createServerSupabaseClient();

    // Get current resource count
    let currentCount = 0;
    let tableName = '';

    switch (resourceType) {
      case 'students':
        tableName = 'students';
        break;
      case 'teachers':
        tableName = 'teachers';
        break;
      case 'classes':
        tableName = 'classes';
        break;
    }

    // Count current resources for this tenant
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('id', { count: 'exact' })
      .eq('tenant_id', tenantId);

    if (countError) {
      logger.error('Failed to count resources', {
        tenantId,
        resourceType,
        error: countError.message,
      });

      return {
        allowed: false,
        reason: 'Unable to verify resource limits',
      };
    }

    currentCount = count || 0;

    // Get tenant's subscription and plan limits
    const { data: subscription, error: subError } = await supabase
      .from('tenant_subscriptions')
      .select(
        `
        *,
        plan:subscription_plans(*)
      `
      )
      .eq('tenant_id', tenantId)
      .in('status', ['trial', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError) {
      logger.error('Failed to get subscription for resource check', {
        tenantId,
        resourceType,
        error: subError.message,
      });

      return {
        allowed: false,
        reason: 'Unable to verify subscription',
      };
    }

    if (!subscription || !subscription.plan) {
      return {
        allowed: false,
        reason: 'No active subscription found',
        currentCount,
      };
    }

    // Check resource limits
    let limit: number | null = null;

    switch (resourceType) {
      case 'students':
        limit = subscription.plan.max_students;
        break;
      case 'teachers':
        limit = subscription.plan.max_teachers;
        break;
      case 'classes':
        limit = subscription.plan.max_classes;
        break;
    }

    // If limit is null, it means unlimited
    if (limit === null) {
      logger.debug('Resource access granted (unlimited)', {
        tenantId,
        resourceType,
        currentCount,
        limit: 'unlimited',
      });

      return {
        allowed: true,
        currentCount,
        limit: null,
        resource: resourceType,
      };
    }

    // Check if within limits
    if (currentCount >= limit) {
      logger.info('Resource limit exceeded', {
        tenantId,
        resourceType,
        currentCount,
        limit,
      });

      return {
        allowed: false,
        reason: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} limit exceeded (${currentCount}/${limit})`,
        currentCount,
        limit,
        resource: resourceType,
      };
    }

    logger.debug('Resource access granted', {
      tenantId,
      resourceType,
      currentCount,
      limit,
    });

    return {
      allowed: true,
      currentCount,
      limit,
      resource: resourceType,
    };
  } catch (error) {
    logger.error('Error checking resource limits', {
      tenantId,
      resourceType,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      allowed: false,
      reason: 'Resource limit check failed',
    };
  }
}

/**
 * Check if user is on free plan and trying to access premium features
 */
export async function checkFreePlanRestrictions(
  tenantId: string,
  pathname: string
): Promise<FeatureAccessResult> {
  try {
    // Check if route is blocked for free plan
    if (!FREE_PLAN_BLOCKED_ROUTES.includes(pathname)) {
      return { allowed: true };
    }

    const supabase = createServerSupabaseClient();

    // Get tenant's current subscription
    const { data: subscription, error } = await supabase
      .from('tenant_subscriptions')
      .select(
        `
        *,
        plan:subscription_plans(*)
      `
      )
      .eq('tenant_id', tenantId)
      .in('status', ['trial', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      logger.error('Failed to check subscription for free plan restrictions', {
        tenantId,
        pathname,
        error: error.message,
      });

      return {
        allowed: false,
        reason: 'Unable to verify subscription',
        redirectTo: '/dashboard/billing',
      };
    }

    if (!subscription || !subscription.plan) {
      return {
        allowed: false,
        reason: 'No active subscription found',
        redirectTo: '/dashboard/billing',
        upgradeRequired: true,
      };
    }

    // Check if user is on free plan
    if (subscription.plan.name === 'free') {
      logger.info('Free plan user trying to access premium feature', {
        tenantId,
        pathname,
        plan: subscription.plan.name,
      });

      return {
        allowed: false,
        reason: 'This feature is not available in the free plan',
        redirectTo: '/dashboard/billing',
        upgradeRequired: true,
        plan: 'free',
      };
    }

    return { allowed: true };
  } catch (error) {
    logger.error('Error checking free plan restrictions', {
      tenantId,
      pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      allowed: false,
      reason: 'Plan verification failed',
      redirectTo: '/dashboard',
    };
  }
}

// ==========================================
// MIDDLEWARE HELPER FUNCTIONS
// ==========================================

/**
 * Apply feature gating to request
 * Returns NextResponse.redirect if access should be denied
 */
export async function applyFeatureGating(
  request: NextRequest,
  tenantId: string,
  pathname: string
): Promise<NextResponse | null> {
  try {
    // Skip feature gating for certain paths
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/public/') ||
      pathname === '/dashboard' ||
      pathname === '/dashboard/billing' ||
      pathname === '/dashboard/settings'
    ) {
      return null; // Allow access
    }

    // Check free plan restrictions first
    const freePlanCheck = await checkFreePlanRestrictions(tenantId, pathname);
    if (!freePlanCheck.allowed) {
      const redirectUrl = new URL(freePlanCheck.redirectTo || '/dashboard/billing', request.url);
      redirectUrl.searchParams.set('reason', freePlanCheck.reason || 'Upgrade required');
      redirectUrl.searchParams.set('feature', 'premium');

      logger.info('Redirecting due to free plan restriction', {
        tenantId,
        pathname,
        redirectTo: redirectUrl.pathname,
        reason: freePlanCheck.reason,
      });

      return NextResponse.redirect(redirectUrl);
    }

    // Check specific feature access
    const featureCheck = await checkFeatureAccess(tenantId, pathname, request);
    if (!featureCheck.allowed) {
      const redirectUrl = new URL(featureCheck.redirectTo || '/dashboard/billing', request.url);
      redirectUrl.searchParams.set('reason', featureCheck.reason || 'Feature not available');
      if (featureCheck.feature) {
        redirectUrl.searchParams.set('feature', featureCheck.feature);
      }

      logger.info('Redirecting due to feature restriction', {
        tenantId,
        pathname,
        redirectTo: redirectUrl.pathname,
        reason: featureCheck.reason,
        feature: featureCheck.feature,
      });

      return NextResponse.redirect(redirectUrl);
    }

    // Check resource limits for creation routes
    const resourceConfig = RESOURCE_PROTECTED_ROUTES[pathname];
    if (resourceConfig && resourceConfig.action === 'create') {
      const resourceCheck = await checkResourceLimit(
        tenantId,
        resourceConfig.resource as 'students' | 'teachers' | 'classes',
        request
      );

      if (!resourceCheck.allowed) {
        const redirectUrl = new URL('/dashboard/billing', request.url);
        redirectUrl.searchParams.set('reason', resourceCheck.reason || 'Resource limit exceeded');
        redirectUrl.searchParams.set('resource', resourceConfig.resource);
        if (resourceCheck.currentCount !== undefined) {
          redirectUrl.searchParams.set('currentCount', resourceCheck.currentCount.toString());
        }
        if (resourceCheck.limit !== undefined && resourceCheck.limit !== null) {
          redirectUrl.searchParams.set('limit', resourceCheck.limit.toString());
        }

        logger.info('Redirecting due to resource limit', {
          tenantId,
          pathname,
          resource: resourceConfig.resource,
          currentCount: resourceCheck.currentCount,
          limit: resourceCheck.limit,
          reason: resourceCheck.reason,
        });

        return NextResponse.redirect(redirectUrl);
      }
    }

    // All checks passed, allow access
    return null;
  } catch (error) {
    logger.error('Error in feature gating middleware', {
      tenantId,
      pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // On error, redirect to safe page
    const redirectUrl = new URL('/dashboard', request.url);
    redirectUrl.searchParams.set('reason', 'Feature access verification failed');
    return NextResponse.redirect(redirectUrl);
  }
}

// ==========================================
// CLIENT-SIDE HELPERS
// ==========================================

/**
 * Check feature access from client components
 * This should be used in addition to middleware protection
 */
export async function clientCheckFeatureAccess(featureName: string): Promise<boolean> {
  try {
    const response = await fetch('/api/subscription/check-feature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feature: featureName }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.allowed === true;
  } catch (error) {
    logger.error('Client feature check failed', {
      featureName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * Check resource limits from client components
 */
export async function clientCheckResourceLimit(
  resourceType: 'students' | 'teachers' | 'classes'
): Promise<{ allowed: boolean; currentCount?: number; limit?: number | null }> {
  try {
    const response = await fetch('/api/subscription/check-limits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resource: resourceType }),
    });

    if (!response.ok) {
      return { allowed: false };
    }

    const data = await response.json();
    return {
      allowed: data.allowed === true,
      currentCount: data.currentCount,
      limit: data.limit,
    };
  } catch (error) {
    logger.error('Client resource limit check failed', {
      resourceType,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return { allowed: false };
  }
}

// ==========================================
// EXPORTS
// ==========================================

export default {
  checkFeatureAccess,
  checkResourceLimit,
  checkFreePlanRestrictions,
  applyFeatureGating,
  clientCheckFeatureAccess,
  clientCheckResourceLimit,
};
