# Mimari Karar Kayıtları (ADR)

Bu dizin, projede alınan mimari kararların kayıtlarını içerir. Her bir ADR, bir mimari kararı ve bu kararın sonuçlarını belgelendirir.

## ADR'lerin Amacı

- Mimari kararların sebeplerini belgelemek
- Gelecekteki ekip üyeleri için kurumsal hafıza oluşturmak
- Kararlarla ilgili olarak geriye dönük bilgi sağlamak
- Mimari kararların etkilerini ve sonuçlarını belgelemek

## ADR Listesi

| No                                                 | Durum        | Tarih      | Başlık                             | Açıklama                                                                            |
| -------------------------------------------------- | ------------ | ---------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| [0001](0001-nextjs-14-kullanimi.md)                | Kabul Edildi | 2023-11-12 | Next.js 14 Kullanımı               | Next.js 14'ün proje için frontend framework olarak seçilmesi                        |
| [0002](0002-supabase-ve-postgres-kullanimi.md)     | Kabul Edildi | 2023-11-18 | Supabase ve PostgreSQL Kullanımı   | Backend veritabanı ve kimlik doğrulama altyapısı için Supabase ve PostgreSQL seçimi |
| [0003](0003-multi-tenant-mimari-stratejisi.md)     | Kabul Edildi | 2023-11-25 | Multi-Tenant Mimari Stratejisi     | Çoklu kiracı (multi-tenant) mimarisi için izolasyon ve verimlilik stratejisi        |
| [0004](0004-cloudflare-ile-domain-yonetimi.md)     | Kabul Edildi | 2023-12-05 | Cloudflare ile Domain Yönetimi     | Domain yönetimi ve DNS hizmetleri için Cloudflare platformunun kullanımı            |
| [0005](0005-tailwindcss-ve-shadcn-ui-kullanimi.md) | Kabul Edildi | 2023-12-10 | TailwindCSS ve Shadcn UI Kullanımı | Frontend stil ve UI komponent kütüphanesi seçimi                                    |
| [0006](0006-react-hook-form-ve-zod-kullanimi.md)   | Kabul Edildi | 2024-01-15 | React Hook Form ve Zod Kullanımı   | Form yönetimi ve validasyon kütüphaneleri seçimi                                    |
| [0007](0007-jest-ve-testing-library-kullanimi.md)  | Kabul Edildi | 2024-02-05 | Jest ve Testing Library Kullanımı  | Test stratejisi ve test kütüphaneleri seçimi                                        |

## Yeni ADR Eklemek

Yeni bir ADR eklemek için:

1. `template.md` dosyasını kopyalayın
2. `NNNN-aciklayici-baslik.md` formatında yeni bir dosya oluşturun
3. ADR içeriğini doldurun
4. README.md'deki ADR listesine ekleyin

## ADR Durumları

- **Taslak:** Karar henüz nihai değil
- **Kabul Edildi:** Karar kabul edildi ve uygulanıyor
- **Reddedildi:** Karar değerlendirildi ancak reddedildi
- **Kullanımdan Kaldırıldı:** Karar bir süre uygulandı ancak artık kullanılmıyor
- **Değiştirildi:** Karar yerine başka bir karar alındı, önceki ADR'ye bakın
