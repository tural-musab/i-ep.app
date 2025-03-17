# Veri İzolasyon Stratejisi

## Genel Bakış

Maarif Okul Portalı SaaS, eğitim kurumlarının hassas verilerini barındıran bir platform olacağından, güçlü bir veri izolasyon stratejisi kritik öneme sahiptir. Bu doküman, farklı eğitim kurumlarının (tenant'ların) verilerinin birbirinden nasıl izole edileceğini ve bu izolasyonun nasıl sağlanacağını detaylandırır.

## Temel Prensipler

Veri izolasyon stratejimiz aşağıdaki prensiplere dayanmaktadır:

1. **Tam İzolasyon**: Her tenant'ın verileri, diğer tenant'lardan kesin sınırlarla ayrılmalıdır
2. **Sıfır Veri Sızıntısı**: Hiçbir senaryoda bir tenant'ın verileri başka bir tenant'a sızmamalıdır
3. **Defans Derinliği**: Birden fazla izolasyon katmanı kullanılarak güvenlik artırılmalıdır
4. **Denetlenebilirlik**: Tüm veri erişimleri loglama ve audit sistemleriyle izlenmelidir
5. **Performans ve Ölçeklenebilirlik**: İzolasyon, performans ve ölçeklenebilirliği olumsuz etkilememelidir

## İzolasyon Modelleri ve Uygulama

Maarif Okul Portalı, aşağıdaki izolasyon modellerini hibrit bir yaklaşımla uygular:

### 1. Veritabanı Şema İzolasyonu

Her tenant için PostgreSQL veritabanında ayrı bir şema oluşturulur:

```sql
-- Yeni tenant için şema oluşturma
CREATE SCHEMA tenant_{tenant_id};

-- Kullanıcılar tablosu örneği
CREATE TABLE tenant_{tenant_id}.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Şema bazlı erişim kontrolü
GRANT USAGE ON SCHEMA tenant_{tenant_id} TO app_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA tenant_{tenant_id} TO app_role;
```

#### Avantajları:
- Güçlü mantıksal izolasyon
- Tenant-specific şema değişiklikleri yapılabilir
- Performans iyileştirmeleri (indeksler, partitioning) tenant bazında uygulanabilir
- Her tenant için backup/restore basitleşir

#### Dezavantajları:
- Çok sayıda şema olduğunda veritabanı yönetimi karmaşıklaşabilir
- Cross-tenant sorgular karmaşıktır
- Schema sayısı veritabanı limitlerine tabi olabilir

### 2. Row-Level Security (RLS) İzolasyonu

PostgreSQL'in Row-Level Security özelliği kullanılarak, aynı tabloda bulunan farklı tenant verileri izole edilir:

```sql
-- Paylaşılan tabloya RLS politikası ekleme
CREATE TABLE public.shared_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS aktif etme
ALTER TABLE public.shared_metrics ENABLE ROW LEVEL SECURITY;

-- Tenant bazlı RLS politikası oluşturma
CREATE POLICY tenant_isolation_policy ON public.shared_metrics
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Kullanım Alanları:
- Analitik veriler
- Kullanım metrikleri
- Audit logları
- Sistem genelindeki yapılandırmalar

### 3. Uygulama Seviyesinde İzolasyon

Backend kodumuzda çok katmanlı izolasyon kontrolleri uygulanır:

```typescript
// Middleware seviyesinde tenant izolasyonu
export async function tenantIsolationMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (!tenantId) {
    return res.status(401).json({ error: 'Tenant ID missing' });
  }
  
  // Tenant kimliğini SQL context'ine ayarla
  await prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, TRUE)`;
  
  // Tenant bilgisini request context'ine ekle
  req.tenantId = tenantId;
  
  // İzolasyon kontrollerinden geçti, devam et
  next();
}

// Repository/service katmanında izolasyon
class StudentRepository {
  async getStudentById(studentId: string, tenantId: string): Promise<Student> {
    // Veritabanı sorgusu tenant ID ile sınırlandırılır
    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
        tenant_id: tenantId // İkinci bir güvenlik katmanı
      }
    });
    
    if (!student) throw new NotFoundError('Student not found');
    
    // Bulunan öğrencinin tenant'ını doğrula (üçüncü güvenlik katmanı)
    if (student.tenant_id !== tenantId) {
      throw new SecurityError('Tenant isolation breach detected');
    }
    
    return student;
  }
}
```

