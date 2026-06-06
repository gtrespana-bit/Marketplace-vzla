/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // ✅ AÑADIDO: Cloudflare R2 (donde están muchas imágenes de productos)
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      // ✅ AÑADIDO: Cloudflare R2 alternate domain
      {
        protocol: 'https',
        hostname: '**.cloudflarestorage.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = withSentryConfig(nextConfig, {
  org: "vendet-venezuela",
  project: "vendet-venezuela",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  hideSourceMaps: true,
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});