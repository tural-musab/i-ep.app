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
        'Fakülteler ve bölümleri yönetme',
      ],
      color: 'bg-purple-100 text-purple-800 border-purple-200',
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
        'Veli ile iletişim kurma',
      ],
      color: 'bg-blue-100 text-blue-800 border-blue-200',
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
        'Öğretmenlerle mesajlaşma',
      ],
      color: 'bg-green-100 text-green-800 border-green-200',
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
        'Veli toplantısı ve etkinlik takvimini görme',
      ],
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Üst Menü */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
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
                className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="flex-grow py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Demo Hesabı ile Deneyin</h1>
            <p className="mt-4 text-lg text-gray-500">
              Kayıt olmadan Iqra Eğitim Portalı&apos;nı keşfedin
            </p>
          </div>

          {error && (
            <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Kullanıcı Rolü Seçin</h2>
              <p className="mb-6 text-sm text-gray-500">
                Sistemi hangi rol perspektifinden deneyimlemek istediğinizi seçin. Her rol, farklı
                yetkilere ve kullanıcı arayüzüne sahiptir.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.values(roles).map((role) => (
                  <div
                    key={role.id}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      selectedRole === role.id
                        ? `ring-opacity-50 border-blue-500 ring-2 ring-blue-500 ${role.color}`
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <h3 className="text-lg font-medium text-gray-900">{role.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{role.description}</p>

                    <div className="mt-4">
                      <h4 className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                        Yetkiler
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {role.permissions.map((permission, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-700">
                            <svg
                              className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-md bg-blue-50 p-4">
                <h4 className="text-sm font-medium text-blue-800">Demo Hesap Bilgileri</h4>
                <p className="text-sm text-blue-700">
                  Demo hesap otomatik olarak &quot;Demo Okul&quot; tenant&apos;ında
                  oluşturulacaktır. Tüm özellikler ve fonksiyonlar kullanılabilir olacak, ancak
                  yapılan değişiklikler 24 saat sonra sıfırlanacaktır.
                </p>
              </div>
            </div>

            <div className="flex justify-between bg-gray-50 px-4 py-4 sm:px-6">
              <Link
                href="/onboarding"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Gerçek Hesap Oluştur
              </Link>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
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
            <h3 className="mb-2 text-lg font-medium text-gray-900">Demo Ortamı Hakkında</h3>
            <div className="rounded-lg bg-white p-6 text-left shadow-md">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-800">
                    Demo Ortam Özellikleri
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm text-gray-600">
                      <svg
                        className="mr-2 h-5 w-5 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Gerçekçi veri ve senaryolarla dolu ortam
                    </li>
                    <li className="flex items-start text-sm text-gray-600">
                      <svg
                        className="mr-2 h-5 w-5 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Tüm premium özellikler aktif
                    </li>
                    <li className="flex items-start text-sm text-gray-600">
                      <svg
                        className="mr-2 h-5 w-5 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Sınırsız işlem ve test yapabilme
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-800">
                    Demo Ortam Kısıtlamaları
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm text-gray-600">
                      <svg
                        className="mr-2 h-5 w-5 text-yellow-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Veriler 24 saatte bir sıfırlanır
                    </li>
                    <li className="flex items-start text-sm text-gray-600">
                      <svg
                        className="mr-2 h-5 w-5 text-yellow-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      E-posta ve SMS bildirimleri devre dışı
                    </li>
                    <li className="flex items-start text-sm text-gray-600">
                      <svg
                        className="mr-2 h-5 w-5 text-yellow-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
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
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center border-t border-gray-200 pt-4">
            <Image
              src="/logo.webp"
              alt="Iqra Eğitim Portalı"
              width={64}
              height={64}
              className="mb-2 h-8 w-auto"
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
