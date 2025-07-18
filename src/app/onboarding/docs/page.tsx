'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Doküman kategorisi
interface DocCategory {
  id: string;
  name: string;
  description: string;
  documents: Document[];
}

// Doküman
interface Document {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: string;
  tags: string[];
}

export default function OnboardingDocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Doküman kategorileri
  const docCategories: DocCategory[] = useMemo(
    () => [
      {
        id: 'getting-started',
        name: 'Başlangıç',
        description: 'Sisteme ilk adımları atmak için rehberler',
        documents: [
          {
            id: 'onboarding-guide',
            title: 'Onboarding Rehberi',
            description: 'Iqra Eğitim Portalı kurulum sürecini adım adım öğrenin',
            link: '/onboarding/rehber',
            icon: 'book-open',
            tags: ['onboarding', 'kurulum', 'başlangıç'],
          },
          {
            id: 'demo-tenant',
            title: 'Demo Tenant Kılavuzu',
            description: 'Demo tenant oluşturma ve yapılandırma ile ilgili kapsamlı bilgiler',
            link: '/docs/demo-tenant-guide',
            icon: 'beaker',
            tags: ['demo', 'tenant', 'test'],
          },
          {
            id: 'setup-guide',
            title: 'Kurulum Rehberi',
            description: 'Iqra Eğitim Portalı kurulum ve yapılandırma rehberi',
            link: '/docs/onboarding/setup-guide',
            icon: 'cog',
            tags: ['kurulum', 'yapılandırma', 'başlangıç'],
          },
        ],
      },
      {
        id: 'architecture',
        name: 'Mimari',
        description: 'Sistem mimarisi, veri yapısı ve teknik detaylar',
        documents: [
          {
            id: 'architecture-overview',
            title: 'Mimari Genel Bakış',
            description: "Iqra Eğitim Portalı'nın mimari yapısı ve teknik bileşenleri",
            link: '/docs/onboarding/architecture-overview',
            icon: 'template',
            tags: ['mimari', 'yapı', 'teknik'],
          },
          {
            id: 'multi-tenant',
            title: 'Multi-tenant Stratejisi',
            description: 'Çok kiracılı mimari ve tenant izolasyonu hakkında bilgiler',
            link: '/docs/architecture/multi-tenant-strategy',
            icon: 'server',
            tags: ['multi-tenant', 'izolasyon', 'mimari'],
          },
          {
            id: 'data-isolation',
            title: 'Veri İzolasyonu',
            description: 'Tenantlar arası veri izolasyonu ve güvenlik stratejileri',
            link: '/docs/architecture/data-isolation',
            icon: 'shield-check',
            tags: ['güvenlik', 'veri', 'izolasyon'],
          },
        ],
      },
      {
        id: 'features',
        name: 'Özellikler',
        description: 'Sistem özellikleri ve modüller hakkında bilgiler',
        documents: [
          {
            id: 'features-overview',
            title: 'Özellikler Genel Bakış',
            description: "Iqra Eğitim Portalı'nın sunduğu temel ve premium özellikler",
            link: '/docs/features/overview',
            icon: 'star',
            tags: ['özellikler', 'modüller', 'fonksiyonlar'],
          },
          {
            id: 'rbac',
            title: 'Rol Bazlı Erişim Kontrolü',
            description: 'Kullanıcı rolleri ve izin sistemi hakkında bilgiler',
            link: '/docs/RBAC-implementation',
            icon: 'user-group',
            tags: ['roller', 'izinler', 'güvenlik'],
          },
        ],
      },
      {
        id: 'api',
        name: 'API',
        description: 'API dokümantasyonu ve entegrasyon bilgileri',
        documents: [
          {
            id: 'api-docs',
            title: 'API Dokümantasyonu',
            description: 'RESTful API endpointleri ve kullanım örnekleri',
            link: '/api-docs',
            icon: 'code',
            tags: ['api', 'rest', 'entegrasyon'],
          },
          {
            id: 'api-endpoints',
            title: 'API Endpoint Listesi',
            description: 'Tüm API endpointlerinin ayrıntılı listesi ve kullanım bilgileri',
            link: '/docs/api-endpoints',
            icon: 'link',
            tags: ['api', 'endpoints', 'teknik'],
          },
        ],
      },
      {
        id: 'customization',
        name: 'Özelleştirme',
        description: 'Portal özelleştirme ve yapılandırma bilgileri',
        documents: [
          {
            id: 'domain-management',
            title: 'Alan Adı Yönetimi',
            description: 'Özel domain yapılandırması ve yönetimi hakkında bilgiler',
            link: '/docs/domain-management',
            icon: 'globe-alt',
            tags: ['domain', 'alan adı', 'özelleştirme'],
          },
          {
            id: 'cultural-adaptation',
            title: 'Kültürel Adaptasyon',
            description: 'Farklı kültürel ihtiyaçlara göre portalın özelleştirilmesi',
            link: '/docs/cultural-adaptation',
            icon: 'translate',
            tags: ['kültür', 'dil', 'yerelleştirme'],
          },
        ],
      },
    ],
    []
  );

  // Arama sonuçlarını filtrele
  const filteredDocuments = useMemo(() => {
    let docs: Document[] = [];

    // Tüm kategorilerden dokümanları al
    docCategories.forEach((category) => {
      if (selectedCategory === 'all' || selectedCategory === category.id) {
        docs = [...docs, ...category.documents];
      }
    });

    // Arama sorgusuna göre filtrele
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return docs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return docs;
  }, [searchQuery, selectedCategory, docCategories]);

  // İkon bileşeni
  const DocIcon = ({ icon }: { icon: string }) => {
    switch (icon) {
      case 'book-open':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case 'beaker':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        );
      case 'cog':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      case 'template':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          </svg>
        );
      case 'server':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
            />
          </svg>
        );
      case 'shield-check':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        );
      case 'star':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        );
      case 'code':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        );
      case 'link':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        );
      case 'globe-alt':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        );
      case 'translate':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
        );
      case 'user-group':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
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
                href="/onboarding"
                className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
              >
                Kayıt Sayfasına Dön
              </Link>
              <Link
                href="/auth/demo"
                className="inline-flex items-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
              >
                Demo Hesapla Dene
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="flex-grow py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Dokümantasyon</h1>
            <p className="mt-4 text-lg text-gray-500">
              Iqra Eğitim Portalı rehberleri ve teknik dokümantasyonu
            </p>
          </div>

          {/* Arama ve Kategori Filtreleme */}
          <div className="mb-10">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="w-full md:w-3/4">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-md border border-gray-300 py-2 pr-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    placeholder="Dokümanlarda ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-1/4">
                <select
                  className="block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Tüm Kategoriler</option>
                  {docCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dokümanlar */}
          {selectedCategory === 'all' && searchQuery === '' ? (
            // Kategorilere göre liste
            <div className="space-y-12">
              {docCategories.map((category) => (
                <div key={category.id}>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">{category.name}</h2>
                  <p className="mb-6 text-gray-600">{category.description}</p>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {category.documents.map((doc) => (
                      <Link key={doc.id} href={doc.link}>
                        <div className="flex h-full cursor-pointer flex-col rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md">
                          <div className="mb-4 flex items-center">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                              <DocIcon icon={doc.icon} />
                            </div>
                            <h3 className="ml-4 text-lg font-medium text-gray-900">{doc.title}</h3>
                          </div>
                          <p className="flex-grow text-gray-600">{doc.description}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {doc.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Filtrelenmiş liste
            <>
              <div className="mb-6">
                <h2 className="text-xl font-medium text-gray-900">
                  {searchQuery
                    ? `"${searchQuery}" için arama sonuçları`
                    : `${docCategories.find((c) => c.id === selectedCategory)?.name || 'Tüm Dokümanlar'}`}
                </h2>
                <p className="mt-1 text-gray-600">{filteredDocuments.length} doküman bulundu</p>
              </div>

              {filteredDocuments.length === 0 ? (
                <div className="py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Sonuç bulunamadı</h3>
                  <p className="mt-1 text-gray-500">
                    Arama terimlerinizi değiştirerek veya farklı bir kategori seçerek tekrar
                    deneyin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDocuments.map((doc) => (
                    <Link key={doc.id} href={doc.link}>
                      <div className="flex h-full cursor-pointer flex-col rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md">
                        <div className="mb-4 flex items-center">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                            <DocIcon icon={doc.icon} />
                          </div>
                          <h3 className="ml-4 text-lg font-medium text-gray-900">{doc.title}</h3>
                        </div>
                        <p className="flex-grow text-gray-600">{doc.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {doc.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Popüler Dokümanlar */}
          <div className="mt-16 border-t border-gray-200 pt-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Popüler Dokümanlar</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Link href="/onboarding/rehber">
                <div className="cursor-pointer rounded-lg bg-blue-50 p-6 transition-colors hover:bg-blue-100">
                  <h3 className="text-lg font-medium text-blue-800">Onboarding Rehberi</h3>
                  <p className="mt-2 text-blue-600">Kayıt sürecini adım adım tamamlayın</p>
                </div>
              </Link>
              <Link href="/auth/demo">
                <div className="cursor-pointer rounded-lg bg-yellow-50 p-6 transition-colors hover:bg-yellow-100">
                  <h3 className="text-lg font-medium text-yellow-800">Demo Hesap</h3>
                  <p className="mt-2 text-yellow-600">Sistemi kayıt olmadan test edin</p>
                </div>
              </Link>
              <Link href="/api-docs">
                <div className="cursor-pointer rounded-lg bg-green-50 p-6 transition-colors hover:bg-green-100">
                  <h3 className="text-lg font-medium text-green-800">API Dokümantasyonu</h3>
                  <p className="mt-2 text-green-600">Kendi uygulamanızla entegre edin</p>
                </div>
              </Link>
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
