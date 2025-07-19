#!/bin/bash

# İ-EP.APP Database-Code Consistency Checker
# This script validates that database schemas match code interfaces

echo "🔍 İ-EP.APP Database-Code Consistency Check"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Extract database table definitions from migrations
echo -e "${BLUE}1. ANALYZING DATABASE MIGRATIONS${NC}"
echo "--------------------------------"

# Assignment System Tables
echo -e "${YELLOW}Assignment System Tables:${NC}"
grep -h "CREATE TABLE" supabase/migrations/*assignment*.sql 2>/dev/null | sed 's/CREATE TABLE //g' | sed 's/ (.*//g' || echo "No assignment migrations found"

# Attendance System Tables
echo -e "${YELLOW}Attendance System Tables:${NC}"
grep -h "CREATE TABLE" supabase/migrations/*attendance*.sql 2>/dev/null | sed 's/CREATE TABLE //g' | sed 's/ (.*//g' || echo "No attendance migrations found"

# Grade System Tables
echo -e "${YELLOW}Grade System Tables:${NC}"
grep -h "CREATE TABLE" supabase/migrations/*grade*.sql 2>/dev/null | sed 's/CREATE TABLE //g' | sed 's/ (.*//g' || echo "No grade migrations found"
echo ""

# 2. Check TypeScript interfaces match database schemas
echo -e "${BLUE}2. CHECKING TYPESCRIPT INTERFACES${NC}"
echo "---------------------------------"

# Assignment interfaces
echo -e "${YELLOW}Assignment TypeScript Interfaces:${NC}"
grep -A 5 "interface Assignment" src/lib/repository/assignment-repository.ts 2>/dev/null | head -10 || echo "Assignment interface not found"
echo ""

# Attendance interfaces
echo -e "${YELLOW}Attendance TypeScript Interfaces:${NC}"
grep -A 5 "interface Attendance" src/lib/repository/attendance-repository.ts 2>/dev/null | head -10 || echo "Attendance interface not found"
echo ""

# Grade interfaces
echo -e "${YELLOW}Grade TypeScript Interfaces:${NC}"
grep -A 5 "interface Grade" src/lib/repository/grade-repository.ts 2>/dev/null | head -10 || echo "Grade interface not found"
echo ""

# 3. Validate RLS policies exist for each table
echo -e "${BLUE}3. VALIDATING RLS POLICIES${NC}"
echo "--------------------------"

# Count RLS policies per system
ASSIGNMENT_RLS=$(grep -c "CREATE POLICY.*assignment" supabase/migrations/*.sql 2>/dev/null || echo "0")
ATTENDANCE_RLS=$(grep -c "CREATE POLICY.*attendance" supabase/migrations/*.sql 2>/dev/null || echo "0")
GRADE_RLS=$(grep -c "CREATE POLICY.*grade" supabase/migrations/*.sql 2>/dev/null || echo "0")

echo -e "Assignment RLS Policies: ${BLUE}$ASSIGNMENT_RLS${NC}"
echo -e "Attendance RLS Policies: ${BLUE}$ATTENDANCE_RLS${NC}"
echo -e "Grade RLS Policies: ${BLUE}$GRADE_RLS${NC}"
echo ""

# 4. Check API endpoints match repository methods
echo -e "${BLUE}4. API-REPOSITORY CONSISTENCY${NC}"
echo "-----------------------------"

# Assignment API endpoints
echo -e "${YELLOW}Assignment API Endpoints:${NC}"
find src/app/api/assignments -name "route.ts" -exec echo {} \; 2>/dev/null

# Check if repository has corresponding methods
echo -e "${YELLOW}Assignment Repository Methods:${NC}"
grep -E "async (create|find|update|delete)" src/lib/repository/assignment-repository.ts 2>/dev/null | sed 's/^[[:space:]]*//' | head -5
echo ""

# 5. Validate foreign key relationships
echo -e "${BLUE}5. FOREIGN KEY VALIDATION${NC}"
echo "-------------------------"

echo -e "${YELLOW}Foreign Key References:${NC}"
grep -h "REFERENCES" supabase/migrations/*.sql 2>/dev/null | grep -v "archived" | head -10
echo ""

# 6. Check for orphaned code/tables
echo -e "${BLUE}6. ORPHANED CODE CHECK${NC}"
echo "----------------------"

# Find repositories without corresponding API endpoints
echo -e "${YELLOW}Checking for repositories without APIs:${NC}"
for repo in src/lib/repository/*-repository.ts; do
    if [ -f "$repo" ]; then
        repo_name=$(basename "$repo" | sed 's/-repository.ts//')
        if [ ! -d "src/app/api/$repo_name" ] && [ "$repo_name" != "base" ]; then
            echo -e "${RED}❌ $repo_name repository has no API endpoint${NC}"
        fi
    fi
done

# Find APIs without repositories
echo -e "${YELLOW}Checking for APIs without repositories:${NC}"
for api_dir in src/app/api/*/; do
    if [ -d "$api_dir" ] && [ -f "$api_dir/route.ts" ]; then
        api_name=$(basename "$api_dir")
        if [ ! -f "src/lib/repository/$api_name-repository.ts" ] && 
           [ "$api_name" != "auth" ] && 
           [ "$api_name" != "health" ] && 
           [ "$api_name" != "storage" ]; then
            echo -e "${YELLOW}⚠️  $api_name API has no repository${NC}"
        fi
    fi
done
echo ""

# 7. Data type consistency
echo -e "${BLUE}7. DATA TYPE CONSISTENCY${NC}"
echo "------------------------"

# Check for date/time handling consistency
echo -e "${YELLOW}Date field patterns:${NC}"
grep -h "created_at\|updated_at\|due_date" src/lib/repository/*-repository.ts 2>/dev/null | grep ":" | sort -u | head -5

# Check for ID field consistency
echo -e "${YELLOW}ID field patterns:${NC}"
grep -h "_id:" src/lib/repository/*-repository.ts 2>/dev/null | sort -u | head -5
echo ""

# 8. Summary Report
echo -e "${BLUE}8. CONSISTENCY SUMMARY${NC}"
echo "---------------------"

# Count totals
TOTAL_TABLES=$(grep -h "CREATE TABLE" supabase/migrations/*.sql 2>/dev/null | wc -l)
TOTAL_REPOS=$(ls src/lib/repository/*-repository.ts 2>/dev/null | grep -v base | wc -l)
TOTAL_APIS=$(find src/app/api -name "route.ts" -type f | wc -l)

echo -e "Database Tables: ${BLUE}$TOTAL_TABLES${NC}"
echo -e "Repository Files: ${BLUE}$TOTAL_REPOS${NC}"
echo -e "API Endpoints: ${BLUE}$TOTAL_APIS${NC}"

# Calculate consistency score
if [ $TOTAL_TABLES -gt 0 ] && [ $TOTAL_REPOS -gt 0 ]; then
    if [ $((TOTAL_TABLES - TOTAL_REPOS)) -lt 5 ]; then
        echo -e "${GREEN}✅ Good database-code consistency${NC}"
    else
        echo -e "${YELLOW}⚠️  Some inconsistency detected between database and code${NC}"
    fi
else
    echo -e "${RED}❌ Unable to determine consistency${NC}"
fi

echo ""
echo "Check completed at $(date)"
