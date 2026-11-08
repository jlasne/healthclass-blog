import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { Smile } from '@/components/Smile';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbs, danaId, graph, meta, dt } from '@/lib/seo';
import { getArticle, type Article } from '@/lib/articles';
import { FAMILIES, resolve, type Resource } from '@/lib/resources';
import { absoluteUrl, dana, site } from '@/lib/site';

// Dr. Dana, in her own words: who she is, why the class, where to find her. Trust only, no call to action.
export const metadata = meta({
  title: 'Dr. Dana Kivlin, Urologist · Pelvic Health for Women',
  description: 'Dr. Dana Kivlin is a board-certified urologist in Connecticut. Why she made a pelvic floor class for women, where to start reading, and where to find her.',
  path: '/dana-kivlin',
});

// Where to start: 3 of her letters and 3 resources. Each page appears only once it is live.
const LETTERS = ['bladder-leaks-common-not-normal', 'how-to-do-kegels-correctly', 'the-knack-squeeze-before-you-sneeze'];
const PAGES = ['tools/leak-type-quiz', 'made-for-you/leak-when-you-laugh', 'classes/bladder-leaks'];

export default function Page() {
  const letters = LETTERS.map((x) => getArticle(x)).filter((a): a is Article => Boolean(a));
  const pages = PAGES.map((x) => resolve(x)).filter((r): r is Resource => Boolean(r));
  return (
    <>
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <span className="eyebrow">About me</span>
            <h1 className="h1">I&rsquo;m Dr. Dana <em>Kivlin</em>.</h1>
            <p className="lede">
              I&rsquo;m a board-certified urologist at {dana.practice} in {dana.practiceCity}. I teach the class inside {site.appName}, and I write every letter on this site.
            </p>
            <ul className="creds" aria-label="My credentials">
              <li><Icon name="check" />Board certified in urology</li>
              <li><Icon name="check" />Doctor of Osteopathic Medicine, {dana.medicalSchool}, {dana.medicalSchoolYear}</li>
              <li><Icon name="check" />Urologist at {dana.practice}, {dana.practiceCity}</li>
            </ul>
          </div>
          <div className="hero__art">
            <div className="arch">
              <div className="arch__photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dana.photo} alt={`${dana.name}, urologist`} width={560} height={560} />
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
          <h2 id="why" className="h2">Why I made this class</h2>
          <Smile />
          <div className="prose" style={{ marginTop: 26 }}>
            <p>Every week, I meet women who plan their lives around a toilet. The mom who stopped jumping with her kids. The runner who maps every bathroom. The woman who crosses her legs before she sneezes.</p>
            <p>1 in 2 women will leak urine. Most wait years to say it out loud: 6.5 years, on average. Common and normal are two different things.</p>
            <p>I made this class so you can laugh, run and jump again, and feel in control of your body at every age.</p>
          </div>
          <div className="signoff"><span className="signoff__name">Dana</span></div>
        </div>
      </section>

      <section className="sec" aria-labelledby="start">
        <div className="wrap">
          <div className="sec__hd">
            <div><span className="eyebrow">Read more from me</span><h2 id="start" className="h2">Start <em>here</em></h2></div>
            <div className="sec__links"><a className="arrow" href="/letters">All letters</a><a className="arrow" href="/resources">All resources</a></div>
          </div>
          <div className="related related--next">
            {letters.map((a) => (
              <a key={a.slug} className={`card tone--${a.tone}`} href={`/letters/${a.slug}`}>
                <span className="card__art" aria-hidden="true"><Cat pose={a.cat} width={118} /></span>
                <span className="pill card__fam">Letter</span>
                <b>{a.title}</b>
                <span>{a.minutes} min read</span>
              </a>
            ))}
            {pages.map((r) => (
              <a key={r.path} className={`card tone--${r.tone}`} href={r.path}>
                <span className="card__art" aria-hidden="true"><Cat pose={r.cat} width={118} /></span>
                <span className="pill card__fam">{FAMILIES[r.family].name}</span>
                <b>{r.title}</b>
                <span>{r.minutes} min read</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="find">
        <div className="wrap">
          <div className="sec__hd"><div><span className="eyebrow">Where you can find me</span><h2 id="find" className="h2">Women&rsquo;s health, <em>every day</em></h2></div></div>
          <div className="related related--find">
            {dana.socials.map((s, i) => (
              <a key={s.url} className={`card${s.label === 'Instagram' ? ' card--ig' : ''} tone--${['rosy', 'sky', 'plum'][i % 3]}`} href={s.url} rel="me noopener" target="_blank">
                {s.label === 'Instagram' ? (
                  // a preview of her Instagram profile: her face, her handle, a reel that plays and 2 recent looks
                  <span className="ig" aria-hidden="true">
                    <span className="ig__hd">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <span className="ig__ring"><img src={dana.avatar} alt="" width={56} height={56} loading="lazy" /></span>
                      <span className="ig__who"><b>{s.handle.replace('@', '')}</b><span>{dana.name}</span></span>
                      <span className="ig__follow">Follow</span>
                    </span>
                    <span className="ig__bio">Urologist · Bladder, pelvic floor and women&rsquo;s health, in 1 minute</span>
                    <span className="ig__grid">
                      <span className="ig__post ig__post--reel">
                        <video src="/media/dana/insta.mp4" poster="/media/dana/ig/1.webp" autoPlay muted loop playsInline preload="metadata" />
                        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5v14l11-7z" fill="#fff" /></svg>
                      </span>
                      {[2, 3].map((n) => (
                        <span key={n} className="ig__post">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/media/dana/ig/${n}.webp`} alt="" width={240} height={320} loading="lazy" />
                        </span>
                      ))}
                    </span>
                  </span>
                ) : (
                  <span className="card__art" aria-hidden="true"><Cat pose={(['selfie', 'read', 'write'] as const)[i % 3]} width={118} /></span>
                )}
                <b>{s.label}</b>
                <span>{s.label === 'Instagram' ? 'Watch her videos' : s.handle} ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {dana.podcasts.length > 0 && (
      <section className="sec" aria-labelledby="podcasts" style={{ paddingTop: 0, paddingBottom: 72 }}>
        <div className="read">
          <span className="eyebrow">On podcasts</span>
          <h2 id="podcasts" className="h3" style={{ marginTop: 12 }}>Where I talk pelvic health</h2>
          
            <ul className="qlist" style={{ marginTop: 18 }}>
              {dana.podcasts.map((p) => (
                <li key={p.url}><a className="link" href={p.url} rel="noopener" target="_blank">{p.show}: {p.episode}</a><span>{new Date(p.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></li>
              ))}
            </ul>
          
        </div>
      </section>
      )}
      <JsonLd data={graph({ '@type': 'ProfilePage', '@id': absoluteUrl('/dana-kivlin'), url: absoluteUrl('/dana-kivlin'), name: dana.name, mainEntity: { '@id': danaId }, dateModified: dt('2026-11-08') }, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Dr. Dana Kivlin', path: '/dana-kivlin' }]))} />
    </>
  );
}
