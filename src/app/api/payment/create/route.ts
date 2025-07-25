/**
 * Payment API for İ-EP.APP
 * İyzico integration for education payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyTenantAccess } from '@/lib/auth/tenant-auth';

interface CreatePaymentRequest {
  studentId: string;
  paymentType: 'tuition' | 'meal' | 'transport' | 'book' | 'uniform' | 'activity' | 'exam';
  amount: number;
  description: string;
  dueDate?: string;
  installments?: number;
  parentInfo: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    identityNumber: string;
    address: string;
    city: string;
  };
}

// Demo payment data for Turkish education system
const DEMO_PAYMENT_TYPES = {
  tuition: { name: 'Okul Ücreti', category: 'education' },
  meal: { name: 'Yemek Ücreti', category: 'service' },
  transport: { name: 'Servis Ücreti', category: 'service' },
  book: { name: 'Kitap Ücreti', category: 'material' },
  uniform: { name: 'Üniforma Ücreti', category: 'material' },
  activity: { name: 'Etkinlik Ücreti', category: 'activity' },
  exam: { name: 'Sınav Ücreti', category: 'service' }
};

// POST /api/payment/create - Initialize payment
export async function POST(request: NextRequest) {
  try {
    // Verify tenant access
    const tenantCheck = await verifyTenantAccess(request);
    if ('error' in tenantCheck) {
      return NextResponse.json(tenantCheck, { status: 401 });
    }

    const paymentData: CreatePaymentRequest = await request.json();

    // Validate required fields
    if (!paymentData.studentId || !paymentData.paymentType || !paymentData.amount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Eksik bilgi: Öğrenci ID, ödeme türü ve tutar gerekli' 
        },
        { status: 400 }
      );
    }

    // Generate unique payment ID
    const paymentId = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // For demo purposes, return mock payment response
    const mockPaymentResponse = {
      status: 'success',
      locale: 'tr',
      systemTime: Date.now(),
      conversationId: `conv-${Date.now()}`,
      token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      checkoutFormContent: generateMockCheckoutForm(paymentData, paymentId),
      paymentId,
      currency: 'TRY',
      price: paymentData.amount.toFixed(2),
      paidPrice: paymentData.amount.toFixed(2)
    };

    return NextResponse.json({
      success: true,
      data: {
        paymentId,
        token: mockPaymentResponse.token,
        checkoutFormContent: mockPaymentResponse.checkoutFormContent,
        amount: paymentData.amount,
        currency: 'TRY',
        description: paymentData.description,
        studentId: paymentData.studentId,
        paymentType: paymentData.paymentType
      },
      message: 'Ödeme formu başarıyla oluşturuldu'
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ödeme oluşturulurken hata oluştu'
      },
      { status: 500 }
    );
  }
}

// GET /api/payment/create - Get payment types and info
export async function GET(request: NextRequest) {
  try {
    // Verify tenant access
    const tenantCheck = await verifyTenantAccess(request);
    if ('error' in tenantCheck) {
      return NextResponse.json(tenantCheck, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentTypes: DEMO_PAYMENT_TYPES,
        installmentOptions: [1, 2, 3, 6, 9, 12],
        maxAmount: 50000,
        currency: 'TRY',
        supportedCards: ['visa', 'mastercard', 'troy']
      }
    });

  } catch (error) {
    console.error('Payment info error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ödeme bilgileri alınırken hata oluştu'
      },
      { status: 500 }
    );
  }
}

function generateMockCheckoutForm(paymentData: CreatePaymentRequest, paymentId: string): string {
  return `
    <div class="iyzico-checkout-form" style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
      <h3 style="color: #333; margin-bottom: 16px;">İyzico Ödeme Formu</h3>
      <div style="margin-bottom: 12px;">
        <strong>Ödeme Türü:</strong> ${DEMO_PAYMENT_TYPES[paymentData.paymentType].name}
      </div>
      <div style="margin-bottom: 12px;">
        <strong>Açıklama:</strong> ${paymentData.description}
      </div>
      <div style="margin-bottom: 12px;">
        <strong>Tutar:</strong> ${paymentData.amount.toFixed(2)} TL
      </div>
      <div style="background: #e8f5e8; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
        <strong>Demo Mod:</strong> Bu demo bir ödeme formudur.
      </div>
      <button onclick="window.parent.postMessage({type: 'payment_success', paymentId: '${paymentId}'}, '*')" 
              style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
        Ödemeyi Tamamla (Demo)
      </button>
    </div>
  `;
}