# Multi-tenant Mimarisi Test Rehberi

Bu doküman, İ-EP.APP'ın çok kiracılı (multi-tenant) mimarisini test etmek için gereken adımları, stratejileri ve test senaryolarını açıklamaktadır.

![Veri İzolasyon Stratejileri](../assets/images/data-isolation.md)

## Multi-tenant Test Stratejisi

İ-EP.APP'ın multi-tenant yapısını test ederken, aşağıdaki temel alanlara odaklanılmalıdır:

1. **Tenant İzolasyonu**: Bir tenant'ın verileri ve işlemleri, diğer tenant'ları etkilememelidir
2. **Domain Yönlendirme**: Subdomain ve özel domain yönlendirmeleri doğru tenant'a yapılmalıdır
3. **Kimlik Doğrulama ve Yetkilendirme**: Kullanıcılar sadece kendi tenant'larına erişebilmelidir
4. **Veritabanı İzolasyonu**: Şema ve RLS politikaları ile veri izolasyonu sağlanmalıdır
5. **Tenant Yaşam Döngüsü**: Tenant oluşturma, yapılandırma ve sonlandırma işlemleri doğru çalışmalıdır

## Test Ortamı Hazırlama

### Test Tenant'ları Oluşturma

Test senaryolarını çalıştırmak için en az iki tenant oluşturulmalıdır:

```bash
# İlk test tenant'ı
npm run create-tenant -- --name "Test Okul 1" --subdomain "test-okul-1" --email "admin@test-okul-1.com"

# İkinci test tenant'ı
npm run create-tenant -- --name "Test Okul 2" --subdomain "test-okul-2" --email "admin@test-okul-2.com"
```

### Test Kullanıcıları Oluşturma

Her tenant için farklı rollerde test kullanıcıları oluşturun:

```bash
# Tenant 1 için kullanıcılar
node scripts/create-users.js --tenant-id tenant1_id --admin 1 --teacher 2 --student 5 --parent 3

# Tenant 2 için kullanıcılar
node scripts/create-users.js --tenant-id tenant2_id --admin 1 --teacher 2 --student 5 --parent 3
```

### Test Verileri Oluşturma

Test tenant'ları için gerçekçi test verileri oluşturun:

```bash
# Tenant 1 için test verileri
node scripts/seed-test-data.js --tenant-id tenant1_id

# Tenant 2 için test verileri
node scripts/seed-test-data.js --tenant-id tenant2_id
```

## Tenant İzolasyonu Test Senaryoları

### 1. Veri Erişim İzolasyonu Testi

**Amaç**: Bir tenant'ın kullanıcılarının, sadece kendi tenant'larının verilerine erişebildiğini doğrulamak.

**Test Adımları**:

1. Tenant 1'in bir kullanıcısı ile giriş yapın
2. Tenant 1'in öğrenci listesine erişin ve bir öğrenci ID'si alın
3. Tenant 2'ye ait bir öğrenci kaynağına doğrudan URL üzerinden erişmeyi deneyin
4. API yanıtının 403 (Forbidden) veya 404 (Not Found) olduğunu doğrulayın

**Örnek Test Kodu**:

```typescript
// __tests__/integration/tenant-isolation.test.ts
import { loginUser, fetchStudent } from '@/test-utils/api-helpers';

describe('Tenant Data Isolation', () => {
  let tenant1Token: string;
  let tenant2StudentId: string;

  beforeAll(async () => {
    // Tenant 1 kullanıcısı ile giriş yap
    tenant1Token = await loginUser('admin@test-okul-1.com', 'password');

    // Tenant 2'deki bir öğrencinin ID'sini al (doğrudan DB sorgusu ile)
    tenant2StudentId = await getStudentIdFromTenant2();
  });

  test('Should not allow access to other tenant data', async () => {
    // Tenant 1 token'ı ile Tenant 2 öğrencisine erişmeyi dene
    const response = await fetchStudent(tenant2StudentId, tenant1Token);

    // 403 veya 404 yanıtı beklenir
    expect(response.status).toBeOneOf([403, 404]);
    expect(response.data).not.toHaveProperty('id', tenant2StudentId);
  });
});
```

### 2. API İzolasyonu Testi

**Amaç**: API isteklerinin tenant izolasyonunu sağladığını doğrulamak.

**Test Adımları**:

