# İ-EP.APP Authentication Test Setup

> **Purpose**: Yarın (19 Temmuz) için authentication testing hazırlığı  
> **Target**: All 14 API endpoints authentication verification  
> **Duration**: 1-2 hours

## 🔐 Demo Credentials

### **Test User Accounts**

#### **Teacher Account (Primary)**

```
Email: teacher@demo.i-ep.app
Password: DemoTeacher123!
Role: teacher
Permissions: Create assignments, grade students, view classes
```

#### **Admin Account (Secondary)**

```
Email: admin@demo.i-ep.app
Password: DemoAdmin123!
Role: admin
Permissions: Full access to all features
```

#### **Student Account (Testing)**

```
Email: student@demo.i-ep.app
Password: DemoStudent123!
Role: student
Permissions: View assignments, submit work, view grades
```

## 🎯 Authentication Test Targets

### **14 API Endpoints to Test**

#### **Core Systems (Ready)**

1. **`/api/students`** - ✅ GET (Teacher/Admin access)
2. **`/api/teachers`** - ✅ GET (Admin access)
3. **`/api/classes`** - ✅ GET (All authenticated users)
4. **`/api/assignments`** - ✅ GET/POST (Teacher/Admin)
5. **`/api/attendance`** - ✅ GET/POST (Teacher/Admin)

#### **Dashboard APIs (Today's Work)**

6. **`/api/assignments/statistics`** - ✅ GET (Teacher/Admin)
7. **`/api/grades/analytics`** - ✅ GET (Teacher/Admin)
8. **`/api/attendance/statistics`** - ✅ GET (Teacher/Admin)

#### **Advanced Features (Pending)**

9. **`/api/grades`** - 🔴 Database deployment needed
10. **`/api/parent-communication`** - 🔴 Import fixes needed
11. **`/api/storage/upload`** - ✅ File upload (Teacher/Admin)
12. **`/api/health`** - ✅ Public endpoint
13. **`/api/tenant/current`** - ✅ Authenticated users
14. **`/api/super-admin/tenants`** - ✅ Super admin only

## 🧪 Test Script Template

### **Manual Testing Steps**

```bash
# 1. Health Check (No auth required)
curl http://localhost:3001/api/health

# 2. Protected endpoint (Should fail without auth)
curl http://localhost:3001/api/assignments

# 3. Login and get session
# Via browser: http://localhost:3001/auth/giris

# 4. Test with session cookie
curl -b "session_cookie" http://localhost:3001/api/assignments

# 5. Test different roles
# Login as teacher, admin, student and test permissions
```

### **Automated Test Scenarios**

```typescript
// Test scenarios for tomorrow
const testScenarios = [
  {
    name: 'Teacher can access assignments',
    endpoint: '/api/assignments',
    method: 'GET',
    role: 'teacher',
    expected: 200,
  },
  {
    name: 'Student cannot create assignments',
    endpoint: '/api/assignments',
    method: 'POST',
    role: 'student',
    expected: 403,
  },
  {
    name: 'Admin can access all endpoints',
    endpoint: '/api/super-admin/tenants',
    method: 'GET',
    role: 'admin',
    expected: 200,
  },
];
```

## 🔧 Quick Setup Commands

### **Development Environment**

```bash
# Start services
./scripts/start-dev-services.sh

# Start development server
npm run dev

# Test API health
curl http://localhost:3001/api/health
```

### **Browser Testing**

```bash
# Open dashboard
open http://localhost:3001/dashboard

# Login page
open http://localhost:3001/auth/giris

# Assignment dashboard
open http://localhost:3001/dashboard/assignments
```

## 📋 Tomorrow's Test Checklist

### **Authentication Flow Testing**

- [ ] User login/logout flow
- [ ] Session persistence
- [ ] Role-based access control
- [ ] Token refresh mechanism
- [ ] Multi-tenant isolation

### **API Endpoint Testing**

- [ ] All 14 endpoints respond correctly
- [ ] Proper error messages for unauthorized access
- [ ] Role-based permissions working
- [ ] Request/response format validation
- [ ] Performance under load

### **Integration Testing**

- [ ] Dashboard components with real authentication
- [ ] API calls with proper headers
- [ ] Error handling for auth failures
- [ ] Loading states during authentication

## 🚨 Known Issues to Address

### **Critical**

1. **Grade API** - Database deployment needed
2. **Parent Communication** - Import fixes needed
3. **Production URLs** - Placeholder values causing build errors

### **Medium Priority**

1. **TypeScript errors** - 100+ remaining
2. **ESLint warnings** - Code quality
3. **Performance optimization** - Bundle size

---

**Prepared**: 18 Temmuz 2025, 17:45  
**Ready for**: 19 Temmuz 2025, 09:00  
**Duration**: 1-2 hours testing  
**Success Criteria**: All 14 APIs working with proper authentication