## İzolasyon İhlallerinin Tespiti ve Önlenmesi

### Otomatik Veri Sınıflandırma

Tüm veri modelleri, tenant'a ait olup olmadıklarını belirten meta verilerle işaretlenir:

```typescript
// Veri modeli örnekleri
export interface TenantBoundEntity {
  tenant_id: string;
}

export interface SystemEntity {
  is_system: boolean;
}

// Öğrenci modeli (tenant'a bağlı)
export interface Student extends TenantBoundEntity {
  id: string;
  name: string;
  email: string;
  // ... diğer alanlar
}

// Sistem yapılandırması (global)
export interface SystemConfiguration extends SystemEntity {
  id: string;
  key: string;
  value: string;
  // ... diğer alanlar
}
```

### İzolasyon Test Suit'i

Otomatik testler, tenant izolasyonunu düzenli olarak kontrol eder:

```typescript
// İzolasyon test örneği
describe('Tenant Data Isolation', () => {
  let tenant1Id: string;
  let tenant2Id: string;
  
  beforeAll(async () => {
    // Test tenant'ları oluştur
    tenant1Id = await createTestTenant('test-school-1');
    tenant2Id = await createTestTenant('test-school-2');
    
    // Her tenant için test verileri oluştur
    await createTestDataForTenant(tenant1Id);
    await createTestDataForTenant(tenant2Id);
  });
  
  test('Tenant 1 should not access Tenant 2 students', async () => {
    // Tenant 1 kontekstinde Tenant 2'ye ait bir öğrenciyi sorgula
    const tenant2Student = await getFirstStudentFromTenant(tenant2Id);
    
    await expect(
      fetchStudentWithContext(tenant2Student.id, tenant1Id)
    ).rejects.toThrow('Student not found');
  });
  
  test('API should reject cross-tenant requests', async () => {
    // Tenant 1 token'ı ile Tenant 2 verilerine erişmeyi dene
    const tenant1Token = await getAuthTokenForTenant(tenant1Id);
    const tenant2StudentAPI = `/api/tenants/${tenant2Id}/students`;
    
    const response = await fetch(tenant2StudentAPI, {
      headers: {
        'Authorization': `Bearer ${tenant1Token}`
      }
    });
    
    expect(response.status).toBe(403);
  });
});
```

## Veri Erişimi İzleme ve Denetim

### Kapsamlı Audit Loglama

Tüm veri erişimleri ve değişiklikleri, merkezi bir audit log sistemi tarafından kaydedilir:

```typescript
// Audit log işlevi
async function logAuditEvent(
  action: 'create' | 'read' | 'update' | 'delete',
  entityType: string,
  entityId: string,
  tenantId: string,
  userId: string,
  details?: object
) {
  await prisma.auditLog.create({
    data: {
      action,
      entity_type: entityType,
      entity_id: entityId,
      tenant_id: tenantId,
      user_id: userId,
      details: details ? JSON.stringify(details) : null,
      ip_address: getCurrentIpAddress(),
      timestamp: new Date()
    }
  });
}

// Repository'de kullanımı
class StudentRepository {
  async updateStudent(
    studentId: string, 
    data: Partial<Student>, 
    tenantId: string,
    userId: string
  ): Promise<Student> {
    // Veri güncellemesi
    const updatedStudent = await prisma.student.update({
      where: { id: studentId, tenant_id: tenantId },
      data
    });
    
    // Audit log kaydı
    await logAuditEvent(
      'update',
      'student',
      studentId,
      tenantId,
      userId,
      {
        changes: diffObjects(updatedStudent, data),
        fields_updated: Object.keys(data)
      }
    );
    
    return updatedStudent;
  }
}
```

