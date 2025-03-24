const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' }); // Ortam değişkenlerini .env.local dosyasından yükle

// Supabase bağlantı bilgileri - .env.local dosyasından alınıyor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Service Key tanımlanmış:', !!supabaseServiceKey);

// Supabase client oluştur (service_role key ile)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Kullanıcı oluşturma işlevi
 * @param {string} email - Kullanıcı e-posta adresi
 * @param {string} password - Kullanıcı şifresi
 * @param {object} userData - public.users tablosu için ek veriler
 */
async function createUser(email, password, userData) {
  console.log(`${email} kullanıcısı oluşturuluyor...`);

  try {
    // 1. Auth kullanıcısı oluştur
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // E-posta onayını otomatik yap
      user_metadata: {
        full_name: `${userData.first_name} ${userData.last_name}`
      }
    });

    if (authError) {
      console.error(`${email} auth kullanıcısı oluşturma hatası:`, authError);
      return null;
    }

    console.log(`${email} auth kullanıcısı oluşturuldu. ID: ${authUser.user.id}`);

    // 2. public.users tablosuna kullanıcı ekle
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        is_active: userData.is_active || true,
        verification_status: userData.verification_status || 'verified',
        tenant_id: userData.tenant_id || null
      });

    if (profileError) {
      console.error(`${email} profil oluşturma hatası:`, profileError);
      return null;
    }

    console.log(`${email} için public.users kaydı oluşturuldu`);
    return authUser.user;

  } catch (error) {
    console.error(`${email} kullanıcısı oluşturma genel hatası:`, error);
    return null;
  }
}

/**
 * Tüm kullanıcıları oluştur
 */
async function createUsers() {
  console.log('Kullanıcılar oluşturuluyor...');

  // 1. Super Admin
  const superAdmin = await createUser('admin@i-ep.app', 'password', {
    first_name: 'Süper',
    last_name: 'Admin',
    role: 'super_admin',
    is_active: true,
    verification_status: 'verified'
  });

  // 2. Demo Okul Admin
  const demoAdmin = await createUser('admin@demo.i-ep.app', 'password', {
    tenant_id: '11111111-1111-1111-1111-111111111111',
    first_name: 'Demo',
    last_name: 'Admin',
    role: 'admin',
    is_active: true,
    verification_status: 'verified'
  });

  console.log('Kullanıcı oluşturma işlemi tamamlandı!');
  console.log('Oluşturulan kullanıcılar:');
  console.log('- Super Admin:', superAdmin ? 'Başarılı' : 'Başarısız');
  console.log('- Demo Admin:', demoAdmin ? 'Başarılı' : 'Başarısız');
}

// Scripti çalıştır
createUsers()
  .catch(err => {
    console.error('Script çalıştırma hatası:', err);
  })
  .finally(() => {
    console.log('İşlem tamamlandı.');
  }); 