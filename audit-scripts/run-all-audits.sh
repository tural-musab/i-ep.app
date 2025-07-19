#!/bin/bash

# İ-EP.APP Master Audit Runner
# Runs all audit scripts and generates a comprehensive report

echo "🚀 İ-EP.APP Master Audit Runner"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Make all scripts executable
chmod +x audit-scripts/*.sh

# Create audit results directory
mkdir -p audit-results
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULT_DIR="audit-results/audit_$TIMESTAMP"
mkdir -p "$RESULT_DIR"

echo -e "${BLUE}Running comprehensive audits...${NC}"
echo ""

# 1. Run comprehensive audit
echo -e "${GREEN}1/3 Running Comprehensive Code Audit...${NC}"
./audit-scripts/comprehensive-audit.sh > "$RESULT_DIR/comprehensive-audit-results.txt" 2>&1
echo "✅ Comprehensive audit complete"
echo ""

# 2. Run database consistency check
echo -e "${GREEN}2/3 Running Database Consistency Check...${NC}"
./audit-scripts/database-consistency-check.sh > "$RESULT_DIR/database-consistency-results.txt" 2>&1
echo "✅ Database consistency check complete"
echo ""

# 3. Run performance audit
echo -e "${GREEN}3/3 Running Performance Audit...${NC}"
./audit-scripts/performance-audit.sh > "$RESULT_DIR/performance-audit-results.txt" 2>&1
echo "✅ Performance audit complete"
echo ""

# Copy report template
cp audit-scripts/AUDIT-REPORT-TEMPLATE.md "$RESULT_DIR/AUDIT-REPORT.md"

echo -e "${BLUE}All audits completed!${NC}"
echo ""
echo "📁 Results saved to: $RESULT_DIR/"
echo ""
echo "📋 Next steps:"
echo "1. Review the audit results in $RESULT_DIR/"
echo "2. Fill out the AUDIT-REPORT.md with findings"
echo "3. Create action items based on the results"
echo ""
echo "Files generated:"
ls -la "$RESULT_DIR/"
