import { cookies } from 'next/headers';
import { createHash } from 'node:crypto';
import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { LinkForm, AskForm } from '@/components/QaForms';
import { signOut } from './actions';
import { api, convex, secret } from '@/lib/convex';
import { breadcrumbs, graph, meta } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = meta({
  title: 'Live with Dr. Dana: the monthly Q&A for members',
  description: 'Once a month, Dr. Dana Kivlin answers members\' questions live. Unlocked with a premium plan in the app and the free letters.',
  path: '/live',
});

const fmt = (t: number) => new Date(t).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short' });

export default async function Page({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  const sp = await searchParams;
  const c = convex();
  const pass = (await cookies()).get('hc_qa')?.value;
  const portal = c && pass ? await c.query(api.qa.portal, { secret, passHash: createHash('sha256').update(pass).digest('hex') }).catch(() => null) : null;
  const next = portal?.next ?? (c ? await c.query(api.qa.nextEvent, {}).catch(() => null) : null);

  return (
    <section className="hero hero--center" style={{ paddingBottom: 80 }}>
      <div className="read">
        <div className="hero__cat" aria-hidden="true"><Cat pose="calendar" width={210} priority /></div>
        <h1 className="h1" style={{ fontSize: 'clamp(40px, 5.6vw, 64px)' }}>Live with Dr. <em>Dana</em>.</h1>
        <p className="lede">Once a month, Dr. Dana answers members&rsquo; questions live. Every past live waits here too.</p>
        {next && <p className="next-live">Next live: {fmt(next.startsAt)}</p>}

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
            <ul className="locks" aria-label="To unlock the lives">
              <li><Icon name="lock" /><div>A premium plan in the app<span>Weekly or Annual, in {site.appShort}</span></div></li>
              <li><Icon name="lock" /><div>The free letters<span>With the same email as in the app</span></div></li>
            </ul>
            {sp.link === 'expired' && <p className="nl-err" role="alert">That link expired or was already used. Ask for a new one below.</p>}
            <div className="hero__form"><LinkForm /></div>
          </>
        )}
      </div>
      <JsonLd data={graph(breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Live', path: '/live' }]))} />
    </section>
  );
}
