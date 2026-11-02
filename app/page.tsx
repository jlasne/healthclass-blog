import QRCode from 'qrcode';
import { Cat } from '@/components/Cat';
import { Phone } from '@/components/AppBand';
import { Stores } from '@/components/Stores';
import { NewsletterForm } from '@/components/NewsletterForm';
import { JsonLd } from '@/components/JsonLd';
import { app, graph, meta } from '@/lib/seo';
import { dana, site } from '@/lib/site';

// One page, one goal: get the app. Below it, 3 doors: Dr. Dana, the letters, the lives.
export const metadata = {
  ...meta({
    title: `${site.appName}: the pelvic floor class by a urologist`,
    description: `Dr. Dana Kivlin's pelvic floor class on your phone. 5 minutes a day for your bladder, your core and your confidence. Week 1 free.`,
    path: '/',
  }),
  title: { absolute: `${site.appName} · The pelvic floor class by a urologist` },
};

export default async function Home() {
  const live = Boolean(site.appStoreUrl || site.playStoreUrl);
  const qr = await QRCode.toString(`https://${site.magicHost}`, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#4A2433', light: '#0000' } });
  return (
    <>
      <section className="home" id="get">
        <div className="wrap home__grid">
          <div>
            <span className="eyebrow">{site.appName}</span>
            <h1 className="h1">The pelvic floor class for <em>women</em>.</h1>
            <p className="lede">The upcoming app built to be the #1 for women&rsquo;s pelvic floor. 5 minutes a day, by a urologist. Week 1 free.</p>
            <ul className="impacts" aria-label="What your pelvic floor shapes">
              <li className="tone--rosy">Bladder control</li>
              <li className="tone--sky">Core strength</li>
              <li className="tone--plum">Intimacy</li>
              <li className="tone--blush">Pregnancy and after birth</li>
              <li className="tone--rosy">Menopause</li>
            </ul>
            {live ? (
              <div className="home__get">
                <Stores />
                <div className="qr" aria-label={`QR code: scan to open ${site.magicHost} on your phone`} role="img">
                  <span dangerouslySetInnerHTML={{ __html: qr }} />
                  <small>Scan with your phone</small>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 30, maxWidth: 520 }}>
                <p style={{ margin: '0 0 12px', fontWeight: 600, color: 'var(--ink)' }}>Coming soon to iPhone and Android.</p>
                <NewsletterForm source="/#get" tag="app-waitlist" cta="Tell me on launch day" />
              </div>
            )}
          </div>
          <Phone />
        </div>
      </section>

      <section className="sec--tight" aria-label="More from Dr. Dana" style={{ paddingBottom: 72 }}>
        <div className="wrap doors">
          <a className="door" href="/dana">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="door__face" src={dana.avatar} alt="" width={76} height={76} />
            <div><b>Meet {dana.name}, {dana.credential}</b><span>{dana.role} · {dana.practice}</span></div>
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
