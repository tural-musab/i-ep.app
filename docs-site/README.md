# İ-EP.APP Dokümantasyon Sitesi

Bu dizin, İ-EP.APP'ın Docusaurus tabanlı dokümantasyon web sitesini içerir. Bu site, proje dokümantasyonunu interaktif ve kullanıcı dostu bir formatta sunmak için tasarlanmıştır.

## Kurulum

Dokümantasyon sitesini yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

```bash
# Bağımlılıkları yükleyin
cd docs-site
npm install

# Geliştirme sunucusunu başlatın
npm start
```

Bu, yerel sunucuyu http://localhost:3000 adresinde başlatacaktır.

## Dokümantasyon Yapısı

Dokümantasyon aşağıdaki ana bölümlerden oluşmaktadır:

- **docs/**: Ana dokümantasyon dosyaları
  - **onboarding/**: Geliştirici onboarding rehberleri
  - **api/**: API dokümantasyonu
  - **testing/**: Test stratejileri ve rehberleri
  - **components/**: Component dokümantasyonu
  - **architecture/**: Mimari dokümantasyon

## Dağıtım

Dokümantasyon sitesini dağıtmak için:

```bash
npm run build
```

Bu komut, `build` dizininde statik dosyalar oluşturacaktır. Bu dosyalar herhangi bir statik hosting servisine (GitHub Pages, Vercel, Netlify vb.) dağıtılabilir.

## Katkıda Bulunma

Dokümantasyona katkıda bulunmak için aşağıdaki adımları izleyin:

1. İlgili Markdown dosyasını düzenleyin
2. Değişikliklerinizi test edin (`npm start`)
3. Değişikliklerinizi commit edin
4. Pull request açın

## Teknolojiler

- [Docusaurus](https://docusaurus.io/): React tabanlı modern statik site oluşturucu
- [Markdown](https://daringfireball.net/projects/markdown/): Belgeleri yazmak için kullanılan işaretleme dili
- [Mermaid](https://mermaid-js.github.io/mermaid/): Diyagramlar oluşturmak için kullanılan JavaScript tabanlı diyagram ve akış şeması aracı 