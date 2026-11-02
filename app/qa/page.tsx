import { cookies } from 'next/headers';
import { createHash } from 'node:crypto';
import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { Smile } from '@/components/Smile';
import { JsonLd } from '@/components/JsonLd';
import { LinkForm, AskForm } from '@/components/QaForms';
import { signOut } from './actions';
import { api, convex, secret } from '@/lib/convex';
import { breadcrumbs, graph, meta } from '@/lib/seo';
import { dana, site } from '@/lib/site';

export const metadata = meta({
  title: 'Ask Dr. Dana: the monthly live Q&A for members',
  description: 'Once a month, Dr. Dana Kivlin answers members\' questions live for 45 minutes. Send your question ahead, join live, or watch the replay.',
  path: '/qa',
});

const FAQ = [
  { q: 'Who can join?', a: `Members with a paid plan in ${site.appName}. Sign in with the email you added in the app.` },
  { q: 'Will people see my name?', a: 'Dr. Dana reads questions without names. You can choose to show your first name, and only that.' },
  { q: 'Can Dr. Dana diagnose me live?', a: 'She teaches and explains, the way she does in her letters. A diagnosis needs your own doctor, who can examine you.' },
  { q: 'What if I miss it?', a: 'The replay goes on this page after each session, for members.' },
];

