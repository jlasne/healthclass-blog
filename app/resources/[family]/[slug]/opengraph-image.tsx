import { ogImage, ogSize } from '@/lib/og';
import { FAMILIES, getResource, getResources } from '@/lib/resources';

export const alt = 'A pelvic floor resource from Health Class';
export const size = ogSize;
export const contentType = 'image/png';
export function generateStaticParams() {
  return getResources().map((r) => ({ family: r.family, slug: r.slug }));
}

export default async function Image({ params }: { params: Promise<{ family: string; slug: string }> }) {
  const { family, slug } = await params;
  const r = getResource(family, slug);
  return ogImage({
    eyebrow: r ? FAMILIES[r.family].name : 'Resources',
    title: r?.title ?? 'Health Class',
    pose: r?.cat ?? 'read',
    tone: r?.tone ?? 'rosy',
    foot: 'Health Class · Education, not medical advice',
  });
}
