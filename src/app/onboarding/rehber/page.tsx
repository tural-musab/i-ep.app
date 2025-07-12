'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Adım rehber tipini tanımla
interface GuideStep {
  id: number;
  title: string;
  description: string;
  content: React.ReactNode;
  image?: string;
}

export default function OnboardingGuidePage() {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Rehber adımları
  const guideSteps: GuideStep[] = [
    {
      id: 1,
      title: 'Hoş Geldiniz',
      description: 'Iqra Eğitim Portalı\'na hoş geldiniz',
      content: (
        <div className="space-y-4">
          <p>
            Bu rehber, Iqra Eğitim Portalı kurulum sürecinde size yardımcı olmak için hazırlanmıştır. 
            Adım adım yönergelerle, okulunuz için dijital platformunuzu hızlıca kurmayı öğreneceksiniz.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800">Rehberi Nasıl Kullanmalısınız?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Bu sayfada sağ ve sol oklarla adımlar arasında gezinebilir veya aşağıdaki adım numaralarına tıklayarak 
              istediğiniz kısma doğrudan geçebilirsiniz. Her rehber adımını dikkatlice okumak, kurulum sürecinizi hızlandıracaktır.
            </p>
          </div>
          
          <h3 className="text-md font-medium text-gray-900">Kurulum için ihtiyacınız olacaklar:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Okulunuza ait bilgiler (isim, okul türü, öğrenci sayısı)</li>
            <li>Geçerli bir e-posta adresi</li>
            <li>Okulunuzu temsil edecek bir logo (isteğe bağlı)</li>
            <li>Yaklaşık 10-15 dakikalık zaman</li>
          </ul>
        </div>
      ),
      image: '/onboarding/welcome.svg'
    },
    {
      id: 2,
      title: 'Okul Bilgileri',
      description: 'Okulunuzun temel bilgilerini girin',
      content: (
        <div className="space-y-4">
          <p>
            Bu adımda okulunuzun temel bilgilerini sisteme tanıtacaksınız. Bu bilgiler, 
            portalınızın kişiselleştirilmesi ve ihtiyaçlarınıza göre yapılandırılması için kullanılacaktır.
          </p>
          
          <h3 className="text-md font-medium text-gray-900">İpuçları:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-medium">Okul Adı:</span> Resmi okul adınızı tam olarak yazın</li>
            <li><span className="font-medium">Okul Türü:</span> Seçtiğiniz okul türü, hazır şablonlar ve modüller için önemlidir</li>
            <li><span className="font-medium">Öğrenci Sayısı:</span> Yaklaşık sayı yeterlidir, daha sonra güncelleyebilirsiniz</li>
          </ul>
          
          <div className="bg-yellow-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800">Dikkat</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Okulunuzun resmi/yasal adını kullanmanız önerilir. Bu ad, fatura ve resmi dokümanlarda kullanılacaktır.
            </p>
          </div>
          
          <div className="border p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700">Örnek Giriş</h4>
            <div className="mt-2 space-y-2">
              <div className="flex">
                <span className="font-medium w-40">Okul Adı:</span>
                <span>Cumhuriyet Anadolu Lisesi</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">Okul Türü:</span>
                <span>Lise</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">Öğrenci Sayısı:</span>
                <span>750</span>
              </div>
            </div>
          </div>
        </div>
      ),
      image: '/onboarding/school-info.svg'
    },
    {
      id: 3,
      title: 'Yönetici Bilgileri',
      description: 'Yönetici hesabı için bilgilerinizi girin',
      content: (
        <div className="space-y-4">
          <p>
            Bu adımda, sistem yönetici hesabınızı oluşturacak bilgileri girmeniz gerekir. 
            Yönetici hesabı, sistem üzerinde tam yetkiye sahip olacak ve diğer kullanıcı hesaplarını yönetecektir.
          </p>
          
          <h3 className="text-md font-medium text-gray-900">Önemli Notlar:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-medium">Ad Soyad:</span> İsminizi ve soyadınızı tam olarak yazın</li>
            <li><span className="font-medium">E-posta Adresi:</span> Aktif olarak kullandığınız ve erişebildiğiniz bir e-posta adresi girin</li>
            <li><span className="font-medium">Şifre:</span> Güvenli bir şifre belirleyin (en az 8 karakter, harf ve rakam içermeli)</li>
          </ul>
          
          <div className="bg-green-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-green-800">Güvenlik İpucu</h4>
            <p className="text-sm text-green-700 mt-1">
              Yönetici hesabınız için kullandığınız e-posta ve şifre bilgilerini başka hiç kimseyle paylaşmayın. 
              Şifrenizi her 3 ayda bir değiştirmenizi öneririz.
            </p>
          </div>
          
          <div className="border p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700">E-posta Doğrulama</h4>
            <p className="text-sm text-gray-600 mt-1">
              Kayıt işlemi tamamlandıktan sonra, girdiğiniz e-posta adresine bir doğrulama bağlantısı gönderilecektir. 
              Hesabınızı aktifleştirmek için bu bağlantıya tıklamanız gerekecektir.
            </p>
          </div>
        </div>
      ),
      image: '/onboarding/admin-info.svg'
    },
    {
      id: 4,
      title: 'Portal Ayarları',
      description: 'Web adresinizi ve planınızı seçin',
      content: (
        <div className="space-y-4">
          <p>
            Bu adımda, okulunuzun web adresini (subdomain) ve kullanmak istediğiniz abonelik planını seçeceksiniz.
            Subdomain, öğrencilerinizin, velilerinizin ve öğretmenlerinizin sisteme erişmek için kullanacağı web adresidir.
          </p>
          
          <h3 className="text-md font-medium text-gray-900">Subdomain Bilgisi:</h3>
          <p>
            Subdomain, <span className="font-mono bg-gray-100 px-1">okulunuz.i-ep.app</span> formatında olacaktır. 
            Yalnızca küçük harfler, rakamlar ve tire (-) kullanabilirsiniz.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800">Subdomain Önerisi</h4>
            <p className="text-sm text-blue-700 mt-1">
              Subdomain için okul adınızın kısaltılmış veya kolayca hatırlanabilir bir versiyonunu kullanmanızı öneririz. 
              Okul adınız &quot;Cumhuriyet Anadolu Lisesi&quot; ise, &quot;cumhuriyet-lisesi&quot; veya &quot;cal&quot; gibi bir subdomain tercih edebilirsiniz.
            </p>
          </div>
          
          <h3 className="text-md font-medium text-gray-900">Abonelik Planları:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="border p-4 rounded-md">
              <h4 className="font-medium text-gray-800">Ücretsiz Plan</h4>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Maksimum 100 öğrenci</li>
                <li>• Temel modüller</li>
                <li>• Topluluk desteği</li>
                <li>• i-ep.app subdomain</li>
              </ul>
            </div>
            <div className="border p-4 rounded-md bg-blue-50">
              <h4 className="font-medium text-gray-800">Standart Plan</h4>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Sınırsız öğrenci</li>
                <li>• Tüm temel modüller</li>
                <li>• E-posta desteği</li>
                <li>• i-ep.app subdomain</li>
                <li>• Gelişmiş raporlar</li>
              </ul>
            </div>
            <div className="border p-4 rounded-md bg-purple-50">
              <h4 className="font-medium text-gray-800">Premium Plan</h4>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Sınırsız öğrenci</li>
                <li>• Tüm modüller</li>
                <li>• Öncelikli destek</li>
                <li>• Özel domain desteği</li>
                <li>• API erişimi</li>
                <li>• Gelişmiş analitikler</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800">Not</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Abonelik planınızı daha sonra ihtiyaçlarınıza göre değiştirebilirsiniz. 
              Tüm planlar için 14 günlük ücretsiz deneme süresi sunulmaktadır.
            </p>
          </div>
        </div>
      ),
      image: '/onboarding/portal-settings.svg'
    },
    {
      id: 5,
      title: 'Onay ve Kurulum',
      description: 'Bilgilerinizi kontrol edin ve onaylayın',
      content: (
        <div className="space-y-4">
          <p>
            Bu son adımda, girdiğiniz tüm bilgileri gözden geçirip onaylayacaksınız. 
            Tüm bilgilerin doğruluğundan emin olun, çünkü bu bilgiler portalınızın kurulumunda kullanılacaktır.
          </p>
          
          <h3 className="text-md font-medium text-gray-900">Doğrulama Kontrol Listesi:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Okul adınızın doğru yazıldığından emin olun</li>
            <li>Seçtiğiniz okul türünün doğru olduğunu kontrol edin</li>
            <li>Yönetici bilgilerinizin doğru ve güncel olduğundan emin olun</li>
            <li>Subdomain adınızın istediğiniz gibi olduğunu kontrol edin</li>
            <li>Seçtiğiniz abonelik planının ihtiyaçlarınıza uygun olduğunu teyit edin</li>
          </ul>
          
          <div className="bg-green-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-green-800">Kurulum Süreci</h4>
            <p className="text-sm text-green-700 mt-1">
              &quot;Kaydı Tamamla&quot; butonuna tıkladığınızda, sistem otomatik olarak portalınızı hazırlamaya başlayacaktır. 
              Bu işlem genellikle 1-2 dakika sürer. İşlem tamamlandığında, e-posta adresinize bir bildirim gönderilecektir.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800">Sonraki Adımlar</h4>
            <p className="text-sm text-blue-700 mt-1">
              Kurulum tamamlandıktan sonra, e-posta adresinize gönderilen doğrulama bağlantısını onaylayın ve 
              yönetici panelinize giriş yaparak şu adımları tamamlayın:
            </p>
            <ol className="list-decimal pl-5 mt-2 text-sm text-blue-700">
              <li>Okul logonuzu yükleyin</li>
              <li>Akademik yılı ve dönemleri tanımlayın</li>
              <li>Sınıflar ve şubeleri oluşturun</li>
              <li>Öğretmen hesaplarını ekleyin</li>
              <li>Öğrenci bilgilerini yükleyin</li>
            </ol>
          </div>
          
          <p className="text-gray-500 text-sm italic">
            Kullanım Koşulları ve Gizlilik Politikası&apos;nı kabul etmeden önce dikkatle okumanızı tavsiye ederiz. 
            Kaydınızı tamamlayarak, bu koşulları kabul etmiş olacaksınız.
          </p>
        </div>
      ),
      image: '/onboarding/confirmation.svg'
    }
  ];
  
  // Aktif adımı al
  const activeStep = guideSteps[currentStep];
  
  // İleri adıma geç
  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Önceki adıma dön
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Belirli bir adıma git
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < guideSteps.length) {
      setCurrentStep(stepIndex);
    }
  };
  
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
                href="/onboarding"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Kayıt Sayfasına Dön
              </Link>
              <Link 
                href="/auth/demo"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
              >
                Demo Hesapla Dene
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Ana İçerik */}
      <main className="flex-grow py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Onboarding Rehberi</h1>
            <p className="mt-4 text-lg text-gray-500">
              Iqra Eğitim Portalı kurulum sürecini adım adım öğrenin
            </p>
          </div>
          
          {/* Adım Numaraları */}
          <div className="hidden md:flex items-center justify-center mb-8">
            <div className="flex space-x-2">
              {guideSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`flex flex-col items-center justify-center w-28 py-2 rounded-lg transition-colors ${
                    index === currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className={`text-xs ${index === currentStep ? 'text-blue-100' : 'text-gray-500'}`}>
                    Adım {step.id}
                  </span>
                  <span className="text-sm font-medium mt-1">{step.title}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Mobil Adım Seçici */}
          <div className="block md:hidden mb-6">
            <label htmlFor="step-select" className="sr-only">Adım Seçin</label>
            <select
              id="step-select"
              value={currentStep}
              onChange={(e) => goToStep(parseInt(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {guideSteps.map((step, index) => (
                <option key={step.id} value={index}>
                  Adım {step.id}: {step.title}
                </option>
              ))}
            </select>
          </div>
          
          {/* Adım İçeriği */}
          <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
            <div className="flex flex-col md:flex-row">
              {/* Görsel Alanı */}
              <div className="w-full md:w-1/3 bg-blue-50 p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mb-4">
                    <span className="text-3xl font-bold">{activeStep.id}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{activeStep.title}</h2>
                  <p className="mt-1 text-sm text-gray-600">{activeStep.description}</p>
                  
                  {activeStep.image && (
                    <div className="mt-6 flex justify-center">
                      <Image
                        src={activeStep.image}
                        alt={activeStep.title}
                        width={200}
                        height={200}
                        className="max-w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* İçerik Alanı */}
              <div className="w-full md:w-2/3 p-6">
                <div className="prose max-w-none">
                  {activeStep.content}
                </div>
              </div>
            </div>
            
            {/* Navigasyon Butonları */}
            <div className="px-6 py-4 bg-gray-50 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Önceki Adım
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === guideSteps.length - 1}
                className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md ${
                  currentStep === guideSteps.length - 1
                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-transparent bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Sonraki Adım
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Eylem Butonları */}
          <div className="flex justify-center space-x-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Kayıt Sürecine Başla
            </Link>
            <Link
              href="/auth/demo"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Demo Hesapla Dene
            </Link>
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