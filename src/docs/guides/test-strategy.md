# Maarif Okul Portalı Test Stratejisi

Bu doküman, Maarif Okul Portalı projesinin test yaklaşımını ve stratejisini açıklar. Test stratejimiz, yazılım kalitesini sağlamak, hataları erken tespit etmek ve kullanıcı deneyimini iyileştirmek için tasarlanmıştır.

## 1. Test Seviyeleri

### 1.1 Birim Testleri

Birim testleri, kodun en küçük parçalarını (fonksiyonlar, sınıflar, bileşenler) izole bir şekilde test eder.

**Teknolojiler:**
- Jest
- React Testing Library
- @testing-library/user-event

**Yaklaşım:**
- Her bileşen ve yardımcı fonksiyon için birim testleri yazılmalıdır
- Testler `src/__tests__` dizini altında, test edilen dosya ile aynı yapıda organize edilmelidir
- Her test dosyası `.test.ts` veya `.test.tsx` uzantısına sahip olmalıdır
- AAA (Arrange-Act-Assert) veya Given-When-Then kalıbı kullanılmalıdır

**Örnek:**
```typescript
// Button bileşeni için birim testi
describe('Button Component', () => {
  it('butonu doğru bir şekilde render etmelidir', () => {
    // Arrange
    render(<Button>Test Butonu</Button>);
    
    // Act & Assert
    expect(screen.getByRole('button', { name: /test butonu/i })).toBeInTheDocument();
  });
});
```

### 1.2 Entegrasyon Testleri

Entegrasyon testleri, birden fazla bileşenin veya modülün birlikte çalışmasını test eder.

**Teknolojiler:**
- Jest
- React Testing Library
- MSW (Mock Service Worker)

**Yaklaşım:**
- API çağrıları MSW ile mock edilmelidir
- Sayfalar ve karmaşık bileşen grupları için entegrasyon testleri yazılmalıdır
- Veri akışı ve kullanıcı etkileşimleri test edilmelidir
- Testler `src/__tests__/integration` dizini altında organize edilmelidir

**Örnek:**
```typescript
// API entegrasyon testi
describe('User API Entegrasyon Testleri', () => {
  it('fetchUsers kullanıcıları başarıyla getirmelidir', async () => {
    // Act
    const users = await fetchUsers();
    
    // Assert
    expect(users).toHaveLength(2);
    expect(users[0].full_name).toBe('Ahmet Yılmaz');
  });
});
```

### 1.3 End-to-End (E2E) Testleri

E2E testleri, uygulamanın gerçek kullanıcı senaryolarını tam olarak test eder.

**Teknolojiler:**
- Playwright

**Yaklaşım:**
- Kritik kullanıcı yolları için E2E testleri yazılmalıdır
- Testler farklı tarayıcılarda çalıştırılmalıdır (Chrome, Firefox, Safari)
- Mobil görünümler de test edilmelidir
- Testler `e2e` dizini altında organize edilmelidir
- Her test dosyası `.spec.ts` uzantısına sahip olmalıdır

**Örnek:**
```typescript
test('Giriş sayfasına yönlendirme', async ({ page }) => {
  // Giriş butonuna tıkla
  await page.getByRole('link', { name: /giriş/i }).click();
  
  // Giriş sayfasına yönlendirildi mi?
  await expect(page).toHaveURL(/.*giris/);
});
```

## 2. Test Kapsamı

### 2.1 Birim Test Kapsamı

- Tüm UI bileşenleri
- Yardımcı fonksiyonlar ve hook'lar
- Veri dönüşüm ve işleme fonksiyonları
- Form doğrulama mantığı

### 2.2 Entegrasyon Test Kapsamı

- API çağrıları ve veri akışı
- Bileşen etkileşimleri
- Form gönderimi ve yanıt işleme
- Durum yönetimi

### 2.3 E2E Test Kapsamı

- Kullanıcı girişi ve kimlik doğrulama
- Öğrenci, öğretmen ve yönetici panelleri
- Not girişi ve görüntüleme
- Duyuru oluşturma ve görüntüleme
- Tenant değiştirme ve çoklu tenant işlemleri

## 3. Test Otomasyonu

### 3.1 CI/CD Entegrasyonu

- Her pull request için birim ve entegrasyon testleri çalıştırılmalıdır
- Main branch'e merge öncesi tüm testler başarılı olmalıdır
- Nightly build'lerde E2E testleri çalıştırılmalıdır
- Test coverage raporları otomatik olarak oluşturulmalıdır

### 3.2 Test Komutları

```bash
# Birim ve entegrasyon testleri çalıştır
npm test

# Testleri izleme modunda çalıştır
npm run test:watch

# Test coverage raporu oluştur
npm run test:coverage

# E2E testleri çalıştır
npm run e2e

# E2E testleri UI modunda çalıştır
npm run e2e:ui
```

## 4. Test Yazma Kuralları

### 4.1 Genel Kurallar

- Her test dosyası, test edilen modülün işlevselliğini açıkça tanımlamalıdır
- Testler bağımsız olmalı ve birbirini etkilememelidir
- Test verileri test dosyasında tanımlanmalı veya test fixture'ları kullanılmalıdır
- Testler hızlı çalışmalıdır
- Testler deterministik olmalıdır (her zaman aynı sonucu vermelidir)

### 4.2 Birim Test Kuralları

- Bileşen testleri, bileşenin davranışını test etmelidir, implementasyonu değil
- Bileşen testleri, kullanıcı etkileşimlerini simüle etmelidir
- Mock'lar minimum düzeyde kullanılmalıdır

### 4.3 Entegrasyon Test Kuralları

- API çağrıları MSW ile mock edilmelidir
- Gerçek kullanıcı senaryoları test edilmelidir
- Hata durumları da test edilmelidir

### 4.4 E2E Test Kuralları

- Testler gerçek kullanıcı davranışlarını simüle etmelidir
- Testler farklı tarayıcılarda çalıştırılmalıdır
- Testler farklı ekran boyutlarında çalıştırılmalıdır
- Testler stabil olmalıdır (flaky testlerden kaçınılmalıdır)

## 5. Test Bakımı

- Testler düzenli olarak gözden geçirilmeli ve güncellenmelidir
- Flaky testler hemen düzeltilmelidir
- Test coverage düzenli olarak izlenmelidir
- Test performansı düzenli olarak optimize edilmelidir

## 6. Test Dokümantasyonu

- Her test dosyası, test edilen işlevselliği açıkça belirtmelidir
- Karmaşık test senaryoları için açıklamalar eklenmelidir
- Test fixture'ları ve mock'lar dokümante edilmelidir
- Test stratejisi düzenli olarak güncellenmelidir 