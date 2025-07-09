'use client';

import React from 'react';

// Build zamanı URL hatalarını önlemek için dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Yönetici Paneli</h1>
        <p className="text-gray-600">Sistem yönetim araçlarına hoş geldiniz</p>
      </div>
      
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
          <div className="flex justify-between items-center">
            <span>Sistem Durumu</span>
            <span className="text-green-600 font-medium">Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
} 