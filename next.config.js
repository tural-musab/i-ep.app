/* eslint-disable import/no-commonjs */
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'react-icons'],
    webpackBuildWorker: true,
  },

  // Swagger UI ve testlerde sorun çıkaran ESM paketleri için transpile seçeneği
  transpilePackages: ['swagger-ui-react', '@supabase/realtime-js', '@supabase/supabase-js', 'msw'],
  // Vercel'de dağıtım sorunları nedeniyle standalone modunu devre dışı bırakıyoruz
  // output: 'standalone',
  serverExternalPackages: [],

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer configuration
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('@next/bundle-analyzer')();
      config.plugins.push(new BundleAnalyzerPlugin());
    }

    // Sentry ve OpenTelemetry uyarılarını gizle
    if (!dev) {
      config.ignoreWarnings = [
        /Critical dependency: the request of a dependency is an expression/,
        /@opentelemetry\/instrumentation/,
        /@sentry/,
      ];
    }

    // Tree shaking optimization
    config.optimization = {
      ...config.optimization,
      usedExports: dev ? false : 'global',  // Development'ta false, production'da global
      sideEffects: false,
    };

    // Code splitting optimization
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 10,
            chunks: 'all',
          },
          ui: {
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            name: 'ui',
            priority: 5,
            chunks: 'all',
          },
          common: {
            test: /[\\/]src[\\/]lib[\\/]/,
            name: 'common',
            priority: 5,
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },

  // Compression
  compress: true,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  // Resim optimizasyonu için alan adı yapılandırması
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i-ep.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'staging.i-ep.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'test.i-ep.app',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
