'use client';
// Kegel plan by age: 2 questions (age band, how long a clean lift lasts) and a 12-week plan in 3 steps of 4 weeks.
// The dose is the same at every age (NICE NG123: at least 8 squeezes, 3 times a day, for at least 3 months), so the hold
// sets the starting level and the age sets the positions and one focus line, with the share of women who leak at that
// age (Nygaard 2008, NHANES). Built from LeakQuiz: the same card, option tiles and result block. Nothing is sent or saved.
import { useState } from 'react';
import { GetApp } from '../Waitlist';

type Age = 'u40' | 'mid' | 'senior' | 'eldest';
type Hold = 'none' | 'short' | 'mid' | 'long';
export type PlanLinks = { classes: string; timer?: string; slow?: string; flicks?: string; letter?: string };

const AGES: { id: Age; label: string }[] = [
  { id: 'u40', label: 'Under 40' },
  { id: 'mid', label: '40 to 59' },
  { id: 'senior', label: '60 to 79' },
  { id: 'eldest', label: '80 or older' },
];

const HOLDS: { id: Hold; label: string; sub: string }[] = [
  { id: 'none', label: 'I am not sure it lifts', sub: 'Or my butt, thighs or belly do the work' },
  { id: 'short', label: '1 to 2 seconds', sub: 'The lift fades fast' },
  { id: 'mid', label: '3 to 5 seconds', sub: 'A clean lift, then it fades' },
  { id: 'long', label: '6 seconds or more', sub: 'The lift stays clean' },
];

// The share of US women with moderate to severe leaks at each age (Nygaard 2008), and one thing to focus on.
const AT_AGE: Record<Age, { share: string; focus: string }> = {
  u40: { share: '6.9% of US women aged 20 to 39 report moderate to severe leaks.', focus: 'Build the habit now, before birth or sport asks more of your pelvic floor. Pregnant, or gave birth in the last 6 weeks? Ask your doctor first.' },
  mid: { share: '17.2% of US women aged 40 to 59 report moderate to severe leaks: 2.5 times the share at 20 to 39.', focus: 'Add strength training to your week. Breathe out on each lift, so the pressure goes up, not down.' },
  senior: { share: '23.3% of US women aged 60 to 79 report moderate to severe leaks.', focus: 'Train standing as soon as you can, and squeeze before you cough, sneeze or stand up. If sudden urges lead, see your doctor.' },
  eldest: { share: '31.7% of US women aged 80 or older report moderate to severe leaks.', focus: 'Start lying down or sitting, and stand with a hand on a chair. Check with your doctor before you start.' },
};

const START: Record<Exclude<Hold, 'none'>, string> = { short: '3-second holds', mid: '5-second holds', long: '10-second holds' };

function plan(hold: Exclude<Hold, 'none'>, age: Age): { title: string; line: string }[] {
  const stand = age === 'eldest' ? 'standing, with a hand on a chair' : 'standing';
  const steps = {
    short: [
      'Starter holds: 3 seconds on, 3 off, 10 times. Lying down.',
      'Longer holds: 5 seconds on, 5 off, 10 times, sitting. Then 5 quick flicks.',
      `Holds of 5 to 10 seconds, 10 times, ${stand}. Then 10 quick flicks.`,
    ],
    mid: [
      'Longer holds: 5 seconds on, 5 off, 10 times, lying down, then sitting. Then 5 quick flicks.',
      'Holds of 5 to 10 seconds, 10 times, sitting. Then 10 quick flicks.',
      `Strong holds: 10 seconds on, 10 off, 10 times, ${stand}. Then 10 quick flicks.`,
    ],
    long: [
      'Strong holds: 10 seconds on, 10 off, 10 times, sitting. Then 10 quick flicks.',
      `Strong holds, ${stand}. Then 10 quick flicks, and a squeeze before each cough or sneeze.`,
      age === 'eldest'
        ? 'Strong holds as you stand up from a chair and sit back down. Then 10 quick flicks.'
        : 'Strong holds while you move: a walk, the stairs, a heavy bag. Then 10 quick flicks.',
    ],
  }[hold];
  return [
    { title: 'Weeks 1 to 4', line: steps[0] },
    { title: 'Weeks 5 to 8', line: steps[1] },
    { title: 'Weeks 9 to 12', line: steps[2] },
  ];
}

