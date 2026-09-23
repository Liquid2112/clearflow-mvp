/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/clearflow-mvp',
  assetPrefix: '/clearflow-mvp',
  experimental: {
    optimizePackageImports: ['@/components'],
  },
};

module.exports = nextConfig;