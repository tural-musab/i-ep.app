import { useEffect, useLayoutEffect } from 'react';

/**
 * SSR-safe useLayoutEffect hook
 * 
 * This hook automatically uses useEffect on the server (during SSR)
 * and useLayoutEffect on the client to prevent hydration warnings.
 * 
 * Use this instead of useLayoutEffect when you need DOM measurements
 * or synchronous DOM mutations that should happen before the browser paints.
 */
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;