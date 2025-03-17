'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getTenantId } from '@/lib/tenant/tenant-utils';

/**
 * Giriş Sayfası
 * 
 * Kullanıcıların sisteme giriş yapmasını sağlayan sayfa.
 */
export default function GirisPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Giriş işlemini gerçekleştir
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!email || !password) {
      setError('Tüm alanları doldurunuz');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Tenant'ı kontrol et
      const tenantId = await getTenantId();
      if (!tenantId) {
        setError('Geçersiz tenant');
        setIsLoading(false);
        return;
      }
      
      // Supabase Auth ile giriş yap
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (loginError) {
        console.error('Giriş hatası:', loginError);
        setError('E-posta veya şifre hatalı');
        setIsLoading(false);
        return;
      }
      
      if (!data.user) {
        setError('Kullanıcı bilgileri alınamadı');
        setIsLoading(false);
        return;
      }
      
      // Tenant ID'yi local storage'a kaydet
      localStorage.setItem('tenant-id', tenantId);
      
      // Kullanıcı bilgilerini tamamla
      const { data: userData, error: userError } = await supabase
        .from(`tenant_${tenantId}.users`)
        .select('role, status')
        .eq('auth_id', data.user.id)
        .single();
      
      if (userError) {
        console.error('Kullanıcı bilgileri hatası:', userError);
        setError('Kullanıcı profili bulunamadı');
        
        // Oturumu kapat
        await supabase.auth.signOut();
        
        setIsLoading(false);
        return;
      }
      
      // Kullanıcı durumunu kontrol et
      if (userData.status === 'suspended') {
        setError('Hesabınız askıya alınmış durumda. Lütfen yönetici ile iletişime geçin.');
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }
      
      // Başarılı giriş
      const redirectPath = userData.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      router.push(redirectPath);
      
    } catch (err: any) {
      console.error('Giriş hatası:', err);
      setError(err.message || 'Giriş sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/logo.svg"
            alt="Iqra Eğitim Portalı"
            width={100}
            height={100}
            className="mx-auto h-24 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hesabınıza Giriş Yapın
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Iqra Eğitim Portalı'na hoş geldiniz
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">E-posta adresi</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="E-posta adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Beni hatırla
              </label>
            </div>

            <div className="text-sm">
              <Link href="/auth/sifremi-unuttum" className="font-medium text-blue-600 hover:text-blue-500">
                Şifremi unuttum
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              Giriş Yap
            </button>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-sm">
              Hesabınız yok mu?{' '}
              <Link href="/auth/kayit" className="font-medium text-blue-600 hover:text-blue-500">
                Kayıt Ol
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 