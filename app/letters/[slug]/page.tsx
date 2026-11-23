import { notFound } from 'next/navigation';
import { getArticle, getArticles, related, fmtDate } from '@/lib/articles';
import { Mdx } from '@/components/Mdx';
import { Cat } from '@/components/Cat';
import { Newsletter } from '@/components/Newsletter';
import { PreferredSource } from '@/components/PreferredSource';
import { JsonLd } from '@/components/JsonLd';
import { AppBand } from '@/components/AppBand';
import { articleLd, breadcrumbs, graph, meta } from '@/lib/seo';
import { dana } from '@/lib/site';
import { IssuePage } from '@/components/IssuePage';
import { getIssue, getIssues, sentIssues } from '@/lib/newsletter';
import { dt, danaId, orgId } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() {
  return [...getArticles().map((a) => ({ slug: a.slug })), ...getIssues().map((i) => ({ slug: i.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const a = getArticle(slug);
  if (!a) {
    const i = getIssue(slug);
    if (!i) return {};
    const m = meta({ title: i.subject, description: i.preview, path: `/letters/${i.slug}`, type: 'article' });
    return { ...m, authors: [{ name: dana.name, url: '/dana-kivlin' }], openGraph: { ...m.openGraph, type: 'article', publishedTime: i.date, authors: ['/dana-kivlin'], section: i.topic } };
  }
  const m = meta({ title: a.seoTitle, description: a.description, path: `/letters/${a.slug}`, type: 'article' });
  return {
    ...m,
    keywords: a.keywords,
    authors: [{ name: dana.name, url: '/dana-kivlin' }],
    openGraph: { ...m.openGraph, type: 'article', publishedTime: a.date, modifiedTime: a.updated, authors: ['/dana-kivlin'], section: a.topic, tags: a.keywords },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const a = getArticle(slug);
  if (!a) {
    const issue = getIssue(slug);
    if (!issue) notFound();
    const all = getIssues();
    const at = all.indexOf(issue);
    const sent = new Set(sentIssues().map((x) => x.slug));
    const url = absoluteUrl(`/letters/${issue.slug}`);
    return (
      <>
        <IssuePage issue={issue} prev={all[at - 1] && sent.has(all[at - 1].slug) ? all[at - 1] : null} next={all[at + 1] && sent.has(all[at + 1].slug) ? all[at + 1] : null} />
        <JsonLd
          data={graph(
            { '@type': 'BlogPosting', '@id': `${url}#article`, headline: issue.subject, description: issue.preview, url, mainEntityOfPage: url, image: absoluteUrl(`/letters/${issue.slug}/opengraph-image`), datePublished: dt(issue.date), dateModified: dt(issue.date), inLanguage: 'en-US', articleSection: issue.topic, author: { '@id': danaId }, publisher: { '@id': orgId }, citation: issue.sources.map((x) => ({ '@type': 'CreativeWork', name: x.text, ...(x.url ? { url: x.url } : {}) })) },
            breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Letters', path: '/letters' }, { name: issue.subject, path: `/letters/${issue.slug}` }]),
          )}
        />
      </>
    );
  }
  const more = related(a);
  return (
    <article className={`tone--${a.tone}`}>
      <header className="post-hd">
        <div className="post-hd__in">
          <div className="post-hd__top">
            <a className="post-hd__back" href="/letters">Letters</a>
            <span className="pill">{a.topic}</span>
            <span className="post-hd__meta"><time dateTime={a.date}>{fmtDate(a.date)}</time> · {a.minutes} min read</span>
          </div>
          <div className="post-hd__art" aria-hidden="true"><Cat pose={a.cat} width={120} priority /></div>
          <h1 className="h1">{a.title}</h1>
          <p className="lede">{a.excerpt}</p>
          <div className="byline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dana.avatar} alt="" width={46} height={46} />
            <div>
              <a href="/dana-kivlin" rel="author"><b>{dana.name}</b></a>
              <span>{dana.role}, {dana.practice}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="read">
        <div className="prose">
          <Mdx source={a.body} slug={a.slug} />
        </div>

        <div className="signoff">
          <span className="signoff__name">{dana.name}</span>
          <span className="signoff__who">{dana.name}, {dana.role.toLowerCase()}, {dana.practice}</span>
        </div>

        <div className="post-foot">
          {a.faq.length > 0 && (
            <section aria-labelledby="faq">
              <h2 id="faq" className="h3" style={{ marginBottom: 6 }}>Quick answers</h2>
              <div className="faq">
                {a.faq.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <div><p>{f.a}</p></div>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="reviewed">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dana.avatar} alt="" width={52} height={52} loading="lazy" />
            <p style={{ margin: 0 }}>
              <b>Written by {dana.name}</b>, {dana.role.toLowerCase()}. Updated <time dateTime={a.updated}>{fmtDate(a.updated)}</time>.
              Every number links to its source below. This letter teaches; your own doctor diagnoses.
            </p>
          </div>

          {a.sources.length > 0 && (
            <section className="sources" aria-labelledby="sources">
              <h2 id="sources">Sources</h2>
              <ol>
                {a.sources.map((s, i) => (
                  <li key={s.url} id={`src-${i + 1}`}>
                    {s.text} <a href={s.url} rel="noopener nofollow" target="_blank">{new URL(s.url).hostname.replace(/^www\./, '')}</a>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>

      <div className="wrap" style={{ marginTop: 40 }}>
        <div className="pref__row"><PreferredSource /></div>
        <Newsletter source={`/letters/${a.slug}`} tag="article-end" title={<>Liked this? The next letter lands <em>Wednesday or Sunday</em>.</>} pose="bell" peek />
      </div>

      {more.length > 0 && (
        <section className="sec sec--tight">
          <div className="wrap">
            <div className="sec__hd"><div><span className="eyebrow">Keep reading</span><h2 className="h3" style={{ marginTop: 10 }}>More letters from Dr. Kivlin</h2></div><a className="arrow" href="/letters">All letters</a></div>
            <div className="related">
              {more.map((r) => (
                <a key={r.slug} className={`card tone--${r.tone}`} href={`/letters/${r.slug}`}>
                  <span className="card__art" aria-hidden="true"><Cat pose={r.cat} width={118} /></span>
                  <b>{r.title}</b>
                  <span>{r.topic} · {r.minutes} min read</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <AppBand />
      <JsonLd data={graph(...articleLd(a), breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Letters', path: '/letters' }, { name: a.title, path: `/letters/${a.slug}` }]))} />
    </article>
  );
}
