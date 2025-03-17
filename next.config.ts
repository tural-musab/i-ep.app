import type { NextConfig } from "next";

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
  output: 'standalone',
  serverExternalPackages: [],
};

export default nextConfig;