1. Tenant 1 ve Tenant 2 için ayrı ayrı token alın
2. Her iki token ile de Tenant 1'e ait API endpoint'lerine istek yapın
3. Tenant 1 token'ı ile yapılan isteklerin başarılı olduğunu doğrulayın
4. Tenant 2 token'ı ile yapılan isteklerin reddedildiğini doğrulayın

**Örnek Test Kodu**:

```typescript
// __tests__/integration/api-isolation.test.ts
import { loginUser, fetchTenantUsers } from '@/test-utils/api-helpers';

describe('API Tenant Isolation', () => {
  let tenant1Token: string;
  let tenant2Token: string;
  let tenant1Id: string;

  beforeAll(async () => {
    // Her iki tenant için token al
    tenant1Token = await loginUser('admin@test-okul-1.com', 'password');
    tenant2Token = await loginUser('admin@test-okul-2.com', 'password');

    // Tenant 1 ID'sini al
    tenant1Id = await getTenantIdBySubdomain('test-okul-1');
  });

  test('Tenant 1 token should access Tenant 1 API', async () => {
    const response = await fetchTenantUsers(tenant1Id, tenant1Token);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('Tenant 2 token should not access Tenant 1 API', async () => {
    const response = await fetchTenantUsers(tenant1Id, tenant2Token);

    expect(response.status).toBe(403);
    expect(response.data).toHaveProperty('error');
  });
});
```

### 3. Veritabanı İzolasyonu Testi

**Amaç**: Veritabanı seviyesinde tenant izolasyonunun doğru çalıştığını doğrulamak.

**Test Adımları**:

1. Test betikleri kullanarak aynı tabloya farklı tenant'lar için veri ekleyin
2. Tenant 1 ve Tenant 2 için ayrı ayrı veritabanı sorguları yapın
3. Tenant-specific şemaların sadece kendi verilerini döndürdüğünü doğrulayın
4. Row Level Security politikalarının çalıştığını doğrulayın

**Örnek Test Kodu**:

```typescript
// __tests__/integration/database-isolation.test.ts
import { supabase } from '@/lib/supabase';

describe('Database Isolation', () => {
  beforeAll(async () => {
    // Test verileri oluştur
    await seedTestData();
  });

  test('Schema isolation works correctly', async () => {
    // Tenant 1 şemasında sorgu
    const { data: tenant1Students } = await supabase
      .from('tenant_X.students') // X yerine gerçek tenant ID
      .select('*');

    // Tenant 2 şemasında sorgu
    const { data: tenant2Students } = await supabase
      .from('tenant_Y.students') // Y yerine gerçek tenant ID
      .select('*');

    // Her şemanın kendi verilerini döndürdüğünü doğrula
    expect(tenant1Students?.length).toBeGreaterThan(0);
    expect(tenant2Students?.length).toBeGreaterThan(0);

    // Cross-check: Her şemada öğrenci ID'leri farklı olmalı
    const tenant1Ids = tenant1Students?.map((s) => s.id) || [];
    const tenant2Ids = tenant2Students?.map((s) => s.id) || [];

    expect(tenant1Ids.some((id) => tenant2Ids.includes(id))).toBe(false);
  });

  test('RLS policies work correctly', async () => {
    // Tenant 1 kullanıcısı için Supabase client oluştur
    const tenant1Client = await createSupabaseClientForUser('admin@test-okul-1.com');

    // Tenant 2'ye ait veriye erişmeyi dene
    const { data, error } = await tenant1Client
      .from('shared_metrics') // RLS korumalı paylaşılan tablo
      .select('*')
      .eq('tenant_id', 'tenant2_id'); // Tenant 2'ye ait veri

    // RLS politikası nedeniyle veri dönmemeli
    expect(data).toEqual([]);
    expect(error).toBeNull(); // Hata vermemeli, sadece boş sonuç döndürmeli
  });
});
```

## Domain Yönlendirme Testleri

### 1. Subdomain Yönlendirme Testi

**Amaç**: Subdomain'ler üzerinden doğru tenant'lara yönlendirme yapıldığını doğrulamak.

**Test Adımları**:

1. Farklı tenant subdomain'leri için istek yapın
2. Her subdomain'in doğru tenant context'i ile yüklendiğini kontrol edin
3. Var olmayan subdomain'lerde uygun hata sayfasının gösterildiğini doğrulayın

**Örnek Test Kodu**:

