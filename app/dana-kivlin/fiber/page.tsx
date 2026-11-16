import { Cat } from '@/components/Cat';
import { FiberNav, FoodChart, SupplementPicker } from '@/components/FiberGuide';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { Newsletter } from '@/components/Newsletter';
import { GOAL, MAX_GRAMS, allFoods, benefits, bestForConstipation, fmt, foodById, kinds, lookAt, steps, supplementServings, topBy } from '@/lib/fiber';
import { breadcrumbs, danaId, dt, graph, meta } from '@/lib/seo';
import { absoluteUrl, dana } from '@/lib/site';
import s from '@/components/fiber.module.css';

// Dr. Dana's fiber guide: her 7-page handout for every patient, as one page that is easy to go through on a phone.
// Data and her numbers: lib/fiber.ts. The moving parts (chips, food chart, "Build your day", supplement picker):
// components/FiberGuide.tsx. The original PDF stays one tap away for printing.
const PATH = '/dana-kivlin/fiber';
const PDF = '/media/dana/fiber-guide.pdf';
const UPDATED = '2026-11-16';

export const metadata = meta({
  title: 'Fiber guide: 25 to 35 grams a day, from a urologist',
  description: 'The fiber guide Dr. Dana Kivlin gives every patient: why fiber matters, the 2 kinds, a food chart with grams, and which supplement fits your goal.',
  path: PATH,
});

const NAV = [
  { id: 'why', label: 'Why' },
  { id: 'kinds', label: '2 kinds' },
  { id: 'goal', label: 'Daily goal' },
  { id: 'bowel', label: 'Bowel movements' },
  { id: 'chart', label: 'Food chart' },
  { id: 'supplements', label: 'Supplements' },
  { id: 'best', label: 'Best foods' },
];

// 2 drawings the site icon set does not have, in its style (24 grid, 1.75 line, round ends)
const EXTRA: Record<string, React.ReactNode> = {
  flame: <path d="M12 3.5c.6 3.2 4.8 5.2 4.8 10a4.8 4.8 0 01-9.6 0c0-2.4 1.3-3.9 2.4-4.9.2 1.5.9 2.5 1.9 3 .4-2.8-.6-5 .5-8.1z" />,
  brain: <><path d="M12 5.5a3 3 0 00-5.2-1.3A3 3 0 004 8a3 3 0 00-.5 5 3.2 3.2 0 002.8 4.6A3 3 0 0012 18.5z" /><path d="M12 5.5a3 3 0 015.2-1.3A3 3 0 0120 8a3 3 0 01.5 5 3.2 3.2 0 01-2.8 4.6A3 3 0 0112 18.5z" /><path d="M12 5.5v13" /></>,
  gel: <><path d="M12 3.5s5.5 5.9 5.5 9.6a5.5 5.5 0 01-11 0C6.5 9.4 12 3.5 12 3.5z" /><path d="M9.2 13.6c1 .8 2 .8 2.8 0s1.8-.8 2.8 0" /></>,
  bulk: <><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>,
};
function Glyph({ name }: { name: string }) {
  if (!EXTRA[name]) return <Icon name={name} />;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {EXTRA[name]}
    </svg>
  );
}

const top3 = [...allFoods].filter((f) => f.total != null).sort((a, b) => (typeof b.total === 'number' ? b.total : 0) - (typeof a.total === 'number' ? a.total : 0)).slice(0, 3);
const KIND_ICON: Record<string, string> = { soluble: 'gel', insoluble: 'bulk', water: 'drop' };
const SCALE = 40; // the daily goal gauge, in grams

