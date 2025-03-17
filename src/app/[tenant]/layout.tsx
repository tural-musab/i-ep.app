import { getTenantByDomain } from '@/lib/tenant/tenant-utils';
import { notFound } from 'next/navigation';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenant: string };
}) {
  const subdomain = params.tenant;
  const domain = `${subdomain}.i-es.app`;
  
  // Tenant bilgisini al
  const tenant = await getTenantByDomain(domain);
  
  // Tenant bulunamazsa 404
  if (!tenant) {
    notFound();
  }
  
  return (
    <div className="tenant-layout">
      {/* Tenant-specific header, sidebar vb. burada olabilir */}
      <header className="bg-primary p-4 text-white">
        <h1>{tenant.name}</h1>
      </header>
      
      <main>{children}</main>
      
      <footer className="p-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Iqra Eğitim Portalı
      </footer>
    </div>
  );
} 