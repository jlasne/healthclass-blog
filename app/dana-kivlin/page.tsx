import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { Smile } from '@/components/Smile';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbs, danaId, graph, meta, dt } from '@/lib/seo';
import { absoluteUrl, dana, site } from '@/lib/site';

// Dr. Dana, in her own words: who she is, why the class, where to find her. Trust only, no call to action.
export const metadata = meta({
  title: 'Dr. Dana Kivlin, Urologist · Pelvic Health for Women',
  description: 'Dr. Dana Kivlin is a board-certified urologist in Connecticut. Her story, her rules for your bladder and pelvic floor, and the 5 signs that need a urologist.',
  path: '/dana-kivlin',
});

// From her Instagram reels (content/dana/reels-tips.md), in her voice. Education only: her rules and her warning
// signs, no treatment advice on this page.
const RULES: { title: string; text: string; tone: 'rosy' | 'sky' | 'plum' | 'blush' }[] = [
  { title: 'Common is not normal', text: '1 in 2 women will leak urine. Women wait 6.5 years on average to bring it up. Treat every symptom as fixable, and ask early.', tone: 'rosy' },
  { title: 'Train your bladder', text: 'Do 3 things before the toilet when you get home: keys away, shoes off, bag on the hook. Then walk calmly. Your bladder learns to wait its turn.', tone: 'sky' },
  { title: 'Drink more to pee less', text: 'Concentrated urine irritates your bladder. Sip water steadily through the day, and cut back 1 to 2 hours before bed.', tone: 'plum' },
  { title: 'Tight is weak too', text: 'About 1 in 10 people have a tight pelvic floor, and Kegels make it worse. Learn to let go first, then strengthen.', tone: 'blush' },
  { title: 'Lift weights, guide the pressure', text: 'Muscle protects your pelvic floor. Breathe 360 degrees, breathe out on the effort, start light and progress slowly.', tone: 'sky' },
  { title: 'The core is the glue', text: 'Your deep core fires a split second before you move. I have yet to meet a prolapse patient with a strong core.', tone: 'rosy' },
];

const RECIPE: { title: string; text: string }[] = [
  { title: 'Mobility', text: 'Stretch, breathe from your diaphragm, lower your stress.' },
  { title: 'Posture', text: 'Sit and stand tall. Use a chair that supports your lower back and pelvis.' },
  { title: 'Core', text: 'Planks, dead bugs and bird dogs.' },
  { title: 'Gut', text: 'Eat fiber and drink water with it. Constipation strains your pelvic floor.' },
  { title: 'Kegels', text: 'Last, once the first 4 are in place, with the right technique.' },
];

const SIGNS = [
  'Urgency that borders on pain',
  'Pain when you pee, above all at the end of your stream',
  'UTI symptoms that keep coming back with negative cultures',
  'A sudden change in urgency and frequency that stays',
  'Blood in your urine, whether you see it or a test finds it',
];

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
            <p>Bladder leaks are among the most common things women live with. In a national survey, 6 in 10 American women leaked in the past year.</p>
            <p>The first treatment the guidelines recommend is free: pelvic floor muscle training. It works for many women. It also takes 12 weeks of daily practice, and the hard part is the daily.</p>
            <p>So I built a class around that hard part. 1 short lesson a week. 1 guided exercise a day, 5 minutes long. A cat that lifts with you, and naps in its hammock when your day is done.</p>
          </div>
          <div className="signoff"><span className="signoff__name">Dana</span></div>
        </div>
      </section>

      <section className="sec" aria-labelledby="rules">
        <div className="wrap">
          <div className="sec__hd">
            <div><span className="eyebrow">From my reels</span><h2 id="rules" className="h2">What I tell <em>every patient</em></h2></div>
            <p>The rules I repeat in clinic and on Instagram, {dana.socials[0].handle}. They teach. Your own doctor decides what fits you.</p>
          </div>
          <div className="programs">
            {RULES.map((r) => (
              <div key={r.title} className={`program tone--${r.tone}`}>
                <b>{r.title}</b>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band" aria-labelledby="recipe">
        <div className="read">
          <span className="eyebrow">My pelvic floor recipe</span>
          <h2 id="recipe" className="h2" style={{ marginTop: 12 }}>Kegels are 1 ingredient <em>of 5</em></h2>
          <Smile />
          <p className="lede" style={{ marginTop: 22 }}>Women who rely on Kegels alone often see no change. Build the 5 ingredients in this order: each one supports the next.</p>
          <ol className="join-steps tone--rosy">
            {RECIPE.map((r) => (<li key={r.title}><b>{r.title}</b><span>{r.text}</span></li>))}
          </ol>
          <div className="prose" style={{ marginTop: 30 }}>
            <h3>How I teach a Kegel</h3>
            <ul>
              <li><strong>Lift</strong> as if you hold in gas or stop your stream. Practice off the toilet.</li>
              <li><strong>Hold, then let go:</strong> 3 seconds on, 3 seconds off. Build to 5, then 10 seconds.</li>
              <li><strong>Quick flicks:</strong> squeeze hard for 1 second, rest 1 second.</li>
              <li><strong>Twice a day:</strong> 10 holds and 10 flicks while you brush your teeth.</li>
              <li><strong>Avoid the 3 mistakes:</strong> keep your butt and thighs relaxed, breathe through each squeeze, and relax fully between reps.</li>
            </ul>
            <p>Struggling to find the right muscles? See a pelvic floor physical therapist. More in my letters on <a href="/letters/how-to-do-kegels-correctly">Kegels done right</a> and on <a href="/letters/pelvic-floor-relaxation-let-go">letting go</a>.</p>
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="signs" style={{ paddingBottom: 24 }}>
        <div className="read">
          <span className="eyebrow">Act early</span>
          <h2 id="signs" className="h2" style={{ marginTop: 12 }}>5 signs that need a <em>urologist</em></h2>
          <Smile />
          <p className="lede" style={{ marginTop: 22 }}>Women die from bladder cancer at a higher rate than men, and a late diagnosis is a likely reason. See a urologist for any of these:</p>
          <aside className="box box--doctor" style={{ marginTop: 22 }}>
            <span className="box__k" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="alert" /> See a urologist for</span>
            <ol style={{ margin: 0, paddingLeft: 22 }}>
              {SIGNS.map((x) => <li key={x} style={{ margin: '6px 0' }}>{x}</li>)}
            </ol>
            <p style={{ margin: '14px 0 0' }}>2 UTIs in 6 months, or 3 in a year, count as recurrent. Ask for a full evaluation by name, with a pelvic exam. Bring all your culture results to one urologist.</p>
          </aside>
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
      <JsonLd data={graph({ '@type': 'ProfilePage', '@id': absoluteUrl('/dana-kivlin'), url: absoluteUrl('/dana-kivlin'), name: dana.name, mainEntity: { '@id': danaId }, dateModified: dt('2026-11-08') }, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Dr. Dana Kivlin', path: '/dana-kivlin' }]))} />
    </>
  );
}
