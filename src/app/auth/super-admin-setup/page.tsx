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
        p_email: email,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage(`Başarıyla ${email} adresine süper admin rolü atandı!`);
      }
    } catch (err) {
      setError(
        'İşlem sırasında bir hata oluştu: ' + (err instanceof Error ? err.message : String(err))
      );
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
      const { error } = await supabase.from('users').insert([
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
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        setError(error.message);
      } else {
        setMessage(`Başarıyla ${email} adresi public.users tablosuna eklendi!`);
      }
    } catch (err) {
      setError(
        'İşlem sırasında bir hata oluştu: ' + (err instanceof Error ? err.message : String(err))
      );
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
        resultMessage +=
          'Public kullanıcısı bulunamadı veya hata oluştu: ' +
          (publicError?.message || 'Bilinmeyen hata');
      }

      setMessage(resultMessage);
    } catch (err) {
      setError(
        'İşlem sırasında bir hata oluştu: ' + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Süper Admin Kurulum</h1>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Süper Admin Kullanıcı Yönetimi</h2>

        <div className="mb-4">
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            E-posta
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="ornek@i-ep.app"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <Button onClick={setSuperAdminRole} disabled={loading} className="bg-primary text-white">
            {loading ? 'İşleniyor...' : '1. Auth Kullanıcısına Rol Ata'}
          </Button>

          <Button onClick={createPublicUser} disabled={loading} className="bg-blue-600 text-white">
            {loading ? 'İşleniyor...' : '2. Public Kullanıcısı Oluştur'}
          </Button>

          <Button onClick={checkUserRole} disabled={loading} variant="outline">
            Kullanıcı Bilgilerini Kontrol Et
          </Button>
        </div>

        <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
          <p className="font-semibold">Önemli:</p>
          <p>
            Süper admin kurulumu için önce &quot;1. Auth Kullanıcısına Rol Ata&quot; butonuna,
            ardından &quot;2. Public Kullanıcısı Oluştur&quot; butonuna tıklayın.
          </p>
        </div>

        {message && (
          <div className="mt-4 max-h-60 overflow-auto rounded-md bg-green-50 p-3 text-green-800">
            <pre className="text-sm whitespace-pre-wrap">{message}</pre>
          </div>
        )}

        {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-red-800">{error}</div>}
      </div>

      <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Sorun Giderme</h2>

        <div className="prose">
          <p>Süper admin kullanıcısı oluşturmak için iki adım gereklidir:</p>

          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong>Auth Kullanıcısına Rol Atama:</strong> Kullanıcıya{' '}
              <code>raw_app_meta_data</code> içinde <code>role: &quot;super_admin&quot;</code>{' '}
              değerini atar.
            </li>
            <li>
              <strong>Public Kullanıcısı Oluşturma:</strong> <code>public.users</code> tablosunda
              karşılık gelen bir kullanıcı kaydı oluşturur.
            </li>
          </ol>

          <p className="mt-4">
            Her iki adım da başarılı olduktan sonra, oturumu kapatıp yeniden giriş yapın. Süper
            admin sayfalarına artık erişebilmeniz gerekir.
          </p>
        </div>
      </div>
    </div>
  );
}
