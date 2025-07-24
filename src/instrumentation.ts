// Temporarily disabled - Sentry v7/v8 compatibility issues with React 18
// import * as Sentry from '@sentry/nextjs';

export async function register() {
  console.log('Instrumentation disabled for development');
  // if (process.env.NEXT_RUNTIME === 'nodejs') {
  //   await import('../sentry.server.config');
  // }

  // if (process.env.NEXT_RUNTIME === 'edge') {
  //   await import('../sentry.edge.config');
  // }
}

// Temporarily disabled for Sentry v8 compatibility
// export const onRequestError = Sentry.captureRequestError;