```typescript
// __e2e__/domain-routing.test.ts
import { test, expect } from '@playwright/test';

test.describe('Subdomain Routing', () => {
  test('should load correct tenant for valid subdomain', async ({ page }) => {
    // Tenant 1 subdomain'ine git
    await page.goto('http://test-okul-1.i-ep.app:3000');

    // Tenant 1'e özgü içeriğin gösterildiğini doğrula
    await expect(page.locator('h1')).toContainText('Test Okul 1');

    // Tenant 2 subdomain'ine git
    await page.goto('http://test-okul-2.i-ep.app:3000');

    // Tenant 2'ye özgü içeriğin gösterildiğini doğrula
    await expect(page.locator('h1')).toContainText('Test Okul 2');
  });

  test('should show error for invalid subdomain', async ({ page }) => {
    // Var olmayan bir subdomain'e git
    await page.goto('http://invalid-tenant.i-ep.app:3000');

    // Hata sayfasının gösterildiğini doğrula
    await expect(page.locator('h1')).toContainText('Tenant Bulunamadı');
  });
});
```

### 2. Özel Domain Testi

**Amaç**: Özel domain'ler üzerinden doğru tenant'lara yönlendirme yapıldığını doğrulamak.

**Test Adımları**:

1. Tenant için özel domain kaydı oluşturun
2. Özel domain üzerinden istek yapın
3. Doğru tenant context'i ile yüklendiğini kontrol edin

**Örnek Test Kodu**:

```typescript
// __e2e__/custom-domain.test.ts
import { test, expect } from '@playwright/test';
import { setupCustomDomain, teardownCustomDomain } from '@/test-utils/domain-helpers';

test.describe('Custom Domain Routing', () => {
  let customDomain: string;

  test.beforeAll(async () => {
    // Test için özel domain ayarla
    customDomain = await setupCustomDomain('test-okul-1');
  });

  test.afterAll(async () => {
    // Test sonrası özel domain'i temizle
    await teardownCustomDomain(customDomain);
  });

  test('should load correct tenant for custom domain', async ({ page }) => {
    // Özel domain'e git
    await page.goto(`http://${customDomain}:3000`);

    // Tenant 1'e özgü içeriğin gösterildiğini doğrula
    await expect(page.locator('h1')).toContainText('Test Okul 1');

    // Tenant ID'sinin doğru olduğunu kontrol et (sayfadaki meta etiketlerden)
    const tenantId = await page.getAttribute('meta[name="tenant-id"]', 'content');
    expect(tenantId).toBe('tenant1_id');
  });
});
```

## Kimlik Doğrulama ve Yetkilendirme Testleri

### 1. Cross-Tenant Giriş Testi

**Amaç**: Kullanıcıların sadece kendi tenant'larına giriş yapabildiklerini doğrulamak.

**Test Adımları**:

1. Tenant 1'in bir kullanıcısını oluşturun
2. Bu kullanıcı ile Tenant 1 domain'inde giriş yapın (başarılı olmalı)
3. Aynı kullanıcı ile Tenant 2 domain'inde giriş yapmayı deneyin (başarısız olmalı)

**Örnek Test Kodu**:

```typescript
// __e2e__/authentication.test.ts
import { test, expect } from '@playwright/test';

test.describe('Cross-Tenant Authentication', () => {
  const testUser = {
    email: 'test-user@example.com',
    password: 'Test123!',
  };

  test.beforeAll(async () => {
    // Tenant 1'de test kullanıcısı oluştur
    await createUserInTenant('tenant1_id', testUser);
  });

  test('User should log in to correct tenant', async ({ page }) => {
    // Tenant 1'e git
    await page.goto('http://test-okul-1.i-ep.app:3000/login');

    // Giriş yap
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Başarılı giriş kontrolü
    await expect(page).toHaveURL(/dashboard/);
  });

  test('User should not log in to wrong tenant', async ({ page }) => {
    // Tenant 2'ye git
    await page.goto('http://test-okul-2.i-ep.app:3000/login');

    // Giriş yap
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Hata mesajı kontrolü
    await expect(page.locator('.error-message')).toContainText('Geçersiz kimlik bilgileri');

    // URL değişmemeli
    await expect(page).toHaveURL(/login/);
  });
});
```

### 2. Role-Based Erişim Kontrolü Testi

**Amaç**: Farklı roldekilerin (admin, öğretmen, öğrenci, veli) doğru kaynaklara erişebildiğini doğrulamak.

**Test Adımları**:

1. Bir tenant için farklı rollerde kullanıcılar oluşturun
2. Her rol için ayrı ayrı giriş yapın
3. Rol bazlı erişim kontrollerinin doğru çalıştığını kontrol edin

**Örnek Test Kodu**:

```typescript
// __e2e__/rbac.test.ts
import { test, expect } from '@playwright/test';

