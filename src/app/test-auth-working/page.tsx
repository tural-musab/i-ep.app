'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

export default function TestAuthWorkingPage() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [apiResult, setApiResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const testAssignmentAPI = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/assignments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      });

      const data = await response.json();
      setApiResult({
        status: response.status,
        success: response.ok,
        data: data,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      setApiResult({
        status: 'error',
        success: false,
        data: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <span className="ml-2">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h1 className="mb-2 text-xl font-bold text-yellow-800">Giriş Gerekli</h1>
          <p className="mb-4 text-yellow-700">Bu sayfayı görmek için giriş yapmanız gerekiyor.</p>
          <a
            href="/auth/giris"
            className="inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Giriş Yap
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">🧪 Authentication & API Test</h1>

      {/* User Info */}
      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <h2 className="mb-3 text-lg font-semibold text-green-800">✅ Giriş Bilgileri</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Email:</strong> {user?.email}
          </div>
          <div>
            <strong>Role:</strong> {user?.role}
          </div>
          <div>
            <strong>Tenant ID:</strong> {user?.tenantId}
          </div>
          <div>
            <strong>Active:</strong> {user?.isActive ? 'Evet' : 'Hayır'}
          </div>
          <div>
            <strong>Full Name:</strong> {user?.profile?.fullName || 'Belirtilmemiş'}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id}
          </div>
        </div>
      </div>

      {/* API Test Section */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h2 className="mb-3 text-lg font-semibold text-blue-800">🔗 Assignment API Test</h2>
        <div className="space-y-4">
          <button
            onClick={testAssignmentAPI}
            disabled={testing}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {testing ? 'Test Ediliyor...' : 'Assignment API Test Et'}
          </button>

          {apiResult && (
            <div
              className={`rounded-lg border p-4 ${
                apiResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <h3 className="mb-2 font-semibold">
                {apiResult.success ? '✅ API Başarılı' : '❌ API Hatası'}
              </h3>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Status:</strong> {apiResult.status}
                </div>
                <div>
                  <strong>Time:</strong> {apiResult.timestamp}
                </div>
                <div>
                  <strong>Response:</strong>
                </div>
                <pre className="max-h-40 overflow-auto rounded border bg-white p-2 text-xs">
                  {JSON.stringify(apiResult.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={() => signOut()}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Çıkış Yap
        </button>
        <a
          href="/dashboard"
          className="inline-block rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Dashboard'a Git
        </a>
      </div>

      {/* Professional Notes */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold text-gray-700">📋 Test Notları</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• Bu sayfa browser-based authentication test eder</li>
          <li>• Cookie-based session kullanır (production scenario)</li>
          <li>• Hybrid auth system test eder (NextAuth + Supabase fallback)</li>
          <li>• API response ve error handling'i doğrular</li>
        </ul>
      </div>
    </div>
  );
}
