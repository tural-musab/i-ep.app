# Supabase Entegrasyon Rehberi

Bu rehber, Iqra Eğitim Portalı için Supabase'in detaylı entegrasyon adımlarını açıklar. Supabase, PostgreSQL tabanlı açık kaynaklı bir Backend-as-a-Service (BaaS) platformudur ve sistemimizin temel bileşenidir.

## İçerik

1. [Giriş](#giriş)
2. [Veritabanı Yapılandırması](#veritabanı-yapılandırması)
3. [Multi-Tenant Veritabanı Tasarımı](#multi-tenant-veritabanı-tasarımı)
4. [Kimlik Doğrulama ve Yetkilendirme](#kimlik-doğrulama-ve-yetkilendirme)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Storage Yapılandırması](#storage-yapılandırması)
7. [Realtime Özellikler](#realtime-özellikler)
8. [Edge Functions](#edge-functions)
9. [Next.js ile Entegrasyon](#nextjs-ile-entegrasyon)
10. [Optimizasyon ve İyi Uygulamalar](#optimizasyon-ve-i̇yi-uygulamalar)
11. [İlgili Kaynaklar](#i̇lgili-kaynaklar)

## Giriş

Supabase, platformumuz için aşağıdaki temel hizmetleri sağlar:

- PostgreSQL veritabanı
- Kimlik doğrulama ve kullanıcı yönetimi
- Depolama çözümü
- Gerçek zamanlı (realtime) güncellemeler
- Edge Functions
- Row Level Security

Bu entegrasyon rehberi, Supabase'in tüm bu özelliklerinin nasıl yapılandırılacağını ve uygulamanızda nasıl kullanılacağını adım adım açıklar.

## Veritabanı Yapılandırması

### Şema Tasarımı

Iqra Eğitim Portalı, `public` şemasını genel veriler ve fonksiyonlar için, tenant-spesifik şemaları (`tenant_[uuid]`) ise her okulun izole veri depolaması için kullanır.

#### Public Şeması

Public şeması, tenant yönetimi ve ortak fonksiyonlar için gerekli tabloları içerir:

```sql
-- Tenants tablosu
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  custom_domain TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT subdomain_format CHECK (subdomain ~* '^[a-z0-9][a-z0-9\-]{1,61}[a-z0-9]$')
);

-- Subscriptions tablosu
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_provider TEXT NOT NULL,
  payment_method_id TEXT,
  payment_provider_id TEXT,

  CONSTRAINT valid_status CHECK (status IN ('active', 'canceled', 'incomplete', 'past_due', 'trialing'))
);

-- Tenants_users tablosu (global kullanıcı-tenant ilişkisi)
CREATE TABLE public.tenants_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(tenant_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'manager', 'teacher', 'student', 'parent'))
);

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Yardımcı Fonksiyonlar

Tenant-spesifik işlemler için yardımcı PostgreSQL fonksiyonları:

```sql
-- Tenant şeması oluşturma
CREATE OR REPLACE FUNCTION public.create_tenant_schema(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS tenant_%s', tenant_id);

  -- Temel tabloları oluştur
  EXECUTE format('
    CREATE TABLE tenant_%s.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT ''active'',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      metadata JSONB DEFAULT ''{}'',
      avatar_url TEXT
    );

    CREATE TABLE tenant_%s.classes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      grade TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT ''active'',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      metadata JSONB DEFAULT '{}'
    );

    CREATE TABLE tenant_%s.students (
      id UUID PRIMARY KEY REFERENCES tenant_%s.users(id) ON DELETE CASCADE,
      student_number TEXT UNIQUE,
      class_id UUID REFERENCES tenant_%s.classes(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  ', tenant_id, tenant_id, tenant_id, tenant_id, tenant_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenant bağlamını ayarlama
CREATE OR REPLACE FUNCTION public.set_tenant_context(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_id::TEXT, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mevcut tenant ID'sini alma
CREATE OR REPLACE FUNCTION public.get_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', TRUE)::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;
```

### İndeksler

Veritabanı performansını optimize etmek için önemli indeksleri ekleyin:

```sql
-- Tenant subdomain indeksi
CREATE UNIQUE INDEX tenant_subdomain_idx ON public.tenants(subdomain);

-- Tenant custom domain indeksi
CREATE UNIQUE INDEX tenant_custom_domain_idx ON public.tenants(custom_domain)
WHERE custom_domain IS NOT NULL;

-- Tenant_users indeksleri
CREATE INDEX tenant_users_user_id_idx ON public.tenants_users(user_id);
CREATE INDEX tenant_users_tenant_id_idx ON public.tenants_users(tenant_id);

-- Audit logs indeksleri
CREATE INDEX audit_logs_tenant_id_idx ON public.audit_logs(tenant_id);
CREATE INDEX audit_logs_created_at_idx ON public.audit_logs(created_at);
CREATE INDEX audit_logs_action_idx ON public.audit_logs(action);
```

## Multi-Tenant Veritabanı Tasarımı

Iqra Eğitim Portalı, "schema per tenant" yaklaşımını kullanarak tenant izolasyonu sağlar.

### Tenant Şema Yapısı

Her tenant için ayrı bir PostgreSQL şeması oluşturulur (`tenant_[uuid]` formatında). Bu yaklaşım şu avantajları sunar:

1. **Güçlü İzolasyon**: Her tenant'ın verileri fiziksel olarak ayrıdır
2. **Basitleştirilmiş Yetkilendirme**: PostgreSQL'in şema-seviyesinde yetkilendirme mekanizmasını kullanabilirsiniz
3. **Performans**: Her tenant için özel indeksler oluşturabilirsiniz
4. **Esneklik**: Tenant-spesifik tablo ve alan yapılandırmaları yapabilirsiniz

### Tenant Oluşturma Süreci

Yeni bir tenant (okul) oluşturma süreci şu adımları içerir:

```typescript
// tenant-service.ts
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function createTenant(
  name: string,
  subdomain: string,
  planType: string = 'free'
): Promise<{ tenantId: string; error?: any }> {
  try {
    // 1. Tenant kaydı oluştur
    const { data: tenantData, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        name,
        subdomain,
        plan_type: planType,
        status: 'active',
      })
      .select('id')
      .single();

    if (tenantError) throw tenantError;

    const tenantId = tenantData.id;

    // 2. Tenant şeması oluştur
    const { error: schemaError } = await supabaseAdmin.rpc('create_tenant_schema', {
      tenant_id: tenantId,
    });

    if (schemaError) {
      // Hata durumunda temizlik yap
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
      throw schemaError;
    }

    // 3. RLS politikalarını tenant için yapılandır
    await configureTenantRLS(tenantId);

    return { tenantId };
  } catch (error) {
    console.error('Tenant oluşturma hatası:', error);
    return { tenantId: '', error };
  }
}

// RLS politikalarını tenant için yapılandır
async function configureTenantRLS(tenantId: string): Promise<void> {
  // Tenant şeması için RLS politikalarını oluştur
  // Bu fonksiyon tenant-spesifik tablolar için RLS politikalarını ayarlar
}
```

## Kimlik Doğrulama ve Yetkilendirme

### Supabase Auth Yapılandırma

Supabase Auth, JWT tabanlı kimlik doğrulama sağlar. Temel yapılandırma adımları:

1. **Supabase Dashboard**'da Auth sekmesine gidin
2. **Email Auth** bölümünde:
   - "Enable Email Signup" seçeneğini etkinleştirin
   - "Konfirmasyon e-postası gönder" seçeneğini etkinleştirin

3. **Oturum Ayarları**:
   - JWT Süresi: 3600 (1 saat)
   - Refresh Token Süresi: 10080 (7 gün)

4. **Email Şablonları**:
   - E-posta şablonlarını Türkçe'ye çevirin
   - Kurumsal kimliğinize uygun tasarımla güncelleyin

### Kullanıcı Yönetimi

Multi-tenant sistemimizde kullanıcılar, tek bir Supabase Auth tablosunda saklanır, ancak tenant-spesifik roller ve izinler ayrı tablolarda yönetilir:

```typescript
// Auth işlemi örneği
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function signIn(email: string, password: string, tenantId?: string) {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Kullanıcının tenant erişimini kontrol et
  if (tenantId) {
    const { data: tenantAccess, error: accessError } = await supabase
      .from('tenants_users')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', data.user.id)
      .single();

    if (accessError || !tenantAccess) {
      // Kullanıcının bu tenant'a erişimi yok
      await supabase.auth.signOut();
      throw new Error('Bu okula erişim yetkiniz bulunmamaktadır.');
    }

    // Tenant bağlamını ayarla
    await supabase.rpc('set_tenant_context', { tenant_id: tenantId });
  }

  return { user: data.user, session: data.session };
}
```

### Rol Tabanlı Erişim Kontrolü

Sistemde 5 temel rol bulunur:

1. **Super Admin**: Platform yöneticisi, tüm tenant'lara erişebilir
2. **Tenant Admin**: Okul yöneticisi, yalnızca kendi okulunun kaynaklarına erişebilir
3. **Teacher**: Öğretmen, dersler ve öğrenciler üzerinde sınırlı yetkiler
4. **Student**: Öğrenci, kendi kaynakları üzerinde salt okuma izinleri
5. **Parent**: Veli, bağlı olduğu öğrenci kayıtlarına sınırlı erişim

Örnek rol kontrol fonksiyonu:

```typescript
// Rol tabanlı yetkilendirme kontrolü
export function canUserPerformAction(
  userRole: string,
  action: 'create' | 'read' | 'update' | 'delete',
  resourceType: string
): boolean {
  // Yetki matrisi
  const permissionMatrix: Record<string, Record<string, string[]>> = {
    admin: {
      create: ['*'],
      read: ['*'],
      update: ['*'],
      delete: ['*'],
    },
    teacher: {
      create: ['class', 'homework', 'grade', 'attendance'],
      read: ['student', 'class', 'homework', 'grade', 'attendance'],
      update: ['class', 'homework', 'grade', 'attendance'],
      delete: ['homework', 'grade'],
    },
    student: {
      create: ['homework_submission'],
      read: ['class', 'homework', 'grade', 'attendance', 'homework_submission'],
      update: ['homework_submission'],
      delete: [],
    },
    parent: {
      create: [],
      read: ['student', 'class', 'homework', 'grade', 'attendance'],
      update: [],
      delete: [],
    },
  };

  // Wild card kontrolü
  if (permissionMatrix[userRole]?.[action]?.includes('*')) {
    return true;
  }

  // Spesifik kaynak tipi kontrolü
  return permissionMatrix[userRole]?.[action]?.includes(resourceType) || false;
}
```

## Row Level Security (RLS)

### RLS Politikaları

Row Level Security (RLS), veritabanı seviyesinde güvenlik sağlar. Tenant verilerini izole etmek için RLS politikaları kullanılır.

#### Tenant Tablosu İçin RLS

```sql
-- Tenant tablosu için RLS politikaları
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Super admin her şeyi yapabilir
CREATE POLICY tenant_super_admin_policy ON public.tenants
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Kullanıcılar kendi tenant'larını okuyabilir
CREATE POLICY tenant_read_policy ON public.tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id
      FROM public.tenants_users
      WHERE user_id = auth.uid()
    )
);
```

#### Tenant-Spesifik Tablolar İçin RLS

```sql
-- Tenant_X.users tablosu için RLS politikaları
CREATE POLICY users_tenant_isolation_policy ON tenant_X.users
  USING (get_tenant_id() = 'X');

-- Öğretmenler tüm öğrencileri görebilir
CREATE POLICY teacher_view_students_policy ON tenant_X.students
  FOR SELECT
  USING (
    get_tenant_id() = 'X' AND
    EXISTS (
      SELECT 1 FROM tenant_X.users
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Öğrenciler yalnızca kendi bilgilerini görebilir
CREATE POLICY student_view_self_policy ON tenant_X.students
  FOR SELECT
  USING (
    get_tenant_id() = 'X' AND
    id = auth.uid()
  );
```

### RLS Politikalarını Dinamik Olarak Oluşturma

Her yeni tenant için RLS politikalarını otomatik olarak oluşturmak için bir fonksiyon kullanın:

```sql
CREATE OR REPLACE FUNCTION public.create_tenant_rls_policies(tenant_id UUID)
RETURNS VOID AS $$
DECLARE
  schema_name TEXT := 'tenant_' || tenant_id;
BEGIN
  -- Users tablosu için RLS politikaları
  EXECUTE format('
    ALTER TABLE %I.users ENABLE ROW LEVEL SECURITY;

    CREATE POLICY users_tenant_isolation_policy ON %I.users
      USING (public.get_tenant_id() = %L);

    CREATE POLICY users_admin_policy ON %I.users
      USING (
        public.get_tenant_id() = %L AND
        EXISTS (
          SELECT 1 FROM %I.users
          WHERE id = auth.uid() AND role IN (''admin'', ''manager'')
        )
      );

    CREATE POLICY users_self_view_policy ON %I.users
      FOR SELECT
      USING (public.get_tenant_id() = %L AND id = auth.uid());
  ',
  schema_name, schema_name, tenant_id,
  schema_name, tenant_id, schema_name,
  schema_name, tenant_id);

  -- Classes tablosu için RLS politikaları
  EXECUTE format('
    ALTER TABLE %I.classes ENABLE ROW LEVEL SECURITY;

    CREATE POLICY classes_tenant_isolation_policy ON %I.classes
      USING (public.get_tenant_id() = %L);
  ',
  schema_name, schema_name, tenant_id);

  -- İlave tablolar için RLS politikaları...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Storage Yapılandırması

### Bucket Yapısı

Supabase Storage, dosya depolama için kullanılır. Üç ana bucket yapılandırın:

1. **Public**: Genel erişime açık dosyalar (logolar, avatarlar)
2. **Tenant-Assets**: Tenant-spesifik dosyalar (öğrenci ödevleri, okul belgeleri)
3. **Secure-Files**: Yalnızca yetkili kullanıcılar tarafından erişilebilen dosyalar (sınav soruları, not dökümleri)

### RLS ile Bucket Güvenliği

```sql
-- Public bucket için herkes okuyabilir, yetkili kullanıcılar yazabilir
CREATE POLICY "Public dosyaları herkes görebilir" ON storage.objects
  FOR SELECT USING (bucket_id = 'public');

CREATE POLICY "Kimliği doğrulanmış kullanıcılar public'e yükleyebilir" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'public' AND
    auth.role() != 'anon'
  );

-- Tenant-Assets için tenant RLS
CREATE POLICY "Tenant-specific dosya erişimi" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'tenant-assets' AND
    (storage.foldername(name))[1] = (
      SELECT tenant_id::text FROM public.tenants_users
      WHERE user_id = auth.uid()
    )
  );

-- Secure-Files için strict kontrol
CREATE POLICY "Secure Files yetkiye göre erişim" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'secure-files' AND
    auth.uid() IN (
      SELECT user_id FROM public.tenants_users
      WHERE tenant_id::text = (storage.foldername(name))[1]
      AND role IN ('admin', 'teacher')
    )
  );
```

### Dosya Yükleme ve Erişim

```typescript
// Tenant-spesifik dosya yükleme örneği
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function uploadTenantFile(
  tenantId: string,
  file: File,
  folder: string,
  fileName: string
) {
  const supabase = createClientComponentClient();

  // Tenant-spesifik dosya yolu
  const filePath = `${tenantId}/${folder}/${fileName}`;

  const { data, error } = await supabase.storage.from('tenant-assets').upload(filePath, file, {
    upsert: true,
    cacheControl: '3600',
  });

  if (error) throw error;

  // Dosya URL'ini oluştur
  const fileUrl = supabase.storage.from('tenant-assets').getPublicUrl(filePath).data.publicUrl;

  return { filePath, fileUrl };
}
```

## Realtime Özellikler

### Realtime Yapılandırma

Supabase Realtime, veritabanı değişikliklerini gerçek zamanlı olarak izlemek için kullanılır. Bu özelliği etkinleştirmek için:

1. Supabase Dashboard'da "Database" > "Replication" bölümüne gidin
2. "Realtime" sekmesinde, izlemek istediğiniz tabloları etkinleştirin

```sql
-- Örnek: Tenant_X.classes tablosu için realtime yapılandırma
BEGIN;
  -- Realtime yayınını etkinleştir
  INSERT INTO supabase_realtime.subscription (subscription_id, tenant_id, schema, table_name, created_at)
  VALUES ('tenant_X_classes', 'X', 'tenant_X', 'classes', now());

  -- RLS politikalarını uygula
  INSERT INTO supabase_realtime.subscription_rule (subscription_id, type)
  VALUES ('tenant_X_classes', 'rls');
COMMIT;
```

### Realtime İzleme

Frontend'de realtime güncellemeleri dinlemek için Supabase JavaScript istemcisini kullanın:

```typescript
// Realtime izleme örneği
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useClassesRealtime(tenantId: string) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // İlk veri yüklemesi
    fetchClasses();

    // Realtime kanal oluştur
    const channel = supabase
      .channel('tenant-classes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: `tenant_${tenantId}`,
          table: 'classes',
        },
        (payload) => {
          // Değişikliğe göre durumu güncelle
          if (payload.eventType === 'INSERT') {
            setClasses((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setClasses((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setClasses((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup fonksiyonu
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, supabase]);

  // Sınıfları getir
  const fetchClasses = async () => {
    setLoading(true);
    try {
      // Tenant bağlamını ayarla
      await supabase.rpc('set_tenant_context', { tenant_id: tenantId });

      // Sınıfları sorgula
      const { data, error } = await supabase.from('classes').select('*').order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Sınıfları getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return { classes, loading, refetch: fetchClasses };
}
```

## Edge Functions

### Edge Function Oluşturma

Supabase Edge Functions, sunucu tarafı işlemler için kullanılır. Edge Function oluşturmak için:

1. Supabase CLI'yi kurun: `npm install -g supabase`
2. Edge function oluşturun:

   ```bash
   supabase functions new tenant-subdomain-checker
   ```

3. Fonksiyonu düzenleyin:

   ```typescript
   // supabase/functions/tenant-subdomain-checker/index.ts
   import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

   serve(async (req) => {
     try {
       // Supabase bağlantısı
       const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
       const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
       const supabase = createClient(supabaseUrl, supabaseKey);

       // İstek gövdesini al
       const { subdomain } = await req.json();

       if (!subdomain) {
         return new Response(JSON.stringify({ error: 'Subdomain belirtilmelidir' }), {
           status: 400,
           headers: { 'Content-Type': 'application/json' },
         });
       }

       // Subdomain için regex kontrolü
       const subdomainRegex = /^[a-z0-9][a-z0-9\-]{1,61}[a-z0-9]$/;
       if (!subdomainRegex.test(subdomain)) {
         return new Response(
           JSON.stringify({
             error: 'Subdomain yalnızca küçük harf, sayı ve tire içerebilir',
           }),
           { status: 400, headers: { 'Content-Type': 'application/json' } }
         );
       }

       // Subdomain'in kullanılabilirliğini kontrol et
       const { data, error } = await supabase
         .from('tenants')
         .select('id')
         .eq('subdomain', subdomain)
         .maybeSingle();

       if (error) throw error;

       return new Response(
         JSON.stringify({
           available: !data,
           subdomain,
         }),
         { headers: { 'Content-Type': 'application/json' } }
       );
     } catch (error) {
       return new Response(JSON.stringify({ error: error.message }), {
         status: 500,
         headers: { 'Content-Type': 'application/json' },
       });
     }
   });
   ```

4. Fonksiyonu dağıtın:
   ```bash
   supabase functions deploy tenant-subdomain-checker --project-ref your-project-ref
   ```

### Edge Function'ı Frontend'den Çağırma

```typescript
// API isteği ile Edge Function çağırma örneği
export async function checkSubdomainAvailability(subdomain: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tenant-subdomain-checker`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ subdomain }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'İstek başarısız oldu');
    }

    const result = await response.json();
    return result.available;
  } catch (error) {
    console.error('Subdomain kontrolü hatası:', error);
    return false;
  }
}
```

## Next.js ile Entegrasyon

### Next.js için Supabase Ayarları

Next.js 14 ile Supabase entegrasyonu için, Auth Helpers kütüphanesini kullanın:

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

### Client ve Server Component'lerde Kullanım

```typescript
// lib/supabase/server.ts - Server bileşenler için
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}
```

```typescript
// lib/supabase/client.ts - Client bileşenler için
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

export function createSupabaseClient() {
  return createClientComponentClient<Database>();
}
```

### Middleware ile Tenant Bağlamı

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Supabase istemcisi oluştur
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Oturum kontrolü
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Tenant subdomain'ini URL'den ayıkla
  const hostname = req.headers.get('host') || '';
  const domainParts = hostname.split('.');

  // Ana domain (i-ep.app) değilse tenant subdomain'i olarak kabul et
  if (domainParts.length > 2 && !hostname.startsWith('www.')) {
    const subdomain = domainParts[0];

    try {
      // Tenant ID'sini subdomain'den sorgula
      const { data, error } = await supabase
        .from('tenants')
        .select('id')
        .eq('subdomain', subdomain)
        .single();

      if (data?.id) {
        // Tenant bağlamını ayarla
        await supabase.rpc('set_tenant_context', { tenant_id: data.id });
      }
    } catch (e) {
      console.error('Tenant context ayarlama hatası:', e);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Optimizasyon ve İyi Uygulamalar

### Sorgular İçin İyi Uygulamalar

1. **Seçerek Sorgulama**: Her zaman yalnızca ihtiyacınız olan alanları seçin:

   ```typescript
   const { data } = await supabase.from('users').select('id, first_name, last_name, email'); // Tüm alanları değil
   ```

2. **İndeks Kullanımı**: Sıklıkla aradığınız alanlar için indeksler oluşturun:

   ```sql
   CREATE INDEX tenant_users_email_idx ON tenant_X.users(email);
   ```

3. **Sayfalama**: Büyük veri kümeleri için sayfalama kullanın:

   ```typescript
   const { data } = await supabase.from('students').select('*').range(0, 9); // İlk 10 öğrenci
   ```

4. **Önbellek Kullanımı**: Tekrarlanan sorguları önbelleğe alın:
   ```typescript
   const { data, error } = await supabase
     .from('classes')
     .select('*')
     .order('name')
     .limitToLast(20)
     .abortSignal(signal)
     .options({
       count: 'exact',
       head: false,
       cache: 'default', // Önbellek kontrolü
     });
   ```

### RLS Optimizasyonu

1. RLS politikalarını basit tutun, karmaşık sorgulardan kaçının
2. RLS politikalarını performans için optimize edin
3. `USING` ve `WITH CHECK` arasındaki farkı anlayın ve doğru kullanın

### Tanılamalar ve İzleme

1. Supabase Dashboard'ındaki "Database" > "Performance" bölümünü izleyin
2. Yavaş sorguları belirleyin ve optimize edin
3. Supabase "Extensions" bölümünden `pg_stat_statements` uzantısını etkinleştirin

## İlgili Kaynaklar

- [Row Level Security Detaylı Rehberi](../security/row-level-security.md)
- [Tenant Veri İzolasyon Stratejisi](../architecture/data-isolation.md)
- [CI/CD ile Supabase Dağıtımı](../deployment/ci-cd-pipeline.md)
- [Supabase Resmi Dokümantasyonu](https://supabase.io/docs)
- [PostgreSQL Performans Optimizasyonu](../database/postgres-performance.md)
