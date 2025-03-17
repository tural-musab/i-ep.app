import Link from 'next/link';

export default function GuidesDocsPage() {
  // Rehber listesi
  const guides = [
    {
      title: 'Başlangıç Rehberi',
      description: 'Maarif Okul Portalı SaaS projesini kurmak ve çalıştırmak için adım adım rehber.',
      link: '/docs/guides/getting-started',
      tags: ['Başlangıç', 'Kurulum'],
    },
    {
      title: 'Tenant Oluşturma ve Yönetme',
      description: 'Yeni bir tenant (okul) oluşturma, yapılandırma ve yönetme rehberi.',
      link: '/docs/guides/tenant-management',
      tags: ['Tenant', 'Multi-tenant'],
    },
    {
      title: 'Kimlik Doğrulama ve Yetkilendirme',
      description: 'Kullanıcı kimlik doğrulama, yetkilendirme ve rol tabanlı erişim kontrolü rehberi.',
      link: '/docs/guides/authentication',
      tags: ['Güvenlik', 'Kimlik Doğrulama', 'Roller'],
    },
    {
      title: 'API Entegrasyonu',
      description: 'Maarif Okul Portalı API\'lerini harici uygulamalarla entegre etme rehberi.',
      link: '/docs/guides/api-integration',
      tags: ['API', 'Entegrasyon'],
    },
    {
      title: 'Özelleştirme ve Genişletme',
      description: 'Platformu özelleştirme ve yeni özellikler ekleyerek genişletme rehberi.',
      link: '/docs/guides/customization',
      tags: ['Özelleştirme', 'Geliştirme'],
    },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Geliştirici Rehberleri</h1>
      
      <p className="text-lg mb-8">
        Bu bölümde, Maarif Okul Portalı SaaS projesinin çeşitli yönlerini
        anlamanıza ve kullanmanıza yardımcı olacak rehberler bulacaksınız.
        Her rehber, belirli bir görevi gerçekleştirmek için adım adım talimatlar içerir.
      </p>
      
      <div className="grid grid-cols-1 gap-6">
        {guides.map((guide, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">{guide.title}</h2>
            <p className="text-gray-600 mb-4">{guide.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {guide.tags.map((tag, tagIndex) => (
                <span 
                  key={tagIndex} 
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <Link 
              href={guide.link} 
              className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary-600"
            >
              Rehberi Oku
            </Link>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Katkıda Bulunma</h2>
        <p className="mb-4">
          Rehberlerimizi geliştirmemize yardımcı olmak ister misiniz? Yeni rehberler ekleyebilir 
          veya mevcut rehberleri güncelleyebilirsiniz.
        </p>
        <a 
          href="https://github.com/maarifportal/maarif-okul-portali" 
          target="_blank" 
          rel="noreferrer"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          GitHub'da Katkıda Bulun
        </a>
      </div>
    </div>
  );
} 