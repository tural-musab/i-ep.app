# Demo Tenant Oluşturma Kılavuzu

## Genel Bakış

Bu doküman, Iqra Eğitim Portalı'nın demo tenant'larının (demo kiracılarının) oluşturulması, yapılandırılması ve yönetilmesi için kapsamlı bir kılavuz sunmaktadır. Demo tenant'lar, potansiyel müşterilere platformun özelliklerini göstermek, satış sürecini desteklemek ve kullanıcı eğitimlerinde örnek olarak kullanmak amacıyla oluşturulan özel ortamlardır.

## Demo Tenant'ın Amacı ve Önemi

Demo tenant'lar aşağıdaki amaçlara hizmet eder:

1. **Satış ve Pazarlama Aracı**: Potansiyel müşterilere platformun yeteneklerini canlı ortamda göstermek
2. **Eğitim Ortamı**: Yeni kullanıcıların sistemi risk almadan öğrenmesini sağlamak
3. **Özellik Gösterimi**: Farklı abonelik planlarındaki özellikleri karşılaştırmalı olarak sunmak
4. **Test Ortamı**: Yeni özelliklerin gerçekçi verilerle test edilmesini sağlamak
5. **Kullanım Senaryoları**: Farklı okul türleri ve kullanıcı rollerinin senaryolarını göstermek

## Demo Tenant Tipleri

Iqra Eğitim Portalı için üç farklı demo tenant tipi tanımlanmıştır:

### 1. Satış Demo Tenant'ı

- **Amaç**: Potansiyel müşterilere özel gösterimler için
- **Özellikler**: Tüm premium özellikler aktif, gerçekçi verilerle dolu
- **Erişim**: Geçici, kontrollü erişim (genellikle satış ekibi eşliğinde)
- **Veri**: Önceden hazırlanmış, gerçekçi ancak anonim veriler

### 2. Self-Servis Demo Tenant'ı

- **Amaç**: Potansiyel müşterilerin kendi kendilerine keşfetmeleri için
- **Özellikler**: Temel ve orta seviye özellikler aktif, sınırlı premium özellikler
- **Erişim**: Zaman sınırlı self-servis erişim (genellikle 14-30 gün)
- **Veri**: Basitleştirilmiş, kendini açıklayan örnek veriler

### 3. Eğitim Demo Tenant'ı

- **Amaç**: Eğitim ve onboarding süreçleri için
- **Özellikler**: Müşterinin abonelik planına göre yapılandırılmış
- **Erişim**: Eğitim süresi boyunca
- **Veri**: Eğitim senaryolarına uygun, sıfırlanabilir veriler

## Demo Tenant Oluşturma Süreci

### 1. Ön Hazırlık

#### 1.1 Demo Tenant Yapılandırma Planı

Demo tenant oluşturmadan önce aşağıdaki bilgileri içeren bir yapılandırma planı hazırlanmalıdır:

```typescript
// lib/demo/demo-tenant-config.ts
interface DemoTenantConfig {
  name: string;
  type: 'sales' | 'self-service' | 'training';
  subdomain: string;
  schoolType: 'ilkokul' | 'ortaokul' | 'lise' | 'anaokulu' | 'ozelEgitim' | 'meslek';
  schoolSize: 'small' | 'medium' | 'large';
  features: {
    premium: boolean;
    analytics: boolean;
    advancedReporting: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
    multiLanguage: boolean;
  };
  dataSet: 'minimal' | 'standard' | 'comprehensive';
  accessPeriod: number; // Gün cinsinden
  resetFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
  customizations: {
    logo?: string;
    theme?: string;
    welcomeMessage?: string;
  };
}
```

#### 1.2 Demo Veri Setleri

Demo tenant'lara yüklenecek veri setlerinin hazırlanması:

```typescript
// lib/demo/data-sets.ts
interface DemoDataSet {
  id: string;
  name: string;
  description: string;
  included: {
    students: number;
    teachers: number;
    classes: number;
    courses: number;
    assignments: number;
    exams: number;
    announcements: number;
    events: number;
  };
  scenarios: string[];
  prepopulatedUsers: {
    admins: number;
    teachers: number;
    students: number;
    parents: number;
  };
  dataFiles: string[]; // JSON veri dosyalarının yolları
}

export const demoDataSets: Record<string, DemoDataSet> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal Veri Seti',
    description: 'Temel özellikleri göstermek için minimum miktarda veri içerir',
    included: {
      students: 20,
      teachers: 5,
      classes: 3,
      courses: 6,
      assignments: 10,
      exams: 4,
      announcements: 5,
      events: 3,
    },
    scenarios: ['temelOkulYonetimi', 'dersPlanlama', 'notGirisi'],
    prepopulatedUsers: {
      admins: 1,
      teachers: 2,
      students: 5,
      parents: 3,
    },
    dataFiles: [
      '/demo-data/minimal/users.json',
      '/demo-data/minimal/classes.json',
      '/demo-data/minimal/courses.json',
      '/demo-data/minimal/activities.json',
    ],
  },

  standard: {
    id: 'standard',
    name: 'Standart Veri Seti',
    description: 'Çoğu özelliği göstermek için yeterli miktarda gerçekçi veri içerir',
    included: {
      students: 150,
      teachers: 15,
      classes: 10,
      courses: 25,
      assignments: 60,
      exams: 20,
      announcements: 30,
      events: 15,
    },
    scenarios: [
      'temelOkulYonetimi',
      'dersPlanlama',
      'notGirisi',
      'devamsizlikTakibi',
      'veliIletisimi',
      'etkinlikYonetimi',
      'ogrenciPerformansi',
    ],
    prepopulatedUsers: {
      admins: 2,
      teachers: 5,
      students: 15,
      parents: 10,
    },
    dataFiles: [
      '/demo-data/standard/users.json',
      '/demo-data/standard/classes.json',
      '/demo-data/standard/courses.json',
      '/demo-data/standard/activities.json',
      '/demo-data/standard/attendance.json',
      '/demo-data/standard/communications.json',
      '/demo-data/standard/performance.json',
    ],
  },

  comprehensive: {
    id: 'comprehensive',
    name: 'Kapsamlı Veri Seti',
    description: 'Tüm özellikleri ve karmaşık senaryoları göstermek için geniş veri seti',
    included: {
      students: 500,
      teachers: 50,
      classes: 30,
      courses: 60,
      assignments: 200,
      exams: 80,
      announcements: 100,
      events: 50,
    },
    scenarios: [
      'temelOkulYonetimi',
      'dersPlanlama',
      'notGirisi',
      'devamsizlikTakibi',
      'veliIletisimi',
      'etkinlikYonetimi',
      'ogrenciPerformansi',
      'gelismisRaporlama',
      'kaynaklarYonetimi',
      'faturalandirma',
      'cokluSubeYonetimi',
      'entegrasyonlar',
    ],
    prepopulatedUsers: {
      admins: 5,
      teachers: 15,
      students: 30,
      parents: 20,
    },
    dataFiles: [
      '/demo-data/comprehensive/users.json',
      '/demo-data/comprehensive/classes.json',
      '/demo-data/comprehensive/courses.json',
      '/demo-data/comprehensive/activities.json',
      '/demo-data/comprehensive/attendance.json',
      '/demo-data/comprehensive/communications.json',
      '/demo-data/comprehensive/performance.json',
      '/demo-data/comprehensive/resources.json',
      '/demo-data/comprehensive/billing.json',
      '/demo-data/comprehensive/branches.json',
      '/demo-data/comprehensive/integrations.json',
    ],
  },
};
```

### 2. Demo Tenant Oluşturma

#### 2.1 Komut Satırı Aracı

Demo tenant oluşturmak için kullanılacak CLI aracı:

```bash
#!/bin/bash
# scripts/create-demo-tenant.sh

# Kullanım bilgisi
function show_usage {
  echo "Kullanım: create-demo-tenant.sh [options]"
  echo "Opsiyonlar:"
  echo "  --name NAME          Demo tenant adı"
  echo "  --type TYPE          Demo tenant tipi (sales, self-service, training)"
  echo "  --subdomain SUB      Subdomain adı"
  echo "  --school-type TYPE   Okul tipi"
  echo "  --school-size SIZE   Okul büyüklüğü (small, medium, large)"
  echo "  --data-set SET       Veri seti (minimal, standard, comprehensive)"
  echo "  --access-period DAYS Erişim süresi (gün)"
  echo "  --reset FREQ         Sıfırlama sıklığı (never, daily, weekly, monthly)"
  echo "  --premium            Premium özellikleri aktif et"
  echo "  --custom-logo URL    Özel logo URL'i"
  echo "  --custom-theme NAME  Özel tema adı"
  echo "  --help               Bu yardım mesajını göster"
}

# Parametreleri işle
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --name)
      TENANT_NAME="$2"
      shift 2
      ;;
    --type)
      TENANT_TYPE="$2"
      shift 2
      ;;
    # ... diğer parametreler ...
    --help)
      show_usage
      exit 0
      ;;
    *)
      echo "Bilinmeyen parametre: $1"
      show_usage
      exit 1
      ;;
  esac
done

# Gerekli parametreleri kontrol et
if [ -z "$TENANT_NAME" ] || [ -z "$TENANT_TYPE" ] || [ -z "$SUBDOMAIN" ]; then
  echo "HATA: Gerekli parametreler eksik"
  show_usage
  exit 1
fi

echo "Demo tenant oluşturuluyor: $TENANT_NAME"

# Tenant veritabanı oluşturma
echo "Tenant veritabanı oluşturuluyor..."
# DB oluşturma komutları...

# Veri seti yükleme
echo "Veri seti yükleniyor: ${DATA_SET:-standard}"
# Veri yükleme komutları...

# Subdomain yapılandırması
echo "Subdomain yapılandırılıyor: $SUBDOMAIN.i-ep.app"
# DNS ve Web server yapılandırma komutları...

# Erişim ayarları
echo "Erişim ayarları yapılandırılıyor: ${ACCESS_PERIOD:-14} gün"
# Erişim ayarları...

echo "Demo tenant başarıyla oluşturuldu!"
echo "URL: https://$SUBDOMAIN.i-ep.app"
echo "Admin kullanıcı: admin@$SUBDOMAIN.i-ep.app"
echo "Şifre: DemoPassXXX"
```

