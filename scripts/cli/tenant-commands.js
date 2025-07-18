const { v4: uuidv4 } = require('uuid');
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
 * Yeni bir tenant oluşturur
 * @param {Object} tenantData Tenant verileri
 * @returns {Promise<Object>} Oluşturulan tenant
 */
async function createTenant(tenantData) {
  try {
    // Subdomain kontrolü
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', tenantData.subdomain)
      .single();

    if (existingTenant) {
      throw new Error(`"${tenantData.subdomain}" subdomaini zaten kullanımda`);
    }

    // Yeni tenant oluştur
    const tenantId = uuidv4();
    const now = new Date().toISOString();

    const tenant = {
      id: tenantId,
      name: tenantData.name,
      subdomain: tenantData.subdomain,
      status: 'active',
      plan: tenantData.plan || 'free',
      createdAt: now,
      updatedAt: now,
      features: ['student_management', 'teacher_management', 'class_management'],
      config: {
        theme: {
          primaryColor: '#1a237e',
          secondaryColor: '#0288d1',
          logo: null,
        },
      },
    };

    const { error } = await supabase.from('tenants').insert(tenant);

    if (error) {
      throw new Error(`Tenant veritabanı kaydı oluşturma hatası: ${error.message}`);
    }

    // Tenant şeması oluştur
    await createTenantSchema(tenantId);

    // Admin kullanıcı oluştur
    if (tenantData.adminEmail) {
      await createTenantAdmin(tenantId, tenantData.adminEmail);
    }

    return tenant;
  } catch (error) {
    throw error;
  }
}

/**
 * Tenant'lar listesini getirir
 * @param {Object} options Filtreleme ve sayfalama seçenekleri
 * @returns {Promise<Array>} Tenant'lar listesi
 */
async function listTenants(options = {}) {
  try {
    let query = supabase.from('tenants').select('*');

    if (options.status) {
      query = query.eq('status', options.status);
    }

    const limit = parseInt(options.limit) || 10;
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Tenant listeleme hatası: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Belirli bir tenant'ın detaylarını getirir
 * @param {string} tenantId Tenant ID
 * @returns {Promise<Object>} Tenant detayları
 */
async function getTenant(tenantId) {
  try {
    const { data, error } = await supabase.from('tenants').select('*').eq('id', tenantId).single();

    if (error) {
      throw new Error(`Tenant bulunamadı: ${error.message}`);
    }

    if (!data) {
      throw new Error(`ID'si "${tenantId}" olan tenant bulunamadı`);
    }

    // İstatistikleri getir
    try {
      const stats = await getTenantStats(tenantId);
      data.stats = stats;
    } catch (statsError) {
      console.warn(`Tenant istatistikleri alınamadı: ${statsError.message}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Tenant'ı günceller
 * @param {string} tenantId Tenant ID
 * @param {Object} updateData Güncellenecek veriler
 * @returns {Promise<Object>} Güncellenmiş tenant
 */
async function updateTenant(tenantId, updateData) {
  try {
    // Tenant'ın var olduğunu kontrol et
    await getTenant(tenantId);

    const updatePayload = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('tenants')
      .update(updatePayload)
      .eq('id', tenantId)
      .select()
      .single();

    if (error) {
      throw new Error(`Tenant güncelleme hatası: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Tenant'ı siler
 * @param {string} tenantId Tenant ID
 * @returns {Promise<boolean>} Başarılı olup olmadığı
 */
async function deleteTenant(tenantId) {
  try {
    // Tenant'ın var olduğunu kontrol et
    await getTenant(tenantId);

    // Tenant şemasını sil
    await dropTenantSchema(tenantId);

    // Tenant kaydını sil
    const { error } = await supabase.from('tenants').delete().eq('id', tenantId);

    if (error) {
      throw new Error(`Tenant silme hatası: ${error.message}`);
    }

    return true;
  } catch (error) {
    throw error;
  }
}

// Yardımcı fonksiyonlar
async function createTenantSchema(tenantId) {
  try {
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    // Şema oluştur
    await supabase.rpc('create_tenant_schema', { schema_name: schemaName });

    // Şema tablolarını oluştur
    await supabase.rpc('create_tenant_tables', { schema_name: schemaName });

    return true;
  } catch (error) {
    throw new Error(`Tenant şeması oluşturma hatası: ${error.message}`);
  }
}

async function dropTenantSchema(tenantId) {
  try {
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    // Şemayı sil
    await supabase.rpc('drop_tenant_schema', { schema_name: schemaName });

    return true;
  } catch (error) {
    throw new Error(`Tenant şeması silme hatası: ${error.message}`);
  }
}

async function createTenantAdmin(tenantId, email) {
  try {
    // Admin kullanıcı oluştur
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password: generateTemporaryPassword(),
      email_confirm: true,
      user_metadata: {
        tenantId,
        role: 'admin',
      },
    });

    if (error) {
      throw new Error(`Admin kullanıcı oluşturma hatası: ${error.message}`);
    }

    // Kullanıcıyı tenant_users tablosuna ekle
    const { error: insertError } = await supabase.from('tenant_users').insert({
      userId: user.id,
      tenantId,
      role: 'admin',
    });

    if (insertError) {
      throw new Error(`Tenant kullanıcı ilişkisi oluşturma hatası: ${insertError.message}`);
    }

    return user;
  } catch (error) {
    throw error;
  }
}

async function getTenantStats(tenantId) {
  try {
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    // Kullanıcı sayısını getir
    const { data: userData, error: userError } = await supabase
      .from('tenant_users')
      .select('count')
      .eq('tenantId', tenantId);

    if (userError) {
      throw new Error(`Kullanıcı sayısı alma hatası: ${userError.message}`);
    }

    // Öğrenci sayısını getir
    const { data: studentData, error: studentError } = await supabase.rpc(
      'get_tenant_student_count',
      { schema_name: schemaName }
    );

    if (studentError) {
      throw new Error(`Öğrenci sayısı alma hatası: ${studentError.message}`);
    }

    // Sınıf sayısını getir
    const { data: classData, error: classError } = await supabase.rpc('get_tenant_class_count', {
      schema_name: schemaName,
    });

    if (classError) {
      throw new Error(`Sınıf sayısı alma hatası: ${classError.message}`);
    }

    return {
      userCount: userData[0]?.count || 0,
      studentCount: studentData || 0,
      classCount: classData || 0,
    };
  } catch (error) {
    throw error;
  }
}

function generateTemporaryPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}

module.exports = {
  createTenant,
  listTenants,
  getTenant,
  updateTenant,
  deleteTenant,
};
