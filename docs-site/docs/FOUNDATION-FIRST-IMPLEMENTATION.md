# Foundation-First Implementation Guide

> **Technical Implementation Guide**  
> **İ-EP.APP Foundation-First Strategy**  
> **Version**: 1.0  
> **Date**: 15 Temmuz 2025

## 🎯 Implementation Overview

This guide provides technical implementation details for the Foundation-First strategy, focusing on transforming UI mockups into fully functional features.

## 📋 Phase 1: Stabilization - Technical Tasks

### 1. Build Error Fixes

#### Assignment Page `createContext` Error
```typescript
// Problem: /dashboard/assignments/[id]/page.tsx
// Error: a(...).createContext is not a function

// Solution: Check React imports and context usage
import { createContext } from 'react';

// Verify context implementation
const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);
```

#### Common Build Issues Checklist
- [ ] Missing React imports
- [ ] Incorrect Next.js 15 syntax
- [ ] Type definition mismatches
- [ ] Module resolution issues
- [ ] Environment variable problems

### 2. Linting Cleanup Strategy

#### TypeScript Issues (50+ errors)
```bash
# Common patterns to fix:
- @typescript-eslint/no-unused-vars
- @typescript-eslint/no-explicit-any
- @typescript-eslint/no-require-imports
- react-hooks/exhaustive-deps
```

#### Cleanup Script
```bash
#!/bin/bash
# run-linting-cleanup.sh

echo "🔧 Starting linting cleanup..."

# Fix unused variables
npx eslint --fix --ext .ts,.tsx . --fix-type suggestion

# Fix import issues
npx eslint --fix --ext .ts,.tsx . --fix-type problem

# Check remaining issues
npm run lint

echo "✅ Linting cleanup completed"
```

### 3. Security Vulnerabilities

#### Critical Vulnerability Fix
```bash
# Identify and fix critical vulnerabilities
npm audit --audit-level critical
npm audit fix --force

# Manual dependency updates
npm update
```

#### Security Checklist
- [ ] Update critical dependencies
- [ ] Fix high severity vulnerabilities
- [ ] Review moderate severity issues
- [ ] Test security fixes

## 🚀 Phase 2: API Development Pattern

### API Development Template

