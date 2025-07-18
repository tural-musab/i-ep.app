// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // DSN'i doğrudan yazmak yerine, ortam değişkeninden güvenli bir şekilde alıyoruz.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Ortam etiketini Vercel'in sağladığı değişkenden otomatik olarak alıyoruz.
  environment: process.env.VERCEL_ENV || 'development',

  // Performans takibi için örnekleme oranı.
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
