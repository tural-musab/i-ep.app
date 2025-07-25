'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DemoTourProps {
  role: string;
  onComplete?: () => void;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  duration: number;
}

const TOUR_STEPS: Record<string, TourStep[]> = {
  admin: [
    {
      id: 'welcome',
      title: 'Hoş Geldiniz Okul Müdürü!',
      description: 'İ-EP.APP ile okul yönetimini kolaylaştıracak özellikleri keşfedin.',
      duration: 3000
    },
    {
      id: 'dashboard',
      title: 'Ana Dashboard',
      description: 'Okula ait tüm verileri tek ekranda görüntüleyin.',
      duration: 4000
    },
    {
      id: 'students',
      title: 'Öğrenci Yönetimi',
      description: 'Öğrenci kayıtları, devam durumu ve not takibini yapın.',
      action: 'Öğrenci listesini görüntüle',
      duration: 5000
    },
    {
      id: 'teachers',
      title: 'Öğretmen Koordinasyonu',
      description: 'Öğretmenlerinizin performansını ve derslerini takip edin.',
      action: 'Öğretmen dashboard\'ına göz atın',
      duration: 5000
    },
    {
      id: 'reports',
      title: 'Raporlar ve Analizler',
      description: 'Detaylı raporlarla okulunuzun performansını değerlendirin.',
      action: 'Örnek rapor oluşturun',
      duration: 4000
    }
  ],
  teacher: [
    {
      id: 'welcome',
      title: 'Hoş Geldiniz Öğretmen!',
      description: 'Sınıf yönetiminizi kolaylaştıracak araçları keşfedin.',
      duration: 3000
    },
    {
      id: 'assignments',
      title: 'Ödev Yönetimi',
      description: 'Ödevlerinizi oluşturun, dağıtın ve değerlendirin.',
      action: 'Yeni ödev oluşturun',
      duration: 5000
    },
    {
      id: 'grades',
      title: 'Not Sistemi',
      description: 'Öğrencilerinizin notlarını girin ve takip edin.',
      action: 'Not girişi yapın',
      duration: 5000
    },
    {
      id: 'attendance',
      title: 'Devam Takibi',
      description: 'Günlük devam durumunu kaydedin ve raporlayın.',
      action: 'Devam kaydı alın',
      duration: 4000
    },
    {
      id: 'communication',
      title: 'Veli İletişimi',
      description: 'Velilerle doğrudan iletişim kurun.',
      action: 'Veli mesajlarını inceleyin',
      duration: 4000
    }
  ],
  student: [
    {
      id: 'welcome',
      title: 'Hoş Geldin Öğrenci!',
      description: 'Derslerini ve ödevlerini takip etmek artık çok kolay.',
      duration: 3000
    },
    {
      id: 'assignments',
      title: 'Ödevlerim',
      description: 'Tüm ödevlerini görüntüle ve teslim et.',
      action: 'Ödev listesini gör',
      duration: 4000
    },
    {
      id: 'grades',
      title: 'Notlarım',
      description: 'Sınav sonuçlarını ve genel notlarını incele.',
      action: 'Not durumunu kontrol et',
      duration: 4000
    },
    {
      id: 'schedule',
      title: 'Ders Programım',
      description: 'Haftalık ders programını ve etkinlikleri gör.',
      action: 'Bu haftaki dersleri incele',
      duration: 4000
    }
  ],
  parent: [
    {
      id: 'welcome',
      title: 'Hoş Geldiniz Sayın Veli!',
      description: 'Çocuğunuzun eğitim sürecini yakından takip edin.',
      duration: 3000
    },
    {
      id: 'progress',
      title: 'Çocuğumun Gelişimi',
      description: 'Akademik performans ve devam durumunu görüntüleyin.',
      action: 'İlerleme raporunu inceleyin',
      duration: 5000
    },
    {
      id: 'communication',
      title: 'Öğretmenlerle İletişim',
      description: 'Öğretmenlerle direkt mesajlaşın.',
      action: 'Öğretmen mesajlarını okuyun',
      duration: 4000
    },
    {
      id: 'meetings',
      title: 'Veli Toplantıları',
      description: 'Toplantı takvimini görün ve randevu alın.',
      action: 'Toplantı planlarını görün',
      duration: 4000
    }
  ]
};

export function ProgressiveDemoTour({ role, onComplete }: DemoTourProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tourSteps] = useState(TOUR_STEPS[role] || TOUR_STEPS.admin);

  useEffect(() => {
    if (!isVisible || currentStep >= tourSteps.length) return;

    const timer = setTimeout(() => {
      if (currentStep < tourSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Tour tamamlandı
        setIsVisible(false);
        onComplete?.();
      }
    }, tourSteps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, isVisible, tourSteps, onComplete]);

  const handleSkipTour = () => {
    setIsVisible(false);
    onComplete?.();
  };

  const handleActionClick = () => {
    console.log(`🎯 Demo action: ${tourSteps[currentStep].action}`);
    // Etkileşimli aksiyonlar burada simüle edilebilir
  };

  if (!isVisible || currentStep >= tourSteps.length) {
    return null;
  }

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Demo Turu</span>
            <span>{currentStep + 1} / {tourSteps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {step.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {step.description}
          </p>

          {step.action && (
            <button
              onClick={handleActionClick}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {step.action}
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-between">
          <button
            onClick={handleSkipTour}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Turu Atla
          </button>
          
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Geri
              </button>
            )}
            
            <button
              onClick={() => {
                if (currentStep < tourSteps.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  handleSkipTour();
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {currentStep < tourSteps.length - 1 ? 'İleri' : 'Turu Bitir'}
            </button>
          </div>
        </div>

        {/* Trial Signup CTA (last step) */}
        {currentStep === tourSteps.length - 1 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">
              Demo'yu beğendiniz mi?
            </h4>
            <p className="text-sm text-green-700 mb-3">
              7 günlük ücretsiz deneme sürümüyle başlayın!
            </p>
            <button
              onClick={() => router.push('/onboarding')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Ücretsiz Denemeye Başla
            </button>
          </div>
        )}
      </div>
    </div>
  );
}