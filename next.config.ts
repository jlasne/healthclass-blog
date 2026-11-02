import type { NextConfig } from 'next';

const security = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  // the letters are read from content/ at request time too (hourly re-render, scheduled letters)
  outputFileTracingIncludes: { '/**': ['./content/**/*', './lib/og-fonts/*', './public/cats/still/*'] },
  async headers() {
    return [
      { source: '/:path*', headers: security },
      // the cats and the fonts never change under the same name
      { source: '/cats/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }] },
    ];
  },
  async redirects() {
    return [
      // the paths the app and the stores may already use
      { source: '/legal/privacy.html', destination: '/privacy', permanent: true },
      { source: '/legal/terms.html', destination: '/terms', permanent: true },
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/terms-of-service', destination: '/terms', permanent: true },
      { source: '/letters', destination: '/blog', permanent: true },
      { source: '/letters/:slug', destination: '/blog/:slug', permanent: true },
      { source: '/rss.xml', destination: '/feed.xml', permanent: true },
      { source: '/download', destination: '/app', permanent: true },
    ];
  },
};

export default nextConfig;
