import QRCode from 'qrcode';
import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { Smile } from '@/components/Smile';
import { Stores } from '@/components/Stores';
import { Phone } from '@/components/AppBand';
import { NewsletterForm } from '@/components/NewsletterForm';
import { JsonLd } from '@/components/JsonLd';
import { app, breadcrumbs, graph, meta } from '@/lib/seo';
import { dana, programs, site } from '@/lib/site';

export const metadata = meta({
  title: `${site.appName}: pelvic floor classes from a urologist`,
  description: `Dr. Dana Kivlin's pelvic floor class on your phone: 6-week programs for leaks and the basics, 5 minutes a day. Week 1 free.`,
  path: '/app',
});

const FAQ = [
  { q: 'What is in the app?', a: 'Two 6-week programs at launch, Pelvic Floor 101 and Bladder leaks. Each week has 1 short lesson. Each day has 1 guided exercise of 5 to 8 minutes, a check-in and a private log.' },
  { q: 'How much does it cost?', a: `Week 1 of each program is free. Then ${site.price.weekly} a week, or ${site.price.annual} a year with every program and every update. When your store offers a free trial, the app shows the day you pay before you start.` },
  { q: 'Who made it?', a: `${dana.name}, a board-certified urologist at ${dana.practice}. She wrote or approved every lesson, exercise and warning sign.` },
  { q: 'What happens to my health answers?', a: 'They stay on your phone. Your log, notes and photos stay there too. We receive your email only if you add it.' },
  { q: 'Is it safe for me?', a: 'Before day 1, a short safety check lists the signs that call for a doctor first, like pregnancy complications, a recent birth or surgery, pelvic pain or a bulge. The app is education and supports the care of your own doctor.' },
  { q: 'Do members get anything else?', a: 'Yes: a live Q&A with Dr. Dana once a month, with replays on the members’ page.' },
];

export default async function Page() {
  const qr = await QRCode.toString(`https://${site.magicHost}`, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#4A2433', light: '#0000' } });
  return (
    <>
      <section className="hero">
        <div className="wrap app">
          <div className="app__copy">
            <span className="eyebrow">The app</span>
            <h1 className="h1" style={{ marginTop: 16 }}>{site.appShort}: <em>for Women</em></h1>
            <Smile />
            <p className="lede">Dr. Dana&rsquo;s pelvic floor class on your phone. 6-week programs, 1 short lesson a week, 1 guided exercise a day. Week 1 of each program is free.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18, marginTop: 28 }}>
              <Stores />
              <div className="qr" aria-label={`QR code: scan to open ${site.magicHost} on your phone`} role="img">
                <span dangerouslySetInnerHTML={{ __html: qr }} />
                <small>Scan with your phone</small>
              </div>
            </div>
            {!site.appStoreUrl && !site.playStoreUrl && (
              <div style={{ marginTop: 28, maxWidth: 520 }}>
                <p style={{ margin: '0 0 12px', fontWeight: 600, color: 'var(--ink)' }}>Launching soon on iPhone and Android. Get the launch day by email:</p>
                <NewsletterForm source="/app#waitlist" tag="app-waitlist" cta="Tell me on launch day" />
              </div>
            )}
          </div>
          <Phone />
        </div>
      </section>

      <section className="sec--tight" aria-labelledby="programs">
        <div className="wrap">
          <div className="sec__hd"><div><span className="eyebrow">The programs</span><h2 id="programs" className="h2">6 weeks each. 5 minutes a day.</h2></div><p>2 programs at launch, 4 more on the way. Members vote for the next one with &ldquo;Notify me&rdquo;.</p></div>
          <div className="programs">
            {programs.map((p, i) => (
              <div key={p.name} className={`program tone--${p.tone}`} data-rise style={{ ['--i' as string]: i }}>
                <span className={`pill${p.status === 'live' ? ' is-live' : ''}`}>{p.status === 'live' ? 'Live' : 'Coming next'}</span>
                <b>{p.name}</b>
                <p>{p.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="day">
        <div className="wrap">
          <div className="sec__hd"><div><span className="eyebrow">A day in the class</span><h2 id="day" className="h2">What 5 minutes looks like</h2></div></div>
          <ol className="steps">
            <li><b>A guided exercise</b><p>A breathing ring and a timer lead each lift and each let-go. The cat lifts with you.</p></li>
            <li><b>A 10-second check-in</b><p>How it felt, and any leak. It builds a private log your doctor can read with you.</p></li>
            <li><b>1 lesson a week</b><p>A short, sourced lesson from Dr. Dana: why this week&rsquo;s exercise works.</p></li>
          </ol>
        </div>
      </section>

      <section className="sec band" aria-labelledby="plans">
        <div className="wrap">
          <div className="sec__hd"><div><span className="eyebrow">Plans</span><h2 id="plans" className="h2">Week 1 is free. Then pick a plan.</h2></div><p>A free trial when your store offers one, with the charge date shown first. Cancel anytime in your App Store or Google Play settings.</p></div>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div className="stat tone--plum"><span className="eyebrow eyebrow--plain">Weekly</span><span className="stat__n" style={{ marginTop: 10 }}>{site.price.weekly}<small> / week</small></span><p className="stat__t">Every program you start, while you keep going.</p></div>
            <div className="stat tone--rosy" style={{ boxShadow: 'inset 0 0 0 2px var(--plum)' }}><span className="pill is-live" style={{ position: 'absolute', top: 18, right: 18, background: 'var(--plum)', color: '#fff' }}>Best value</span><span className="eyebrow eyebrow--plain">Annual</span><span className="stat__n" style={{ marginTop: 10 }}>{site.price.annual}<small> / year</small></span><p className="stat__t">Every program, every update, every gift, and the monthly live Q&amp;A with Dr. Dana.</p><div style={{ position: 'absolute', right: 12, bottom: 6, width: 96 }} aria-hidden="true"><Cat pose="gift" width={96} /></div></div>
          </div>
          <p className="muted" style={{ fontSize: 14, marginTop: 16 }}>Prices in US dollars; your store shows your local price. Plans renew until you cancel. <a className="link" href="/terms#plans">Plan terms</a>.</p>
        </div>
      </section>

      <section className="sec--tight" aria-labelledby="app-faq" style={{ paddingBottom: 64 }}>
        <div className="read">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
            <h2 id="app-faq" className="h2">Questions</h2>
            <div style={{ width: 120 }} aria-hidden="true"><Cat pose="think" width={120} /></div>
          </div>
          <div className="faq" style={{ marginTop: 8 }}>
            {FAQ.map((f) => (<details key={f.q}><summary>{f.q}</summary><div><p>{f.a}</p></div></details>))}
          </div>
          <p style={{ marginTop: 24 }}><Icon name="chat" className="inline-ic" /> More answers on the <a className="link" href="/support">support page</a>.</p>
        </div>
      </section>
      <JsonLd data={graph(app, { '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'The app', path: '/app' }]))} />
    </>
  );
}
