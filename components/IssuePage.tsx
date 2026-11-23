import { Mdx } from './Mdx';
import { Cat } from './Cat';
import { Newsletter } from './Newsletter';
import { PreferredSource } from './PreferredSource';
import { dana } from '@/lib/site';
import { type Issue } from '@/lib/newsletter';
import { fmtDate } from '@/lib/articles';

// One Class Notes issue on the site: the same letter that went out by email, with its sources listed here (the email
// only links to this page). Reads like a letter: kind and number up top, the cat, the body, Dr. Kivlin's sign-off.
export async function IssuePage({ issue, prev, next }: { issue: Issue; prev: Issue | null; next: Issue | null }) {
  return (
    <article className={`tone--${issue.tone}`}>
      <header className="post-hd">
        <div className="post-hd__in">
          <div className="post-hd__top">
            <a className="post-hd__back" href="/letters">Letters</a>
            <span className="pill">Class Notes · No. {issue.n}</span>
            <span className="post-hd__meta"><time dateTime={issue.date}>{fmtDate(issue.date)}</time> · {issue.minutes} min read</span>
          </div>
          <div className="post-hd__art" aria-hidden="true"><Cat pose={issue.cat} width={120} priority /></div>
          <h1 className="h1">{issue.subject}</h1>
          <p className="lede">{issue.preview}</p>
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
          <Mdx source={issue.web} slug={issue.slug} />
        </div>

        <div className="signoff">
          <span className="signoff__name">{dana.name}</span>
          <span className="signoff__who">{dana.name}, {dana.role.toLowerCase()}, {dana.practice}</span>
        </div>

        <div className="post-foot">
          <div className="reviewed">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dana.avatar} alt="" width={52} height={52} loading="lazy" />
            <p style={{ margin: 0 }}>
              <b>Written by {dana.name}</b>, {dana.role.toLowerCase()}. This letter went out by email on <time dateTime={issue.date}>{fmtDate(issue.date)}</time>.
              It teaches; your own doctor diagnoses.
            </p>
          </div>

          {issue.sources.length > 0 && (
            <section className="sources" aria-labelledby="sources">
              <h2 id="sources">Sources</h2>
              <ol>
                {issue.sources.map((s) => (
                  <li key={s.n} id={`src-${s.n}`}>
                    {s.text}{' '}
                    {s.url && <a href={s.url} rel="noopener nofollow" target="_blank">{new URL(s.url).hostname.replace(/^www\./, '')}</a>}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>

      {(prev || next) && (
        <nav className="read issue-nav" aria-label="More Class Notes">
          {prev ? <a href={`/letters/${prev.slug}`}><small>Before · No. {prev.n}</small><b>{prev.subject}</b></a> : <span />}
          {next ? <a href={`/letters/${next.slug}`} data-next><small>Next · No. {next.n}</small><b>{next.subject}</b></a> : <span />}
        </nav>
      )}

      <div className="pref__row"><PreferredSource /></div>
      <div className="wrap" style={{ marginTop: 24, paddingBottom: 72 }}>
        <Newsletter source={`/letters/${issue.slug}`} tag="issue-end" title={<>Liked this? The next one lands <em>Wednesday or Sunday</em>.</>} pose="bell" peek />
      </div>
    </article>
  );
}
