// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN'i doğrudan yazmak yerine, ortam değişkeninden güvenli bir şekilde alıyoruz.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Ortam etiketini Vercel'in sağladığı değişkenden otomatik olarak alıyoruz.
  environment: process.env.VERCEL_ENV || "development",

  // Performans takibi için örnekleme oranı.
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});