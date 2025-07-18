#!/bin/bash
# İ-EP.APP Development Services Startup Script

set -e

echo "🚀 İ-EP.APP Development Services Startup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_status $RED "❌ Docker is not running! Please start Docker first."
    exit 1
fi

print_status $GREEN "✅ Docker is running"

# Check if docker-compose.dev.yml exists
if [ ! -f "docker-compose.dev.yml" ]; then
    print_status $RED "❌ docker-compose.dev.yml not found!"
    exit 1
fi

# Start development services
print_status $BLUE "🐳 Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
print_status $YELLOW "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
print_status $BLUE "🔍 Checking service health..."

# Check Redis
if docker-compose -f docker-compose.dev.yml exec redis redis-cli ping > /dev/null 2>&1; then
    print_status $GREEN "✅ Redis is ready"
else
    print_status $RED "❌ Redis failed to start"
fi

# Check MinIO
if curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    print_status $GREEN "✅ MinIO is ready"
else
    print_status $YELLOW "⚠️  MinIO might still be starting..."
fi

# Check MailHog
if curl -f http://localhost:8025 > /dev/null 2>&1; then
    print_status $GREEN "✅ MailHog is ready"
else
    print_status $YELLOW "⚠️  MailHog might still be starting..."
fi

echo ""
print_status $GREEN "🎉 Development services startup complete!"
echo ""
print_status $BLUE "📋 Service URLs:"
print_status $NC "   • Redis: localhost:6379 (password: dev-redis-password)"
print_status $NC "   • MailHog Web UI: http://localhost:8025"
print_status $NC "   • MailHog SMTP: localhost:1025"
print_status $NC "   • MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
print_status $NC "   • MinIO API: http://localhost:9000"
echo ""
print_status $YELLOW "💡 To stop services: ./scripts/stop-dev-services.sh"
print_status $YELLOW "💡 To check status: node check-local-services.js"