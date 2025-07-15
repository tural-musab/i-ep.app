# İ-EP.APP Code Standards & Development Guidelines

## Overview

This document establishes comprehensive coding standards for the İ-EP.APP project to ensure consistency, maintainability, and high code quality. These standards are enforced through automated tooling and code review processes.

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [TypeScript Standards](#typescript-standards)
3. [React Component Standards](#react-component-standards)
4. [API Development Standards](#api-development-standards)
5. [Database & Data Management](#database--data-management)
6. [Testing Standards](#testing-standards)
7. [Performance Guidelines](#performance-guidelines)
8. [Security Guidelines](#security-guidelines)
9. [Documentation Standards](#documentation-standards)
10. [Code Review Checklist](#code-review-checklist)

## Project Architecture

### Multi-Tenant Architecture Principles

Our application follows a multi-tenant SaaS architecture with the following key principles:

1. **Tenant Isolation**: Each tenant's data must be completely isolated
2. **Scalability**: Code should handle multiple tenants efficiently
3. **Security**: Tenant-level security controls are mandatory
4. **Performance**: Optimize for multi-tenant scenarios

### File Structure Standards

```
src/
├── app/                    # Next.js App Router
│   ├── [tenant]/          # Tenant-specific routes
│   ├── api/               # API endpoints
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Base UI components (shadcn/ui)
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── [domain]/          # Domain-specific components
├── lib/                   # Business logic & utilities
│   ├── auth/              # Authentication logic
│   ├── db/                # Database utilities
│   ├── api/               # API utilities
│   └── utils/             # General utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
├── middleware/            # Next.js middleware
└── __tests__/             # Test files
```

## TypeScript Standards

### Strict Type Safety

**🚫 FORBIDDEN:**
```typescript
// Never use 'any' type
function processData(data: any): any {
  return data.someProperty;
}

// Avoid implicit any
function getData() {
  return fetch('/api/data').then(res => res.json());
}

// Don't use unsafe type assertions
const user = data as User;
```

**✅ REQUIRED:**
```typescript
// Use explicit, specific types
interface UserData {
  id: string;
  name: string;
  email: string;
  tenantId: string;
}

// Always specify return types
async function getUserData(id: string): Promise<UserData> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json() as UserData;
}

// Use type guards for safe type checking
function isUserData(data: unknown): data is UserData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'email' in data &&
    'tenantId' in data
  );
}
```

### Interface Design Standards

**✅ Good Interface Design:**
```typescript
// Use descriptive interface names
interface ClassManagementProps {
  classId: string;
  tenantId: string;
  onClassUpdate: (classData: ClassData) => void;
  onError: (error: Error) => void;
}

// Extend base interfaces for consistency
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
}

// Use union types for controlled values
type UserRole = 'admin' | 'teacher' | 'student' | 'parent';
type ClassStatus = 'active' | 'inactive' | 'archived';

// Use generic interfaces for reusable patterns
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}
```

### Type Utility Usage

```typescript
// Use built-in utility types
type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateUserData = Partial<Pick<User, 'name' | 'email'>>;
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;

// Create custom utility types for domain-specific needs
type WithTenant<T> = T & { tenantId: string };
type ApiEndpoint<T> = (data: T) => Promise<ApiResponse<T>>;
```

## React Component Standards

### Component Architecture

**✅ Standard Component Structure:**
```tsx
'use client'; // Only when needed

// 1. React imports
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// 2. Next.js imports
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 3. Third-party library imports
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 4. Internal UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

// 5. Business logic imports
import { userService } from '@/lib/services/user-service';
import { useAuth } from '@/hooks/use-auth';

// 6. Types
import type { User, UserRole } from '@/types/user';

// Form validation schema
const userFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'teacher', 'student', 'parent']),
});

type UserFormData = z.infer<typeof userFormSchema>;

// Component props interface
interface UserManagementProps {
  tenantId: string;
  initialUsers?: User[];
  onUserUpdate?: (user: User) => void;
  className?: string;
}

// Main component
export function UserManagement({
  tenantId,
  initialUsers = [],
  onUserUpdate,
  className,
}: UserManagementProps) {
  // State declarations
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
  });

  // Memoized values
  const canManageUsers = useMemo(() => {
    return currentUser?.role === 'admin';
  }, [currentUser]);

  // Callbacks
  const handleUserSubmit = useCallback(
    async (data: UserFormData) => {
      setIsLoading(true);
      setError(null);

      try {
        const newUser = await userService.createUser({
          ...data,
          tenantId,
        });

        setUsers(prev => [...prev, newUser]);
        onUserUpdate?.(newUser);
        reset();
        
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [tenantId, onUserUpdate, reset, toast]
  );

  // Effects
  useEffect(() => {
    if (initialUsers.length === 0) {
      // Fetch users if not provided
      userService.getUsers(tenantId).then(setUsers);
    }
  }, [tenantId, initialUsers]);

  // Early returns
  if (!canManageUsers) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">You don't have permission to manage users</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => setError(null)} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleUserSubmit)} className="space-y-4">
            <div>
              <Input
                {...register('name')}
                placeholder="User Name"
                aria-describedby="name-error"
              />
              {errors.name && (
                <p id="name-error" className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Input
                {...register('email')}
                type="email"
                placeholder="Email"
                aria-describedby="email-error"
              />
              {errors.email && (
                <p id="email-error" className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </form>

          {/* User list */}
          <div className="mt-6 space-y-2">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Hook Guidelines

**✅ Proper Hook Usage:**
```tsx
// Custom hooks should be prefixed with 'use'
function useUserManagement(tenantId: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers(tenantId);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, refetch: fetchUsers };
}

// Use proper dependency arrays
useEffect(() => {
  const subscription = eventService.subscribe('user-updated', handleUserUpdate);
  return () => subscription.unsubscribe();
}, [handleUserUpdate]);

// Use useCallback for event handlers
const handleUserClick = useCallback((userId: string) => {
  router.push(`/users/${userId}`);
}, [router]);
```

## API Development Standards

### API Route Structure

**✅ Standard API Route:**
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { userService } from '@/lib/services/user-service';
import { validateTenantAccess } from '@/lib/auth/tenant-validation';

// Request validation schema
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['admin', 'teacher', 'student', 'parent']),
});

// GET endpoint
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    // Validate tenant access
    const hasAccess = await validateTenantAccess(session.user.id, tenantId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await userService.getUsers(tenantId);
    
    return NextResponse.json({
      data: users,
      success: true,
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    // Validate tenant access
    const hasAccess = await validateTenantAccess(session.user.id, tenantId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const newUser = await userService.createUser({
      ...validatedData,
      tenantId,
    });

    return NextResponse.json({
      data: newUser,
      success: true,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST /api/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Service Layer Pattern

**✅ Service Implementation:**
```typescript
// lib/services/user-service.ts
import { supabase } from '@/lib/supabase/client';
import type { User, CreateUserData, UpdateUserData } from '@/types/user';

export class UserService {
  async getUsers(tenantId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

export const userService = new UserService();
```

## Database & Data Management

### Repository Pattern

**✅ Repository Implementation:**
```typescript
// lib/repositories/user-repository.ts
import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types/user';

export class UserRepository {
  private readonly table = 'users';

  async findByTenant(tenantId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data || [];
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data, error } = await supabase
      .from(this.table)
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from(this.table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
```

### Database Query Standards

**✅ Proper Query Patterns:**
```typescript
// Always use typed queries
const { data: users, error } = await supabase
  .from('users')
  .select(`
    id,
    name,
    email,
    role,
    tenant_id,
    created_at,
    updated_at
  `)
  .eq('tenant_id', tenantId)
  .order('created_at', { ascending: false });

// Use RLS (Row Level Security) policies
const { data: classes, error } = await supabase
  .from('classes')
  .select('*')
  .eq('tenant_id', tenantId)
  .eq('is_active', true);

// Handle errors properly
if (error) {
  console.error('Database error:', error);
  throw new Error(`Failed to fetch data: ${error.message}`);
}
```

## Testing Standards

### Unit Test Structure

**✅ Component Test Example:**
```typescript
// components/UserManagement.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserManagement } from './UserManagement';
import { userService } from '@/lib/services/user-service';

// Mock the service
jest.mock('@/lib/services/user-service');
const mockUserService = userService as jest.Mocked<typeof userService>;

// Mock data
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'teacher' as const,
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('UserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user list correctly', () => {
    render(
      <UserManagement
        tenantId="tenant-1"
        initialUsers={mockUsers}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('teacher')).toBeInTheDocument();
  });

  it('creates new user on form submission', async () => {
    const newUser = {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'student' as const,
      tenantId: 'tenant-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserService.createUser.mockResolvedValue(newUser);

    render(<UserManagement tenantId="tenant-1" />);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('User Name'), {
      target: { value: 'Jane Smith' }
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'jane@example.com' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Create User'));

    await waitFor(() => {
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: expect.any(String),
        tenantId: 'tenant-1',
      });
    });
  });

  it('handles errors gracefully', async () => {
    mockUserService.createUser.mockRejectedValue(new Error('Failed to create user'));

    render(<UserManagement tenantId="tenant-1" />);

    fireEvent.change(screen.getByPlaceholderText('User Name'), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });

    fireEvent.click(screen.getByText('Create User'));

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});
```

### API Test Example

**✅ API Route Test:**
```typescript
// app/api/users/route.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from './route';
import { getServerSession } from 'next-auth';
import { userService } from '@/lib/services/user-service';

jest.mock('next-auth');
jest.mock('@/lib/services/user-service');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockUserService = userService as jest.Mocked<typeof userService>;

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns users for authenticated user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' }
      });

      mockUserService.getUsers.mockResolvedValue([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'teacher',
          tenantId: 'tenant-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]);

      const { req } = createMocks({
        method: 'GET',
        headers: { 'x-tenant-id': 'tenant-1' }
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
    });

    it('returns 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const { req } = createMocks({
        method: 'GET',
        headers: { 'x-tenant-id': 'tenant-1' }
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
```

## Performance Guidelines

### Component Optimization

**✅ Performance Best Practices:**
```tsx
// Use React.memo for components that receive stable props
export const UserCard = React.memo(({ user, onEdit }: UserCardProps) => {
  return (
    <div className="border rounded p-4">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <Button onClick={() => onEdit(user)}>Edit</Button>
    </div>
  );
});

// Use useCallback for event handlers
const handleUserEdit = useCallback((user: User) => {
  setSelectedUser(user);
  setIsModalOpen(true);
}, []);

// Use useMemo for expensive calculations
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// Optimize re-renders with proper dependencies
const fetchUsers = useCallback(async () => {
  const data = await userService.getUsers(tenantId);
  setUsers(data);
}, [tenantId]);
```

### Data Fetching Optimization

**✅ Efficient Data Fetching:**
```typescript
// Use React Query or SWR for caching
import { useQuery } from '@tanstack/react-query';

function useUsers(tenantId: string) {
  return useQuery({
    queryKey: ['users', tenantId],
    queryFn: () => userService.getUsers(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Implement pagination for large datasets
async function getUsers(tenantId: string, page = 1, limit = 20) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('tenant_id', tenantId)
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;
  return data;
}
```

## Security Guidelines

### Authentication & Authorization

**✅ Security Best Practices:**
```typescript
// Always validate user authentication
export async function protectedAction(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate tenant access
  const tenantId = request.headers.get('x-tenant-id');
  const hasAccess = await validateTenantAccess(session.user.id, tenantId);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Proceed with protected action
}

// Implement proper input validation
const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  role: z.enum(['admin', 'teacher', 'student', 'parent']),
});

// Sanitize user inputs
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}
```

### Data Protection

**✅ Data Security:**
```typescript
// Use Row Level Security (RLS) policies
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('tenant_id', tenantId) // Always filter by tenant
  .eq('id', userId); // Additional user-specific filter

// Implement audit logging
async function logUserAction(
  userId: string,
  action: string,
  resourceId: string,
  metadata?: Record<string, any>
) {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource_id: resourceId,
    metadata,
    timestamp: new Date().toISOString(),
  });
}
```

## Documentation Standards

### Code Documentation

**✅ Proper Documentation:**
```typescript
/**
 * Manages user operations for a specific tenant
 * 
 * @param tenantId - The ID of the tenant
 * @param initialUsers - Optional initial user data
 * @param onUserUpdate - Callback function called when a user is updated
 * @param className - Optional CSS class name for styling
 * 
 * @returns JSX element containing user management interface
 * 
 * @example
 * ```tsx
 * <UserManagement
 *   tenantId="tenant-123"
 *   onUserUpdate={(user) => console.log('User updated:', user)}
 * />
 * ```
 */
export function UserManagement({
  tenantId,
  initialUsers = [],
  onUserUpdate,
  className,
}: UserManagementProps) {
  // Component implementation
}

/**
 * Validates if a user has access to a specific tenant
 * 
 * @param userId - The user's ID
 * @param tenantId - The tenant's ID
 * @returns Promise resolving to true if user has access, false otherwise
 * 
 * @throws {Error} When database query fails
 */
async function validateTenantAccess(
  userId: string,
  tenantId: string
): Promise<boolean> {
  // Implementation
}
```

## Code Review Checklist

### Pre-Review Checklist

- [ ] All tests are passing
- [ ] No linting errors
- [ ] Code is properly formatted
- [ ] Types are properly defined
- [ ] No unused imports or variables
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Documentation updated

### Review Checklist

**Functionality:**
- [ ] Code works as expected
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] User experience is smooth

**Code Quality:**
- [ ] Code is readable and maintainable
- [ ] Functions are focused and small
- [ ] Names are descriptive
- [ ] No code duplication

**Architecture:**
- [ ] Follows established patterns
- [ ] Proper separation of concerns
- [ ] Multi-tenant isolation maintained
- [ ] Scalable design

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Efficient algorithms used
- [ ] Proper memoization
- [ ] Database queries optimized

**Security:**
- [ ] Input validation implemented
- [ ] Authentication checked
- [ ] Authorization enforced
- [ ] No sensitive data exposure

**Testing:**
- [ ] Unit tests cover key functionality
- [ ] Integration tests for complex flows
- [ ] Edge cases tested
- [ ] Error scenarios covered

## Tools and Automation

### Development Tools

```bash
# Linting and formatting
npm run lint          # Check for linting errors
npm run lint:fix      # Fix auto-fixable linting errors
npm run format        # Format code with Prettier
npm run format:check  # Check if code is formatted

# Type checking
npm run type-check    # Run TypeScript compiler check

# Testing
npm run test          # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:e2e      # Run end-to-end tests

# Performance analysis
npm run build:analyze # Analyze bundle size
```

### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.includeCompletionsForModuleExports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

## Conclusion

These standards are living guidelines that evolve with the project. All team members are expected to follow these standards and contribute to their improvement. Regular code reviews and automated tooling help maintain code quality and consistency across the project.

For questions or suggestions about these standards, please open an issue or start a discussion in the project repository.