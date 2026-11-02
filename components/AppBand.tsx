import { Cat } from './Cat';
import { Stores } from './Stores';
import { Smile } from './Smile';
import { site } from '@/lib/site';

// The app, in a band: what it is, in numbers, and where to get it.
export function AppBand() {
  return (
    <section className="sec" aria-labelledby="app-band">
      <div className="wrap app">
        <div className="app__copy" data-rise>
          <span className="eyebrow">The app</span>
          <h2 id="app-band" className="h2">Turn the letter into a <em>habit</em>.</h2>
          <Smile />
          <p className="lede">{site.appName}: Dr. Dana&rsquo;s class on your phone. 6-week programs, 1 short lesson a week, 1 guided exercise a day.</p>
          <ul className="app__list">
            <li className="tone--rosy"><span className="du"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="7.5" /><path d="M12 9.5V13l2.5 2M9.5 2.5h5" /></svg></span><div><b>5 minutes a day</b><span>A guided session with a breathing ring and a timer. The cat lifts with you.</span></div></li>
            <li className="tone--sky"><span className="du"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z" /><path d="M4 20.5A2.5 2.5 0 016.5 18H20v3H6.5" /></svg></span><div><b>1 lesson a week</b><span>Written by a urologist, in plain words, with every source.</span></div></li>
            <li className="tone--plum"><span className="du"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><path d="M8 12l3 3 5-6" /></svg></span><div><b>Your log stays on your phone</b><span>Your answers, notes and photos: only you see them.</span></div></li>
          </ul>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <a className="btn" href="/app">Start week 1 free</a>
            <Stores />
          </div>
        </div>
        <Phone />
      </div>
    </section>
  );
}

export function Phone() {
  return (
    <div className="phone" data-rise aria-label="The app's Today screen: day 3 of Pelvic Floor 101" role="img">
      <div className="phone__screen">
        <span className="phone__k">Pelvic Floor 101 · Week 1</span>
        <span className="phone__t">Find it, feel it, let it go</span>
        <div className="phone__day"><Cat pose="lift" width={132} /></div>
        <div className="phone__days" aria-hidden="true">
          <i className="is-done">M</i><i className="is-done">T</i><i className="is-today">W</i><i>T</i><i>F</i><i>S</i><i>S</i>
        </div>
        <div className="phone__card">
          <b>Day 3 · 6 minutes</b>
          <span>Lift 2 s, let go 6 s. 6 reps, twice.</span>
          <div className="phone__btn">Start today&rsquo;s class</div>
        </div>
      </div>
    </div>
  );
}