test.describe('Role-Based Access Control', () => {
  // Her rol için test
  for (const role of ['admin', 'teacher', 'student', 'parent']) {
    test(`${role} role should have correct access`, async ({ page }) => {
      // Role özgü kullanıcı ile giriş yap
      await loginAsRole(page, role);

      // Admin paneline erişim
      await page.goto('http://test-okul-1.i-ep.app:3000/admin');
      if (role === 'admin') {
        await expect(page).toHaveURL(/admin/);
      } else {
        await expect(page).toHaveURL(/unauthorized/);
      }

      // Öğretmen paneline erişim
      await page.goto('http://test-okul-1.i-ep.app:3000/teacher');
      if (['admin', 'teacher'].includes(role)) {
        await expect(page).toHaveURL(/teacher/);
      } else {
        await expect(page).toHaveURL(/unauthorized/);
      }

      // Öğrenci paneline erişim
      await page.goto('http://test-okul-1.i-ep.app:3000/student');
      if (['admin', 'teacher', 'student'].includes(role)) {
        await expect(page).toHaveURL(/student/);
      } else {
        await expect(page).toHaveURL(/unauthorized/);
      }
    });
  }
});

// Rol bazlı giriş helper fonksiyonu
async function loginAsRole(page, role) {
  await page.goto('http://test-okul-1.i-ep.app:3000/login');
  await page.fill('input[name="email"]', `${role}@test-okul-1.com`);
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);
}
```

## Tenant Yaşam Döngüsü Testleri

### 1. Tenant Oluşturma Testi

**Amaç**: Yeni bir tenant'ın başarıyla oluşturulabildiğini doğrulamak.

**Test Adımları**:

1. Tenant oluşturma API'sini çağırın
2. Tenant kaydının oluşturulduğunu doğrulayın
3. Tenant için şema ve tabloların oluşturulduğunu kontrol edin
4. Domain yapılandırmasının doğru olduğunu kontrol edin

**Örnek Test Kodu**:

```typescript
// __tests__/integration/tenant-creation.test.ts
import { createTenant, getTenantBySubdomain } from '@/lib/tenant';
import { checkSchemaExists, checkTablesExist } from '@/test-utils/db-helpers';

describe('Tenant Creation', () => {
  const newTenant = {
    name: 'Test Tenant',
    subdomain: 'test-tenant',
    adminEmail: 'admin@test-tenant.com',
  };

  let createdTenantId: string;

  test('should create tenant record', async () => {
    const tenant = await createTenant(newTenant);

    expect(tenant).toHaveProperty('id');
    expect(tenant.name).toBe(newTenant.name);
    expect(tenant.subdomain).toBe(newTenant.subdomain);

    createdTenantId = tenant.id;
  });

  test('should create tenant database schema', async () => {
    const schemaExists = await checkSchemaExists(`tenant_${createdTenantId}`);
    expect(schemaExists).toBe(true);
  });

  test('should create tenant database tables', async () => {
    const requiredTables = ['users', 'classes', 'students', 'teachers'];
    const tablesExist = await checkTablesExist(`tenant_${createdTenantId}`, requiredTables);

    expect(tablesExist).toBe(true);
  });

  test('should be accessible via subdomain', async () => {
    const tenant = await getTenantBySubdomain(newTenant.subdomain);

    expect(tenant).not.toBeNull();
    expect(tenant?.id).toBe(createdTenantId);
  });
});
```

### 2. Tenant Silme/Devre Dışı Bırakma Testi

**Amaç**: Bir tenant'ın başarıyla devre dışı bırakılabildiğini ve verilerinin doğru şekilde silinebildiğini doğrulamak.

**Test Adımları**:

1. Test için bir tenant oluşturun
2. Tenant'ı devre dışı bırakın
3. Subdomain'in artık erişilemez olduğunu doğrulayın
4. Verilerin doğru şekilde silindiğini veya arşivlendiğini kontrol edin

**Örnek Test Kodu**:

```typescript
// __tests__/integration/tenant-deletion.test.ts
import { createTenant, deactivateTenant, deleteTenant } from '@/lib/tenant';
import { checkSchemaExists } from '@/test-utils/db-helpers';

