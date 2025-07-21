#!/bin/bash

# Unified Tracking Audit Script
echo "🔍 İ-EP.APP Unified Tracking Audit"
echo "=================================="

# Sync önce çalıştır
node scripts/tracking/sync-sources.js

# Dashboard oluştur
node scripts/tracking/generate-dashboard.js

echo ""
echo "📊 Quick Status:"
echo "================"

# YAML'dan key metrics çıkar
phase=$(grep "phase:" tracking/unified-tracking.yaml | cut -d'"' -f2)
completion=$(grep "completion:" tracking/unified-tracking.yaml | awk '{print $2}')
total_issues=$(grep "total_issues:" tracking/unified-tracking.yaml | awk '{print $2}')

echo "📍 Current Phase: $phase"
echo "📈 Completion: $completion%"
echo "⚠️ Total Issues: $total_issues"

echo ""
echo "🎯 Next Actions:"
echo "================"
echo "1. Copy prompts/audit-unified.md to Claude"
echo "2. Run detailed cross-reference analysis"
echo "3. Review tracking/UNIFIED-DASHBOARD.md"

echo ""
echo "✅ Audit preparation complete!"