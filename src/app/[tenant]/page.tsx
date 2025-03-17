import { getTenantByDomain } from '@/lib/tenant/tenant-utils';
import { notFound } from 'next/navigation';

export default async function TenantHomePage({
  params,
}: {
  params: { tenant: string };
}) {
  const subdomain = params.tenant;
  const domain = `${subdomain}.i-ep.app`;
  
  // Tenant bilgisini al
  const tenant = await getTenantByDomain(domain);
  
  // Tenant bulunamazsa 404
  if (!tenant) {
    notFound();
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{tenant.name} Portalı</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Öğrenciler</h2>
          <p className="text-gray-600">Öğrenci kayıtları ve bilgilerini yönetin.</p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Öğrencilere Git
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Öğretmenler</h2>
          <p className="text-gray-600">Öğretmen kadrosu ve ders programlarını yönetin.</p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Öğretmenlere Git
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Dersler</h2>
          <p className="text-gray-600">Ders programları ve müfredatı yönetin.</p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Derslere Git
          </button>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Son Aktiviteler</h2>
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-gray-800">Yeni öğrenci kaydı yapıldı: Ahmet Yılmaz</p>
            <p className="text-sm text-gray-500">2 saat önce</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-gray-800">Not girişi tamamlandı: 9-A Matematik</p>
            <p className="text-sm text-gray-500">3 saat önce</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-gray-800">Yeni duyuru: Veli toplantısı</p>
            <p className="text-sm text-gray-500">5 saat önce</p>
          </div>
        </div>
      </div>
    </div>
  );
} 