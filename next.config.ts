import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  transpilePackages: ['swagger-ui-react'],
};

export default nextConfig;
