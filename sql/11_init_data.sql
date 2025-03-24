-- İlk super admin kullanıcısını oluştur
-- NOT: Gerçek uygulamada bu şifreyi değiştirin!
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@i-ep.app',
  crypt('password', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Super Admin"}',
  now(),
  now()
);

-- Super Admin kullanıcısı için profil oluştur
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  verification_status
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@i-ep.app',
  'Süper',
  'Admin',
  'super_admin',
  TRUE,
  'verified'
);

-- Demo tenant oluştur
INSERT INTO management.tenants (
  id,
  name,
  display_name,
  schema_name,
  status,
  subscription_plan,
  subscription_start_date,
  subscription_end_date
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'demo',
  'Demo Okul',
  'tenant_demo',
  'active',
  'premium',
  now(),
  now() + interval '1 year'
);

-- Burada tenant oluşturma tetikleyicisinin çalışmasını bekleyelim
-- Tetikleyici bazı tablolar oluşturmalı, ama tetikleyici çalışmayabilir
-- O yüzden elle tenant_demo şemasını ve tablolarını oluşturalım
DO $$
BEGIN
  -- Şemayı oluştur
  EXECUTE 'CREATE SCHEMA IF NOT EXISTS tenant_demo';
  
  -- Grade levels tablosu oluştur
  EXECUTE 'CREATE TABLE IF NOT EXISTS tenant_demo.grade_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
  )';
  
  -- Okullar tablosu oluştur
  EXECUTE 'CREATE TABLE IF NOT EXISTS tenant_demo.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    principal_name TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT ''{}'',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
  )';
  
  -- Akademik yıllar tablosu
  EXECUTE 'CREATE TABLE IF NOT EXISTS tenant_demo.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
  )';
END $$;

-- Demo okul için domain oluştur
INSERT INTO management.domains (
  tenant_id,
  domain,
  is_primary,
  status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'demo.i-ep.app',
  TRUE,
  'active'
);

-- Demo okul için admin kullanıcısı oluştur
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'admin@demo.i-ep.app',
  crypt('password', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Demo Admin"}',
  now(),
  now()
);

-- Demo okul admin kullanıcısı için profil oluştur
INSERT INTO public.users (
  id,
  tenant_id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  verification_status
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'admin@demo.i-ep.app',
  'Demo',
  'Admin',
  'admin',
  TRUE,
  'verified'
);

-- Demo okul için temel sınıf seviyelerini oluştur
INSERT INTO tenant_demo.grade_levels (name, display_order) VALUES 
('1. Sınıf', 1),
('2. Sınıf', 2),
('3. Sınıf', 3),
('4. Sınıf', 4),
('5. Sınıf', 5),
('6. Sınıf', 6),
('7. Sınıf', 7),
('8. Sınıf', 8);

-- Demo okul için akademik yıl oluştur
INSERT INTO tenant_demo.academic_years (
  name, 
  start_date, 
  end_date, 
  is_current
) VALUES (
  '2023-2024',
  '2023-09-01',
  '2024-06-30',
  TRUE
); 