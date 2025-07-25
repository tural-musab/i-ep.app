'use client';

import { useEffect, useState } from 'react';

interface DemoSession {
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name: string;
      role: string;
      title?: string;
    };
  };
  role: string;
  timestamp: number;
}

export function DemoSessionHandler() {
  const [demoSession, setDemoSession] = useState<DemoSession | null>(null);

  useEffect(() => {
    // Demo session'ı localStorage'dan oku
    const storedSession = localStorage.getItem('demo_session');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        setDemoSession(session);
        console.log('🎯 Demo session loaded:', session);

        // Header'a demo bilgilerini ekle (optional)
        document.title = `Dashboard - ${session.user.user_metadata.full_name} (${session.user.user_metadata.title || session.role})`;
      } catch (err) {
        console.error('❌ Demo session parse hatası:', err);
        localStorage.removeItem('demo_session');
      }
    }
  }, []);

  if (!demoSession) {
    return (
      <div className="mb-4 rounded border bg-red-100 p-3 text-sm text-red-800">
        ⚠️ Demo session bulunamadı. <a href="/auth/demo" className="underline">Demo sayfasına dönün</a>.
      </div>
    );
  }

  return (
    <div className="mb-4 rounded border bg-green-100 p-3 text-sm text-green-800">
      ✅ <strong>Demo Aktif:</strong> {demoSession.user.user_metadata.full_name} -{' '}
      {demoSession.user.user_metadata.title || demoSession.role} ({demoSession.user.email})
      <button
        onClick={() => {
          localStorage.removeItem('demo_session');
          window.location.href = '/auth/demo';
        }}
        className="ml-3 rounded bg-green-200 px-2 py-1 text-xs hover:bg-green-300"
      >
        Demo'yu Bitir
      </button>
    </div>
  );
}