#### 2.2 API Üzerinden Oluşturma

Demo tenant oluşturmak için API çağrısı örneği:

```typescript
// lib/demo/create-demo-tenant.ts
async function createDemoTenant(config: DemoTenantConfig): Promise<{
  success: boolean;
  tenantId?: string;
  url?: string;
  adminCredentials?: {
    email: string;
    password: string;
  };
  error?: string;
}> {
  try {
    // 1. Tenant kaydı oluştur
    const tenant = await db.tenants.create({
      name: config.name,
      subdomain: config.subdomain,
      type: 'demo',
      demoType: config.type,
      features: config.features,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + config.accessPeriod * 24 * 60 * 60 * 1000),
    });

    // 2. Demo tenant için şema oluştur
    await db.raw(`CREATE SCHEMA "tenant_${tenant.id}"`);

    // 3. Demo tenant için tabloları oluştur
    await migrateSchema(`tenant_${tenant.id}`);

    // 4. Demo veri setini yükle
    await loadDemoData(tenant.id, config.dataSet);

    // 5. Admin kullanıcısı oluştur
    const adminPassword = generateSecurePassword();
    const adminUser = await createAdminUser(tenant.id, adminPassword);

    // 6. Özelleştirmeleri uygula
    if (config.customizations) {
      await applyCustomizations(tenant.id, config.customizations);
    }

    // 7. Sıfırlama zamanlamasını ayarla
    if (config.resetFrequency !== 'never') {
      await scheduleReset(tenant.id, config.resetFrequency);
    }

    return {
      success: true,
      tenantId: tenant.id,
      url: `https://${config.subdomain}.i-ep.app`,
      adminCredentials: {
        email: `admin@${config.subdomain}.i-ep.app`,
        password: adminPassword,
      },
    };
  } catch (error) {
    console.error('Demo tenant oluşturma hatası:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### 3. Demo Tenant Yapılandırması

#### 3.1 Okul Profili Yapılandırması

```typescript
// lib/demo/configure-school-profile.ts
interface SchoolProfile {
  name: string;
  type: string;
  address: string;
  city: string;
  region: string;
  phoneNumber: string;
  email: string;
  website: string;
  foundedYear: number;
  studentCount: number;
  classCount: number;
  teacherCount: number;
  motto: string;
  description: string;
  facilities: string[];
  logo: string;
  coverImage: string;
}

const schoolProfileTemplates: Record<string, Partial<SchoolProfile>> = {
  // İlkokul şablonu
  ilkokul: {
    type: 'İlkokul',
    motto: 'Geleceğin temellerini birlikte atıyoruz',
    facilities: [
      'Kütüphane',
      'Spor Salonu',
      'Sanat Atölyesi',
      'Bilgisayar Laboratuvarı',
      'Oyun Alanları',
    ],
    description:
      'Okulumuz, çocukların temel eğitim ihtiyaçlarını karşılarken, onların sosyal, duygusal ve fiziksel gelişimlerine de önem veren bir eğitim anlayışı sunmaktadır.',
  },

  // Ortaokul şablonu
  ortaokul: {
    type: 'Ortaokul',
    motto: 'Başarıya giden yolda birlikte ilerliyoruz',
    facilities: [
      'Kütüphane',
      'Spor Salonu',
      'Fen Laboratuvarı',
      'Bilgisayar Laboratuvarı',
      'Müzik Odası',
    ],
    description:
      'Okulumuz, öğrencilerin akademik becerilerini geliştirirken, kişisel gelişimlerine de katkı sağlayan kapsamlı bir eğitim programı sunmaktadır.',
  },

  // Lise şablonu
  lise: {
    type: 'Anadolu Lisesi',
    motto: 'Bilim, sanat ve sporda mükemmelliğe',
    facilities: [
      'Kütüphane',
      'Spor Kompleksi',
      'Kimya Laboratuvarı',
      'Fizik Laboratuvarı',
      'Biyoloji Laboratuvarı',
      'Bilgisayar Laboratuvarı',
      'Konferans Salonu',
    ],
    description:
      'Okulumuz, öğrencilerin hem üniversiteye hazırlanmalarını hem de hayat boyu öğrenme becerilerini kazanmalarını sağlayan kaliteli bir eğitim sunmaktadır.',
  },
};

async function configureSchoolProfile(
  tenantId: string,
  baseProfile: Partial<SchoolProfile>,
  schoolType: string
): Promise<SchoolProfile> {
  // Şablon seçimi
  const template = schoolProfileTemplates[schoolType] || schoolProfileTemplates.ilkokul;

  // Profil birleştirme
  const profile: SchoolProfile = {
    name:
      baseProfile.name || `${schoolType.charAt(0).toUpperCase() + schoolType.slice(1)} Demo Okulu`,
    type: template.type || 'İlkokul',
    address: baseProfile.address || 'Eğitim Mahallesi, Okul Caddesi No:1',
    city: baseProfile.city || 'İstanbul',
    region: baseProfile.region || 'Marmara',
    phoneNumber: baseProfile.phoneNumber || '+90 212 555 0000',
    email: baseProfile.email || `info@${tenantId}.i-ep.app`,
    website: baseProfile.website || `https://${tenantId}.i-ep.app`,
    foundedYear: baseProfile.foundedYear || 2000,
    studentCount: baseProfile.studentCount || 500,
    classCount: baseProfile.classCount || 20,
    teacherCount: baseProfile.teacherCount || 30,
    motto: template.motto || 'Eğitimde kalite, başarıda süreklilik',
    description:
      template.description || 'Modern eğitim anlayışıyla öğrencilerimizi geleceğe hazırlıyoruz.',
    facilities: template.facilities || ['Kütüphane', 'Spor Salonu', 'Laboratuvar'],
    logo: baseProfile.logo || `/demo-assets/${schoolType}/logo.svg`,
    coverImage: baseProfile.coverImage || `/demo-assets/${schoolType}/cover.jpg`,
  };

  // Profili veritabanına kaydet
  await db.schema(`tenant_${tenantId}`).from('school_profile').insert(profile);

  return profile;
}
```

#### 3.2 Kullanıcı ve Rol Yapılandırması

```typescript
// lib/demo/configure-users-roles.ts
interface DemoUser {
  fullName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  username: string;
  password: string;
  avatar?: string;
  departments?: string[];
  subjects?: string[];
  class?: string;
  gradeLevel?: number;
  childrenIds?: string[];
}

// Rastgele Türkçe isimler oluşturmak için yardımcı fonksiyon
function generateTurkishName(): { first: string; last: string } {
  const firstNames = {
    male: [
      'Ahmet',
      'Mehmet',
      'Mustafa',
      'Ali',
      'Hüseyin',
      'İbrahim',
      'Hasan',
      'Murat',
      'Ömer',
      'Yusuf',
    ],
    female: [
      'Ayşe',
      'Fatma',
      'Zeynep',
      'Emine',
      'Hatice',
      'Merve',
      'Elif',
      'Esra',
      'Gülsüm',
      'Zehra',
    ],
  };

  const lastNames = [
    'Yılmaz',
    'Kaya',
    'Demir',
    'Çelik',
    'Şahin',
    'Yıldız',
    'Aydın',
    'Özdemir',
    'Arslan',
    'Doğan',
  ];

  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return { first: firstName, last: lastName };
}

