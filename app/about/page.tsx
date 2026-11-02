import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { Smile } from '@/components/Smile';
import { Newsletter } from '@/components/Newsletter';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbs, danaId, graph, meta } from '@/lib/seo';
import { absoluteUrl, dana, site } from '@/lib/site';
import { getArticles } from '@/lib/articles';

export const metadata = meta({
  title: 'About Dr. Dana Kivlin, DO, board-certified urologist',
  description: 'Dr. Dana Kivlin is a board-certified urologist at Middlesex Health in Middletown, Connecticut, and the teacher behind Pelvic Health Class: for Women.',
  path: '/about',
  type: 'website',
});

const RULES = [
  { t: 'Guidelines first', d: 'Each letter starts from the guidelines doctors use (NICE, ACOG, AUA) and Cochrane reviews, which pool the best trials.' },
  { t: 'A source for every number', d: 'Each number links to its study, with the size of the study when it matters. Small studies are called small.' },
  { t: 'Written or approved by Dr. Dana', d: 'Dr. Dana writes or approves every line before it goes out, on the site, in the letter and in the app.' },
  { t: 'Dated and updated', d: 'Each letter shows the day it was last updated. When the evidence moves, the letter moves with it.' },
  { t: 'Funded by the app', d: 'The app pays for the letters. Brands pay for nothing here, so every recommendation answers to the research alone.' },
];

export default function Page() {
  const count = getArticles().length;
  return (
    <>
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <span className="eyebrow">About your teacher</span>
            <h1 className="h1">{dana.name}, <em>{dana.credential}</em></h1>
            <p className="lede">
              {dana.role} at {dana.practice} in {dana.practiceCity}. She teaches the pelvic floor class behind {site.appName}, and writes every letter on this site.
            </p>
            <ul className="creds" aria-label="Credentials">
              <li><Icon name="check" />{dana.board} (board certified in Urological Surgery)</li>
              <li><Icon name="check" />Doctor of Osteopathic Medicine, {dana.medicalSchool}, {dana.medicalSchoolYear}</li>
              <li><Icon name="check" />Urologist at {dana.practice}, {dana.practiceCity}</li>
              <li><Icon name="check" />{count} letters on this site, each with its sources</li>
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>
              <a className="btn" href="/newsletter">Get her Sunday letter</a>
              <a className="btn btn--quiet" href={dana.socials[0].url} rel="me noopener" target="_blank"><Icon name="instagram" /> {dana.socials[0].handle}</a>
            </div>
          </div>
          <div className="hero__art">
            <div className="arch">
              <div className="arch__photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dana.photo} alt={`${dana.name}, urologist`} width={560} height={560} fetchPriority="high" />
              </div>
              <Cat pose="heart" width={200} className="arch__cat" priority />
              <div className="arch__badge">
                <span className="arch__seal"><Icon name="seal" /></span>
                <div><b>Board certified</b><span>Urology · {dana.practice}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec band" aria-labelledby="why">
        <div className="read">
          <div className="reading-cat" style={{ marginBottom: 8 }} aria-hidden="true"><Cat pose="reading" width={220} /></div>
          <span className="eyebrow">Why this class</span>
          <h2 id="why" className="h2" style={{ marginTop: 14 }}>A letter from Dana</h2>
          <Smile />
          <div className="prose" style={{ marginTop: 26 }}>
            <p>Bladder leaks are among the most common things women live with. In a national survey, 6 in 10 American women leaked in the past year.</p>
            <p>The first treatment the guidelines recommend is free: pelvic floor muscle training. It works for many women. It also takes 12 weeks of daily practice, and the hard part is the daily.</p>
            <p>So I built a class around that hard part. 1 short lesson a week. 1 guided exercise a day, 5 minutes long. A cat that lifts with you, and naps in its hammock when your day is done.</p>
            <p>These letters are the free half of the class. Read one on Sunday, try one exercise that day, and send me your question.</p>
          </div>
          <div className="signoff"><span className="signoff__name">Dana</span><span className="signoff__who">{dana.fullName}, {dana.role.toLowerCase()}</span></div>
        </div>
      </section>

      <section className="sec" aria-labelledby="find">
        <div className="wrap">
          <div className="sec__hd"><div><span className="eyebrow">Find Dr. Dana</span><h2 id="find" className="h2">Where she teaches</h2></div><p>Her clinic profile, her research profile and her daily tips. Same person, same advice.</p></div>
          <div className="related">
            {dana.socials.map((s, i) => (
              <a key={s.url} className={`card tone--${['rosy', 'sky', 'plum'][i % 3]}`} href={s.url} rel="me noopener" target="_blank">
                <span className="card__art" aria-hidden="true"><Cat pose={(['selfie', 'read', 'write'] as const)[i % 3]} width={118} /></span>
                <b>{s.label}</b>
                <span>{s.handle} ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="podcasts" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="gate">
            <div>
              <span className="eyebrow">On podcasts</span>
              <h2 id="podcasts" className="h2" style={{ marginTop: 12, fontSize: 'clamp(30px,3.6vw,44px)' }}>Hear Dana <em>talk</em> pelvic health</h2>
              {dana.podcasts.length ? (
                <ul className="qlist" style={{ marginTop: 20 }}>
                  {dana.podcasts.map((p) => (
                    <li key={p.url}><a className="link" href={p.url} rel="noopener" target="_blank">{p.show}: {p.episode}</a><span>{new Date(p.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></li>
                  ))}
                </ul>
              ) : (
                <p className="lede" style={{ marginTop: 14 }}>Dana&rsquo;s first podcast interviews are on the way. Each episode lands here, and in Class Notes first.</p>
              )}
              <p style={{ marginTop: 18 }}>Host a show on women&rsquo;s health, fitness or motherhood? <a className="link" href={`mailto:${site.email}?subject=Podcast%20invitation%20for%20Dr.%20Dana`}>Invite Dr. Dana</a>.</p>
            </div>
            <div className="gate__art" aria-hidden="true"><Cat pose="bell" width={200} /></div>
          </div>
        </div>
      </section>

      <section id="how-we-write" className="sec band" aria-labelledby="how">
        <div className="wrap">
          <div className="sec__hd"><div><span className="eyebrow">Editorial policy</span><h2 id="how" className="h2">How we write</h2></div><p>5 rules for every letter, every lesson and every email.</p></div>
          <ol className="steps" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
            {RULES.map((r) => (<li key={r.t}><b>{r.t}</b><p>{r.d}</p></li>))}
          </ol>
          <p className="muted" style={{ marginTop: 26, maxWidth: 760, fontSize: 15 }}>
            Health Class teaches how the pelvic floor works and how to train it. It is education, and it supports the care of your own doctor, who can examine you and diagnose. In an emergency, call 911.
          </p>
        </div>
      </section>

      <div className="wrap" style={{ paddingTop: 72, paddingBottom: 40 }}>
        <Newsletter source="/about" tag="about" pose="read" />
      </div>
      <JsonLd data={graph({ '@type': 'ProfilePage', '@id': absoluteUrl('/about'), url: absoluteUrl('/about'), name: `About ${dana.name}`, mainEntity: { '@id': danaId }, dateModified: '2026-11-02' }, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'About Dr. Dana', path: '/about' }]))} />
    </>
  );
}
