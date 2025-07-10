'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { toast } from '@/components/ui/use-toast';
import { navigateBasedOnRole } from '@/utils/navigate-based-on-role';

/**
 * Giriş Sayfası
 * 
 * Kullanıcıların sisteme giriş yapmasını sağlayan sayfa.
 */
export default function GirisPage() {
  const router = useRouter();
  const { signIn, isLoading: authLoading } = useAuth();
  
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
      
      // AuthContext üzerinden giriş yap
      const { success, error: loginError, user } = await signIn(email, password);
      
      if (!success) {
        console.error('Giriş hatası:', loginError);
        setError(loginError || 'E-posta veya şifre hatalı');
        setIsLoading(false);
        return;
      }
      
      // Başarılı giriş bildirimi
      toast({
        title: "Giriş Başarılı",
        description: "Hoş geldiniz! Yönlendiriliyorsunuz...",
        variant: "success",
      });
      
      // Kullanıcı rolüne göre yönlendirme yap
      if (user && user.role) {
        navigateBasedOnRole(user.role, router);
      } else {
        // Kullanıcı bilgisi yok ise varsayılan olarak dashboard'a yönlendir
        router.push('/dashboard');
      }
      
    } catch (err: unknown) {
      console.error('Giriş hatası:', err);
      const errorMessage = err instanceof Error ? err.message : 'Giriş sırasında bir hata oluştu';
      setError(errorMessage);
      
      toast({
        title: "Giriş Başarısız",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/logo.webp"
            alt="Iqra Eğitim Portalı"
            width={160}
            height={160}
            priority={true}
            className="mx-auto h-32 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hesabınıza Giriş Yapın
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Iqra Eğitim Portalı&apos;na hoş geldiniz
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
              <label htmlFor="email-address" className="form-label">E-posta adresi</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="E-posta adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || authLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="form-input"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || authLoading}
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
              disabled={isLoading || authLoading}
            >
              {(isLoading || authLoading) ? (
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