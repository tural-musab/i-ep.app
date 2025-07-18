# İ-EP.APP Development Environment Setup

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Node.js 18+ installed
- Git repository cloned

### 1. Start Development Services
```bash
# Start all required local services
./scripts/start-dev-services.sh
```

### 2. Verify Environment
```bash
# Check if all services are running
node check-local-services.js
```

### 3. Start Development Server
```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

## 📋 Development Services

### Required Services
- **Supabase Local**: http://localhost:54321 ✅ (Already running)
- **Redis Local**: localhost:6379 (Docker - Redis cache)

### Optional Services  
- **MailHog**: http://localhost:8025 (Email testing UI)
- **MinIO**: http://localhost:9001 (S3-compatible storage console)

## 🔧 Service Management

### Start Services
```bash
./scripts/start-dev-services.sh
```

### Stop Services
```bash
./scripts/stop-dev-services.sh
```

### Check Service Status
```bash
node check-local-services.js
```

## 🐳 Docker Services

### Redis Configuration
- **Port**: 6379
- **Password**: dev-redis-password
- **Database**: 1
- **Health Check**: Automatic

### MailHog Configuration
- **SMTP Port**: 1025
- **Web UI**: http://localhost:8025
- **Storage**: Persistent maildir

### MinIO Configuration
- **API Port**: 9000
- **Console Port**: 9001
- **Credentials**: minioadmin / minioadmin123
- **Bucket**: dev-local-bucket (auto-created)

## 🔐 Environment Variables

Development environment uses `.env.development.local`:

```bash
# Supabase (Local instance)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321

# Redis (Docker instance with password)
UPSTASH_REDIS_URL=redis://:dev-redis-password@localhost:6379

# Email (MailHog)
EMAIL_SERVER_HOST=localhost
EMAIL_SERVER_PORT=1025

# Storage (MinIO)
CLOUDFLARE_R2_ENDPOINT=http://localhost:9000
CLOUDFLARE_R2_BUCKET_NAME=dev-local-bucket
```

## 🛠️ Troubleshooting

### Redis Connection Issues
```bash
# Check Redis container
docker ps | grep redis

# Test Redis connection
docker exec i-ep-redis-dev redis-cli ping
```

### MinIO Issues
```bash
# Check MinIO container
docker ps | grep minio

# Access MinIO console
open http://localhost:9001
```

### MailHog Issues
```bash
# Check MailHog container
docker ps | grep mailhog

# Access MailHog UI
open http://localhost:8025
```

### Complete Reset
```bash
# Stop all services and remove data
./scripts/stop-dev-services.sh
# Answer 'y' when prompted to remove volumes

# Start fresh
./scripts/start-dev-services.sh
```

## 🔍 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Next.js Dev | http://localhost:3000 | - |
| Supabase Studio | http://localhost:54323 | - |
| Redis | localhost:6379 | `dev-redis-password` |
| MailHog UI | http://localhost:8025 | - |
| MinIO Console | http://localhost:9001 | `minioadmin/minioadmin123` |

## 📝 Development Notes

- All services run in Docker containers for isolation
- Data persists between restarts (use stop script with volume removal to reset)
- Redis has password authentication for production similarity
- MinIO automatically creates the development bucket
- MailHog captures all emails sent during development