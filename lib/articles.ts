import 'server-only';
// The letters: one .mdx file per article in content/articles. Drop a new file in that folder and it shows up
// everywhere on the next build: the archive, the home page, the RSS feed, llms.txt and the sitemap.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { Pose } from '@/components/Cat';

export type Source = { text: string; url: string };
export type Faq = { q: string; a: string };
export type Article = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  excerpt: string;
  date: string;
  updated: string;
  topic: string;
  tone: 'rosy' | 'plum' | 'blush' | 'sky';
  cat: Pose;
  keywords: string[];
  faq: Faq[];
  sources: Source[];
  reviewed: boolean;
  body: string;
  minutes: number;
  words: number;
};

const DIR = path.join(process.cwd(), 'content/articles');
let cache: Article[] | null = null;

function load(): Article[] {
  if (cache && process.env.NODE_ENV === 'production') return cache;
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith('.mdx')) : [];
  const list = files.map((f) => {
    const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
    const { data, content } = matter(raw);
    const rt = readingTime(content.replace(/<[^>]+>/g, ' '));
    const d = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? ''));
    return {
      slug: f.replace(/\.mdx$/, ''),
      title: String(data.title),
      seoTitle: String(data.seoTitle ?? data.title),
      description: String(data.description ?? ''),
      excerpt: String(data.excerpt ?? data.description ?? ''),
      date: d(data.date),
      updated: d(data.updated ?? data.date),
      topic: String(data.topic ?? 'Pelvic floor'),
      tone: (data.tone ?? 'rosy') as Article['tone'],
      cat: (data.cat ?? 'read') as Pose,
      keywords: (data.keywords ?? []) as string[],
      faq: (data.faq ?? []) as Faq[],
      sources: (data.sources ?? []) as Source[],
      reviewed: Boolean(data.reviewed),
      body: content,
      minutes: Math.max(1, Math.round(rt.minutes)),
      words: rt.words,
    } satisfies Article;
  });
  cache = list.sort((a, b) => (a.date < b.date ? 1 : -1));
  return cache;
}

// newest first. A letter dated in the future stays hidden until that day: the pages re-render every hour
// (revalidate), so a scheduled letter goes live on its date without a new deploy.
export function getArticles(): Article[] {
  const today = new Date().toISOString().slice(0, 10);
  return load().filter((a) => a.date <= today);
}

export function getArticle(slug: string) {
  return getArticles().find((a) => a.slug === slug) ?? null;
}

export function related(a: Article, n = 3) {
  const rest = getArticles().filter((x) => x.slug !== a.slug);
  return [...rest.filter((x) => x.topic === a.topic), ...rest.filter((x) => x.topic !== a.topic)].slice(0, n);
}

export const fmtDate = (iso: string, style: 'long' | 'short' = 'long') =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', style === 'long' ? { month: 'long', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
