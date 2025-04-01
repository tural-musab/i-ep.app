const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Ortam değişkenlerini yükle
dotenv.config({ path: '.env.local' });

// Supabase istemcisini oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase ortam değişkenleri ayarlanmamış. .env.local dosyasını kontrol edin.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Tenant için veritabanı şeması oluşturur
 * @param {string} tenantId Tenant ID
 * @returns {Promise<boolean>} Başarılı olup olmadığı
 */
async function generateSchema(tenantId) {
  try {
    // Tenant'ın var olduğunu kontrol et
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('id', tenantId)
      .single();
      
    if (tenantError || !tenant) {
      throw new Error(`ID'si "${tenantId}" olan tenant bulunamadı`);
    }
    
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    
    // Şema oluştur
    const { error: createSchemaError } = await supabase.rpc('create_tenant_schema', { schema_name: schemaName });
    
    if (createSchemaError) {
      throw new Error(`Şema oluşturma hatası: ${createSchemaError.message}`);
    }
    
    // Temel tabloları oluştur
    const baseTables = [
      createUsersTable(schemaName),
      createStudentsTable(schemaName),
      createClassesTable(schemaName),
      createTeachersTable(schemaName),
      createAttendanceTable(schemaName),
      createGradesTable(schemaName)
    ];
    
    await Promise.all(baseTables);
    
    // RLS (Row Level Security) politikalarını oluştur
    await setupRLSPolicies(schemaName);
    
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Veritabanı bağlantısını test eder
 * @returns {Promise<Object>} Test sonucu
 */
async function testConnection() {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('tenants').select('count');
    
    if (error) {
      throw new Error(`Veritabanı sorgu hatası: ${error.message}`);
    }
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      success: true,
      message: `Bağlantı başarılı, yanıt süresi: ${responseTime}ms`,
      tenantCount: data[0]?.count || 0,
      responseTime
    };
  } catch (error) {
    throw error;
  }
}

// Yardımcı fonksiyonlar
async function createUsersTable(schemaName) {
  const sql = `
    CREATE TABLE IF NOT EXISTS "${schemaName}".users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      first_name TEXT,
      last_name TEXT,
      role TEXT NOT NULL,
      phone_number TEXT,
      profile_picture TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_${schemaName}_users_email ON "${schemaName}".users (email);
    CREATE INDEX IF NOT EXISTS idx_${schemaName}_users_role ON "${schemaName}".users (role);
  `;
  
  return supabase.rpc('execute_sql', { sql_query: sql });
}

async function createStudentsTable(schemaName) {
  const sql = `
    CREATE TABLE IF NOT EXISTS "${schemaName}".students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_number TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      date_of_birth DATE,
      gender TEXT,
      phone_number TEXT,
      address TEXT,
      class_id UUID REFERENCES "${schemaName}".classes(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_${schemaName}_students_student_number ON "${schemaName}".students (student_number);
    CREATE INDEX IF NOT EXISTS idx_${schemaName}_students_class_id ON "${schemaName}".students (class_id);
  `;
  
  return supabase.rpc('execute_sql', { sql_query: sql });
}

async function createClassesTable(schemaName) {
  const sql = `
    CREATE TABLE IF NOT EXISTS "${schemaName}".classes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      grade INTEGER,
      section TEXT,
      academic_year TEXT,
      teacher_id UUID,
      room TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_${schemaName}_classes_name ON "${schemaName}".classes (name);
    CREATE INDEX IF NOT EXISTS idx_${schemaName}_classes_teacher_id ON "${schemaName}".classes (teacher_id);
  `;
  
  return supabase.rpc('execute_sql', { sql_query: sql });
}

async function createTeachersTable(schemaName) {
  const sql = `
    CREATE TABLE IF NOT EXISTS "${schemaName}".teachers (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      specialization TEXT,
      bio TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_${schemaName}_teachers_user_id ON "${schemaName}".teachers (user_id);
  `;
  
  return supabase.rpc('execute_sql', { sql_query: sql });
}

