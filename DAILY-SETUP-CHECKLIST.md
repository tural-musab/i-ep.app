# İ-EP.APP - Daily Development Setup Checklist

> **Purpose**: Ensure development environment is ready before starting daily tasks  
> **When**: Run every morning before development starts  
> **Time**: 2-3 minutes

## 🔧 Manual Actions (User Required)

### **1. Start Local Services**

```bash
# Option 1: Use automated script
./scripts/start-dev-services.sh

# Option 2: Manual Docker Compose
docker-compose -f docker-compose.dev.yml up -d
```

### **2. Verify Services Running**

```bash
# Run health check
node check-local-services.js

# Expected output: All services ✅ RUNNING
```

### **3. Environment Verification**

```bash
# Check Next.js can start
npm run dev

# Ctrl+C to stop, just verify no errors
```

## ✅ Service Requirements Checklist

### **🔴 Required Services (Must Be Running)**

- [ ] **Supabase Local** - localhost:54321 (Database & Auth)
- [ ] **Redis Local** - localhost:6379 (Caching & Sessions)
- [ ] **MinIO Local** - localhost:9000 (File Storage - S3 Compatible)

### **🟡 Optional Services (Recommended)**

- [ ] **MailHog** - localhost:1025 (Email Testing)
- [ ] **Next.js Dev** - localhost:3000 (Development Server)

## 🚨 Common Issues & Solutions

### **Redis Not Running**

```bash
# If redis fails to start
docker-compose -f docker-compose.dev.yml restart redis
```

### **MinIO Not Starting**

```bash
# Check MinIO logs
docker-compose -f docker-compose.dev.yml logs minio

# Restart if needed
docker-compose -f docker-compose.dev.yml restart minio
```

### **Port Conflicts**

```bash
# Check what's using the ports
lsof -i :6379  # Redis
lsof -i :9000  # MinIO
lsof -i :54321 # Supabase

# Kill if needed
sudo kill -9 <PID>
```

## 📋 Environment Files Priority

Development mode uses files in this order:

1. `.env.development.local` ← **Primary for development**
2. `.env.local` ← Global overrides
3. `.env.development` ← Development defaults
4. `.env` ← Global defaults

**Current Status**: ✅ All environment files properly configured

## 🎯 Development Readiness Verification

### **Quick Build Test**

```bash
# Test build works (should complete without errors)
npm run build
```

### **Quick API Test**

```bash
# Test API endpoints work
curl http://localhost:3000/api/health
# Expected: {"status": "ok"}
```

### **Database Connection Test**

```bash
# Open Supabase Studio
open http://localhost:54323
# Should show database interface
```

## ⏰ Estimated Setup Time

- **First Time Setup**: 5-10 minutes
- **Daily Startup**: 2-3 minutes
- **If Issues**: 5-15 minutes

## 🚀 Ready for Development

Once all checkboxes are ✅, you're ready to start daily development tasks!

---

**Last Updated**: 18 Temmuz 2025  
**Next Review**: When issues arise  
**Integration**: Part of daily workflow in CURRENT-SPRINT-STATUS.md
