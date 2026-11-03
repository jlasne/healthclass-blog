import { Cat } from './Cat';
import { Stores } from './Stores';

// The app, in one card at the end of each letter: one line, 3 facts, the store buttons, the phone peeking in.
export function AppBand() {
  return (
    <section className="sec sec--tight" aria-labelledby="app-band">
      <div className="wrap">
        <div className="appcard" data-rise>
          <div className="appcard__copy">
            <span className="eyebrow">The app</span>
            <h2 id="app-band" className="h2">Do it with Dr. Dana, <em>5 minutes a day</em>.</h2>
            <ul className="appcard__facts" aria-label="What the app gives you">
              <li>1 lesson a week</li>
              <li>1 guided exercise a day</li>
              <li>Your log stays on your phone</li>
            </ul>
            <Stores />
          </div>
          <div className="appcard__phone" aria-hidden="true"><Phone /></div>
        </div>
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
