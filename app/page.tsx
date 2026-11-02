import { getArticles } from '@/lib/articles';
import { Letters, Feature } from '@/components/Letters';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Newsletter } from '@/components/Newsletter';
import { AppBand } from '@/components/AppBand';
import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { Smile } from '@/components/Smile';
import { JsonLd } from '@/components/JsonLd';
import { app, graph, meta } from '@/lib/seo';
import { dana, site } from '@/lib/site';

export const revalidate = 3600;

export const metadata = {
  ...meta({
    title: `${site.name}: your pelvic floor, taught by a urologist`,
    description: site.description,
    path: '/',
  }),
  title: { absolute: `${site.name} · Pelvic floor letters from a urologist, Dr. Dana Kivlin` },
};

export default function Home() {
  const all = getArticles();
  const [latest, ...rest] = all;
  return (
    <>
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <span className="eyebrow">{site.appName}</span>
            <h1 className="h1">Your pelvic floor, taught by a <em>urologist</em>.</h1>
            <p className="lede">
              Short letters from {dana.name}, a board-certified urologist, on leaks, Kegels and the 5-minute habits that fix them. 1 letter every Sunday. Free.
            </p>
            <div className="hero__form">
              <NewsletterForm source="/#hero" tag="home-hero" />
            </div>
            <ul className="trust" aria-label="Why women trust Class Notes">
              <li><Icon name="seal" />Written by a board-certified urologist</li>
              <li><Icon name="book" />Every number has its source</li>
              <li><Icon name="heart" />Free, for every woman</li>
            </ul>
          </div>
          <div className="hero__art">
            <div className="arch">
              <div className="arch__photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dana.hero} alt={`${dana.name}, urologist`} width={576} height={720} fetchPriority="high" />
              </div>
              <Cat pose="hello" width={210} className="arch__cat" priority />
              <div className="arch__badge">
                <span className="arch__seal"><Icon name="seal" /></span>
                <div><b>{dana.name}, {dana.credential}</b><span>{dana.role} · {dana.practice}</span></div>
              </div>
              <div className="arch__note" aria-hidden="true">
                hi, I&rsquo;m Dana!
                <svg viewBox="0 0 54 40"><path d="M6 4C10 18 22 30 44 34M44 34L34 28M44 34L36 40" /></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec--tight" aria-label="The evidence, in 3 numbers">
        <div className="wrap stats">
          <div className="stat tone--rosy" data-rise style={{ ['--i' as string]: 0 }}>
            <span className="stat__n">56<small>%</small></span>
            <p className="stat__t">of women with stress leaks reported cure after 3 to 6 months of pelvic floor training. 6% without it.</p>
            <span className="stat__s">Cochrane review, Dumoulin 2018</span>
          </div>
          <div className="stat tone--sky" data-rise style={{ ['--i' as string]: 1 }}>
            <span className="stat__n">6<small> in 10</small></span>
            <p className="stat__t">US women leaked urine in the past 12 months. You have company, and you have options.</p>
            <span className="stat__s">NHANES 2015 to 2018, Patel 2022</span>
          </div>
          <div className="stat tone--plum" data-rise style={{ ['--i' as string]: 2 }}>
            <span className="stat__n">5<small> min</small></span>
            <p className="stat__t">a day: one guided session. Guidelines ask for 8 squeezes, 3 times a day, for 3 months.</p>
            <span className="stat__s">NICE guideline NG123</span>
          </div>
        </div>
      </section>

      {latest && (
        <section className="sec" aria-labelledby="latest">
          <div className="wrap">
            <div className="sec__hd">
              <div>
                <span className="eyebrow">The letters</span>
                <h2 id="latest" className="h2">Read the latest</h2>
              </div>
              <p>1 question per letter, answered in plain words with the research behind it.</p>
            </div>
            <div style={{ marginTop: 60 }}><Feature a={latest} /></div>
            <div style={{ marginTop: 26 }}>
              <Letters items={rest.slice(0, 5)} headingLevel="h3" />
            </div>
            <div style={{ marginTop: 18 }}><a className="arrow" href="/blog">All {all.length} letters</a></div>
          </div>
        </section>
      )}

      <section className="sec band" aria-labelledby="meet">
        <div className="wrap dana">
          <div className="dana__photo" data-rise>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dana.photo} alt={`${dana.name} in her office`} width={560} height={560} loading="lazy" />
            <Cat pose="heart" width={180} className="dana__cat" />
          </div>
          <div data-rise>
            <span className="eyebrow">Meet your teacher</span>
            <h2 id="meet" className="h2" style={{ marginTop: 14 }}>{dana.name}</h2>
            <Smile />
            <p className="dana__q">&ldquo;Pelvic floor training is the first step I recommend for leaks. I built this class so you can start tonight, at home, in 5 minutes.&rdquo;</p>
            <ul className="creds">
              <li><Icon name="check" />{dana.board}, practicing at {dana.practice} in {dana.practiceCity}</li>
              <li><Icon name="check" />Doctor of Osteopathic Medicine, {dana.medicalSchool}, {dana.medicalSchoolYear}</li>
              <li><Icon name="check" />Shares daily bladder tips on Instagram as <a className="link" href={dana.socials[0].url} rel="me noopener" target="_blank">{dana.socials[0].handle}</a></li>
            </ul>
            <div style={{ marginTop: 26 }}><a className="btn btn--quiet" href="/about">About Dr. Dana</a></div>
          </div>
        </div>
      </section>

      <AppBand />

      <section className="sec" aria-labelledby="qa-teaser" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="gate" data-rise>
            <div>
              <span className="eyebrow">For members</span>
              <h2 id="qa-teaser" className="h2" style={{ marginTop: 12, fontSize: 'clamp(30px,3.6vw,44px)' }}>Ask Dr. Dana, <em>live</em>. Once a month.</h2>
              <p className="lede" style={{ marginTop: 14 }}>Members of the app send their questions. Dr. Dana answers them live for {site.qa.length}. Replays stay on the members&rsquo; page.</p>
              <div style={{ marginTop: 22 }}><a className="btn btn--quiet" href="/qa">See how the Q&amp;A works</a></div>
            </div>
            <div className="gate__art" aria-hidden="true"><Cat pose="calendar" width={200} /></div>
          </div>
        </div>
      </section>

      <section className="sec--tight" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <Newsletter source="/#bottom" tag="home-bottom" />
        </div>
      </section>
      <JsonLd data={graph(app)} />
    </>
  );
}