### Anormal Erişim Tespiti

Olağandışı veri erişim kalıplarını tespit etmek için:

1. **Erişim Profilleri**: Her kullanıcı ve rol için normal erişim kalıpları tanımlanır
2. **İstatistiksel Analiz**: Normal erişimden sapmaları tespit etmek için istatistiksel modeller kullanılır
3. **Anında Uyarılar**: Şüpheli erişimler tespit edildiğinde sistem yöneticilerine uyarılar gönderilir

## Entegrasyon ve Üçüncü Parti Servisler

### Entegrasyon Verileri İzolasyonu

Üçüncü parti entegrasyonlar (ödeme sistemleri, e-posta servisleri, vb.) için izolasyon prensipleri:

```typescript
// Entegrasyon anahtarları modeli
interface TenantIntegrationKeys {
  tenant_id: string;
  integration_type: 'payment' | 'email' | 'sms' | 'calendar';
  api_key: string;
  api_secret: string;
  configuration: Record<string, any>;
  is_active: boolean;
}

// Entegrasyon servisi
class IntegrationService {
  async sendEmailWithProvider(
    tenantId: string,
    recipients: string[],
    subject: string,
    body: string
  ): Promise<void> {
    // Tenant'a özgü entegrasyon anahtarlarını al
    const emailConfig = await this.getTenantIntegrationConfig(
      tenantId, 
      'email'
    );
    
    // Tenant'a özgü konfigürasyonla e-posta gönder
    const emailProvider = this.createEmailProviderInstance(emailConfig);
    await emailProvider.sendEmail(recipients, subject, body);
    
    // Entegrasyon kullanımını logla
    await this.logIntegrationUsage(tenantId, 'email', {
      recipient_count: recipients.length,
      subject
    });
  }
}
```

### Veri Paylaşım Kontrolleri

Bazı durumlarda tenant'lar arası kontrollü veri paylaşımı gerekebilir (örn. okullar arası etkinlikler). Bu durumlar için:

1. **Açık İzin**: Her iki tenant'ın da açık izni gerekir
2. **Sınırlı Paylaşım**: Yalnızca belirtilen veri alanları paylaşılır
3. **Geçici Erişim**: Paylaşım zaman sınırlı olarak yapılır
4. **Detaylı Loglama**: Tüm paylaşım aktiviteleri detaylı şekilde loglanır

## Veri İzolasyonu Test Senaryoları

Düzenli olarak test edilmesi gereken izolasyon senaryoları:

1. **Doğrudan Erişim**: Tenant A'nın veritabanına doğrudan erişim denemeleri
2. **API Atlatma**: API güvenlik kontrolleri atlatılarak erişim denemeleri
3. **URL Manipülasyonu**: URL parametrelerini değiştirerek erişim denemeleri
4. **Yetki Yükseltme**: Düşük yetkili bir kullanıcının yüksek yetkili kaynaklara erişim denemeleri
5. **SQL Injection**: SQL injection ile izolasyon kontrollerini atlatma denemeleri
6. **Kimlik Sahteciliği**: Başka bir tenant'ın kimliğine bürünme denemeleri

## Tenant Aktarım ve Veri Taşıma

Bir tenant'ın verilerinin taşınması veya aktarılması gerektiğinde:

