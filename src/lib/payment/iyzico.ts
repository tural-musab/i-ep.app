/**
 * İyzico Payment Gateway Integration
 * Sprint 1: Payment Integration Foundation
 *
 * This service handles payment processing with İyzico API
 * Following Turkish payment regulations and multi-tenant architecture
 */

import Iyzipay from 'iyzipay';
import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '@/env';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('iyzico-payment');

// İyzico client configuration
// Değişkeni önce let ile tanımla
let iyzipay: Iyzipay | null = null;

// Sadece İyzico anahtarları varsa yeni bir instance oluştur.
if (env.IYZICO_API_KEY && env.IYZICO_SECRET_KEY) {
  try {
    iyzipay = new Iyzipay({
      apiKey: env.IYZICO_API_KEY,
      secretKey: env.IYZICO_SECRET_KEY,
      uri: env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
    });
  } catch (error) {
    logger.error('İyzico client initialization failed:', error);
    iyzipay = null;
  }
}

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface IyzicoPaymentRequest {
  // Order information
  price: string; // Total amount as string (e.g., "100.00")
  paidPrice: string; // Paid amount as string (includes installment fees)
  currency: 'TRY' | 'USD' | 'EUR';
  installment: string; // "1" for single payment

  // Tenant and subscription info
  tenantId: string;
  subscriptionId?: string;

  // Customer information (required by İyzico)
  buyerInfo: {
    id: string; // Tenant ID as buyer ID
    name: string;
    surname: string;
    email: string;
    identityNumber: string; // TC Kimlik or Tax Number
    registrationAddress: string;
    city: string;
    country: string;
    zipCode?: string;
    ip: string; // Customer IP for fraud prevention
    gsmNumber?: string;
  };

  // Billing address (required by İyzico)
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode?: string;
  };

  // Payment card (for card payments)
  paymentCard?: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
    registerCard: '0' | '1'; // Whether to save card
  };

  // Callback URLs
  callbackUrl?: string;

  // Metadata
  conversationId?: string; // Unique reference for tracking
}

export interface IyzicoPaymentResponse {
  status: 'success' | 'failure';
  paymentId?: string;
  conversationId?: string;
  paymentStatus?: string;
  fraudStatus?: string;
  merchantCommissionRate?: string;
  merchantCommissionRateAmount?: string;
  iyziCommissionRateAmount?: string;
  iyziCommissionFee?: string;
  cardType?: string;
  cardAssociation?: string;
  cardFamily?: string;
  cardToken?: string;
  cardUserKey?: string;
  binNumber?: string;
  lastFourDigits?: string;
  authCode?: string;
  hostReference?: string;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  locale?: string;
  systemTime?: number;
}

export interface IyzicoRefundRequest {
  paymentTransactionId: string;
  price: string;
  currency: 'TRY' | 'USD' | 'EUR';
  conversationId?: string;
  ip: string;
}

// ==========================================
// PAYMENT PROCESSING FUNCTIONS
// ==========================================

/**
 * Create a payment request with İyzico
 * Used for subscription payments and one-time charges
 */
