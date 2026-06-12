const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      '@supabase/ssr',
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/monitoring/:path*',
        destination: 'https://o4509525097775104.ingest.us.sentry.io/api/:path*',
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: 'vendet-venezuela',
  project: 'vendet-venezuela',
  silent: true,
  hideSourceMaps: true,
  widenClientFileUpload: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  tunnelRoute: '/monitoring',
  disableServerWebpackPlugin: true,
  disableClientWebpackPlugin: true,
});
