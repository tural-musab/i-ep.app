/**
 * İyzico Payment Integration for İ-EP.APP
 * Turkish education system payment processing
 */

import crypto from 'crypto';

export interface IyzicoPaymentRequest {
  price: string;
  paidPrice: string;
  currency: 'TRY';
  basketId: string;
  paymentGroup: 'PRODUCT' | 'LISTING' | 'SUBSCRIPTION';
  callbackUrl?: string;
  enabledInstallments?: number[];
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    category2?: string;
    itemType: 'PHYSICAL' | 'VIRTUAL';
    price: string;
  }>;
}

export interface IyzicoPaymentResponse {
  status: 'success' | 'failure';
  locale: string;
  systemTime: number;
  conversationId: string;
  token?: string;
  checkoutFormContent?: string;
  paymentId?: string;
  paymentStatus?: string;
  fraudStatus?: string;
  merchantCommissionRate?: string;
  merchantCommissionRateAmount?: string;
  iyziCommissionRateAmount?: string;
  iyziCommissionFee?: string;
  cardType?: string;
  cardAssociation?: string;
  cardFamily?: string;
  binNumber?: string;
  lastFourDigits?: string;
  basketId?: string;
  currency?: string;
  price?: string;
  paidPrice?: string;
  installment?: number;
  paymentItems?: Array<{
    itemId: string;
    paymentTransactionId: string;
    transactionStatus: string;
    price: string;
    paidPrice: string;
    merchantCommissionRate: string;
    merchantCommissionRateAmount: string;
    iyziCommissionRateAmount: string;
    iyziCommissionFee: string;
    blockageRate: string;
    blockageRateAmountMerchant: string;
    blockageRateAmountSubMerchant: string;
    blockageResolvedDate: string;
    subMerchantKey: string;
    subMerchantPrice: string;
    subMerchantPayoutRate: string;
    subMerchantPayoutAmount: string;
    merchantPayoutAmount: string;
  }>;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
}

export interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  locale: 'tr' | 'en';
}

export class IyzicoClient {
  private config: IyzicoConfig;

  constructor(config: IyzicoConfig) {
    this.config = config;
  }

  /**
   * Initialize checkout form for payment
   */
  async initializeCheckoutForm(request: IyzicoPaymentRequest): Promise<IyzicoPaymentResponse> {
    const url = `${this.config.baseUrl}/payment/iyzipos/checkoutform/initialize`;
    const requestBody = {
      ...request,
      locale: this.config.locale,
      conversationId: this.generateConversationId()
    };

    try {
      const response = await this.makeRequest(url, requestBody);
      return response;
    } catch (error) {
      console.error('İyzico checkout initialization error:', error);
      throw new Error('Payment initialization failed');
    }
  }

  /**
   * Retrieve checkout form result
   */
  async retrieveCheckoutFormResult(token: string): Promise<IyzicoPaymentResponse> {
    const url = `${this.config.baseUrl}/payment/iyzipos/checkoutform`;
    const requestBody = {
      locale: this.config.locale,
      conversationId: this.generateConversationId(),
      token
    };

    try {
      const response = await this.makeRequest(url, requestBody);
      return response;
    } catch (error) {
      console.error('İyzico checkout result error:', error);
      throw new Error('Payment result retrieval failed');
    }
  }

