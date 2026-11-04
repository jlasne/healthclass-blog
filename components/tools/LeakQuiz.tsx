'use client';
// Leak type quiz: 3 questions in the shape of the 3 Incontinence Questions (Brown 2006), in our own words.
// It names a pattern and points to a next step. It never diagnoses: the result says so, and sends some answers to a
// doctor first. Answers stay in the page (nothing is sent or stored).
import { useState } from 'react';
import { GetApp } from '../Waitlist';

type Kind = 'effort' | 'urge' | 'other';
type Result = 'stress' | 'urge' | 'mixed' | 'other' | 'none';
export type QuizLinks = { leaks: string; basics: string; sneeze?: string; knack?: string };

const WHEN: { id: Kind; label: string; sub: string }[] = [
  { id: 'effort', label: 'With effort', sub: 'A cough, a sneeze, a laugh, a lift, a jump or a run' },
  { id: 'urge', label: 'With a sudden urge', sub: 'A strong need to go, and you could not reach the toilet in time' },
  { id: 'other', label: 'With neither', sub: 'No effort and no urge, or you did not notice when' },
];

const RESULTS: Record<Result, { cat: string; t: [string, string, string]; p: string }> = {
  stress: { cat: 'lift', t: ['Your answers match ', 'stress leaks', '.'], p: 'Stress leaks come with pressure: a cough, a sneeze, a laugh, a lift. For this pattern, the NICE guideline lists pelvic floor training for at least 3 months as the first step.' },
  urge: { cat: 'think', t: ['Your answers match ', 'urge leaks', '.'], p: 'Urge leaks come with a sudden, strong need to go. A doctor can check what drives it. Bladder habits help many women: what you drink, when you go, and how you calm an urge.' },
  mixed: { cat: 'think', t: ['Your answers match ', 'mixed leaks', '.'], p: 'Mixed leaks are both patterns at once, and they are common. Doctors often start with the pattern that bothers you most.' },
  other: { cat: 'worry', t: ['Your answers call for a ', 'doctor’s look', '.'], p: 'Leaks with no effort and no urge can have other causes. Book a visit with your doctor or a urologist before you start any program.' },
  none: { cat: 'cheer', t: ['No leaks in ', 'the last 3 months', '.'], p: 'Good news. Pelvic floor training can help you keep it that way, through birth, sport and menopause.' },
};

export function LeakQuiz({ links }: { links: QuizLinks }) {
  const [step, setStep] = useState(0);
  const [leaked, setLeaked] = useState<boolean | null>(null);
  const [when, setWhen] = useState<Kind[]>([]);
  const [most, setMost] = useState<Kind | 'same' | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const total = 3;   // up to 3: the last one shows only when 2 kinds were picked
  const pick = (k: Kind) => setWhen((w) => (w.includes(k) ? w.filter((x) => x !== k) : [...w, k]));
  const decide = (m: Kind | 'same' | null): Result => {
    const main = when.length === 1 ? when[0] : m;
    if (main === 'same') return 'mixed';
    if (main === 'effort') return 'stress';
    if (main === 'urge') return 'urge';
    return 'other';
  };
  const restart = () => { setStep(0); setLeaked(null); setWhen([]); setMost(null); setResult(null); };

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
        <p className="tool__note">This is not a diagnosis. Only a doctor can tell which kind of leak you have and why.</p>
        <div className="tool__go">
          {result === 'other' ? (
            <a className="btn" href="/resources">See all resources</a>
          ) : (
            <a className="btn btn--quiet" href={result === 'none' ? links.basics : links.leaks}>{result === 'none' ? 'See Pelvic Floor 101' : 'See the Bladder leaks class'}</a>
          )}
          {result !== 'other' && <GetApp className="btn" />}
        </div>
        {(result === 'stress' || result === 'mixed') && (links.knack || links.sneeze) && (
          <ul className="tool__more">
            {links.knack && <li><a className="link" href={links.knack}>The Knack: squeeze before you sneeze</a></li>}
            {links.sneeze && <li><a className="link" href={links.sneeze}>For women who leak when they sneeze</a></li>}
          </ul>
        )}
        <button type="button" className="tool__again" onClick={restart}>Start again</button>
      </div>
    );
  }

  return (
    <form className="tool" onSubmit={(e) => e.preventDefault()} aria-label="Leak type quiz">
      <div className="tool__top">
        <span className="tool__k">Free tool · 3 questions · 1 minute</span>
        <span className="tool__step">Question {step + 1} of {total}</span>
      </div>
      <div className="tool__bar" aria-hidden="true"><i style={{ width: `${((step + 1) / total) * 100}%` }} /></div>

      {step === 0 && (
        <fieldset className="tool__q">
          <legend className="tool__t">In the last 3 months, did you leak urine, even a few drops?</legend>
          <div className="opts opts--2">
            {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map((o) => (
              <label key={o.l} className="opt"><input type="radio" name="leaked" checked={leaked === o.v} onChange={() => setLeaked(o.v)} /><b>{o.l}</b></label>
            ))}
          </div>
          <div className="tool__nav">
            <span />
            <button type="button" className="btn" disabled={leaked === null} onClick={() => (leaked ? setStep(1) : setResult('none'))}>Next</button>
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="tool__q">
          <legend className="tool__t">When did it happen? Pick all that fit.</legend>
          <div className="opts">
            {WHEN.map((o) => (
              <label key={o.id} className="opt"><input type="checkbox" name="when" checked={when.includes(o.id)} onChange={() => pick(o.id)} /><b>{o.label}</b><span>{o.sub}</span></label>
            ))}
          </div>
          <div className="tool__nav">
            <button type="button" className="tool__back" onClick={() => setStep(0)}>Back</button>
            <button type="button" className="btn" disabled={!when.length} onClick={() => (when.length > 1 ? setStep(2) : setResult(decide(null)))}>{when.length > 1 ? 'Next' : 'See my result'}</button>
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="tool__q">
          <legend className="tool__t">Which happened most often?</legend>
          <div className="opts">
            {[...WHEN.filter((o) => when.includes(o.id)), ...(when.includes('effort') && when.includes('urge') ? [{ id: 'same' as const, label: 'About the same', sub: 'As often with effort as with an urge' }] : [])].map((o) => (
              <label key={o.id} className="opt"><input type="radio" name="most" checked={most === o.id} onChange={() => setMost(o.id)} /><b>{o.label}</b><span>{o.sub}</span></label>
            ))}
          </div>
          <div className="tool__nav">
            <button type="button" className="tool__back" onClick={() => setStep(1)}>Back</button>
            <button type="button" className="btn" disabled={!most} onClick={() => setResult(decide(most))}>See my result</button>
          </div>
        </fieldset>
      )}
      <p className="tool__privacy">Your answers stay on this page. Nothing is sent or saved.</p>
    </form>
  );
}
