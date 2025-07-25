/**
 * Suppress useLayoutEffect SSR warnings in development
 * 
 * This utility suppresses harmless useLayoutEffect warnings that occur
 * when using libraries like Radix UI components that use useLayoutEffect
 * internally for DOM measurements.
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    
    // Suppress useLayoutEffect SSR warnings
    if (
      typeof message === 'string' &&
      (message.includes('useLayoutEffect does nothing on the server') ||
       message.includes('Warning: useLayoutEffect does nothing on the server'))
    ) {
      return;
    }
    
    // Suppress hydration warnings that are not actionable
    if (
      typeof message === 'string' &&
      (message.includes('Text content did not match') ||
       message.includes('Hydration failed') ||
       message.includes('There was an error while hydrating'))
    ) {
      // Only log these in development if specifically debugging
      if (process.env.NEXT_PUBLIC_DEBUG_HYDRATION === 'true') {
        originalError.apply(console, args);
      }
      return;
    }
    
    // Allow all other errors to show
    originalError.apply(console, args);
  };
}