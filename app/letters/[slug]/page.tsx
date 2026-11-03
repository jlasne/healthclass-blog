import { notFound } from 'next/navigation';
import { getArticle, getArticles, related, fmtDate } from '@/lib/articles';
import { Mdx } from '@/components/Mdx';
import { Cat } from '@/components/Cat';
import { Newsletter } from '@/components/Newsletter';
import { JsonLd } from '@/components/JsonLd';
import { AppBand } from '@/components/AppBand';
import { articleLd, graph, meta } from '@/lib/seo';
import { dana } from '@/lib/site';

export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = getArticle((await params).slug);
  if (!a) return {};
  const m = meta({ title: a.seoTitle, description: a.description, path: `/letters/${a.slug}`, type: 'article' });
  return {
    ...m,
    keywords: a.keywords,
    authors: [{ name: dana.name, url: '/dana-kivlin' }],
    openGraph: { ...m.openGraph, type: 'article', publishedTime: a.date, modifiedTime: a.updated, authors: ['/dana-kivlin'], section: a.topic, tags: a.keywords },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const more = related(a);
  return (
    <article className={`tone--${a.tone}`}>
      <header className="post-hd">
        <div className="post-hd__grid">
          <div>
            <nav aria-label="Breadcrumb">
              <ol className="crumbs">
                <li><a href="/">Home</a></li>
                <li><a href="/letters">Letters</a></li>
                <li aria-current="page">{a.topic}</li>
              </ol>
            </nav>
            <span className="eyebrow">{a.topic}</span>
            <h1 className="h1">{a.title}</h1>
            <p className="lede">{a.excerpt}</p>
            <div className="byline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dana.avatar} alt="" width={46} height={46} />
              <div>
                <a href="/dana-kivlin" rel="author"><b>{dana.name}</b></a>
                <span>
                  {dana.role} · <time dateTime={a.date}>{fmtDate(a.date)}</time> · {a.minutes} min read
                </span>
              </div>
            </div>
          </div>
          <div className="post-hd__art" aria-hidden="true"><Cat pose={a.cat} width={230} priority /></div>
        </div>
      </header>

      <div className="read">
        <div className="prose">
          <Mdx source={a.body} slug={a.slug} />
        </div>

        <div className="signoff">
          <span className="signoff__name">{dana.firstName}</span>
          <span className="signoff__who">{dana.fullName}, {dana.role.toLowerCase()}, {dana.practice}</span>
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
        <Newsletter source={`/letters/${a.slug}`} tag="article-end" title={<>Liked this? The next letter lands <em>Wednesday or Sunday</em>.</>} pose="bell" peek />
      </div>

      {more.length > 0 && (
        <section className="sec sec--tight">
          <div className="wrap">
            <div className="sec__hd"><div><span className="eyebrow">Keep reading</span><h2 className="h3" style={{ marginTop: 10 }}>More letters from Dr. Dana</h2></div><a className="arrow" href="/letters">All letters</a></div>
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
      <JsonLd data={graph(...articleLd(a))} />
    </article>
  );
}