const fmt = (t: number) => new Date(t).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short' });
const day = (t: number) => new Date(t).toLocaleDateString('en-US', { day: 'numeric', timeZone: 'America/New_York' });
const mon = (t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', timeZone: 'America/New_York' });

export default async function Page({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  const sp = await searchParams;
  const c = convex();
  const pass = (await cookies()).get('hc_qa')?.value;
  const portal = c && pass ? await c.query(api.qa.portal, { secret, passHash: createHash('sha256').update(pass).digest('hex') }).catch(() => null) : null;
  const next = portal?.next ?? (c ? await c.query(api.qa.nextEvent, {}).catch(() => null) : null);

  return (
    <>
      <section className="hero" style={{ paddingBottom: 32 }}>
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <span className="eyebrow">For members · {site.qa.cadence.toLowerCase()}</span>
            <h1 className="h1">Ask Dr. Dana, <em>live</em>.</h1>
            <Smile />
            <p className="lede">Once a month, {dana.name} answers members&rsquo; questions live for {site.qa.length}. Send yours ahead, join from your phone, or watch the replay.</p>
            {next ? (
              <div className="session" style={{ marginTop: 26, maxWidth: 520 }}>
                <div className="session__date"><div><b>{day(next.startsAt)}</b><span>{mon(next.startsAt)}</span></div></div>
                <div><div className="session__t">{next.title}</div><div className="session__s">{fmt(next.startsAt)} · {next.durationMin} min</div></div>
              </div>
            ) : (
              <div className="session" style={{ marginTop: 26, maxWidth: 520 }}>
                <div className="session__date"><div><b>1</b><span>a month</span></div></div>
                <div><div className="session__t">The next date goes out by email</div><div className="session__s">Members receive each date by email.</div></div>
              </div>
            )}
          </div>
          <div className="hero__art" style={{ aspectRatio: 'auto', display: 'grid', placeItems: 'center' }}>
            <div className="tone-disc tone--plum" style={{ width: 'min(100%, 380px)' }} aria-hidden="true"><Cat pose="calendar" width={380} priority /></div>
          </div>
        </div>
      </section>

      {portal ? (
        <section className="sec--tight" aria-labelledby="portal">
          <div className="wrap portal">
            <div className="gate" style={{ gridTemplateColumns: '1fr' }}>
              <div>
                <span className="eyebrow">Signed in as {portal.email}</span>
                <h2 id="portal" className="h2" style={{ marginTop: 12, fontSize: 'clamp(28px,3.2vw,40px)' }}>Welcome to the members&rsquo; page</h2>
                {portal.next ? (
                  <div style={{ marginTop: 20 }}>
                    <p className="lede">Next session: <b>{portal.next.title}</b>, {fmt(portal.next.startsAt)}.</p>
                    {portal.next.joinUrl ? (
                      <a className="btn" style={{ marginTop: 16 }} href={portal.next.joinUrl} rel="noopener" target="_blank"><Icon name="video" /> Join the live session</a>
                    ) : (
                      <p className="muted">The join link appears here on the day.</p>
                    )}
                  </div>
                ) : (
                  <p className="lede" style={{ marginTop: 16 }}>The next date is on its way. Send your question now: it goes to the top of the list.</p>
                )}
              </div>
            </div>
            <div className="gate" style={{ gridTemplateColumns: '1fr' }}>
              <div>
                <h3 className="h3">Send Dr. Dana your question</h3>
                <p className="muted" style={{ margin: '8px 0 16px' }}>She reads them without names, unless you choose to show your first name.</p>
                <AskForm />
                {portal.questions.length > 0 && (
                  <>
                    <h4 style={{ margin: '28px 0 10px', font: '600 13px/1.2 var(--sans)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--plum)' }}>Your questions</h4>
                    <ul className="qlist">
                      {portal.questions.map((q) => (<li key={q.createdAt}>{q.text}<span>{q.status === 'answered' ? 'Answered' : q.status === 'picked' ? 'Picked for the next session' : 'Received'} · {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></li>))}
                    </ul>
                  </>
                )}
              </div>
            </div>
            {portal.replays.length > 0 && (
              <div className="gate" style={{ gridTemplateColumns: '1fr' }}>
                <div>
                  <h3 className="h3">Replays</h3>
                  <ul className="qlist" style={{ marginTop: 14 }}>
                    {portal.replays.map((r) => (<li key={r.replayUrl}><a className="link" href={r.replayUrl} rel="noopener" target="_blank">{r.title}</a><span>{fmt(r.startsAt)}</span></li>))}
                  </ul>
                </div>
              </div>
            )}
            <form action={signOut}><button className="btn btn--quiet btn--sm" type="submit">Sign out</button></form>
          </div>
        </section>
      ) : (
        <>
          <section className="sec--tight" aria-labelledby="how">
            <div className="wrap">
              <h2 id="how" className="sr-only">How it works</h2>
              <ol className="steps">
                <li><b>Send your question</b><p>Any time before the session, from this page. Up to 200 words, read without your name.</p></li>
                <li><b>Join live</b><p>{site.qa.length} with Dr. Dana, from your phone or laptop. Camera off is fine.</p></li>
                <li><b>Watch the replay</b><p>Missed it? The recording waits here for members.</p></li>
              </ol>
            </div>
          </section>
          <section className="sec" aria-labelledby="gate">
            <div className="wrap">
              <div className="gate peek-host" style={{ marginTop: 40 }}>
                <Cat pose="peek" width={150} className="peek peek--left" />
                <div>
                  <span className="eyebrow">Members</span>
                  <h2 id="gate" className="h2" style={{ marginTop: 12, fontSize: 'clamp(28px,3.2vw,40px)' }}>Get your link</h2>
                  {sp.link === 'expired' && <p className="nl-err" role="alert" style={{ marginLeft: 0 }}>That link expired or was already used. Ask for a new one below.</p>}
                  <p className="lede" style={{ marginTop: 10 }}>Type the email you added in the app. If it has a plan, a sign-in link lands in your inbox within a minute.</p>
                  <LinkForm />
                  <p className="nl-fine" style={{ marginLeft: 0 }}>Not a member yet? <a href="/app">Start week 1 free in the app</a>, then pick a plan to join.</p>
                </div>
                <div className="gate__art" aria-hidden="true"><Cat pose="bell" width={200} /></div>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="sec--tight" aria-labelledby="qa-faq" style={{ paddingBottom: 72 }}>
        <div className="read">
          <h2 id="qa-faq" className="h3">Questions about the Q&amp;A</h2>
          <div className="faq" style={{ marginTop: 8 }}>
            {FAQ.map((f) => (<details key={f.q}><summary>{f.q}</summary><div><p>{f.a}</p></div></details>))}
          </div>
        </div>
      </section>
      <JsonLd data={graph({ '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Live Q&A', path: '/qa' }]))} />
    </>
  );
}
