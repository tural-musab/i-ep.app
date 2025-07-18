/**
 * Custom Hook Template for İ-EP.APP
 *
 * This template provides a standardized structure for custom React hooks
 * following the project's coding standards and best practices.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface HookOptions {
  /**
   * Whether to automatically fetch data on mount
   */
  autoFetch?: boolean;

  /**
   * Polling interval in milliseconds
   */
  pollingInterval?: number;

  /**
   * Whether to show toast notifications
   */
  showNotifications?: boolean;

  /**
   * Custom error handler
   */
  onError?: (error: Error) => void;

  /**
   * Custom success handler
   */
  onSuccess?: (data: any) => void;
}

interface HookState<T> {
  /**
   * The data returned by the hook
   */
  data: T | null;

  /**
   * Whether the hook is currently loading
   */
  isLoading: boolean;

  /**
   * Any error that occurred
   */
  error: Error | null;

  /**
   * Whether the hook has been initialized
   */
  isInitialized: boolean;
}

interface HookActions {
  /**
   * Manually trigger data fetching
   */
  fetch: () => Promise<void>;

  /**
   * Refresh the data
   */
  refresh: () => Promise<void>;

  /**
   * Clear all data and reset state
   */
  reset: () => void;

  /**
   * Clear any errors
   */
  clearError: () => void;
}

type HookReturn<T> = HookState<T> & HookActions;

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook for [brief description of functionality]
 *
 * @param param1 - Description of parameter 1
 * @param param2 - Description of parameter 2
 * @param options - Configuration options for the hook
 *
 * @returns Object containing state and actions
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, fetch, refresh } = useCustomHook(
 *   'param1',
 *   'param2',
 *   {
 *     autoFetch: true,
 *     pollingInterval: 30000,
 *     showNotifications: true,
 *   }
 * );
 * ```
 */
export function useCustomHook<T = any>(
  param1: string,
  param2: string,
  options: HookOptions = {}
): HookReturn<T> {
  const {
    autoFetch = true,
    pollingInterval,
    showNotifications = false,
    onError,
    onSuccess,
  } = options;

  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ========================================================================
  // REFS
  // ========================================================================

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // ========================================================================
  // HOOKS
  // ========================================================================

  const { toast } = useToast();

  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================

  const clearPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollingInterval && pollingInterval > 0) {
      clearPolling();
      pollingIntervalRef.current = setInterval(() => {
        fetchData();
      }, pollingInterval);
    }
  }, [pollingInterval]);

  // ========================================================================
  // CORE FUNCTIONS
  // ========================================================================

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data - replace with actual API call
      const result = {
        id: param1,
        name: param2,
        timestamp: new Date().toISOString(),
      } as T;

      if (mountedRef.current) {
        setData(result);
        setIsInitialized(true);

        onSuccess?.(result);

        if (showNotifications) {
          toast({
            title: 'Success',
            description: 'Data fetched successfully',
          });
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');

      if (mountedRef.current) {
        setError(error);

        onError?.(error);

        if (showNotifications) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [param1, param2, onSuccess, onError, showNotifications, toast]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsInitialized(false);
    clearPolling();
  }, [clearPolling]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && param1 && param2) {
      fetchData();
    }
  }, [autoFetch, param1, param2, fetchData]);

  // Polling setup
  useEffect(() => {
    if (isInitialized && !isLoading && !error) {
      startPolling();
    }

    return () => {
      clearPolling();
    };
  }, [isInitialized, isLoading, error, startPolling, clearPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearPolling();
    };
  }, [clearPolling]);

  // ========================================================================
  // MEMOIZED VALUES
  // ========================================================================

  const actions = useMemo(
    () => ({
      fetch: fetchData,
      refresh,
      reset,
      clearError,
    }),
    [fetchData, refresh, reset, clearError]
  );

  const state = useMemo(
    () => ({
      data,
      isLoading,
      error,
      isInitialized,
    }),
    [data, isLoading, error, isInitialized]
  );

  // ========================================================================
  // RETURN VALUE
  // ========================================================================

  return {
    ...state,
    ...actions,
  };
}

// ============================================================================
// ALTERNATIVE HOOK VARIATIONS
// ============================================================================

/**
 * Simplified version of the custom hook for basic use cases
 */
export function useSimpleCustomHook<T = any>(
  param: string
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  fetch: () => Promise<void>;
} {
  const { data, isLoading, error, fetch } = useCustomHook<T>(param, '', {
    autoFetch: true,
    showNotifications: false,
  });

  return { data, isLoading, error, fetch };
}

/**
 * Hook with mutations for create/update/delete operations
 */
export function useCustomMutations<T = any>(
  resourceId: string
): {
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const create = useCallback(
    async (data: Partial<T>): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const result = {
          id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString(),
        } as T;

        toast({
          title: 'Success',
          description: 'Item created successfully',
        });

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create item');
        setError(error);

        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const update = useCallback(
    async (id: string, data: Partial<T>): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const result = {
          id,
          ...data,
          updatedAt: new Date().toISOString(),
        } as T;

        toast({
          title: 'Success',
          description: 'Item updated successfully',
        });

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update item');
        setError(error);

        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast({
          title: 'Success',
          description: 'Item deleted successfully',
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete item');
        setError(error);

        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    create,
    update,
    delete: deleteItem,
    isLoading,
    error,
  };
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { HookOptions, HookState, HookActions, HookReturn };
