/**
 * Component Template for İ-EP.APP
 *
 * This template provides a standardized structure for React components
 * following the project's coding standards and best practices.
 */

'use client'; // Only include if component needs client-side interactivity

// 1. React imports
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// 2. Next.js imports
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
import { useAuth } from '@/hooks/use-auth';
import { useTenant } from '@/hooks/use-tenant';

// 6. Types and interfaces
import type { User, Tenant } from '@/types';

// ============================================================================
// SCHEMAS AND VALIDATION
// ============================================================================

const componentFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
});

type ComponentFormData = z.infer<typeof componentFormSchema>;

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface ComponentProps {
  /**
   * The tenant ID for multi-tenant isolation
   */
  tenantId: string;

  /**
   * Initial data for the component
   */
  initialData?: ComponentFormData;

  /**
   * Callback function called when data is updated
   */
  onDataUpdate?: (data: ComponentFormData) => void;

  /**
   * Callback function called when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Optional CSS class name for styling
   */
  className?: string;

  /**
   * Whether the component is in read-only mode
   */
  readOnly?: boolean;
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

/**
 * ComponentName provides [brief description of functionality]
 *
 * @param tenantId - The ID of the tenant for multi-tenant isolation
 * @param initialData - Optional initial data for the component
 * @param onDataUpdate - Callback function called when data is updated
 * @param onError - Callback function called when an error occurs
 * @param className - Optional CSS class name for styling
 * @param readOnly - Whether the component is in read-only mode
 *
 * @returns JSX element containing the component interface
 *
 * @example
 * ```tsx
 * <ComponentName
 *   tenantId="tenant-123"
 *   initialData={initialData}
 *   onDataUpdate={(data) => console.log('Data updated:', data)}
 *   onError={(error) => console.error('Error:', error)}
 * />
 * ```
 */
export function ComponentName({
  tenantId,
  initialData,
  onDataUpdate,
  onError,
  className,
  readOnly = false,
}: ComponentProps) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ComponentFormData | null>(initialData || null);

  // ========================================================================
  // HOOKS
  // ========================================================================

  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const router = useRouter();

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<ComponentFormData>({
    resolver: zodResolver(componentFormSchema),
    defaultValues: initialData,
  });

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const canEdit = useMemo(() => {
    return !readOnly && user?.role === 'admin';
  }, [readOnly, user]);

  const formData = watch();

  // ========================================================================
  // CALLBACK FUNCTIONS
  // ========================================================================

  const handleFormSubmit = useCallback(
    async (formData: ComponentFormData) => {
      if (!canEdit) return;

      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setData(formData);
        onDataUpdate?.(formData);

        toast({
          title: 'Success',
          description: 'Data saved successfully',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [canEdit, onDataUpdate, onError, toast]
  );

  const handleReset = useCallback(() => {
    reset(initialData);
    setError(null);
  }, [reset, initialData]);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderError = () => {
    if (!error) return null;

    return (
      <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderLoadingState = () => {
    if (!isLoading) return null;

    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  };

  // ========================================================================
  // EARLY RETURNS
  // ========================================================================

  if (!user) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Please log in to view this content</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Tenant information not available</p>
      </div>
    );
  }

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Component Title</CardTitle>
        </CardHeader>
        <CardContent>
          {renderError()}
          {renderLoadingState()}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter name"
                disabled={!canEdit || isLoading}
                aria-describedby="name-error"
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email"
                disabled={!canEdit || isLoading}
                aria-describedby="email-error"
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                placeholder="Enter description"
                disabled={!canEdit || isLoading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-describedby="description-error"
              />
              {errors.description && (
                <p id="description-error" className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {canEdit && (
              <div className="flex gap-2">
                <Button type="submit" disabled={!isValid || isLoading} className="flex-1">
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
                  Reset
                </Button>
              </div>
            )}
          </form>

          {/* Additional content sections */}
          <div className="mt-6">
            <h3 className="mb-3 text-lg font-medium">Additional Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">Tenant ID</p>
                <p className="font-medium">{tenantId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User Role</p>
                <p className="font-medium">{user.role}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// DISPLAY NAME (for debugging)
// ============================================================================

ComponentName.displayName = 'ComponentName';

// ============================================================================
// EXPORTS
// ============================================================================

export type { ComponentProps, ComponentFormData };
export { componentFormSchema };
