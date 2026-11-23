import { getArticles, fmtDate } from '@/lib/articles';
import { LetterSearch, type LetterItem } from '@/components/LetterSearch';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Cat } from '@/components/Cat';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbs, graph, meta, orgId, danaId, dt } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { sentIssues } from '@/lib/newsletter';

export const revalidate = 3600;

export const metadata = meta({
  title: 'Pelvic floor letters for women: leaks, core, intimacy, after birth',
  description: 'Free letters twice a week from Dr. Kivlin, board-certified urologist: bladder leaks, Kegels done right, the Knack, pregnancy and more. Short and sourced.',
  path: '/letters',
});

export default function Page() {
  const all = getArticles();
  const issues = sentIssues();
  // every Class Notes issue already sent, and every letter, newest first
  const unsorted: LetterItem[] = [
    ...all.map((a) => ({ slug: a.slug, kind: 'letter' as const, title: a.title, excerpt: a.excerpt, topic: a.topic, tone: a.tone, cat: a.cat as string, date: a.date, dateLabel: fmtDate(a.date, 'short'), minutes: a.minutes, keywords: a.keywords })),
    ...issues.map((i) => ({ slug: i.slug, kind: 'issue' as const, n: i.n, title: i.subject, excerpt: i.preview, topic: i.topic, tone: i.tone, cat: i.cat as string, date: i.date, dateLabel: fmtDate(i.date, 'short'), minutes: i.minutes, keywords: [i.topic] })),
  ];
  const items = unsorted.sort((x, y) => y.date.localeCompare(x.date) || (y.n ?? 0) - (x.n ?? 0));
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
        <h2 className="archive__h">Every letter, in one place</h2>
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
            blogPost: [...issues.map((i) => ({ '@type': 'BlogPosting', headline: i.subject, url: absoluteUrl(`/letters/${i.slug}`), datePublished: dt(i.date), author: { '@id': danaId } })), ...all.map((a) => ({ '@type': 'BlogPosting', headline: a.title, url: absoluteUrl(`/letters/${a.slug}`), datePublished: dt(a.date), dateModified: dt(a.updated), author: { '@id': danaId } }))],
          },
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Letters', path: '/letters' }]),
        )}
      />
    </>
  );
}
