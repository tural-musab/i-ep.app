/**
 * Subscription Management Service
 * Sprint 1: Payment Integration Foundation
 * 
 * Handles subscription lifecycle, plan management, and feature gating
 * Integrates with billing system and payment processing
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('subscription-service');

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxStudents: number | null;
  maxTeachers: number | null;
  maxClasses: number | null;
  features: Record<string, any>;
  trialDays: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'trial' | 'active' | 'cancelled' | 'past_due' | 'suspended';
  billingCycle: 'monthly' | 'yearly';
  trialStartsAt: string | null;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  
  // Joined plan data
  plan?: SubscriptionPlan;
}

export interface CreateSubscriptionRequest {
  tenantId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  startTrial?: boolean;
  paymentMethodId?: string;
}

export interface UpdateSubscriptionRequest {
  planId?: string;
  billingCycle?: 'monthly' | 'yearly';
  status?: 'active' | 'cancelled' | 'suspended';
}

export interface FeatureUsage {
  tenantId: string;
  monthYear: string;
  studentsCount: number;
  teachersCount: number;
  classesCount: number;
  storageUsedMb: number;
  apiCallsCount: number;
  smsSentCount: number;
  emailsSentCount: number;
}

// ==========================================
// SUBSCRIPTION PLAN MANAGEMENT
// ==========================================

/**
 * Get all active subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) {
      logger.error('Failed to fetch subscription plans', { error: error.message });
      throw new Error('Failed to fetch subscription plans');
    }
    
    return data.map(plan => ({
      id: plan.id,
      name: plan.name,
      displayName: plan.display_name,
      description: plan.description,
      priceMonthly: parseFloat(plan.price_monthly),
      priceYearly: parseFloat(plan.price_yearly),
      currency: plan.currency,
      maxStudents: plan.max_students,
      maxTeachers: plan.max_teachers,
      maxClasses: plan.max_classes,
      features: plan.features || {},
      trialDays: plan.trial_days,
      isActive: plan.is_active,
      sortOrder: plan.sort_order,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
    }));
  } catch (error) {
    logger.error('Error in getSubscriptionPlans', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Get subscription plan by ID
 */
