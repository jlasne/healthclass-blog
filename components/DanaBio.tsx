import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { Smile } from '@/components/Smile';
import { Newsletter } from '@/components/Newsletter';
import { dana } from '@/lib/site';

// Dr. Dana's page body, in her own words (her bio, November 2026): who she is, why the class, where to find her,
// then the letter. Shared by /dana-kivlin and its font tests (/dana-kivlin/1 to 4).
const lastName = dana.fullName.replace(`${dana.firstName} `, '');

export function DanaBio() {
  const cards = [...dana.socials.map((s) => ({ ...s, shop: false })), ...dana.shop.map((s) => ({ ...s, shop: true }))];
  return (
    <>
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <span className="eyebrow">About me</span>
            <h1 className="h1">I&rsquo;m Dr. {dana.firstName} <em>{lastName}</em>.</h1>
            <p className="lede">
              I am a board-certified urologist with fellowship training in urogynecology and additional certification in menopause medicine.
            </p>
            <ul className="creds" aria-label="My credentials">
              <li><Icon name="check" />Board certified in urology</li>
              <li><Icon name="check" />Fellowship trained in Female Pelvic Medicine and Reconstructive Surgery (Urogynecology)</li>
              <li><Icon name="check" />Menopause Society Certified Practitioner (MSCP)</li>
              <li><Icon name="check" />Director for the Center of Continence and Pelvic Health at {dana.practice}</li>
            </ul>
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
        </div>
      </section>

      <section className="sec" aria-labelledby="find">
        <div className="wrap">
          <div className="sec__hd"><div><span className="eyebrow">Where you can find me</span><h2 id="find" className="h2">Women&rsquo;s health, <em>every day</em></h2></div></div>
          <div className="related related--find">
            {cards.map((s, i) => (
              <a key={s.url} className={`card${s.label === 'Instagram' ? ' card--ig' : ''} tone--${['rosy', 'sky', 'plum', 'blush', 'rosy'][i % 5]}`} href={s.url} rel={s.shop ? 'sponsored noopener' : 'me noopener'} target="_blank">
                {s.label === 'Instagram' ? (
                  // a preview of her Instagram profile: her face, her handle and her 3 latest reels, playing
                  <span className="ig" aria-hidden="true">
                    <span className="ig__hd">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <span className="ig__ring"><img src={dana.avatar} alt="" width={56} height={56} loading="lazy" /></span>
                      <span className="ig__who"><b>{s.handle.replace('@', '')}</b><span>{dana.name}</span></span>
                      <span className="ig__follow">Follow</span>
                    </span>
                    <span className="ig__bio">Urologist · Bladder, pelvic floor and women&rsquo;s health, in 1 minute</span>
                    <span className="ig__grid">
                      {dana.reels.map((r) => (
                        <span key={r.poster} className={`ig__post${r.video ? ' ig__post--reel' : ''}`}>
                          {r.video ? (
                            <video src={r.video} poster={r.poster} autoPlay muted loop playsInline preload="metadata" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.poster} alt="" width={240} height={320} loading="lazy" />
                          )}
                          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5v14l11-7z" fill="#fff" /></svg>
                        </span>
                      ))}
                    </span>
                  </span>
                ) : (
                  <span className="card__art" aria-hidden="true"><Cat pose={(['selfie', 'read', 'write', 'heart', 'reading'] as const)[i % 5]} width={118} /></span>
                )}
                <b>{s.label}</b>
                <span>{s.label === 'Instagram' ? 'Watch my videos' : s.handle} ↗</span>
              </a>
            ))}
          </div>
          <p className="nl-fine" style={{ margin: "14px 0 0" }}>The Amazon and Anthros links earn me a small commission. As an Amazon Associate I earn from qualifying purchases.</p>
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
