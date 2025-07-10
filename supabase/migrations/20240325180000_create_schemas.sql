-- Iqra Eğitim Portalı - Şema Oluşturma
BEGIN;

-- Şemaları oluştur
CREATE SCHEMA IF NOT EXISTS management;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS rls_test;
CREATE SCHEMA IF NOT EXISTS tenant_template;

-- Şemalara erişim izinleri
GRANT USAGE ON SCHEMA management TO service_role;
GRANT USAGE ON SCHEMA audit TO service_role;
GRANT USAGE ON SCHEMA rls_test TO service_role;
GRANT USAGE ON SCHEMA tenant_template TO service_role;

-- Şemalardaki nesnelere erişim izinleri
GRANT ALL ON ALL TABLES IN SCHEMA management TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA management TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA management TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA audit TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA audit TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA audit TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA rls_test TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA rls_test TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA rls_test TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA tenant_template TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA tenant_template TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA tenant_template TO service_role;

COMMIT; 