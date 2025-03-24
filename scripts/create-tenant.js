const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

// Supabase bağlantı bilgileri
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Service Key:', !!supabaseServiceKey ? 'Tanımlı' : 'Tanımlı değil');

// Vercel API bilgileri
const vercelApiToken = process.env.VERCEL_API_TOKEN;
const vercelProjectId = process.env.VERCEL_PROJECT_ID;
const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'i-ep.app';

console.log('Vercel API Token:', !!vercelApiToken ? 'Tanımlı' : 'Tanımlı değil');
console.log('Vercel Project ID:', vercelProjectId);
console.log('Base Domain:', baseDomain);

// Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Argümanları işle
const args = process.argv.slice(2);
let tenantName, subdomain, email;

// 1. Komut satırı argümanlarını kontrol et
args.forEach(arg => {
  // Tırnaklı veya tırnaksız parametreleri işle
  const nameMatch = arg.match(/--name=["']?(.*?)["']?$/);
  const subdomainMatch = arg.match(/--subdomain=["']?(.*?)["']?$/);
  const emailMatch = arg.match(/--email=["']?(.*?)["']?$/);
  
  if (nameMatch) {
    tenantName = nameMatch[1];
  } else if (subdomainMatch) {
    subdomain = subdomainMatch[1];
  } else if (emailMatch) {
    email = emailMatch[1];
  }
});

// 2. Komut satırı argümanları işe yaramadıysa, tenant-config.json dosyasını kontrol et
if (!tenantName || !subdomain) {
  try {
    const configPath = path.join(__dirname, 'tenant-config.json');
    if (fs.existsSync(configPath)) {
      console.log('Tenant yapılandırma dosyası kullanılıyor...');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      tenantName = tenantName || config.name;
      subdomain = subdomain || config.subdomain;
      email = email || config.email;
    }
  } catch (err) {
    console.error('Yapılandırma dosyası okuma hatası:', err);
  }
}

console.log('İşlenen parametreler:');
console.log('Tenant adı:', tenantName);
console.log('Subdomain:', subdomain);
console.log('Email:', email);

if (!tenantName || !subdomain) {
  console.error('Hata: tenant adı ve subdomain gereklidir.');
  console.log('Lütfen komut satırı parametreleri (--name, --subdomain, --email) kullanın');
  console.log('veya "scripts/tenant-config.json" dosyasını düzenleyin.');
  process.exit(1);
}

if (!email) {
  email = `admin@${subdomain}.${baseDomain}`;
}

/**
 * Supabase üzerinde tenant oluştur
 */
async function createTenant() {
  console.log(`"${tenantName}" adında yeni tenant oluşturuluyor, subdomain: ${subdomain}`);

  try {
    // UUID oluştur
    const tenant_uuid = crypto.randomUUID();
    
    // Tenant oluşturma HTTP isteği - yardımcı API endpoint'ini kullanıyoruz
    console.log('Tenant kaydı oluşturuluyor...');
    
    // Vercel API token ile yetkilendirme yaparak tenant oluşturuyoruz
    const createTenantResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/create_tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        p_id: tenant_uuid,
        p_name: subdomain,
        p_display_name: tenantName,
        p_schema_name: `tenant_${subdomain}`,
        p_status: 'active',
        p_plan: 'premium'
      })
    });

    if (!createTenantResponse.ok) {
      const errorData = await createTenantResponse.json();
      console.error('Tenant kaydı oluşturma hatası:', errorData);
      
      // Eğer tenant yaratma başarısız olursa, direkt SQL ile deneyelim
      console.log('SQL komutlarını denemeniz gerekiyor!');
      console.log('--------------------------------------');
      console.log('Lütfen Supabase SQL Editor\'de aşağıdaki komutları çalıştırın:');
      console.log(`
-- 1. Tenant oluştur
INSERT INTO management.tenants (
  id, name, display_name, schema_name, database_name, status, 
  subscription_plan, subscription_start_date, subscription_end_date,
  max_users, settings, metadata
) VALUES (
  '${tenant_uuid}', 
  '${subdomain}', 
  '${tenantName}', 
  'tenant_${subdomain}',
  'default', 
  'active', 
  'premium',
  NOW(),
  NOW() + INTERVAL '1 year',
  50,
  '{}'::JSONB,
  '{}'::JSONB
);

-- 2. Domain oluştur
INSERT INTO management.domains (
  tenant_id, domain, is_primary, status
) VALUES (
  '${tenant_uuid}',
  '${subdomain}.${baseDomain}',
  TRUE,
  'active'
);
      `);
      
      process.exit(1);
    }

    const tenant = { id: tenant_uuid, name: subdomain };
    console.log(`Tenant kaydı oluşturuldu. ID: ${tenant.id}`);

    // 2. Subdomain kaydı oluştur
    const domainResult = await createSubdomain(tenant.id, subdomain);
    
    // 3. Admin kullanıcısı oluştur
    const adminUser = await createAdminUser(tenant.id, email);
    
    console.log('\nTenant Oluşturma Özeti:');
    console.log('------------------------');
    console.log(`Tenant Adı: ${tenantName}`);
    console.log(`Subdomain: ${subdomain}.${baseDomain}`);
    console.log(`Admin E-posta: ${email}`);
    console.log(`Tenant ID: ${tenant.id}`);
    console.log(`Domain Kaydı: ${domainResult ? 'Başarılı' : 'Başarısız'}`);
    
  } catch (error) {
    console.error('Tenant oluşturma işlemi sırasında hata:', error);
    process.exit(1);
  }
}

/**
 * Vercel API kullanarak subdomain oluştur
 */
async function createSubdomain(tenantId, subdomain) {
  try {
    console.log(`Vercel'de domain oluşturuluyor: ${subdomain}.${baseDomain}`);
    
    // 1. Domain kaydını oluştur - doğrudan HTTP isteği ile
    console.log('Domain kaydı oluşturuluyor...');
    
    const createDomainResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/create_domain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        p_tenant_id: tenantId,
        p_domain: `${subdomain}.${baseDomain}`,
        p_is_primary: true
      })
    });
      
    if (!createDomainResponse.ok) {
      console.error('Domain kaydı oluşturma hatası. SQL komutunu denemeniz gerekiyor.');
      return false;
    }
    
    console.log('Domain veritabanı kaydı oluşturuldu');
    
    // 2. Vercel API'ye domain ekle
    const response = await fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelApiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `${subdomain}.${baseDomain}`
      })
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Vercel domain ekleme hatası:', responseData);
      return false;
    }
    
    console.log(`Vercel'e domain eklendi: ${subdomain}.${baseDomain}`);
    return true;
    
  } catch (error) {
    console.error('Subdomain oluşturma hatası:', error);
    return false;
  }
}

/**
 * Admin kullanıcısı oluştur
 */
async function createAdminUser(tenantId, email) {
  try {
    console.log(`Admin kullanıcısı oluşturuluyor: ${email}`);
    
    // 1. Auth kullanıcısı oluştur
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'password', // Güvenli bir şifre belirleyin veya rastgele oluşturun
      email_confirm: true
    });
    
    if (authError) {
      console.error('Auth kullanıcısı oluşturma hatası:', authError);
      return null;
    }
    
    console.log(`Auth kullanıcısı oluşturuldu. ID: ${authUser.user.id}`);
    
    // 2. Public users tablosuna ekle
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        tenant_id: tenantId,
        email: email,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true,
        verification_status: 'verified'
      })
      .select('*')
      .single();
      
    if (userError) {
      console.error('Kullanıcı profili oluşturma hatası:', userError);
      return null;
    }
    
    console.log(`Admin kullanıcı profili oluşturuldu`);
    return user;
    
  } catch (error) {
    console.error('Admin kullanıcısı oluşturma hatası:', error);
    return null;
  }
}

// Tenant oluştur
createTenant(); 