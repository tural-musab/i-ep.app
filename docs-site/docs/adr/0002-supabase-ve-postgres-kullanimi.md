# 0002. Supabase ve PostgreSQL Kullanımı

## Bağlam

Iqra Eğitim Portalı için backend veritabanı ve kimlik doğrulama altyapısı seçimi yapılırken aşağıdaki gereksinimler ve kısıtlamalar değerlendirilmiştir:

- Multi-tenant mimari için uygun veritabanı yetenekleri
- İlişkisel veri yapılarına ihtiyaç (öğrenciler, öğretmenler, sınıflar, dersler arasındaki ilişkiler)
- Güvenli kimlik doğrulama ve yetkilendirme sistemi
- Gerçek zamanlı veri güncellemeleri
- Ölçeklenebilirlik ve yüksek performans
- Maliyet etkinliği
- Geliştirme hızı ve sürdürülebilirlik
- PostgreSQL'in gelişmiş özelliklerinden (şemalar, RLS, JSON veri tipleri, vb.) yararlanma

Backend ve veritabanı için aşağıdaki alternatifler değerlendirilmiştir:
- Custom API + PostgreSQL
- Firebase + Firestore
- Supabase + PostgreSQL
- AWS Amplify + DynamoDB
- MongoDB Atlas + Express API

## Karar

Backend ve veritabanı için **Supabase ve PostgreSQL** kullanılmasına karar verilmiştir. Supabase, açık kaynaklı bir "Firebase alternatifi" olarak, PostgreSQL veritabanı üzerine inşa edilmiş bir Backend-as-a-Service (BaaS) platformudur.

## Durum

Kabul Edildi

## Tarih

2023-11-18

## Sonuçlar

### Olumlu

- **PostgreSQL Temelli**: Güçlü ilişkisel veritabanı özellikleri, şema yapısı, RLS (Row Level Security) ile multi-tenant için ideal
- **Kullanıma Hazır Auth Sistemi**: Oturum açma, kaydolma, şifre sıfırlama, sosyal giriş için hazır API'ler
- **Gerçek Zamanlı API**: WebSocket tabanlı gerçek zamanlı veri güncellemeleri
- **Depolama**: Dosya depolama ve yönetimi için entegre çözüm
- **Auto-API Oluşturma**: Tablolar için otomatik CRUD API'leri
- **Row Level Security**: Veritabanı seviyesinde güçlü erişim kontrolü
- **Açık Kaynak**: Vendor lock-in riskinin azaltılması
- **JavaScript/TypeScript SDK**: Next.js ile kolay entegrasyon
- **Düşük Maliyet**: Ücretsiz ve uygun fiyatlı planlar

### Olumsuz

- **Nispeten Yeni Platform**: Firebase kadar olgun değil
- **Belirli Özelleştirme Sınırlamaları**: Karmaşık özel backend mantığı için ek servisler gerekebilir
- **Self-hosting Karmaşıklığı**: Tam kontrol istenirse self-hosting seçeneği var ancak karmaşık
- **Performans Ayarları**: Ölçeklendirme ve performans ayarları için manuel yapılandırma gerekebilir

### Nötr

- Supabase'in edge fonksiyonları ile özel backend mantığı yazılabilir
- PostgreSQL'in JSON özelliklerinin kullanımı
- Postgres fonksiyonları ve tetikleyicileri ile veritabanı seviyesinde iş mantığı yazılabilir
- TypeScript tip tanımları otomatik olarak API şemasından üretilebilir

## Alternatifler

### Custom API + PostgreSQL
- **Avantajlar**: Tam kontrol, özel ihtiyaçlara göre tasarım
- **Dezavantajlar**: Geliştirme süresi uzun, auth ve diğer altyapıları sıfırdan oluşturma gereksinimi

### Firebase + Firestore
- **Avantajlar**: Olgun BaaS, gerçek zamanlı yetenekler, entegre Google hizmetleri
- **Dezavantajlar**: NoSQL tabanlı (ilişkisel veri için daha az uygun), daha yüksek maliyet potansiyeli

### AWS Amplify + DynamoDB
- **Avantajlar**: AWS ekosistemi ile entegrasyon, ölçeklenebilirlik
- **Dezavantajlar**: Öğrenme eğrisi dik, NoSQL tabanlı, uygulama kompleksitesi

### MongoDB Atlas + Express API
- **Avantajlar**: Esnek NoSQL yapısı, yaygın ekosistem
- **Dezavantajlar**: Auth ve diğer altyapılar için ek geliştirme, ilişkisel veri için daha az uygun

## İlgili Kararlar

- [0003](0003-multi-tenant-mimari-stratejisi.md) Multi-Tenant Mimari Stratejisi
- [0001](0001-nextjs-14-kullanimi.md) Next.js 14 Kullanımı

## Kaynaklar

- [Supabase Resmi Dokümantasyonu](https://supabase.io/docs)
- [PostgreSQL Dokümantasyonu](https://www.postgresql.org/docs/)
- [Row Level Security (RLS)](https://supabase.io/docs/guides/auth/row-level-security)
- [Supabase ile Multi-Tenant Uygulama Geliştirme](https://supabase.io/blog/2021/07/28/supabase-multi-tenant-applications) 