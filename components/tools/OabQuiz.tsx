'use client';
// Overactive bladder quiz: 4 questions in our own words, built on the International Continence Society's description
// (urgency, with or without urge leaks, usually with frequent trips and night trips). No score: it names a pattern,
// says "This is not a diagnosis", and points to a bladder diary and a doctor. Built from LeakQuiz: the same card,
// option tiles and result block. Nothing is sent or saved.
import { useState } from 'react';
import { GetApp } from '../Waitlist';

type Urge = 'never' | 'rare' | 'weekly' | 'daily';
type Result = 'wet' | 'dry' | 'other' | 'none';
export type OabLinks = { diary?: string; leaks: string; quiz?: string };

const QS = [
  {
    id: 'urge', t: 'In the last month, how often did you feel a sudden, strong need to pee that was hard to put off?',
    opts: [{ v: 'never', l: 'Never' }, { v: 'rare', l: 'Less than once a week' }, { v: 'weekly', l: 'A few times a week' }, { v: 'daily', l: 'Every day' }],
  },
  {
    id: 'day', t: 'How many times do you pee during the day, on most days?',
    opts: [{ v: 'low', l: 'Up to 7 times' }, { v: 'high', l: '8 times or more' }, { v: 'unsure', l: 'I am not sure', s: 'A bladder diary will tell you' }],
  },
  {
    id: 'night', t: 'How many times do you get up at night to pee?',
    opts: [{ v: '0', l: 'None' }, { v: '1', l: 'Once' }, { v: '2', l: '2 times or more' }],
  },
  {
    id: 'leak', t: 'After a strong urge, did you leak on the way to the toilet?',
    opts: [{ v: 'yes', l: 'Yes, at least once' }, { v: 'no', l: 'No' }],
  },
] as const;

const RESULTS: Record<Result, { cat: string; t: [string, string, string]; p: string }> = {
  wet: { cat: 'think', t: ['Your answers match an ', 'overactive bladder', ', with urge leaks.'], p: 'Sudden, strong urges are the heart of an overactive bladder. Frequent trips and night trips often come with them. Some urges end in a leak before you reach the toilet.' },
  dry: { cat: 'think', t: ['Your answers match an ', 'overactive bladder', ', without leaks.'], p: 'Sudden, strong urges are the heart of an overactive bladder, even with no leak. Frequent trips and night trips often come with them.' },
  other: { cat: 'worry', t: ['Frequent trips, ', 'few urges', '.'], p: 'Peeing often without strong urges can have other causes: what and when you drink, your sleep, or a medicine. A 3-day bladder diary shows your pattern. Your doctor can tell what drives it.' },
  none: { cat: 'cheer', t: ['No overactive bladder ', 'pattern', '.'], p: 'Your answers show few urges and few trips. Good news. Steady drinks, toilets on time and a calm mind help you keep it that way.' },
};

export function OabQuiz({ links }: { links: OabLinks }) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const restart = () => { setStep(0); setA({}); setResult(null); };

  const decide = (ans: Record<string, string>): Result => {
    const urge = ans.urge as Urge;
    if (urge === 'weekly' || urge === 'daily') return ans.leak === 'yes' ? 'wet' : 'dry';
    if (ans.day === 'high' || ans.night === '2') return 'other';
    return 'none';
  };
  const next = () => (step < QS.length - 1 ? setStep(step + 1) : setResult(decide(a)));

  if (result) {
    const r = RESULTS[result];
    return (
      <div className="tool tool--done" aria-live="polite">
        <div className="tool__res">
          <span className="tone-disc tone--rosy" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/cats/${r.cat}.svg`} alt="" width={96} height={96} />
          </span>
          <div>
            <span className="tool__k">Your result</span>
            <h2 className="h3 tool__t">{r.t[0]}<em>{r.t[1]}</em>{r.t[2]}</h2>
          </div>
        </div>
        <p className="tool__p">{r.p}</p>
        <p className="tool__note">This is not a diagnosis. Only a doctor can tell what causes your symptoms. See one if urges or trips bother you, or if you see blood or feel burning when you pee.</p>
        <div className="tool__go">
          {links.diary && <a className="btn btn--quiet" href={links.diary}>Print a 3-day bladder diary</a>}
          {result !== 'other' && <GetApp className="btn" />}
        </div>
        {(result === 'wet' || result === 'dry') && (
          <ul className="tool__more">
            <li><a className="link" href={links.leaks}>The Bladder leaks class: bladder habits and bladder training</a></li>
            {links.quiz && <li><a className="link" href={links.quiz}>Leak type quiz: stress, urge or mixed?</a></li>}
          </ul>
        )}
        <button type="button" className="tool__again" onClick={restart}>Start again</button>
      </div>
    );
  }

  const q = QS[step];
  return (
    <form className="tool" onSubmit={(e) => e.preventDefault()} aria-label="Overactive bladder quiz">
      <div className="tool__top">
        <span className="tool__k">Free tool · 4 questions · 1 minute</span>
        <span className="tool__step">Question {step + 1} of {QS.length}</span>
      </div>
      <div className="tool__bar" aria-hidden="true"><i style={{ width: `${((step + 1) / QS.length) * 100}%` }} /></div>
      <fieldset className="tool__q" key={q.id}>
        <legend className="tool__t">{q.t}</legend>
        <div className={q.opts.length === 2 || q.opts.length === 4 ? 'opts opts--2' : 'opts'}>
          {q.opts.map((o) => (
            <label key={o.v} className="opt">
              <input type="radio" name={q.id} checked={a[q.id] === o.v} onChange={() => setA({ ...a, [q.id]: o.v })} />
              <b>{o.l}</b>
              {'s' in o && <span>{o.s}</span>}
            </label>
          ))}
        </div>
        <div className="tool__nav">
          {step > 0 ? <button type="button" className="tool__back" onClick={() => setStep(step - 1)}>Back</button> : <span />}
          <button type="button" className="btn" disabled={!a[q.id]} onClick={next}>{step < QS.length - 1 ? 'Next' : 'See my result'}</button>
        </div>
      </fieldset>
      <p className="tool__privacy">Your answers stay on this page. Nothing is sent or saved.</p>
    </form>
  );
}
