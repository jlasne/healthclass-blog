import { cookies } from 'next/headers';
import { createHash } from 'node:crypto';
import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { AskForm } from '@/components/QaForms';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Countdown } from '@/components/Countdown';
import { LiveClip } from '@/components/LiveClip';
import { signOut } from './actions';
import { api, convex, secret } from '@/lib/convex';
import { breadcrumbs, graph, meta } from '@/lib/seo';
import { dana, site } from '@/lib/site';

export const metadata = meta({
  title: 'Live with Dr. Dana: the monthly Q&A for members',
  description: 'Once a month, Dr. Dana Kivlin, urologist, answers your questions live. For the list: a premium plan in the app and the free letter.',
  path: '/live',
});

const fmt = (t: number) => new Date(t).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short' });

export default async function Page() {
  const c = convex();
  const pass = (await cookies()).get('hc_qa')?.value;
  const portal = c && pass ? await c.query(api.qa.portal, { secret, passHash: createHash('sha256').update(pass).digest('hex') }).catch(() => null) : null;
  const next = portal?.next ?? (c ? await c.query(api.qa.nextEvent, {}).catch(() => null) : null);

  const fallback = Date.parse(site.qa.next);
  const durMin = next?.durationMin ?? 45;
  const startsAt = next?.startsAt ?? fallback;
  // after the live ends, and until the next one is set, the page says "date soon" instead of an old date
  // only the month set (site.qa.month): "in December", no date and no countdown
  const month = site.qa.month;
  const over = Boolean(month) || !Number.isFinite(startsAt) || Date.now() > startsAt + durMin * 60_000;
  const soon = month ? `in ${month}` : 'date soon';
  const at = (o: Intl.DateTimeFormatOptions) => new Date(startsAt).toLocaleString('en-US', { timeZone: 'America/New_York', ...o });
  const date = over ? '' : at({ month: 'long', day: 'numeric' });
  const when = over ? '' : `${at({ weekday: 'long' })} · ${at({ hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })} · ${durMin} min`;
  const appLive = Boolean(site.appStoreUrl || site.playStoreUrl);

  if (!portal) {
    return (
      <>
        <section className="hero hero--center hero--band live-hero">
          <div className="read">
            <div className="live-hero__clip">
              <LiveClip src={site.qa.clip} poster={dana.hero} label={`${dana.name}, urologist`} captions={[over ? `Next live: ${soon}.` : `Next live: ${date}.`, 'Only for the list.', 'Your code is in the app.']} />
              <Cat pose="calendar" width={120} className="live-hero__cat" />
            </div>
            <span className="eyebrow">Live with Dr. Dana</span>
            <h1 className="h1 h1--xl">Next live: <em>{over ? soon : date}</em>.</h1>
            {!over && <p className="lede">{when}. Dr. Dana answers your questions live.</p>}
            {month && <p className="lede">{durMin} minutes. Dr. Dana answers your questions live.</p>}
            {!over && <div className="live-hero__count"><Countdown to={startsAt} durationMin={durMin} /></div>}
          </div>
        </section>

        <section className="read live-how" aria-labelledby="how" style={{ paddingBottom: 80 }}>
          <span className="eyebrow">Only for the list</span>
          <h2 id="how" className="h2">How to <em>join</em>.</h2>
          <ol className="join-steps">
            <li className="tone--rosy"><b>Go premium in the app</b><span>{appLive ? 'Monthly or Yearly.' : 'The app opens soon.'}</span></li>
            <li className="tone--sky"><b>Join the free letter</b><span>Every Wednesday and Sunday.</span></li>
            <li className="tone--plum"><b>Get your code in the app</b><span>The letter reminds you the week of the live.</span></li>
          </ol>
          <div className="live-how__join">
            <NewsletterForm source="/live#how" tag="live-date" cta="Join the letter" />
            <a className="link live__app" href="/#get">{appLive ? 'Get the app' : 'The app opens soon: see it'}</a>
          </div>
        </section>
        <JsonLd data={graph(breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Live', path: '/live' }]))} />
      </>
    );
  }


  return (
    <section className="hero hero--center" style={{ paddingBottom: 80 }}>
      <div className="read">
        <div className="hero__cat" aria-hidden="true"><Cat pose="calendar" width={210} priority /></div>
        <h1 className="h1" style={{ fontSize: 'clamp(40px, 5.6vw, 64px)' }}>Live with Dr. <em>Dana</em>.</h1>
        <p className="lede">Once a month, Dr. Dana answers your questions live.</p>
        {month ? <p className="next-live">Next live: in {month}</p> : next && <p className="next-live">Next live: {fmt(next.startsAt)}</p>}

        {portal ? (
          <div className="portal" style={{ marginTop: 32, textAlign: 'left' }}>
            <div className="gate" style={{ gridTemplateColumns: '1fr' }}>
              <div>
                <span className="eyebrow">Unlocked · {portal.email}</span>
                {portal.next?.joinUrl ? (
                  <a className="btn" style={{ marginTop: 16 }} href={portal.next.joinUrl} rel="noopener" target="_blank"><Icon name="video" /> Join the live</a>
                ) : (
                  <p className="muted" style={{ marginTop: 12 }}>The join link appears here on the day.</p>
                )}
                <h2 className="h3" style={{ marginTop: 26 }}>Your question for Dr. Dana</h2>
                <div style={{ marginTop: 14 }}><AskForm /></div>
                {portal.replays.length > 0 && (
                  <>
                    <h2 className="h3" style={{ marginTop: 30 }}>Past lives</h2>
                    <ul className="qlist" style={{ marginTop: 14 }}>
                      {portal.replays.map((r) => (<li key={r.replayUrl}><a className="link" href={r.replayUrl} rel="noopener" target="_blank">{r.title}</a><span>{fmt(r.startsAt)}</span></li>))}
                    </ul>
                  </>
                )}
              </div>
            </div>
            <form action={signOut} style={{ marginTop: 14 }}><button className="btn btn--quiet btn--sm" type="submit">Sign out</button></form>
          </div>
        ) : (
          <>
            <div className="hero__form"><NewsletterForm source="/live#hero" tag="live-date" cta="Tell me the next date" /></div>
          </>
        )}
      </div>
      <JsonLd data={graph(breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Live', path: '/live' }]))} />
    </section>
  );
}
