import { GetApp } from '@/components/Waitlist';
import { meta } from '@/lib/seo';
import { dana, site } from '@/lib/site';
import s from './landing.module.css';

// A hidden test of the home page, rebuilt with the TASTE rules (docs in the blog README): 2 base colors (paper, plum)
// and 1 accent (rose) kept for the main button; one type scale; one card style; real app screens; no eyebrows,
// pills, gradients or looping animation. Not in the menu or the sitemap, and noindex.
export const metadata = meta({
  title: `${site.appName}: laugh, run and jump without worrying`,
  description: 'The pelvic floor class for women, taught by Dr. Dana Kivlin, board-certified urologist.',
  path: '/landing',
  noindex: true,
});

const OUTCOMES = [
  { img: '/media/landing/sport.webp', title: 'Back to sport', text: 'Run the whole route. Lift without thinking twice.' },
  { img: '/media/landing/why.webp', title: 'Jump with your kids', text: 'Your reason stays in front of you, every day.' },
  { img: '/media/landing/done.webp', title: 'Finish what you start', text: '42 sessions in 6 weeks, then a routine to keep it.' },
];

export default function Landing() {
  return (
    <div className={s.root}>
      <section className={s.hero}>
        <div className={s.heroCopy}>
          <h1 className={s.h1}>Laugh, run and jump without worrying</h1>
          <p className={s.lede}>The pelvic floor class for women. Taught by {dana.name}, board-certified urologist.</p>
          <div className={s.cta}>
            <GetApp className={s.btn} />
            <span className={s.small}>iPhone and Android</span>
          </div>
        </div>
        <div className={s.phone}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/landing/today.webp" alt="The app's Today screen: today's exercise and her reason, Laugh at dinner with my sisters" width={720} height={1560} fetchPriority="high" />
        </div>
      </section>

      <section className={s.proof} aria-label="The research">
        <div className={s.proofIn}>
          <p className={s.big}>56%</p>
          <div>
            <p className={s.proofText}>of women with stress leaks reported cure after 3 to 6 months of pelvic floor training. Without training: 6%.</p>
            <p className={s.source}>Cochrane review, 2018. Results vary.</p>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>What you get back</h2>
        <ul className={s.grid}>
          {OUTCOMES.map((o) => (
            <li key={o.title} className={s.card}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.img} alt="" width={640} height={814} loading="lazy" decoding="async" />
              <h3 className={s.h3}>{o.title}</h3>
              <p className={s.cardText}>{o.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.section}>
        <div className={s.dana}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={s.danaPhoto} src={dana.bioPhoto} alt={dana.name} width={960} height={1152} loading="lazy" decoding="async" />
          <div>
            <h2 className={s.h2}>Taught by {dana.name}</h2>
            <p className={s.body}>Board-certified urologist, fellowship-trained in female pelvic medicine.</p>
            <p className={s.body}>Director of the Center of Continence and Pelvic Health at {dana.practice}.</p>
            <a className={s.link} href="/dana-kivlin">Read her story <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <section className={s.final}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={s.cat} src="/cats/still/cheer.svg" alt="" width={120} height={120} loading="lazy" />
        <h2 className={s.h2}>Start this week</h2>
        <p className={s.lede}>iPhone and Android. Cancel any time.</p>
        <GetApp className={s.btn} />
      </section>

      <footer className={s.foot}>
        <nav aria-label="Footer">
          <a href="/letters">Letters</a>
          <a href="/dana-kivlin">Dr. Dana</a>
          <a href="/faq">FAQ</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
        <p>© 2026 Health Class. Education from a urologist, not medical advice.</p>
      </footer>
    </div>
  );
}
