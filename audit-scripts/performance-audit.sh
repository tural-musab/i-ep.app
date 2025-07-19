#!/bin/bash

# İ-EP.APP Performance Audit Script
# Analyzes bundle size, code splitting, and performance metrics

echo "🚀 İ-EP.APP Performance Audit"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. BUNDLE SIZE ANALYSIS
echo -e "${BLUE}1. BUNDLE SIZE ANALYSIS${NC}"
echo "----------------------"

# Check if .next directory exists
if [ -d ".next" ]; then
    echo -e "${YELLOW}Analyzing production bundle...${NC}"
    
    # Find large JavaScript files
    echo -e "${YELLOW}Large JS files (>100KB):${NC}"
    find .next/static -name "*.js" -size +100k -exec ls -lh {} \; 2>/dev/null | awk '{print $5, $9}'
    
    # Total bundle size
    TOTAL_SIZE=$(du -sh .next/static 2>/dev/null | cut -f1)
    echo -e "${BLUE}Total static assets size: $TOTAL_SIZE${NC}"
else
    echo -e "${RED}❌ Build directory not found. Run 'npm run build' first${NC}"
fi
echo ""

# 2. CODE SPLITTING ANALYSIS
echo -e "${BLUE}2. CODE SPLITTING ANALYSIS${NC}"
echo "-------------------------"

