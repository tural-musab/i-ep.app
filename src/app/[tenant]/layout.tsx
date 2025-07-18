import { getTenantByDomain } from '@/lib/tenant/tenant-utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  BookOpen,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Home,
  Settings,
  CalendarCheck,
  FileText,
} from 'lucide-react';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: subdomain } = await params;
  const domain = `${subdomain}.i-ep.app`;

  // Tenant bilgisini al
  const tenant = await getTenantByDomain(domain);

  // Tenant bulunamazsa 404
  if (!tenant) {
    notFound();
  }

  const navigationItems = [
    {
      title: 'Ana Sayfa',
      href: `/${subdomain}`,
      icon: Home,
    },
    {
      title: 'Öğrenciler',
      href: `/${subdomain}/ogrenciler`,
      icon: Users,
    },
    {
      title: 'Öğretmenler',
      href: `/${subdomain}/ogretmenler`,
      icon: UserCheck,
    },
    {
      title: 'Sınıflar',
      href: `/${subdomain}/siniflar`,
      icon: BookOpen,
    },
    {
      title: 'Notlar',
      href: `/${subdomain}/notlar`,
      icon: ClipboardList,
    },
    {
      title: 'Yoklama',
      href: `/${subdomain}/yoklama`,
      icon: CalendarCheck,
    },
    {
      title: 'Ödevler',
      href: `/${subdomain}/odevler`,
      icon: FileText,
    },
    {
      title: 'İletişim',
      href: `/${subdomain}/iletisim`,
      icon: MessageSquare,
    },
    {
      title: 'Raporlar',
      href: `/${subdomain}/raporlar`,
      icon: BarChart3,
    },
    {
      title: 'Ayarlar',
      href: `/${subdomain}/ayarlar`,
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-semibold text-white">{tenant.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{tenant.name}</h1>
              <p className="text-sm text-gray-500">Eğitim Yönetim Sistemi</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="min-h-screen w-64 bg-white shadow-sm">
          <nav className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-h-screen flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
