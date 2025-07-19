#!/bin/bash

# İ-EP.APP Comprehensive Project Audit Script
# This script performs a thorough audit of code quality, security, and consistency

echo "🔍 İ-EP.APP Comprehensive Project Audit"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. CODE QUALITY AUDIT
echo -e "${BLUE}1. CODE QUALITY AUDIT${NC}"
echo "------------------------"

# TypeScript any usage check
echo -e "${YELLOW}Checking for 'any' types...${NC}"
ANY_COUNT=$(grep -r ": any" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ $ANY_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ No 'any' types found - Excellent TypeScript practices!${NC}"
else
    echo -e "${RED}❌ Found $ANY_COUNT instances of 'any' type${NC}"
    grep -r ": any" src/ --include="*.ts" --include="*.tsx" | head -5
fi
echo ""

# ESLint check
echo -e "${YELLOW}Running ESLint...${NC}"
npm run lint --silent 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ No ESLint errors found${NC}"
else
    echo -e "${RED}❌ ESLint errors detected${NC}"
fi
echo ""

# 2. FILE CONSISTENCY AUDIT
echo -e "${BLUE}2. FILE CONSISTENCY AUDIT${NC}"
echo "-------------------------"

# Check if all repositories follow the same pattern
echo -e "${YELLOW}Checking repository pattern consistency...${NC}"
REPOS=$(ls src/lib/repository/*.ts | grep -v base-repository | grep -v index)
INCONSISTENT=0
for repo in $REPOS; do
    if ! grep -q "extends BaseRepository" "$repo" 2>/dev/null; then
        echo -e "${RED}❌ $repo does not extend BaseRepository${NC}"
        INCONSISTENT=$((INCONSISTENT+1))
    fi
done
if [ $INCONSISTENT -eq 0 ]; then
    echo -e "${GREEN}✅ All repositories follow consistent pattern${NC}"
fi
echo ""

# Check API endpoint consistency
echo -e "${YELLOW}Checking API endpoint consistency...${NC}"
API_DIRS=$(find src/app/api -type d -name "[id]" | wc -l)
echo -e "${BLUE}Found $API_DIRS API endpoints with [id] pattern${NC}"

# 3. TEST COVERAGE AUDIT
echo -e "${BLUE}3. TEST COVERAGE AUDIT${NC}"
echo "----------------------"

# Count test files
echo -e "${YELLOW}Counting test files...${NC}"
UNIT_TESTS=$(find src/__tests__ -name "*test.ts" -o -name "*test.tsx" | wc -l)
echo -e "${BLUE}Found $UNIT_TESTS test files${NC}"

# Check for missing tests
echo -e "${YELLOW}Checking for components without tests...${NC}"
COMPONENTS=$(find src/components -name "*.tsx" | grep -v ".test" | wc -l)
COMPONENT_TESTS=$(find src/__tests__/components -name "*.test.tsx" 2>/dev/null | wc -l)
echo -e "${BLUE}Components: $COMPONENTS, Component Tests: $COMPONENT_TESTS${NC}"
echo ""

# 4. DATABASE CONSISTENCY AUDIT
echo -e "${BLUE}4. DATABASE CONSISTENCY AUDIT${NC}"
echo "-----------------------------"

# Check migrations
echo -e "${YELLOW}Checking database migrations...${NC}"
MIGRATIONS=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l)
echo -e "${BLUE}Found $MIGRATIONS migration files${NC}"

# Check for RLS policies
echo -e "${YELLOW}Checking RLS policies...${NC}"
RLS_COUNT=$(grep -r "CREATE POLICY" supabase/migrations/ 2>/dev/null | wc -l)
echo -e "${BLUE}Found $RLS_COUNT RLS policies${NC}"
echo ""

# 5. SECURITY AUDIT
echo -e "${BLUE}5. SECURITY AUDIT${NC}"
echo "-----------------"

# Check for exposed secrets
echo -e "${YELLOW}Checking for exposed secrets...${NC}"
EXPOSED_SECRETS=$(grep -r "SUPABASE_SERVICE_ROLE_KEY\|JWT_SECRET\|DATABASE_URL" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "process.env" | wc -l)
if [ $EXPOSED_SECRETS -eq 0 ]; then
    echo -e "${GREEN}✅ No exposed secrets found${NC}"
else
    echo -e "${RED}❌ Found $EXPOSED_SECRETS potential exposed secrets${NC}"
fi

# Check for console.log statements
echo -e "${YELLOW}Checking for console.log statements...${NC}"
CONSOLE_LOGS=$(grep -r "console.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo -e "${BLUE}Found $CONSOLE_LOGS console.log statements${NC}"
echo ""

# 6. DEPENDENCY AUDIT
echo -e "${BLUE}6. DEPENDENCY AUDIT${NC}"
echo "-------------------"

# Check for outdated dependencies
echo -e "${YELLOW}Checking for outdated dependencies...${NC}"
OUTDATED=$(npm outdated 2>/dev/null | wc -l)
if [ $OUTDATED -gt 1 ]; then
    echo -e "${YELLOW}⚠️  Found $((OUTDATED-1)) outdated dependencies${NC}"
else
    echo -e "${GREEN}✅ All dependencies are up to date${NC}"
fi

# Security vulnerabilities
echo -e "${YELLOW}Checking for security vulnerabilities...${NC}"
npm audit --production 2>/dev/null | grep -E "found|vulnerabilities"
echo ""

# 7. BUILD HEALTH CHECK
echo -e "${BLUE}7. BUILD HEALTH CHECK${NC}"
echo "---------------------"

# Check if build passes
echo -e "${YELLOW}Running build test...${NC}"
npm run build --silent > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
fi
echo ""

# 8. API HEALTH CHECK
echo -e "${BLUE}8. API ENDPOINT VALIDATION${NC}"
echo "--------------------------"

# Count API endpoints
TOTAL_APIS=$(find src/app/api -name "route.ts" | wc -l)
echo -e "${BLUE}Total API endpoints: $TOTAL_APIS${NC}"

# Check for proper error handling
echo -e "${YELLOW}Checking API error handling...${NC}"
API_ERROR_HANDLING=$(grep -r "try.*catch" src/app/api --include="route.ts" | wc -l)
echo -e "${BLUE}API endpoints with try-catch: $API_ERROR_HANDLING${NC}"
echo ""

# 9. ENVIRONMENT CONFIGURATION
echo -e "${BLUE}9. ENVIRONMENT CONFIGURATION${NC}"
echo "----------------------------"

# Check for .env.example
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example found${NC}"
    ENV_VARS=$(grep -c "=" .env.example)
    echo -e "${BLUE}Environment variables documented: $ENV_VARS${NC}"
else
    echo -e "${RED}❌ .env.example not found${NC}"
fi
echo ""

# 10. FINAL SUMMARY
echo -e "${BLUE}10. AUDIT SUMMARY${NC}"
echo "-----------------"

# Calculate overall health score
SCORE=0
MAX_SCORE=10

# TypeScript quality
if [ $ANY_COUNT -eq 0 ]; then SCORE=$((SCORE+1)); fi

# Repository consistency
if [ $INCONSISTENT -eq 0 ]; then SCORE=$((SCORE+1)); fi

# Test coverage
if [ $UNIT_TESTS -gt 50 ]; then SCORE=$((SCORE+1)); fi

# Security
if [ $EXPOSED_SECRETS -eq 0 ]; then SCORE=$((SCORE+1)); fi

# Dependencies
if [ $OUTDATED -le 5 ]; then SCORE=$((SCORE+1)); fi

# API endpoints
if [ $TOTAL_APIS -gt 10 ]; then SCORE=$((SCORE+1)); fi

# Database migrations
if [ $MIGRATIONS -gt 5 ]; then SCORE=$((SCORE+1)); fi

# RLS policies
if [ $RLS_COUNT -gt 10 ]; then SCORE=$((SCORE+1)); fi

# Console logs
if [ $CONSOLE_LOGS -lt 50 ]; then SCORE=$((SCORE+1)); fi

# Environment config
if [ -f ".env.example" ]; then SCORE=$((SCORE+1)); fi

echo -e "${BLUE}Overall Project Health Score: ${SCORE}/${MAX_SCORE}${NC}"

if [ $SCORE -ge 8 ]; then
    echo -e "${GREEN}🎉 Excellent project health!${NC}"
elif [ $SCORE -ge 6 ]; then
    echo -e "${YELLOW}⚠️  Good project health with some areas for improvement${NC}"
else
    echo -e "${RED}❌ Project needs attention in multiple areas${NC}"
fi

echo ""
echo "Audit completed at $(date)"
