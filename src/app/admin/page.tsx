'use client';

import React from 'react';
import { AdminGuard } from '@/components/auth/role-guard';
import { AccessDenied } from '@/components/auth/access-denied';
import { useSession } from 'next-auth/react';

export default function AdminPage() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') {
    return <div>Yükleniyor...</div>
  }
  
  // Admin sayfasının içeriği
  const AdminPageContent = () => (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Yönetici Paneli</h1>
        <p className="text-gray-600">Sistem yönetim araçlarına hoş geldiniz</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Kullanıcı Bilgileri</h2>
        
        {session?.user && (
          <div className="space-y-2">
            <p><span className="font-medium">Kullanıcı ID:</span> {session.user.id}</p>
            <p><span className="font-medium">E-posta:</span> {session.user.email}</p>
            <p><span className="font-medium">Ad Soyad:</span> {session.user.profile?.fullName || 'Belirtilmemiş'}</p>
            <p><span className="font-medium">Rol:</span> {session.user.role}</p>
            <p><span className="font-medium">Tenant ID:</span> {session.user.tenantId || 'Sistem Yöneticisi'}</p>
            <p>
              <span className="font-medium">Hesap durumu:</span> 
              <span className={session.user.isActive ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                {session.user.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sistem Durumu</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span>Aktif Tenant Sayısı</span>
              <span className="font-semibold text-blue-600">12</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span>Toplam Kullanıcı</span>
              <span className="font-semibold text-blue-600">248</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span>Son 7 Gün Kayıt</span>
              <span className="font-semibold text-green-600">+18</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Sistem Durumu</span>
              <span className="text-green-600 font-medium">Aktif</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Hızlı Erişim</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors text-center">
              <span className="block font-medium">Tenant Yönetimi</span>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors text-center">
              <span className="block font-medium">Kullanıcılar</span>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-md transition-colors text-center">
              <span className="block font-medium">Raporlar</span>
            </button>
            <button className="p-4 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors text-center">
              <span className="block font-medium">Ayarlar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <AdminGuard 
      fallback={<AccessDenied />} 
      redirectTo="/auth/giris"
    >
      <AdminPageContent />
    </AdminGuard>
  );
} 