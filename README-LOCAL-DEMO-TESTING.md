# İ-EP.APP Local Demo Testing Guide

> **Professional Local Testing Environment Setup**
> 
> This guide provides comprehensive instructions for setting up and executing local testing that mirrors production deployment. This systematic approach minimizes production risks and ensures 100% confidence before going live.

## 🚀 Quick Start

### One-Command Setup
```bash
# Complete environment setup
npm run demo:setup
```

### Manual Setup Steps
```bash
# 1. Install dependencies
npm install

# 2. Start Supabase
npm run supabase:start

# 3. Seed demo content
npm run demo:seed

# 4. Create demo users
npm run demo:users

# 5. Generate test documentation
npm run demo:report

# 6. Run comprehensive tests
npm run demo:test
```

## 📋 Available Commands

### Demo Environment Management
- `npm run demo:setup` - Complete environment setup
- `npm run demo:seed` - Seed Turkish demo content
- `npm run demo:users` - Create demo users for all roles
- `npm run demo:test` - Run comprehensive test suite
- `npm run demo:report` - Generate test documentation
- `npm run demo:cleanup` - Clean up demo users

### Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

### Supabase Commands
- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:status` - Check Supabase status
- `npm run supabase:reset` - Reset local database

## 🏫 Demo Environment Details

### Tenant Information
- **School**: Istanbul Demo Ortaokulu
- **Tenant ID**: `istanbul-demo-ortaokulu`
- **Domain**: istanbul-demo-ortaokulu.edu.tr
- **Location**: Kadıköy, Istanbul, Türkiye

### Demo Users

| Role | Email | Password | Access Level |
|------|--------|----------|--------------|
| **Admin** | admin@istanbul-demo-ortaokulu.edu.tr | Demo2025!Admin | Full system administration |
| **Teacher** | ogretmen@istanbul-demo-ortaokulu.edu.tr | Demo2025!Teacher | Classes, assignments, grades |
| **Student** | ogrenci@istanbul-demo-ortaokulu.edu.tr | Demo2025!Student | Assignments, grades (read-only) |
| **Parent** | veli@istanbul-demo-ortaokulu.edu.tr | Demo2025!Parent | Child's information, communication |

### Turkish Educational Content

#### Subjects (Dersler)
- **Türkçe** (Turkish Language) - Weight: 4
- **Matematik** (Mathematics) - Weight: 4  
- **Fen Bilimleri** (Science) - Weight: 3
- **Sosyal Bilgiler** (Social Studies) - Weight: 3
- **İngilizce** (English) - Weight: 3
- **DKAB** (Religious Culture) - Weight: 2
- **Beden Eğitimi** (Physical Education) - Weight: 2
- **Resim** (Art) - Weight: 1
- **Müzik** (Music) - Weight: 1

#### Classes (Sınıflar)
- **5/A** (Grade 5A) - 24 students, Teacher: Ayşe KAYA
- **5/B** (Grade 5B) - 25 students, Teacher: Mehmet DEMİR
- **6/A** (Grade 6A) - 23 students, Teacher: Fatma ÖZDEMİR
- **6/B** (Grade 6B) - 25 students, Teacher: Ali YILMAZ
- **7/A** (Grade 7A) - 24 students, Teacher: Zeynep KAAN
- **8/A** (Grade 8A) - 22 students, Teacher: Ayşe KAYA

#### Grading System
Turkish Education System (AA-FF):
- **AA**: 90-100 (Excellent)
- **BA**: 85-89 (Very Good)
- **BB**: 70-84 (Good)
- **CB**: 65-69 (Satisfactory)
- **CC**: 60-64 (Sufficient)
- **DC**: 50-59 (Conditional Pass)
- **DD**: 45-49 (Conditional Fail)
- **FD**: 25-44 (Fail)
- **FF**: 0-24 (Fail)

## 🧪 Testing Strategy

### Test Categories

#### 1. Environment Testing
- Node.js version compatibility
- Environment variables configuration
- Service availability (Supabase, Redis, MinIO)
- Port conflict detection

#### 2. Database Testing
- Supabase connection verification
- Tenant isolation testing
- Turkish character encoding
- Demo data integrity
- RLS policies validation

#### 3. Authentication Testing
- Login flow for all 4 roles
- Role-based navigation
- Session management
- Permission enforcement
- Multi-tenant access control

#### 4. API Testing
- Health check endpoints
- Assignment API functionality
- Attendance API functionality
- Grade management API
- Statistics and analytics APIs
- Error handling and validation

#### 5. Frontend Testing
- Dashboard functionality for all roles
- Turkish content display
- Mobile responsiveness
- Loading states and error handling
- Form submissions and validation

#### 6. Turkish Content Testing
- Character encoding (çğıöşüÇĞIÖŞÜ)
- Educational content accuracy
- Turkish grading system
- Locale settings (tr_TR)
- Timezone (Europe/Istanbul)

#### 7. Performance Testing
- Page load times (<2 seconds)
- API response times (<1 second)
- Build performance
- Memory usage monitoring

## 📊 Test Reports and Documentation

### Generated Files
After running the setup, you'll find these files in `test-results/`:

- **`local-demo-test-checklist.html`** - Interactive testing checklist
- **`local-demo-test-checklist.md`** - Markdown version of checklist
- **`local-demo-testing-instructions.md`** - Detailed testing procedures
- **`demo-user-credentials.json`** - Demo user account information
- **`demo-content-summary.json`** - Turkish content summary
- **`test-configuration-summary.json`** - Test environment configuration

### Live Testing Checklist
The HTML checklist (`local-demo-test-checklist.html`) includes:
- ✅ Interactive checkboxes with progress tracking
- 🎯 Priority-based test organization
- 📱 Mobile-responsive design
- 💾 Local storage for progress persistence
- 🔗 Quick access links to services

## 🔧 Service URLs

### Local Development URLs
- **Application**: http://localhost:3000
- **Supabase API**: http://127.0.0.1:54321
- **Supabase Studio**: http://localhost:54323
- **Email Testing (Inbucket)**: http://localhost:54324
- **Redis**: localhost:6379
- **MinIO**: http://localhost:9000 (if available)

### Key Endpoints to Test
- `GET /api/health` - System health check
- `GET /api/assignments` - Assignment management
- `GET /api/attendance/statistics` - Attendance analytics
- `GET /api/grades/analytics` - Grade analytics
- `GET /api/classes` - Class management

## 🚨 Troubleshooting

### Common Issues

#### Supabase Connection Issues
```bash
# Check Supabase status
npm run supabase:status

