// sitemap.xml, rebuilt from the content on every deploy and every hour: a new letter in content/articles or a new page in
// content/resources (or one whose date arrives) appears here with its last update date and share image, without touching
// this file. A resource family appears once it has its first page.
import type { MetadataRoute } from 'next';
import { getArticles } from '@/lib/articles';
import { FAMILY_IDS, getResources } from '@/lib/resources';
import { legal } from '@/lib/legal';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getArticles();
  const resources = getResources();
  const latest = articles[0]?.updated ?? legal.updatedIso;
  const page = (path: string, lastModified: string, changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly', priority: number) => ({ url: absoluteUrl(path), lastModified, changeFrequency, priority });
  return [
    page('/', latest, 'weekly', 1),
    page('/letters', latest, 'weekly', 0.9),
    ...articles.map((a) => ({
      url: absoluteUrl(`/letters/${a.slug}`),
      lastModified: a.updated,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [absoluteUrl(`/letters/${a.slug}/opengraph-image`)],
    })),
    ...(resources.length ? [page('/resources', resources[0].updated, 'weekly', 0.9)] : []),
    ...FAMILY_IDS.map((f) => resources.filter((r) => r.family === f)).filter((l) => l.length).map((l) => page(`/resources/${l[0].family}`, l.reduce((m, r) => (r.updated > m ? r.updated : m), l[0].updated), 'weekly', 0.8)),
    ...resources.map((r) => ({
      url: absoluteUrl(r.path),
      lastModified: r.updated,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      images: [absoluteUrl(`${r.path}/opengraph-image`)],
    })),
    page('/dana-kivlin', legal.updatedIso, 'monthly', 0.7),
    page('/live', legal.updatedIso, 'monthly', 0.6),
    page('/faq', legal.updatedIso, 'yearly', 0.4),
    page('/privacy', legal.updatedIso, 'yearly', 0.3),
    page('/terms', legal.updatedIso, 'yearly', 0.3),
  ];
}
