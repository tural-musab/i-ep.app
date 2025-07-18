'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SuperAdminGuard } from '@/components/auth/super-admin-guard';
import { AccessDenied } from '@/components/auth/access-denied';
import {
  LayoutDashboard,
  Building2,
  Globe,
  Users,
  KeyRound,
  ShieldAlert,
  Webhook,
  Settings,
  Menu,
  X,
  Bell,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SuperAdminLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/super-admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Tenantlar',
    href: '/super-admin/tenants',
    icon: Building2,
  },
  {
    name: 'Domainler',
    href: '/super-admin/domains',
    icon: Globe,
  },
  {
    name: 'Kullanıcılar',
    href: '/super-admin/users',
    icon: Users,
  },
  {
    name: 'Güvenlik',
    href: '/super-admin/security',
    icon: KeyRound,
  },
  {
    name: 'Denetim Kayıtları',
    href: '/super-admin/audit',
    icon: ShieldAlert,
  },
  {
    name: 'Webhook Yönetimi',
    href: '/super-admin/webhooks',
    icon: Webhook,
  },
  {
    name: 'Ayarlar',
    href: '/super-admin/settings',
    icon: Settings,
  },
];

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  useEffect(() => {
    console.log('Super admin layout sayfası yüklendi!');
    // Dark mode'u manuel olarak uygula
    document.documentElement.classList.add('dark');

    // Component unmount olduğunda dark mode'u kaldır
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const SuperAdminLayoutContent = () => (
    <div className="flex h-screen overflow-hidden bg-gray-800 text-gray-100">
      {/* Mobil sidebar açma/kapatma */}
      <div className="fixed inset-0 z-40 flex lg:hidden">
        <div
          className={cn(
            'bg-opacity-75 fixed inset-0 bg-gray-600 transition-opacity duration-300 ease-linear',
            sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={cn(
            'bg-primary-900 relative flex w-full max-w-xs flex-1 transform flex-col transition duration-300 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Navigasyonu kapat</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <Image src="/logo.webp" alt="Logo" width={40} height={40} className="h-8 w-auto" />
              <span className="ml-2 text-xl font-semibold text-white">Süper Admin</span>
            </div>
            <nav className="mt-5 space-y-1 px-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center rounded-md px-2 py-2 text-base font-medium',
                      isActive
                        ? 'bg-primary-800 text-white'
                        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-4 h-6 w-6 flex-shrink-0',
                        isActive ? 'text-white' : 'text-primary-300'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="border-primary-800 flex flex-shrink-0 border-t p-4">
            <div className="flex items-center">
              <div>
                <div className="bg-primary-700 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white uppercase">
                  {user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-white">
                  {user?.profile?.fullName || user?.email}
                </p>
                <p className="text-primary-200 text-sm font-medium">Süper Admin</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-14 flex-shrink-0"></div>
      </div>

      {/* Desktop sol sidebar - sabit görünüm */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <div className="bg-primary-900 flex h-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <Image src="/logo.webp" alt="Logo" width={40} height={40} className="h-8 w-auto" />
                <span className="ml-2 text-xl font-semibold text-white">Süper Admin</span>
              </div>
              <nav className="mt-5 flex-1 space-y-1 px-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                        isActive
                          ? 'bg-primary-800 text-white'
                          : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          isActive ? 'text-white' : 'text-primary-300'
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="border-primary-800 flex flex-shrink-0 border-t p-4">
              <div className="flex items-center">
                <div>
                  <div className="bg-primary-700 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white uppercase">
                    {user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.profile?.fullName || user?.email}
                  </p>
                  <p className="text-primary-200 text-xs font-medium">Süper Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ana içerik alanı */}
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <div className="relative z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            className="focus:ring-primary-500 border-r border-gray-200 px-4 text-gray-500 focus:ring-2 focus:outline-none focus:ring-inset lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Navigasyonu aç</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <div className="text-2xl font-semibold text-gray-900 lg:hidden">Süper Admin</div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <Button
                variant="ghost"
                size="icon"
                className="focus:ring-primary-500 relative rounded-full p-1 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                <span className="sr-only">Bildirimleri göster</span>
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-3 rounded-full">
                    <span className="sr-only">Kullanıcı menüsü</span>
                    <div className="bg-primary-700 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white uppercase">
                      {user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-4 py-3">
                    <p className="text-sm">Giriş yapan</p>
                    <p className="truncate text-sm font-medium">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/super-admin/profile">Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/super-admin/settings">Ayarlar</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Çıkış yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <SuperAdminGuard
      fallback={
        <AccessDenied
          title="Süper Admin Erişimi Reddedildi"
          message="Bu sayfayı görüntülemek için Süper Admin yetkilerine sahip olmalısınız."
        />
      }
      redirectTo="/auth/giris"
    >
      <SuperAdminLayoutContent />
    </SuperAdminGuard>
  );
}
