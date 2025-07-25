#!/bin/bash

# İ-EP.APP Complete Local Demo Testing Workflow
# This script runs the complete testing workflow from setup to results

set -e

echo "🚀 İ-EP.APP Complete Local Demo Testing Workflow"
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
WORKFLOW_START_TIME=$(date +%s)
LOG_FILE="test-results/workflow-$(date +%Y%m%d-%H%M%S).log"
RESULTS_DIR="test-results"

print_header() {
    echo -e "${PURPLE}🎯 $1${NC}"
    echo "----------------------------------------"
}

print_step() {
    echo -e "${BLUE}📋 Step $1: $2${NC}"
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

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "$1"
}

# Create results directory
mkdir -p "$RESULTS_DIR"

# Initialize log file
echo "İ-EP.APP Local Demo Testing Workflow Log" > "$LOG_FILE"
echo "Started: $(date)" >> "$LOG_FILE"
echo "=========================================" >> "$LOG_FILE"

print_header "İ-EP.APP Professional Local Testing Workflow"

echo "📊 Testing Environment Information"
echo "├── 🏫 Tenant: Istanbul Demo Ortaokulu"
echo "├── 🌐 Base URL: http://localhost:3000"
echo "├── 🗄️  Database: http://127.0.0.1:54321"
echo "├── 📋 Log File: $LOG_FILE"
echo "└── 📁 Results: $RESULTS_DIR/"
echo ""

# Step 1: Prerequisites Check
print_step "1" "Prerequisites Verification"
log_message "Step 1: Checking prerequisites..."

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION detected"
    log_message "✅ Node.js version: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+ first."
    log_message "❌ Node.js not found"
    exit 1
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_success "npm $NPM_VERSION detected"
    log_message "✅ npm version: $NPM_VERSION"
else
    print_error "npm not found. Please install npm first."
    log_message "❌ npm not found"
    exit 1
fi

echo ""

# Step 2: Environment Setup
print_step "2" "Environment Setup and Configuration"
log_message "Step 2: Setting up environment..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_step "2.1" "Installing project dependencies..."
    log_message "Installing dependencies..."
    npm install 2>&1 | tee -a "$LOG_FILE"
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    print_step "2.2" "Installing Supabase CLI..."
    log_message "Installing Supabase CLI..."
    npm install -g @supabase/cli 2>&1 | tee -a "$LOG_FILE"
    print_success "Supabase CLI installed"
else
    print_success "Supabase CLI already available"
fi

echo ""

# Step 3: Service Startup
print_step "3" "Starting Required Services"
log_message "Step 3: Starting services..."

print_step "3.1" "Starting Supabase local development..."
log_message "Starting Supabase..."
npx supabase start 2>&1 | tee -a "$LOG_FILE"
print_success "Supabase services started"

# Check for Redis (optional)
if command -v redis-server &> /dev/null; then
    print_step "3.2" "Starting Redis server..."
    redis-server --daemonize yes --port 6379 2>&1 | tee -a "$LOG_FILE"
    print_success "Redis started on port 6379"
else
    print_warning "Redis not found - some features may be limited"
    log_message "⚠️ Redis not available"
fi

echo ""

# Step 4: Database Setup
print_step "4" "Database Migration and Content Setup"
log_message "Step 4: Setting up database..."

print_step "4.1" "Applying database migrations..."
log_message "Applying migrations..."
npx supabase db push --local 2>&1 | tee -a "$LOG_FILE"
print_success "Database migrations applied"

print_step "4.2" "Seeding Turkish demo content..."
log_message "Seeding demo content..."
node scripts/local-demo-testing/seed-turkish-demo-content.js 2>&1 | tee -a "$LOG_FILE"
print_success "Demo content seeded"

print_step "4.3" "Creating demo users..."
log_message "Creating demo users..."
node scripts/local-demo-testing/create-local-demo-users.js 2>&1 | tee -a "$LOG_FILE"
print_success "Demo users created"

echo ""

# Step 5: Application Build and Testing
print_step "5" "Application Build and Unit Testing"
log_message "Step 5: Building and testing application..."

print_step "5.1" "Building application..."
log_message "Building application..."
npm run build 2>&1 | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    print_success "Application built successfully"
    log_message "✅ Build successful"
else
    print_error "Application build failed"
    log_message "❌ Build failed"
    exit 1
fi

print_step "5.2" "Running unit tests..."
log_message "Running unit tests..."
npm test 2>&1 | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    print_success "Unit tests passed"
    log_message "✅ Unit tests passed"
else
    print_warning "Some unit tests failed - check log for details"
    log_message "⚠️ Unit tests had failures"
fi

echo ""

# Step 6: Generate Test Documentation
print_step "6" "Generating Test Documentation"
log_message "Step 6: Generating test documentation..."

node scripts/local-demo-testing/generate-test-report.js 2>&1 | tee -a "$LOG_FILE"
print_success "Test documentation generated"
log_message "✅ Test documentation complete"

echo ""

# Step 7: Comprehensive Testing
print_step "7" "Running Comprehensive Test Suite"
log_message "Step 7: Running comprehensive tests..."

print_step "7.1" "Starting development server for testing..."
log_message "Starting dev server for testing..."