// Demo kullanıcıları oluşturma
async function createDemoUsers(
  tenantId: string,
  userCounts: { admins: number; teachers: number; students: number; parents: number }
): Promise<Record<string, DemoUser[]>> {
  const users: Record<string, DemoUser[]> = {
    admins: [],
    teachers: [],
    students: [],
    parents: [],
  };

  // Admin kullanıcıları oluştur
  for (let i = 0; i < userCounts.admins; i++) {
    const name = generateTurkishName();
    const username = `admin${i + 1}`;

    users.admins.push({
      fullName: `${name.first} ${name.last}`,
      email: `${username}@${tenantId}.i-ep.app`,
      role: 'admin',
      username,
      password: `Demo${tenantId}2023!`,
      avatar: `/demo-assets/avatars/admin${(i % 5) + 1}.png`,
    });
  }

  // Öğretmen kullanıcıları oluştur
  const subjects = [
    'Matematik',
    'Türkçe',
    'Fen Bilgisi',
    'Sosyal Bilgiler',
    'İngilizce',
    'Müzik',
    'Beden Eğitimi',
    'Görsel Sanatlar',
    'Tarih',
    'Coğrafya',
    'Fizik',
    'Kimya',
    'Biyoloji',
  ];

  for (let i = 0; i < userCounts.teachers; i++) {
    const name = generateTurkishName();
    const username = `ogretmen${i + 1}`;
    const randomSubjects = [subjects[i % subjects.length]];

    if (i % 3 === 0 && i + 1 < subjects.length) {
      randomSubjects.push(subjects[i + 1]);
    }

    users.teachers.push({
      fullName: `${name.first} ${name.last}`,
      email: `${username}@${tenantId}.i-ep.app`,
      role: 'teacher',
      username,
      password: `Demo${tenantId}2023!`,
      avatar: `/demo-assets/avatars/teacher${(i % 10) + 1}.png`,
      subjects: randomSubjects,
      departments: [i % 5 === 0 ? 'Okul Yönetimi' : 'Öğretmenler'],
    });
  }

  // Öğrenci kullanıcıları oluştur
  const classes = ['A', 'B', 'C', 'D'];
  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  for (let i = 0; i < userCounts.students; i++) {
    const name = generateTurkishName();
    const username = `ogrenci${i + 1}`;
    const gradeLevel =
      grades[Math.floor(i / (userCounts.students / grades.length)) % grades.length];
    const classLetter = classes[i % classes.length];

    users.students.push({
      fullName: `${name.first} ${name.last}`,
      email: `${username}@${tenantId}.i-ep.app`,
      role: 'student',
      username,
      password: `Demo${tenantId}2023!`,
      avatar: `/demo-assets/avatars/student${(i % 20) + 1}.png`,
      class: `${gradeLevel}-${classLetter}`,
      gradeLevel,
    });
  }

  // Veli kullanıcıları oluştur
  for (let i = 0; i < userCounts.parents; i++) {
    const name = generateTurkishName();
    const username = `veli${i + 1}`;

    // Her veliye 1-3 öğrenci ata
    const childrenCount = (i % 3) + 1;
    const childrenIds = [];

    for (let j = 0; j < childrenCount; j++) {
      const studentIndex = (i * childrenCount + j) % users.students.length;
      childrenIds.push(studentIndex.toString());
    }

    users.parents.push({
      fullName: `${name.first} ${name.last}`,
      email: `${username}@${tenantId}.i-ep.app`,
      role: 'parent',
      username,
      password: `Demo${tenantId}2023!`,
      avatar: `/demo-assets/avatars/parent${(i % 10) + 1}.png`,
      childrenIds,
    });
  }

  // Kullanıcıları veritabanına kaydet
  for (const role in users) {
    await db
      .schema(`tenant_${tenantId}`)
      .from('users')
      .insert(
        users[role].map((user) => ({
          full_name: user.fullName,
          email: user.email,
          role: user.role,
          username: user.username,
          password_hash: hashPassword(user.password),
          avatar: user.avatar,
          created_at: new Date(),
          updated_at: new Date(),
        }))
      );

    // Role özgü ek bilgileri kaydet
    if (role === 'teachers') {
      await saveTeacherDetails(tenantId, users.teachers);
    } else if (role === 'students') {
      await saveStudentDetails(tenantId, users.students);
    } else if (role === 'parents') {
      await saveParentDetails(tenantId, users.parents);
    }
  }

  return users;
}
```

#### 3.3 Demo İçerik Yapılandırması

```typescript
// lib/demo/configure-demo-content.ts
interface DemoContent {
  announcements: {
    title: string;
    content: string;
    publishDate: Date;
    author: string;
    targetAudience: string[];
  }[];
  events: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    organizer: string;
    participantGroups: string[];
  }[];
  assignments: {
    title: string;
    description: string;
    subject: string;
    class: string;
    assignedBy: string;
    dueDate: Date;
    attachments: string[];
  }[];
  exams: {
    title: string;
    subject: string;
    class: string;
    date: Date;
    duration: number; // dakika
    totalPoints: number;
    content: string;
  }[];
}

// Demo içerik şablonları
const demoContentTemplates: Record<string, Partial<DemoContent>> = {
  ilkokul: {
    announcements: [
      {
        title: 'Veli Toplantısı Duyurusu',
        content:
          "Değerli velilerimiz, 15 Ekim Cuma günü saat 15:00'te okulumuzda veli toplantısı düzenlenecektir. Tüm velilerimizin katılımını bekliyoruz.",
        publishDate: new Date(),
        author: 'Okul Müdürlüğü',
        targetAudience: ['parents'],
      },
      {
        title: 'Kitap Okuma Etkinliği',
        content:
          'Öğrencilerimizin okuma alışkanlığını geliştirmek amacıyla her gün 20 dakika kitap okuma etkinliği başlatıyoruz.',
        publishDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        author: 'Türkçe Zümresi',
        targetAudience: ['students', 'parents', 'teachers'],
      },
    ],
    events: [
      {
        title: '29 Ekim Cumhuriyet Bayramı Kutlaması',
        description:
          'Cumhuriyet Bayramı kutlamaları kapsamında okulumuzda tören ve etkinlikler düzenlenecektir.',
        startDate: new Date(new Date().getFullYear(), 9, 29, 10, 0), // 29 Ekim 10:00
        endDate: new Date(new Date().getFullYear(), 9, 29, 12, 0), // 29 Ekim 12:00
        location: 'Okul Bahçesi',
        organizer: 'Okul Müdürlüğü',
        participantGroups: ['all'],
      },
    ],
    assignments: [
      {
        title: 'Çarpım Tablosu Alıştırmaları',
        description: 'Çarpım tablosunu ezberlemek için verilen alıştırmaları tamamlayınız.',
        subject: 'Matematik',
        class: '3-A',
        assignedBy: 'Ayşe Yılmaz',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta sonra
        attachments: ['/demo-assets/assignments/carpim-tablosu.pdf'],
      },
    ],
  },

  lise: {
    announcements: [
      {
        title: 'YKS Bilgilendirme Toplantısı',
        content:
          "Değerli 12. sınıf öğrencilerimiz ve velileri, YKS sınav sistemi ve başvuru süreci hakkında bilgilendirme toplantısı 20 Ekim Çarşamba günü saat 16:00'da konferans salonumuzda yapılacaktır.",
        publishDate: new Date(),
        author: 'Rehberlik Servisi',
        targetAudience: ['students', 'parents'],
      },
    ],
    events: [
      {
        title: 'Üniversite Tanıtım Günleri',
        description:
          'Çeşitli üniversitelerin katılımıyla düzenlenecek tanıtım etkinliğinde, bölümler ve kariyer seçenekleri hakkında bilgi alabilirsiniz.',
        startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 gün sonra
        endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // 17 gün sonra
        location: 'Okul Konferans Salonu',
        organizer: 'Rehberlik Servisi',
        participantGroups: ['11-A', '11-B', '11-C', '12-A', '12-B', '12-C'],
      },
    ],
    exams: [
      {
        title: 'Türev Konusu Deneme Sınavı',
        subject: 'Matematik',
        class: '12-A',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 gün sonra
        duration: 90, // 90 dakika
        totalPoints: 100,
        content: 'Türev konusundaki temel kavramlar, türev alma kuralları ve uygulamaları.',
      },
    ],
  },
};

