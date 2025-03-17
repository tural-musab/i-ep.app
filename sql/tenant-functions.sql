-- Tenant şeması oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION public.create_tenant_schema(tenant_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  schema_name TEXT;
BEGIN
  -- Tenant ID'yi kullanarak şema adını belirle
  schema_name := 'tenant_' || tenant_id;

  -- Şemayı oluştur
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);

  -- Kullanıcılar tablosu
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK (role IN (''admin'', ''teacher'', ''parent'', ''student'')),
      avatar_url TEXT,
      phone TEXT,
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )', schema_name);

  -- Öğrenciler tablosu
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.students (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES %I.users(id),
      student_number TEXT UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      birth_date DATE,
      gender TEXT CHECK (gender IN (''male'', ''female'', ''other'')),
      parent_id UUID,
      class_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )', schema_name, schema_name);

  -- Öğretmenler tablosu
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.teachers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES %I.users(id),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      specialty TEXT[],
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )', schema_name, schema_name);

  -- Sınıflar tablosu
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.classes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      grade_level INTEGER NOT NULL,
      academic_year TEXT NOT NULL,
      main_teacher_id UUID REFERENCES %I.teachers(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )', schema_name, schema_name);

  -- Öğretmen-Sınıf ilişki tablosu
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.teacher_class (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      teacher_id UUID NOT NULL REFERENCES %I.teachers(id),
      class_id UUID NOT NULL REFERENCES %I.classes(id),
      subject TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(teacher_id, class_id, subject)
    )', schema_name, schema_name, schema_name);

  -- Notlar tablosu
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.grades (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID NOT NULL REFERENCES %I.students(id),
      teacher_id UUID NOT NULL REFERENCES %I.teachers(id),
      class_id UUID NOT NULL REFERENCES %I.classes(id),
      subject TEXT NOT NULL,
      exam_type TEXT NOT NULL,
      score NUMERIC(5,2) NOT NULL,
      max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
      exam_date DATE NOT NULL,
      comments TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )', schema_name, schema_name, schema_name, schema_name);

  -- Devamsızlık tablosu
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.attendances (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID NOT NULL REFERENCES %I.students(id),
      class_id UUID NOT NULL REFERENCES %I.classes(id),
      date DATE NOT NULL,
      status TEXT NOT NULL CHECK (status IN (''present'', ''absent'', ''late'', ''excused'')),
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(student_id, class_id, date)
    )', schema_name, schema_name, schema_name);

  -- Duyurular tablosu
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.announcements (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id UUID NOT NULL REFERENCES %I.users(id),
      target_audience TEXT[] NOT NULL,
      is_published BOOLEAN NOT NULL DEFAULT true,
      publish_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expiry_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )', schema_name, schema_name);

  -- Mesajlar tablosu
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      sender_id UUID NOT NULL REFERENCES %I.users(id),
      recipient_id UUID NOT NULL REFERENCES %I.users(id),
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT false,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )', schema_name, schema_name, schema_name);

  -- RLS politikaları tanımla
  PERFORM public.setup_tenant_rls(schema_name);
  
  -- İndeksler tanımla
  PERFORM public.setup_tenant_indexes(schema_name);
END;
$$;

-- Tenant silme fonksiyonu
CREATE OR REPLACE FUNCTION public.drop_tenant_schema(tenant_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  schema_name TEXT;
BEGIN
  -- Tenant ID'yi kullanarak şema adını belirle
  schema_name := 'tenant_' || tenant_id;

  -- Şemayı sil (CASCADE ile tüm içeriği de silinir)
  EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', schema_name);
END;
$$;

-- Tenant RLS politikalarını tanımlama fonksiyonu
CREATE OR REPLACE FUNCTION public.setup_tenant_rls(schema_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Kullanıcılar için RLS
  EXECUTE format('
    ALTER TABLE %I.users ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY users_tenant_isolation ON %I.users
      USING (true)  -- Aynı şemada olduğundan otomatik izole edilir
      WITH CHECK (true);
      
    CREATE POLICY users_admin_access ON %I.users
      FOR ALL
      TO authenticated
      USING (
        (SELECT role FROM %I.users WHERE id = auth.uid()) = ''admin''
      );
      
    CREATE POLICY users_self_access ON %I.users
      FOR SELECT
      TO authenticated
      USING (id = auth.uid());
  ', schema_name, schema_name, schema_name, schema_name, schema_name);

  -- Burada diğer tablolar için de benzer RLS politikaları tanımlanabilir
  -- ...
END;
$$;

-- Tenant indekslerini tanımlama fonksiyonu
CREATE OR REPLACE FUNCTION public.setup_tenant_indexes(schema_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Kullanıcılar tablosu indeksleri
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS users_email_idx ON %I.users(email);
    CREATE INDEX IF NOT EXISTS users_role_idx ON %I.users(role);
  ', schema_name, schema_name);

  -- Öğrenciler tablosu indeksleri
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS students_user_id_idx ON %I.students(user_id);
    CREATE INDEX IF NOT EXISTS students_class_id_idx ON %I.students(class_id);
    CREATE INDEX IF NOT EXISTS students_student_number_idx ON %I.students(student_number);
    CREATE INDEX IF NOT EXISTS students_name_idx ON %I.students(first_name, last_name);
  ', schema_name, schema_name, schema_name, schema_name);

  -- Öğretmenler tablosu indeksleri
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS teachers_user_id_idx ON %I.teachers(user_id);
    CREATE INDEX IF NOT EXISTS teachers_name_idx ON %I.teachers(first_name, last_name);
  ', schema_name, schema_name);

  -- Notlar tablosu indeksleri
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS grades_student_id_idx ON %I.grades(student_id);
    CREATE INDEX IF NOT EXISTS grades_class_id_idx ON %I.grades(class_id);
    CREATE INDEX IF NOT EXISTS grades_subject_idx ON %I.grades(subject);
    CREATE INDEX IF NOT EXISTS grades_exam_date_idx ON %I.grades(exam_date);
  ', schema_name, schema_name, schema_name, schema_name);

  -- Devamsızlık tablosu indeksleri
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS attendances_student_id_idx ON %I.attendances(student_id);
    CREATE INDEX IF NOT EXISTS attendances_class_id_idx ON %I.attendances(class_id);
    CREATE INDEX IF NOT EXISTS attendances_date_idx ON %I.attendances(date);
  ', schema_name, schema_name, schema_name);
END;
$$; 