/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Swagger UI bileşeni için gerekli olan transpile seçeneği
  // transpilePackages: ['swagger-ui-react'],
  // Vercel'de dağıtım sorunları nedeniyle standalone modunu devre dışı bırakıyoruz
  // output: 'standalone',
  serverExternalPackages: [],
};

// Sentry yapılandırması
const { withSentryConfig } = require("@sentry/nextjs");

// Sentry sadece production ve staging ortamlarında aktif olacak
const isSentryEnabled = process.env.NODE_ENV === 'production' || process.env.SENTRY_ENVIRONMENT === 'staging';

// Temel yapılandırmayı dışa aktar
let config = nextConfig;

// Sentry'yi sadece gerektiğinde etkinleştir
if (isSentryEnabled) {
  config = withSentryConfig(
    nextConfig,
    {
      // For all available options, see:
      // https://www.npmjs.com/package/@sentry/webpack-plugin#options

      org: "tomnap",
      project: "javascript-nextjs-o4",

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      tunnelRoute: "/monitoring",

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      // Enables automatic instrumentation of Vercel Cron Monitors
      automaticVercelMonitors: true,
    }
  );
}

module.exports = config;