// Demo içerik oluşturma fonksiyonu
async function createDemoContent(
  tenantId: string,
  schoolType: string,
  userMap: Record<string, any[]>
): Promise<void> {
  // Okul tipine göre şablon seç
  const template = demoContentTemplates[schoolType] || demoContentTemplates.ilkokul;

  // Duyurular
  if (template.announcements) {
    for (const announcement of template.announcements) {
      const adminUser = userMap.admins[0] || { id: 'system' };

      await db
        .schema(`tenant_${tenantId}`)
        .from('announcements')
        .insert({
          title: announcement.title,
          content: announcement.content,
          published_at: announcement.publishDate,
          author_id: adminUser.id,
          target_audience: JSON.stringify(announcement.targetAudience),
          created_at: new Date(),
          updated_at: new Date(),
        });
    }
  }

  // Etkinlikler
  if (template.events) {
    for (const event of template.events) {
      const adminUser = userMap.admins[0] || { id: 'system' };

      await db
        .schema(`tenant_${tenantId}`)
        .from('events')
        .insert({
          title: event.title,
          description: event.description,
          start_date: event.startDate,
          end_date: event.endDate,
          location: event.location,
          organizer_id: adminUser.id,
          participant_groups: JSON.stringify(event.participantGroups),
          created_at: new Date(),
          updated_at: new Date(),
        });
    }
  }

  // Ödevler
  if (template.assignments) {
    for (const assignment of template.assignments) {
      const teacher =
        userMap.teachers.find((t) => t.fullName === assignment.assignedBy) || userMap.teachers[0];

      await db
        .schema(`tenant_${tenantId}`)
        .from('assignments')
        .insert({
          title: assignment.title,
          description: assignment.description,
          subject: assignment.subject,
          class: assignment.class,
          assigned_by: teacher.id,
          due_date: assignment.dueDate,
          attachments: JSON.stringify(assignment.attachments),
          created_at: new Date(),
          updated_at: new Date(),
        });
    }
  }

  // Sınavlar
  if (template.exams) {
    for (const exam of template.exams) {
      const teacher =
        userMap.teachers.find((t) => t.subjects && t.subjects.includes(exam.subject)) ||
        userMap.teachers[0];

      await db.schema(`tenant_${tenantId}`).from('exams').insert({
        title: exam.title,
        subject: exam.subject,
        class: exam.class,
        exam_date: exam.date,
        duration: exam.duration,
        total_points: exam.totalPoints,
        content: exam.content,
        created_by: teacher.id,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }
}
```

### 4. Demo Tenant Yönetimi

#### 4.1 Demo Erişim Kontrolü

```typescript
// lib/demo/demo-access-control.ts
interface DemoAccessConfig {
  tenant_id: string;
  access_code?: string;
  expiration_date: Date;
  max_users: number;
  allowed_emails?: string[];
  allowed_ip_addresses?: string[];
  is_public: boolean;
  is_active: boolean;
  access_restrictions: {
    preventDataDeletion: boolean;
    preventConfigChanges: boolean;
    showDemoWatermark: boolean;
    limitApiRequests: boolean;
    maxApiRequestsPerDay: number;
    restrictedFeatures: string[];
  };
  visit_stats: {
    total_visits: number;
    unique_visitors: number;
    last_visit_date: Date;
  };
}

// Demo erişimi doğrulama
async function validateDemoAccess(
  tenantId: string,
  userEmail?: string,
  accessCode?: string,
  ipAddress?: string
): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  // Tenant bilgilerini al
  const tenant = await db.tenants.findOne({ id: tenantId, type: 'demo' });

  if (!tenant) {
    return { allowed: false, reason: 'Demo tenant bulunamadı' };
  }

  // Demo tenant aktif mi?
  if (!tenant.is_active) {
    return { allowed: false, reason: 'Bu demo tenant aktif değil' };
  }

  // Demo süresi dolmuş mu?
  if (new Date() > tenant.expiration_date) {
    return { allowed: false, reason: 'Demo süresi dolmuştur' };
  }

  // Erişim kodu kontrolü
  if (tenant.access_code && tenant.access_code !== accessCode) {
    return { allowed: false, reason: 'Geçersiz erişim kodu' };
  }

  // E-posta kontrolü
  if (tenant.allowed_emails && tenant.allowed_emails.length > 0) {
    if (!userEmail || !tenant.allowed_emails.includes(userEmail)) {
      return { allowed: false, reason: 'Bu e-posta adresi demo erişimine yetkili değil' };
    }
  }

  // IP adresi kontrolü
  if (tenant.allowed_ip_addresses && tenant.allowed_ip_addresses.length > 0) {
    if (!ipAddress || !tenant.allowed_ip_addresses.includes(ipAddress)) {
      return { allowed: false, reason: 'Bu IP adresi demo erişimine yetkili değil' };
    }
  }

  // Maksimum kullanıcı sayısı kontrolü
  const currentUserCount = await db
    .schema(`tenant_${tenantId}`)
    .from('active_sessions')
    .countDistinct('user_id');

  if (currentUserCount >= tenant.max_users) {
    return { allowed: false, reason: 'Maksimum eşzamanlı kullanıcı sayısına ulaşıldı' };
  }

  // Erişime izin ver ve istatistikleri güncelle
  await updateDemoVisitStats(tenantId, userEmail, ipAddress);

  return { allowed: true };
}

// Demo ziyaret istatistiklerini güncelleme
async function updateDemoVisitStats(
  tenantId: string,
  userEmail?: string,
  ipAddress?: string
): Promise<void> {
  const now = new Date();

  // Ziyaret kaydı oluştur
  await db.demo_visits.insert({
    tenant_id: tenantId,
    user_email: userEmail,
    ip_address: ipAddress,
    visit_date: now,
  });

  // Toplam ve benzersiz ziyaretçi sayısını güncelle
  const uniqueVisitorsCount = await db.demo_visits
    .where({ tenant_id: tenantId })
    .countDistinct(['user_email', 'ip_address']);

  await db.tenants.update(
    { id: tenantId },
    {
      'visit_stats.total_visits': db.raw('visit_stats.total_visits + 1'),
      'visit_stats.unique_visitors': uniqueVisitorsCount,
      'visit_stats.last_visit_date': now,
    }
  );
}
```

#### 4.2 Demo Otomatik Sıfırlama

```typescript
// lib/demo/demo-reset.ts
interface DemoResetConfig {
  tenant_id: string;
  reset_frequency: 'never' | 'daily' | 'weekly' | 'monthly';
  last_reset_date: Date;
  next_reset_date: Date;
  reset_time: string; // "HH:MM" formatında
  preserve_settings: boolean;
  preserve_admin_accounts: boolean;
  send_notification_before: boolean;
  notification_hours_before: number;
}

// Demo tenant sıfırlama
async function resetDemoTenant(
  tenantId: string,
  options: {
    preserveSettings?: boolean;
    preserveAdminAccounts?: boolean;
  } = {}
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`Demo tenant sıfırlanıyor: ${tenantId}`);

    // Mevcut tenant yapılandırmasını yedekle
    const tenant = await db.tenants.findOne({ id: tenantId, type: 'demo' });

    if (!tenant) {
      return { success: false, error: 'Demo tenant bulunamadı' };
    }

    // Admin hesaplarını yedekle (istenirse)
    let adminAccounts = [];
    if (options.preserveAdminAccounts) {
      adminAccounts = await db
        .schema(`tenant_${tenantId}`)
        .from('users')
        .where({ role: 'admin' })
        .select('*');
    }

    // Tenant ayarlarını yedekle (istenirse)
    let tenantSettings = null;
    if (options.preserveSettings) {
      tenantSettings = await db.schema(`tenant_${tenantId}`).from('settings').select('*');
    }

    // Tenant şemasını sıfırla
    await db.raw(`DROP SCHEMA "tenant_${tenantId}" CASCADE`);
    await db.raw(`CREATE SCHEMA "tenant_${tenantId}"`);

    // Tabloları yeniden oluştur
    await migrateSchema(`tenant_${tenantId}`);

    // Demo veri setini tekrar yükle
    await loadDemoData(tenantId, tenant.demo_data_set);

    // Admin hesaplarını geri yükle (istenirse)
    if (options.preserveAdminAccounts && adminAccounts.length > 0) {
      await db.schema(`tenant_${tenantId}`).from('users').insert(adminAccounts);
    }

    // Tenant ayarlarını geri yükle (istenirse)
    if (options.preserveSettings && tenantSettings) {
      await db.schema(`tenant_${tenantId}`).from('settings').insert(tenantSettings);
    }

    // Sıfırlama bilgilerini güncelle
    const now = new Date();
    const nextResetDate = calculateNextResetDate(tenant.reset_frequency, now);

    await db.tenants.update(
      { id: tenantId },
      {
        last_reset_date: now,
        next_reset_date: nextResetDate,
      }
    );

    console.log(`Demo tenant başarıyla sıfırlandı: ${tenantId}`);

    return { success: true };
  } catch (error) {
    console.error(`Demo tenant sıfırlama hatası: ${tenantId}`, error);
    return { success: false, error: error.message };
  }
}

// Bir sonraki sıfırlama tarihini hesaplama
function calculateNextResetDate(
  resetFrequency: DemoResetConfig['reset_frequency'],
  fromDate: Date = new Date()
): Date {
  const result = new Date(fromDate);

  switch (resetFrequency) {
    case 'daily':
      result.setDate(result.getDate() + 1);
      break;
    case 'weekly':
      result.setDate(result.getDate() + 7);
      break;
    case 'monthly':
      result.setMonth(result.getMonth() + 1);
      break;
    case 'never':
    default:
      // Sıfırlama yapılmayacaksa çok uzak bir tarih ayarla
      result.setFullYear(result.getFullYear() + 10);
      break;
  }

  return result;
}

// Zamanlanmış demo sıfırlamaları kontrol etme (cron job ile çalıştırılır)
async function checkScheduledDemoResets(): Promise<void> {
  const now = new Date();

  // Sıfırlanma zamanı gelen demo tenant'ları bul
  const tenantsToReset = await db.tenants.find({
    type: 'demo',
    is_active: true,
    next_reset_date: { $lte: now },
  });

  console.log(`${tenantsToReset.length} demo tenant sıfırlanacak`);

  // Her tenant için sıfırlama işlemi başlat
  for (const tenant of tenantsToReset) {
    await resetDemoTenant(tenant.id, {
      preserveSettings: tenant.preserve_settings,
      preserveAdminAccounts: tenant.preserve_admin_accounts,
    });

    // Bildirim gönder
    await sendDemoResetNotification(tenant.id);
  }

  // Yaklaşan sıfırlamalar için bildirim gönder
  await sendUpcomingResetNotifications();
}

// Yaklaşan sıfırlamalar için bildirim gönderme
async function sendUpcomingResetNotifications(): Promise<void> {
  const now = new Date();

  // Bildirim gönderilecek tenant'ları bul
  const tenants = await db.tenants.find({
    type: 'demo',
    is_active: true,
    send_notification_before: true,
    next_reset_date: {
      $gt: now,
      $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 saat içinde
    },
  });

  for (const tenant of tenants) {
    // Son bildirim zamanını kontrol et
    const lastNotificationKey = `reset_notification:${tenant.id}`;
    const lastNotification = await cache.get(lastNotificationKey);

    if (!lastNotification) {
      // Bildirim gönder
      await sendUpcomingResetNotification(tenant.id, tenant.next_reset_date);

      // Son bildirim zamanını cache'e kaydet (tekrar bildirim göndermemek için)
      await cache.set(lastNotificationKey, new Date().toISOString(), 60 * 60 * 24); // 24 saat sakla
    }
  }
}
```

#### 4.3 Demo Kiracı Analitikleri

```typescript
// lib/demo/demo-analytics.ts
interface DemoAnalytics {
  tenant_id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'total';
  start_date: Date;
  end_date: Date;
  visits: {
    total: number;
    unique: number;
    by_source: Record<string, number>;
    by_device: Record<string, number>;
  };
  users: {
    total: number;
    by_role: Record<string, number>;
    active: number;
    conversion_rate: number;
  };
  feature_usage: {
    most_used: string[];
    least_used: string[];
    usage_by_feature: Record<string, number>;
  };
  interactions: {
    total: number;
    avg_session_duration: number;
    avg_pages_per_session: number;
    bounce_rate: number;
  };
  conversion: {
    views_to_signup: number;
    signup_to_paid: number;
    overall_conversion: number;
  };
}

// Demo analitiklerini oluşturma
async function generateDemoAnalytics(
  tenantId: string,
  period: DemoAnalytics['period'] = 'total',
  customDateRange?: { start: Date; end: Date }
): Promise<DemoAnalytics> {
  // Tarih aralığını belirle
  const now = new Date();
  let startDate: Date,
    endDate: Date = now;

  if (customDateRange) {
    startDate = customDateRange.start;
    endDate = customDateRange.end;
  } else {
    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'total':
      default:
        const tenant = await db.tenants.findOne({ id: tenantId });
        startDate = tenant.created_at;
        break;
    }
  }

  // Ziyaret istatistiklerini al
  const visitStats = await getVisitStats(tenantId, startDate, endDate);

  // Kullanıcı istatistiklerini al
  const userStats = await getUserStats(tenantId, startDate, endDate);

  // Özellik kullanım istatistiklerini al
  const featureUsageStats = await getFeatureUsageStats(tenantId, startDate, endDate);

  // Etkileşim istatistiklerini al
  const interactionStats = await getInteractionStats(tenantId, startDate, endDate);

  // Dönüşüm oranlarını hesapla
  const conversionStats = await getConversionStats(tenantId, startDate, endDate);

  return {
    tenant_id: tenantId,
    period,
    start_date: startDate,
    end_date: endDate,
    visits: visitStats,
    users: userStats,
    feature_usage: featureUsageStats,
    interactions: interactionStats,
    conversion: conversionStats,
  };
}

