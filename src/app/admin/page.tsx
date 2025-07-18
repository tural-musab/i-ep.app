'use client';

import React from 'react';

// Build zamanı URL hatalarını önlemek için dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Yönetici Paneli</h1>
        <p className="text-gray-600">Sistem yönetim araçlarına hoş geldiniz</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Sistem Durumu</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span>Aktif Tenant Sayısı</span>
            <span className="font-semibold text-blue-600">12</span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span>Toplam Kullanıcı</span>
            <span className="font-semibold text-blue-600">248</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Sistem Durumu</span>
            <span className="font-medium text-green-600">Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
}