export default function Page() {
  return (
    <article className={s.page}>
      {/* ------------------------------------------------------------ hero */}
      <header className={`wrap ${s.hero}`}>
        <div className={s.heroCopy}>
          <h1 className="h1">Fiber, the <em>superfood</em>.</h1>
          <svg className="smile" viewBox="0 0 92 16" aria-hidden="true" focusable="false"><path d="M3 3C26 15 66 15 89 3" /></svg>
          <p className={`lede ${s.heroLede}`}>I give this guide to every patient. Why fiber matters, how much you need, and which foods have the most, in grams.</p>
          <div className={`byline ${s.byline}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dana.avatar} alt="" width={46} height={46} />
            <div>
              <b>{dana.name}</b>
              <span>{dana.role} · Updated <time dateTime={UPDATED}>Nov 16, 2026</time></span>
            </div>
          </div>
        </div>

        <div className={s.heroArt}>
          <Cat pose="reading" width={150} className={s.heroCat} priority />
          <div className={`${s.card} ${s.goalCard}`}>
            <p className={s.goalCardK}>Your daily goal</p>
            <p className={s.goalBig}>
              <span>{GOAL.min}<i>–</i>{GOAL.max}</span>
              <small>g</small>
            </p>
            <p className={s.goalCardT}>grams of fiber a day, from food first.</p>
            <ul className={s.goalTop} aria-label="The most fiber per serving in my chart">
              {top3.map((f) => (
                <li key={f.id}>
                  <b>{fmt(f.total!)} g</b>
                  <span>{f.name}<small>{f.serving}</small></span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={s.heroCtas}>
          <a className="btn" href="#chart">
            Open the food chart
            <Icon name="arrow" />
          </a>
          <a className={`btn btn--quiet ${s.pdf}`} href={PDF} target="_blank" rel="noopener">
            <Icon name="book" />
            Print the full guide (PDF)
          </a>
        </div>
      </header>

      <FiberNav items={NAV} />

      {/* ------------------------------------------------------------ 1. why */}
      <section id="why" className={`wrap ${s.sec}`} aria-labelledby="why-h">
        <div className={s.secHd}>
          <h2 className="h2" id="why-h">7 things fiber does for you</h2>
        </div>
        <ul className={s.benefits}>
          {benefits.map((b, i) => (
            <li key={b.id} className={`${s.card} ${s.benefit}`} data-rise style={{ ['--i' as string]: i }}>
              <span className={s.benefitIc}><Glyph name={b.icon} /></span>
              <b>{b.title}</b>
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------------ 2. the 2 kinds, plus water */}
      <section id="kinds" className={`wrap ${s.sec}`} aria-labelledby="kinds-h">
        <div className={s.secHd}>
          <h2 className="h2" id="kinds-h">2 kinds of fiber, plus water</h2>
          <p>You need both kinds. Water makes them work.</p>
        </div>
        <div className={s.kinds}>
          {kinds.map((k) => {
            const top = k.id === 'soluble' || k.id === 'insoluble' ? topBy(k.id) : [];
            return (
              <div key={k.id} className={`${s.card} ${s.kind}`} data-kind={k.tone} data-rise>
                <div className={s.kindHd}>
                  <span className={s.kindIc}><Glyph name={KIND_ICON[k.id]} /></span>
                  <div>
                    <p className={s.kindK}>{k.kind}</p>
                    <h3 className={s.kindName}>{k.name}</h3>
                  </div>
                </div>
                <ul className={s.kindLines}>
                  {k.lines.map((l) => <li key={l}>{l}</li>)}
                </ul>
                {k.id === 'water' && (
                  <p className={s.kindQuote}>Think of water as the activator for fiber.</p>
                )}
                {top.length > 0 && (
                  <p className={s.kindTop}>
                    <span>Most in my chart</span>
                    {top.map((f) => (
                      <span key={f.id} className={s.kindFood}>{f.name} <b>{fmt(k.id === 'soluble' ? f.soluble! : f.insoluble!)} g</b></span>
                    ))}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------ 3. the daily goal */}
      <section id="goal" className={`wrap ${s.sec}`} aria-labelledby="goal-h">
        <div className={s.secHd}>
          <h2 className="h2" id="goal-h">Your daily goal: <em>{GOAL.min} to {GOAL.max} g</em></h2>
          <p>Supplements alone are not enough. One serving gives you only a few grams.</p>
        </div>
        <figure className={`${s.card} ${s.gauge}`}>
          <figcaption className="sr-only">Your goal is {GOAL.min} to {GOAL.max} grams of fiber a day. One serving of Benefiber gives 3 to 6 grams, one serving of psyllium 4 to 6 grams.</figcaption>
          <div className={s.gaugeRow} aria-hidden="true">
            <span className={s.gaugeLabel}><b>Your day</b><small>{GOAL.min}–{GOAL.max} g</small></span>
            <span className={s.gaugeTrack}>
              <i className={s.gaugeGoal} style={{ left: `${(GOAL.min / SCALE) * 100}%`, width: `${((GOAL.max - GOAL.min) / SCALE) * 100}%` }} />
            </span>
          </div>
          {supplementServings.map((sv) => (
            <div key={sv.name} className={s.gaugeRow} aria-hidden="true">
              <span className={s.gaugeLabel}><b>{sv.name}</b><small>{sv.grams[0]}–{sv.grams[1]} g per serving</small></span>
              <span className={s.gaugeTrack}>
                <i className={s.gaugeSupp} style={{ width: `${(sv.grams[0] / SCALE) * 100}%` }} />
                <i className={s.gaugeSuppRange} style={{ left: `${(sv.grams[0] / SCALE) * 100}%`, width: `${((sv.grams[1] - sv.grams[0]) / SCALE) * 100}%` }} />
              </span>
            </div>
          ))}
          <div className={s.gaugeAxis} aria-hidden="true">
            <span />
            <span className={s.gaugeTicks}>
              {[0, 10, 20, 30, 40].map((t) => <i key={t} style={{ left: `${(t / SCALE) * 100}%` }}>{t} g</i>)}
            </span>
          </div>
        </figure>
      </section>

      {/* ------------------------------------------------------------ 4. better bowel movements */}
      <section id="bowel" className={`wrap ${s.sec}`} aria-labelledby="bowel-h">
        <div className={s.secHd}>
          <h2 className="h2" id="bowel-h">For better bowel movements</h2>
          <p>4 steps I go over with my patients.</p>
        </div>
        <ol className={s.steps}>
          {steps.map((st, i) => (
            <li key={st.title} className={s.card} data-rise style={{ ['--i' as string]: i }}>
              <span className={s.stepN} aria-hidden="true">{i + 1}</span>
              <b>{st.title}</b>
              <span>{st.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ 5. the food chart */}
      <section id="chart" className={`wrap ${s.sec}`} aria-labelledby="chart-h">
        <div className={s.secHd}>
          <h2 className="h2" id="chart-h">My fiber food chart</h2>
          <p>{allFoods.length} foods, with grams per serving. Tap + to build your day.</p>
        </div>
        <FoodChart />
      </section>

      {/* ------------------------------------------------------------ 6. supplements */}
      <section id="supplements" className={`wrap ${s.sec}`} aria-labelledby="supp-h">
        <div className={s.secHd}>
          <h2 className="h2" id="supp-h">Fiber supplements</h2>
          <p>Most health data is on fiber from food. Psyllium is the most studied supplement. Supplements help in some cases, like constipation or bowel leakage.</p>
        </div>
        <h3 className={s.h3}>What to look at</h3>
        <ol className={s.look}>
          {lookAt.map((l, i) => (
            <li key={l.title} className={s.card}>
              <span className={s.lookN} aria-hidden="true">{i + 1}</span>
              <b>{l.title}</b>
              <span>{l.text}</span>
              {l.good && <span className={s.lookGood}><Icon name="check" />{l.good}</span>}
              {l.watch && <span className={s.lookWatch}><Icon name="alert" />{l.watch}</span>}
            </li>
          ))}
        </ol>
        <SupplementPicker />
      </section>

      {/* ------------------------------------------------------------ 7. best foods for constipation */}
      <section id="best" className={`wrap ${s.sec}`} aria-labelledby="best-h">
        <div className={s.secHd}>
          <h2 className="h2" id="best-h">My best foods for constipation</h2>
          <p>If you start anywhere, start here.</p>
        </div>
        <div className={s.bestWrap}>
          <Cat pose="peek" width={150} className={s.bestCat} />
          <ol className={`${s.card} ${s.best}`}>
            {bestForConstipation.map((b, i) => (
              <li key={b.name}>
                <span className={s.bestN} aria-hidden="true">{i + 1}</span>
                <div>
                  <b>{b.name}</b>
                  <span className={s.bestG}>
                    {b.foods.map((id) => {
                      const f = foodById(id);
                      return f && f.total != null ? <span key={id}>{f.name} <em>{fmt(f.total)} g</em> <small>({f.serving})</small></span> : null;
                    })}
                  </span>
                  {b.why && <span className={s.bestWhy}>{b.why}</span>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ safety, the PDF, the letter */}
      <section className={`wrap ${s.sec} ${s.end}`} aria-label="Before you start">
        <div className={`${s.card} ${s.safe}`}>
          <span className={s.safeIc}><Icon name="shield" /></span>
          <p>Education from a urologist, not medical advice. Ask your doctor before starting a supplement, especially with a bowel condition, a wheat allergy or celiac disease.</p>
          <a className={`btn btn--quiet btn--sm ${s.pdf}`} href={PDF} target="_blank" rel="noopener">
            <Icon name="book" />
            Print the full guide (PDF)
          </a>
        </div>
        <div className={s.nl}>
          <Newsletter compact as="h3" source={PATH} tag="fiber-guide" title={<>Get my next letter, <em>free</em>.</>} />
        </div>
      </section>

      <JsonLd
        data={graph(
          {
            '@type': 'WebPage',
            '@id': absoluteUrl(`${PATH}#page`),
            url: absoluteUrl(PATH),
            name: 'Fiber, the superfood: a guide from Dr. Dana Kivlin',
            description: `The fiber guide ${dana.name} gives every patient: ${GOAL.min} to ${GOAL.max} grams a day, soluble and insoluble fiber, a food chart of ${allFoods.length} foods (up to ${MAX_GRAMS} g per serving) and fiber supplements by goal.`,
            inLanguage: 'en-US',
            dateModified: dt(UPDATED),
            author: { '@id': danaId },
          },
          breadcrumbs([
            { name: 'Home', path: '/' },
            { name: dana.name, path: '/dana-kivlin' },
            { name: 'Fiber guide', path: PATH },
          ]),
        )}
      />
    </article>
  );
}