// Demo analitiklerini dashboard için formatlama
function formatDemoAnalyticsForDashboard(analytics: DemoAnalytics): any {
  return {
    summaryCards: [
      {
        title: 'Toplam Ziyaret',
        value: analytics.visits.total,
        change: calculateChange(analytics.visits.total, analytics.period),
        icon: 'users',
      },
      {
        title: 'Ortalama Oturum Süresi',
        value: formatDuration(analytics.interactions.avg_session_duration),
        change: calculateChange(analytics.interactions.avg_session_duration, analytics.period),
        icon: 'clock',
      },
      {
        title: 'Konversiyon Oranı',
        value: `%${(analytics.conversion.overall_conversion * 100).toFixed(2)}`,
        change: calculateChange(analytics.conversion.overall_conversion, analytics.period),
        icon: 'conversion',
      },
      {
        title: 'Aktif Kullanıcılar',
        value: analytics.users.active,
        change: calculateChange(analytics.users.active, analytics.period),
        icon: 'active-users',
      },
    ],
    charts: {
      visitsOverTime: generateVisitsOverTimeChart(analytics),
      featureUsageDistribution: generateFeatureUsageChart(analytics),
      userRoleDistribution: generateUserRoleChart(analytics),
      conversionFunnel: generateConversionFunnelChart(analytics),
    },
    tables: {
      topFeatures: analytics.feature_usage.most_used.map((feature, index) => ({
        rank: index + 1,
        feature,
        usageCount: analytics.feature_usage.usage_by_feature[feature] || 0,
      })),
      deviceDistribution: Object.entries(analytics.visits.by_device).map(([device, count]) => ({
        device,
        count,
        percentage: ((count / analytics.visits.total) * 100).toFixed(2),
      })),
    },
  };
}
```

### Demo Tenant İçin Satış ve Pazarlama Senaryoları

#### Satış Demosu İçin Kullanım Senaryoları

Potansiyel müşterilere yapılacak gösterimler için örnek senaryolar:

##### Senaryo 1: Okul Yönetimi İş Akışı

**Hedef Kitle**: Okul Müdürleri ve Yöneticiler

**Senaryo Adımları**:

1. Okul profili yapılandırması ve branding
2. Bölüm ve sınıf yapısı oluşturma
3. Öğretmen ve personel yönetimi
4. Akademik takvim oluşturma ve etkinlik planlama
5. Dashboard ve raporlarla okul performansını analiz etme

**Demo Notları**:

- Branding özelliklerini vurgulayın (logo, renkler, özel domain)
- Çoklu şube/kampüs yönetimi özelliklerini gösterin
- MEB raporlama entegrasyonunu vurgulayın

##### Senaryo 2: Öğretmen İş Akışı

**Hedef Kitle**: Öğretmenler ve Bölüm Başkanları

**Senaryo Adımları**:

1. Ders programı görüntüleme ve yönetme
2. Ödev oluşturma ve değerlendirme
3. Sınav oluşturma, not girişi ve analizi
4. Öğrenci devam takibi
5. Veli iletişimi ve geri bildirim

**Demo Notları**:

- Toplu işlem özelliklerini vurgulayın (toplu not girişi, toplu mesaj)
- Mobil uygulama erişimini gösterin
- Rapor ve analizlerin kolaylığını vurgulayın

##### Senaryo 3: Veli Katılımı İş Akışı

**Hedef Kitle**: Veliler ve Okul Aile Birliği

**Senaryo Adımları**:

1. Veli portala erişim ve mobil uygulama tanıtımı
2. Öğrenci performans takibi ve raporlar
3. Öğretmenlerle iletişim
4. Duyuru ve etkinliklere erişim
5. Ödev ve sınav takibi

**Demo Notları**:

- Gerçek zamanlı bildirim sistemini vurgulayın
- Velilerin çoklu çocuk yönetimini gösterin
- Mobil deneyimin sadeliğini vurgulayın

#### Demo Dashboard

Satış ekibinin demo tenant performansını izlemesi için özel bir dahboard:

```typescript
// lib/demo/demo-dashboard.ts
interface DemoDashboardData {
  activeDemos: {
    total: number;
    byType: {
      sales: number;
      selfService: number;
      training: number;
    };
    byStatus: {
      active: number;
      expired: number;
      scheduled: number;
    };
  };
  performance: {
    totalVisits: number;
    uniqueVisitors: number;
    avgTimeSpent: number;
    mostVisitedFeatures: string[];
    conversionRate: number;
  };
  tenants: {
    id: string;
    name: string;
    type: string;
    createdAt: Date;
    expiresAt: Date;
    lastActivity: Date;
    visits: number;
    potentialScore: number;
  }[];
}

