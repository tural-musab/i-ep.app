# GitHub Secrets Konfigürasyonu

Bu dokümantasyon, i-ep.app projesi için gerekli GitHub repository secrets'larının nasıl kurulacağını açıklar.

## Gerekli Secrets

### 1. NEXTAUTH_SECRET

- **Açıklama**: NextAuth.js JWT token imzalama için gizli anahtar
- **Değer**: En az 32 karakter uzunluğunda rastgele string
- **Örnek üretim**:
  ```bash
  openssl rand -base64 32
  ```
- **Örnek değer**: `Jg5XyZ9R2nF8kL3mN1pQ7tV0bC4wS6uA8xE2hK9fM5vG1nR8kL`

### 2. NEXTAUTH_URL

- **Açıklama**: Uygulamanın production URL'i
- **Değer**: `https://i-ep.app` (gerçek domain'inizi kullanın)

### 3. SUPABASE_SERVICE_ROLE_KEY

- **Açıklama**: Supabase service role anahtarı (RLS politikalarını bypass eder)
- **Nereden alınır**: Supabase Dashboard → Settings → API
- **Format**: `eyJ...` ile başlar, çok uzun bir JWT token
- **⚠️ Güvenlik**: Bu anahtar çok güçlüdür, sadece server-side kullanım için

### 4. NEXT_PUBLIC_SUPABASE_URL

- **Açıklama**: Supabase projenizin public URL'i
- **Nereden alınır**: Supabase Dashboard → Settings → API
- **Format**: `https://your-project-id.supabase.co`
- **Örnek**: `https://abcdefghijklmnop.supabase.co`

### 5. NEXT_PUBLIC_SUPABASE_ANON_KEY

- **Açıklama**: Supabase anonymous (public) anahtarı
- **Nereden alınır**: Supabase Dashboard → Settings → API
- **Format**: `eyJ...` ile başlar, uzun bir JWT token
- **Not**: Bu anahtar client-side'da kullanılır, RLS politikaları ile korunur

### 6. NEXT_PUBLIC_APP_NAME

- **Açıklama**: Uygulamanın görünen adı
- **Değer**: `"İlkokul E-Platform"`

### 7. NEXT_PUBLIC_APP_URL

- **Açıklama**: Uygulamanın public URL'i
- **Değer**: `https://i-ep.app` (gerçek domain'inizi kullanın)

## Kurulum Adımları

### 1. GitHub Repository'ye Erişim

1. GitHub'da projenizin repository sayfasına gidin
2. **Settings** sekmesine tıklayın
3. Sol menüden **Secrets and variables** → **Actions**'a tıklayın

### 2. Secrets Ekleme

Her bir secret için:

1. **New repository secret** butonuna tıklayın
2. **Name** alanına secret adını yazın (yukarıdaki listeden)
3. **Secret** alanına ilgili değeri girin
4. **Add secret** butonuna tıklayın

### 3. Doğrulama

Tüm secrets'ları ekledikten sonra:

1. Bir dummy commit yapın veya CI'ı manuel olarak tetikleyin
2. GitHub Actions sekmesinde workflow'un çalıştığını kontrol edin
3. "Validate Environment" step'inin başarılı olduğunu doğrulayın
4. GitHub'da **Settings → Secrets and variables → Actions** sayfasında her
   secret adının listelendiğini ve yanında yeşil bir onay işareti olduğunu kontrol edin

## Ek Deployment Secrets

Deployment için aşağıdaki secrets'lar da gerekli olabilir:

### VERCEL_TOKEN

- **Açıklama**: Vercel deployment token
- **Nereden alınır**: Vercel Dashboard → Settings → Tokens

### VERCEL_ORG_ID

- **Açıklama**: Vercel organizasyon ID'si
- **Nereden alınır**: Vercel proje settings

### VERCEL_PROJECT_ID

- **Açıklama**: Vercel proje ID'si
- **Nereden alınır**: Vercel proje settings

### SNYK_TOKEN

- **Açıklama**: Snyk güvenlik taraması için token
- **Nereden alınır**: Snyk Dashboard → Account Settings → API Token

### CODECOV_TOKEN

- **Açıklama**: Codecov raporlarının yüklenmesi için token
- **Nereden alınır**: Codecov hesabınızın **Settings → Access** bölümünden

## Güvenlik Notları

1. **Service Role Key'i sadece CI/CD ve server-side işlemler için kullanın**
2. **Secret'ları asla client-side kodda kullanmayın**
3. **Regular aralıklarla secret'ları rotate edin**
4. **Production ve development ortamları için farklı secret'lar kullanın**
5. **Secret'ları log'larda asla expose etmeyin**

## Sorun Giderme

### "Environment validation failed" hatası

- Tüm gerekli secrets'ların eklendiğini kontrol edin
- Secret adlarının tam olarak eşleştiğini doğrulayın
- Secret değerlerinde boşluk olmadığını kontrol edin

### "Supabase connection failed" hatası

- SUPABASE_URL ve SUPABASE_ANON_KEY'in doğru olduğunu kontrol edin
- Supabase projesinin aktif olduğunu doğrulayın

### "NextAuth configuration error" hatası

- NEXTAUTH_SECRET'ın en az 32 karakter olduğunu kontrol edin
- NEXTAUTH_URL'in doğru format olduğunu doğrulayın

## CI Pipeline Test

Secrets kurulumunu test etmek için:

```bash
# Local'de environment validation çalıştırın
npm run validate:env

# CI'da test için
git commit --allow-empty -m "test: GitHub secrets configuration"
git push
```

Bu komutlardan sonra GitHub Actions'da workflow'un başarılı çalıştığını kontrol edin.
