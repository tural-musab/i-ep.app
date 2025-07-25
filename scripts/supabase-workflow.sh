#!/bin/bash

# ============================================================================
# İ-EP.APP Supabase Workflow Management Script
# Kalıcı çözüm: Supabase operations için profesyonel workflow
# Author: Claude Code Assistant
# Date: 2025-07-21
# Version: 1.0.0
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check Supabase status
check_supabase_status() {
    log_info "Checking Supabase status..."
    
    if ! command -v npx &> /dev/null; then
        log_error "npx not found. Please install Node.js and npm."
        exit 1
    fi
    
    if ! npx supabase status &> /dev/null; then
        log_warning "Supabase not running. Starting Supabase..."
        npx supabase start
    else
        log_success "Supabase is running"
    fi
}

# Test database connection
test_db_connection() {
    log_info "Testing database connection..."
    
    DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    
    if psql "$DB_URL" -c "SELECT version();" &> /dev/null; then
        log_success "Database connection successful"
        return 0
    else
        log_error "Database connection failed"
        return 1
    fi
}

# Check migration status
check_migrations() {
    log_info "Checking migration status..."
    
    DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    MIGRATION_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM supabase_migrations.schema_migrations;" 2>/dev/null | xargs)
    FILE_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l | xargs)
    
    log_info "Applied migrations: $MIGRATION_COUNT"
    log_info "Available migrations: $FILE_COUNT"
    
    if [ "$MIGRATION_COUNT" -lt "$FILE_COUNT" ]; then
        log_warning "Some migrations are not applied"
        return 1
    else
        log_success "All migrations are up to date"
        return 0
    fi
}

# Apply missing migrations
apply_migrations() {
    log_info "Applying missing migrations..."
    
    if npx supabase db reset --local; then
        log_success "All migrations applied successfully"
        return 0
    else
        log_error "Failed to apply migrations"
        return 1
    fi
}

# Verify critical functions exist
verify_functions() {
    log_info "Verifying critical database functions..."
    
    DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    REQUIRED_FUNCTIONS=("get_current_tenant_id" "get_current_user_role" "get_current_user_student_id")
    
    for func in "${REQUIRED_FUNCTIONS[@]}"; do
        if psql "$DB_URL" -t -c "SELECT 1 FROM pg_proc WHERE proname = '$func';" 2>/dev/null | grep -q 1; then
            log_success "Function $func exists"
        else
            log_error "Function $func is missing"
            return 1
        fi
    done
    
    return 0
}

# Full health check
health_check() {
    log_info "Running full Supabase health check..."
    
    check_supabase_status
    
    if ! test_db_connection; then
        log_error "Health check failed: Database connection"
        exit 1
    fi
    
    if ! check_migrations; then
        log_warning "Health check warning: Migration mismatch"
        read -p "Would you like to apply missing migrations? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            apply_migrations
        fi
    fi
    
    if ! verify_functions; then
        log_error "Health check failed: Missing critical functions"
        exit 1
    fi
    
    log_success "Supabase health check completed successfully!"
}

# Quick fix for common issues
quick_fix() {
    log_info "Running quick fix for common Supabase issues..."
    
    log_info "Stopping Supabase..."
    npx supabase stop
    
    log_info "Starting Supabase..."
    npx supabase start
    
    log_info "Resetting database with all migrations..."
    npx supabase db reset --local
    
    log_success "Quick fix completed!"
}

# Main menu
main() {
    case "$1" in
        "health"|"check")
            health_check
            ;;
        "fix"|"quick-fix")
            quick_fix
            ;;
        "status")
            check_supabase_status
            ;;
        "test")
            test_db_connection
            ;;
        "migrations")
            check_migrations
            ;;
        "apply")
            apply_migrations
            ;;
        "functions")
            verify_functions
            ;;
        *)
            echo "Supabase Workflow Management"
            echo ""
            echo "Usage: $0 {health|fix|status|test|migrations|apply|functions}"
            echo ""
            echo "Commands:"
            echo "  health     - Run full health check"
            echo "  fix        - Quick fix for common issues"
            echo "  status     - Check Supabase status"
            echo "  test       - Test database connection"
            echo "  migrations - Check migration status"
            echo "  apply      - Apply missing migrations"
            echo "  functions  - Verify critical functions"
            echo ""
            exit 1
            ;;
    esac
}

main "$@"