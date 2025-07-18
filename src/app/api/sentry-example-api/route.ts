import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = 'SentryExampleAPIError';
  }
}

// A faulty API route to test Sentry's error monitoring
export function GET() {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/sentry-example-api',
    },
    (span) => {
      // Add attributes to the span
      span.setAttribute('endpoint', '/api/sentry-example-api');
      span.setAttribute('method', 'GET');
      span.setAttribute('purpose', 'error_testing');

      try {
        // Intentionally throw an error for testing
        const error = new SentryExampleAPIError(
          'This error is raised on the backend called by the example page.'
        );

        // Capture the exception with context
        Sentry.captureException(error, {
          tags: {
            api_route: 'sentry-example',
            test_error: true,
          },
          extra: {
            endpoint: '/api/sentry-example-api',
            method: 'GET',
            timestamp: new Date().toISOString(),
          },
        });

        throw error;
      } catch (error) {
        // Set span status to error
        span.setStatus({ code: 2, message: 'Internal Server Error' });
        throw error;
      }
    }
  );
}
