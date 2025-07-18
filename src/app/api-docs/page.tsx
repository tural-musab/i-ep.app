'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ApiDocsPage() {
  const handleRedirect = () => {
    // HTML sayfasına yönlendir
    window.location.href = '/api-docs/index.html';
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
                Portal Kaydı
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="flex flex-grow items-center justify-center p-4">
        <div className="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-lg">
          <div className="border-b border-gray-200 bg-blue-50 px-6 py-8">
            <h1 className="text-center text-3xl font-bold text-gray-900">
              İ-EP.APP API Dokümantasyonu
            </h1>
            <p className="mt-4 text-center text-lg text-gray-600">
              API dokümantasyonunu görüntülemek için aşağıdaki seçenekleri kullanın
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                onClick={handleRedirect}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
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
                <h2 className="mb-2 text-center text-xl font-semibold">Swagger UI</h2>
                <p className="text-center text-gray-600">
                  İnteraktif API dokümantasyonu ile API endpoint&apos;lerini test edin
                </p>
                <div className="mt-4 text-center">
                  <button
                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    onClick={handleRedirect}
                  >
                    Swagger UI&apos;ı Aç
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-center text-xl font-semibold">API Rehberi</h2>
                <p className="text-center text-gray-600">
                  Detaylı API kullanım kılavuzu ve örnekler
                </p>
                <div className="mt-4 text-center">
                  <Link
                    href="/docs"
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Dokümantasyonu Görüntüle
                  </Link>
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