export function KegelPlan({ links }: { links: PlanLinks }) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<Age | null>(null);
  const [hold, setHold] = useState<Hold | null>(null);
  const [done, setDone] = useState(false);
  const restart = () => { setStep(0); setAge(null); setHold(null); setDone(false); };

  if (done && age && hold) {
    const a = AT_AGE[age];
    const more = (
      <ul className="tool__more">
        {links.timer && <li><a className="link" href={links.timer}>Kegel timer: squeeze, relax, repeat</a></li>}
        {links.slow && <li><a className="link" href={links.slow}>Slow holds: how to do them right</a></li>}
        {links.flicks && <li><a className="link" href={links.flicks}>Quick flicks: the Kegel for speed</a></li>}
      </ul>
    );
    if (hold === 'none') {
      return (
        <div className="tool tool--done" aria-live="polite">
          <div className="tool__res">
            <span className="tone-disc tone--rosy" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cats/think.svg" alt="" width={96} height={96} />
            </span>
            <div>
              <span className="tool__k">Your plan</span>
              <h2 className="h3 tool__t">Your plan starts with <em>finding the lift</em>.</h2>
            </div>
          </div>
          <p className="tool__p">For 1 to 2 weeks, lie down with your knees bent. Breathe out and squeeze as if you hold in gas in a quiet room. Keep your butt, thighs and belly soft. Then come back for your 12-week plan.</p>
          <p className="tool__p"><b>At your age:</b> {a.share} {a.focus}</p>
          <p className="tool__note">This plan teaches. It does not diagnose or treat. If you still cannot feel a lift after 2 weeks, see a doctor or a pelvic floor physical therapist.</p>
          <div className="tool__go">
            {links.letter ? <a className="btn btn--quiet" href={links.letter}>How to find the right muscle</a> : <a className="btn btn--quiet" href={links.classes}>See Pelvic Floor 101</a>}
            <GetApp className="btn" />
          </div>
          <button type="button" className="tool__again" onClick={restart}>Start again</button>
        </div>
      );
    }
    return (
      <div className="tool tool--done" aria-live="polite">
        <div className="tool__res">
          <span className="tone-disc tone--rosy" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cats/lift.svg" alt="" width={96} height={96} />
          </span>
          <div>
            <span className="tool__k">Your 12-week plan</span>
            <h2 className="h3 tool__t">Your plan starts with <em>{START[hold]}</em>.</h2>
          </div>
        </div>
        <p className="tool__p">Do each step 3 times a day. Move on when the holds stay clean to the end. The NICE guideline asks for at least 8 squeezes, 3 times a day, for at least 3 months.</p>
        <ol className="join-steps weeks__list tone--rosy">
          {plan(hold, age).map((s) => (<li key={s.title}><b>{s.title}</b><span>{s.line}</span></li>))}
        </ol>
        <p className="tool__p"><b>At your age:</b> {a.share} {a.focus}</p>
        <p className="tool__note">This plan teaches. It does not diagnose or treat. Stop and see a doctor if you feel pain or a bulge, or if soreness lasts into the next day.</p>
        <div className="tool__go">
          <a className="btn btn--quiet" href={links.classes}>See Pelvic Floor 101</a>
          <GetApp className="btn" />
        </div>
        {more}
        <button type="button" className="tool__again" onClick={restart}>Start again</button>
      </div>
    );
  }

  return (
    <form className="tool" onSubmit={(e) => e.preventDefault()} aria-label="Kegel plan by age">
      <div className="tool__top">
        <span className="tool__k">Free tool · 2 questions · 1 minute</span>
        <span className="tool__step">Question {step + 1} of 2</span>
      </div>
      <div className="tool__bar" aria-hidden="true"><i style={{ width: `${((step + 1) / 2) * 100}%` }} /></div>

      {step === 0 && (
        <fieldset className="tool__q">
          <legend className="tool__t">How old are you?</legend>
          <div className="opts opts--2">
            {AGES.map((o) => (
              <label key={o.id} className="opt"><input type="radio" name="age" checked={age === o.id} onChange={() => setAge(o.id)} /><b>{o.label}</b></label>
            ))}
          </div>
          <div className="tool__nav">
            <span />
            <button type="button" className="btn" disabled={!age} onClick={() => setStep(1)}>Next</button>
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="tool__q">
          <legend className="tool__t">Lie down, knees bent. Squeeze as if you hold in gas. How long does the lift last?</legend>
          <div className="opts">
            {HOLDS.map((o) => (
              <label key={o.id} className="opt"><input type="radio" name="hold" checked={hold === o.id} onChange={() => setHold(o.id)} /><b>{o.label}</b><span>{o.sub}</span></label>
            ))}
          </div>
          <div className="tool__nav">
            <button type="button" className="tool__back" onClick={() => setStep(0)}>Back</button>
            <button type="button" className="btn" disabled={!hold} onClick={() => setDone(true)}>See my plan</button>
          </div>
        </fieldset>
      )}
      <p className="tool__privacy">Your answers stay on this page. Nothing is sent or saved.</p>
    </form>
  );
}
