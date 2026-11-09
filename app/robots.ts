import type { MetadataRoute } from 'next';
import { absoluteUrl, site } from '@/lib/site';

// Everyone may read everything, AI answer engines included (being cited is the point). The sign-in route and the
// API are not blocked here: a blocked page can still show in Google ("Indexed, though blocked by robots.txt").
// They send X-Robots-Tag: noindex instead (next.config.ts), which Google can only read if it may crawl them.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: site.url,
  };
}
