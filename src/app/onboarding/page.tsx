'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Step içeriği tanımı
interface StepContent {
  title: string;
  description: string;
  component: React.ReactNode;
}

export default function OnboardingPortal() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolType: '',
    adminName: '',
    email: '',
    phone: '',
    subdomain: '',
    planType: 'standard',
    acceptTerms: false
  });
  
  // Form verisini güncelle
  const updateFormData = (key: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Subdomaini okul adına göre otomatik oluştur
  const generateSubdomain = (schoolName: string) => {
    return schoolName
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Okul adı değiştiğinde subdomain öner
  const handleSchoolNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    updateFormData('schoolName', name);
    
    if (name.length > 0) {
      const suggestedSubdomain = generateSubdomain(name);
      updateFormData('subdomain', suggestedSubdomain);
    }
  };

  // İleri butonu tıklaması
  const handleNext = () => {
    // Son adımda kayıt işlemi yap
    if (currentStep === steps.length - 1) {
      // Burada API çağrısı yapılabilir
      router.push(`/auth/kayit?tenant=${formData.subdomain}&email=${formData.email}`);
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };

  // Geri butonu tıklaması
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Adım bileşenleri
  const StepSchoolInfo = (
    <div className="space-y-4">
      <div>
        <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
          Okul Adı
        </label>
        <input
          type="text"
          id="schoolName"
          value={formData.schoolName}
          onChange={handleSchoolNameChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Örn: Cumhuriyet İlkokulu"
          required
        />
      </div>
      
      <div>
        <label htmlFor="schoolType" className="block text-sm font-medium text-gray-700">
          Okul Türü
        </label>
        <select
          id="schoolType"
          value={formData.schoolType}
          onChange={(e) => updateFormData('schoolType', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Seçiniz</option>
          <option value="ilkokul">İlkokul</option>
          <option value="ortaokul">Ortaokul</option>
          <option value="lise">Lise</option>
          <option value="anaokulu">Anaokulu</option>
          <option value="ozelEgitim">Özel Eğitim</option>
          <option value="meslek">Meslek Lisesi</option>
          <option value="diger">Diğer</option>
        </select>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-blue-800">İpucu</h4>
        <p className="text-sm text-blue-700">
          Okul türünü doğru seçmek, sistemi kuruluşunuza özel hazırlamamıza yardımcı olur.
        </p>
      </div>
    </div>
  );

  const StepAdminInfo = (
    <div className="space-y-4">
      <div>
        <label htmlFor="adminName" className="form-label">
          Yönetici Adı Soyadı
        </label>
        <input
          type="text"
          id="adminName"
          value={formData.adminName}
          onChange={(e) => updateFormData('adminName', e.target.value)}
          className="form-input"
          placeholder="Adınız ve soyadınız"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="form-label">
          E-posta Adresi
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          className="form-input"
          placeholder="Email adresiniz"
          required
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="form-label">
          Telefon Numarası
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          className="form-input"
          placeholder="05XX XXX XX XX"
        />
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-yellow-800">Önemli</h4>
        <p className="text-sm text-yellow-700">
          E-posta adresiniz, sistemde yönetici hesabınızın oluşturulması için kullanılacaktır.
        </p>
      </div>
    </div>
  );

  const StepDomainInfo = (
    <div className="space-y-4">
      <div>
        <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
          Subdomain (Web Adresi)
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="subdomain"
            value={formData.subdomain}
            onChange={(e) => updateFormData('subdomain', e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="okulunuz"
            required
          />
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
            .i-ep.app
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Bu, okulunuzun portalına erişmek için kullanılacak web adresidir.
        </p>
      </div>
      
      <div>
        <label htmlFor="planType" className="block text-sm font-medium text-gray-700">
          Abonelik Planı
        </label>
        <select
          id="planType"
          value={formData.planType}
          onChange={(e) => updateFormData('planType', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="free">Ücretsiz Plan</option>
          <option value="standard">Standart Plan</option>
          <option value="premium">Premium Plan</option>
        </select>
      </div>
      
      <div className="bg-green-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-green-800">Öneri</h4>
        <p className="text-sm text-green-700">
          Subdomain adınız kolay hatırlanabilir ve okulunuzun adını yansıtan bir isim olmalıdır.
        </p>
      </div>
      
      {formData.planType === 'premium' && (
        <div className="border border-blue-300 bg-blue-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-blue-800">Premium Özellik</h4>
          <p className="text-sm text-blue-700">
            Premium plan ile kendi alan adınızı (örn: portal.okulunuz.com) kullanabilirsiniz.
            Kurulum tamamlandıktan sonra admin panelinden özel domain ekleyebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );

  const StepSummary = (
    <div className="space-y-4">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Özet Bilgiler</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <span className="text-sm font-medium text-gray-500">Okul Adı:</span>
            <p className="mt-1 text-sm text-gray-900">{formData.schoolName}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Okul Türü:</span>
            <p className="mt-1 text-sm text-gray-900">
              {formData.schoolType === 'ilkokul' && 'İlkokul'}
              {formData.schoolType === 'ortaokul' && 'Ortaokul'}
              {formData.schoolType === 'lise' && 'Lise'}
              {formData.schoolType === 'anaokulu' && 'Anaokulu'}
              {formData.schoolType === 'ozelEgitim' && 'Özel Eğitim'}
              {formData.schoolType === 'meslek' && 'Meslek Lisesi'}
              {formData.schoolType === 'diger' && 'Diğer'}
            </p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Yönetici:</span>
            <p className="mt-1 text-sm text-gray-900">{formData.adminName}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">E-posta:</span>
            <p className="mt-1 text-sm text-gray-900">{formData.email}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Web Adresi:</span>
            <p className="mt-1 text-sm text-gray-900">{formData.subdomain}.i-ep.app</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Plan:</span>
            <p className="mt-1 text-sm text-gray-900">
              {formData.planType === 'free' && 'Ücretsiz Plan'}
              {formData.planType === 'standard' && 'Standart Plan'}
              {formData.planType === 'premium' && 'Premium Plan'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          id="acceptTerms"
          name="acceptTerms"
          type="checkbox"
          checked={formData.acceptTerms}
          onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          required
        />
        <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
          <span>
            <Link href="/hukuki/kullanim-kosullari" className="font-medium text-blue-600 hover:text-blue-500">
              Kullanım Koşullarını
            </Link>{' '}
            ve{' '}
            <Link href="/hukuki/gizlilik-politikasi" className="font-medium text-blue-600 hover:text-blue-500">
              Gizlilik Politikasını
            </Link>{' '}
            kabul ediyorum
          </span>
        </label>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-blue-800">Sonraki Adımlar</h4>
        <p className="text-sm text-blue-700">
          Kayıt işlemi tamamlandıktan sonra, e-posta adresinize bir doğrulama bağlantısı gönderilecektir. 
          Hesabınızı aktifleştirdikten sonra sisteme giriş yapabilir ve kurulumu tamamlayabilirsiniz.
        </p>
      </div>
    </div>
  );

  // Adımlar ve içerikleri
  const steps: StepContent[] = [
    {
      title: 'Okul Bilgileri',
      description: 'Okulunuzun temel bilgilerini girin',
      component: StepSchoolInfo
    },
    {
      title: 'Yönetici Bilgileri',
      description: 'Yönetici hesabı için bilgilerinizi girin',
      component: StepAdminInfo
    },
    {
      title: 'Portal Ayarları',
      description: 'Web adresinizi ve planınızı seçin',
      component: StepDomainInfo
    },
    {
      title: 'Onay',
      description: 'Bilgilerinizi kontrol edin ve onaylayın',
      component: StepSummary
    }
  ];

  // İlerleme durumunu hesapla
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Üst Menü */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Image
                  src="/logo.webp" 
                  alt="Iqra Eğitim Portalı" 
                  width={120} 
                  height={120} 
                  priority={true}
                  className="h-10 w-auto"
                />
                <span className="ml-3 text-xl font-bold text-gray-900">Iqra Eğitim Portalı</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/auth/giris"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Giriş
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Ana İçerik */}
      <main className="flex-grow py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900">Eğitim Portalınızı Oluşturun</h1>
            <p className="mt-4 text-lg text-gray-500">
              Birkaç adımda okulunuz için özel bir dijital platform oluşturun
            </p>
          </div>
          
          {/* İlerleme Çubuğu */}
          <div className="mb-8">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {currentStep + 1}/{steps.length} Adım
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {progress.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                <div 
                  style={{ width: `${progress}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                ></div>
              </div>
            </div>
            
            {/* Adımlar */}
            <div className="hidden sm:flex items-center justify-between">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
                >
                  <div 
                    className={`flex items-center justify-center h-8 w-8 rounded-full border-2 ${
                      index === currentStep ? 'border-blue-600 bg-white' : 
                      index < currentStep ? 'border-blue-600 bg-blue-600 text-white' : 
                      'border-gray-300 bg-white'
                    }`}
                  >
                    {index < currentStep ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="text-xs mt-1">{step.title}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Adım İçeriği */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-1">{steps[currentStep].title}</h2>
              <p className="text-sm text-gray-500 mb-4">{steps[currentStep].description}</p>
              
              <div className="mt-5">
                {steps[currentStep].component}
              </div>
            </div>
            
            {/* Navigasyon Butonları */}
            <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white ${
                  currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Geri
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && (!formData.schoolName || !formData.schoolType)) ||
                  (currentStep === 1 && (!formData.adminName || !formData.email)) ||
                  (currentStep === 2 && !formData.subdomain) ||
                  (currentStep === 3 && !formData.acceptTerms)
                }
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 ${
                  ((currentStep === 0 && (!formData.schoolName || !formData.schoolType)) ||
                  (currentStep === 1 && (!formData.adminName || !formData.email)) ||
                  (currentStep === 2 && !formData.subdomain) ||
                  (currentStep === 3 && !formData.acceptTerms)) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-700'
                }`}
              >
                {currentStep === steps.length - 1 ? 'Kaydı Tamamla' : 'Devam Et'}
              </button>
            </div>
          </div>
          
          {/* Demo Seçeneği */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Kayıt olmadan denemek mi istiyorsunuz?{' '}
              <Link href="/auth/demo" className="font-medium text-blue-600 hover:text-blue-500">
                Demo hesapla deneyin
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      {/* Alt Bilgi */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-4 flex flex-col items-center justify-center">
            <Image
              src="/logo.webp" 
              alt="Iqra Eğitim Portalı" 
              width={64} 
              height={64} 
              className="h-8 w-auto mb-2"
            />
            <p className="text-sm text-gray-500">
              &copy; 2023 Iqra Eğitim Portalı. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 