```typescript
// Tenant veri dışa aktarım işlevi
async function exportTenantData(
  tenantId: string,
  targetFormat: 'json' | 'csv' | 'sql'
): Promise<string> {
  // Tenant verisi var mı kontrol et
  const tenantExists = await checkTenantExists(tenantId);
  if (!tenantExists) {
    throw new Error(`Tenant ${tenantId} does not exist`);
  }
  
  // Tenant ile ilişkili tüm tabloları bul
  const tables = await getTenantTables(tenantId);
  
  // Her tablodan veri çıkar
  const exportData = {};
  for (const table of tables) {
    exportData[table] = await exportTableData(tenantId, table);
  }
  
  // İstenilen formatta dışa aktar
  return formatExportData(exportData, targetFormat);
}

// Tenant veri içe aktarım işlevi
async function importTenantData(
  targetTenantId: string,
  importData: string,
  sourceFormat: 'json' | 'csv' | 'sql'
): Promise<ImportResult> {
  // Hedef tenant hazırla
  await prepareTargetTenant(targetTenantId);
  
  // Kaynak veriyi parse et
  const parsedData = parseImportData(importData, sourceFormat);
  
  // Her tablo için verileri içe aktar
  const importResults = [];
  for (const [table, data] of Object.entries(parsedData)) {
    const result = await importTableData(targetTenantId, table, data);
    importResults.push(result);
  }
  
  // İçe aktarım sonuçlarını döndür
  return summarizeImportResults(importResults);
}
```

## KVKK Uyumluluğu ve Veri İzolasyonu

Maarif Okul Portalı, Kişisel Verilerin Korunması Kanunu (KVKK) uyumluluğu için veri izolasyonunu şu şekilde kullanır:

1. **Veri Lokalizasyonu**: Türkiye sınırları içinde veri saklama
2. **Erişim Kontrolü**: Kişisel verilere yalnızca yetkili personelin erişimi
3. **Veri Minimizasyonu**: Yalnızca gerekli kişisel verilerin toplanması
4. **Veri Silme Hakları**: Veri sahibinin talebi üzerine verilerin silinmesi
5. **Veri İşleme Logları**: Kişisel veri işleme faaliyetlerinin detaylı loglanması

## Yedekleme ve Felaketten Kurtarma Stratejileri

Veri izolasyonu prensipleri, yedekleme ve felaketten kurtarma süreçlerinde de uygulanmalıdır:

1. **İzole Yedekler**: Tenant verileri ayrı ayrı veya açık şekilde izole edilerek yedeklenir
2. **Şifrelenmiş Yedekler**: Tüm yedekler şifrelenerek saklanır
3. **Seçici Geri Yükleme**: Bir tenant'ın verilerini, diğerlerini etkilemeden geri yükleme imkanı
4. **Yedekleme İzolasyon Testleri**: Yedeklerden geri yükleme sırasında izolasyonun korunduğunun düzenli olarak test edilmesi

## Best Practices ve Yol Haritası

### İyi Uygulamalar

1. **İzolasyon varsayılandır**: Tüm yeni verilerin varsayılan olarak izole edilmesi
2. **Defense in depth**: Birden fazla izolasyon katmanı kullanılması
3. **Otomatik test**: İzolasyon testlerinin CI/CD pipeline'ına dahil edilmesi
4. **Düzenli denetim**: Veri izolasyonunun düzenli olarak denetlenmesi

### Veri İzolasyon Yol Haritası

| Aşama | Hedef | Zaman Çerçevesi |
|-------|-------|-----------------|
| 1     | Temel şema izolasyonu | MVP |
| 2     | RLS entegrasyonu | MVP + 2 ay |
| 3     | Gelişmiş audit loglama | MVP + 3 ay |
| 4     | Anormal erişim tespiti | MVP + 6 ay |
| 5     | İzolasyon otomatik testleri | MVP + 4 ay |

## İlgili Kaynaklar

- [Multi-Tenant Mimari Stratejisi](multi-tenant-strategy.md)
- [Yedekleme ve Geri Yükleme Prosedürleri](../deployment/backup-restore.md)
- [Felaketten Kurtarma Planlaması](../deployment/disaster-recovery.md)
- [Teknoloji Yığını](tech-stack.md)