# Check for dynamic imports
echo -e "${YELLOW}Dynamic imports found:${NC}"
DYNAMIC_IMPORTS=$(grep -r "import(" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo -e "${BLUE}Dynamic import statements: $DYNAMIC_IMPORTS${NC}"

# Check for lazy loading
echo -e "${YELLOW}React.lazy usage:${NC}"
LAZY_COMPONENTS=$(grep -r "React.lazy" src/ --include="*.tsx" 2>/dev/null | wc -l)
echo -e "${BLUE}Lazy loaded components: $LAZY_COMPONENTS${NC}"
echo ""

# 3. IMAGE OPTIMIZATION
echo -e "${BLUE}3. IMAGE OPTIMIZATION${NC}"
echo "--------------------"

# Check for Next.js Image component usage
echo -e "${YELLOW}Next.js Image component usage:${NC}"
NEXT_IMAGES=$(grep -r "next/image" src/ --include="*.tsx" 2>/dev/null | wc -l)
REGULAR_IMAGES=$(grep -r "<img" src/ --include="*.tsx" 2>/dev/null | wc -l)

echo -e "${GREEN}Next.js Image components: $NEXT_IMAGES${NC}"
echo -e "${YELLOW}Regular img tags: $REGULAR_IMAGES${NC}"

if [ $REGULAR_IMAGES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Consider replacing img tags with Next.js Image component${NC}"
fi
echo ""

# 4. DEPENDENCY ANALYSIS
echo -e "${BLUE}4. DEPENDENCY ANALYSIS${NC}"
echo "---------------------"

# Check package.json size
echo -e "${YELLOW}Production dependencies:${NC}"
PROD_DEPS=$(grep -A 100 '"dependencies"' package.json | grep -c '":')
echo -e "${BLUE}Total production dependencies: $PROD_DEPS${NC}"

# Find potentially large dependencies
echo -e "${YELLOW}Checking for large dependencies...${NC}"
if [ -d "node_modules" ]; then
    echo "Top 10 largest dependencies:"
    du -sh node_modules/* 2>/dev/null | sort -rh | head -10
fi
echo ""

# 5. MIDDLEWARE PERFORMANCE
echo -e "${BLUE}5. MIDDLEWARE PERFORMANCE${NC}"
echo "------------------------"

# Check middleware size
if [ -f "src/middleware.ts" ]; then
    MIDDLEWARE_SIZE=$(ls -lh src/middleware.ts | awk '{print $5}')
    MIDDLEWARE_LINES=$(wc -l < src/middleware.ts)
    echo -e "${BLUE}Middleware file size: $MIDDLEWARE_SIZE${NC}"
    echo -e "${BLUE}Middleware lines of code: $MIDDLEWARE_LINES${NC}"
    
    # Check for performance patterns
    ASYNC_CHECKS=$(grep -c "await" src/middleware.ts 2>/dev/null)
    echo -e "${YELLOW}Async operations in middleware: $ASYNC_CHECKS${NC}"
    
    if [ $ASYNC_CHECKS -gt 3 ]; then
        echo -e "${YELLOW}⚠️  Multiple async operations in middleware may impact performance${NC}"
    fi
fi
echo ""

# 6. DATABASE QUERY OPTIMIZATION
echo -e "${BLUE}6. DATABASE QUERY PATTERNS${NC}"
echo "-------------------------"

# Check for N+1 query patterns
echo -e "${YELLOW}Checking for potential N+1 queries...${NC}"
N_PLUS_ONE=$(grep -r "map.*await" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ $N_PLUS_ONE -gt 0 ]; then
    echo -e "${RED}❌ Found $N_PLUS_ONE potential N+1 query patterns${NC}"
    echo -e "${YELLOW}Consider using batch queries or joins${NC}"
else
    echo -e "${GREEN}✅ No obvious N+1 query patterns found${NC}"
fi

# Check for SELECT * usage
echo -e "${YELLOW}Checking for SELECT * usage...${NC}"
SELECT_ALL=$(grep -r "SELECT \*" src/ --include="*.ts" 2>/dev/null | wc -l)
if [ $SELECT_ALL -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $SELECT_ALL SELECT * queries. Consider selecting specific columns${NC}"
fi
echo ""

# 7. CLIENT-SIDE PERFORMANCE
echo -e "${BLUE}7. CLIENT-SIDE OPTIMIZATION${NC}"
echo "--------------------------"

# Check for use of memo and callbacks
echo -e "${YELLOW}React optimization hooks:${NC}"
USE_MEMO=$(grep -r "useMemo" src/ --include="*.tsx" 2>/dev/null | wc -l)
USE_CALLBACK=$(grep -r "useCallback" src/ --include="*.tsx" 2>/dev/null | wc -l)
REACT_MEMO=$(grep -r "React.memo" src/ --include="*.tsx" 2>/dev/null | wc -l)

echo -e "${BLUE}useMemo usage: $USE_MEMO${NC}"
echo -e "${BLUE}useCallback usage: $USE_CALLBACK${NC}"
echo -e "${BLUE}React.memo usage: $REACT_MEMO${NC}"
echo ""

# 8. API RESPONSE TIME ESTIMATION
echo -e "${BLUE}8. API OPTIMIZATION CHECK${NC}"
echo "------------------------"

# Check for pagination implementation
echo -e "${YELLOW}Pagination implementation:${NC}"
PAGINATION=$(grep -r "page\|limit\|offset" src/app/api --include="*.ts" 2>/dev/null | wc -l)
echo -e "${BLUE}API endpoints with pagination: $PAGINATION${NC}"

# Check for caching headers
echo -e "${YELLOW}Cache control headers:${NC}"
CACHE_HEADERS=$(grep -r "Cache-Control" src/ --include="*.ts" 2>/dev/null | wc -l)
echo -e "${BLUE}Cache-Control headers found: $CACHE_HEADERS${NC}"
echo ""

# 9. PERFORMANCE SUMMARY
echo -e "${BLUE}9. PERFORMANCE SCORE${NC}"
echo "-------------------"

PERF_SCORE=0
MAX_SCORE=10

# Bundle size check
if [ -d ".next" ]; then
    PERF_SCORE=$((PERF_SCORE+1))
fi

# Code splitting
if [ $DYNAMIC_IMPORTS -gt 5 ]; then PERF_SCORE=$((PERF_SCORE+1)); fi
if [ $LAZY_COMPONENTS -gt 3 ]; then PERF_SCORE=$((PERF_SCORE+1)); fi

# Image optimization
if [ $NEXT_IMAGES -gt $REGULAR_IMAGES ]; then PERF_SCORE=$((PERF_SCORE+1)); fi

# Middleware efficiency
if [ $ASYNC_CHECKS -lt 5 ]; then PERF_SCORE=$((PERF_SCORE+1)); fi

# Query optimization
if [ $N_PLUS_ONE -eq 0 ]; then PERF_SCORE=$((PERF_SCORE+1)); fi
if [ $SELECT_ALL -lt 5 ]; then PERF_SCORE=$((PERF_SCORE+1)); fi

# React optimization
if [ $USE_MEMO -gt 5 ]; then PERF_SCORE=$((PERF_SCORE+1)); fi
if [ $USE_CALLBACK -gt 5 ]; then PERF_SCORE=$((PERF_SCORE+1)); fi

# API optimization
if [ $PAGINATION -gt 5 ]; then PERF_SCORE=$((PERF_SCORE+1)); fi

echo -e "${BLUE}Performance Score: ${PERF_SCORE}/${MAX_SCORE}${NC}"

if [ $PERF_SCORE -ge 8 ]; then
    echo -e "${GREEN}🎉 Excellent performance optimization!${NC}"
elif [ $PERF_SCORE -ge 6 ]; then
    echo -e "${YELLOW}⚠️  Good performance with room for improvement${NC}"
else
    echo -e "${RED}❌ Performance needs attention${NC}"
fi

echo ""
echo "Audit completed at $(date)"
