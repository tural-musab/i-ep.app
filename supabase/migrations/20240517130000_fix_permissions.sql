-- Iqra Eğitim Portalı - İzin Düzeltmeleri ve Tablo Kontrolleri
BEGIN;

-- Service role için gerekli yetkileri ver
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- RLS'yi geçici olarak devre dışı bırak
ALTER TABLE IF EXISTS public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students DISABLE ROW LEVEL SECURITY;

-- Tabloların varlığını kontrol et ve yoksa oluştur
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    name VARCHAR(100) NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 1,
    capacity INTEGER NOT NULL DEFAULT 30,
    academic_year VARCHAR(9) NOT NULL DEFAULT '2023-2024',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    user_id UUID,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- Test verisi ekle (eğer tablolar boşsa)
INSERT INTO public.tenants (name, subdomain)
SELECT 'Test Okul', 'test'
WHERE NOT EXISTS (SELECT 1 FROM public.tenants LIMIT 1);

INSERT INTO public.classes (tenant_id, name, grade_level, academic_year)
SELECT 
    (SELECT id FROM public.tenants LIMIT 1),
    'Test Sınıf',
    1,
    '2023-2024'
WHERE NOT EXISTS (SELECT 1 FROM public.classes LIMIT 1);

INSERT INTO public.students (tenant_id, first_name, last_name)
SELECT 
    (SELECT id FROM public.tenants LIMIT 1),
    'Test',
    'Öğrenci'
WHERE NOT EXISTS (SELECT 1 FROM public.students LIMIT 1);

-- Tablo durumlarını kontrol et
DO $$
BEGIN
    RAISE NOTICE 'Tablo Durumları:';
    
    -- Tenants tablosu
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
        RAISE NOTICE 'tenants tablosu mevcut';
        RAISE NOTICE 'Kayıt sayısı: %', (SELECT COUNT(*) FROM public.tenants);
    ELSE
        RAISE NOTICE 'tenants tablosu bulunamadı';
    END IF;
    
    -- Classes tablosu
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'classes') THEN
        RAISE NOTICE 'classes tablosu mevcut';
        RAISE NOTICE 'Kayıt sayısı: %', (SELECT COUNT(*) FROM public.classes);
    ELSE
        RAISE NOTICE 'classes tablosu bulunamadı';
    END IF;
    
    -- Students tablosu
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'students') THEN
        RAISE NOTICE 'students tablosu mevcut';
        RAISE NOTICE 'Kayıt sayısı: %', (SELECT COUNT(*) FROM public.students);
    ELSE
        RAISE NOTICE 'students tablosu bulunamadı';
    END IF;
END $$;

COMMIT; 