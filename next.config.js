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
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
  },
}

module.exports = withSentryConfig(nextConfig, {
  org: "vendet",
  project: "vendet-nextjs",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,

  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
