import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';

export default function GuidesDocsPage() {
  // Rehber listesi
  const guides = [
    {
      title: 'Başlangıç Rehberi',
      description:
        'Iqra Eğitim Portalı SaaS projesini kurmak ve çalıştırmak için adım adım rehber.',
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
      description:
        'Kullanıcı kimlik doğrulama, yetkilendirme ve rol tabanlı erişim kontrolü rehberi.',
      link: '/docs/guides/authentication',
      tags: ['Güvenlik', 'Kimlik Doğrulama', 'Roller'],
    },
    {
      title: 'API Entegrasyonu',
      description: "Iqra Eğitim Portalı API'lerini harici uygulamalarla entegre etme rehberi.",
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
      <h1 className="mb-6 text-4xl font-bold">Geliştirici Rehberleri</h1>

      <p className="mb-8 text-lg">
        Bu bölümde, Iqra Eğitim Portalı SaaS projesinin çeşitli yönlerini anlamanıza ve kullanmanıza
        yardımcı olacak rehberler bulacaksınız. Her rehber, belirli bir görevi gerçekleştirmek için
        adım adım talimatlar içerir.
      </p>

      <div className="grid grid-cols-1 gap-6">
        {guides.map((guide, index) => (
          <div key={index} className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-2xl font-semibold">{guide.title}</h2>
            <p className="mb-4 text-gray-600">{guide.description}</p>

            <div className="mb-4 flex flex-wrap gap-2">
              {guide.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            <Link
              href={guide.link}
              className="bg-primary hover:bg-primary-600 inline-block rounded px-4 py-2 text-white"
            >
              Rehberi Oku
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-blue-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold">Katkıda Bulunma</h2>
        <p className="mb-4">
          Rehberlerimizi geliştirmemize yardımcı olmak ister misiniz? Yeni rehberler ekleyebilir
          veya mevcut rehberleri güncelleyebilirsiniz.
        </p>
        <div className="mt-10">
          <a
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            href="https://github.com/tural-musab/i-ep.app"
            target="_blank"
            rel="noreferrer"
          >
            <FaGithub className="mr-2" />
            GitHub Repo
          </a>
        </div>
      </div>
    </div>
  );
}
