'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Quick Demo Login - Bypass için geçici sayfa
 * Infinite loop sorununu çözmek için
 */
export default function QuickDemoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const demoUsers = [
    { role: 'admin', name: 'Admin User', path: '/admin' },
    { role: 'teacher', name: 'Öğretmen', path: '/ogretmen' },  
    { role: 'student', name: 'Öğrenci', path: '/ogrenci' },
    { role: 'parent', name: 'Veli', path: '/veli' }
  ];

  const handleDemoLogin = (path: string, role: string) => {
    setIsLoading(true);
    console.log(`🔧 Quick demo login as ${role} → ${path}`);
    
    // Direct navigation without auth loop
    setTimeout(() => {
      router.push(path);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            🚀 Quick Demo Login
          </CardTitle>
          <CardDescription>
            Geçici demo giriş sayfası (infinite loop bypass)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {demoUsers.map((user) => (
            <Button
              key={user.role}
              onClick={() => handleDemoLogin(user.path, user.role)}
              disabled={isLoading}
              variant="outline"
              className="w-full justify-start"
            >
              <span className="mr-2">👤</span>
              {user.name} olarak giriş
            </Button>
          ))}
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>⚠️ Bu geçici bir bypass sayfasıdır</p>
            <p>Ana giriş: <a href="/auth/giris" className="text-blue-600">/auth/giris</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}