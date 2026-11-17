import QRCode from 'qrcode';
import { liveLine, livesLeft, livesLeftLine } from '@/lib/lives';
import { Cat } from '@/components/Cat';
import { Stores } from '@/components/Stores';
import { NewsletterForm } from '@/components/NewsletterForm';
import { JsonLd } from '@/components/JsonLd';
import { app, graph, meta } from '@/lib/seo';
import { dana, site } from '@/lib/site';

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

export default async function Home() {
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
      <JsonLd data={graph(app)} />
    </>
  );
}
