'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, Clock, ArrowRight, ArrowLeft, SkipForward, Play } from 'lucide-react';
import {
  OnboardingFlowManager,
  OnboardingStep,
  OnboardingProgress,
  getStepTitle,
  getStepIcon,
  calculateOnboardingProgress,
  estimateTimeRemaining,
} from '@/lib/onboarding/onboarding-flow';

interface OnboardingWizardProps {
  tenantId: string;
  userId: string;
  userRole: string;
  onComplete?: () => void;
}

export default function OnboardingWizard({
  tenantId,
  userId,
  userRole,
  onComplete,
}: OnboardingWizardProps) {
  const [onboardingManager] = useState(() => new OnboardingFlowManager(tenantId, userId));
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [currentStepData, setCurrentStepData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      let currentProgress = await onboardingManager.getOnboardingProgress();

      if (!currentProgress) {
        currentProgress = await onboardingManager.startOnboarding(userRole);
      }

      setProgress(currentProgress);
      setCurrentStepData(currentProgress.step_data[currentProgress.current_step] || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load onboarding progress');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepComplete = async () => {
    if (!progress) return;

    try {
      setIsValidating(true);
      const updatedProgress = await onboardingManager.completeStep(
        progress.current_step,
        currentStepData
      );
      setProgress(updatedProgress);
      setCurrentStepData(updatedProgress.step_data[updatedProgress.current_step] || {});

      if (updatedProgress.current_step === 'completion') {
        onComplete?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete step');
    } finally {
      setIsValidating(false);
    }
  };

  const handleStepSkip = async () => {
    if (!progress) return;

    try {
      setIsLoading(true);
      const updatedProgress = await onboardingManager.skipStep(
        progress.current_step,
        'User chose to skip'
      );
      setProgress(updatedProgress);
      setCurrentStepData(updatedProgress.step_data[updatedProgress.current_step] || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip step');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStepData = (key: string, value: any) => {
    setCurrentStepData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderStepContent = () => {
    if (!progress) return null;

    const stepConfig = onboardingManager.getStepConfig(progress.current_step, userRole);
    if (!stepConfig) return null;

    switch (progress.current_step) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4 text-6xl">🎉</div>
              <h2 className="mb-2 text-2xl font-bold">İ-EP.APP'e Hoş Geldiniz!</h2>
              <p className="mb-6 text-gray-600">
                Kapsamlı okul yönetim sisteminize hoş geldiniz. Sizi birkaç adımda sisteme
                alıştıracağız.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">📊 Özellikler</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Not yönetimi ve takibi
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Devamsızlık kontrolü
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Veli iletişimi
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Ödev yönetimi
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">⏱️ Kurulum Süresi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Toplam süre:</span>
                      <Badge variant="outline">~15 dakika</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Adım sayısı:</span>
                      <Badge variant="outline">6 adım</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tamamlanma oranı:</span>
                      <Badge variant="outline">%95</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-4">
              <Play className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                Hazır olduğunuzda "Devam Et" butonuna tıklayarak başlayabilirsiniz.
              </span>
            </div>
          </div>
        );

      case 'school_setup':
        return (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <div className="mb-2 text-4xl">🏫</div>
              <h2 className="text-xl font-bold">Okul Bilgilerinizi Girin</h2>
              <p className="text-gray-600">Okul bilgilerinizi ekleyerek sistemi kişiselleştirin.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="school_name">Okul Adı *</Label>
                <Input
                  id="school_name"
                  value={currentStepData.school_name || ''}
                  onChange={(e) => updateStepData('school_name', e.target.value)}
                  placeholder="Örnek: Atatürk İlkokulu"
                />
              </div>

              <div>
                <Label htmlFor="school_type">Okul Türü *</Label>
                <Select
                  value={currentStepData.school_type || ''}
                  onValueChange={(value) => updateStepData('school_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Okul türünü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="İlkokul">İlkokul</SelectItem>
                    <SelectItem value="Ortaokul">Ortaokul</SelectItem>
                    <SelectItem value="Lise">Lise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Adres *</Label>
                <Textarea
                  id="address"
                  value={currentStepData.address || ''}
                  onChange={(e) => updateStepData('address', e.target.value)}
                  placeholder="Okul adresini girin"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={currentStepData.phone || ''}
                  onChange={(e) => updateStepData('phone', e.target.value)}
                  placeholder="0212 123 45 67"
                />
              </div>

              <div>
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentStepData.email || ''}
                  onChange={(e) => updateStepData('email', e.target.value)}
                  placeholder="info@okul.edu.tr"
                />
              </div>
            </div>
          </div>
        );

      case 'user_profile':
        return (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <div className="mb-2 text-4xl">👤</div>
              <h2 className="text-xl font-bold">Profilinizi Tamamlayın</h2>
              <p className="text-gray-600">
                Kişisel bilgilerinizi ekleyerek deneyiminizi kişiselleştirin.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="display_name">Görünen Ad *</Label>
                <Input
                  id="display_name"
                  value={currentStepData.display_name || ''}
                  onChange={(e) => updateStepData('display_name', e.target.value)}
                  placeholder="Adınız ve soyadınız"
                />
              </div>

              <div>
                <Label htmlFor="bio">Hakkımda</Label>
                <Textarea
                  id="bio"
                  value={currentStepData.bio || ''}
                  onChange={(e) => updateStepData('bio', e.target.value)}
                  placeholder="Kendinizi tanıtın (isteğe bağlı)"
                />
              </div>

              <div>
                <Label>Bildirim Tercihleri</Label>
                <div className="mt-2 space-y-2">
                  {['email', 'sms', 'push'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={currentStepData.notifications?.includes(type) || false}
                        onCheckedChange={(checked) => {
                          const current = currentStepData.notifications || [];
                          if (checked) {
                            updateStepData('notifications', [...current, type]);
                          } else {
                            updateStepData(
                              'notifications',
                              current.filter((t: string) => t !== type)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={type} className="capitalize">
                        {type === 'email'
                          ? 'E-posta'
                          : type === 'sms'
                            ? 'SMS'
                            : 'Push Bildirimleri'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'class_setup':
        return (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <div className="mb-2 text-4xl">📚</div>
              <h2 className="text-xl font-bold">İlk Sınıfınızı Oluşturun</h2>
              <p className="text-gray-600">Bir sınıf oluşturarak öğrenci yönetimine başlayın.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="class_name">Sınıf Adı *</Label>
                <Input
                  id="class_name"
                  value={currentStepData.class_name || ''}
                  onChange={(e) => updateStepData('class_name', e.target.value)}
                  placeholder="Örnek: 5-A"
                />
              </div>

              <div>
                <Label htmlFor="grade_level">Seviye *</Label>
                <Select
                  value={currentStepData.grade_level || ''}
                  onValueChange={(value) => updateStepData('grade_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seviye seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1. Sınıf</SelectItem>
                    <SelectItem value="2">2. Sınıf</SelectItem>
                    <SelectItem value="3">3. Sınıf</SelectItem>
                    <SelectItem value="4">4. Sınıf</SelectItem>
                    <SelectItem value="5">5. Sınıf</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Ders *</Label>
                <Select
                  value={currentStepData.subject || ''}
                  onValueChange={(value) => updateStepData('subject', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ders seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matematik">Matematik</SelectItem>
                    <SelectItem value="Türkçe">Türkçe</SelectItem>
                    <SelectItem value="Fen Bilgisi">Fen Bilgisi</SelectItem>
                    <SelectItem value="Sosyal Bilgiler">Sosyal Bilgiler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="student_capacity">Öğrenci Kapasitesi</Label>
                <Input
                  id="student_capacity"
                  type="number"
                  value={currentStepData.student_capacity || 30}
                  onChange={(e) => updateStepData('student_capacity', parseInt(e.target.value))}
                  placeholder="30"
                />
              </div>
            </div>

            <Alert>
              <AlertDescription>
                💡 Sınıf oluşturduktan sonra öğrenci ekleme özelliğini kullanarak öğrencilerinizi
                sisteme davet edebilirsiniz.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'integration_setup':
        return (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <div className="mb-2 text-4xl">🔗</div>
              <h2 className="text-xl font-bold">Entegrasyonlar</h2>
              <p className="text-gray-600">
                Mevcut sistemlerinizi İ-EP.APP ile entegre edin (isteğe bağlı).
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500 text-white">
                      G
                    </div>
                    Google Classroom
                  </CardTitle>
                  <CardDescription>
                    Mevcut Google Classroom derslerinizi senkronize edin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="google_classroom"
                      checked={currentStepData.google_classroom || false}
                      onCheckedChange={(checked) => updateStepData('google_classroom', checked)}
                    />
                    <Label htmlFor="google_classroom">
                      Google Classroom entegrasyonunu etkinleştir
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-500 text-white">
                      T
                    </div>
                    Microsoft Teams
                  </CardTitle>
                  <CardDescription>Microsoft Teams for Education ile entegre olun</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="microsoft_teams"
                      checked={currentStepData.microsoft_teams || false}
                      onCheckedChange={(checked) => updateStepData('microsoft_teams', checked)}
                    />
                    <Label htmlFor="microsoft_teams">
                      Microsoft Teams entegrasyonunu etkinleştir
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-green-500 text-white">
                      @
                    </div>
                    E-posta Bildirimleri
                  </CardTitle>
                  <CardDescription>Otomatik e-posta bildirimlerini yapılandırın</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email_notifications"
                      checked={currentStepData.email_notifications !== false}
                      onCheckedChange={(checked) => updateStepData('email_notifications', checked)}
                    />
                    <Label htmlFor="email_notifications">E-posta bildirimlerini etkinleştir</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'completion':
        return (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <div className="mb-4 text-6xl">🎉</div>
              <h2 className="text-2xl font-bold text-green-600">Tebrikler!</h2>
              <p className="text-gray-600">
                Onboarding sürecini başarıyla tamamladınız. Artık İ-EP.APP'i kullanmaya
                başlayabilirsiniz.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">📊 Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-gray-600">
                    Ana kontrol panelinizde tüm önemli bilgileri görebilirsiniz.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                    Dashboard'a Git
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">📚 Ödevler</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-gray-600">
                    Ödev oluşturma ve yönetimi için ödev sistemini kullanın.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/assignments')}
                  >
                    Ödevleri Görüntüle
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">🎯 Notlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-gray-600">
                    Öğrenci notlarını girin ve takip edin.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/grades')}
                  >
                    Notları Görüntüle
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">💬 İletişim</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-gray-600">
                    Veliler ile iletişim kurarak öğrenci gelişimini paylaşın.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/parent-communication')}
                  >
                    İletişime Geç
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="completion_acknowledged"
                checked={currentStepData.completion_acknowledged || false}
                onCheckedChange={(checked) => updateStepData('completion_acknowledged', checked)}
              />
              <Label htmlFor="completion_acknowledged">
                Sistemi kullanmaya hazırım ve onboarding sürecini tamamladım.
              </Label>
            </div>
          </div>
        );

      default:
        return <div>Bilinmeyen adım</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Onboarding durumu yüklenemedi.</p>
      </div>
    );
  }

  const progressPercentage = calculateOnboardingProgress(progress.completed_steps);
  const template = onboardingManager.getStepConfig(progress.current_step, userRole);
  const timeRemaining = template
    ? estimateTimeRemaining(progress.current_step, {
        steps: [template],
        estimated_total_time: 900,
      } as any)
    : 0;

  const isStepComplete = progress.current_step === 'completion';
  const canSkip = template && !template.required;
  const isCurrentStepValid = () => {
    switch (progress.current_step) {
      case 'welcome':
        return true;
      case 'school_setup':
        return (
          currentStepData.school_name &&
          currentStepData.school_type &&
          currentStepData.address &&
          currentStepData.phone &&
          currentStepData.email
        );
      case 'user_profile':
        return currentStepData.display_name;
      case 'class_setup':
        return currentStepData.class_name && currentStepData.grade_level && currentStepData.subject;
      case 'integration_setup':
        return true;
      case 'completion':
        return currentStepData.completion_acknowledged;
      default:
        return false;
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kurulum Sihirbazı</h1>
            <p className="text-gray-600">
              {getStepTitle(progress.current_step)} • {progressPercentage}% tamamlandı
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              ~{Math.ceil(timeRemaining / 60)} dakika kaldı
            </span>
          </div>
        </div>

        <Progress value={progressPercentage} className="mb-4" />

        {/* Steps Progress */}
        <div className="flex items-center justify-between">
          {(
            [
              'welcome',
              'school_setup',
              'user_profile',
              'class_setup',
              'integration_setup',
              'completion',
            ] as OnboardingStep[]
          ).map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  progress.completed_steps.includes(step)
                    ? 'bg-green-500 text-white'
                    : progress.current_step === step
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {progress.completed_steps.includes(step) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span>{getStepIcon(step)}</span>
                )}
              </div>
              <span className="mt-1 max-w-[80px] text-center text-xs text-gray-600">
                {getStepTitle(step)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="p-6">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {progress.current_step !== 'welcome' && (
            <Button variant="outline" onClick={() => window.history.back()} disabled={isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canSkip && (
            <Button variant="ghost" onClick={handleStepSkip} disabled={isLoading}>
              <SkipForward className="mr-2 h-4 w-4" />
              Atla
            </Button>
          )}

          <Button
            onClick={isStepComplete ? onComplete : handleStepComplete}
            disabled={!isCurrentStepValid() || isValidating}
            className="min-w-[120px]"
          >
            {isValidating ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {isStepComplete ? 'Başlayalım' : 'Devam Et'}
          </Button>
        </div>
      </div>
    </div>
  );
}
