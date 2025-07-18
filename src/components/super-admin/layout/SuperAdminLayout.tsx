/**
 * Super Admin Layout Component
 * Sprint 7: Super Admin Paneli - Ana Layout Komponenti
 *
 * Bu komponent super admin panelinin ana layout'unu sağlar:
 * - Navigation sidebar
 * - Header ve kullanıcı bilgileri
 * - Responsive tasarım
 * - Role-based access control
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Activity,
  Users,
  Globe,
  Settings,
  Menu,
  X,
  Shield,
  BarChart3,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/super-admin',
    icon: Home,
    description: 'Genel bakış ve önemli metrikler',
  },
  {
    name: 'System Health',
    href: '/super-admin/system-health',
    icon: Activity,
    description: 'Sistem sağlığı ve performans izleme',
  },
  {
    name: 'Tenants',
    href: '/super-admin/tenants',
    icon: Users,
    description: 'Tenant yönetimi ve kullanıcı metrikleri',
  },
  {
    name: 'Domains',
    href: '/super-admin/domains',
    icon: Globe,
    description: 'Domain yönetimi ve SSL durumu',
  },
  {
    name: 'Analytics',
    href: '/super-admin/analytics',
    icon: BarChart3,
    description: 'Platform analitiği ve raporlar',
  },
  {
    name: 'Settings',
    href: '/super-admin/settings',
    icon: Settings,
    description: 'Platform ayarları ve konfigürasyonlar',
  },
];

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Mobile'da sidebar'ı otomatik kapat
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Kullanıcı bilgileri (gerçek implementasyonda store'dan gelecek)
  const user = {
    name: 'Super Admin',
    email: 'admin@i-ep.app',
    avatar: null,
  };

  const handleLogout = () => {
    // Logout logic
    router.push('/auth/giris');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Super Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/super-admin' && pathname.startsWith(item.href));

              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'border-r-2 border-blue-700 bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="absolute right-0 bottom-0 left-0 border-t border-gray-200 p-4">
          <div className="flex items-center text-sm text-gray-600">
            <Activity className="mr-2 h-4 w-4 text-green-500" />
            <span>Sistem Sağlıklı</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-400 hover:text-gray-600 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="hidden lg:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigation.find(
                    (item) =>
                      pathname === item.href ||
                      (item.href !== '/super-admin' && pathname.startsWith(item.href))
                  )?.name || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative text-gray-400 hover:text-gray-600">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                  <span className="text-xs font-medium text-white">3</span>
                </span>
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 rounded-lg bg-white p-2 text-sm transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                    <div className="border-b border-gray-200 px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    <button
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
