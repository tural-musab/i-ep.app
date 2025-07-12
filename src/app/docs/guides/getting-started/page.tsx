'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function GettingStartedGuidePage() {
  const [currentTab, setCurrentTab] = useState<'installation' | 'configuration' | 'development'>('installation');
  
  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Başlangıç Rehberi</h1>
      <p className="text-gray-600 mb-8">Iqra Eğitim Portalı SaaS projesini kurma ve geliştirmeye başlama rehberi</p>
      
      {/* Rehber İçindekiler */}
      <div className="flex border-b mb-6">
        <button 
          className={`px-4 py-2 font-medium ${currentTab === 'installation' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setCurrentTab('installation')}
        >
          Kurulum
        </button>
        <button 
          className={`px-4 py-2 font-medium ${currentTab === 'configuration' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setCurrentTab('configuration')}
        >
          Yapılandırma
        </button>
        <button 
          className={`px-4 py-2 font-medium ${currentTab === 'development' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setCurrentTab('development')}
        >
          Geliştirme
        </button>
      </div>
      
      {/* İçerik Panelleri */}
      <div className="prose max-w-none">
        {currentTab === 'installation' && (
          <div>
            <h2>Kurulum</h2>
            <p>
              Iqra Eğitim Portalı SaaS projesini kurmak için aşağıdaki adımları izleyin:
            </p>
            
            <h3>Önkoşullar</h3>
            <ul>
              <li>Node.js 18.0 veya üstü</li>
              <li>npm veya yarn</li>
              <li>Git</li>
            </ul>
            
            <h3>Adım Adım Kurulum</h3>
            
            <h3 className="text-lg font-medium mb-2">1. Projeyi klonlayın</h3>
            <div className="bg-gray-100 p-3 rounded-md">
              <code>git clone https://github.com/tural-musab/i-ep.app.git</code>
            </div>
            
            <h3 className="text-lg font-medium mb-2 mt-4">2. Proje dizinine girin</h3>
            <div className="bg-gray-100 p-3 rounded-md">
              <code>cd i-ep.app</code>
            </div>
            
            <h4>3. Bağımlılıkları Yükleyin</h4>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              <code>npm install</code>
            </pre>
            
            <h4>4. Ortam Değişkenlerini Oluşturun</h4>
            <p>
              <code>.env.local</code> dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              <code>{`# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Uygulama
NEXT_PUBLIC_APP_URL=http://localhost:3000`}</code>
            </pre>
          </div>
        )}
        
        {currentTab === 'configuration' && (
          <div>
            <h2>Yapılandırma</h2>
            
            <h3>Supabase Projesi Oluşturma</h3>
            <ol>
              <li>
                <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  Supabase
                </a> hesabınıza giriş yapın ve yeni bir proje oluşturun.
              </li>
              <li>Oluşturma işlemi tamamlandıktan sonra, proje ayarlarından API URL ve Anonim Anahtar bilgilerini alın.</li>
              <li>Bu bilgileri <code>.env.local</code> dosyanıza ekleyin.</li>
            </ol>
            
            <h3>Veritabanı Şemalarını Oluşturma</h3>
            <p>
              Tenant yönetimi için gereken şemaları oluşturmak için SQL dosyalarını çalıştırın:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              <code>{`-- public şemasında tenant tablosu oluştur
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true
);

-- RLS politikalarını uygula
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
`}</code>
            </pre>
            
            <h3>Yerel Geliştirme Ortamı</h3>
            <p>
              <code>.env.local</code> dosyanızda, <code>NEXT_PUBLIC_APP_URL</code> değişkenini <code>http://localhost:3000</code> olarak ayarlayın.
              Bu, yerel geliştirme sırasında tenant alt alan adlarının simüle edilmesini sağlar.
            </p>
          </div>
        )}
        
        {currentTab === 'development' && (
          <div>
            <h2>Geliştirme</h2>
            
            <h3>Geliştirme Sunucusunu Başlatma</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              <code>npm run dev</code>
            </pre>
            <p>
              Sunucu başladıktan sonra, tarayıcınızda <code>http://localhost:3000</code> adresine giderek uygulamayı görebilirsiniz.
            </p>
            
            <h3>Tenant Simülasyonu</h3>
            <p>
                              Yerel geliştirme sırasında tenant&apos;ları test etmek için, tarayıcınızda <code>http://localhost:3000/[tenant-subdomain]</code> URL&apos;sini kullanabilirsiniz.
              Örneğin, <code>http://localhost:3000/demo</code> &quot;demo&quot; tenant&apos;ını simüle eder.
            </p>
            
            <h3>API Routes</h3>
            <p>
              API rotaları <code>/app/api</code> dizininde tanımlanır. Yeni bir API endpoint&apos;i oluşturmak için:
            </p>
            <ol>
              <li><code>/app/api/[endpoint-name]</code> klasörünü oluşturun</li>
              <li>Bu klasörde <code>route.ts</code> dosyası oluşturun</li>
              <li>İlgili HTTP method&apos;larını (GET, POST, vb.) tanımlayın</li>
            </ol>
            
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              <code>{`// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Tenant'a özgü kullanıcıları getir
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  // Yeni kullanıcı oluştur
  const data = await request.json();
  return NextResponse.json({ success: true });
}`}</code>
            </pre>
            
            <h3>Bileşenler Oluşturma</h3>
            <p>
              Yeni bileşenler, <code>/components</code> dizininde ilgili alt klasörlerde oluşturulmalıdır:
            </p>
            <ul>
              <li><code>/components/ui</code>: Temel UI bileşenleri (butonlar, kartlar vb.)</li>
              <li><code>/components/tenant</code>: Tenant&apos;a özgü bileşenler</li>
              <li><code>/components/layouts</code>: Layout bileşenleri</li>
              <li><code>/components/dashboard</code>: Dashboard bileşenleri</li>
            </ul>
            
            <h3>Daha Fazla Bilgi</h3>
            <p>
              Daha fazla ayrıntı ve geliştirme rehberleri için diğer dokümantasyon bölümlerine göz atın:
            </p>
            <ul>
              <li>
                <Link href="/docs/api" className="text-primary hover:underline">
                  API Dokümantasyonu
                </Link>
              </li>
              <li>
                <Link href="/docs/components" className="text-primary hover:underline">
                  UI Bileşenleri
                </Link>
              </li>
              <li>
                <Link href="/docs/guides/tenant-management" className="text-primary hover:underline">
                  Tenant Yönetimi Rehberi
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 