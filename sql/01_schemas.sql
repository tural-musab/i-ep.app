-- Yönetim şeması - Tüm tenant'lar için ortak tablo ve işlevler
CREATE SCHEMA IF NOT EXISTS management;

-- Public şeması - Kimlik doğrulama ve tenant-bağımsız veriler için
-- Bu şema varsayılan olarak zaten mevcut, sadece açıklamak için ekledim
-- CREATE SCHEMA IF NOT EXISTS public;

-- Tenant şablonu - Her tenant için kopyalanacak
CREATE SCHEMA IF NOT EXISTS tenant_template;

-- Super admin işlemleri için şema
CREATE SCHEMA IF NOT EXISTS super_admin;

-- Yardımcı işlevler için şema
CREATE SCHEMA IF NOT EXISTS utils;

-- Audit şeması - Denetleme kayıtları için
CREATE SCHEMA IF NOT EXISTS audit; 