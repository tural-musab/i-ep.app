// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://723ae992af5b929e62cbca67e13f1f95@o4508686736556032.ingest.de.sentry.io/4509633858764880',

  // Add integrations for better error tracking and logging
  integrations: [
    // Send console.log, console.error, and console.warn calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable experimental logging features
  _experiments: {
    enableLogs: true,
  },

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
