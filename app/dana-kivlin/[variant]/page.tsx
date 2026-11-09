import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import { DanaBio } from '@/components/DanaBio';
import { meta } from '@/lib/seo';

// Font tests for Dr. Dana (she asked to compare text fonts): the same page with another text font on every line,
// headings still in Fraunces. Hidden from search. /dana-kivlin itself keeps Instrument Sans.
const dmSans = localFont({ src: '../../fonts/dm-sans-latin-wght-normal.woff2', weight: '300 700', display: 'swap' });
const nunitoSans = localFont({ src: '../../fonts/nunito-sans-latin-wght-normal.woff2', weight: '300 800', display: 'swap' });
const sourceSerif = localFont({ src: '../../fonts/source-serif-4-latin-wght-normal.woff2', weight: '300 700', display: 'swap' });
const figtree = localFont({ src: '../../fonts/figtree-latin-wght-normal.woff2', weight: '300 700', display: 'swap' });

const FONTS: Record<string, { name: string; feel: string; family: string; fallback: string }> = {
  '1': { name: 'DM Sans', feel: 'clean and round', family: dmSans.style.fontFamily, fallback: 'sans-serif' },
  '2': { name: 'Nunito Sans', feel: 'soft and warm', family: nunitoSans.style.fontFamily, fallback: 'sans-serif' },
  '3': { name: 'Source Serif 4', feel: 'a book serif, calm to read', family: sourceSerif.style.fontFamily, fallback: 'Georgia, serif' },
  '4': { name: 'Figtree', feel: 'friendly and modern', family: figtree.style.fontFamily, fallback: 'sans-serif' },
};

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(FONTS).map((variant) => ({ variant }));
}

export async function generateMetadata({ params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  const f = FONTS[variant];
  return meta({ title: `Font test ${variant}: ${f ? f.name : ''}`, description: 'A font test of Dr. Dana’s page.', path: `/dana-kivlin/${variant}`, noindex: true });
}

export default async function Page({ params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  const f = FONTS[variant];
  if (!f) notFound();
  return (
    <>
      <style>{`:root{--sans:${f.family}, ${f.fallback};}`}</style>
      <div className="wrap" style={{ paddingTop: 18 }}>
        <p className="nl-fine" style={{ margin: 0 }}>
          Font test {variant} of 4: <b>{f.name}</b>, {f.feel}. Compare:{' '}
          <a className="link" href="/dana-kivlin">today (Instrument Sans)</a>
          {Object.entries(FONTS).map(([k, x]) => (k === variant ? null : <span key={k}> · <a className="link" href={`/dana-kivlin/${k}`}>{k}. {x.name}</a></span>))}
        </p>
      </div>
      <DanaBio />
    </>
  );
}