export async function createPayment(
  paymentRequest: IyzicoPaymentRequest
): Promise<IyzicoPaymentResponse> {
  try {
    // İyzico yapılandırılmış mı kontrol et
    if (!iyzipay) {
      logger.error('İyzico not configured - missing API keys');
      return {
        status: 'failure',
        errorMessage: 'Payment service not configured. Please contact support.',
        errorCode: 'IYZICO_NOT_CONFIGURED',
      };
    }

    logger.info('Creating İyzico payment', {
      tenantId: paymentRequest.tenantId,
      amount: paymentRequest.price,
      currency: paymentRequest.currency,
      conversationId: paymentRequest.conversationId,
    });

    // Prepare İyzico payment request
    const iyzicoRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: paymentRequest.conversationId || generateConversationId(),
      price: paymentRequest.price,
      paidPrice: paymentRequest.paidPrice,
      currency: paymentRequest.currency,
      installment: paymentRequest.installment,
      installments: parseInt(paymentRequest.installment),
      basketId: `BASKET_${paymentRequest.tenantId}_${Date.now()}`,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,

      // Payment card information
      paymentCard: paymentRequest.paymentCard,

      // Buyer information
      buyer: {
        id: paymentRequest.buyerInfo.id,
        name: paymentRequest.buyerInfo.name,
        surname: paymentRequest.buyerInfo.surname,
        gsmNumber: paymentRequest.buyerInfo.gsmNumber,
        email: paymentRequest.buyerInfo.email,
        identityNumber: paymentRequest.buyerInfo.identityNumber,
        lastLoginDate: new Date().toISOString().split('T')[0] + ' 12:00:00',
        registrationDate: new Date().toISOString().split('T')[0] + ' 12:00:00',
        registrationAddress: paymentRequest.buyerInfo.registrationAddress,
        ip: paymentRequest.buyerInfo.ip,
        city: paymentRequest.buyerInfo.city,
        country: paymentRequest.buyerInfo.country,
        zipCode: paymentRequest.buyerInfo.zipCode,
      },

      // Shipping address (same as billing for subscriptions)
      shippingAddress: {
        contactName: paymentRequest.billingAddress.contactName,
        city: paymentRequest.billingAddress.city,
        country: paymentRequest.billingAddress.country,
        address: paymentRequest.billingAddress.address,
        zipCode: paymentRequest.billingAddress.zipCode,
      },

      // Billing address
      billingAddress: paymentRequest.billingAddress,

      // Basket items (required by İyzico)
      basketItems: [
        {
          id: `SUB_${paymentRequest.subscriptionId || 'PAYMENT'}`,
          name: 'İ-EP.APP Subscription',
          category1: 'Education',
          category2: 'SaaS',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: paymentRequest.price,
        },
      ],

      // Callback URL for 3D Secure
      callbackUrl: paymentRequest.callbackUrl,
    };

    // Create payment with İyzico
    const payment = await new Promise<any>((resolve, reject) => {
      if (!iyzipay) {
        reject(new Error('İyzico client not initialized'));
        return;
      }

      iyzipay.payment.create(iyzicoRequest, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // Process İyzico response
    const response: IyzicoPaymentResponse = {
      status: payment.status === 'success' ? 'success' : 'failure',
      paymentId: payment.paymentId,
      conversationId: payment.conversationId,
      paymentStatus: payment.paymentStatus,
      fraudStatus: payment.fraudStatus,
      merchantCommissionRate: payment.merchantCommissionRate,
      merchantCommissionRateAmount: payment.merchantCommissionRateAmount,
      iyziCommissionRateAmount: payment.iyziCommissionRateAmount,
      iyziCommissionFee: payment.iyziCommissionFee,
      cardType: payment.cardType,
      cardAssociation: payment.cardAssociation,
      cardFamily: payment.cardFamily,
      cardToken: payment.cardToken,
      cardUserKey: payment.cardUserKey,
      binNumber: payment.binNumber,
      lastFourDigits: payment.lastFourDigits,
      authCode: payment.authCode,
      hostReference: payment.hostReference,
      errorCode: payment.errorCode,
      errorMessage: payment.errorMessage,
      errorGroup: payment.errorGroup,
      locale: payment.locale,
      systemTime: payment.systemTime,
    };

    if (response.status === 'success') {
      logger.info('İyzico payment successful', {
        paymentId: response.paymentId,
        conversationId: response.conversationId,
        tenantId: paymentRequest.tenantId,
      });
    } else {
      logger.error('İyzico payment failed', {
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        conversationId: response.conversationId,
        tenantId: paymentRequest.tenantId,
      });
    }

    return response;
  } catch (error) {
    logger.error('İyzico payment error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId: paymentRequest.tenantId,
    });

    return {
      status: 'failure',
      errorMessage: error instanceof Error ? error.message : 'Payment processing failed',
    };
  }
}

/**
 * Retrieve payment details by payment ID
 */
export async function retrievePayment(
  paymentId: string,
  conversationId?: string
): Promise<IyzicoPaymentResponse> {
  try {
    // İyzico yapılandırılmış mı kontrol et
    if (!iyzipay) {
      logger.error('İyzico not configured - missing API keys');
      return {
        status: 'failure',
        errorMessage: 'Payment service not configured. Please contact support.',
        errorCode: 'IYZICO_NOT_CONFIGURED',
      };
    }

    logger.info('Retrieving İyzico payment', { paymentId, conversationId });

    const retrieveRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId || generateConversationId(),
      paymentId: paymentId,
    };

    const payment = await new Promise<any>((resolve, reject) => {
      iyzipay.payment.retrieve(retrieveRequest, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    return {
      status: payment.status === 'success' ? 'success' : 'failure',
      paymentId: payment.paymentId,
      conversationId: payment.conversationId,
      paymentStatus: payment.paymentStatus,
      fraudStatus: payment.fraudStatus,
      errorCode: payment.errorCode,
      errorMessage: payment.errorMessage,
    };
  } catch (error) {
    logger.error('İyzico payment retrieval error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentId,
    });

    return {
      status: 'failure',
      errorMessage: error instanceof Error ? error.message : 'Payment retrieval failed',
    };
  }
}

/**
 * Process refund for a payment
 */
export async function refundPayment(
  refundRequest: IyzicoRefundRequest
): Promise<IyzicoPaymentResponse> {
  try {
    // İyzico yapılandırılmış mı kontrol et
    if (!iyzipay) {
      logger.error('İyzico not configured - missing API keys');
      return {
        status: 'failure',
        errorMessage: 'Payment service not configured. Please contact support.',
        errorCode: 'IYZICO_NOT_CONFIGURED',
      };
    }

    logger.info('Processing İyzico refund', {
      paymentTransactionId: refundRequest.paymentTransactionId,
      amount: refundRequest.price,
      currency: refundRequest.currency,
    });

    const iyzicoRefundRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: refundRequest.conversationId || generateConversationId(),
      paymentTransactionId: refundRequest.paymentTransactionId,
      price: refundRequest.price,
      currency: refundRequest.currency,
      ip: refundRequest.ip,
    };

    const refund = await new Promise<any>((resolve, reject) => {
      if (!iyzipay) {
        reject(new Error('İyzico client not initialized'));
        return;
      }

      iyzipay.refund.create(iyzicoRefundRequest, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const response: IyzicoPaymentResponse = {
      status: refund.status === 'success' ? 'success' : 'failure',
      paymentId: refund.paymentId,
      conversationId: refund.conversationId,
      errorCode: refund.errorCode,
      errorMessage: refund.errorMessage,
    };

    if (response.status === 'success') {
      logger.info('İyzico refund successful', {
        paymentTransactionId: refundRequest.paymentTransactionId,
        conversationId: response.conversationId,
      });
    } else {
      logger.error('İyzico refund failed', {
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        paymentTransactionId: refundRequest.paymentTransactionId,
      });
    }

    return response;
  } catch (error) {
    logger.error('İyzico refund error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentTransactionId: refundRequest.paymentTransactionId,
    });

    return {
      status: 'failure',
      errorMessage: error instanceof Error ? error.message : 'Refund processing failed',
    };
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Generate unique conversation ID for İyzico tracking
 */
export function generateConversationId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `CONV_${timestamp}_${random}`;
}

/**
 * Validate Turkish Identity Number (TC Kimlik No)
 * Required by İyzico for Turkish customers
 */
export function validateTurkishIdentityNumber(tcNo: string): boolean {
  if (!tcNo || tcNo.length !== 11) return false;

  const digits = tcNo.split('').map(Number);

  // First digit cannot be 0
  if (digits[0] === 0) return false;

  // Calculate checksum
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  const check1 = (oddSum * 7 - evenSum) % 10;
  const check2 = (oddSum + evenSum + digits[9]) % 10;

  return check1 === digits[9] && check2 === digits[10];
}

/**
 * Format amount for İyzico (requires string with 2 decimal places)
 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Parse İyzico amount back to number
 */
export function parseAmount(amount: string): number {
  return parseFloat(amount);
}

/**
 * Check if İyzico is configured properly
 */
export function isIyzicoConfigured(): boolean {
  return !!(env.IYZICO_API_KEY && env.IYZICO_SECRET_KEY);
}

// ==========================================
// WEBHOOK SIGNATURE VERIFICATION
// ==========================================

/**
 * Verify İyzico webhook signature for security
 * This ensures webhook requests are actually from İyzico
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secretKey: string = env.IYZICO_SECRET_KEY || ''
): boolean {
  try {
    const expectedSignature = createHmac('sha256', secretKey).update(payload).digest('hex');

    return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (error) {
    logger.error('Webhook signature verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

// ==========================================
// EXPORTS
// ==========================================

const iyzicoService = {
  createPayment,
  retrievePayment,
  refundPayment,
  generateConversationId,
  validateTurkishIdentityNumber,
  formatAmount,
  parseAmount,
  isIyzicoConfigured,
  verifyWebhookSignature,
};

export default iyzicoService;
