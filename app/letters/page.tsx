import { getArticles, fmtDate } from '@/lib/articles';
import { LetterSearch } from '@/components/LetterSearch';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Cat } from '@/components/Cat';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbs, graph, meta, orgId, danaId, dt } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

export const metadata = meta({
  title: 'Pelvic floor letters for women: leaks, core, intimacy, after birth',
  description: 'Free letters twice a week from Dr. Dana Kivlin, board-certified urologist: bladder leaks, Kegels done right, the Knack, pregnancy and more. Short and sourced.',
  path: '/letters',
});

export default function Page() {
  const all = getArticles();
  const items = all.map((a) => ({ slug: a.slug, title: a.title, excerpt: a.excerpt, topic: a.topic, tone: a.tone, cat: a.cat, date: a.date, dateLabel: fmtDate(a.date, 'short'), minutes: a.minutes, keywords: a.keywords }));
  return (
    <>
      <section className="hero hero--center hero--band">
        <div className="read">
          <div className="hero__cat" aria-hidden="true"><Cat pose="reading" width={260} priority /></div>
          <h1 className="h1 h1--xl">Your pelvic floor, <em>explained</em>.</h1>
          <p className="lede">Short letters for women. Free, every Wednesday and Sunday.</p>
          <div className="hero__form"><NewsletterForm source="/letters#hero" tag="letters-hero" /></div>
        </div>
      </section>
      <section className="read archive" aria-label="All letters" style={{ paddingBottom: 72 }}>
        <h2 className="archive__h">All letters</h2>
        <LetterSearch items={items} />
      </section>
      <JsonLd
        data={graph(
          {
            '@type': 'Blog',
            '@id': absoluteUrl('/letters#blog'),
            name: 'Health Class letters',
            url: absoluteUrl('/letters'),
            author: { '@id': danaId },
            publisher: { '@id': orgId },
            blogPost: all.map((a) => ({ '@type': 'BlogPosting', headline: a.title, url: absoluteUrl(`/letters/${a.slug}`), datePublished: dt(a.date), dateModified: dt(a.updated), author: { '@id': danaId } })),
          },
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Letters', path: '/letters' }]),
        )}
      />
    </>
  );
}
