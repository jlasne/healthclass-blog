import QRCode from 'qrcode';
import { liveLine, livesLeft, livesLeftLine } from '@/lib/lives';
import { Cat } from '@/components/Cat';
import { Stores } from '@/components/Stores';
import { NewsletterForm } from '@/components/NewsletterForm';
import { JsonLd } from '@/components/JsonLd';
import { app, graph, meta } from '@/lib/seo';
import { dana, site } from '@/lib/site';
import { getArticles, fmtDate } from '@/lib/articles';
import { sentIssues } from '@/lib/newsletter';
import { getResource } from '@/lib/resources';

// One page, one goal: the title, then the email (before launch: the launch-day waitlist), then the 3 wins and
// Dr. Dana. Then 3 doors.
export const metadata = {
  ...meta({
    title: `${site.appName}: the pelvic floor class by a urologist`,
    description: `The pelvic floor class for women, by a urologist. Laugh without worrying, get back to sport, feel in control.`,
    path: '/',
  }),
  title: { absolute: `${site.appName} · The pelvic floor class by a urologist` },
};

// the 3 things women come for (the current wording), each with its cat (still frames)
const WINS = [
  { text: 'Laugh without worrying', cat: 'laugh' },
  { text: 'Get back to sport', cat: 'stretch' },
  { text: 'Feel in control', cat: 'lift' },
];

// the live card counts the lives left in 2027: the page refreshes every hour
export const revalidate = 3600;

// the 3 newest letters (articles and Class Notes issues together) and 3 free tools: every new page gets a link here
const TOOLS = ['leak-type-quiz', 'kegel-timer', 'fiber-calculator'];

export default async function Home() {
  const latest = [
    ...getArticles().map((a) => ({ href: `/letters/${a.slug}`, title: a.title, tone: a.tone, cat: a.cat, date: a.date, tag: a.topic })),
    ...sentIssues().map((i) => ({ href: `/letters/${i.slug}`, title: i.subject, tone: i.tone, cat: i.cat, date: i.date, tag: `Class Notes · No. ${i.n}` })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const tools = TOOLS.map((t) => getResource('tools', t)).filter((r): r is NonNullable<typeof r> => Boolean(r));
  const live = Boolean(site.appStoreUrl || site.playStoreUrl);
  const qr = await QRCode.toString(`https://${site.magicHost}`, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#4A2433', light: '#0000' } });
  return (
    <>
      <section className="lp" id="get">
        <div className="wrap lp__in">
          <h1 className="h1 lp__h1">The pelvic floor class for <em>women</em>.</h1>
          {live ? (
            <div className="lp__get">
              <Stores />
              <div className="qr" aria-label={`QR code: scan to open ${site.magicHost} on your phone`} role="img">
                <span dangerouslySetInnerHTML={{ __html: qr }} />
                <small>Scan with your phone</small>
              </div>
            </div>
          ) : (
            // before launch: the free letter is the waitlist (MailCheap); it sends the launch-day email
            <div className="lp__get">
              <p className="lp__soon">Coming soon on iPhone and Android. Get the launch&#8209;day email.</p>
              <NewsletterForm source="/#get" tag="app-waitlist" fine="Plus Dr. Dana's free letter. Unsubscribe in 1 click." privacy={false} />
            </div>
          )}
          <ul className="lp__wins" aria-label="What women come for">
            {WINS.map((w) => (
              <li key={w.text}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/cats/still/${w.cat}.svg`} alt="" width={44} height={44} />
                <span>{w.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec--tight" aria-label="More from Dr. Dana" style={{ paddingBottom: 72 }}>
        <div className="wrap doors">
          <a className="door" href="/dana-kivlin">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="door__face" src={dana.avatar} alt="" width={76} height={76} />
            <div><b>Meet {dana.name}</b><span>Urologist · {dana.practice}</span></div>
          </a>
          <a className="door" href="/letters">
            <span className="tone-disc tone--sky" aria-hidden="true"><Cat pose="read" width={76} /></span>
            <div><b>Read the letters</b><span>Free, every Wednesday and Sunday</span></div>
          </a>
          <a className="door" href="/live">
            <span className="tone-disc tone--plum" aria-hidden="true"><Cat pose="calendar" width={76} /></span>
            <div><b>{liveLine(livesLeft())}</b><span>{livesLeftLine(livesLeft()) || 'Ask Dr. Dana your questions'}</span></div>
          </a>
        </div>
      </section>
      <section className="sec--tight" aria-labelledby="latest" style={{ paddingTop: 0, paddingBottom: 72 }}>
        <div className="wrap">
          <div className="sec__hd"><div><h2 id="latest" className="h2">Latest letters</h2><p>Short and sourced, from a urologist.</p></div><a className="link" href="/letters">All letters →</a></div>
          <div className="related">
            {latest.map((l) => (
              <a key={l.href} className={`card tone--${l.tone}`} href={l.href}>
                <span className="card__art" aria-hidden="true"><Cat pose={l.cat} width={118} /></span>
                <b>{l.title}</b>
                <span>{l.tag} · {fmtDate(l.date, 'short')}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
      {tools.length > 0 && (
        <section className="sec--tight" aria-labelledby="tools" style={{ paddingTop: 0, paddingBottom: 72 }}>
          <div className="wrap">
            <div className="sec__hd"><div><h2 id="tools" className="h2">Free tools</h2><p>No email needed. The result shows on the page.</p></div><a className="link" href="/resources">All resources →</a></div>
            <div className="related">
              {tools.map((r) => (
                <a key={r.path} className={`card tone--${r.tone}`} href={r.path}>
                  <span className="card__art" aria-hidden="true"><Cat pose={r.cat} width={118} /></span>
                  <b>{r.title}</b>
                  <span>{r.excerpt.length > 70 ? `${r.excerpt.slice(0, 67).trim()}...` : r.excerpt}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
      <JsonLd data={graph(app)} />
    </>
  );
}
