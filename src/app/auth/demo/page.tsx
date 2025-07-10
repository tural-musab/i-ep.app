'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Rol tanımları
interface Role {
  id: string;
  title: string;
  description: string;
  permissions: string[];
  color: string;
}

export default function DemoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [error, setError] = useState('');
  
  // Kullanıcı rolleri
  const roles: Record<string, Role> = {
    admin: {
      id: 'admin',
      title: 'Okul Yöneticisi',
      description: 'Tüm sistemi yönetme ve yapılandırma yetkilerine sahip kullanıcı',
      permissions: [
        'Okul profil ve ayarlarını yönetme',
        'Kullanıcı hesaplarını yönetme',
        'Veri analizi ve raporlama',
        'Domain ve özelleştirme ayarları',
        'Fakülteler ve bölümleri yönetme'
      ],
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    teacher: {
      id: 'teacher',
      title: 'Öğretmen',
      description: 'Dersler, ödevler ve öğrenci değerlendirmeleri ile ilgilenen kullanıcı',
      permissions: [
        'Ders planları oluşturma ve düzenleme',
        'Ödev ve sınav oluşturma',
        'Not giriş ve değerlendirme',
        'Öğrenci devam takibi',
        'Veli ile iletişim kurma'
      ],
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    student: {
      id: 'student',
      title: 'Öğrenci',
      description: 'Derslere katılan, ödevlerini takip eden ve değerlendirmelerini gören kullanıcı',
      permissions: [
        'Ders programı görüntüleme',
        'Ödev ve sınavları görüntüleme',
        'Notları ve değerlendirmeleri görme',
        'Duyuruları ve etkinlikleri takip etme',
        'Öğretmenlerle mesajlaşma'
      ],
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    parent: {
      id: 'parent',
      title: 'Veli',
      description: 'Öğrencinin gelişimini takip eden, öğretmenlerle iletişim kuran kullanıcı',
      permissions: [
        'Çocuğun ders programını görüntüleme',
        'Çocuğun notlarını ve devam durumunu görme',
        'Öğretmenlerle iletişim kurma',
        'Ödev ve etkinlikleri takip etme',
        'Veli toplantısı ve etkinlik takvimini görme'
      ],
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  };

  // Demo hesapla giriş yapma
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Burada gerçek bir API çağrısı yapılabilir
      // Şimdilik doğrudan demo sayfasına yönlendiriyoruz
      
      // Demo tenant'a yönlendir
      setTimeout(() => {
        router.push(`/dashboard?demo=true&role=${selectedRole}`);
      }, 1500);
      
    } catch (err) {
      console.error('Demo giriş hatası:', err);
      setError('Demo hesabı oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      // setIsLoading(false);
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
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/onboarding"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Ana İçerik */}
      <main className="flex-grow py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900">Demo Hesabı ile Deneyin</h1>
            <p className="mt-4 text-lg text-gray-500">
              Kayıt olmadan Iqra Eğitim Portalı&apos;nı keşfedin
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Kullanıcı Rolü Seçin</h2>
              <p className="text-sm text-gray-500 mb-6">
                Sistemi hangi rol perspektifinden deneyimlemek istediğinizi seçin.
                Her rol, farklı yetkilere ve kullanıcı arayüzüne sahiptir.
              </p>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.values(roles).map((role) => (
                  <div
                    key={role.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedRole === role.id 
                        ? `border-blue-500 ring-2 ring-blue-500 ring-opacity-50 ${role.color}` 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <h3 className="text-lg font-medium text-gray-900">{role.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{role.description}</p>
                    
                    <div className="mt-4">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Yetkiler</h4>
                      <ul className="mt-2 space-y-1">
                        {role.permissions.map((permission, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md mt-6">
                <h4 className="text-sm font-medium text-blue-800">Demo Hesap Bilgileri</h4>
                <p className="text-sm text-blue-700">
                  Demo hesap otomatik olarak &quot;Demo Okul&quot; tenant&apos;ında oluşturulacaktır.
                  Tüm özellikler ve fonksiyonlar kullanılabilir olacak, ancak yapılan değişiklikler 24 saat sonra sıfırlanacaktır.
                </p>
              </div>
            </div>
            
            <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-between">
              <Link 
                href="/onboarding"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
              >
                Gerçek Hesap Oluştur
              </Link>
              
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Demo Hesapla Giriş Yapılıyor...
                  </>
                ) : (
                  'Demo Hesapla Dene'
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Demo Ortamı Hakkında</h3>
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Demo Ortam Özellikleri</h4>
                  <ul className="space-y-2">
                    <li className="text-sm text-gray-600 flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Gerçekçi veri ve senaryolarla dolu ortam
                    </li>
                    <li className="text-sm text-gray-600 flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tüm premium özellikler aktif
                    </li>
                    <li className="text-sm text-gray-600 flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Sınırsız işlem ve test yapabilme
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Demo Ortam Kısıtlamaları</h4>
                  <ul className="space-y-2">
                    <li className="text-sm text-gray-600 flex items-start">
                      <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Veriler 24 saatte bir sıfırlanır
                    </li>
                    <li className="text-sm text-gray-600 flex items-start">
                      <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      E-posta ve SMS bildirimleri devre dışı
                    </li>
                    <li className="text-sm text-gray-600 flex items-start">
                      <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Diğer sistemlerle entegrasyonlar kısıtlı
                    </li>
                  </ul>
                </div>
              </div>
            </div>
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