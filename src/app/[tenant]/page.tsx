import { getTenantByDomain } from '@/lib/tenant/tenant-utils';
import { notFound } from 'next/navigation';

export default async function TenantHomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: subdomain } = await params;
  const domain = `${subdomain}.i-ep.app`;

  // Tenant bilgisini al
  const tenant = await getTenantByDomain(domain);

  // Tenant bulunamazsa 404
  if (!tenant) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">{tenant.name} Portalı</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Öğrenciler</h2>
          <p className="text-gray-600">Öğrenci kayıtları ve bilgilerini yönetin.</p>
          <a
            href={`/${subdomain}/ogrenciler`}
            className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Öğrencilere Git
          </a>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Öğretmenler</h2>
          <p className="text-gray-600">Öğretmen kadrosu ve ders programlarını yönetin.</p>
          <a
            href={`/${subdomain}/ogretmenler`}
            className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Öğretmenlere Git
          </a>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Sınıflar</h2>
          <p className="text-gray-600">Sınıf organizasyonu ve ders programlarını yönetin.</p>
          <a
            href={`/${subdomain}/siniflar`}
            className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Sınıflara Git
          </a>
        </div>
      </div>

      <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Son Aktiviteler</h2>
        <div className="space-y-4">
          <div className="rounded bg-gray-50 p-3">
            <p className="text-gray-800">Yeni öğrenci kaydı yapıldı: Ahmet Yılmaz</p>
            <p className="text-sm text-gray-500">2 saat önce</p>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <p className="text-gray-800">Not girişi tamamlandı: 9-A Matematik</p>
            <p className="text-sm text-gray-500">3 saat önce</p>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <p className="text-gray-800">Yeni duyuru: Veli toplantısı</p>
            <p className="text-sm text-gray-500">5 saat önce</p>
          </div>
        </div>
      </div>
    </div>
  );
}