async function createAttendanceTable(schemaName) {
  const sql = `
    CREATE TABLE IF NOT EXISTS "${schemaName}".attendance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES "${schemaName}".students(id),
      class_id UUID NOT NULL REFERENCES "${schemaName}".classes(id),
      date DATE NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_${schemaName}_attendance_student_id ON "${schemaName}".attendance (student_id);
    CREATE INDEX IF NOT EXISTS idx_${schemaName}_attendance_class_id ON "${schemaName}".attendance (class_id);
    CREATE INDEX IF NOT EXISTS idx_${schemaName}_attendance_date ON "${schemaName}".attendance (date);
  `;
  
  return supabase.rpc('execute_sql', { sql_query: sql });
}

async function createGradesTable(schemaName) {
  const sql = `
    CREATE TABLE IF NOT EXISTS "${schemaName}".grades (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES "${schemaName}".students(id),
      class_id UUID NOT NULL REFERENCES "${schemaName}".classes(id),
      exam_name TEXT NOT NULL,
      grade NUMERIC NOT NULL,
      max_grade NUMERIC NOT NULL DEFAULT 100,
      exam_date DATE,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_${schemaName}_grades_student_id ON "${schemaName}".grades (student_id);
    CREATE INDEX IF NOT EXISTS idx_${schemaName}_grades_class_id ON "${schemaName}".grades (class_id);
  `;
  
  return supabase.rpc('execute_sql', { sql_query: sql });
}

async function setupRLSPolicies(schemaName) {
  const sql = `
    -- RLS'yi etkinleştir ve tüm tabloları koruma altına al
    ALTER TABLE "${schemaName}".users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "${schemaName}".students ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "${schemaName}".classes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "${schemaName}".teachers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "${schemaName}".attendance ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "${schemaName}".grades ENABLE ROW LEVEL SECURITY;
    
    -- Tenant erişim politikası oluştur
    CREATE POLICY tenant_isolation_policy ON "${schemaName}".users 
      USING (auth.uid() IN (
        SELECT user_id FROM public.tenant_users 
        WHERE tenant_id = '${schemaName.replace('tenant_', '').replace(/_/g, '-')}'
      ));
      
    -- Diğer tablolar için de benzer politikalar oluştur
    CREATE POLICY tenant_isolation_policy ON "${schemaName}".students 
      USING (auth.uid() IN (
        SELECT user_id FROM public.tenant_users 
        WHERE tenant_id = '${schemaName.replace('tenant_', '').replace(/_/g, '-')}'
      ));
      
    CREATE POLICY tenant_isolation_policy ON "${schemaName}".classes 
      USING (auth.uid() IN (
        SELECT user_id FROM public.tenant_users 
        WHERE tenant_id = '${schemaName.replace('tenant_', '').replace(/_/g, '-')}'
      ));
      
    CREATE POLICY tenant_isolation_policy ON "${schemaName}".teachers 
      USING (auth.uid() IN (
        SELECT user_id FROM public.tenant_users 
        WHERE tenant_id = '${schemaName.replace('tenant_', '').replace(/_/g, '-')}'
      ));
      
    CREATE POLICY tenant_isolation_policy ON "${schemaName}".attendance 
      USING (auth.uid() IN (
        SELECT user_id FROM public.tenant_users 
        WHERE tenant_id = '${schemaName.replace('tenant_', '').replace(/_/g, '-')}'
      ));
      
    CREATE POLICY tenant_isolation_policy ON "${schemaName}".grades 
      USING (auth.uid() IN (
        SELECT user_id FROM public.tenant_users 
        WHERE tenant_id = '${schemaName.replace('tenant_', '').replace(/_/g, '-')}'
      ));
  `;
  
  return supabase.rpc('execute_sql', { sql_query: sql });
}

module.exports = {
  generateSchema,
  testConnection
}; 