# Restart Supabase
npm run supabase:stop
npm run supabase:start

# Reset database if needed
npm run supabase:reset
```

#### Authentication Errors
```bash
# Recreate demo users
npm run demo:cleanup
npm run demo:users
```

#### Turkish Character Issues
- Ensure UTF-8 encoding in database
- Check browser locale settings
- Verify environment variable: `NEXT_PUBLIC_LOCALE=tr`

#### Port Conflicts
- Check for other services running on ports 3000, 54321-54327
- Stop conflicting services or change ports in configuration

### Debug Information
```bash
# Check Next.js build
npm run build

# Run tests with verbose output
npm test -- --verbose

# Check Supabase logs
npx supabase logs
```

## 📈 Success Criteria

### Critical Requirements (Must Pass)
- ✅ All authentication flows working
- ✅ Database connectivity established
- ✅ Turkish content displaying correctly
- ✅ API endpoints responding correctly
- ✅ No critical security issues

### High Priority Requirements
- ✅ Performance within acceptable limits
- ✅ Mobile responsiveness working
- ✅ Error handling implemented
- ✅ All demo content accessible

### Medium Priority Requirements
- ✅ Analytics system functional
- ✅ File upload working
- ✅ Email notifications configured

## 🎯 Next Steps

### After Successful Local Testing
1. **Document Issues**: Record any problems found during testing
2. **Fix Critical Issues**: Resolve all critical and high-priority issues
3. **Re-test**: Run comprehensive tests again to verify fixes
4. **Prepare Production**: Create production deployment checklist
5. **Deploy**: Deploy to demo.i-ep.app with confidence

### Production Deployment Readiness
Once local testing shows 95%+ success rate:
- Create production environment configuration
- Set up production database and users
- Configure production domains and certificates
- Deploy to production with monitoring

## 📞 Support

For issues or questions during testing:
1. Check the troubleshooting section above
2. Review generated test reports for specific errors
3. Check browser console and Next.js terminal for error messages
4. Verify all services are running with `npm run supabase:status`

---

**Generated by İ-EP.APP Local Demo Testing System**  
**Professional testing approach for production confidence**