import { notFound } from 'next/navigation';
import { Cat } from '@/components/Cat';
import { Logo } from '@/components/Logo';
import { Mdx } from '@/components/Mdx';
import { JsonLd } from '@/components/JsonLd';
import { Tool } from '@/components/tools';
import { AppCta, ClassBlock, CompareBlock, DoctorNote, ForBlock, NextSteps, ShortAnswer } from '@/components/Resource';
import { fmtDate } from '@/lib/articles';
import { FAMILIES, getResource, getResources, nextSteps, type Resource } from '@/lib/resources';
import { breadcrumbs, dt, graph, meta, orgId, siteId } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() {
  return getResources().map((r) => ({ family: r.family, slug: r.slug }));
}

type P = { params: Promise<{ family: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  const { family, slug } = await params;
  const r = getResource(family, slug);
  if (!r) return {};
  const m = meta({ title: r.seoTitle, description: r.description, path: r.path, type: 'article' });
  // signed by the team (the layout's default author is Dr. Dana, for the letters she writes)
  return { ...m, keywords: r.keywords, authors: [{ name: 'The Health Class team', url: '/resources' }], creator: 'Health Class', openGraph: { ...m.openGraph, type: 'article', publishedTime: r.date, modifiedTime: r.updated, section: FAMILIES[r.family].name, tags: r.keywords } };
}

function ld(r: Resource) {
  const url = absoluteUrl(r.path);
  const fam = FAMILIES[r.family];
  const crumbs = breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Resources', path: '/resources' }, { name: fam.name, path: `/resources/${r.family}` }, { name: r.title, path: r.path }]);
  return [
    {
      '@type': 'WebPage',
      '@id': `${url}#page`,
      name: r.title,
      headline: r.seoTitle,
      description: r.description,
      url,
      image: absoluteUrl(`${r.path}/opengraph-image`),
      datePublished: dt(r.date),
      dateModified: dt(r.updated),
      inLanguage: 'en-US',
      keywords: r.keywords.join(', '),
      audience: { '@type': 'PeopleAudience', audienceType: 'Women', suggestedGender: 'female', suggestedMinAge: 16 },
      author: { '@id': orgId },
      publisher: { '@id': orgId },
      isPartOf: { '@id': siteId },
      breadcrumb: crumbs,
      citation: r.sources.map((s) => ({ '@type': 'CreativeWork', name: s.text, url: s.url })),
    },
    ...(r.faq.length ? [{ '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: r.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
  ];
}

export default async function Page({ params }: P) {
  const { family, slug } = await params;
  const r = getResource(family, slug);
  if (!r) notFound();
  const fam = FAMILIES[r.family];
  return (
    <article className={`res res--${r.family} tone--${r.tone}`}>
      <header className="post-hd">
        <div className="post-hd__in">
          <div className="post-hd__top">
            <a className="post-hd__back" href="/resources">Resources</a>
            <a className="pill pill--link" href={`/resources/${r.family}`}>{fam.name}</a>
            <span className="post-hd__meta">Updated <time dateTime={r.updated}>{fmtDate(r.updated)}</time> · {r.minutes} min read</span>
          </div>
          <div className="post-hd__art" aria-hidden="true"><Cat pose={r.cat} width={120} priority /></div>
          <h1 className="h1">{r.title}</h1>
          <p className="lede">{r.excerpt}</p>
          <div className="byline">
            <span className="byline__mark" aria-hidden="true"><Logo /></span>
            <div>
              <b>The Health Class team</b>
              <span>Education, not medical advice. Sources at the end.</span>
            </div>
          </div>
        </div>
      </header>

      <div className="read">
        <ShortAnswer text={r.answer} />
        {r.tool && <Tool id={r.tool} />}
        <CompareBlock r={r} />
        <ClassBlock r={r} />
        <ForBlock r={r} />
        <div className="prose prose--res">
          <Mdx source={r.body} slug={r.slug} />
        </div>
        <DoctorNote lines={r.doctor} />
      </div>

      <AppCta title={r.cta.title} line={r.cta.line} />

      <div className="read">
        <div className="post-foot" style={{ marginTop: 8 }}>
          {r.faq.length > 0 && (
            <section aria-labelledby="faq">
              <h2 id="faq" className="h3" style={{ marginBottom: 6 }}>Quick answers</h2>
              <div className="faq">
                {r.faq.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <div><p>{f.a}</p></div>
                  </details>
                ))}
              </div>
            </section>
          )}
          {r.sources.length > 0 && (
            <section className="sources" aria-labelledby="sources">
              <h2 id="sources">Sources</h2>
              <ol>
                {r.sources.map((s, i) => (
                  <li key={s.url} id={`src-${i + 1}`}>
                    {s.text} <a href={s.url} rel="noopener nofollow" target="_blank">{new URL(s.url).hostname.replace(/^www\./, '')}</a>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>

      <NextSteps items={nextSteps(r)} letters={r.letters} />
      <JsonLd data={graph(...ld(r))} />
    </article>
  );
}