describe('Tenant Deactivation and Deletion', () => {
  let testTenantId: string;

  beforeAll(async () => {
    // Test tenant'ı oluştur
    const tenant = await createTenant({
      name: 'Deletion Test',
      subdomain: 'deletion-test',
      adminEmail: 'admin@deletion-test.com',
    });

    testTenantId = tenant.id;
  });

  test('should deactivate tenant', async () => {
    await deactivateTenant(testTenantId);

    // Tenant'ın devre dışı bırakıldığını doğrula
    const tenant = await getTenantById(testTenantId);
    expect(tenant.status).toBe('inactive');

    // Subdomain'e erişimin engellendiğini doğrula (E2E test gerekebilir)
  });

  test('should delete tenant data', async () => {
    // Tenant verilerini sil (soft delete)
    await deleteTenant(testTenantId);

    // Tenant kaydının silindiğini doğrula
    const tenant = await getTenantById(testTenantId);
    expect(tenant).toBeNull();

    // Şemanın hala var olduğunu ama arşivlendiğini doğrula
    // Not: Gerçek silme politikanıza göre değişebilir
    const schemaExists = await checkSchemaExists(`tenant_${testTenantId}`);
    expect(schemaExists).toBe(true);

    // Arşivlenmiş şema olduğunu doğrula
    const isArchived = await checkSchemaIsArchived(`tenant_${testTenantId}`);
    expect(isArchived).toBe(true);
  });
});
```

## Performans ve Yük Testleri

### 1. Çoklu Tenant Yük Testi

**Amaç**: Sistemin çok sayıda tenant ile performans sorunları yaşamadan çalışabildiğini doğrulamak.

**Test Adımları**:

1. Çok sayıda test tenant'ı oluşturun (örn. 50-100 tenant)
2. Her tenant için temel işlemleri (giriş, veri ekleme, sorgulama) test edin
3. Sistem performansını izleyin ve darboğaz noktalarını tespit edin

**Örnek Test Kodu**:

```typescript
// __tests__/performance/multi-tenant-load.test.ts
import { createTenant } from '@/lib/tenant';
import { loginUser, fetchTenantUsers } from '@/test-utils/api-helpers';
import { measureExecutionTime } from '@/test-utils/performance-helpers';

describe('Multi-Tenant Load Test', () => {
  const NUM_TENANTS = 50; // Test tenant sayısı
  const tenants: any[] = [];

  beforeAll(async () => {
    // Test tenant'ları oluştur
    for (let i = 0; i < NUM_TENANTS; i++) {
      const tenant = await createTenant({
        name: `Load Test ${i}`,
        subdomain: `load-test-${i}`,
        adminEmail: `admin@load-test-${i}.com`,
      });

      tenants.push(tenant);
    }
  });

  test('should handle concurrent tenant logins', async () => {
    const loginPromises = tenants.map((tenant) =>
      loginUser(`admin@${tenant.subdomain}.com`, 'password')
    );

    const { executionTime, results } = await measureExecutionTime(() => Promise.all(loginPromises));

    // Tüm giriş işlemlerinin başarılı olduğunu doğrula
    expect(results.every((token) => !!token)).toBe(true);

    // Giriş işlemlerinin kabul edilebilir bir sürede tamamlandığını doğrula
    expect(executionTime).toBeLessThan(5000); // 5 saniyeden az
  });

  test('should handle concurrent API requests across tenants', async () => {
    const tokens = await Promise.all(
      tenants.map((tenant) => loginUser(`admin@${tenant.subdomain}.com`, 'password'))
    );

    const apiPromises = tenants.map((tenant, index) => fetchTenantUsers(tenant.id, tokens[index]));

    const { executionTime, results } = await measureExecutionTime(() => Promise.all(apiPromises));

    // Tüm API isteklerinin başarılı olduğunu doğrula
    expect(results.every((res) => res.status === 200)).toBe(true);

    // API isteklerinin kabul edilebilir bir sürede tamamlandığını doğrula
    expect(executionTime).toBeLessThan(10000); // 10 saniyeden az
  });
});
```

## Güvenlik Testleri

### 1. Tenant İzolasyonu Penetrasyon Testi

**Amaç**: Tenant izolasyonunun güvenlik açıkları olmadan sağlandığını doğrulamak.

**Test Adımları**:

1. Tenant 1 için kimlik bilgileri alın
2. Bu kimlik bilgileri ile Tenant 2'nin verilerine erişmeye çalışın
3. SQL injection ve URL manipülasyonu gibi yaygın saldırı teknikleri ile izolasyonu kırmaya çalışın

**Örnek Test Kodu**:

```typescript
// __tests__/security/tenant-isolation-security.test.ts
import { loginUser, fetchData } from '@/test-utils/api-helpers';