#### 1. API Endpoint Structure
```typescript
// /src/app/api/[feature]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Business logic
    const result = await featureService.getAll();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2. Repository Pattern Implementation
```typescript
// /src/lib/repository/BaseRepository.ts
export abstract class BaseRepository<T> {
  protected supabase: SupabaseClient;
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.supabase = createClient();
  }

  async findAll(): Promise<T[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*');
    
    if (error) throw error;
    return data;
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async create(data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
```

### Feature Implementation Pattern

#### Assignment System Implementation
```typescript
// 1. Type Definitions
interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  class_id: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

// 2. Repository Implementation
class AssignmentRepository extends BaseRepository<Assignment> {
  constructor() {
    super('assignments');
  }

  async findByClass(classId: string): Promise<Assignment[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('class_id', classId);
    
    if (error) throw error;
    return data;
  }
}

// 3. Service Layer
class AssignmentService {
  private repository: AssignmentRepository;

  constructor() {
    this.repository = new AssignmentRepository();
  }

  async createAssignment(data: Partial<Assignment>): Promise<Assignment> {
    // Validation
    if (!data.title || !data.due_date) {
      throw new Error('Title and due date are required');
    }

    // Business logic
    const assignment = await this.repository.create(data);
    
    // Additional operations (notifications, etc.)
    await this.sendNotifications(assignment);
    
    return assignment;
  }

  private async sendNotifications(assignment: Assignment): Promise<void> {
    // Notification logic
  }
}

// 4. API Endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const assignmentService = new AssignmentService();
    const assignment = await assignmentService.createAssignment(data);
    
    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 🔄 Frontend Integration Pattern

### UI Component Integration
```typescript
// Hook for API integration
function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/assignments');
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      
      const data = await response.json();
      setAssignments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (data: Partial<Assignment>) => {
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }
      
      const newAssignment = await response.json();
      setAssignments(prev => [...prev, newAssignment]);
      return newAssignment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    createAssignment,
  };
}
```

## 🧪 Testing Strategy

### Unit Test Template
```typescript
// /src/__tests__/services/AssignmentService.test.ts
import { AssignmentService } from '@/lib/services/AssignmentService';

describe('AssignmentService', () => {
  let service: AssignmentService;

  beforeEach(() => {
    service = new AssignmentService();
  });

  describe('createAssignment', () => {
    it('should create assignment with valid data', async () => {
      const assignmentData = {
        title: 'Test Assignment',
        description: 'Test description',
        due_date: '2025-08-01',
        class_id: 'class-123',
        teacher_id: 'teacher-456',
      };

      const result = await service.createAssignment(assignmentData);

      expect(result).toBeDefined();
      expect(result.title).toBe(assignmentData.title);
      expect(result.id).toBeDefined();
    });

    it('should throw error for missing required fields', async () => {
      const invalidData = {
        description: 'Test description',
      };

      await expect(service.createAssignment(invalidData))
        .rejects.toThrow('Title and due date are required');
    });
  });
});
```

### Integration Test Template
```typescript
// /src/__tests__/api/assignments.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/assignments/route';

describe('/api/assignments', () => {
  it('should create assignment successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'Test Assignment',
        description: 'Test description',
        due_date: '2025-08-01',
        class_id: 'class-123',
        teacher_id: 'teacher-456',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.title).toBe('Test Assignment');
  });
});
```

## 📊 Quality Gates

### Pre-deployment Checklist
```bash
#!/bin/bash
# quality-check.sh

echo "🔍 Running quality checks..."

# 1. Build check
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

# 2. Linting check
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed"
  exit 1
fi

# 3. Unit tests
npm run test
if [ $? -ne 0 ]; then
  echo "❌ Unit tests failed"
  exit 1
fi

# 4. Security audit
npm audit --audit-level high
if [ $? -ne 0 ]; then
  echo "❌ Security audit failed"
  exit 1
fi

echo "✅ All quality checks passed"
```

## 🚀 Deployment Strategy

### Feature Deployment Process
1. **Development**: Feature branch development
2. **Testing**: Comprehensive testing (unit + integration)
3. **Code Review**: Peer review process
4. **Staging**: Deploy to staging environment
5. **Validation**: Manual testing and validation
6. **Production**: Deploy to production

### Deployment Checklist
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Database migrations applied
- [ ] Feature flags configured
- [ ] Monitoring alerts set up

## 📋 Feature Implementation Roadmap

### Week 3: Assignment System
- [ ] Assignment CRUD API endpoints
- [ ] File upload functionality
- [ ] Submission tracking
- [ ] Grading system integration
- [ ] Notification system

### Week 4: Attendance System
- [ ] Daily attendance API
- [ ] Attendance calculation engine
- [ ] Bulk operations
- [ ] Reporting system
- [ ] Parent notifications

### Week 5: Grade Management
- [ ] Grade entry API
- [ ] Grade calculations
- [ ] Report generation
- [ ] Analytics dashboard
- [ ] Export functionality

### Week 6: Parent Communication
- [ ] Messaging system
- [ ] Email notifications
- [ ] Meeting scheduler
- [ ] Communication history
- [ ] Real-time updates

### Week 7: Report Generation
- [ ] PDF generation
- [ ] Excel export
- [ ] Custom report builder
- [ ] Automated reports
- [ ] Analytics integration

### Week 8: Class Scheduling
- [ ] Schedule generation
- [ ] Conflict detection
- [ ] Teacher assignments
- [ ] Calendar integration
- [ ] Schedule optimization

---

> **Implementation Note**: Bu guide, Foundation-First strategy'nin technical implementation detaylarını içerir. Her feature implementation'ı bu pattern'ları takip ederek systematic bir şekilde geliştirilmelidir.

**Last Updated**: 15 Temmuz 2025  
**Next Review**: 22 Temmuz 2025  
**Implementation Status**: Phase 1 - Stabilization Active