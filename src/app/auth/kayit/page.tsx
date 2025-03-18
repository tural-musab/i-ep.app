'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getTenantId } from '@/lib/tenant/tenant-utils';

/**
 * Kayıt Sayfası
 * 
 * Yeni kullanıcıların sisteme kaydolmasını sağlayan sayfa.
 */
export default function KayitPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Kayıt işlemini gerçekleştir
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!name || !email || !password || !confirmPassword) {
      setError('Tüm alanları doldurunuz');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Tenant'ı kontrol et - artık async fonksiyon
      const tenantId = await getTenantId();
      if (!tenantId) {
        setError('Geçersiz tenant');
        setIsLoading(false);
        return;
      }
      
      // Supabase Auth ile kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            tenant_id: tenantId
          }
        }
      });
      
      if (authError) {
        console.error('Kayıt hatası:', authError);
        setError(authError.message);
        setIsLoading(false);
        return;
      }
      
      if (!authData.user) {
        setError('Kullanıcı oluşturulamadı');
        setIsLoading(false);
        return;
      }
      
      // Kullanıcı profil bilgilerini ekle
      const { error: profileError } = await supabase
        .from(`tenant_${tenantId}.users`)
        .insert({
          auth_id: authData.user.id,
          email,
          name,
          role,
          status: 'pending',
          created_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error('Profil oluşturma hatası:', profileError);
        setError('Kullanıcı profili oluşturulurken bir hata oluştu');
        
        // Auth kullanıcısını temizle
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        setIsLoading(false);
        return;
      }
      
      // Başarılı kayıt
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/giris');
      }, 3000);
      
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      setError(err.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Başarılı kayıt ekranı
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <Image
              src="/logo.webp"
              alt="Iqra Eğitim Portalı"
              width={160}
              height={160}
              className="mx-auto h-32 w-auto"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Kayıt Başarılı!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              E-posta adresinize bir doğrulama bağlantısı gönderildi. Lütfen e-postanızı kontrol edin.
            </p>
          </div>
          
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Hesabınız oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/auth/giris')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Giriş Sayfasına Git
          </button>
        </div>
      </div>
    );
  }
  
  // Kayıt formu
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/logo.webp"
            alt="Iqra Eğitim Portalı"
            width={160}
            height={160}
            className="mx-auto h-32 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Yeni Hesap Oluşturun
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tüm özelliklere erişmek için kayıt olun
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
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Ad Soyad</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Ad Soyad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">E-posta adresi</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Şifre (en az 8 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Şifre Tekrar</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Şifre Tekrar"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Hesap Türü</label>
            <select
              id="role"
              name="role"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
            >
              <option value="user">Standart Kullanıcı</option>
              <option value="teacher">Öğretmen</option>
              <option value="parent">Veli</option>
              <option value="student">Öğrenci</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              <span>
                <Link href="/hukuki/kullanim-kosullari" className="font-medium text-blue-600 hover:text-blue-500">
                  Kullanım Koşullarını
                </Link>{' '}
                ve{' '}
                <Link href="/hukuki/gizlilik-politikasi" className="font-medium text-blue-600 hover:text-blue-500">
                  Gizlilik Politikasını
                </Link>{' '}
                kabul ediyorum
              </span>
            </label>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              Kayıt Ol
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/giris" className="font-medium text-blue-600 hover:text-blue-500">
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 