/**
 * Payment Form Component
 * Sprint 1: Payment Integration Foundation
 * 
 * Handles payment form UI for subscription payments
 * Integrates with İyzico payment gateway
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// FORM VALIDATION SCHEMA
// ==========================================

const paymentFormSchema = z.object({
  // Customer Information
  customerInfo: z.object({
    firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
    identityNumber: z.string().length(11, 'TC Kimlik No 11 haneli olmalıdır'),
  }),
  
  // Billing Address
  billingAddress: z.object({
    address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
    city: z.string().min(2, 'Şehir seçiniz'),
    zipCode: z.string().min(5, 'Posta kodu en az 5 karakter olmalıdır'),
    country: z.string().default('Türkiye'),
  }),
  
  // Payment Information
  paymentCard: z.object({
    cardHolderName: z.string().min(5, 'Kart sahibi adı en az 5 karakter olmalıdır'),
    cardNumber: z.string().min(16, 'Kart numarası 16 haneli olmalıdır').max(19),
    expireMonth: z.string().min(2, 'Geçerli bir ay seçiniz'),
    expireYear: z.string().min(4, 'Geçerli bir yıl seçiniz'),
    cvc: z.string().min(3, 'CVC en az 3 haneli olmalıdır').max(4),
  }),
  
  // Options
  saveCard: z.boolean().default(false),
  acceptTerms: z.boolean().refine(val => val === true, 'Şartları kabul etmelisiniz'),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

// ==========================================
// COMPONENT PROPS
// ==========================================

export interface PaymentFormProps {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function PaymentForm({
  planId,
  planName,
  amount,
  currency,
  billingCycle,
  onPaymentSuccess,
  onPaymentError,
  className,
  disabled = false,
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      customerInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        identityNumber: '',
      },
      billingAddress: {
        address: '',
        city: '',
        zipCode: '',
        country: 'Türkiye',
      },
      paymentCard: {
        cardHolderName: '',
        cardNumber: '',
        expireMonth: '',
        expireYear: '',
        cvc: '',
      },
      saveCard: false,
      acceptTerms: false,
    },
  });
  
  // ==========================================
  // FORM HANDLERS
  // ==========================================
  
  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Prepare payment request
      const paymentRequest = {
        planId,
        amount: amount.toFixed(2),
        currency,
        billingCycle,
        customerInfo: data.customerInfo,
        billingAddress: data.billingAddress,
        paymentCard: {
          ...data.paymentCard,
          registerCard: data.saveCard ? '1' : '0',
        },
      };
      
      // Call payment API
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Ödeme işlemi başarısız oldu');
      }
      
      if (result.status === 'success') {
        onPaymentSuccess(result);
      } else {
        throw new Error(result.errorMessage || 'Ödeme işlemi başarısız oldu');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ödeme işlemi sırasında bir hata oluştu';
      setPaymentError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // ==========================================
  // INPUT FORMATTERS
  // ==========================================
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };
  
  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 10) {
      return v.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '($1) $2 $3 $4');
    }
    return v;
  };
  
  // ==========================================
  // TURKISH CITIES
  // ==========================================
  
  const turkishCities = [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
    'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
    'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
    'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Isparta',
    'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
    'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
    'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt',
    'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
    'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman',
    'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce',
  ];
  
  // ==========================================
  // RENDER
  // ==========================================
  
  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Ödeme Bilgileri
        </CardTitle>
        <CardDescription>
          {planName} planı için {billingCycle === 'yearly' ? 'yıllık' : 'aylık'} ödeme ({amount} {currency})
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Payment Error Alert */}
          {paymentError && (
            <Alert variant="destructive">
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}
          
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Müşteri Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Ad *</Label>
                <Input
                  id="firstName"
                  {...form.register('customerInfo.firstName')}
                  disabled={disabled || isProcessing}
                  placeholder="Adınız"
                />
                {form.formState.errors.customerInfo?.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.customerInfo.firstName.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Soyad *</Label>
                <Input
                  id="lastName"
                  {...form.register('customerInfo.lastName')}
                  disabled={disabled || isProcessing}
                  placeholder="Soyadınız"
                />
                {form.formState.errors.customerInfo?.lastName && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.customerInfo.lastName.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('customerInfo.email')}
                  disabled={disabled || isProcessing}
                  placeholder="ornek@email.com"
                />
                {form.formState.errors.customerInfo?.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.customerInfo.email.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  {...form.register('customerInfo.phone')}
                  disabled={disabled || isProcessing}
                  placeholder="(555) 123 45 67"
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    form.setValue('customerInfo.phone', formatted);
                  }}
                />
                {form.formState.errors.customerInfo?.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.customerInfo.phone.message}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="identityNumber">TC Kimlik No *</Label>
                <Input
                  id="identityNumber"
                  {...form.register('customerInfo.identityNumber')}
                  disabled={disabled || isProcessing}
                  placeholder="12345678901"
                  maxLength={11}
                />
                {form.formState.errors.customerInfo?.identityNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.customerInfo.identityNumber.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Billing Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fatura Adresi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Adres *</Label>
                <Input
                  id="address"
                  {...form.register('billingAddress.address')}
                  disabled={disabled || isProcessing}
                  placeholder="Tam adresinizi giriniz"
                />
                {form.formState.errors.billingAddress?.address && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.billingAddress.address.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="city">Şehir *</Label>
                <Select onValueChange={(value) => form.setValue('billingAddress.city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şehir seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {turkishCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.billingAddress?.city && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.billingAddress.city.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="zipCode">Posta Kodu *</Label>
                <Input
                  id="zipCode"
                  {...form.register('billingAddress.zipCode')}
                  disabled={disabled || isProcessing}
                  placeholder="34000"
                />
                {form.formState.errors.billingAddress?.zipCode && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.billingAddress.zipCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Payment Card */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Kart Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="cardHolderName">Kart Sahibi *</Label>
                <Input
                  id="cardHolderName"
                  {...form.register('paymentCard.cardHolderName')}
                  disabled={disabled || isProcessing}
                  placeholder="Kart üzerindeki isim"
                />
                {form.formState.errors.paymentCard?.cardHolderName && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.paymentCard.cardHolderName.message}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="cardNumber">Kart Numarası *</Label>
                <Input
                  id="cardNumber"
                  {...form.register('paymentCard.cardNumber')}
                  disabled={disabled || isProcessing}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    form.setValue('paymentCard.cardNumber', formatted);
                  }}
                />
                {form.formState.errors.paymentCard?.cardNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.paymentCard.cardNumber.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="expireMonth">Son Kullanma Ayı *</Label>
                <Select onValueChange={(value) => form.setValue('paymentCard.expireMonth', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ay" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentCard?.expireMonth && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.paymentCard.expireMonth.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="expireYear">Son Kullanma Yılı *</Label>
                <Select onValueChange={(value) => form.setValue('paymentCard.expireYear', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Yıl" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentCard?.expireYear && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.paymentCard.expireYear.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="cvc">CVC *</Label>
                <Input
                  id="cvc"
                  {...form.register('paymentCard.cvc')}
                  disabled={disabled || isProcessing}
                  placeholder="123"
                  maxLength={4}
                />
                {form.formState.errors.paymentCard?.cvc && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.paymentCard.cvc.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveCard"
                checked={form.watch('saveCard')}
                onCheckedChange={(checked) => form.setValue('saveCard', checked as boolean)}
                disabled={disabled || isProcessing}
              />
              <Label htmlFor="saveCard" className="text-sm">
                Kartımı kaydet (gelecek ödemeler için)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={form.watch('acceptTerms')}
                onCheckedChange={(checked) => form.setValue('acceptTerms', checked as boolean)}
                disabled={disabled || isProcessing}
              />
              <Label htmlFor="acceptTerms" className="text-sm">
                <span className="text-red-500">*</span> Hizmet şartlarını ve gizlilik politikasını kabul ediyorum
              </Label>
            </div>
            {form.formState.errors.acceptTerms && (
              <p className="text-sm text-red-500">
                {form.formState.errors.acceptTerms.message}
              </p>
            )}
          </div>
          
          {/* Security Notice */}
          <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
            <Shield className="h-5 w-5 text-green-600" />
            <div className="text-sm text-green-700">
              <strong>Güvenli Ödeme:</strong> Tüm ödeme bilgileriniz SSL ile şifrelenir ve güvenli bir şekilde işlenir.
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={disabled || isProcessing || !form.watch('acceptTerms')}
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                {amount} {currency} Öde
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default PaymentForm;