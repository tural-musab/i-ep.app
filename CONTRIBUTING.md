# Contributing to İ-EP.APP

Thank you for considering contributing to İ-EP.APP! This document provides comprehensive guidelines for contributing to the project to ensure consistent, high-quality code.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [TypeScript Guidelines](#typescript-guidelines)
- [React Component Guidelines](#react-component-guidelines)
- [File Organization](#file-organization)
- [Testing Requirements](#testing-requirements)
- [Git Workflow](#git-workflow)
- [Code Review Process](#code-review-process)
- [Common Anti-patterns to Avoid](#common-anti-patterns-to-avoid)
- [Best Practices](#best-practices)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher
- Git
- VS Code (recommended) with the following extensions:
  - ESLint
  - Prettier
  - TypeScript Importer
  - Auto Rename Tag
  - Tailwind CSS IntelliSense

### Initial Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/your-username/i-ep.app.git
   cd i-ep.app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Verify Setup**
   ```bash
   npm run dev
   npm run lint
   npm run test
   ```

## Coding Standards

### General Principles

1. **Consistency**: Follow established patterns in the codebase
2. **Readability**: Write self-documenting code with meaningful names
3. **Maintainability**: Keep functions small and focused
4. **Performance**: Consider performance implications of your code
5. **Security**: Follow security best practices

### Code Quality Tools

- **ESLint**: Automated code linting with strict rules
- **Prettier**: Code formatting
- **TypeScript**: Type safety and compile-time error checking
- **Jest**: Unit and integration testing

## TypeScript Guidelines

### Strict Type Safety

**❌ DON'T:**
```typescript
// Using 'any' type
function processData(data: any) {
  return data.someProperty;
}

// Implicit any
function getData() {
  return fetch('/api/data').then(res => res.json());
}

// Unsafe type assertion
const user = data as User;
```

**✅ DO:**
```typescript
// Use specific types
interface UserData {
  id: string;
  name: string;
  email: string;
}

function processUserData(data: UserData): string {
  return data.name;
}

// Return type annotations
async function getUserData(): Promise<UserData> {
  const response = await fetch('/api/data');
  return response.json() as UserData;
}

// Safe type assertion with type guards
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

### Interface and Type Definitions

**✅ Good practices:**
```typescript
// Use interfaces for object shapes
interface ClassProps {
  id: string;
  name: string;
  studentCount: number;
  isActive: boolean;
}

// Use union types for controlled values
type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

// Use generic types for reusable components
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
```

### Utility Types

Use TypeScript utility types for better type safety:

```typescript
// Partial for optional updates
function updateUser(id: string, updates: Partial<User>): Promise<User> {
  // Implementation
}

// Pick for selecting specific properties
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;

// Omit for excluding properties
type CreateUserData = Omit<User, 'id' | 'createdAt'>;
```

## React Component Guidelines

### Component Structure

**✅ Recommended structure:**
```tsx
'use client'; // Only if needed for client components

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Types/Interfaces
interface User {
  id: string;
  name: string;
  email: string;
}

interface UserListProps {
  users: User[];
  onUserSelect: (user: User) => void;
  className?: string;
}

// Component
export function UserList({ users, onUserSelect, className }: UserListProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleUserClick = useCallback((user: User) => {
    setSelectedUser(user);
    onUserSelect(user);
  }, [onUserSelect]);

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {users.map(user => (
        <Card key={user.id} className="mb-4">
          <CardContent>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <Button onClick={() => handleUserClick(user)}>
              Select
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Hook Guidelines

**✅ Proper hook usage:**
```tsx
// useEffect with proper dependencies
useEffect(() => {
  fetchUsers();
}, [fetchUsers]); // Include all dependencies

// useCallback for event handlers
const handleSubmit = useCallback((data: FormData) => {
  // Handle form submission
}, []);

// useMemo for expensive calculations
const filteredUsers = useMemo(() => {
  return users.filter(user => user.isActive);
}, [users]);
```

**❌ Avoid:**
```tsx
// Missing dependencies
useEffect(() => {
  fetchUsers();
}, []); // Missing fetchUsers dependency

// Unnecessary inline functions
<Button onClick={() => handleClick(id)}>Click</Button>

// Should use useCallback:
const handleClick = useCallback((id: string) => {
  // Handle click
}, []);
```

### State Management

**✅ Good practices:**
```tsx
// Use specific state types
const [loading, setLoading] = useState<boolean>(false);
const [users, setUsers] = useState<User[]>([]);
const [error, setError] = useState<string | null>(null);

// Group related state
interface FormState {
  name: string;
  email: string;
  isValid: boolean;
}

const [formState, setFormState] = useState<FormState>({
  name: '',
  email: '',
  isValid: false,
});
```

## File Organization

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [tenant]/          # Multi-tenant routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/                # Base UI components
│   ├── forms/             # Form components
│   └── layout/            # Layout components
├── lib/                   # Utility functions
│   ├── auth/              # Authentication utilities
│   ├── db/                # Database utilities
│   └── utils/             # General utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── styles/                # Additional styles
└── __tests__/             # Test files
```

### Naming Conventions

**Files and Directories:**
- Use kebab-case for file names: `user-profile.tsx`
- Use PascalCase for component files: `UserProfile.tsx`
- Use camelCase for utility files: `formatDate.ts`

**Variables and Functions:**
- Use camelCase: `userName`, `handleSubmit`
- Use PascalCase for components: `UserProfile`, `FormInput`
- Use UPPER_SNAKE_CASE for constants: `API_BASE_URL`

**Types and Interfaces:**
- Use PascalCase: `UserProfile`, `ApiResponse`
- Prefix interfaces with 'I' only when necessary to avoid conflicts

### Import Organization

**✅ Proper import order:**
```tsx
// 1. React and Next.js imports
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';

// 2. Third-party library imports
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';

// 3. Internal imports (components, utils, etc.)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { User } from '@/types/user';
```

## Testing Requirements

### Unit Tests

Every component and utility function should have unit tests:

```typescript
// Example: UserProfile.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('renders user information correctly', () => {
    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('handles user update', () => {
    const mockOnUpdate = jest.fn();
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByText('Edit'));
    // Test edit functionality
  });
});
```

### Integration Tests

Test API routes and complex workflows:

```typescript
// Example: API route test
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/users/route';

describe('/api/users', () => {
  it('returns user list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        users: expect.any(Array),
      })
    );
  });
});
```

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

### Commit Messages

Follow conventional commits:

```
feat: add user profile component
fix: resolve authentication issue
docs: update contributing guidelines
refactor: improve error handling
test: add unit tests for UserProfile
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/user-profile
   ```

2. **Make Changes and Test**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add user profile component"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/user-profile
   ```

5. **PR Requirements**
   - Pass all CI checks
   - Include tests for new functionality
   - Update documentation if needed
   - Get code review approval

## Code Review Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No linting errors
- [ ] Performance considerations addressed

### Review Checklist

**Functionality:**
- [ ] Code works as expected
- [ ] Edge cases are handled
- [ ] Error handling is appropriate

**Code Quality:**
- [ ] Code is readable and maintainable
- [ ] No code duplication
- [ ] Functions are focused and small
- [ ] Names are descriptive

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Efficient algorithms used
- [ ] Proper memoization where needed

**Security:**
- [ ] No security vulnerabilities
- [ ] Input validation present
- [ ] No sensitive data exposure

## Common Anti-patterns to Avoid

### 1. Using `any` Type

**❌ DON'T:**
```typescript
function processData(data: any) {
  return data.someProperty;
}
```

**✅ DO:**
```typescript
interface UserData {
  id: string;
  name: string;
}

function processUserData(data: UserData): string {
  return data.name;
}
```

### 2. Unused Imports

**❌ DON'T:**
```typescript
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// Only using React and Button
```

**✅ DO:**
```typescript
import React from 'react';
import { Button } from '@/components/ui/button';
// Only import what you use
```

### 3. Missing Dependencies in useEffect

**❌ DON'T:**
```typescript
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency
```

**✅ DO:**
```typescript
useEffect(() => {
  fetchData(userId);
}, [userId]); // Include all dependencies
```

### 4. Inline Event Handlers

**❌ DON'T:**
```tsx
{items.map(item => (
  <Button key={item.id} onClick={() => handleClick(item.id)}>
    {item.name}
  </Button>
))}
```

**✅ DO:**
```tsx
const handleItemClick = useCallback((id: string) => {
  handleClick(id);
}, [handleClick]);

{items.map(item => (
  <Button key={item.id} onClick={() => handleItemClick(item.id)}>
    {item.name}
  </Button>
))}
```

### 5. Using img Instead of Next.js Image

**❌ DON'T:**
```tsx
<img src="/logo.png" alt="Logo" />
```

**✅ DO:**
```tsx
import Image from 'next/image';

<Image src="/logo.png" alt="Logo" width={100} height={50} />
```

## Best Practices

### 1. Component Design

- Keep components small and focused
- Use composition over inheritance
- Implement proper prop validation with TypeScript
- Handle loading and error states

### 2. State Management

- Use local state for component-specific data
- Lift state up when needed by multiple components
- Consider using context for app-wide state
- Use proper state initialization

### 3. Performance Optimization

- Use React.memo for expensive components
- Implement useCallback for event handlers
- Use useMemo for expensive calculations
- Avoid creating objects in render

### 4. Error Handling

- Implement proper error boundaries
- Handle async errors gracefully
- Provide meaningful error messages
- Log errors for debugging

### 5. Accessibility

- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers

### 6. Security

- Validate all user inputs
- Sanitize data before displaying
- Use HTTPS for all communications
- Implement proper authentication

## Tools and Scripts

### Development Commands

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Build project
npm run build

# Type checking
npx tsc --noEmit
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
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## Getting Help

- **Documentation**: Check the project documentation in `/docs`
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Code Review**: Ask team members for code review feedback

## Contributing Workflow Summary

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes following these guidelines
4. **Test** your changes thoroughly
5. **Commit** with descriptive messages
6. **Push** to your fork
7. **Submit** a pull request
8. **Respond** to code review feedback
9. **Merge** when approved

Thank you for contributing to İ-EP.APP! Your contributions help make this project better for everyone.