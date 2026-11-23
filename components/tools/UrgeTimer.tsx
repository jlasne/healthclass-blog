'use client';
// Urge wave timer: when a sudden urge hits, it walks you through the app's "When an urge comes" steps (bladder training):
// stop and stay still, 5 quick squeezes, slow breaths, then distract yourself, about 80 seconds in all. Then it asks if
// the urge eased: yes ends on "walk calmly to the toilet", not yet runs the squeezes and breaths again. Built from the
// Kegel timer (same ring and card). Nothing is sent or saved.
import { useEffect, useRef, useState } from 'react';
import { GetApp } from '../Waitlist';

type Step = { id: string; label: string; sec: number; cue: string };
const STEPS: Step[] = [
  { id: 'stop', label: 'Stop', sec: 10, cue: 'Stay still. Sit down if you can. Hold off on rushing to the toilet.' },
  { id: 'flicks', label: 'Squeeze', sec: 10, cue: '5 quick squeezes: lift fast for 1 second, let go fully for 1.' },
  { id: 'breathe', label: 'Breathe', sec: 30, cue: 'Breathe in for 4, out for 6. Let your belly soften.' },
  { id: 'distract', label: 'Distract', sec: 30, cue: 'Count back from 100 by 3, or name 5 things you can see.' },
];
export type UrgeLinks = { diary?: string; leaks: string; oab?: string };

export function UrgeTimer({ links }: { links: UrgeLinks }) {
  const [state, setState] = useState<'idle' | 'run' | 'ask' | 'done'>('idle');
  const [i, setI] = useState(0);            // step index
  const [el, setEl] = useState(0);          // ms into this step
  const [round, setRound] = useState(1);
  const t0 = useRef(0);

  useEffect(() => {
    if (state !== 'run') return;
    const id = window.setInterval(() => {
      const ms = Date.now() - t0.current;
      if (ms >= STEPS[i].sec * 1000) {
        if (i < STEPS.length - 1) { setI(i + 1); t0.current = Date.now(); setEl(0); }
        else setState('ask');
        return;
      }
      setEl(ms);
    }, 100);
    return () => window.clearInterval(id);
  }, [state, i]);

  const go = (from: number) => { setI(from); setEl(0); t0.current = Date.now(); setState('run'); };
  const restart = () => { setState('idle'); setI(0); setEl(0); setRound(1); };

  if (state === 'done') {
    return (
      <div className="tool tool--done" aria-live="polite">
        <div className="tool__res">
          <span className="tone-disc tone--rosy" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cats/cheer.svg" alt="" width={96} height={96} />
          </span>
          <div>
            <span className="tool__k">Wave passed</span>
            <h2 className="h3 tool__t">Now walk <em>calmly</em> to the toilet.</h2>
          </div>
        </div>
        <p className="tool__p">Walk, do not run. If you can, wait a few more minutes first. Each urge you ride out teaches your bladder to wait a little longer.</p>
        <p className="tool__note">This tool teaches. It does not diagnose or treat. Urges with burning, blood in your urine or a fever need a doctor.</p>
        <div className="tool__go">
          {links.diary && <a className="btn btn--quiet" href={links.diary}>Log your urges: the bladder diary</a>}
          <GetApp className="btn" />
        </div>
        <ul className="tool__more">
          <li><a className="link" href={links.leaks}>The Bladder leaks class: bladder training, day by day</a></li>
          {links.oab && <li><a className="link" href={links.oab}>Is it an overactive bladder? The 4-question quiz</a></li>}
        </ul>
        <button type="button" className="tool__again" onClick={restart}>Start again</button>
      </div>
    );
  }

  if (state === 'ask') {
    return (
      <div className="tool" aria-live="polite">
        <div className="tool__top">
          <span className="tool__k">Urge wave timer</span>
          <span className="tool__step">Round {round}</span>
        </div>
        <h2 className="h3 tool__t">Has the urge <em>eased</em>?</h2>
        <div className="tool__nav">
          <button type="button" className="btn btn--quiet" onClick={() => { setRound(round + 1); go(1); }}>Not yet: once more</button>
          <button type="button" className="btn" onClick={() => setState('done')}>Yes, it eased</button>
        </div>
      </div>
    );
  }

  if (state === 'run') {
    const s = STEPS[i];
    const frac = Math.min(1, el / (s.sec * 1000));
    const left = Math.max(1, Math.ceil(s.sec - el / 1000));
    const sec = Math.floor(el / 1000);
    const flick = s.id === 'flicks';
    const lift = flick && sec % 2 === 0;
    const big = flick ? (lift ? `Lift ${Math.min(5, Math.floor(sec / 2) + 1)}` : 'Let go') : s.label;
    return (
      <div className="tool" aria-label="Urge wave timer running">
        <div className="tool__top">
          <span className="tool__k">Step {i + 1} of {STEPS.length}</span>
          <span className="tool__step">Round {round}</span>
        </div>
        <div className="tool__bar" aria-hidden="true"><i style={{ width: `${((i + frac) / STEPS.length) * 100}%` }} /></div>
        <div className={`timer ${flick && !lift ? 'timer--relax' : 'timer--squeeze'}`} style={{ ['--p' as string]: frac }}>
          <div className="timer__in" aria-live="polite">
            <b>{big}</b>
            <span>{left} s</span>
          </div>
        </div>
        <p className="timer__cue">{s.cue}</p>
        <div className="tool__nav">
          <button type="button" className="tool__back" onClick={restart}>Stop</button>
          <button type="button" className="btn btn--quiet" onClick={() => setState('ask')}>The urge eased</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tool" aria-label="Urge wave timer">
      <div className="tool__top">
        <span className="tool__k">Free tool · urge wave timer</span>
        <span className="tool__step">About 80 seconds</span>
      </div>
      <h2 className="h3 tool__t">A sudden urge? <em>Ride it out.</em></h2>
      <ol className="join-steps weeks__list tone--rosy">
        {STEPS.map((s) => (<li key={s.id}><b>{s.label}, {s.sec} seconds</b><span>{s.cue}</span></li>))}
      </ol>
      <div className="tool__nav">
        <span />
        <button type="button" className="btn" onClick={() => go(0)}>An urge just hit</button>
      </div>
      <p className="tool__privacy">Nothing is sent or saved. Works with the screen on.</p>
    </div>
  );
}
