#!/bin/bash

# Dokümantasyon dosyalarını organize et

# Proje yönetimi dosyaları
mkdir -p docs/project-management
mv ACTION-PLAN-*.md docs/project-management/ 2>/dev/null
mv PROJE-*.md docs/project-management/ 2>/dev/null
mv TODO-*.md docs/project-management/ 2>/dev/null
mv SPRINT-*.md docs/project-management/ 2>/dev/null
mv PHASE-*.md docs/project-management/ 2>/dev/null
mv REALISTIC-*.md docs/project-management/ 2>/dev/null
mv UNIFIED-*.md docs/project-management/ 2>/dev/null

# Güvenlik ve kurulum dosyaları
mkdir -p docs/security-setup
mv ENVIRONMENT-*.md docs/security-setup/ 2>/dev/null
mv GITHUB-*.md docs/security-setup/ 2>/dev/null
mv PRODUCTION-*.md docs/security-setup/ 2>/dev/null
mv SETUP-*.md docs/security-setup/ 2>/dev/null
mv DAILY-*.md docs/security-setup/ 2>/dev/null

# Test ve kalite dosyaları
mkdir -p docs/testing-quality
mv TEST-*.md docs/testing-quality/ 2>/dev/null
mv AUTHENTICATION-*.md docs/testing-quality/ 2>/dev/null
mv API_*.md docs/testing-quality/ 2>/dev/null
mv BROWSER-*.md docs/testing-quality/ 2>/dev/null
mv EVIDENCE-*.md docs/testing-quality/ 2>/dev/null
mv *_TEST_*.json docs/testing-quality/ 2>/dev/null

# Geliştirme rehberleri
mkdir -p docs/development-guides
mv CLAUDE-*.md docs/development-guides/ 2>/dev/null
mv DEVELOPMENT-*.md docs/development-guides/ 2>/dev/null
mv FOUNDATION-*.md docs/development-guides/ 2>/dev/null
mv CONTRIBUTING.md docs/development-guides/ 2>/dev/null
mv README-*.md docs/development-guides/ 2>/dev/null

# Analiz ve raporlar
mkdir -p docs/analysis-reports
mv ANALIZ-*.md docs/analysis-reports/ 2>/dev/null
mv COMPREHENSIVE-*.md docs/analysis-reports/ 2>/dev/null
mv PROFESSIONAL-*.md docs/analysis-reports/ 2>/dev/null
mv SAFARI_*.md docs/analysis-reports/ 2>/dev/null
mv browser-compatibility-*.* docs/analysis-reports/ 2>/dev/null

# Notion ve domain dosyaları
mkdir -p docs/integrations
mv notion-*.md docs/integrations/ 2>/dev/null
mv DOMAIN_*.md docs/integrations/ 2>/dev/null
mv LOCAL-DEMO-*.md docs/integrations/ 2>/dev/null

echo "✅ Dokümantasyon dosyaları organize edildi!"
