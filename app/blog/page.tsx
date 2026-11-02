import { getArticles } from '@/lib/articles';
import { Letters } from '@/components/Letters';
import { Newsletter } from '@/components/Newsletter';
import { Cat } from '@/components/Cat';
import { Smile } from '@/components/Smile';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbs, graph, meta, orgId, danaId } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

export const metadata = meta({
  title: 'Letters on the pelvic floor and bladder leaks',
  description: 'Every letter from Dr. Dana Kivlin, board-certified urologist: bladder leaks, Kegels done right, the Knack, pregnancy and more. Short, sourced, free.',
  path: '/blog',
});

export default function Page() {
  const all = getArticles();
  const topics = Array.from(new Set(all.map((a) => a.topic)));
  return (
    <>
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 24, alignItems: 'end' }}>
          <div>
            <span className="eyebrow">The letters</span>
            <h1 className="h1" style={{ marginTop: 16 }}>Short letters. <em>Real</em> answers.</h1>
            <Smile />
            <p className="lede" style={{ marginTop: 18, maxWidth: 600 }}>
              {all.length} letters from Dr. Dana Kivlin, a board-certified urologist. Each one answers 1 question in 2 to 5 minutes, with its sources.
            </p>
            <p className="muted" style={{ marginTop: 14, fontSize: 15 }}>Topics: {topics.join(' · ')}</p>
          </div>
          <div className="reading-cat" aria-hidden="true"><Cat pose="reading" width={220} priority /></div>
        </div>
      </section>
      <section className="wrap" aria-label="All letters" style={{ paddingBottom: 72 }}>
        <Letters items={all} />
      </section>
      <div className="wrap" style={{ paddingBottom: 40 }}>
        <Newsletter source="/blog" tag="archive" />
      </div>
      <JsonLd
        data={graph(
          {
            '@type': 'Blog',
            '@id': absoluteUrl('/blog#blog'),
            name: 'Health Class letters',
            url: absoluteUrl('/blog'),
            author: { '@id': danaId },
            publisher: { '@id': orgId },
            blogPost: all.map((a) => ({ '@type': 'BlogPosting', headline: a.title, url: absoluteUrl(`/blog/${a.slug}`), datePublished: a.date, dateModified: a.updated, author: { '@id': danaId } })),
          },
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Letters', path: '/blog' }]),
        )}
      />
    </>
  );
}