// Demo dashboard verilerini toplama
async function getDemoDashboardData(): Promise<DemoDashboardData> {
  // Aktif demo tenant'ları al
  const demoTenants = await db.tenants.find({ type: 'demo' });

  // Demo tipine göre istatistikler
  const byType = {
    sales: demoTenants.filter((t) => t.demo_type === 'sales').length,
    selfService: demoTenants.filter((t) => t.demo_type === 'self-service').length,
    training: demoTenants.filter((t) => t.demo_type === 'training').length,
  };

  // Duruma göre istatistikler
  const now = new Date();
  const byStatus = {
    active: demoTenants.filter((t) => t.is_active && t.expiration_date > now).length,
    expired: demoTenants.filter((t) => t.expiration_date <= now).length,
    scheduled: demoTenants.filter((t) => t.is_active && t.created_at > now).length,
  };

  // Performans istatistikleri
  const totalVisits = await db.demo_visits.count();
  const uniqueVisitors = await db.demo_visits.countDistinct(['user_email', 'ip_address']);

  // Ortalama geçirilen zaman
  const sessionsData = await db.demo_sessions.find();
  const avgTimeSpent =
    sessionsData.reduce((acc, session) => {
      const duration = session.end_time
        ? (session.end_time.getTime() - session.start_time.getTime()) / 1000
        : 0;
      return acc + duration;
    }, 0) / Math.max(sessionsData.length, 1);

  // En çok ziyaret edilen özellikler
  const featureUsage = await db.demo_feature_usage.aggregate([
    { $group: { _id: '$feature_name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const mostVisitedFeatures = featureUsage.map((f) => f._id);

  // Dönüşüm oranı
  const demoToSignupCount = await db.tenants.count({
    previous_demo_id: { $in: demoTenants.map((t) => t.id) },
  });

  const conversionRate = demoTenants.length > 0 ? demoToSignupCount / demoTenants.length : 0;

  // Tenant detaylı bilgiler
  const tenantDetails = await Promise.all(
    demoTenants.map(async (tenant) => {
      const visits = await db.demo_visits.count({ tenant_id: tenant.id });
      const lastActivity = await db.demo_visits
        .find({ tenant_id: tenant.id })
        .sort({ visit_date: -1 })
        .limit(1)
        .then((results) => results[0]?.visit_date || tenant.created_at);

      // Potansiyel skoru hesapla (basit bir algoritma)
      let potentialScore = 0;

      // Ziyaret sayısı faktörü
      potentialScore += Math.min(visits / 5, 20); // Maksimum 20 puan

      // Son aktivite faktörü
      const daysSinceLastActivity = Math.max(
        0,
        (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      potentialScore += Math.max(0, 20 - daysSinceLastActivity); // Maksimum 20 puan

      // Demo tipi faktörü
      if (tenant.demo_type === 'sales') potentialScore += 20;
      if (tenant.demo_type === 'self-service') potentialScore += 10;

      // Özellik kullanım faktörü
      const featureUsageCount = await db.demo_feature_usage.count({ tenant_id: tenant.id });
      potentialScore += Math.min(featureUsageCount / 10, 20); // Maksimum 20 puan

      // Birden çok kullanıcı faktörü
      const uniqueUserCount = await db.demo_visits
        .find({ tenant_id: tenant.id })
        .countDistinct('user_email');
      potentialScore += Math.min(uniqueUserCount * 5, 20); // Maksimum 20 puan

      return {
        id: tenant.id,
        name: tenant.name,
        type: tenant.demo_type,
        createdAt: tenant.created_at,
        expiresAt: tenant.expiration_date,
        lastActivity,
        visits,
        potentialScore: Math.round(potentialScore),
      };
    })
  );

  return {
    activeDemos: {
      total: demoTenants.length,
      byType,
      byStatus,
    },
    performance: {
      totalVisits,
      uniqueVisitors,
      avgTimeSpent,
      mostVisitedFeatures,
      conversionRate,
    },
    tenants: tenantDetails,
  };
}
```

## Sürdürülebilir Demo Ortamı

#### Demo Ortamı Bakımı

Demo ortamlarının düzenli bakımı ve güncellemesi için yapılması gereken aktiviteler:

1. **Periyodik İçerik Güncellemeleri**:
   - Mevcut demo senaryolarını güncelleme
   - Sık sorulan sorular ve eğitim içeriklerini güncelleme
   - Mevsimsel/dönemsel içerikleri yenileme

2. **Teknik Bakım**:
   - Demo veritabanı optimizasyonu
   - Eski ve kullanılmayan demo tenant'ların temizlenmesi
   - Demo ortamı kaynaklarının izlenmesi ve optimizasyonu

3. **Demo Verimlilik Değerlendirmesi**:
   - Hangi demo özellikleri ve senaryoların daha etkili olduğunu analiz etme
   - Demo ortamının abonelik dönüşüm oranına etkisini ölçme
   - Satış ekibinden demo etkinliği hakkında geri bildirim alma

#### Demo Yönetim Takımı Rolleri ve Sorumlulukları

## Demo Yönetim Takımı Rolleri

### Demo Ortam Yöneticisi

- Demo ortamının genel sağlığından ve yönetiminden sorumlu
- Demo yapılandırmalarını ve politikalarını belirleme
- Demo performans metriklerini izleme ve raporlama

### Demo İçerik Uzmanı

- Demo senaryolarını ve içeriklerini oluşturma ve güncelleme
- Gerçekçi ve etkileyici demo verilerini hazırlama
- Sektöre özgü demo varyantlarını geliştirme

### Demo Teknik Destek Uzmanı

- Demo ortamında teknik sorunları çözme
- Demo tenant'ları oluşturma ve yapılandırma
- Demo ortamının teknik bakımını yapma

### Satış Demo Koçu

- Satış ekibine demo gösterimi eğitimi verme
- En etkili demo senaryolarını ve konuşma noktalarını belirleme
- Demo gösterimlerinden geri bildirim toplama ve iyileştirmeler önerme

### Başarılı Bir Demo Stratejisi İçin Püf Noktaları

#### En İyi Uygulamalar

1. **Basit ve Anlaşılır Olun**:
   - Karmaşık özellikler yerine en değerli özelliklere odaklanın
   - Teknik jargon yerine müşteri dilini kullanın

2. **Hikaye Anlatımına Odaklanın**:
   - Sadece özellikleri göstermek yerine, problemleri nasıl çözdüğünü anlatın
   - Gerçek dünya senaryoları üzerinden ilerleyin

3. **Kişiselleştirin**:
   - Demo'yu her potansiyel müşterinin ihtiyaçlarına göre uyarlayın
   - Müşterinin kendi verilerini/isimlerini demo'da kullanın

4. **Katılımı Teşvik Edin**:
   - Demo sırasında sorular sorun
   - Gerekirse kontrollü "pratik yapma" anları yaratın

5. **Gerçekçi Olun**:
   - Aşırı hazırlanmış, "kusursuz" demolar şüphe uyandırabilir
   - Gerçek hayatta karşılaşılabilecek sorunlardan ve çözümlerinden bahsedin

### Demo Sonrası Takip

```typescript
// lib/demo/demo-followup.ts
interface DemoFollowupTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  delay_hours: number;
  trigger_event: 'demo_creation' | 'first_login' | 'feature_usage' | 'demo_expiry';
  segmentation?: {
    demo_type?: string[];
    feature_used?: string[];
    minimum_visits?: number;
  };
}

const demoFollowupTemplates: DemoFollowupTemplate[] = [
  {
    id: 'welcome',
    name: 'Demo Hoş Geldiniz',
    subject: '{{tenant.name}} - Demo Hesabınız Kullanıma Hazır',
    body: `
Merhaba {{user.name}},

Iqra Eğitim Portalı demo hesabınız kullanıma hazır! Aşağıdaki bilgilerle giriş yapabilirsiniz:

URL: https://{{tenant.subdomain}}.i-ep.app
Kullanıcı Adı: {{user.email}}
Şifre: {{user.password}}

Demo hesabınız {{tenant.expiry_date}} tarihine kadar aktif olacaktır.

İyi çalışmalar,
Iqra Eğitim Portalı Ekibi
    `,
    delay_hours: 0,
    trigger_event: 'demo_creation',
  },
  {
    id: 'first_login_followup',
    name: 'İlk Giriş Sonrası Takip',
    subject: '{{tenant.name}} - Demo Deneyiminiz Nasıl Gidiyor?',
    body: `
Merhaba {{user.name}},

Iqra Eğitim Portalı demo hesabınıza ilk girişinizi yaptığınızı gördük. Umarız platformumuzu keşfetmeye başlamışsınızdır.

Keşfetmenizi önerdiğimiz bazı özellikler:
- Öğrenci ve sınıf yönetimi
- Ders programı oluşturma
- Veli iletişim araçları

Herhangi bir sorunuz veya yardıma ihtiyacınız olursa, demo hesabınızdaki "Yardım" bölümünden bize ulaşabilirsiniz.

İyi çalışmalar,
Iqra Eğitim Portalı Ekibi
    `,
    delay_hours: 2,
    trigger_event: 'first_login',
  },
  {
    id: 'feature_usage_academic',
    name: 'Akademik Özellik Kullanımı Sonrası',
    subject: '{{tenant.name}} - Akademik Özellikleri Nasıl Buldunuz?',
    body: `
Merhaba {{user.name}},

Iqra Eğitim Portalı'nın akademik yönetim özelliklerini kullandığınızı gördük. Bu özellikler hakkında ne düşündüğünü öğrenmek isteriz.

Premium planımızda aşağıdaki ek akademik özellikler de bulunmaktadır:
- Gelişmiş sınav analiz araçları
- Kişiselleştirilmiş öğrenci gelişim raporları
- Akademik takvim entegrasyonu

Bu özellikleri detaylı görmek ister misiniz? Bize yanıt vererek özel bir demo randevusu alabilirsiniz.

İyi çalışmalar,
Iqra Eğitim Portalı Ekibi
    `,
    delay_hours: 24,
    trigger_event: 'feature_usage',
    segmentation: {
      feature_used: ['academics', 'exams', 'grading'],
    },
  },
  {
    id: 'expiry_reminder',
    name: 'Süre Sonu Hatırlatma',
    subject: '{{tenant.name}} - Demo Süreniz Yakında Doluyor',
    body: `
Merhaba {{user.name}},

Iqra Eğitim Portalı demo hesabınızın süresi {{tenant.days_left}} gün içinde dolacak. Demo deneyiminizin nasıl gittiğini öğrenmek isteriz.

Eğer platformumuzu beğendiyseniz ve okul yönetim süreçlerinizi Iqra Eğitim Portalı ile dijitalleştirmek istiyorsanız, aşağıdaki bağlantıdan uygun abonelik planlarımızı inceleyebilirsiniz:

https://i-ep.app/tr/fiyatlandirma

Sorularınız için bizimle iletişime geçebilirsiniz.

İyi çalışmalar,
Iqra Eğitim Portalı Ekibi
    `,
    delay_hours: 72,
    trigger_event: 'demo_expiry',
  },
];

// Demo takip e-postası gönderme
async function sendDemoFollowupEmail(
  tenantId: string,
  templateId: string,
  userId: string
): Promise<boolean> {
  try {
    // Template bul
    const template = demoFollowupTemplates.find((t) => t.id === templateId);

    if (!template) {
      console.error(`Template bulunamadı: ${templateId}`);
      return false;
    }

    // Tenant ve kullanıcı bilgilerini al
    const tenant = await db.tenants.findOne({ id: tenantId });
    const user = await db.schema(`tenant_${tenantId}`).from('users').findOne({ id: userId });

    if (!tenant || !user) {
      console.error(`Tenant veya kullanıcı bulunamadı: ${tenantId}, ${userId}`);
      return false;
    }

    // Template değişkenlerini doldur
    const subject = replaceTemplateVariables(template.subject, { tenant, user });
    const body = replaceTemplateVariables(template.body, { tenant, user });

    // E-posta gönder
    await emailService.send({
      to: user.email,
      subject,
      body,
      template: 'demo-followup',
    });

    // Takip kaydı oluştur
    await db.demo_followups.insert({
      tenant_id: tenantId,
      user_id: userId,
      template_id: templateId,
      sent_at: new Date(),
      email: user.email,
    });

    return true;
  } catch (error) {
    console.error(`Demo takip e-postası gönderme hatası:`, error);
    return false;
  }
}

// Template değişkenlerini değiştirme
function replaceTemplateVariables(text: string, data: { tenant: any; user: any }): string {
  let result = text;

  // Tenant değişkenleri
  result = result.replace(/\{\{tenant\.name\}\}/g, data.tenant.name || '');
  result = result.replace(/\{\{tenant\.subdomain\}\}/g, data.tenant.subdomain || '');
  result = result.replace(
    /\{\{tenant\.expiry_date\}\}/g,
    formatDate(data.tenant.expiration_date) || ''
  );

  // Kalan gün sayısını hesapla
  const now = new Date();
  const daysLeft = Math.ceil(
    (data.tenant.expiration_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  result = result.replace(/\{\{tenant\.days_left\}\}/g, String(daysLeft) || '');

  // Kullanıcı değişkenleri
  result = result.replace(/\{\{user\.name\}\}/g, data.user.full_name || '');
  result = result.replace(/\{\{user\.email\}\}/g, data.user.email || '');
  result = result.replace(/\{\{user\.password\}\}/g, data.user.demo_password || '******');

  return result;
}
```

## Teknik Sınırlamalar ve Güvenlik

### Demo Tenant Sınırlamaları

Demo tenant'lar için uygulanan teknik sınırlamalar:

```typescript
// lib/demo/demo-limitations.ts
interface DemoLimitations {
  data_limitations: {
    max_users: number;
    max_students: number;
    max_classes: number;
    max_storage_mb: number;
    max_file_size_mb: number;
  };
  feature_limitations: {
    disabled_features: string[];
    restricted_features: string[];
    reduced_functionality: Record<string, string>;
  };
  security_limitations: {
    ip_restrictions: boolean;
    max_api_calls_per_day: number;
    disabled_exports: boolean;
    disabled_bulk_operations: boolean;
  };
  ui_limitations: {
    show_demo_badge: boolean;
    show_expiry_notice: boolean;
    watermark_exports: boolean;
    disable_white_labeling: boolean;
  };
}

// Demo türlerine göre sınırlamalar
const demoTypeLimitations: Record<string, DemoLimitations> = {
  sales: {
    data_limitations: {
      max_users: 50,
      max_students: 500,
      max_classes: 30,
      max_storage_mb: 1000,
      max_file_size_mb: 25,
    },
    feature_limitations: {
      disabled_features: ['external_api', 'data_export', 'bulk_delete'],
      restricted_features: ['custom_reports', 'integrations'],
      reduced_functionality: {
        analytics: 'Sınırlı veri aralığı ve metrikler',
        reporting: 'Sadece temel raporlar',
      },
    },
    security_limitations: {
      ip_restrictions: false,
      max_api_calls_per_day: 1000,
      disabled_exports: true,
      disabled_bulk_operations: true,
    },
    ui_limitations: {
      show_demo_badge: true,
      show_expiry_notice: true,
      watermark_exports: true,
      disable_white_labeling: false,
    },
  },

  'self-service': {
    data_limitations: {
      max_users: 20,
      max_students: 150,
      max_classes: 10,
      max_storage_mb: 250,
      max_file_size_mb: 10,
    },
    feature_limitations: {
      disabled_features: ['external_api', 'data_export', 'bulk_operations', 'advanced_analytics'],
      restricted_features: ['custom_reports', 'integrations', 'white_labeling'],
      reduced_functionality: {
        analytics: 'Basit metrikler',
        reporting: 'Sadece temel raporlar',
        communication: 'Sınırlı mesaj sayısı',
      },
    },
    security_limitations: {
      ip_restrictions: false,
      max_api_calls_per_day: 250,
      disabled_exports: true,
      disabled_bulk_operations: true,
    },
    ui_limitations: {
      show_demo_badge: true,
      show_expiry_notice: true,
      watermark_exports: true,
      disable_white_labeling: true,
    },
  },

  training: {
    data_limitations: {
      max_users: 30,
      max_students: 300,
      max_classes: 20,
      max_storage_mb: 500,
      max_file_size_mb: 20,
    },
    feature_limitations: {
      disabled_features: ['external_api', 'bulk_delete'],
      restricted_features: [],
      reduced_functionality: {},
    },
    security_limitations: {
      ip_restrictions: true,
      max_api_calls_per_day: 500,
      disabled_exports: false,
      disabled_bulk_operations: false,
    },
    ui_limitations: {
      show_demo_badge: true,
      show_expiry_notice: true,
      watermark_exports: false,
      disable_white_labeling: false,
    },
  },
};

// Demo tenant'a sınırlama uygulama
async function applyDemoLimitations(tenantId: string, demoType: string): Promise<void> {
  const limitations = demoTypeLimitations[demoType] || demoTypeLimitations['self-service'];

  // Veritabanı yapılandırmasına sınırlamaları kaydet
  await db.tenants.update(
    { id: tenantId },
    {
      limitations: JSON.stringify(limitations),
      updated_at: new Date(),
    }
  );

  // Redis'te önbellek sınırlamalarını ayarla
  await cache.set(`tenant:${tenantId}:limitations`, JSON.stringify(limitations), 60 * 60 * 24); // 24 saat

  console.log(`Demo sınırlamaları uygulandı: ${tenantId} (${demoType})`);
}
```

### Demo Ortamı Güvenlik Önlemleri

Demo ortamlarında veri güvenliği ve sistem bütünlüğünü sağlamak için alınan önlemler:

```typescript
// lib/demo/demo-security.ts
interface DemoSecurityConfig {
  data_isolation: {
    separate_schema: boolean;
    separate_storage: boolean;
  };
  access_controls: {
    require_auth: boolean;
    expire_sessions_after_minutes: number;
    max_failed_login_attempts: number;
    require_access_code: boolean;
  };
  monitoring: {
    log_all_actions: boolean;
    alert_on_suspicious_activity: boolean;
    daily_security_scan: boolean;
  };
  data_protection: {
    mask_sensitive_data: boolean;
    prevent_real_emails: boolean;
    prevent_real_sms: boolean;
    sanitize_uploads: boolean;
  };
}

// Demo güvenlik yapılandırması uygulama
async function applyDemoSecurity(tenantId: string): Promise<void> {
  const securityConfig: DemoSecurityConfig = {
    data_isolation: {
      separate_schema: true,
      separate_storage: true,
    },
    access_controls: {
      require_auth: true,
      expire_sessions_after_minutes: 60,
      max_failed_login_attempts: 5,
      require_access_code: false,
    },
    monitoring: {
      log_all_actions: true,
      alert_on_suspicious_activity: true,
      daily_security_scan: true,
    },
    data_protection: {
      mask_sensitive_data: true,
      prevent_real_emails: true,
      prevent_real_sms: true,
      sanitize_uploads: true,
    },
  };

  // Güvenlik yapılandırmasını kaydet
  await db.tenants.update(
    { id: tenantId },
    {
      security_config: JSON.stringify(securityConfig),
      updated_at: new Date(),
    }
  );

  // Gerekli güvenlik önlemlerini uygula
  await configureDemoSecurity(tenantId, securityConfig);

  console.log(`Demo güvenlik yapılandırması uygulandı: ${tenantId}`);
}

// Demo tenant için güvenlik yapılandırması
async function configureDemoSecurity(tenantId: string, config: DemoSecurityConfig): Promise<void> {
  // Veri izolasyonu
  if (config.data_isolation.separate_schema) {
    await ensureSchemaSeparation(tenantId);
  }

  if (config.data_isolation.separate_storage) {
    await configureIsolatedStorage(tenantId);
  }

  // Erişim kontrolleri
  await db.schema(`tenant_${tenantId}`).raw(`
    ALTER TABLE sessions 
    SET (idle_in_transaction_session_timeout = '${config.access_controls.expire_sessions_after_minutes * 60000}');
  `);

  // Hassas veri maskeleme
  if (config.data_protection.mask_sensitive_data) {
    await configureSensitiveDataMasking(tenantId);
  }

  // E-posta ve SMS kısıtlamaları
  if (config.data_protection.prevent_real_emails) {
    await configureEmailInterception(tenantId);
  }

  if (config.data_protection.prevent_real_sms) {
    await configureSmsInterception(tenantId);
  }

  // Upload güvenliği
  if (config.data_protection.sanitize_uploads) {
    await configureUploadSanitization(tenantId);
  }
}

// Hassas veri maskeleme fonksiyonu
async function configureSensitiveDataMasking(tenantId: string): Promise<void> {
  // Veritabanı görünümleri oluşturarak hassas veriyi maskele
  await db.schema(`tenant_${tenantId}`).raw(`
    CREATE OR REPLACE VIEW masked_users AS
    SELECT 
      id,
      CASE 
        WHEN role = 'admin' THEN full_name 
        ELSE CONCAT(LEFT(full_name, 1), '****', RIGHT(full_name, 1)) 
      END as full_name,
      CASE
        WHEN role = 'admin' THEN email
        ELSE CONCAT(LEFT(email, 2), '****', SUBSTRING(email FROM position('@' IN email)))
      END as email,
      role,
      avatar,
      created_at,
      updated_at
    FROM users;
    
    -- Diğer hassas veri tabloları için benzer görünümler...
  `);

  console.log(`Hassas veri maskeleme yapılandırıldı: ${tenantId}`);
}

// E-posta yakalama fonksiyonu
async function configureEmailInterception(tenantId: string): Promise<void> {
  // E-postaları gerçek alıcılara göndermek yerine dahili bir posta kutusuna yönlendir
  await db.schema(`tenant_${tenantId}`).raw(`
    CREATE OR REPLACE FUNCTION intercept_emails()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.original_recipient := NEW.recipient;
      NEW.recipient := 'demo-emails@i-ep.app';
      NEW.subject := CONCAT('[DEMO: ', NEW.original_recipient, '] ', NEW.subject);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    DROP TRIGGER IF EXISTS email_intercept_trigger ON outbound_emails;
    
    CREATE TRIGGER email_intercept_trigger
    BEFORE INSERT ON outbound_emails
    FOR EACH ROW EXECUTE PROCEDURE intercept_emails();
  `);

  console.log(`E-posta yakalama yapılandırıldı: ${tenantId}`);
}
```

### Demo Tenant Kontrol Listesi

Demo tenant'ları oluşturma, kontrol etme ve yönetme için kapsamlı kontrol listesi:

### Demo Tenant Oluşturma Öncesi Kontrol Listesi

- [ ] Demo tipi belirlendi (satış, self-servis, eğitim)
- [ ] Hedef kitle ve amacı tanımlandı
- [ ] Uygun veri seti seçildi
- [ ] Okul profili bilgileri hazırlandı
- [ ] Gerekli özelleştirmeler belirlendi
- [ ] Demo süresi ve erişim kısıtlamaları tanımlandı
- [ ] Demo senaryoları ve kullanım akışları hazırlandı

### Demo Tenant Oluşturma Kontrol Listesi

- [ ] Tenant temel bilgileri yapılandırıldı (ad, subdomain, logo, renkler)
- [ ] Veri seti başarıyla yüklendi
- [ ] Okul profili bilgileri girildi
- [ ] Rol bazlı demo kullanıcıları oluşturuldu
- [ ] Örnek içerikler (duyurular, etkinlikler, ödevler) yüklendi
- [ ] Demo erişim bilgileri ve kısıtlamaları yapılandırıldı
- [ ] Sıfırlama planı ve zamanlaması ayarlandı
- [ ] Demo tanıtım materyalleri hazırlandı

### Demo Tenant Kalite Kontrol Listesi

- [ ] Tüm demo kullanıcıları ile giriş testi yapıldı
- [ ] Temel özellikler ve işlevsellik kontrol edildi
- [ ] Demo senaryolarının tamamı test edildi
- [ ] Mobil uyumluluk kontrol edildi
- [ ] Tüm özelleştirmeler doğru şekilde uygulandı
- [ ] Yardım ve rehberlik içerikleri kontrol edildi
- [ ] Demo sınırlamaları doğru şekilde uygulandı
- [ ] Sıfırlama işlemi test edildi

### Demo Tanıtımı Hazırlık Listesi

- [ ] Demo sunum metni hazırlandı
- [ ] Ekran paylaşımı ve gösterim ortamı test edildi
- [ ] Sık sorulan sorular ve cevapları hazırlandı
- [ ] Alternatif senaryolar ve gösterim planları hazırlandı
- [ ] Demo ekibinin yetki ve erişimleri kontrol edildi
- [ ] Takip süreçleri ve görevleri tanımlandı

## Demo Tenant Metrikleri ve Analitikleri

Demo tenant'ların etkinliğini ölçmek için kullanılan metrikler ve göstergeler:

```typescript
// lib/demo/demo-metrics.ts
interface DemoPerformanceMetrics {
  tenant_id: string;
  period_start: Date;
  period_end: Date;

  // Kullanım metrikleri
  usage_metrics: {
    total_logins: number;
    unique_users: number;
    avg_session_duration: number;
    feature_usage_counts: Record<string, number>;
    most_used_features: string[];
    least_used_features: string[];
  };

  // Demo kalite metrikleri
  quality_metrics: {
    error_rate: number;
    support_requests: number;
    feedback_scores: {
      usability: number;
      relevance: number;
      performance: number;
      overall: number;
    };
  };

  // Dönüşüm metrikleri
  conversion_metrics: {
    demo_to_meeting_rate: number;
    demo_to_signup_rate: number;
    signup_to_paid_rate: number;
    overall_conversion_rate: number;
    avg_sales_cycle_days: number;
  };

  // Satış etki metrikleri
  sales_impact_metrics: {
    influenced_deals: number;
    influenced_revenue: number;
    avg_deal_size: number;
    demo_roi: number;
  };
}

// Demo metriklerini hesaplama
async function calculateDemoPerformanceMetrics(
  tenantId: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<DemoPerformanceMetrics> {
  // Temel demo bilgilerini al
  const tenant = await db.tenants.findOne({ id: tenantId, type: 'demo' });

  if (!tenant) {
    throw new Error(`Demo tenant bulunamadı: ${tenantId}`);
  }

  // Kullanım metriklerini hesapla
  const usageMetrics = await calculateUsageMetrics(tenantId, startDate, endDate);

  // Kalite metriklerini hesapla
  const qualityMetrics = await calculateQualityMetrics(tenantId, startDate, endDate);

  // Dönüşüm metriklerini hesapla
  const conversionMetrics = await calculateConversionMetrics(tenantId, startDate, endDate);

  // Satış etki metriklerini hesapla
  const salesImpactMetrics = await calculateSalesImpactMetrics(tenantId, startDate, endDate);

  return {
    tenant_id: tenantId,
    period_start: startDate,
    period_end: endDate,
    usage_metrics: usageMetrics,
    quality_metrics: qualityMetrics,
    conversion_metrics: conversionMetrics,
    sales_impact_metrics: salesImpactMetrics,
  };
}

// Metrik geçmişini ve eğilimleri analiz etme
async function analyzeDemoMetricTrends(tenantId: string, months: number = 3): Promise<any> {
  const now = new Date();
  const trends = [];

  // Son n ay için aylık metrikleri hesapla
  for (let i = 0; i < months; i++) {
    const endDate = new Date(now);
    endDate.setMonth(now.getMonth() - i);
    endDate.setDate(endDate.getDaysInMonth());
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const metrics = await calculateDemoPerformanceMetrics(tenantId, startDate, endDate);

    trends.push({
      period: `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`,
      metrics,
    });
  }

  // Trend analizini yap
  const analysis = {
    usage_trend: analyzeTrend(trends.map((t) => t.metrics.usage_metrics.unique_users)),
    conversion_trend: analyzeTrend(
      trends.map((t) => t.metrics.conversion_metrics.overall_conversion_rate)
    ),
    quality_trend: analyzeTrend(
      trends.map((t) => t.metrics.quality_metrics.feedback_scores.overall)
    ),

    month_over_month_changes: trends.slice(0, months - 1).map((current, index) => {
      const previous = trends[index + 1];

      return {
        period: current.period,
        usage_change: percentChange(
          current.metrics.usage_metrics.unique_users,
          previous.metrics.usage_metrics.unique_users
        ),
        conversion_change: percentChange(
          current.metrics.conversion_metrics.overall_conversion_rate,
          previous.metrics.conversion_metrics.overall_conversion_rate
        ),
        quality_change: percentChange(
          current.metrics.quality_metrics.feedback_scores.overall,
          previous.metrics.quality_metrics.feedback_scores.overall
        ),
      };
    }),
  };

  return {
    trends,
    analysis,
  };
}

// Yüzde değişimini hesaplama yardımcı fonksiyonu
function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Trend analizi yardımcı fonksiyonu
function analyzeTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';

  let increases = 0;
  let decreases = 0;

  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] > values[i + 1]) increases++;
    else if (values[i] < values[i + 1]) decreases++;
  }

  if (increases > decreases && increases > (values.length - 1) / 2) return 'increasing';
  if (decreases > increases && decreases > (values.length - 1) / 2) return 'decreasing';
  return 'stable';
}
```

## Demo Tenant Başarı Hikayeleri ve Vaka Çalışmaları

Başarılı demo tenant kullanımlarının belgelenmesi ve paylaşılması için şablon:

## Demo Tenant Başarı Hikayesi: [Müşteri Adı]

### Müşteri Profili

- **Kurum**: [Okul/Kurumun Adı]
- **Tür**: [Okul Türü]
- **Büyüklük**: [Öğrenci Sayısı] öğrenci, [Öğretmen Sayısı] öğretmen
- **Lokasyon**: [Şehir/Bölge]
- **Önceki Çözüm**: [Kullanılan Önceki Sistem]

### Zorluklar ve İhtiyaçlar

- [Müşterinin karşılaştığı ana zorluklar]
- [Çözmek istedikleri spesifik problemler]
- [Aradıkları çözümün özellikleri]

### Demo Süreci

- **Demo Türü**: [Satış Demo/Self Servis Demo]
- **Demo Süresi**: [Süre]
- **Katılımcılar**: [Roller ve Katılımcı Sayısı]
- **Odaklanılan Özellikler**: [Demo'da gösterilen ana özellikler]

### Kilit Faktörler

- [Demo'da en etkili olan özellikler veya anlar]
- [Müşterinin en çok ilgisini çeken özellikler]
- [Demo'yu farklılaştıran unsurlar]

### Sonuçlar

- **Satış Döngüsü**: [Demo'dan satışa kadar geçen süre]
- **Seçilen Plan**: [Müşterinin seçtiği abonelik planı]
- **ROI**: [Yatırım getirisi veya değeri]
- **Etki**: [Müşterinin operasyonlarındaki iyileşmeler]

### Alınan Dersler

- [Demo sürecinden öğrenilen dersler]
- [İyileştirme için yapılan değişiklikler]
- [Satış ekibi için püf noktaları]

### Müşteri Görüşü

> "[Müşteri alıntısı]"
>
> — [İsim], [Pozisyon]

## Gelecek Geliştirmeler ve Yol Haritası

Demo tenant stratejisi için planlanan gelecek geliştirmeler:

### 2023 Q4 - Temel Demo Altyapısı

- [x] Demo tenant oluşturma ve yönetim altyapısı
- [x] Temel demo veri setleri
- [x] Demo erişim yönetimi
- [x] Demo sıfırlama mekanizması

### 2024 Q1 - İleri Demo Özellikleri

- [ ] **Interaktif Demo Turu**: Kullanıcıları yönlendiren adım adım demo turu
- [ ] **Demo Analitik Paneli**: Demo kullanımı ve etkinliğini izleme
- [ ] **Sektöre Özel Demolar**: Farklı okul türleri için özelleştirilmiş demolar
- [ ] **AI Destekli Demo Asistanı**: Kullanıcı sorularını yanıtlayan asistan

### 2024 Q2 - Demo Kişiselleştirme

- [ ] **Anlık Demo Kişiselleştirme**: Satış görüşmeleri sırasında demoya müşteri verilerini entegre etme
- [ ] **İleri Senaryo Oluşturucu**: Özelleştirilmiş demo senaryoları oluşturma aracı
- [ ] **Demo Takip Otomasyonu**: Otomatik takip e-postaları ve aktiviteleri
- [ ] **Demo Geri Bildirim Sistemi**: Yapılandırılmış geri bildirim toplama

### 2024 Q3-Q4 - Ölçeklendirme ve Optimizasyon

- [ ] **Çoklu Dil Desteği**: Farklı dillerde demo deneyimi
- [ ] **Demo Performans Optimizasyonu**: İlk yükleme ve tepki sürelerinin iyileştirilmesi
- [ ] **İleri Demo Analitikleri**: ML destekli demo etkinlik tahmini
- [ ] **Demo Entegrasyon Ekosistemi**: Diğer sistemlerle entegre demo deneyimi

## Sonuç

Demo tenant stratejisi, Iqra Eğitim Portalı'nın potansiyel müşterilere etkili bir şekilde tanıtılması, satış süreçlerinin desteklenmesi ve kullanıcıların eğitilmesi için kritik bir bileşendir. Bu doküman, demo tenant'ların oluşturulması, yapılandırılması, yönetilmesi ve optimize edilmesi için kapsamlı bir kılavuz sağlamaktadır.

Etkili bir demo stratejisi ile:

- Potansiyel müşteriler platformun değerini hızlıca anlayabilir
- Satış döngüsü kısalır ve dönüşüm oranları artar
- Kullanıcı eğitimleri daha etkili ve verimli hale gelir
- Platform geliştirme sürecine değerli geri bildirimler sağlanır

Bu doküman, demo tenant stratejisinin tüm yönlerini kapsayan yaşayan bir belge olarak kullanılmalı ve platform geliştikçe güncellenmelidir.

## İlgili Kaynaklar

- [Proje Planı](/docs/project-plan.md)
- [Multi-Tenant Stratejisi](/docs/architecture/multi-tenant-strategy.md)
- [Veri İzolasyon Stratejisi](/docs/architecture/data-isolation.md)
- [Community Building Stratejisi](/docs/community-strategy.md)
- [Yedekleme ve Geri Yükleme Prosedürleri](/docs/deployment/backup-restore.md)
