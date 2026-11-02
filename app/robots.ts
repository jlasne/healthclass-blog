import type { MetadataRoute } from 'next';
import { absoluteUrl, site } from '@/lib/site';

// Everyone may read the letters, AI answer engines included (being cited is the point). The sign-in route stays out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/qa/access', '/api/'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: site.url,
  };
}
