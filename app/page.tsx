import QRCode from 'qrcode';
import { preload } from 'react-dom';
import { Cat } from '@/components/Cat';
import { HeroFilm } from '@/components/HeroFilm';
import { Stores } from '@/components/Stores';
import { Icon } from '@/components/Icon';
import { NewsletterForm } from '@/components/NewsletterForm';
import { JsonLd } from '@/components/JsonLd';
import { app, graph, meta } from '@/lib/seo';
import { dana, site } from '@/lib/site';

// One page, one goal: get the app. Below it, 3 doors: Dr. Dana, the letters, the lives.
export const metadata = {
  ...meta({
    title: `${site.appName}: the pelvic floor class by a urologist`,
    description: `The pelvic floor class for women, by a urologist. Laugh without worrying, get back to sport, feel in control.`,
    path: '/',
  }),
  title: { absolute: `${site.appName} · The pelvic floor class by a urologist` },
};

// the 3 things women come for, each with its cat (still frames: no loop)
const WINS = [
  { text: 'Laugh without worrying', cat: 'laugh', tone: 'rosy' },
  { text: 'Get back to sport', cat: 'stretch', tone: 'sky' },
  { text: 'Feel in control', cat: 'lift', tone: 'plum' },
];

export default async function Home() {
  const live = Boolean(site.appStoreUrl || site.playStoreUrl);
  preload('/media/hero/poster.jpg', { as: 'image', fetchPriority: 'high' });
  const qr = await QRCode.toString(`https://${site.magicHost}`, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#4A2433', light: '#0000' } });
  return (
    <>
      <section className="home home--film" id="get">
        <div className="wrap home__stage">
          <div className="home__copy">
            <h1 className="h1 home__h1">The pelvic floor class for <em>women</em>.</h1>
            <ul className="wins" aria-label="What women come for">
              {WINS.map((w) => (
                <li key={w.text} className={`tone--${w.tone}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <span className="wins__disc" aria-hidden="true"><img src={`/cats/still/${w.cat}.svg`} alt="" width={52} height={52} /></span>
                  <span>{w.text}</span>
                </li>
              ))}
            </ul>
            <p className="home__by">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dana.avatar} alt="" width={36} height={36} />By {dana.name}, urologist
            </p>
          </div>
          <div className="home__film"><HeroFilm /></div>
          <div className="home__cta">
            {live ? (
              <>
                <Stores />
                <div className="qr" aria-label={`QR code: scan to open ${site.magicHost} on your phone`} role="img">
                  <span dangerouslySetInnerHTML={{ __html: qr }} />
                  <small>Scan with your phone</small>
                </div>
              </>
            ) : (
              // before launch: the free letter is the waitlist (MailCheap), it sends the launch-day email
              <div className="soon">
                <p className="soon__t"><Icon name="apple" /><Icon name="play" />Coming soon on iPhone and Android</p>
                <p className="soon__s">Get the launch-day email and Dr. Dana&rsquo;s free letter.</p>
                <NewsletterForm source="/#get" tag="app-waitlist" fine="Free. Unsubscribe in 1 click." />
              </div>
            )}
          </div>
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
            <div><b>Join the lives</b><span>Ask Dr. Dana, once a month</span></div>
          </a>
        </div>
      </section>
      <JsonLd data={graph(app)} />
    </>
  );
}
