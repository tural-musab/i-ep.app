/**
 * Parent Payment Management Page
 * Allows parents to view and make payments for their students
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth/auth-context';
import { formatTurkishCurrency, validateTurkishIdentityNumber } from '@/lib/payment/iyzico-client';
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Download,
  FileText,
  DollarSign,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';

interface PaymentItem {
  id: string;
  studentId: string;
  studentName: string;
  paymentType: 'tuition' | 'meal' | 'transport' | 'book' | 'uniform' | 'activity' | 'exam';
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid' | 'cancelled';
  academicYear: string;
  semester: 'fall' | 'spring' | 'summer';
  installmentOptions?: number[];
  createdAt: string;
  paidAt?: string;
  transactionId?: string;
}

interface PaymentHistory {
  id: string;
  paymentId: string;
  amount: number;
  paymentType: string;
  studentName: string;
  paidAt: string;
  method: string;
  installments: number;
  status: 'completed' | 'refunded' | 'failed';
  transactionId: string;
  receiptUrl?: string;
}

// Demo payment data
const DEMO_PAYMENTS: PaymentItem[] = [
  {
    id: 'payment-1',
    studentId: 'student-demo-001',
    studentName: 'Ahmet Yılmaz',
    paymentType: 'tuition',
    amount: 2500,
    description: '2024-2025 Güz Dönemi Okul Ücreti',
    dueDate: '2025-09-15',
    status: 'pending',
    academicYear: '2024-2025',
    semester: 'fall',
    installmentOptions: [1, 2, 3, 6],
    createdAt: '2025-07-01'
  },
  {
    id: 'payment-2',
    studentId: 'student-demo-001',
    studentName: 'Ahmet Yılmaz',
    paymentType: 'meal',
    amount: 450,
    description: 'Ağustos Ayı Yemek Ücreti',
    dueDate: '2025-08-01',
    status: 'pending',
    academicYear: '2024-2025',
    semester: 'fall',
    installmentOptions: [1],
    createdAt: '2025-07-15'
  },
  {
    id: 'payment-3',
    studentId: 'student-demo-001',
    studentName: 'Ahmet Yılmaz',
    paymentType: 'transport',
    amount: 380,
    description: 'Eylül Ayı Servis Ücreti',
    dueDate: '2025-08-25',
    status: 'overdue',
    academicYear: '2024-2025',
    semester: 'fall',
    installmentOptions: [1],
    createdAt: '2025-07-01'
  }
];

const DEMO_PAYMENT_HISTORY: PaymentHistory[] = [
  {
    id: 'history-1',
    paymentId: 'payment-prev-1',
    amount: 2200,
    paymentType: 'tuition',
    studentName: 'Ahmet Yılmaz',
    paidAt: '2025-06-15',
    method: 'Kredi Kartı',
    installments: 2,
    status: 'completed',
    transactionId: 'txn-20250615-001',
    receiptUrl: '/receipts/txn-20250615-001.pdf'
  },
  {
    id: 'history-2',
    paymentId: 'payment-prev-2',
    amount: 420,
    paymentType: 'meal',
    studentName: 'Ahmet Yılmaz',
    paidAt: '2025-06-01',
    method: 'Banka Kartı',
    installments: 1,
    status: 'completed',
    transactionId: 'txn-20250601-002'
  }
];

const PAYMENT_TYPE_NAMES = {
  tuition: 'Okul Ücreti',
  meal: 'Yemek Ücreti',
  transport: 'Servis Ücreti',
  book: 'Kitap Ücreti',
  uniform: 'Üniforma Ücreti',
  activity: 'Etkinlik Ücreti',
  exam: 'Sınav Ücreti'
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

const STATUS_NAMES = {
  pending: 'Bekliyor',
  overdue: 'Gecikmiş',
  paid: 'Ödendi',
  cancelled: 'İptal'
};

function PaymentCard({ payment, onPayClick }: { payment: PaymentItem; onPayClick: (payment: PaymentItem) => void }) {
  const isOverdue = payment.status === 'overdue';
  const isPaid = payment.status === 'paid';

  return (
    <Card className={`transition-all hover:shadow-md ${isOverdue ? 'border-red-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{PAYMENT_TYPE_NAMES[payment.paymentType]}</CardTitle>
              <CardDescription className="text-xs">{payment.studentName}</CardDescription>
            </div>
          </div>
          <Badge className={STATUS_COLORS[payment.status]}>
            {STATUS_NAMES[payment.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-900">
              {formatTurkishCurrency(payment.amount)}
            </span>
            <div className="text-right">
              <div className="text-xs text-gray-500">Son Ödeme</div>
              <div className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                {new Date(payment.dueDate).toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {payment.description}
          </div>

          {payment.installmentOptions && payment.installmentOptions.length > 1 && (
            <div className="text-xs text-blue-600">
              {payment.installmentOptions.join(', ')} taksit seçeneği mevcut
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {!isPaid && (
              <Button 
                onClick={() => onPayClick(payment)}
                className="flex-1"
                variant={isOverdue ? "destructive" : "default"}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Ödeme Yap
              </Button>
            )}
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentModal({ payment, isOpen, onClose }: { 
  payment: PaymentItem | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [selectedInstallments, setSelectedInstallments] = useState(1);
  const [parentInfo, setParentInfo] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    identityNumber: '',
    address: '',
    city: 'İstanbul'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!payment) return;

    // Validate Turkish ID number
    if (!validateTurkishIdentityNumber(parentInfo.identityNumber)) {
      alert('Geçersiz TC Kimlik Numarası');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData = {
        studentId: payment.studentId,
        paymentType: payment.paymentType,
        amount: payment.amount,
        description: payment.description,
        installments: selectedInstallments,
        parentInfo
      };

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (result.success) {
        // Open payment form in iframe or redirect
        const paymentWindow = window.open('', 'payment', 'width=800,height=600');
        if (paymentWindow) {
          paymentWindow.document.write(result.data.checkoutFormContent);
          
          // Listen for payment completion
          const messageHandler = (event: MessageEvent) => {
            if (event.data.type === 'payment_success') {
              alert('Ödeme başarıyla tamamlandı!');
              paymentWindow.close();
              window.removeEventListener('message', messageHandler);
              onClose();
              // Refresh payments list
              window.location.reload();
            }
          };
          
          window.addEventListener('message', messageHandler);
        }
      } else {
        alert('Ödeme oluşturulurken hata: ' + result.error);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Ödeme işlemi sırasında hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!payment) return null;

  const installmentAmount = payment.amount / selectedInstallments;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ödeme Bilgileri</DialogTitle>
          <DialogDescription>
            {payment.studentName} - {PAYMENT_TYPE_NAMES[payment.paymentType]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Toplam Tutar:</span>
              <span className="text-2xl font-bold">{formatTurkishCurrency(payment.amount)}</span>
            </div>
            <div className="text-sm text-gray-600">{payment.description}</div>
          </div>

          {/* Installment Options */}
          {payment.installmentOptions && payment.installmentOptions.length > 1 && (
            <div>
              <Label className="text-sm font-medium">Taksit Seçenekleri</Label>
              <Select value={selectedInstallments.toString()} onValueChange={(value) => setSelectedInstallments(parseInt(value))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {payment.installmentOptions.map(option => (
                    <SelectItem key={option} value={option.toString()}>
                      {option} Taksit - {formatTurkishCurrency(installmentAmount)} / ay
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Parent Information Form */}
          <div className="space-y-4">
            <h3 className="font-medium">Fatura Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Ad</Label>
                <Input
                  id="name"
                  value={parentInfo.name}
                  onChange={(e) => setParentInfo({...parentInfo, name: e.target.value})}
                  placeholder="Adınız"
                  required
                />
              </div>
              <div>
                <Label htmlFor="surname">Soyad</Label>
                <Input
                  id="surname"
                  value={parentInfo.surname}
                  onChange={(e) => setParentInfo({...parentInfo, surname: e.target.value})}
                  placeholder="Soyadınız"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={parentInfo.email}
                  onChange={(e) => setParentInfo({...parentInfo, email: e.target.value})}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={parentInfo.phone}
                  onChange={(e) => setParentInfo({...parentInfo, phone: e.target.value})}
                  placeholder="+90 555 123 4567"
                  required
                />
              </div>
              <div>
                <Label htmlFor="identityNumber">TC Kimlik No</Label>
                <Input
                  id="identityNumber"
                  value={parentInfo.identityNumber}
                  onChange={(e) => setParentInfo({...parentInfo, identityNumber: e.target.value})}
                  placeholder="12345678901"
                  maxLength={11}
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">Şehir</Label>
                <Select value={parentInfo.city} onValueChange={(value) => setParentInfo({...parentInfo, city: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="İstanbul">İstanbul</SelectItem>
                    <SelectItem value="Ankara">Ankara</SelectItem>
                    <SelectItem value="İzmir">İzmir</SelectItem>
                    <SelectItem value="Bursa">Bursa</SelectItem>
                    <SelectItem value="Antalya">Antalya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                value={parentInfo.address}
                onChange={(e) => setParentInfo({...parentInfo, address: e.target.value})}
                placeholder="Fatura adresiniz"
                required
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? 'Ödeme Hazırlanıyor...' : `${formatTurkishCurrency(payment.amount)} Öde`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ParentPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentItem[]>(DEMO_PAYMENTS);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>(DEMO_PAYMENT_HISTORY);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary statistics
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = paymentHistory.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  const handlePayClick = (payment: PaymentItem) => {
    setSelectedPayment(payment);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ödemeler</h1>
        <p className="text-gray-600">Öğrenci ödemelerinizi görüntüleyin ve yönetin</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bekleyen Ödemeler</p>
                <p className="text-2xl font-bold text-yellow-600">{formatTurkishCurrency(totalPending)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Geciken Ödemeler</p>
                <p className="text-2xl font-bold text-red-600">{formatTurkishCurrency(totalOverdue)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bu Yıl Ödenen</p>
                <p className="text-2xl font-bold text-green-600">{formatTurkishCurrency(totalPaid)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Bekleyen Ödemeler</TabsTrigger>
          <TabsTrigger value="history">Ödeme Geçmişi</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Ödeme ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Bekliyor</SelectItem>
                <SelectItem value="overdue">Gecikmiş</SelectItem>
                <SelectItem value="paid">Ödendi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPayments.map(payment => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onPayClick={handlePayClick}
              />
            ))}
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Ödeme bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">Arama kriterlerinize uygun ödeme bulunmuyor.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Geçmişi</CardTitle>
              <CardDescription>Geçmiş ödemeleriniz ve makbuzları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map(payment => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{payment.paymentType} - {payment.studentName}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(payment.paidAt).toLocaleDateString('tr-TR')} • {payment.method}
                          {payment.installments > 1 && ` • ${payment.installments} Taksit`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{formatTurkishCurrency(payment.amount)}</div>
                        <Badge variant="outline" className="text-green-600">
                          {payment.status === 'completed' ? 'Tamamlandı' : 'İade Edildi'}
                        </Badge>
                      </div>
                      {payment.receiptUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      <PaymentModal
        payment={selectedPayment}
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedPayment(null);
        }}
      />
    </div>
  );
}