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
    // Fix path alias resolution for Vercel build
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

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

// Sentry konfigürasyonu geçici olarak devre dışı bırakıldı
// Deployment sorunlarını önlemek için basit export
module.exports = nextConfig;
