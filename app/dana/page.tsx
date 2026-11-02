import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { Smile } from '@/components/Smile';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbs, danaId, graph, meta } from '@/lib/seo';
import { absoluteUrl, dana, site } from '@/lib/site';

// Dr. Dana, in her own words: who she is, why the class, where to find her. Trust only, no call to action.
export const metadata = meta({
  title: 'Dr. Dana Kivlin, DO, board-certified urologist',
  description: 'I am Dr. Dana Kivlin, a board-certified urologist at Middlesex Health in Middletown, Connecticut, and the teacher behind Pelvic Health Class: for Women.',
  path: '/dana',
});

export default function Page() {
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
          <h2 id="why" className="h2">Why I made this class</h2>
          <Smile />
          <div className="prose" style={{ marginTop: 26 }}>
            <p>Bladder leaks are among the most common things women live with. In a national survey, 6 in 10 American women leaked in the past year.</p>
            <p>The first treatment the guidelines recommend is free: pelvic floor muscle training. It works for many women. It also takes 12 weeks of daily practice, and the hard part is the daily.</p>
            <p>So I built a class around that hard part. 1 short lesson a week. 1 guided exercise a day, 5 minutes long. A cat that lifts with you, and naps in its hammock when your day is done.</p>
          </div>
          <div className="signoff"><span className="signoff__name">Dana</span></div>
        </div>
      </section>

      <section className="sec" aria-labelledby="find">
        <div className="wrap">
          <div className="sec__hd"><div><span className="eyebrow">Where you can find me</span><h2 id="find" className="h2">Same person, same advice</h2></div></div>
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

      <section className="sec" aria-labelledby="podcasts" style={{ paddingTop: 0, paddingBottom: 72 }}>
        <div className="read">
          <span className="eyebrow">On podcasts</span>
          <h2 id="podcasts" className="h3" style={{ marginTop: 12 }}>Where I talk pelvic health</h2>
          {dana.podcasts.length ? (
            <ul className="qlist" style={{ marginTop: 18 }}>
              {dana.podcasts.map((p) => (
                <li key={p.url}><a className="link" href={p.url} rel="noopener" target="_blank">{p.show}: {p.episode}</a><span>{new Date(p.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></li>
              ))}
            </ul>
          ) : (
            <p className="lede" style={{ marginTop: 10 }}>My first podcast interviews are on the way. Each episode will be listed here.</p>
          )}
        </div>
      </section>
      <JsonLd data={graph({ '@type': 'ProfilePage', '@id': absoluteUrl('/dana'), url: absoluteUrl('/dana'), name: dana.name, mainEntity: { '@id': danaId }, dateModified: '2026-11-02' }, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Dr. Dana', path: '/dana' }]))} />
    </>
  );
}
