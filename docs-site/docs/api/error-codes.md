# İ-EP.APP API Hata Kodları

Bu doküman, İ-EP.APP API'si tarafından döndürülen hata kodlarını, açıklamalarını ve olası çözüm yollarını içerir.

## Genel Hata Formatı

API hataları, aşağıdaki formatta JSON nesneleri olarak döndürülür:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "İnsan tarafından okunabilir hata mesajı",
    "details": {
      // Hata detayları (opsiyonel)
    }
  }
}
```

## HTTP Durum Kodları

API yanıtlarında kullanılan genel HTTP durum kodları:

| Durum Kodu | Açıklama                                                  |
| ---------- | --------------------------------------------------------- |
| 200        | OK - İstek başarıyla tamamlandı                           |
| 201        | Created - Kaynak başarıyla oluşturuldu                    |
| 204        | No Content - İstek başarılı ancak içerik yok              |
| 400        | Bad Request - Geçersiz istek veya parametre hatası        |
| 401        | Unauthorized - Kimlik doğrulama başarısız                 |
| 403        | Forbidden - Yetkilendirme başarısız                       |
| 404        | Not Found - Kaynak bulunamadı                             |
| 409        | Conflict - Çakışma (örn. çift kayıt)                      |
| 422        | Unprocessable Entity - Doğrulama hatası                   |
| 429        | Too Many Requests - İstek limiti aşıldı                   |
| 500        | Internal Server Error - Sunucu hatası                     |
| 503        | Service Unavailable - Servis geçici olarak kullanılamıyor |

## Hata Kodları ve Çözümleri

### Kimlik Doğrulama Hataları (AUTH\_\*)

| Kod                           | Mesaj                                 | Çözüm                                    |
| ----------------------------- | ------------------------------------- | ---------------------------------------- |
| AUTH_INVALID_CREDENTIALS      | Geçersiz e-posta veya şifre           | E-posta ve şifrenizi kontrol edin        |
| AUTH_USER_NOT_FOUND           | Kullanıcı bulunamadı                  | E-posta adresinizi kontrol edin          |
| AUTH_EXPIRED_TOKEN            | Oturum süresi doldu                   | Yeniden giriş yapın                      |
| AUTH_INVALID_TOKEN            | Geçersiz kimlik jetonu                | Yeniden giriş yapın                      |
| AUTH_INSUFFICIENT_PERMISSIONS | Bu işlem için yetkiniz yok            | Doğru role sahip olduğunuzdan emin olun  |
| AUTH_EMAIL_IN_USE             | Bu e-posta adresi zaten kullanımda    | Farklı bir e-posta adresi kullanın       |
| AUTH_INVALID_RESET_TOKEN      | Geçersiz şifre sıfırlama jetonu       | Yeni bir şifre sıfırlama isteği gönderin |
| AUTH_MFA_REQUIRED             | İki faktörlü kimlik doğrulama gerekli | İki faktörlü doğrulama kodunu girin      |

### Tenant Hataları (TENANT\_\*)

| Kod                   | Mesaj                          | Çözüm                                        |
| --------------------- | ------------------------------ | -------------------------------------------- |
| TENANT_NOT_FOUND      | Tenant bulunamadı              | Subdomain'in doğru olduğundan emin olun      |
| TENANT_INACTIVE       | Bu tenant aktif değil          | Sistem yöneticisi ile iletişime geçin        |
| TENANT_LIMIT_EXCEEDED | Tenant kullanıcı limiti aşıldı | Ödeme planınızı yükseltin                    |
| TENANT_DOMAIN_INVALID | Geçersiz domain                | Domainin doğru formatta olduğundan emin olun |
| TENANT_DOMAIN_IN_USE  | Bu domain zaten kullanımda     | Farklı bir domain kullanın                   |
| TENANT_SSL_ERROR      | SSL sertifikası alınamadı      | Domain DNS ayarlarınızı kontrol edin         |

### Kullanıcı Hataları (USER\_\*)

| Kod                   | Mesaj                        | Çözüm                                                       |
| --------------------- | ---------------------------- | ----------------------------------------------------------- |
| USER_NOT_FOUND        | Kullanıcı bulunamadı         | Kullanıcı ID'sini kontrol edin                              |
| USER_VALIDATION_ERROR | Kullanıcı verileri geçersiz  | Girilen verileri kontrol edin                               |
| USER_INACTIVE         | Kullanıcı hesabı aktif değil | Hesabınızı aktifleştirmek için yönetici ile iletişime geçin |
| USER_ROLE_INVALID     | Geçersiz kullanıcı rolü      | Geçerli bir rol seçin                                       |
| USER_IMPORT_ERROR     | Kullanıcı içe aktarma hatası | İçe aktarma dosyanızı kontrol edin                          |

### Veri Doğrulama Hataları (VALIDATION\_\*)

| Kod                  | Mesaj                     | Çözüm                               |
| -------------------- | ------------------------- | ----------------------------------- |
| VALIDATION_REQUIRED  | Zorunlu alan eksik        | Tüm zorunlu alanları doldurun       |
| VALIDATION_FORMAT    | Alan formatı geçersiz     | Doğru format ile tekrar deneyin     |
| VALIDATION_LENGTH    | Alan uzunluğu geçersiz    | Alan uzunluğunu kontrol edin        |
| VALIDATION_UNIQUE    | Bu değer zaten kullanımda | Benzersiz bir değer kullanın        |
| VALIDATION_FILE_SIZE | Dosya boyutu çok büyük    | Daha küçük bir dosya yükleyin       |
| VALIDATION_FILE_TYPE | Dosya türü desteklenmiyor | Desteklenen bir dosya türü kullanın |

### API Limitleri ve İstek Hataları (REQUEST\_\*)

| Kod                          | Mesaj                           | Çözüm                                  |
| ---------------------------- | ------------------------------- | -------------------------------------- |
| REQUEST_RATE_LIMITED         | İstek limiti aşıldı             | Bir süre bekleyip tekrar deneyin       |
| REQUEST_INVALID_CONTENT_TYPE | Geçersiz içerik türü            | Content-Type başlığını kontrol edin    |
| REQUEST_PAYLOAD_TOO_LARGE    | İstek verisi çok büyük          | Daha küçük bir veri göndermeyi deneyin |
| REQUEST_INVALID_METHOD       | Bu endpoint için geçersiz metod | Doğru HTTP metodunu kullanın           |
| REQUEST_MISSING_HEADER       | Gerekli başlık eksik            | Tüm gerekli başlıkları ekleyin         |

### Sistem ve Sunucu Hataları (SERVER\_\*)

| Kod                     | Mesaj                       | Çözüm                                                          |
| ----------------------- | --------------------------- | -------------------------------------------------------------- |
| SERVER_ERROR            | Beklenmeyen bir hata oluştu | Daha sonra tekrar deneyin veya destek ekibiyle iletişime geçin |
| SERVER_MAINTENANCE      | Bakım çalışması             | Bakım tamamlandıktan sonra tekrar deneyin                      |
| SERVER_DATABASE_ERROR   | Veritabanı hatası           | Destek ekibiyle iletişime geçin                                |
| SERVER_DEPENDENCY_ERROR | Harici servis hatası        | Destek ekibiyle iletişime geçin                                |
| SERVER_STORAGE_ERROR    | Depolama hatası             | Destek ekibiyle iletişime geçin                                |

## Hataları Raporlama

API kullanımı sırasında beklenmeyen veya açıklanmayan hatalarla karşılaşırsanız, lütfen aşağıdaki bilgilerle birlikte destek ekibimize bildirin:

1. Hata kodu ve mesajı
2. İstek URL'i ve metodu
3. İstek parametreleri (hassas bilgiler olmadan)
4. Hata tarihi ve saati

Destek e-posta adresimiz: destek@i-ep.app
