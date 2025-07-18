import Link from 'next/link';

export default function DocsPage() {
  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">Iqra Eğitim Portalı Geliştirici Dokümantasyonu</h1>

      <p className="mb-8 text-lg">
        Bu dokümantasyon, Iqra Eğitim Portalı SaaS projesini geliştirmek ve entegre etmek isteyen
        geliştiriciler için hazırlanmıştır. Aşağıdaki bölümlerde projenin mimarisi, API&apos;leri ve
        kullanım rehberlerini bulabilirsiniz.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold">API Dokümantasyonu</h2>
          <p className="mb-4 text-gray-600">
            REST API&apos;lerinin tam dokümantasyonu, endpoint&apos;ler, parametreler ve cevap
            formatları.
          </p>
          <Link href="/docs/api" className="text-primary hover:underline">
            API Dokümanlarına Git →
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold">Bileşen Kütüphanesi</h2>
          <p className="mb-4 text-gray-600">
            Projede kullanılan UI bileşenlerinin dokümantasyonu ve kullanım örnekleri.
          </p>
          <Link href="/docs/components" className="text-primary hover:underline">
            Bileşen Dokümantasyonuna Git →
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold">Rehberler</h2>
          <p className="mb-4 text-gray-600">
            Yaygın kullanım senaryoları, entegrasyon adımları ve en iyi uygulamalar için rehberler.
          </p>
          <Link href="/docs/guides" className="text-primary hover:underline">
            Rehberlere Git →
          </Link>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-semibold">Başlangıç</h2>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <ol className="list-decimal space-y-3 pl-6">
            <li>
              <strong>Projeyi Klonla:</strong>
              <pre className="mt-1 rounded bg-gray-100 p-2">
                git clone https://github.com/tural-musab/i-ep.app.git
              </pre>
            </li>
            <li>
              <strong>Bağımlılıkları Yükle:</strong>
              <pre className="mt-1 rounded bg-gray-100 p-2">cd i-ep.app && npm install</pre>
            </li>
            <li>
              <strong>Ortam Değişkenlerini Ayarla:</strong>
              <pre className="mt-1 rounded bg-gray-100 p-2">
                .env.local dosyasını oluştur ve gerekli değişkenleri ekle
              </pre>
            </li>
            <li>
              <strong>Geliştirme Sunucusunu Başlat:</strong>
              <pre className="mt-1 rounded bg-gray-100 p-2">npm run dev</pre>
            </li>
          </ol>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-semibold">Mimari Genel Bakış</h2>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="mb-4">
            Iqra Eğitim Portalı, modern ve ölçeklenebilir bir mimari üzerine inşa edilmiştir:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Frontend:</strong> Next.js 14, TypeScript, Tailwind CSS
            </li>
            <li>
              <strong>Backend:</strong> Next.js API Routes, Supabase Functions
            </li>
            <li>
              <strong>Veritabanı:</strong> Supabase (PostgreSQL)
            </li>
            <li>
              <strong>Kimlik Doğrulama:</strong> Supabase Auth
            </li>
            <li>
              <strong>Dağıtım:</strong> Vercel/Netlify
            </li>
            <li>
              <strong>Multi-tenant:</strong> Hibrit izolasyon (Şema + Prefix)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
