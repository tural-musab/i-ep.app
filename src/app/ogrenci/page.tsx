'use client';

import React, { Suspense } from 'react';
import { StudentGuard } from '@/components/auth/role-guard';
import { AccessDenied } from '@/components/auth/access-denied';
import { useAuth } from '@/lib/auth/auth-context';
import { useSearchParams } from 'next/navigation';
import { CalendarDays, BookOpen, Clock, User, GraduationCap, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { ProgressiveDemoTour } from '@/components/demo/progressive-demo-tour';
import { AcademicProgress } from '@/components/student/academic-progress';

function OgrenciPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  const tourMode = searchParams.get('tour') === 'start';
  const tourRole = searchParams.get('role') || 'student';

  // Öğrenci sayfasının içeriği
  const StudentPageContent = () => (
    <div className="p-6">
      {tourMode && <ProgressiveDemoTour role={tourRole} />}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold">Merhaba, {user?.profile?.fullName || 'Öğrenci'}</h1>
        <p className="text-gray-600">
          Öğrenci portalına hoş geldiniz! Bugün sizin için önemli hatırlatmalar var.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mr-4 rounded-full bg-blue-100 p-3">
            <CalendarDays className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Bugünkü Dersler</h3>
            <p className="text-xl font-semibold">4 Ders</p>
          </div>
        </div>

        <div className="flex items-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mr-4 rounded-full bg-amber-100 p-3">
            <BookOpen className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Aktif Ödevler</h3>
            <p className="text-xl font-semibold">3 Ödev</p>
          </div>
        </div>

        <div className="flex items-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mr-4 rounded-full bg-green-100 p-3">
            <Clock className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Sınav Takvimleri</h3>
            <p className="text-xl font-semibold">2 Sınav</p>
          </div>
        </div>

        <div className="flex items-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mr-4 rounded-full bg-purple-100 p-3">
            <User className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Öğretmen Mesajları</h3>
            <p className="text-xl font-semibold">5 Yeni</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Bugünkü Ders Programı</h2>

            <div className="space-y-3">
              <div className="flex items-center rounded-lg bg-blue-50 p-3">
                <div className="w-16 text-center">
                  <span className="block text-sm text-gray-500">09:00</span>
                  <span className="block text-sm text-gray-500">10:30</span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium">Matematik</h3>
                  <p className="text-sm text-gray-600">Ahmet Yılmaz</p>
                </div>
                <div className="rounded bg-blue-200 px-3 py-1 text-xs font-medium text-blue-800">
                  Aktif
                </div>
              </div>

              <div className="flex items-center rounded-lg border border-gray-100 p-3">
                <div className="w-16 text-center">
                  <span className="block text-sm text-gray-500">10:45</span>
                  <span className="block text-sm text-gray-500">12:15</span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium">Fizik</h3>
                  <p className="text-sm text-gray-600">Ayşe Demir</p>
                </div>
              </div>

              <div className="flex items-center rounded-lg border border-gray-100 p-3">
                <div className="w-16 text-center">
                  <span className="block text-sm text-gray-500">13:00</span>
                  <span className="block text-sm text-gray-500">14:30</span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium">Türkçe</h3>
                  <p className="text-sm text-gray-600">Mehmet Kaya</p>
                </div>
              </div>

              <div className="flex items-center rounded-lg border border-gray-100 p-3">
                <div className="w-16 text-center">
                  <span className="block text-sm text-gray-500">14:45</span>
                  <span className="block text-sm text-gray-500">16:15</span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium">İngilizce</h3>
                  <p className="text-sm text-gray-600">Zeynep Şahin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Yaklaşan Ödevler</h2>

            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <div className="mb-1 flex justify-between">
                  <h3 className="text-sm font-medium">Matematik - Fonksiyonlar</h3>
                  <span className="text-xs font-medium text-red-600">Bugün</span>
                </div>
                <p className="text-xs text-gray-500">Konu: Fonksiyonlar ve Grafikler</p>
              </div>

              <div className="border-b border-gray-100 pb-3">
                <div className="mb-1 flex justify-between">
                  <h3 className="text-sm font-medium">Fizik - Elektrik Devreleri</h3>
                  <span className="text-xs font-medium text-amber-600">2 gün</span>
                </div>
                <p className="text-xs text-gray-500">Konu: Seri ve Paralel Devreler</p>
              </div>

              <div>
                <div className="mb-1 flex justify-between">
                  <h3 className="text-sm font-medium">Türkçe - Kompozisyon</h3>
                  <span className="text-xs font-medium text-green-600">5 gün</span>
                </div>
                <p className="text-xs text-gray-500">Konu: Çevre Kirliliği Hakkında</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-6">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Hızlı Erişim</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link 
              href="/ogrenci/notlar"
              className="group flex items-center rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="mr-4 rounded-full bg-blue-100 p-3 group-hover:bg-blue-200">
                <GraduationCap className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Notlarım</h3>
                <p className="text-sm text-gray-500">Not kartını görüntüle</p>
              </div>
            </Link>

            <Link 
              href="/ogrenci/odevler"
              className="group flex items-center rounded-lg border border-gray-200 p-4 transition-all hover:border-orange-300 hover:bg-orange-50"
            >
              <div className="mr-4 rounded-full bg-orange-100 p-3 group-hover:bg-orange-200">
                <BookOpen className="h-6 w-6 text-orange-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Ödev Teslimi</h3>
                <p className="text-sm text-gray-500">Ödevlerinizi görüntüleyin ve teslim edin</p>
              </div>
            </Link>

            <Link 
              href="/ogrenci/ilerleme"
              className="group flex items-center rounded-lg border border-gray-200 p-4 transition-all hover:border-green-300 hover:bg-green-50"
            >
              <div className="mr-4 rounded-full bg-green-100 p-3 group-hover:bg-green-200">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Akademik İlerleme</h3>
                <p className="text-sm text-gray-500">Performans analizi ve hedefler</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Academic Progress Section */}
      <div id="academic-progress" className="mt-8">
        <AcademicProgress />
      </div>
    </div>
  );

  return (
    <StudentGuard
      fallback={
        <AccessDenied
          title="Öğrenci Girişi Gerekli"
          message="Bu sayfayı görüntülemek için öğrenci hesabı ile giriş yapmalısınız."
        />
      }
      redirectTo="/auth/giris"
    >
      <StudentPageContent />
    </StudentGuard>
  );
}

export default function OgrenciPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>}>
      <OgrenciPageContent />
    </Suspense>
  );
}
