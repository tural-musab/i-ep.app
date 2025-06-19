'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'swagger-ui-react/swagger-ui.css';
import Image from 'next/image';
import Link from 'next/link';

// Swagger UI bileşenini dinamik olarak import ediyoruz
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  const [isClient, setIsClient] = useState(false);
  const [showOptions, setShowOptions] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRedirect = () => {
    // HTML sayfasına yönlendir
    window.location.href = '/api-docs/index.html';
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
                Portal Kaydı
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Ana İçerik */}
      {showOptions ? (
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8 border-b border-gray-200 bg-blue-50">
              <h1 className="text-3xl font-bold text-gray-900 text-center">İ-EP.APP Platformuna Hoş Geldiniz</h1>
              <p className="mt-4 text-lg text-gray-600 text-center">
                Lütfen yapmak istediğiniz işlemi seçin
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = '/onboarding'}
                >
                  <div className="h-12 w-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-center mb-2">Yeni Portal Oluştur</h2>
                  <p className="text-gray-600 text-center">
                    Okulunuz için özel bir eğitim portalı oluşturmak için adım adım kayıt sürecini başlatın.
                  </p>
                  <div className="mt-4 text-center">
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => window.location.href = '/onboarding'}
                    >
                      Kayıt Ol
                    </button>
                  </div>
                </div>
                
                <div 
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={handleRedirect}
                >
                  <div className="h-12 w-12 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-center mb-2">API Dokümantasyonu</h2>
                  <p className="text-gray-600 text-center">
                    İ-EP.APP API'sini kullanarak kendi uygulamalarınızı geliştirmek için teknik dokümantasyona göz atın.
                  </p>
                  <div className="mt-4 text-center">
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={handleRedirect}
                    >
                      API Dokümanlarını Görüntüle
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-2">Demo Hesapla Deneyin</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Kayıt olmadan platformu keşfetmek mi istiyorsunuz? 
                  Demo hesapla Iqra Eğitim Portalı'nın tüm özelliklerini test edebilirsiniz.
                </p>
                <div className="text-center">
                  <Link 
                    href="/auth/demo"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Demo Hesapla Dene
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">İ-EP.APP API Dokümantasyonu</h1>
            <p>Yükleniyor...</p>
            {isClient && <SwaggerUI url="/api-docs/swagger.yaml" />}
          </div>
        </main>
      )}
      
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