  /**
   * Create payment (direct payment without form)
   */
  async createPayment(request: IyzicoPaymentRequest & {
    paymentCard: {
      cardHolderName: string;
      cardNumber: string;
      expireMonth: string;
      expireYear: string;
      cvc: string;
      registerCard: number;
    };
  }): Promise<IyzicoPaymentResponse> {
    const url = `${this.config.baseUrl}/payment/auth`;
    const requestBody = {
      ...request,
      locale: this.config.locale,
      conversationId: this.generateConversationId()
    };

    try {
      const response = await this.makeRequest(url, requestBody);
      return response;
    } catch (error) {
      console.error('İyzico payment creation error:', error);
      throw new Error('Payment creation failed');
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string, ip: string): Promise<IyzicoPaymentResponse> {
    const url = `${this.config.baseUrl}/payment/cancel`;
    const requestBody = {
      locale: this.config.locale,
      conversationId: this.generateConversationId(),
      paymentId,
      ip
    };

    try {
      const response = await this.makeRequest(url, requestBody);
      return response;
    } catch (error) {
      console.error('İyzico payment cancellation error:', error);
      throw new Error('Payment cancellation failed');
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentTransactionId: string, price: string, currency: 'TRY', ip: string): Promise<IyzicoPaymentResponse> {
    const url = `${this.config.baseUrl}/payment/refund`;
    const requestBody = {
      locale: this.config.locale,
      conversationId: this.generateConversationId(),
      paymentTransactionId,
      price,
      currency,
      ip
    };

    try {
      const response = await this.makeRequest(url, requestBody);
      return response;
    } catch (error) {
      console.error('İyzico payment refund error:', error);
      throw new Error('Payment refund failed');
    }
  }

  /**
   * Create subscription payment
   */
  async createSubscriptionPayment(request: {
    subscriptionInitializeRequest: {
      locale: string;
      conversationId: string;
      pricingPlanReferenceCode: string;
      subscriptionInitialStatus: 'ACTIVE' | 'PENDING';
      customer: {
        name: string;
        surname: string;
        identityNumber: string;
        email: string;
        gsmNumber: string;
        billingAddress: {
          contactName: string;
          city: string;
          country: string;
          address: string;
        };
        shippingAddress: {
          contactName: string;
          city: string;
          country: string;
          address: string;
        };
      };
    };
  }): Promise<IyzicoPaymentResponse> {
    const url = `${this.config.baseUrl}/v2/subscription/initialize`;
    const requestBody = {
      ...request.subscriptionInitializeRequest,
      locale: this.config.locale,
      conversationId: this.generateConversationId()
    };

    try {
      const response = await this.makeRequest(url, requestBody);
      return response;
    } catch (error) {
      console.error('İyzico subscription creation error:', error);
      throw new Error('Subscription creation failed');
    }
  }

  private async makeRequest(url: string, body: any): Promise<IyzicoPaymentResponse> {
    const authString = this.generateAuthString(url, body);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authString,
        'x-iyzi-rnd': this.generateRandomString()
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`İyzico API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private generateAuthString(url: string, body: any): string {
    const randomString = this.generateRandomString();
    const hashData = this.config.apiKey + randomString + this.config.secretKey + JSON.stringify(body);
    const hash = crypto.createHash('sha1').update(hashData).digest('base64');
    return `IYZWS ${this.config.apiKey}:${hash}`;
  }

  private generateRandomString(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateConversationId(): string {
    return `conversation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Education-specific payment types
export interface SchoolPaymentRequest {
  type: 'tuition' | 'meal' | 'transport' | 'book' | 'uniform' | 'activity' | 'exam';
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  schoolId: string;
  schoolName: string;
  academicYear: string;
  semester: 'fall' | 'spring' | 'summer';
  description: string;
  amount: number;
  dueDate?: string;
  installmentOptions?: number[];
}

export interface SchoolPaymentResponse extends IyzicoPaymentResponse {
  schoolPaymentId: string;
  studentInfo: {
    id: string;
    name: string;
    class: string;
    studentNumber: string;
  };
  paymentInfo: {
    type: string;
    description: string;
    academicYear: string;
    semester: string;
    dueDate?: string;
  };
}

// Factory function for creating İyzico client
export function createIyzicoClient(): IyzicoClient {
  const config: IyzicoConfig = {
    apiKey: process.env.IYZICO_API_KEY || 'demo-api-key',
    secretKey: process.env.IYZICO_SECRET_KEY || 'demo-secret-key',
    baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
    locale: 'tr'
  };

  return new IyzicoClient(config);
}

// Utility functions for education payments
export function formatTurkishCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
}

export function calculateInstallmentAmount(totalAmount: number, installments: number): number {
  return Math.ceil(totalAmount / installments);
}

export function validateTurkishIdentityNumber(identityNumber: string): boolean {
  if (identityNumber.length !== 11) return false;
  if (!/^\d+$/.test(identityNumber)) return false;
  if (identityNumber[0] === '0') return false;

  const digits = identityNumber.split('').map(Number);
  const checksum = (
    (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7 -
    (digits[1] + digits[3] + digits[5] + digits[7])
  ) % 10;

  return checksum === digits[9] && 
         (digits.slice(0, 10).reduce((a, b) => a + b) % 10) === digits[10];
}