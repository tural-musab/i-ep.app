/**
 * Payment Creation API Endpoint
 * Sprint 1: Payment Integration Foundation
 * 
 * Handles payment creation requests with İyzico integration
 * Creates subscription and processes payment securely
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPayment, IyzicoPaymentRequest } from '@/lib/payment/iyzico';
import { createTenantSubscription, getSubscriptionPlan } from '@/lib/subscription/subscription-service';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getLogger } from '@/lib/utils/logger';
import { getCurrentTenantId } from '@/lib/tenant/tenant-utils';

const logger = getLogger('payment-api');

// ==========================================
// REQUEST VALIDATION SCHEMA
// ==========================================

const createPaymentSchema = z.object({
  planId: z.string().uuid('Geçerli bir plan ID giriniz'),
  amount: z.string().regex(/^\d+\.\d{2}$/, 'Geçerli bir tutar giriniz'),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  billingCycle: z.enum(['monthly', 'yearly']),
  
  customerInfo: z.object({
    firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    phone: z.string().min(10, 'Geçerli bir telefon numarası giriniz'),
    identityNumber: z.string().length(11, 'TC Kimlik No 11 haneli olmalıdır'),
  }),
  
  billingAddress: z.object({
    address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
    city: z.string().min(2, 'Şehir giriniz'),
    zipCode: z.string().min(5, 'Posta kodu en az 5 karakter olmalıdır'),
    country: z.string().default('Türkiye'),
  }),
  
  paymentCard: z.object({
    cardHolderName: z.string().min(5, 'Kart sahibi adı en az 5 karakter olmalıdır'),
    cardNumber: z.string().min(16, 'Geçerli bir kart numarası giriniz'),
    expireMonth: z.string().length(2, 'Geçerli bir ay giriniz'),
    expireYear: z.string().length(4, 'Geçerli bir yıl giriniz'),
    cvc: z.string().min(3, 'Geçerli bir CVC giriniz').max(4),
    registerCard: z.enum(['0', '1']).default('0'),
  }),
});

type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;

// ==========================================
// MAIN API HANDLER
// ==========================================

export async function POST(request: NextRequest) {
  try {
    // Get tenant ID from request
    const tenantId = getCurrentTenantId(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID bulunamadı' },
        { status: 400 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate request data
    const validatedData = createPaymentSchema.parse(body);
    
    logger.info('Processing payment creation request', {
      tenantId,
      planId: validatedData.planId,
      amount: validatedData.amount,
      billingCycle: validatedData.billingCycle,
      customerEmail: validatedData.customerInfo.email,
    });
    
    // Verify subscription plan exists and is valid
    const plan = await getSubscriptionPlan(validatedData.planId);
    if (!plan) {
      logger.error('Invalid subscription plan', {
        tenantId,
        planId: validatedData.planId,
      });
      
      return NextResponse.json(
        { error: 'Geçersiz abonelik planı' },
        { status: 400 }
      );
    }
    
    // Verify amount matches plan pricing
    const expectedAmount = validatedData.billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    if (parseFloat(validatedData.amount) !== expectedAmount) {
      logger.error('Amount mismatch', {
        tenantId,
        planId: validatedData.planId,
        expectedAmount,
        providedAmount: validatedData.amount,
      });
      
      return NextResponse.json(
        { error: 'Tutar planla eşleşmiyor' },
        { status: 400 }
      );
    }
    
    // Check if tenant already has an active subscription
    const supabase = createServerSupabaseClient();
    const { data: existingSubscription } = await supabase
      .from('tenant_subscriptions')
      .select('id, status')
      .eq('tenant_id', tenantId)
      .in('status', ['trial', 'active'])
      .limit(1)
      .single();
    
    if (existingSubscription) {
      logger.warn('Tenant already has active subscription', {
        tenantId,
        existingSubscriptionId: existingSubscription.id,
        status: existingSubscription.status,
      });
      
      return NextResponse.json(
        { error: 'Zaten aktif bir aboneliğiniz bulunmaktadır' },
        { status: 409 }
      );
    }
    
    // Get client IP for fraud prevention
    const clientIP = request.ip || 
                    request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    
    // Create payment request for İyzico
    const paymentRequest: IyzicoPaymentRequest = {
      price: validatedData.amount,
      paidPrice: validatedData.amount, // Same as price for simple payments
      currency: validatedData.currency,
      installment: '1', // Single payment
      tenantId,
      
      buyerInfo: {
        id: tenantId, // Use tenant ID as buyer ID
        name: validatedData.customerInfo.firstName,
        surname: validatedData.customerInfo.lastName,
        email: validatedData.customerInfo.email,
        identityNumber: validatedData.customerInfo.identityNumber,
        registrationAddress: validatedData.billingAddress.address,
        city: validatedData.billingAddress.city,
        country: validatedData.billingAddress.country,
        zipCode: validatedData.billingAddress.zipCode,
        ip: clientIP,
        gsmNumber: validatedData.customerInfo.phone,
      },
      
      billingAddress: {
        contactName: `${validatedData.customerInfo.firstName} ${validatedData.customerInfo.lastName}`,
        city: validatedData.billingAddress.city,
        country: validatedData.billingAddress.country,
        address: validatedData.billingAddress.address,
        zipCode: validatedData.billingAddress.zipCode,
      },
      
      paymentCard: {
        cardHolderName: validatedData.paymentCard.cardHolderName,
        cardNumber: validatedData.paymentCard.cardNumber.replace(/\s/g, ''),
        expireMonth: validatedData.paymentCard.expireMonth,
        expireYear: validatedData.paymentCard.expireYear,
        cvc: validatedData.paymentCard.cvc,
        registerCard: validatedData.paymentCard.registerCard,
      },
      
      conversationId: `${tenantId}_${Date.now()}`,
    };
    
    // Process payment with İyzico
    const paymentResult = await createPayment(paymentRequest);
    
    if (paymentResult.status !== 'success') {
      logger.error('Payment failed', {
        tenantId,
        planId: validatedData.planId,
        error: paymentResult.errorMessage,
        errorCode: paymentResult.errorCode,
        conversationId: paymentResult.conversationId,
      });
      
      return NextResponse.json(
        {
          error: paymentResult.errorMessage || 'Ödeme işlemi başarısız oldu',
          errorCode: paymentResult.errorCode,
        },
        { status: 400 }
      );
    }
    
    logger.info('Payment successful, creating subscription', {
      tenantId,
      planId: validatedData.planId,
      paymentId: paymentResult.paymentId,
      conversationId: paymentResult.conversationId,
    });
    
    // Create subscription record
    const subscription = await createTenantSubscription({
      tenantId,
      planId: validatedData.planId,
      billingCycle: validatedData.billingCycle,
      startTrial: false, // Paid subscription, no trial
    });
    
    // Record payment in database
    const { error: paymentRecordError } = await supabase
      .from('payments')
      .insert({
        tenant_id: tenantId,
        subscription_id: subscription.id,
        amount: parseFloat(validatedData.amount),
        currency: validatedData.currency,
        status: 'completed',
        gateway: 'iyzico',
        gateway_transaction_id: paymentResult.paymentId,
        gateway_reference: paymentResult.conversationId,
        gateway_response: paymentResult,
        description: `${plan.displayName} abonelik ödemesi`,
        payment_method: 'credit_card',
        paid_at: new Date().toISOString(),
      });
    
    if (paymentRecordError) {
      logger.error('Failed to record payment in database', {
        tenantId,
        paymentId: paymentResult.paymentId,
        error: paymentRecordError.message,
      });
      
      // Note: Payment was successful but we couldn't record it
      // This should trigger an alert in production
    }
    
    logger.info('Payment and subscription created successfully', {
      tenantId,
      subscriptionId: subscription.id,
      paymentId: paymentResult.paymentId,
      planId: validatedData.planId,
      amount: validatedData.amount,
      billingCycle: validatedData.billingCycle,
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        planId: subscription.planId,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      payment: {
        id: paymentResult.paymentId,
        conversationId: paymentResult.conversationId,
        status: 'completed',
        amount: parseFloat(validatedData.amount),
        currency: validatedData.currency,
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Payment request validation failed', {
        errors: error.errors,
      });
      
      return NextResponse.json(
        {
          error: 'Geçersiz istek verisi',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }
    
    logger.error('Payment creation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { error: 'Ödeme işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

// ==========================================
// METHOD NOT ALLOWED
// ==========================================

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}