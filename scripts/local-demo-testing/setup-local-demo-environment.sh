#!/bin/bash

# İ-EP.APP Local Demo Testing Environment Setup
# This script sets up a comprehensive local testing environment that mirrors production

set -e

echo "🚀 Setting up İ-EP.APP Local Demo Testing Environment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOCAL_URL="http://localhost:3000"
DEMO_TENANT="istanbul-demo-ortaokulu"

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Environment Check
print_step "Step 1: Checking environment prerequisites..."

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed. Aborting."; exit 1; }
command -v npx >/dev/null 2>&1 || { print_error "npx is required but not installed. Aborting."; exit 1; }

print_success "Environment prerequisites check completed"

# Step 2: Install Dependencies
print_step "Step 2: Installing project dependencies..."
npm install
print_success "Dependencies installed"

# Step 3: Environment Variables Setup
print_step "Step 3: Setting up local environment variables..."

# Create local environment file if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.example .env.local 2>/dev/null || touch .env.local
fi

# Ensure demo testing environment variables
cat >> .env.local << EOF

# Local Demo Testing Environment Configuration
NEXT_PUBLIC_ENVIRONMENT=demo-testing
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_TENANT_ID=istanbul-demo-ortaokulu
NEXT_PUBLIC_DEMO_TENANT_NAME="Istanbul Demo Ortaokulu"
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Demo Analytics Configuration
NEXT_PUBLIC_ENABLE_DEMO_ANALYTICS=true
NEXT_PUBLIC_DEMO_ANALYTICS_TRACKING=true

# Turkish Content Support
NEXT_PUBLIC_LOCALE=tr
NEXT_PUBLIC_TIMEZONE=Europe/Istanbul

EOF

print_success "Local environment variables configured"

# Step 4: Supabase Local Setup
print_step "Step 4: Starting Supabase local development..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_warning "Supabase CLI not found. Installing..."
    npm install -g @supabase/cli
fi

# Start Supabase local development
npx supabase start

print_success "Supabase local development started"

# Step 5: Database Migration and Seeding
print_step "Step 5: Applying database migrations and seeding demo data..."

# Apply all migrations
npx supabase db push --local

# Run demo content seeding script
node scripts/local-demo-testing/seed-turkish-demo-content.js

print_success "Database migrations applied and demo data seeded"

# Step 6: Create Demo Users
print_step "Step 6: Creating demo users for all roles..."

node scripts/local-demo-testing/create-local-demo-users.js

print_success "Demo users created successfully"

# Step 7: Start Development Services
print_step "Step 7: Starting development services..."

# Start Redis if available
if command -v redis-server &> /dev/null; then
    redis-server --daemonize yes --port 6379
    print_success "Redis started on port 6379"
else
    print_warning "Redis not found. Some features may be limited."
fi

# Start MinIO if available (optional)
if command -v minio &> /dev/null; then
    minio server ./minio-data --address ":9000" --console-address ":9001" &
    print_success "MinIO started on port 9000"
else
    print_warning "MinIO not found. Using Supabase Storage instead."
fi

print_success "Development services started"

# Step 8: Build and Test
print_step "Step 8: Building application and running tests..."

# Build the application
npm run build

# Run unit tests
npm test

print_success "Application built and tests passed"

# Step 9: Generate Test Report
print_step "Step 9: Generating initial test report..."

node scripts/local-demo-testing/generate-test-report.js

print_success "Test report generated"

# Step 10: Final Setup Verification
print_step "Step 10: Verifying setup..."

# Check if Next.js can start
timeout 30s npm run dev &
DEV_PID=$!
sleep 10

if kill -0 $DEV_PID 2>/dev/null; then
    print_success "Next.js development server can start successfully"
    kill $DEV_PID
else
    print_error "Next.js development server failed to start"
fi

# Summary
echo ""
echo "🎉 Local Demo Testing Environment Setup Complete!"
echo ""
echo "📊 Environment Summary:"
echo "├── 🌐 Local URL: ${LOCAL_URL}"
echo "├── 🏫 Demo Tenant: ${DEMO_TENANT}"
echo "├── 🗄️  Supabase: http://localhost:54321"
echo "├── 📊 Supabase Studio: http://localhost:54323"
echo "├── 📧 Inbucket (Email): http://localhost:54324"
echo "├── 🔄 Redis: localhost:6379"
echo "└── 📦 MinIO: http://localhost:9000"
echo ""
echo "👥 Demo Users Created:"
echo "├── 📚 Admin: admin@istanbul-demo-ortaokulu.edu.tr"
echo "├── 🎓 Teacher: ogretmen@istanbul-demo-ortaokulu.edu.tr"
echo "├── 📖 Student: ogrenci@istanbul-demo-ortaokulu.edu.tr"
echo "└── 👨‍👩‍👧‍👦 Parent: veli@istanbul-demo-ortaokulu.edu.tr"
echo ""
echo "🚀 Next Steps:"
echo "1. Run: npm run dev"
echo "2. Open: ${LOCAL_URL}"
echo "3. Login with demo credentials"
echo "4. Run: npm run test:demo"
echo ""
echo "📋 Test Checklist Generated: ./test-results/local-demo-test-checklist.md"
echo "📊 Test Report: ./test-results/local-demo-test-report.html"