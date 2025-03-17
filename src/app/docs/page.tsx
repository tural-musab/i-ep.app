import Link from 'next/link';

export default function DocsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Iqra Eğitim Portalı Geliştirici Dokümantasyonu</h1>
      
      <p className="text-lg mb-8">
        Bu dokümantasyon, Iqra Eğitim Portalı SaaS projesini geliştirmek ve entegre etmek isteyen
        geliştiriciler için hazırlanmıştır. Aşağıdaki bölümlerde projenin mimarisi, API'leri ve 
        kullanım rehberlerini bulabilirsiniz.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">API Dokümantasyonu</h2>
          <p className="text-gray-600 mb-4">
            REST API'lerinin tam dokümantasyonu, endpoint'ler, parametreler ve cevap formatları.
          </p>
          <Link href="/docs/api" className="text-primary hover:underline">
            API Dokümanlarına Git →
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Bileşen Kütüphanesi</h2>
          <p className="text-gray-600 mb-4">
            Projede kullanılan UI bileşenlerinin dokümantasyonu ve kullanım örnekleri.
          </p>
          <Link href="/docs/components" className="text-primary hover:underline">
            Bileşen Dokümantasyonuna Git →
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Rehberler</h2>
          <p className="text-gray-600 mb-4">
            Yaygın kullanım senaryoları, entegrasyon adımları ve en iyi uygulamalar için rehberler.
          </p>
          <Link href="/docs/guides" className="text-primary hover:underline">
            Rehberlere Git →
          </Link>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Başlangıç</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>Projeyi Klonla:</strong> 
              <pre className="bg-gray-100 p-2 mt-1 rounded">git clone https://github.com/i-es/i-ep.app.git</pre>
            </li>
            <li>
              <strong>Bağımlılıkları Yükle:</strong> 
              <pre className="bg-gray-100 p-2 mt-1 rounded">cd i-ep.app && npm install</pre>
            </li>
            <li>
              <strong>Ortam Değişkenlerini Ayarla:</strong> 
              <pre className="bg-gray-100 p-2 mt-1 rounded">.env.local dosyasını oluştur ve gerekli değişkenleri ekle</pre>
            </li>
            <li>
              <strong>Geliştirme Sunucusunu Başlat:</strong> 
              <pre className="bg-gray-100 p-2 mt-1 rounded">npm run dev</pre>
            </li>
          </ol>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Mimari Genel Bakış</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">
            Iqra Eğitim Portalı, modern ve ölçeklenebilir bir mimari üzerine inşa edilmiştir:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Frontend:</strong> Next.js 14, TypeScript, Tailwind CSS</li>
            <li><strong>Backend:</strong> Next.js API Routes, Supabase Functions</li>
            <li><strong>Veritabanı:</strong> Supabase (PostgreSQL)</li>
            <li><strong>Kimlik Doğrulama:</strong> Supabase Auth</li>
            <li><strong>Dağıtım:</strong> Vercel/Netlify</li>
            <li><strong>Multi-tenant:</strong> Hibrit izolasyon (Şema + Prefix)</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 