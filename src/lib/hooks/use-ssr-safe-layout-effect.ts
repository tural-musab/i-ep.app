import { useEffect, useLayoutEffect, useState, EffectCallback, DependencyList } from 'react';

/**
 * SSR-safe useLayoutEffect hook with proper typing
 * 
 * This hook:
 * - Uses useLayoutEffect on client for synchronous DOM mutations
 * - Uses useEffect on server to prevent SSR warnings
 * - Provides identical API to useLayoutEffect
 * 
 * Use this when you need:
 * - DOM measurements before paint
 * - Synchronous DOM mutations
 * - Layout calculations
 * 
 * @param effect - The effect callback function
 * @param deps - The dependency array (optional)
 */
export function useSSRSafeLayoutEffect(
  effect: EffectCallback,
  deps?: DependencyList
): void {
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  
  useIsomorphicLayoutEffect(effect, deps);
}

/**
 * Hook to detect if we're running on the client side
 * Useful for conditional rendering that depends on client-side features
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}