export async function getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Plan not found
      }
      logger.error('Failed to fetch subscription plan', { planId, error: error.message });
      throw new Error('Failed to fetch subscription plan');
    }
    
    return {
      id: data.id,
      name: data.name,
      displayName: data.display_name,
      description: data.description,
      priceMonthly: parseFloat(data.price_monthly),
      priceYearly: parseFloat(data.price_yearly),
      currency: data.currency,
      maxStudents: data.max_students,
      maxTeachers: data.max_teachers,
      maxClasses: data.max_classes,
      features: data.features || {},
      trialDays: data.trial_days,
      isActive: data.is_active,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    logger.error('Error in getSubscriptionPlan', {
      planId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Get subscription plan by name (e.g., 'free', 'standard', 'premium')
 */
export async function getSubscriptionPlanByName(planName: string): Promise<SubscriptionPlan | null> {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', planName)
      .eq('is_active', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Plan not found
      }
      logger.error('Failed to fetch subscription plan by name', { planName, error: error.message });
      throw new Error('Failed to fetch subscription plan');
    }
    
    return {
      id: data.id,
      name: data.name,
      displayName: data.display_name,
      description: data.description,
      priceMonthly: parseFloat(data.price_monthly),
      priceYearly: parseFloat(data.price_yearly),
      currency: data.currency,
      maxStudents: data.max_students,
      maxTeachers: data.max_teachers,
      maxClasses: data.max_classes,
      features: data.features || {},
      trialDays: data.trial_days,
      isActive: data.is_active,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    logger.error('Error in getSubscriptionPlanByName', {
      planName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// ==========================================
// TENANT SUBSCRIPTION MANAGEMENT
// ==========================================

/**
 * Get current subscription for a tenant
 */
export async function getTenantSubscription(tenantId: string): Promise<TenantSubscription | null> {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('tenant_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('tenant_id', tenantId)
      .in('status', ['trial', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No active subscription found
      }
      logger.error('Failed to fetch tenant subscription', { tenantId, error: error.message });
      throw new Error('Failed to fetch tenant subscription');
    }
    
    const subscription: TenantSubscription = {
      id: data.id,
      tenantId: data.tenant_id,
      planId: data.plan_id,
      status: data.status,
      billingCycle: data.billing_cycle,
      trialStartsAt: data.trial_starts_at,
      trialEndsAt: data.trial_ends_at,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      cancelledAt: data.cancelled_at,
      amount: parseFloat(data.amount),
      currency: data.currency,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    
    // Add plan data if available
    if (data.plan) {
      subscription.plan = {
        id: data.plan.id,
        name: data.plan.name,
        displayName: data.plan.display_name,
        description: data.plan.description,
        priceMonthly: parseFloat(data.plan.price_monthly),
        priceYearly: parseFloat(data.plan.price_yearly),
        currency: data.plan.currency,
        maxStudents: data.plan.max_students,
        maxTeachers: data.plan.max_teachers,
        maxClasses: data.plan.max_classes,
        features: data.plan.features || {},
        trialDays: data.plan.trial_days,
        isActive: data.plan.is_active,
        sortOrder: data.plan.sort_order,
        createdAt: data.plan.created_at,
        updatedAt: data.plan.updated_at,
      };
    }
    
    return subscription;
  } catch (error) {
    logger.error('Error in getTenantSubscription', {
      tenantId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Create new subscription for tenant
 */
export async function createTenantSubscription(
  request: CreateSubscriptionRequest
): Promise<TenantSubscription> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get the plan details first
    const plan = await getSubscriptionPlan(request.planId);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }
    
    // Calculate subscription amount based on billing cycle
    const amount = request.billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    
    // Calculate subscription dates
    const now = new Date();
    let trialStartsAt: string | null = null;
    let trialEndsAt: string | null = null;
    let currentPeriodStart: string;
    let currentPeriodEnd: string;
    
    if (request.startTrial && plan.trialDays > 0) {
      // Start with trial period
      trialStartsAt = now.toISOString();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + plan.trialDays);
      trialEndsAt = trialEnd.toISOString();
      
      currentPeriodStart = trialStartsAt;
      currentPeriodEnd = trialEndsAt;
    } else {
      // Start with paid subscription immediately
      currentPeriodStart = now.toISOString();
      const periodEnd = new Date(now);
      
      if (request.billingCycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
      
      currentPeriodEnd = periodEnd.toISOString();
    }
    
    // Create subscription record
    const { data, error } = await supabase
      .from('tenant_subscriptions')
      .insert({
        tenant_id: request.tenantId,
        plan_id: request.planId,
        status: request.startTrial && plan.trialDays > 0 ? 'trial' : 'active',
        billing_cycle: request.billingCycle,
        trial_starts_at: trialStartsAt,
        trial_ends_at: trialEndsAt,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        amount: amount,
        currency: plan.currency,
      })
      .select()
      .single();
    
    if (error) {
      logger.error('Failed to create tenant subscription', {
        tenantId: request.tenantId,
        planId: request.planId,
        error: error.message,
      });
      throw new Error('Failed to create subscription');
    }
    
    logger.info('Created tenant subscription', {
      subscriptionId: data.id,
      tenantId: request.tenantId,
      planId: request.planId,
      status: data.status,
      billingCycle: request.billingCycle,
    });
    
    return {
      id: data.id,
      tenantId: data.tenant_id,
      planId: data.plan_id,
      status: data.status,
      billingCycle: data.billing_cycle,
      trialStartsAt: data.trial_starts_at,
      trialEndsAt: data.trial_ends_at,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      cancelledAt: data.cancelled_at,
      amount: parseFloat(data.amount),
      currency: data.currency,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      plan: plan,
    };
  } catch (error) {
    logger.error('Error in createTenantSubscription', {
      request,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Update existing subscription
 */
export async function updateTenantSubscription(
  subscriptionId: string,
  updates: UpdateSubscriptionRequest
): Promise<TenantSubscription> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Prepare update object
    const updateData: any = {};
    
    if (updates.planId) {
      updateData.plan_id = updates.planId;
      
      // If changing plan, recalculate amount
      const newPlan = await getSubscriptionPlan(updates.planId);
      if (newPlan) {
        const currentSub = await supabase
          .from('tenant_subscriptions')
          .select('billing_cycle')
          .eq('id', subscriptionId)
          .single();
        
        if (currentSub.data) {
          const billingCycle = updates.billingCycle || currentSub.data.billing_cycle;
          updateData.amount = billingCycle === 'yearly' ? newPlan.priceYearly : newPlan.priceMonthly;
          updateData.currency = newPlan.currency;
        }
      }
    }
    
    if (updates.billingCycle) {
      updateData.billing_cycle = updates.billingCycle;
    }
    
    if (updates.status) {
      updateData.status = updates.status;
      
      if (updates.status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }
    }
    
    // Perform update
    const { data, error } = await supabase
      .from('tenant_subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .single();
    
    if (error) {
      logger.error('Failed to update tenant subscription', {
        subscriptionId,
        updates,
        error: error.message,
      });
      throw new Error('Failed to update subscription');
    }
    
    logger.info('Updated tenant subscription', {
      subscriptionId,
      updates,
    });
    
    const subscription: TenantSubscription = {
      id: data.id,
      tenantId: data.tenant_id,
      planId: data.plan_id,
      status: data.status,
      billingCycle: data.billing_cycle,
      trialStartsAt: data.trial_starts_at,
      trialEndsAt: data.trial_ends_at,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      cancelledAt: data.cancelled_at,
      amount: parseFloat(data.amount),
      currency: data.currency,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    
    // Add plan data if available
    if (data.plan) {
      subscription.plan = {
        id: data.plan.id,
        name: data.plan.name,
        displayName: data.plan.display_name,
        description: data.plan.description,
        priceMonthly: parseFloat(data.plan.price_monthly),
        priceYearly: parseFloat(data.plan.price_yearly),
        currency: data.plan.currency,
        maxStudents: data.plan.max_students,
        maxTeachers: data.plan.max_teachers,
        maxClasses: data.plan.max_classes,
        features: data.plan.features || {},
        trialDays: data.plan.trial_days,
        isActive: data.plan.is_active,
        sortOrder: data.plan.sort_order,
        createdAt: data.plan.created_at,
        updatedAt: data.plan.updated_at,
      };
    }
    
    return subscription;
  } catch (error) {
    logger.error('Error in updateTenantSubscription', {
      subscriptionId,
      updates,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// ==========================================
// FEATURE GATING AND LIMITS
// ==========================================

/**
 * Check if tenant can use a specific feature
 */
export async function canUseFeature(tenantId: string, featureName: string): Promise<boolean> {
  try {
    const subscription = await getTenantSubscription(tenantId);
    
    if (!subscription || !subscription.plan) {
      // No subscription or plan found - deny access
      return false;
    }
    
    // Check if subscription is active
    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      return false;
    }
    
    // Check if trial has expired
    if (subscription.status === 'trial' && subscription.trialEndsAt) {
      const trialEnd = new Date(subscription.trialEndsAt);
      if (trialEnd < new Date()) {
        return false;
      }
    }
    
    // Check feature in plan
    const featureValue = subscription.plan.features[featureName];
    
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }
    
    if (typeof featureValue === 'string') {
      return featureValue !== 'false' && featureValue !== '';
    }
    
    // Default to false if feature not defined
    return false;
  } catch (error) {
    logger.error('Error checking feature access', {
      tenantId,
      featureName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * Check if tenant is within usage limits
 */
export async function isWithinLimits(
  tenantId: string,
  resourceType: 'students' | 'teachers' | 'classes',
  currentCount: number
): Promise<boolean> {
  try {
    const subscription = await getTenantSubscription(tenantId);
    
    if (!subscription || !subscription.plan) {
      return false;
    }
    
    let limit: number | null = null;
    
    switch (resourceType) {
      case 'students':
        limit = subscription.plan.maxStudents;
        break;
      case 'teachers':
        limit = subscription.plan.maxTeachers;
        break;
      case 'classes':
        limit = subscription.plan.maxClasses;
        break;
    }
    
    // If limit is null, it means unlimited
    if (limit === null) {
      return true;
    }
    
    return currentCount < limit;
  } catch (error) {
    logger.error('Error checking resource limits', {
      tenantId,
      resourceType,
      currentCount,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * Get tenant's current usage limits
 */
export async function getTenantLimits(tenantId: string): Promise<{
  maxStudents: number | null;
  maxTeachers: number | null;
  maxClasses: number | null;
  features: Record<string, any>;
} | null> {
  try {
    const subscription = await getTenantSubscription(tenantId);
    
    if (!subscription || !subscription.plan) {
      return null;
    }
    
    return {
      maxStudents: subscription.plan.maxStudents,
      maxTeachers: subscription.plan.maxTeachers,
      maxClasses: subscription.plan.maxClasses,
      features: subscription.plan.features,
    };
  } catch (error) {
    logger.error('Error getting tenant limits', {
      tenantId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

// ==========================================
// USAGE TRACKING
// ==========================================

/**
 * Record feature usage for billing and analytics
 */
export async function recordFeatureUsage(
  tenantId: string,
  usageData: Partial<FeatureUsage>
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const { error } = await supabase
      .from('feature_usage')
      .upsert({
        tenant_id: tenantId,
        month_year: monthYear,
        ...usageData,
        recorded_at: new Date().toISOString(),
      }, {
        onConflict: 'tenant_id,month_year',
      });
    
    if (error) {
      logger.error('Failed to record feature usage', {
        tenantId,
        monthYear,
        error: error.message,
      });
      throw new Error('Failed to record usage');
    }
    
    logger.debug('Recorded feature usage', { tenantId, monthYear, usageData });
  } catch (error) {
    logger.error('Error in recordFeatureUsage', {
      tenantId,
      usageData,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Get feature usage for a tenant
 */
export async function getFeatureUsage(
  tenantId: string,
  monthYear?: string
): Promise<FeatureUsage | null> {
  try {
    const supabase = createServerSupabaseClient();
    const targetMonth = monthYear || new Date().toISOString().slice(0, 7);
    
    const { data, error } = await supabase
      .from('feature_usage')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('month_year', targetMonth)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No usage data found
      }
      logger.error('Failed to fetch feature usage', {
        tenantId,
        monthYear: targetMonth,
        error: error.message,
      });
      throw new Error('Failed to fetch usage data');
    }
    
    return {
      tenantId: data.tenant_id,
      monthYear: data.month_year,
      studentsCount: data.students_count,
      teachersCount: data.teachers_count,
      classesCount: data.classes_count,
      storageUsedMb: data.storage_used_mb,
      apiCallsCount: data.api_calls_count,
      smsSentCount: data.sms_sent_count,
      emailsSentCount: data.emails_sent_count,
    };
  } catch (error) {
    logger.error('Error in getFeatureUsage', {
      tenantId,
      monthYear,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// ==========================================
// SUBSCRIPTION STATUS CHECKS
// ==========================================

/**
 * Check if subscription is in trial period
 */
export async function isInTrialPeriod(tenantId: string): Promise<boolean> {
  try {
    const subscription = await getTenantSubscription(tenantId);
    
    if (!subscription || subscription.status !== 'trial') {
      return false;
    }
    
    if (!subscription.trialEndsAt) {
      return false;
    }
    
    const trialEnd = new Date(subscription.trialEndsAt);
    return trialEnd > new Date();
  } catch (error) {
    logger.error('Error checking trial status', {
      tenantId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * Get days remaining in trial
 */
export async function getTrialDaysRemaining(tenantId: string): Promise<number> {
  try {
    const subscription = await getTenantSubscription(tenantId);
    
    if (!subscription || subscription.status !== 'trial' || !subscription.trialEndsAt) {
      return 0;
    }
    
    const trialEnd = new Date(subscription.trialEndsAt);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  } catch (error) {
    logger.error('Error calculating trial days remaining', {
      tenantId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return 0;
  }
}

// ==========================================
// EXPORTS
// ==========================================

export default {
  // Plan management
  getSubscriptionPlans,
  getSubscriptionPlan,
  getSubscriptionPlanByName,
  
  // Subscription management
  getTenantSubscription,
  createTenantSubscription,
  updateTenantSubscription,
  
  // Feature gating
  canUseFeature,
  isWithinLimits,
  getTenantLimits,
  
  // Usage tracking
  recordFeatureUsage,
  getFeatureUsage,
  
  // Status checks
  isInTrialPeriod,
  getTrialDaysRemaining,
};