describe('Tenant Isolation Security', () => {
  let tenant1Token: string;
  let tenant2Id: string;

  beforeAll(async () => {
    tenant1Token = await loginUser('admin@test-okul-1.com', 'password');
    tenant2Id = await getTenantIdBySubdomain('test-okul-2');
  });

  test('should reject URL manipulation attempts', async () => {
    // Tenant 2'nin API'sine erişmeyi dene
    const response = await fetchData(`/api/tenants/${tenant2Id}/users`, tenant1Token);

    expect(response.status).toBeOneOf([401, 403, 404]);
    expect(response.data).not.toHaveProperty('users');
  });

  test('should reject SQL injection attempts', async () => {
    // SQL injection denemesi
    const response = await fetchData(`/api/tenants/1; DROP TABLE users;--/data`, tenant1Token);

    expect(response.status).toBeOneOf([400, 401, 403, 404]);

    // Veritabanı bütünlüğünü kontrol et
    const tablesExist = await checkTablesExist('public', ['tenants', 'users']);
    expect(tablesExist).toBe(true);
  });

  test('should reject tenant parameter forgery', async () => {
    // Tenant bilgisi içeren JWT token manipülasyonu
    const forgedToken = forgeTokenWithTenantId(tenant1Token, tenant2Id);

    const response = await fetchData(`/api/tenants/${tenant2Id}/users`, forgedToken);

    expect(response.status).toBeOneOf([401, 403]);
  });
});
```

## Test Sonuçları ve Raporlama

Her test senaryosu için aşağıdaki bilgileri içeren raporlar oluşturulmalıdır:

1. **Test Özeti**: Toplam test sayısı, başarılı ve başarısız testler
2. **Tenant İzolasyonu Skoru**: İzolasyon testlerinin başarı oranı
3. **Performans Metrikleri**: Ortalama yanıt süreleri, eşzamanlı istek limitleri
4. **Güvenlik Skorlaması**: Tespit edilen güvenlik açıkları ve çözüm önerileri

```
Multi-tenant Test Raporu
------------------------
Toplam Test Sayısı: 32
Başarılı: 30
Başarısız: 2
Başarı Oranı: %93.75

İzolasyon Testleri:
- Veri İzolasyonu: Başarılı
- API İzolasyonu: Başarılı
- DB İzolasyonu: Kısmen Başarılı (RLS bypass riski)

Performans Sonuçları:
- 50 tenant ile ortalama yanıt süresi: 320ms
- Maksimum eşzamanlı istek kapasitesi: 500 istek/saniye

Güvenlik Bulguları:
- API hız sınırlaması gerekli
- Tenant izolasyon JWT kontrolü güçlendirilmeli
```

## En İyi Uygulamalar ve Tavsiyeler

1. **Otomatik Test Entegrasyonu**: Tüm multi-tenant testlerini CI/CD pipeline'ına entegre edin
2. **Düzenli Penetrasyon Testleri**: Tenant izolasyonu için aylık veya çeyrek dönemlik penetrasyon testleri yapın
3. **İzolasyon Metrikleri İzleme**: Tenant izolasyon hatalarını gerçek zamanlı olarak tespit eden izleme mekanizmaları kurun
4. **Çapraz Tenant Erişim Logları**: Tenant izolasyon ihlallerini loglayın ve düzenli olarak inceleyin
5. **Tenant Test Ortamı**: Yeni özellikleri üretim ortamına almadan önce test tenant'ları ile test edin

## İlgili Dokümanlar

- [Multi-tenant Mimari Stratejisi](../architecture/multi-tenant-strategy.md)
- [Veri İzolasyon Stratejisi](../architecture/data-isolation.md)
- [Domain Yönetimi](../domain-management.md)
- [Güvenlik Test Planı](../security/security-testing-plan.md)

---

Bu rehber, İ-EP.APP'ın multi-tenant mimarisinin doğru ve güvenli bir şekilde test edilmesine yardımcı olmak için tasarlanmıştır. Yeni test senaryoları eklendikçe rehber güncellenecektir.
