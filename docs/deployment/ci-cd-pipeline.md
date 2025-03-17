# CI/CD Pipeline (Sürekli Entegrasyon ve Sürekli Dağıtım)

## Genel Bakış

Bu doküman, Maarif Okul Portalı SaaS platformu için CI/CD (Sürekli Entegrasyon ve Sürekli Dağıtım) pipeline'ının tasarımını, yapılandırmasını ve iş akışlarını detaylandırmaktadır. CI/CD pipeline, kod değişikliklerinin güvenli, otomatik ve tutarlı bir şekilde test edilmesini ve dağıtılmasını sağlayarak, geliştirme süreçlerini hızlandırır ve yazılım kalitesini artırır.

## Temel Prensipler

Maarif Okul Portalı CI/CD pipeline'ı aşağıdaki prensiplere dayanmaktadır:

1. **Otomatizasyon**: Manuel müdahaleleri en aza indirerek tüm entegrasyon ve dağıtım süreçlerini otomatikleştirme
2. **Güvenlik**: Her aşamada güvenlik kontrolleri ve savunma katmanları ekleme
3. **Hız**: Geliştirme döngüsünü hızlandıracak optimizasyonlar yapma
4. **Geri Bildirim**: Geliştiricilere hızlı ve anlamlı geri bildirimler sağlama
5. **İzlenebilirlik**: Tüm build ve dağıtım süreçlerinin izlenebilirliğini sağlama
6. **Tekrarlanabilirlik**: Aynı girdilerle her zaman aynı çıktıları üretme
7. **Tenant İzolasyonu**: Üretim ortamına dağıtımların tenant'ları etkilememesini sağlama

## CI/CD Mimarisi

### Genel Mimari

Maarif Okul Portalı için aşağıdaki CI/CD mimarisi kullanılmaktadır:

[Kod Değişiklikleri] → [GitHub] → [GitHub Actions] → [Test, Build, Analiz] → [Dağıtım]
↓
[Vercel/AWS] → [Farklı Ortamlar]


### Kullanılan Teknolojiler ve Araçlar

- **Versiyon Kontrolü**: GitHub
- **CI/CD Platformu**: GitHub Actions
- **Deployment Platformu**: Vercel (Frontend) / AWS (Backend Servisler)
- **Konteynerizasyon**: Docker
- **Test Araçları**: Jest, Playwright, React Testing Library
- **Linting & Kod Kalitesi**: ESLint, Prettier, TypeScript
- **Güvenlik Taraması**: Dependabot, CodeQL, SAST/SCA taramaları
- **Altyapı Yönetimi**: Terraform (IaC)
- **Önizleme Ortamları**: Vercel Preview Deployments

## Entegrasyon Süreci (CI)

### Branching Stratejisi

Maarif Okul Portalı, GitFlow'un özelleştirilmiş bir versiyonunu kullanmaktadır:

