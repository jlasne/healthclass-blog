// sitemap.xml, rebuilt from the content on every deploy and every hour: a new letter in content/articles (or one whose
// date arrives) appears here with its last update date and share image, without touching this file.
import type { MetadataRoute } from 'next';
import { getArticles } from '@/lib/articles';
import { legal } from '@/lib/legal';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getArticles();
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
    page('/dana-kivlin', legal.updatedIso, 'monthly', 0.7),
    page('/live', legal.updatedIso, 'monthly', 0.6),
    page('/faq', legal.updatedIso, 'yearly', 0.4),
    page('/privacy', legal.updatedIso, 'yearly', 0.3),
    page('/terms', legal.updatedIso, 'yearly', 0.3),
  ];
}