# Start Next.js in background for testing
npm run dev &
DEV_SERVER_PID=$!
echo "Development server PID: $DEV_SERVER_PID" >> "$LOG_FILE"

# Wait for server to be ready
print_step "7.2" "Waiting for server to be ready..."
sleep 15

# Check if server is responding
if curl -s http://localhost:3000/api/health > /dev/null; then
    print_success "Development server is responding"
    log_message "✅ Dev server ready"
else
    print_error "Development server failed to start properly"
    log_message "❌ Dev server not responding"
    kill $DEV_SERVER_PID 2>/dev/null || true
    exit 1
fi

print_step "7.3" "Running comprehensive test suite..."
log_message "Running comprehensive test suite..."
node scripts/local-demo-testing/comprehensive-test-runner.js 2>&1 | tee -a "$LOG_FILE"
TEST_EXIT_CODE=$?

# Stop development server
kill $DEV_SERVER_PID 2>/dev/null || true
print_success "Development server stopped"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "Comprehensive tests completed successfully"
    log_message "✅ Comprehensive tests passed"
else
    print_error "Some comprehensive tests failed - check results"
    log_message "⚠️ Comprehensive tests had failures"
fi

echo ""

# Step 8: Results Summary
print_step "8" "Results Summary and Reporting"
log_message "Step 8: Generating final results..."

WORKFLOW_END_TIME=$(date +%s)
WORKFLOW_DURATION=$((WORKFLOW_END_TIME - WORKFLOW_START_TIME))
WORKFLOW_DURATION_MIN=$((WORKFLOW_DURATION / 60))
WORKFLOW_DURATION_SEC=$((WORKFLOW_DURATION % 60))

print_header "🎉 Local Demo Testing Workflow Complete!"

echo "📊 Workflow Summary:"
echo "├── ⏱️  Total Duration: ${WORKFLOW_DURATION_MIN}m ${WORKFLOW_DURATION_SEC}s"
echo "├── 📋 Log File: $LOG_FILE"
echo "├── 📁 Results Directory: $RESULTS_DIR/"
echo "└── 🎯 Test Status: $([ $TEST_EXIT_CODE -eq 0 ] && echo "SUCCESS" || echo "PARTIAL SUCCESS")"
echo ""

echo "📋 Generated Test Assets:"
echo "├── 📋 Interactive Checklist: $RESULTS_DIR/local-demo-test-checklist.html"
echo "├── 📝 Markdown Checklist: $RESULTS_DIR/local-demo-test-checklist.md"
echo "├── 📊 Test Results: $RESULTS_DIR/local-demo-test-results.json"
echo "├── 🌐 Test Report: $RESULTS_DIR/local-demo-test-report.html"
echo "├── 🔑 Demo Credentials: $RESULTS_DIR/demo-user-credentials.json"
echo "└── 📖 Instructions: $RESULTS_DIR/local-demo-testing-instructions.md"
echo ""

echo "👥 Demo User Accounts:"
echo "├── 📚 Admin: admin@istanbul-demo-ortaokulu.edu.tr"
echo "├── 🎓 Teacher: ogretmen@istanbul-demo-ortaokulu.edu.tr"
echo "├── 📖 Student: ogrenci@istanbul-demo-ortaokulu.edu.tr"
echo "└── 👨‍👩‍👧‍👦 Parent: veli@istanbul-demo-ortaokulu.edu.tr"
echo ""

echo "🔗 Quick Access URLs:"
echo "├── 🌐 Application: http://localhost:3000"
echo "├── 🗄️  Supabase Studio: http://localhost:54323"
echo "├── 📧 Email Testing: http://localhost:54324"
echo "└── 📋 Test Checklist: file://$(pwd)/$RESULTS_DIR/local-demo-test-checklist.html"
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "🎯 All tests passed! System ready for production deployment."
    log_message "🎯 Workflow completed successfully - ready for production"
    
    echo ""
    echo "🚀 Next Steps for Production:"
    echo "1. Review test results and fix any minor issues"
    echo "2. Create production environment configuration"
    echo "3. Deploy to demo.i-ep.app"
    echo "4. Run production verification tests"
    echo ""
    
else
    print_warning "⚠️ Some tests failed. Review results before production deployment."
    log_message "⚠️ Workflow completed with some test failures"
    
    echo ""
    echo "🔧 Recommended Actions:"
    echo "1. Review test results in: $RESULTS_DIR/local-demo-test-report.html"
    echo "2. Fix critical and high-priority issues"
    echo "3. Re-run testing workflow: npm run demo:test"
    echo "4. Ensure 95%+ test success before production"
    echo ""
fi

print_header "Testing Workflow Complete"

# Final log entry
log_message "Workflow completed in ${WORKFLOW_DURATION_MIN}m ${WORKFLOW_DURATION_SEC}s"
log_message "========================================="

# Open test results if possible
if command -v open >/dev/null 2>&1; then
    echo "🌐 Opening test checklist..."
    open "file://$(pwd)/$RESULTS_DIR/local-demo-test-checklist.html"
elif command -v xdg-open >/dev/null 2>&1; then
    echo "🌐 Opening test checklist..."
    xdg-open "file://$(pwd)/$RESULTS_DIR/local-demo-test-checklist.html"
fi

exit $TEST_EXIT_CODE