- **main**: Üretim ortamı kodu (korumalı)
- **develop**: Geliştirme ortamı kodu
- **feature/*****: Yeni özellikler için dallar
- **bugfix/*****: Hata düzeltmeleri için dallar
- **release/*****: Sürüm hazırlığı için dallar
- **hotfix/*****: Acil üretim düzeltmeleri için dallar

```mermaid
graph TD
    main --> release
    release --> main
    release --> develop
    develop --> feature
    feature --> develop
    develop --> bugfix
    bugfix --> develop
    main --> hotfix
    hotfix --> main
    hotfix --> develop
```

### Pull Request Süreci

Tüm kod değişiklikleri bir Pull Request (PR) aracılığıyla gözden geçirilmelidir:

1. Geliştirici bir feature/bugfix dalı oluşturur
2. Kod değişikliklerini tamamlar ve testleri yazar
3. PR oluşturur ve CI pipeline'ı otomatik olarak başlar
4. CI testleri başarılı olursa kod gözden geçirmesi başlar
5. En az bir onay ve tüm CI kontrolleri geçildikten sonra PR birleştirilebilir

### CI Kontrolleri

Her Pull Request aşağıdaki otomatik kontrollere tabi tutulur:

1. **Kod Derleme**: TypeScript ile kod derleme kontrolü
2. **Lint Kontrolü**: ESLint ve Prettier ile kod stili kontrolü
3. **Birim Testleri**: Jest ile birim testleri
4. **Entegrasyon Testleri**: Bileşenler arası entegrasyon testleri
5. **Güvenlik Taraması**: Bağımlılıklarda ve kodda güvenlik açıklarının kontrolü
6. **Performans Kontrolü**: Temel performans metriklerinin ölçümü
7. **Erişilebilirlik Kontrolü**: a11y standartlarına uygunluk kontrolü

### CI Konfigürasyonu

```yaml
# .github/workflows/ci.yml
name: Continuous Integration

on:
  pull_request:
    branches: [ develop, main, release/* ]
  push:
    branches: [ develop, main ]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run ESLint
        run: npm run lint
      - name: Check formatting
        run: npm run format:check

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run TypeScript Check
        run: npm run type-check

  test:
    name: Test
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run Jest tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          JWT_SECRET: test-jwt-secret
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npm run test:e2e
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results
          path: test-results/

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Dependency Scan
        uses: snyk/actions/node@master
        with:
          args: --severity-threshold=high
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v2
        with:
          languages: javascript, typescript
```

## Dağıtım Süreci (CD)

### Ortamlar

Maarif Okul Portalı, aşağıdaki ortamlara sahiptir:

1. **Geliştirme (Development)**: Geliştirme ve entegrasyon için
   - URL: dev.maarifportal.com
   - Dalı: develop
   - Otomatik dağıtım: Her commit sonrası

2. **Staging (UAT)**: Kullanıcı kabul testleri için
   - URL: staging.maarifportal.com
   - Dalı: release/*
   - Otomatik dağıtım: Her release dalı güncellemesinde

3. **Üretim (Production)**: Canlı ortam
   - URL: *.maarifportal.com
   - Dalı: main
   - Otomatik dağıtım: Manuel onay sonrası

4. **Önizleme (Preview)**: PR'lar için geçici ortamlar
   - URL: pr-{number}.maarifportal.com
   - Dalı: PR dalları
   - Otomatik dağıtım: Her PR güncellemesinde

### CD Konfigürasyonu - Vercel Dağıtımı

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ develop, main, release/* ]
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
          working-directory: ./
```

### CD Konfigürasyonu - Backend Servisler (AWS)

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend

on:
  push:
    branches: [ develop, main, release/* ]
    paths:
      - 'backend/**'
      - 'packages/**'
  workflow_dispatch:

jobs:
  build-and-push:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: maarifportal-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "::set-output name=image::$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"
  
  deploy:
    name: Deploy to ECS
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1
      
      - name: Deploy to Dev
        if: github.ref == 'refs/heads/develop'
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: infrastructure/ecs/task-definition-dev.json
          service: maarifportal-backend-dev
          cluster: maarifportal-dev
          image: ${{ needs.build-and-push.outputs.image }}
          wait-for-service-stability: true
      
      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: infrastructure/ecs/task-definition-prod.json
          service: maarifportal-backend-prod
          cluster: maarifportal-prod
          image: ${{ needs.build-and-push.outputs.image }}
          wait-for-service-stability: true
```

### Altyapı Kodu (IaC) ile Dağıtım

```yaml
# .github/workflows/infrastructure.yml
name: Deploy Infrastructure

on:
  push:
    branches: [ main ]
    paths:
      - 'infrastructure/**'
  workflow_dispatch:

jobs:
  terraform:
    name: Deploy Infrastructure with Terraform
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./infrastructure
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.3.0
      
      - name: Terraform Init
        run: terraform init
      
      - name: Terraform Format
        run: terraform fmt -check
      
      - name: Terraform Plan
        run: terraform plan -out=tfplan
      
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: terraform apply -auto-approve tfplan
```

## Dağıtım Stratejileri

### Blue-Green Dağıtım

Üretim ortamında, kesinti süresini en aza indirmek için Blue-Green dağıtım stratejisi kullanılmaktadır:

```mermaid
graph LR
    A[Trafik] --> B[Mavi Ortam - Aktif]
    C[Yeşil Ortam - Hazırlık] --> D[Yeni Sürüm Dağıtımı]
    D --> E[Test ve Doğrulama]
    E --> F[Trafik Yönlendirme Değişimi]
    F --> G[Trafik]
    G --> C
    A -.-> H[Eski Mavi - Beklemede]
    B --> H
```

Uygulama süreci:

1. Mevcut aktif ortam (Mavi) normal şekilde trafik alır
2. Yeni sürüm, hazırlık ortamına (Yeşil) dağıtılır
3. Yeşil ortamda testler ve doğrulamalar yapılır
4. Trafik, Mavi'den Yeşil'e yönlendirilir
5. Yeşil artık aktif ortam olur, Mavi beklemede kalır
6. Sorun olması durumunda hızlıca Mavi'ye geri dönülebilir

### Canary Dağıtım

Bazı kritik özellikler için kademeli dağıtım sağlayan Canary yöntemi kullanılmaktadır:

```typescript
// lib/deployment/canary.ts
interface CanaryConfig {
  featureName: string;
  rolloutPercentage: number;
  evaluationPeriodMinutes: number;
  metricThresholds: {
    errorRate: number;
    latencyP95: number;
    cpuUsage: number;
  };
}

// Canary dağıtım yapılandırması
const canaryConfigs: Record<string, CanaryConfig> = {
  'billing-system-update': {
    featureName: 'Faturalandırma Sistemi Güncellemesi',
    rolloutPercentage: 5, // Başlangıçta trafiğin %5'i
    evaluationPeriodMinutes: 30,
    metricThresholds: {
      errorRate: 0.1, // %10 hata oranından fazla olursa rollback
      latencyP95: 500, // 500ms'den fazla p95 gecikme olursa rollback
      cpuUsage: 70 // %70 CPU kullanımından fazla olursa rollback
    }
  },
  'new-attendance-module': {
    featureName: 'Yeni Devam Takip Modülü',
    rolloutPercentage: 10,
    evaluationPeriodMinutes: 60,
    metricThresholds: {
      errorRate: 0.05,
      latencyP95: 300,
      cpuUsage: 60
    }
  }
};
```

Canary dağıtım süreci:

1. Yeni sürüm, trafiğin küçük bir yüzdesine (örn. %5) dağıtılır
2. Belirlenen süre boyunca metrikler izlenir (hata oranı, gecikme, kaynak kullanımı)
3. Metrikler tatmin edici ise, dağıtım yüzdesi kademeli olarak artırılır (%20, %50, %100)
4. Herhangi bir metrik eşiği aşılırsa, otomatik geri alma (rollback) gerçekleştirilir

### Feature Flags

Riskleri azaltmak için feature flag sistemi kullanılmaktadır:

```typescript
// lib/features/feature-flags.ts
interface FeatureFlag {
  name: string;
  description: string;
  enabled: boolean;
  tenantOverrides?: Record<string, boolean>;
  rolloutPercentage?: number;
}

// Feature flag tanımları
const featureFlags: Record<string, FeatureFlag> = {
  'advanced-analytics': {
    name: 'Gelişmiş Analitik',
    description: 'Gelişmiş veri analizi ve raporlama özellikleri',
    enabled: false,
    tenantOverrides: {
      'tenant-premium-1': true,
      'tenant-beta-tester': true
    }
  },
  'new-gradebook': {
    name: 'Yeni Not Defteri',
    description: 'Yeniden tasarlanmış not defteri arayüzü',
    enabled: true,
    rolloutPercentage: 50 // Kullanıcıların %50'si için aktif
  },
  'parent-messaging': {
    name: 'Veli Mesajlaşma',
    description: 'Velilerle doğrudan mesajlaşma özelliği',
    enabled: true,
    tenantOverrides: {
      'tenant-free-plan': false
    }
  }
};

// Feature flag kontrolü
export function isFeatureEnabled(
  featureName: string,
  context: {
    tenantId?: string;
    userId?: string;
  }
): boolean {
  const flag = featureFlags[featureName];
  
  if (!flag) {
    return false;
  }
  
  // Tenant bazlı override kontrolü
  if (context.tenantId && flag.tenantOverrides && flag.tenantOverrides[context.tenantId] !== undefined) {
    return flag.tenantOverrides[context.tenantId];
  }
  
  // Yüzde bazlı rollout kontrolü
  if (flag.rolloutPercentage !== undefined && context.userId) {
    // Deterministik olarak kullanıcı ID'si bazında kontrol
    const hash = hashString(context.userId);
    const normalizedHash = hash % 100;
    return normalizedHash < flag.rolloutPercentage;
  }
  
  return flag.enabled;
}
```

## Tenant Dağıtım Stratejisi

Maarif Okul Portalı, multi-tenant bir yapıya sahip olduğu için, dağıtım stratejisi tenant'ları korumak üzere özel olarak tasarlanmıştır:

### Tenant Izolasyonu

```typescript
// lib/deployment/tenant-isolation.ts
interface TenantDeploymentConfig {
  tenantId: string;
  name: string;
  deploymentGroup: 'alpha' | 'beta' | 'stable';
  isProtected: boolean; // Kritik tenant'ları koruma
  maintenanceWindow: {
    dayOfWeek: number; // 0-6 (Pazar-Cumartesi)
    startHour: number; // 0-23
    durationHours: number;
  };
}

// Tenant dağıtım grupları yapılandırması
const tenantDeploymentGroups = {
  'alpha': {
    description: 'Erken erişim tenant'ları - yeni özelliklerin ilk dalga yayılımı',
    deploymentOrder: 1,
    waitPeriodHours: 0
  },
  'beta': {
    description: 'Test tenant\'ları - ikinci dalga yayılım',
    deploymentOrder: 2,
    waitPeriodHours: 24
  },
  'stable': {
    description: 'Standart tenant\'lar - son dalga yayılım',
    deploymentOrder: 3,
    waitPeriodHours: 72
  }
};

// Tenant'a özgü dağıtım kontrolü
export function canDeployToTenant(
  tenantId: string,
  deploymentStartTime: Date
): boolean {
  const tenant = getTenantDeploymentConfig(tenantId);
  
  if (!tenant) {
    return false;
  }
  
  // Korumalı tenant kontrolü
  if (tenant.isProtected) {
    // Sadece bakım penceresinde dağıtım yapılabilir
    const now = new Date();
    const dayMatches = now.getDay() === tenant.maintenanceWindow.dayOfWeek;
    const hourInRange = now.getHours() >= tenant.maintenanceWindow.startHour && 
                       now.getHours() < (tenant.maintenanceWindow.startHour + tenant.maintenanceWindow.durationHours);
    
    if (!(dayMatches && hourInRange)) {
      return false;
    }
  }
  
  // Dağıtım grubu bekleme süresi kontrolü
  const waitPeriodHours = tenantDeploymentGroups[tenant.deploymentGroup].waitPeriodHours;
  const waitPeriodMs = waitPeriodHours * 60 * 60 * 1000;
  const eligibleAfter = new Date(deploymentStartTime.getTime() + waitPeriodMs);
  
  return new Date() >= eligibleAfter;
}
```

### Kademeli Tenant Dağıtımı

Yeni sürümlerin tüm tenant'lara kademeli olarak dağıtılması için bir süreç:

1. **Alpha Grubu**: Erken erişim tenant'ları - ilk dağıtım
2. **Beta Grubu**: Test tenant'ları - 24 saat sonra dağıtım
3. **Stable Grubu**: Standart üretim tenant'ları - 72 saat sonra dağıtım

```yaml
# .github/workflows/tenant-deployment.yml
name: Tenant Deployment

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy'
        required: true
      tenant_group:
        description: 'Tenant group (alpha, beta, stable)'
        required: true
        default: 'alpha'

jobs:
  prepare:
    runs-on: ubuntu-latest
    steps:
      - name: Validate input
        run: |
          if [[ "${{ github.event.inputs.tenant_group }}" != "alpha" && 
                "${{ github.event.inputs.tenant_group }}" != "beta" && 
                "${{ github.event.inputs.tenant_group }}" != "stable" ]]; then
            echo "Invalid tenant group. Must be one of: alpha, beta, stable"
            exit 1
          fi
      
      - name: Get tenants in group
        id: get-tenants
        run: |
          # Bu adımda, belirli gruptaki tenant'ları alırız
          # (Basitleştirilmiş örnek - gerçekte bir API çağrısı veya veritabanı sorgusu olabilir)
          if [[ "${{ github.event.inputs.tenant_group }}" == "alpha" ]]; then
            echo "::set-output name=tenants::tenant1,tenant2,tenant3"
          elif [[ "${{ github.event.inputs.tenant_group }}" == "beta" ]]; then
            echo "::set-output name=tenants::tenant4,tenant5,tenant6"
          else
            echo "::set-output name=tenants::tenant7,tenant8,tenant9,tenant10"
          fi
    outputs:
      tenants: ${{ steps.get-tenants.outputs.tenants }}

  deploy:
    needs: prepare
    runs-on: ubuntu-latest
    strategy:
      matrix:
        tenant: ${{ fromJson(format('[{0}]', needs.prepare.outputs.tenants)) }}
      # Hatada diğer tenant'ların dağıtımı durdurulmasın
      fail-fast: false
      # Aynı anda en fazla 2 tenant'a dağıtım
      max-parallel: 2
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Check deployment window
        id: check-window
        run: |
          # Tenant için dağıtım penceresi kontrolü
          node scripts/check-deployment-window.js ${{ matrix.tenant }}
          
      - name: Deploy to tenant
        if: steps.check-window.outputs.can_deploy == 'true'
        run: |
          # Tenant'a dağıtım işlemi
          echo "Deploying version ${{ github.event.inputs.version }} to tenant ${{ matrix.tenant }}"
          node scripts/deploy-to-tenant.js ${{ matrix.tenant }} ${{ github.event.inputs.version }}
      
      - name: Run smoke tests
        if: steps.check-window.outputs.can_deploy == 'true'
        run: |
          # Dağıtım sonrası basit smoke testleri
          node scripts/run-tenant-smoke-tests.js ${{ matrix.tenant }}
      
      - name: Notify on failure
        if: failure()
        run: |
          # Başarısız dağıtım bildirimi
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{"text":"❌ Deployment failed for tenant ${{ matrix.tenant }}"}'
```

## Monitoring ve Rollback

### Dağıtım İzleme

```typescript
// lib/deployment/monitoring.ts
interface DeploymentMetrics {
  deploymentId: string;
  version: string;
  environment: string;
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'completed' | 'failed' | 'rolled-back';
  errorRate: number;
  p95Latency: number;
  successfulRequests: number;
  failedRequests: number;
  affectedTenants: string[];
}

// Dağıtım sonrası izleme
export async function monitorDeployment(
  deploymentId: string,
  monitoringDurationMinutes: number = 60
): Promise<boolean> {
  // İzleme başlangıç zamanı
  const startTime = new Date();
  // İzleme bitiş zamanı
  const endTime = new Date(startTime.getTime() + monitoringDurationMinutes * 60 * 1000);
  
  // Her 5 dakikada bir metrikleri kontrol et
  const intervalMinutes = 5;
  const checkIntervalMs = intervalMinutes * 60 * 1000;
  
  let isHealthy = true;
  
  while (new Date() < endTime && isHealthy) {
    // Metrikleri topla
    const metrics = await collectDeploymentMetrics(deploymentId);
    
    // Alarm durumları kontrolü
    if (
      metrics.errorRate > 0.05 || // %5'ten fazla hata oranı
      metrics.p95Latency > 1000 || // 1 saniyeden fazla P95 gecikme
      metrics.failedRequests > 100 // 100'den fazla başarısız istek
    ) {
      isHealthy = false;
      // Alarm bildirimini tetikle
      await triggerDeploymentAlarm(deploymentId, metrics);
    }
    
    // Metrikleri kaydet
    await storeDeploymentMetrics(metrics);
    
    // Sağlıklıysa, bir sonraki kontrol için bekle
    if (isHealthy) {
      await sleep(checkIntervalMs);
    }
  }
  
  return isHealthy;
}
```

### Otomatik Rollback

```typescript
// lib/deployment/rollback.ts
interface RollbackResult {
  success: boolean;
  reason: string;
  rollbackDuration: number;
  previousVersion: string;
  affectedTenants: string[];
}

// Otomatik geri alma işlemi
export async function performAutomaticRollback(
  deploymentId: string,
  reason: string
): Promise<RollbackResult> {
  const startTime = Date.now();
  
  try {
    // 1. Dağıtım bilgilerini al
    const deployment = await getDeploymentDetails(deploymentId);
    
    // 2. Önceki sürüm bilgisini al
    const previousVersion = await getPreviousVersion(deployment.environment);
    
    // 3. Rollback bildirimi gönder
    await sendRollbackNotification({
      deploymentId,
      reason,
      version: deployment.version,
      previousVersion,
      environment: deployment.environment
    });
    
    // 4. Rollback işlemini başlat
    const rollback = await initiateRollback(
      deployment.environment,
      previousVersion
    );
    
    // 5. Rollback tamamlandı mı kontrol et
    const isRollbackSuccessful = await waitForRollbackCompletion(rollback.id);
    
    // 6. Sonuç bildirimini gönder
    const endTime = Date.now();
    const rollbackDuration = (endTime - startTime) / 1000; // sn cinsinden
    
    const result: RollbackResult = {
      success: isRollbackSuccessful,
      reason,
      rollbackDuration,
      previousVersion,
      affectedTenants: deployment.affectedTenants
    };
    
    await logRollbackEvent(result);
    
    return result;
  } catch (error) {
    // Hata durumunda manuel müdahale bildirimini gönder
    await sendManualInterventionAlert(deploymentId, error.message);
    
    return {
      success: false,
      reason: `Rollback sırasında hata: ${error.message}`,
      rollbackDuration: (Date.now() - startTime) / 1000,
      previousVersion: 'unknown',
      affectedTenants: []
    };
  }
}
```

## Güvenlik Entegrasyonları

### Güvenli Sırlar Yönetimi

```typescript
// lib/deployment/secrets.ts
interface SecretConfig {
  name: string;
  description: string;
  environmentScope: string[];
  rotationPeriodDays: number;
  lastRotated?: Date;
}

// Sırlar yönetimi
const secretConfigs: Record<string, SecretConfig> = {
  'database-password': {
    name: 'Database Password',
    description: 'PostgreSQL veritabanı şifresi',
    environmentScope: ['development', 'staging', 'production'],
    rotationPeriodDays: 90
  },
  'jwt-secret': {
    name: 'JWT Secret',
    description: 'JSON Web Token imzalama anahtarı',
    environmentScope: ['development', 'staging', 'production'],
    rotationPeriodDays: 30
  },
  'supabase-service-key': {
    name: 'Supabase Service Key',
    description: 'Supabase servis rol anahtarı',
    environmentScope: ['staging', 'production'],
    rotationPeriodDays: 60
  }
};

// Güvenli sır dağıtımı
export async function deploySecrets(
  environment: string,
  secretNames: string[]
): Promise<void> {
  // Her bir sırrı ilgili ortama dağıt
  for (const secretName of secretNames) {
    const config = secretConfigs[secretName];
    
    if (!config) {
      console.warn(`Bilinmeyen sır: ${secretName}`);
      continue;
    }
    
    if (!config.environmentScope.includes(environment)) {
      console.warn(`Sır '${secretName}' şu ortamda kullanılmıyor: ${environment}`);
      continue;
    }
    
    // AWS Secrets Manager veya Vault gibi bir sır saklama hizmetinden sırrı al
    const secretValue = await getSecretFromStore(secretName, environment);
    
    // Ortama göre sırrı dağıt (Vercel, AWS, vb.)
    await deploySecretToEnvironment(
      environment,
      secretName,
      secretValue
    );
    
    console.log(`Sır '${secretName}' şu ortama dağıtıldı: ${environment}`);
  }
}
```

### Güvenlik Taramaları

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [ develop, main ]
  pull_request:
    branches: [ develop, main ]
  schedule:
    - cron: '0 0 * * 0' # Her Pazar günü

jobs:
  dependency-check:
    name: Dependency Vulnerability Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: npm audit --audit-level=high
      
      - name: Run Snyk scan
        uses: snyk/actions/node@master
        with:
          args: --severity-threshold=high
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  static-analysis:
    name: Static Code Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run CodeQL analysis
        uses: github/codeql-action/analyze@v2
        with:
          languages: javascript, typescript
      
      - name: Run ESLint security rules
        run: npx eslint . --config .eslintrc.security.js

  container-scan:
    name: Container Image Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t maarifportal-backend:${{ github.sha }} ./backend
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'maarifportal-backend:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

## Sürekli Optimizasyon

### Pipeline Metrikleri

Pipeline performansını izlemek ve iyileştirmek için çeşitli metrikler toplanmaktadır:

```typescript
// lib/ci-cd/metrics.ts
interface PipelineMetrics {
  pipelineId: string;
  branch: string;
  commitId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'running' | 'success' | 'failure' | 'cancelled';
  jobMetrics: {
    jobName: string;
    duration: number;
    status: 'success' | 'failure' | 'cancelled';
    startTime: Date;
    endTime: Date;
  }[];
  deploymentMetrics?: {
    environment: string;
    deploymentTime: Date;
    duration: number;
    status: 'success' | 'failure' | 'rollback';
  };
}

// Pipeline metriklerini izle ve raporla
export async function trackPipelineMetrics(
  pipelineId: string
): Promise<PipelineMetrics> {
  // Pipeline durumunu al
  const pipeline = await getPipelineStatus(pipelineId);
  
  // Job metriklerini topla
  const jobMetrics = await collectJobMetrics(pipelineId);
  
  // Metrikleri oluştur
  const metrics: PipelineMetrics = {
    pipelineId,
    branch: pipeline.branch,
    commitId: pipeline.commitId,
    startTime: pipeline.startTime,
    endTime: pipeline.endTime,
    duration: pipeline.endTime ? 
      (pipeline.endTime.getTime() - pipeline.startTime.getTime()) / 1000 : 
      undefined,
    status: pipeline.status,
    jobMetrics
  };
  
  // Dağıtım metrikleri varsa ekle
  if (pipeline.deploymentId) {
    const deployment = await getDeploymentStatus(pipeline.deploymentId);
    metrics.deploymentMetrics = {
      environment: deployment.environment,
      deploymentTime: deployment.startTime,
      duration: (deployment.endTime.getTime() - deployment.startTime.getTime()) / 1000,
      status: deployment.status
    };
  }
  
  // Metrikleri kaydet
  await storePipelineMetrics(metrics);
  
  // İyileştirme önerileri
  if (metrics.duration && metrics.duration > 600) { // 10 dakikadan uzun süren pipeline'lar
    await suggestPipelineOptimizations(metrics);
  }
  
  return metrics;
}
```

### Cache Optimizasyonu

Build ve test süreçlerini hızlandırmak için cache stratejileri kullanılmaktadır:

```yaml
# .github/workflows/optimize-cache.yml
name: Optimize Caching
on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * 1' # Her Pazartesi
jobs:
  analyze-cache:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Analyze npm cache efficiency
        id: npm-cache-analysis
        run: |
          # Son 20 pipeline'dan cache hit/miss oranlarını analiz et
          node scripts/analyze-npm-cache.js --last=20
      
      - name: Optimize package-lock.json
        if: steps.npm-cache-analysis.outputs.cache_hit_ratio < 0.8
        run: |
          # package-lock.json dosyasını optimize et
          npm ci
          npm dedupe
          git config --local user.email "ci-bot@maarifportal.com"
          git config --local user.name "CI Bot"
          git add package-lock.json
          git commit -m "Optimize package-lock.json for better caching"
          git push
      
      - name: Analyze Docker layer caching
        run: |
          # Docker imaj katmanlarını analiz et
          node scripts/analyze-docker-layers.js
          
      - name: Optimize Dockerfile
        run: |
          # Dockerfile'ı optimize et (katman sayısını azalt, sıralamayı iyileştir)
          node scripts/optimize-dockerfile.js
          
      - name: Generate cache optimization report
        run: |
          node scripts/generate-cache-report.js
          
      - name: Send optimization report
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('cache-report.md', 'utf8');
            
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Cache Optimization Report',
              body: report,
              labels: ['ci-cd', 'optimization']
            });
```

### Dokümantasyon ve Onboarding

#### Geliştirici Dokümantasyonu

CI/CD pipeline'ı kullanan geliştiriciler için dokümantasyon:

```markdown
# Geliştirici CI/CD Kılavuzu

## Genel Bakış
Maarif Okul Portalı, geliştirme süreçlerini hızlandırmak ve kod kalitesini artırmak için otomatik bir CI/CD pipeline kullanmaktadır. Bu dokümantasyon, pipeline'ın nasıl çalıştığını ve geliştirme sürecinde nasıl kullanılacağını açıklar.

## Branching Stratejisi
- `main`: Üretim kodu (korumalı)
- `develop`: Aktif geliştirme
- `feature/***`: Yeni özellikler
- `bugfix/***`: Hata düzeltmeleri
- `release/***`: Sürüm hazırlıkları
- `hotfix/***`: Acil üretim düzeltmeleri

## Geliştirme İş Akışı
1. `develop` dalından yeni bir dal oluşturun:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature-name
   ```
2. Değişikliklerinizi yapın ve commit edin:
   ```bash
   git add .
   git commit -m "Açıklayıcı commit mesajı"
   ```
3. Düzenli olarak `develop` dalı ile senkronize edin:
   ```bash
   git fetch
   git rebase origin/develop
   ```
4. Bittiğinde, dalınızı uzak depoya itin:
   ```bash
   git push -u origin feature/your-feature-name
   ```
5. GitHub'da bir Pull Request oluşturun

## CI Kontrolleri
Her PR, aşağıdaki kontrollere tabi tutulur:
- TypeScript derleme
- ESLint (kod stil kontrolü)
- Prettier (format kontrolü)
- Birim testleri (Jest)
- Entegrasyon testleri
- E2E testleri (Playwright)
- Güvenlik taramaları

## Yaygın Hatalar ve Çözümleri

### Jest Test Hatası
```
FAIL src/components/YourComponent.test.tsx
● YourComponent › should render correctly
```
**Çözüm**: Test dosyasını güncelleyin veya bileşendeki değişikliği geri alın.

### ESLint Hatası
```
error 'useState' is defined but never used @typescript-eslint/no-unused-vars
```
**Çözüm**: Kullanılmayan değişkenleri kaldırın veya kullanın.

### TypeScript Hatası
```
Type '{ prop1: string; }' is missing the following properties from type 'YourComponentProps': prop2, prop3
```
**Çözüm**: Eksik props'ları ekleyin veya interfacenizi güncelleyin.

## Ortamlar
- **Dev**: [dev.maarifportal.com](https://dev.maarifportal.com)
- **Staging**: [staging.maarifportal.com](https://staging.maarifportal.com)
- **Production**: [maarifportal.com](https://maarifportal.com)

## Yardım ve Destek
CI/CD pipeline ile ilgili sorunlar için:
- Slack kanalı: #ci-cd-support
- E-posta: devops@maarifportal.com
```

### İyileştirme ve Yol Haritası

#### Faz 1: Temel CI/CD Pipeline (MVP)
* GitHub Actions ile temel build ve test
* Vercel ile otomatik dağıtım
* Temel güvenlik taramaları
* Manuel onay gerektiren üretim dağıtımları

#### Faz 2: Gelişmiş Test ve Güvenlik (MVP + 2 Ay)
* Kapsamlı E2E testleri
* Otomatik performans testleri
* Gelişmiş güvenlik taramaları (SAST, DAST, SCA)
* Tenant bazlı dağıtım stratejisi

#### Faz 3: Tam Otomatik Pipeline (MVP + 4 Ay)
* Canary dağıtım stratejisi
* Otomatik rollback mekanizmaları
* Gelişmiş izleme ve metrikler
* Self-servis dağıtım portalı

### En İyi Uygulamalar ve Yazılım Kalitesi

#### Kod Kalitesi ve Test Kapsamı

```yaml
# .github/workflows/code-quality.yml
name: Code Quality
on:
  pull_request:
    branches: [ develop, main ]
jobs:
  code-coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: Check coverage thresholds
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Code coverage below threshold: $COVERAGE% (required: 80%)"
            exit 1
          fi
      
      - name: Upload coverage report
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: coverage/
  
  code-complexity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run complexity analysis
        run: npx eslint . --config .eslintrc.complexity.js
      
      - name: Check for code smells
        run: npx sonarqube-scanner
```

#### Sorumlu Ekipler ve İletişim

| Sorumlu Alan | Ekip | İletişim |
|--------------|------|----------|
| CI Pipeline | DevOps Ekibi | devops@maarifportal.com |
| Deployment | Platform Ekibi | platform@maarifportal.com |
| Test Otomasyonu | QA Ekibi | qa@maarifportal.com |
| Güvenlik Taramaları | Güvenlik Ekibi | security@maarifportal.com |
| Code Review | Geliştirme Ekibi | dev@maarifportal.com |

#### İlgili Kaynaklar
* [Felaketten Kurtarma Planı](/docs/deployment/disaster-recovery.md)
* [Yedekleme ve Geri Yükleme Prosedürleri](/docs/deployment/backup-restore.md)
* [Teknoloji Yığını](/docs/architecture/tech-stack.md)