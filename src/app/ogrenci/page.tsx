'use client';

import React from 'react';
import { StudentGuard } from '@/components/auth/role-guard';
import { AccessDenied } from '@/components/auth/access-denied';
import { useAuth } from '@/lib/auth/auth-context';
import { CalendarDays, BookOpen, Clock, User } from 'lucide-react';

export default function StudentPage() {
  const { user, currentTenantId } = useAuth();
  
  // Öğrenci sayfasının içeriği
  const StudentPageContent = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Merhaba, {user?.profile?.fullName || 'Öğrenci'}</h1>
        <p className="text-gray-600">Öğrenci portalına hoş geldiniz! Bugün sizin için önemli hatırlatmalar var.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <CalendarDays className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Bugünkü Dersler</h3>
            <p className="text-xl font-semibold">4 Ders</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center">
          <div className="rounded-full bg-amber-100 p-3 mr-4">
            <BookOpen className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Aktif Ödevler</h3>
            <p className="text-xl font-semibold">3 Ödev</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <Clock className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Sınav Takvimleri</h3>
            <p className="text-xl font-semibold">2 Sınav</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <User className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Öğretmen Mesajları</h3>
            <p className="text-xl font-semibold">5 Yeni</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Bugünkü Ders Programı</h2>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="w-16 text-center">
                  <span className="block text-sm text-gray-500">09:00</span>
                  <span className="block text-sm text-gray-500">10:30</span>
                </div>
                <div className="flex-1 ml-4">
                  <h3 className="font-medium">Matematik</h3>
                  <p className="text-sm text-gray-600">Ahmet Yılmaz</p>
                </div>
                <div className="bg-blue-200 px-3 py-1 rounded text-xs font-medium text-blue-800">
                  Aktif
                </div>
              </div>
              
              <div className="flex items-center p-3 border border-gray-100 rounded-lg">
                <div className="w-16 text-center">
                  <span className="block text-sm text-gray-500">10:45</span>
                  <span className="block text-sm text-gray-500">12:15</span>
                </div>
                <div className="flex-1 ml-4">
                  <h3 className="font-medium">Fizik</h3>
                  <p className="text-sm text-gray-600">Ayşe Demir</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 border border-gray-100 rounded-lg">
                <div className="w-16 text-center">
                  <span className="block text-sm text-gray-500">13:00</span>
                  <span className="block text-sm text-gray-500">14:30</span>
                </div>
                <div className="flex-1 ml-4">
                  <h3 className="font-medium">Türkçe</h3>
                  <p className="text-sm text-gray-600">Mehmet Kaya</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 border border-gray-100 rounded-lg">
                <div className="w-16 text-center">
                  <span className="block text-sm text-gray-500">14:45</span>
                  <span className="block text-sm text-gray-500">16:15</span>
                </div>
                <div className="flex-1 ml-4">
                  <h3 className="font-medium">İngilizce</h3>
                  <p className="text-sm text-gray-600">Zeynep Şahin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Yaklaşan Ödevler</h2>
            
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <div className="flex justify-between mb-1">
                  <h3 className="font-medium text-sm">Matematik - Fonksiyonlar</h3>
                  <span className="text-red-600 text-xs font-medium">Bugün</span>
                </div>
                <p className="text-xs text-gray-500">Konu: Fonksiyonlar ve Grafikler</p>
              </div>
              
              <div className="border-b border-gray-100 pb-3">
                <div className="flex justify-between mb-1">
                  <h3 className="font-medium text-sm">Fizik - Elektrik Devreleri</h3>
                  <span className="text-amber-600 text-xs font-medium">2 gün</span>
                </div>
                <p className="text-xs text-gray-500">Konu: Seri ve Paralel Devreler</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <h3 className="font-medium text-sm">Türkçe - Kompozisyon</h3>
                  <span className="text-green-600 text-xs font-medium">5 gün</span>
                </div>
                <p className="text-xs text-gray-500">Konu: Çevre Kirliliği Hakkında</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <StudentGuard 
      fallback={<AccessDenied title="Öğrenci Girişi Gerekli" message="Bu sayfayı görüntülemek için öğrenci hesabı ile giriş yapmalısınız." />} 
      redirectTo="/auth/giris"
    >
      <StudentPageContent />
    </StudentGuard>
  );
}