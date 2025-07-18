# Development Setup & Code Quality Guidelines

## Overview

This document provides comprehensive setup instructions and code quality guidelines for the İ-EP.APP project. Following these guidelines ensures consistent, maintainable, and high-quality code across the project.

## Quick Start

### 1. Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/i-ep.app.git
cd i-ep.app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Initialize git hooks
npx husky install

# Run initial checks
npm run lint
npm run test
npm run build
```

### 2. Development Commands

```bash
# Start development server
npm run dev

# Run all quality checks
npm run lint          # Check linting
npm run lint:fix      # Fix auto-fixable issues
npm run format        # Format code
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run build         # Build project
```

## Code Quality Tools

### ESLint Configuration

Our ESLint configuration enforces:

- **Strict TypeScript rules**: No `any` types, proper typing
- **React best practices**: Hooks rules, component patterns
- **Import organization**: Sorted imports, no unused imports
- **Security rules**: No eval, proper error handling
- **Performance rules**: No await in loops, atomic updates

### Prettier Configuration

Standardized code formatting:

- **Semi-colons**: Always use semicolons
- **Quotes**: Single quotes for strings, double quotes for JSX
- **Print width**: 80 characters
- **Tab width**: 2 spaces
- **Trailing commas**: ES5 compatible

### TypeScript Configuration

Strict TypeScript settings:

- **Strict mode**: Enabled for maximum type safety
- **No emit**: Only type checking, no compilation
- **Module resolution**: Bundler for Next.js compatibility
- **Path mapping**: `@/*` for src imports

## Development Workflow

### 1. Pre-commit Hooks

Automated checks before every commit:

```bash
# Pre-commit checks run automatically
git commit -m "feat: add new feature"

# Manual pre-commit check
npm run pre-commit
```

**Pre-commit checks include:**

- TypeScript compilation
- ESLint linting (no warnings allowed)
- Prettier formatting
- Unit tests
- Common anti-pattern detection

### 2. Code Review Process

**Before submitting PR:**

- [ ] All tests pass
- [ ] No linting errors
- [ ] Code is formatted
- [ ] Types are properly defined
- [ ] Documentation updated

**Review checklist:**

- [ ] Functionality works correctly
- [ ] Code follows standards
- [ ] Performance optimized
- [ ] Security considerations addressed
- [ ] Tests cover new functionality

### 3. Common Anti-patterns to Avoid

**❌ NEVER DO:**

```typescript
// 1. Using 'any' type
function processData(data: any): any {
  return data.someProperty;
}

// 2. Unused imports
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
// Only using React and Button

// 3. Missing useEffect dependencies
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// 4. Inline event handlers in render
{items.map(item => (
  <Button key={item.id} onClick={() => handleClick(item.id)}>
    {item.name}
  </Button>
))}

// 5. Using img instead of Next.js Image
<img src="/logo.png" alt="Logo" />
```

**✅ ALWAYS DO:**

```typescript
// 1. Use specific types
interface UserData {
  id: string;
  name: string;
}

function processUserData(data: UserData): string {
  return data.name;
}

// 2. Import only what you need
import React from 'react';
import { Button } from '@/components/ui/button';

// 3. Include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);

// 4. Use useCallback for event handlers
const handleItemClick = useCallback((id: string) => {
  handleClick(id);
}, [handleClick]);

// 5. Use Next.js Image component
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={100} height={50} />
```

## VS Code Setup

### Required Extensions

Install these extensions for optimal development experience:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "yoavbls.pretty-ts-errors",
    "usernamehw.errorlens",
    "orta.vscode-jest"
  ]
}
```

### Settings Configuration

The project includes `.vscode/settings.json` with:

- **Format on save**: Enabled
- **ESLint auto-fix**: Enabled
- **Import organization**: Automatic
- **TypeScript preferences**: Optimized
- **Tailwind CSS support**: Enabled

## Component Standards

### Standard Component Structure

```tsx
'use client'; // Only if needed

// 1. React imports
import React, { useState, useCallback } from 'react';

// 2. Next.js imports
import { useRouter } from 'next/navigation';

// 3. Third-party imports
import { useForm } from 'react-hook-form';

// 4. Internal imports
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

// 5. Types
interface ComponentProps {
  tenantId: string;
  onUpdate?: (data: any) => void;
}

// 6. Component implementation
export function ComponentName({ tenantId, onUpdate }: ComponentProps) {
  // State
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const { user } = useAuth();
  const router = useRouter();

  // Callbacks
  const handleSubmit = useCallback(
    async (data: any) => {
      setIsLoading(true);
      try {
        // Implementation
        onUpdate?.(data);
      } finally {
        setIsLoading(false);
      }
    },
    [onUpdate]
  );

  // Render
  return (
    <div>
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Submit'}
      </Button>
    </div>
  );
}
```

### Hook Standards

```typescript
// Custom hook template
export function useCustomHook(param: string) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Implementation
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [param]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
```

## API Standards

### API Route Structure

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';

// Validation schema
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// GET handler
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Tenant validation
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant required' }, { status: 400 });
    }

    // 3. Business logic
    const users = await getUsersForTenant(tenantId);

    // 4. Response
    return NextResponse.json({ data: users, success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Testing Standards

### Component Testing

```typescript
// UserList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserList } from './UserList';

describe('UserList', () => {
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
  ];

  it('renders user list correctly', () => {
    render(<UserList users={mockUsers} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('handles user click', () => {
    const mockOnClick = jest.fn();
    render(<UserList users={mockUsers} onUserClick={mockOnClick} />);

    fireEvent.click(screen.getByText('John Doe'));
    expect(mockOnClick).toHaveBeenCalledWith(mockUsers[0]);
  });
});
```

### API Testing

```typescript
// api/users/route.test.ts
import { createMocks } from 'node-mocks-http';
import { GET } from './route';

describe('/api/users', () => {
  it('returns users for authenticated request', async () => {
    const { req } = createMocks({
      method: 'GET',
      headers: { 'x-tenant-id': 'tenant-1' },
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(expect.any(Array));
  });
});
```

## Performance Guidelines

### Component Optimization

```tsx
// Use React.memo for expensive components
export const UserCard = React.memo(({ user, onClick }: UserCardProps) => {
  return (
    <div onClick={() => onClick(user)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

// Use useCallback for event handlers
const handleUserClick = useCallback((user: User) => {
  setSelectedUser(user);
}, []);

// Use useMemo for expensive calculations
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);
```

### Data Fetching

```typescript
// Use proper error handling
async function fetchUsers(tenantId: string): Promise<User[]> {
  const response = await fetch(`/api/users?tenantId=${tenantId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
}

// Implement caching
const usersCache = new Map<string, User[]>();

function getCachedUsers(tenantId: string): User[] | null {
  return usersCache.get(tenantId) || null;
}
```

## Security Guidelines

### Input Validation

```typescript
// Always validate inputs
const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'teacher', 'student']),
});

// Sanitize user inputs
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}
```

### Authentication & Authorization

```typescript
// Always check authentication
export async function protectedHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check tenant access
  const tenantId = request.headers.get('x-tenant-id');
  const hasAccess = await validateTenantAccess(session.user.id, tenantId);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```

## Debugging & Troubleshooting

### Common Issues

1. **ESLint errors**: Run `npm run lint:fix` to auto-fix
2. **TypeScript errors**: Check type definitions and imports
3. **Test failures**: Run `npm run test:watch` for debugging
4. **Build errors**: Check for syntax errors and missing dependencies

### Debug Configuration

The project includes VS Code debug configurations:

- **Next.js server debugging**: Attach to running server
- **Client-side debugging**: Chrome debugging
- **Jest test debugging**: Debug individual tests

### Performance Monitoring

```typescript
// Use React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(id: string, phase: string, actualDuration: number) {
  console.log({ id, phase, actualDuration });
}

<Profiler id="UserList" onRender={onRenderCallback}>
  <UserList users={users} />
</Profiler>
```

## Deployment Checklist

Before deploying:

- [ ] All tests pass
- [ ] No linting errors
- [ ] Build completes successfully
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Performance tested
- [ ] Security audit passed

## Documentation Standards

### Code Documentation

````typescript
/**
 * Manages user operations for a specific tenant
 *
 * @param tenantId - The ID of the tenant
 * @param onUserUpdate - Callback when user is updated
 * @returns JSX element for user management
 *
 * @example
 * ```tsx
 * <UserManagement
 *   tenantId="tenant-123"
 *   onUserUpdate={(user) => console.log('Updated:', user)}
 * />
 * ```
 */
export function UserManagement({ tenantId, onUserUpdate }: Props) {
  // Implementation
}
````

### API Documentation

Use JSDoc comments for API endpoints:

```typescript
/**
 * GET /api/users - Retrieve users for a tenant
 *
 * @param request - Next.js request object
 * @returns JSON response with user list
 *
 * @throws {401} When user is not authenticated
 * @throws {403} When user lacks tenant access
 * @throws {500} When server error occurs
 */
export async function GET(request: NextRequest) {
  // Implementation
}
```

## Getting Help

### Resources

- **Documentation**: Check `/docs` directory
- **Templates**: Use templates in `/docs/templates`
- **Examples**: Review existing components
- **Issues**: Create GitHub issues for bugs

### Common Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Check linting
npm run lint:fix        # Fix linting issues
npm run format          # Format code
npm run type-check      # Check TypeScript

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run with coverage
npm run test:e2e        # Run E2E tests

# Database
npm run db:generate     # Generate database types
npm run db:push         # Push schema changes
npm run db:studio       # Open database studio
```

This setup ensures consistent, high-quality code across the İ-EP.APP project. Follow these guidelines to maintain code quality and development efficiency.
