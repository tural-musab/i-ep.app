/* eslint-disable import/no-commonjs */
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Swagger UI ve testlerde sorun çıkaran ESM paketleri için transpile seçeneği
  transpilePackages: ['swagger-ui-react', '@supabase/realtime-js', '@supabase/supabase-js', 'msw'],
  // Vercel'de dağıtım sorunları nedeniyle standalone modunu devre dışı bırakıyoruz
  // output: 'standalone',
  serverExternalPackages: [],
  // Resim optimizasyonu için alan adı yapılandırması
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i-ep.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // API dokümantasyonu için yönlendirmeler
  async redirects() {
    return [
      {
        source: '/api-docs',
        destination: '/swagger.html',
        permanent: false,
      },
      {
        source: '/api-docs/index.html',
        destination: '/swagger.html',
        permanent: false,
      },
      {
        source: '/docs/api',
        destination: '/swagger.html',
        permanent: false,
      },
    ];
  },
};

// Sentry yapılandırması
// eslint-disable-next-line import/no-commonjs, @typescript-eslint/no-var-requires
const { withSentryConfig } = require('@sentry/nextjs');

// Sentry sadece production ve staging ortamlarında aktif olacak
const isSentryEnabled =
  process.env.NODE_ENV === 'production' || process.env.SENTRY_ENVIRONMENT === 'staging';

// Temel yapılandırmayı dışa aktar
let config = nextConfig;

// Sentry'yi sadece gerektiğinde etkinleştir
if (isSentryEnabled) {
  config = withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: 'tomnap',
    project: 'i-ep',

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    tunnelRoute: '/monitoring',

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors
    automaticVercelMonitors: true,
  });
}

module.exports = config;
