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
      // pages that must never show in search: Google may crawl them (robots.txt allows it) and reads this noindex
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/live/access', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/qa/access', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
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
      { source: '/blog', destination: '/letters', permanent: true },
      { source: '/blog/:slug', destination: '/letters/:slug', permanent: true },
      { source: '/newsletter', destination: '/letters', permanent: true },
      { source: '/qa', destination: '/live', permanent: true },
      { source: '/qa/access', destination: '/live/access', permanent: false },
      { source: '/about', destination: '/dana-kivlin', permanent: true },
      { source: '/dana', destination: '/dana-kivlin', permanent: true },
      { source: '/support', destination: '/faq', permanent: true },
      { source: '/app', destination: '/', permanent: true },
      { source: '/rss.xml', destination: '/feed.xml', permanent: true },
      { source: '/download', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
