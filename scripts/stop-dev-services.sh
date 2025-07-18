#!/bin/bash
# İ-EP.APP Development Services Stop Script

set -e

echo "🛑 İ-EP.APP Development Services Stop"
echo "===================================="

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

# Check if docker-compose.dev.yml exists
if [ ! -f "docker-compose.dev.yml" ]; then
    print_status $RED "❌ docker-compose.dev.yml not found!"
    exit 1
fi

print_status $BLUE "🐳 Stopping development services..."
docker-compose -f docker-compose.dev.yml down

print_status $GREEN "✅ All development services stopped"

# Option to remove volumes (data cleanup)
echo ""
read -p "Do you want to remove all data volumes? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status $YELLOW "🧹 Removing data volumes..."
    docker-compose -f docker-compose.dev.yml down -v
    print_status $GREEN "✅ Data volumes removed"
else
    print_status $BLUE "📦 Data volumes preserved"
fi

echo ""
print_status $GREEN "🎉 Development services cleanup complete!"
print_status $YELLOW "💡 To start services again: ./scripts/start-dev-services.sh"