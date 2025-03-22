-- UUID oluşturma için
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Şifreleme işlemleri için
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Full text search için
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Vector search için (ileride AI özellikleri için kullanılabilir)
CREATE EXTENSION IF NOT EXISTS vector;

-- HTTP istekleri için (webhook işlemleri için)
CREATE EXTENSION IF NOT EXISTS http; 