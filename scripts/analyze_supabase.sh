#!/bin/bash

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Supabase Analiz Başlıyor...${NC}\n"

# Proje bilgilerini al
PROJECT_ID="yjeclsgggdoxionvzhdj"

echo -e "${GREEN}1. Veritabanı Şema Analizi${NC}"
supabase db dump -f schema_analysis.sql

echo -e "${GREEN}2. RLS Politikaları${NC}"
supabase db dump --role-only -f rls_policies.sql

echo -e "${GREEN}3. Mevcut Migration'lar${NC}"
ls -l supabase/migrations/ > migrations.txt

echo -e "${GREEN}4. Auth Ayarları${NC}"
supabase config get auth > auth_config.txt

echo -e "${GREEN}5. Storage Bucket'ları${NC}"
supabase storage list > storage_buckets.txt

# Sonuçları birleştir
echo -e "${BLUE}Analiz Raporu Oluşturuluyor...${NC}"
cat << EOF > supabase_analysis_report.md
# Supabase Analiz Raporu

## 1. Veritabanı Şeması
\`\`\`sql
$(cat schema_analysis.sql)
\`\`\`

## 2. RLS Politikaları
\`\`\`sql
$(cat rls_policies.sql)
\`\`\`

## 3. Migration'lar
\`\`\`
$(cat migrations.txt)
\`\`\`

## 4. Auth Ayarları
\`\`\`
$(cat auth_config.txt)
\`\`\`

## 5. Storage Bucket'ları
\`\`\`
$(cat storage_buckets.txt)
\`\`\`
EOF

# Geçici dosyaları temizle
rm schema_analysis.sql rls_policies.sql migrations.txt auth_config.txt storage_buckets.txt

echo -e "${GREEN}Analiz tamamlandı! Sonuçlar 'supabase_analysis_report.md' dosyasında.${NC}" 