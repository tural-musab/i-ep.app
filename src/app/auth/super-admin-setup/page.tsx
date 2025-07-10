'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';

export default function SuperAdminSetupPage() {
  const [email, setEmail] = useState('admin@i-ep.app');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createClientComponentClient();
  
  const setSuperAdminRole = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Süper admin rolünü RPC ile ata
      const { error } = await supabase.rpc('set_super_admin_role', {
        p_email: email
      });
      
      if (error) {
        setError(error.message);
      } else {
        setMessage(`Başarıyla ${email} adresine süper admin rolü atandı!`);
      }
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  const createPublicUser = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Önce auth kullanıcısını bul
      const { data: authData, error: authError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (authError) {
        setError('Auth kullanıcısı bulunamadı: ' + authError.message);
        setLoading(false);
        return;
      }
      
      // Kullanıcı var mı kontrol et
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (!checkError && existingUser) {
        setMessage(`${email} adresi için public.users tablosunda zaten bir kayıt var.`);
        setLoading(false);
        return;
      }
      
      // UUID oluştur
      const uuid = crypto.randomUUID();
      
      // Public users tablosuna kullanıcı ekle
      const { error } = await supabase
        .from('users')
        .insert([
          {
            id: uuid, // UUID belirtiyoruz
            auth_id: authData.id,
            email: email,
            role: 'super_admin',
            tenant_id: '11111111-1111-1111-1111-111111111111', // Varsayılan tenant ID
            first_name: 'Süper',
            last_name: 'Admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      
      if (error) {
        setError(error.message);
      } else {
        setMessage(`Başarıyla ${email} adresi public.users tablosuna eklendi!`);
      }
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  const checkUserRole = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Auth kullanıcısını kontrol et
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(email);
      
      if (authError) {
        setError('Auth kullanıcısı kontrolünde hata: ' + authError.message);
        setLoading(false);
        return;
      }
      
      // Public kullanıcısını kontrol et
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      let resultMessage = '';
      
      if (authData?.user) {
        resultMessage += `Auth kullanıcısı: ${JSON.stringify(authData.user, null, 2)}\n\n`;
      } else {
        resultMessage += 'Auth kullanıcısı bulunamadı.\n\n';
      }
      
      if (!publicError && publicUser) {
        resultMessage += `Public kullanıcısı: ${JSON.stringify(publicUser, null, 2)}`;
      } else {
        resultMessage += 'Public kullanıcısı bulunamadı veya hata oluştu: ' + (publicError?.message || 'Bilinmeyen hata');
      }
      
      setMessage(resultMessage);
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Süper Admin Kurulum</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Süper Admin Kullanıcı Yönetimi</h2>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-posta
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="ornek@i-ep.app"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <Button
            onClick={setSuperAdminRole}
            disabled={loading}
            className="bg-primary text-white"
          >
            {loading ? 'İşleniyor...' : '1. Auth Kullanıcısına Rol Ata'}
          </Button>
          
          <Button
            onClick={createPublicUser}
            disabled={loading}
            className="bg-blue-600 text-white"
          >
            {loading ? 'İşleniyor...' : '2. Public Kullanıcısı Oluştur'}
          </Button>
          
          <Button
            onClick={checkUserRole}
            disabled={loading}
            variant="outline"
          >
            Kullanıcı Bilgilerini Kontrol Et
          </Button>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
          <p className="font-semibold">Önemli:</p>
          <p>Süper admin kurulumu için önce &quot;1. Auth Kullanıcısına Rol Ata&quot; butonuna, ardından &quot;2. Public Kullanıcısı Oluştur&quot; butonuna tıklayın.</p>
        </div>
        
        {message && (
          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md overflow-auto max-h-60">
            <pre className="whitespace-pre-wrap text-sm">{message}</pre>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Sorun Giderme</h2>
        
        <div className="prose">
          <p>
            Süper admin kullanıcısı oluşturmak için iki adım gereklidir:
          </p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Auth Kullanıcısına Rol Atama:</strong> Kullanıcıya <code>raw_app_meta_data</code> içinde <code>role: &quot;super_admin&quot;</code> değerini atar.</li>
            <li><strong>Public Kullanıcısı Oluşturma:</strong> <code>public.users</code> tablosunda karşılık gelen bir kullanıcı kaydı oluşturur.</li>
          </ol>
          
          <p className="mt-4">
            Her iki adım da başarılı olduktan sonra, oturumu kapatıp yeniden giriş yapın. Süper admin sayfalarına artık erişebilmeniz gerekir.
          </p>
        </div>
      </div>
    </div>
  );
} 