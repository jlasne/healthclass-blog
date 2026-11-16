import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { Smile } from '@/components/Smile';
import { Newsletter } from '@/components/Newsletter';
import { dana } from '@/lib/site';

// Dr. Dana's page body, in her own words (her bio, November 2026): who she is and where to follow her, why the
// class, her recommendations (her fiber guide, her Amazon list, her chair), then the letter. Used by /dana-kivlin.
const lastName = dana.fullName.replace(`${dana.firstName} `, '');

export function DanaBio() {
    return (
    <>
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <span className="eyebrow">About me</span>
            <h1 className="h1">I&rsquo;m Dr. {dana.firstName} <em>{lastName}</em>.</h1>
            <ul className="links" aria-label="Follow me">
              {dana.socials.map((s) => (
                <li key={s.url}>
                  <a className="links__a" href={s.url} rel="me noopener" target="_blank" aria-label={`${s.label}: ${s.handle}`} title={`${s.label} · ${s.handle}`}>
                    <Icon name={s.label.toLowerCase()} />
                  </a>
                </li>
              ))}
            </ul>
            <p className="lede">
              I am a board-certified urologist with fellowship training in urogynecology and additional certification in menopause medicine.
            </p>
          </div>
          <div className="hero__art">
            <div className="arch">
              <div className="arch__photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dana.bioPhoto} alt={`${dana.name}, urologist`} width={960} height={1152} />
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
            <p>Although I currently practice in Connecticut, I created this class with the goal of reaching women everywhere and making reliable, evidence-based medical information more accessible.</p>
            <p>My passion is translating complex medical concepts into clear, practical tools that women can use to better understand their bodies, take an active role in their health, and make informed decisions about their care.</p>
            <p>My mission is to empower women with knowledge, help them recognize what they can control, and bring greater awareness to conditions that have historically been dismissed, overlooked, or simply accepted as a normal part of being a woman. Just because something is common doesn&rsquo;t mean it&rsquo;s normal, and it certainly doesn&rsquo;t mean you have to live with it.</p>
          </div>
          <div className="signoff"><span className="signoff__name">{dana.firstName}</span></div>
          <h3 className="h3 creds__t">My credentials</h3>
          <ul className="creds" aria-label="My credentials">
              <li><Icon name="check" />Board certified in urology</li>
              <li><Icon name="check" /><span>Fellowship trained in Female Pelvic Medicine and Reconstructive Surgery (Urogynecology). <a className="link" href={dana.profiles.research} rel="me noopener" target="_blank">My research</a></span></li>
              <li><Icon name="check" />Menopause Society Certified Practitioner (MSCP)</li>
              <li><Icon name="check" /><span>Director for the Center of Continence and Pelvic Health at <a className="link" href={dana.profiles.hospital} rel="me noopener" target="_blank">{dana.practice}</a></span></li>
            </ul>
        </div>
      </section>

      <section className="sec" aria-labelledby="recs">
        <div className="wrap">
          <div className="sec__hd"><div><h2 id="recs" className="h2">My recommendations</h2><p>What I give my patients, and what I use myself.</p></div></div>
          <div className="related related--recs">
            <a className="card tone--sky" href="/dana-kivlin/fiber">
              <span className="card__art" aria-hidden="true"><Cat pose="reading" width={118} /></span>
              <b>My fiber guide</b>
              <span>The guide I give every patient: 25 to 35 g a day →</span>
            </a>
            {dana.shop.map((s, i) => (
              <a key={s.url} className={`card tone--${['rosy', 'plum'][i % 2]}`} href={s.url} rel="sponsored noopener" target="_blank">
                <span className="card__art" aria-hidden="true"><Cat pose={(['gift', 'stretch'] as const)[i % 2]} width={118} /></span>
                <b>{s.label}</b>
                <span>{s.handle} ↗</span>
              </a>
            ))}
          </div>
          <p className="nl-fine" style={{ margin: '14px 0 0' }}>The Amazon and Anthros links earn me a small commission. As an Amazon Associate I earn from qualifying purchases.</p>
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

      <section className="sec" aria-label="My letter" style={{ paddingTop: 0 }}>
        <div className="read">
          <Newsletter compact as="h3" source="/dana-kivlin#letter" tag="bio-end" title={<>Get my next letter, <em>free</em>.</>} />
        </div>
      </section>
    </>
  );
}
