import { ogImage, ogSize } from '@/lib/og';
import { getArticle, getArticles } from '@/lib/articles';

export const alt = 'A letter from Dr. Dana Kivlin, board-certified urologist';
export const size = ogSize;
export const contentType = 'image/png';
export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = getArticle((await params).slug);
  return ogImage({ eyebrow: a?.topic ?? 'Letter', title: a?.title ?? 'Health Class', pose: a?.cat ?? 'read', tone: a?.tone ?? 'rosy' });
}
