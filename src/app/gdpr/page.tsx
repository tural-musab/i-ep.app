'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Download, Shield, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

type DeletionType = 'hard' | 'soft' | 'anonymize';

interface DeletionRequest {
  type: DeletionType;
  reason: string;
  exportDataBeforeDeletion: boolean;
  confirmUnderstanding: boolean;
}

export default function GDPRDataDeletionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [request, setRequest] = useState<DeletionRequest>({
    type: 'soft',
    reason: '',
    exportDataBeforeDeletion: true,
    confirmUnderstanding: false
  });

  const deletionTypes = [
    {
      id: 'soft' as const,
      title: 'Geçici Silme (Soft Delete)',
      description: 'Verileriniz 30 gün boyunca sistem üzerinde kalır, sonra kalıcı olarak silinir.',
      icon: AlertTriangle,
      recommended: true,
      details: [
        '30 gün içinde hesabınızı geri yükleyebilirsiniz',
        'Verileriniz diğer kullanıcılar tarafından görülmez',
        'Sistem logları korunur',
        'Yasal yükümlülükler için gerekli veriler saklanır'
      ]
    },
    {
      id: 'hard' as const,
      title: 'Kalıcı Silme (Hard Delete)',
      description: 'Tüm verileriniz sistem üzerinden kalıcı olarak silinir.',
      icon: Trash2,
      recommended: false,
      details: [
        'Verileriniz tamamen ve geri dönüşü olmayan şekilde silinir',
        'Hesabınızı geri yükleyemezsiniz',
        'Yasal gereklilikler için minimal veri korunabilir',
        'İşlem geri alınamaz'
      ]
    },
    {
      id: 'anonymize' as const,
      title: 'Anonimleştirme',
      description: 'Kişisel verileriniz silinir, anonim istatistiksel veriler korunur.',
      icon: Shield,
      recommended: false,
      details: [
        'Kişisel kimlik bilgileriniz silinir',
        'Anonim istatistiksel veriler korunur',
        'Hesabınıza erişim kaybedilir',
        'İstatistiksel analizler için veriler kullanılabilir'
      ]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!request.confirmUnderstanding) {
      toast({
        title: 'Onay Gerekli',
        description: 'Lütfen sonuçları anladığınızı onaylayın.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/gdpr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: request.type,
          reason: request.reason,
          exportDataBeforeDeletion: request.exportDataBeforeDeletion,
          notifyUser: true,
          notifyAdmin: true
        })
      });

      if (response.ok) {
        setShowSuccess(true);
        toast({
          title: 'Talep Başarıyla Gönderildi',
          description: 'Veri silme talebiniz alındı ve işleme konacak.',
          variant: 'default'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bir hata oluştu');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'Bir hata oluştu',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json' })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Veri Dışa Aktarıldı',
          description: 'Verileriniz başarıyla indirildi.',
          variant: 'default'
        });
      } else {
        throw new Error('Dışa aktarma işlemi başarısız oldu');
      }
         } catch {
       toast({
         title: 'Hata',
         description: 'Veri dışa aktarma işlemi başarısız oldu',
         variant: 'destructive'
       });
     }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-900">Talep Alındı</CardTitle>
            <CardDescription>
              Veri silme talebiniz başarıyla gönderildi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-gray-600">
              Talebiniz 48 saat içinde işleme konacak ve e-posta ile bilgilendirileceksiniz.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/')} 
                className="w-full"
              >
                Ana Sayfaya Dön
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSuccess(false)}
                className="w-full"
              >
                Yeni Talep Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Veri Silme Talebi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            GDPR ve KVKK haklarınız kapsamında kişisel verilerinizin silinmesini talep edebilirsiniz.
          </p>
        </div>

        {/* GDPR Hakları Bilgi Kutusu */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Unutulma Hakkı (GDPR Madde 17):</strong> Kişisel verilerinizin silinmesini talep etme hakkınız bulunmaktadır. 
            Bu işlem geri alınamaz olabileceği için dikkatli seçim yapmanızı öneririz.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Silme Yöntemi Seçin
                </CardTitle>
                <CardDescription>
                  Verilerinizin nasıl işlenmesini istediğinizi belirtin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Silme Türü Seçimi */}
                  <RadioGroup
                    value={request.type}
                    onValueChange={(value) => setRequest(prev => ({ ...prev, type: value as DeletionType }))}
                  >
                    {deletionTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div key={type.id} className="space-y-3">
                          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                            <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="h-4 w-4" />
                                <Label htmlFor={type.id} className="font-medium cursor-pointer">
                                  {type.title}
                                </Label>
                                {type.recommended && (
                                  <Badge variant="secondary" className="text-xs">Önerilen</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {type.description}
                              </p>
                              <ul className="text-xs text-gray-500 space-y-1">
                                {type.details.map((detail, index) => (
                                  <li key={index} className="flex items-start gap-1">
                                    <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>

                  <Separator />

                  {/* Veri Dışa Aktarma */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exportData"
                        checked={request.exportDataBeforeDeletion}
                        onCheckedChange={(checked) => 
                          setRequest(prev => ({ ...prev, exportDataBeforeDeletion: checked as boolean }))
                        }
                      />
                      <Label htmlFor="exportData" className="text-sm">
                        Silmeden önce verilerimi indir
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      Bu seçenek işaretliyse, verileriniz silinmeden önce JSON formatında otomatik olarak indirilir.
                    </p>
                  </div>

                  {/* Sebep */}
                  <div className="space-y-3">
                    <Label htmlFor="reason">Silme Sebebi (İsteğe Bağlı)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Verilerinizi neden silmek istediğinizi açıklayabilirsiniz..."
                      value={request.reason}
                      onChange={(e) => setRequest(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  {/* Onay */}
                  <div className="space-y-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="confirm"
                        checked={request.confirmUnderstanding}
                        onCheckedChange={(checked) => 
                          setRequest(prev => ({ ...prev, confirmUnderstanding: checked as boolean }))
                        }
                      />
                      <Label htmlFor="confirm" className="text-sm leading-relaxed">
                        Bu işlemin sonuçlarını anladığımı ve verilerimin seçtiğim yönteme göre işleneceğini kabul ediyorum. 
                        Bu işlemin geri alınamaz olabileceğini biliyorum.
                      </Label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || !request.confirmUnderstanding}
                  >
                    {isSubmitting ? 'Gönderiliyor...' : 'Silme Talebini Gönder'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Yan Panel */}
          <div className="space-y-6">
            {/* Veri Dışa Aktarma */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Verilerimi İndir
                </CardTitle>
                <CardDescription>
                  Silme işlemi öncesi verilerinizi yedekleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Tüm kişisel verilerinizi JSON formatında indirebilirsiniz.
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleDataExport}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Verilerimi İndir
                </Button>
              </CardContent>
            </Card>

            {/* Yasal Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Yasal Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-3">
                <div>
                  <strong>GDPR Madde 17 - Unutulma Hakkı:</strong>
                  <p>Belirli koşullar altında kişisel verilerinizin silinmesini talep etme hakkınız bulunmaktadır.</p>
                </div>
                <div>
                  <strong>İşlem Süresi:</strong>
                  <p>Talebiniz 48 saat içinde değerlendirilir ve işleme konur.</p>
                </div>
                <div>
                  <strong>İtiraz Hakkı:</strong>
                  <p>Veri işleme faaliyetlerimize itiraz etme hakkınız bulunmaktadır.</p>
                </div>
              </CardContent>
            </Card>

            {/* İletişim */}
            <Card>
              <CardHeader>
                <CardTitle>Yardım mı Lazım?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Veri koruma haklarınız hakkında sorularınız için bizimle iletişime geçin.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  İletişim
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 