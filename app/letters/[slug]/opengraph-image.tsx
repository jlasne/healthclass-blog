import { ogImage, ogSize } from '@/lib/og';
import { getArticle, getArticles } from '@/lib/articles';
import { getIssue, getIssues } from '@/lib/newsletter';

export const alt = 'A letter from Dr. Kivlin, board-certified urologist';
export const size = ogSize;
export const contentType = 'image/png';
export function generateStaticParams() {
  return [...getArticles().map((a) => ({ slug: a.slug })), ...getIssues().map((i) => ({ slug: i.slug }))];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const a = getArticle(slug);
  const i = a ? null : getIssue(slug);
  if (i) return ogImage({ eyebrow: `Class Notes · No. ${i.n}`, title: i.subject, pose: i.cat, tone: i.tone });
  return ogImage({ eyebrow: a?.topic ?? 'Letter', title: a?.title ?? 'Health Class', pose: a?.cat ?? 'read', tone: a?.tone ?? 'rosy' });
}
