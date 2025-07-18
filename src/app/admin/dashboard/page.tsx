'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { User } from '@supabase/auth-helpers-nextjs';

// User details tipi
interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  auth_id: string;
}

// Tenant details tipi
interface TenantDetails {
  id: string;
  name: string;
  subdomain: string;
  plan_type: string;
  is_active: boolean;
}

/**
 * Admin Dashboard Sayfası
 *
 * Yönetici yetkisine sahip kullanıcıların kontrol paneli
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [tenantDetails, setTenantDetails] = useState<TenantDetails | null>(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Kullanıcının giriş yapıp yapmadığını ve admin olup olmadığını kontrol et
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        // Mevcut oturumu al
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          // Kullanıcı giriş yapmamış, giriş sayfasına yönlendir
          router.push('/auth/giris');
          return;
        }

        // Kullanıcı bilgilerini al
        const { data: userData } = await supabase.auth.getUser();

        if (!userData.user) {
          setError('Kullanıcı bilgileri alınamadı');
          setIsLoading(false);
          return;
        }

        setUser(userData.user);

        // Tenant ID'yi al
        const tenantId = await getTenantId();
        if (!tenantId) {
          setError('Tenant bilgisi alınamadı');
          setIsLoading(false);
          return;
        }

        // Kullanıcı detaylarını al
        const { data: userDetailsData, error: userDetailsError } = await supabase
          .from(`tenant_${tenantId}.users`)
          .select('*')
          .eq('auth_id', userData.user.id)
          .single();

        if (userDetailsError) {
          console.error('Kullanıcı detayları hatası:', userDetailsError);
          setError('Kullanıcı profili bulunamadı');
          setIsLoading(false);
          return;
        }

        setUserDetails(userDetailsData);

        // Kullanıcının admin olup olmadığını kontrol et
        if (userDetailsData.role !== 'admin') {
          setError('Bu sayfaya erişim izniniz yok');
          setIsLoading(false);
          return;
        }

        // Tenant detaylarını al
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', tenantId)
          .single();

        if (tenantData) {
          setTenantDetails(tenantData);
        }

        // Kullanıcı istatistiklerini al
        const { data: usersData } = await supabase
          .from(`tenant_${tenantId}.users`)
          .select('role', { count: 'exact' });

        if (usersData) {
          const totalUsers = usersData.length;
          const totalTeachers = usersData.filter((user) => user.role === 'teacher').length;
          const totalStudents = usersData.filter((user) => user.role === 'student').length;

          setUserStats({
            totalUsers,
            totalTeachers,
            totalStudents,
          });
        }
      } catch (err) {
        console.error('Admin dashboard yükleme hatası:', err);
        setError('Sayfa yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/giris');
    } catch (err) {
      console.error('Çıkış hatası:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-solid border-blue-500"></div>
        <p className="mt-4 text-gray-700">Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">Hata</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/auth/giris')}
            className="mt-4 inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Image
                  src="/logo.webp"
                  alt="Iqra Eğitim Portalı"
                  width={120}
                  height={120}
                  className="h-16 w-auto"
                />
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  Iqra Eğitim Portalı - Yönetici Paneli
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="relative ml-3">
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-700">
                    {userDetails?.name || user?.email} (Yönetici)
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                  >
                    Çıkış
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl leading-tight font-bold text-gray-900">Yönetici Paneli</h1>
            <p className="mt-2 text-gray-600">
              {tenantDetails?.name || 'Okul'} yönetimi ve istatistikleri
            </p>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* İstatistik Kartları */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">
                          Toplam Kullanıcı
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {userStats.totalUsers}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Tüm kullanıcıları görüntüle
                    </a>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">
                          Öğretmen Sayısı
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {userStats.totalTeachers}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Öğretmenleri yönet
                    </a>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">
                          Öğrenci Sayısı
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {userStats.totalStudents}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Öğrencileri yönet
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Hızlı Erişim Menüsü */}
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Hızlı Erişim</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Kullanıcı Yönetimi
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Kullanıcı ekle, düzenle, sil ve yetkilendirme
                    </p>
                    <div className="mt-3">
                      <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Kullanıcılara Git &rarr;
                      </a>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Dersler ve Sınıflar
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Ders ve sınıf ekle, düzenle, atama yap
                    </p>
                    <div className="mt-3">
                      <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Derslere Git &rarr;
                      </a>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Duyurular</h3>
                    <p className="mt-1 text-sm text-gray-500">Duyuru ekle, düzenle ve yayınla</p>
                    <div className="mt-3">
                      <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Duyurulara Git &rarr;
                      </a>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Tenant Ayarları</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Okul bilgileri, görünüm ve sistem ayarları
                    </p>
                    <div className="mt-3">
                      <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Ayarlara Git &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
