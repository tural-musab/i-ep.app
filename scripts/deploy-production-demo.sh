#!/bin/bash

# İ-EP.APP Production Demo Deployment Script
# This script deploys the production demo environment to demo.i-ep.app
# 
# Prerequisites:
# - Vercel CLI installed and authenticated
# - Supabase CLI installed
# - Environment variables configured
# - Domain demo.i-ep.app available
#
# Usage: ./scripts/deploy-production-demo.sh

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="i-ep-app"
DEMO_DOMAIN="demo.i-ep.app"
DEMO_TENANT_ID="demo-tenant-production-2025"
BRANCH_NAME="production-demo"

# Helper functions
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

log_header() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_header "Checking Prerequisites"
    
    # Check if we're in the correct directory
    if [[ ! -f "package.json" ]] || [[ ! -f "next.config.js" ]]; then
        log_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI is not installed. Install with: npm i -g vercel"
        exit 1
    fi
    
    # Check if authenticated with Vercel
    if ! vercel whoami &> /dev/null; then
        log_error "Please authenticate with Vercel: vercel login"
        exit 1
    fi
    
    # Check Supabase CLI
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI is not installed. Install from: https://supabase.com/docs/guides/cli"
        exit 1
    fi
    
    # Check environment variables
    if [[ -z "$NEXT_PUBLIC_SUPABASE_URL" ]] || [[ -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
        log_error "Missing required environment variables. Please check your .env.local file"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

# Create production demo branch
setup_branch() {
    log_header "Setting Up Production Demo Branch"
    
    # Save current branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    log_info "Current branch: $current_branch"
    
    # Check if production-demo branch exists
    if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
        log_info "Branch $BRANCH_NAME already exists, switching to it"
        git checkout $BRANCH_NAME
        git pull origin $BRANCH_NAME || true
    else
        log_info "Creating new branch: $BRANCH_NAME"
        git checkout -b $BRANCH_NAME
    fi
    
    # Merge latest changes from current branch
    if [[ "$current_branch" != "$BRANCH_NAME" ]]; then
        log_info "Merging changes from $current_branch"
        git merge $current_branch --no-edit || {
            log_error "Merge conflicts detected. Please resolve manually and re-run the script"
            exit 1
        }
    fi
    
    log_success "Branch setup complete"
}

# Configure production demo environment
setup_environment() {
    log_header "Configuring Environment Variables"
    
    # Set production demo environment variables
    log_info "Setting Vercel environment variables..."
    
    vercel env add NEXT_PUBLIC_APP_URL "https://$DEMO_DOMAIN" production --force || true
    vercel env add NEXT_PUBLIC_DOMAIN "$DEMO_DOMAIN" production --force || true
    vercel env add NEXT_PUBLIC_DEMO_MODE "true" production --force || true
    vercel env add NEXT_PUBLIC_DEMO_TENANT_ID "$DEMO_TENANT_ID" production --force || true
    vercel env add NEXT_PUBLIC_BASE_DOMAIN "i-ep.app" production --force || true
    vercel env add NEXTAUTH_URL "https://$DEMO_DOMAIN" production --force || true
    vercel env add SENTRY_ENVIRONMENT "demo" production --force || true
    vercel env add NODE_ENV "production" production --force || true
    
    log_success "Environment variables configured"
}

# Add custom domain to Vercel
setup_domain() {
    log_header "Setting Up Custom Domain"
    
    log_info "Adding domain $DEMO_DOMAIN to Vercel project..."
    
    # Add domain (this might fail if domain already exists, which is okay)
    vercel domains add "$DEMO_DOMAIN" --scope="$PROJECT_NAME" || {
        log_warning "Domain might already exist, continuing..."
    }
    
    # Check domain status
    log_info "Checking domain status..."
    vercel domains list
    
    log_warning "IMPORTANT: Make sure to configure DNS:"
    log_warning "Add CNAME record: $DEMO_DOMAIN -> cname.vercel-dns.com"
    
    # Wait for user confirmation
    read -p "Press Enter after DNS configuration is complete..."
    
    log_success "Domain setup initiated"
}

# Deploy database changes
setup_database() {
    log_header "Setting Up Production Demo Database"
    
    log_info "Running database migration for demo tenant..."
    
    # Check if Supabase is linked
    if [[ ! -f "supabase/.config.toml" ]]; then
        log_error "Supabase project not linked. Run: supabase link"
        exit 1
    fi
    
    # Apply demo tenant setup
    log_info "Applying demo tenant setup..."
    if [[ -f "scripts/production-demo-setup.sql" ]]; then
        supabase db push --include-all --dry-run
        
        read -p "Review the above changes. Continue with database deployment? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            psql "$NEXT_PUBLIC_SUPABASE_URL" -f scripts/production-demo-setup.sql || {
                log_error "Database setup failed"
                exit 1
            }
        else
            log_warning "Database deployment skipped"
        fi
    else
        log_error "Demo setup SQL file not found"
        exit 1
    fi
    
    log_success "Database setup complete"
}

# Create demo users
create_demo_users() {
    log_header "Creating Demo Users"
    
    log_info "Creating production demo users..."
    
    if [[ -f "scripts/create-demo-users-production.js" ]]; then
        node scripts/create-demo-users-production.js || {
            log_error "Demo user creation failed"
            exit 1
        }
    else
        log_error "Demo user creation script not found"
        exit 1
    fi
    
    log_success "Demo users created successfully"
}

# Build and deploy application
deploy_application() {
    log_header "Deploying Application"
    
    log_info "Building application locally to verify..."
    npm run build || {
        log_error "Build failed"
        exit 1
    }
    
    log_info "Deploying to Vercel..."
    vercel --prod --force || {
        log_error "Deployment failed"
        exit 1
    }
    
    log_success "Application deployed successfully"
}

# Run post-deployment tests
run_tests() {
    log_header "Running Post-Deployment Tests"
    
    log_info "Testing domain accessibility..."
    
    # Wait a bit for DNS propagation
    sleep 10
    
    # Test basic connectivity
    if curl -f -s "https://$DEMO_DOMAIN" > /dev/null; then
        log_success "Domain is accessible"
    else
        log_warning "Domain might not be accessible yet (DNS propagation may take time)"
    fi
    
    # Test API health
    if curl -f -s "https://$DEMO_DOMAIN/api/health" > /dev/null; then
        log_success "API is responding"
    else
        log_warning "API might not be responding yet"
    fi
    
    log_info "Manual testing recommended:"
    log_info "1. Visit https://$DEMO_DOMAIN"
    log_info "2. Test login with demo users"
    log_info "3. Verify Turkish localization"
    log_info "4. Test core features (assignments, attendance, grades)"
}

# Main deployment function
main() {
    log_header "İ-EP.APP Production Demo Deployment"
    echo "Target Domain: $DEMO_DOMAIN"
    echo "Demo Tenant ID: $DEMO_TENANT_ID"
    echo "Branch: $BRANCH_NAME"
    echo ""
    
    read -p "Continue with production demo deployment? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
    
    # Run deployment steps
    check_prerequisites
    setup_branch
    setup_environment
    setup_domain
    setup_database
    create_demo_users
    deploy_application
    run_tests
    
    # Success summary
    log_header "🎉 Production Demo Deployment Complete!"
    echo ""
    echo "Demo Environment Details:"
    echo "========================"
    echo "URL: https://$DEMO_DOMAIN"
    echo "Tenant ID: $DEMO_TENANT_ID"
    echo "Branch: $BRANCH_NAME"
    echo ""
    echo "Demo User Credentials:"
    echo "====================="
    echo "Admin:   admin@demo.i-ep.app   / DemoAdmin2025!"
    echo "Teacher: teacher@demo.i-ep.app / DemoTeacher2025!"
    echo "Student: student@demo.i-ep.app / DemoStudent2025!"
    echo "Parent:  parent@demo.i-ep.app  / DemoParent2025!"
    echo ""
    echo "Next Steps:"
    echo "==========="
    echo "1. Test all user roles and features"
    echo "2. Verify Turkish localization"
    echo "3. Monitor performance and errors"
    echo "4. Share demo credentials with stakeholders"
    echo ""
    log_success "Production demo is ready for use!"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"