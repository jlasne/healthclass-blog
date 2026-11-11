'use client';
// Kegel timer: pick a routine, press Start, squeeze while the circle fills, relax while it empties. The routines follow
// Dr. Dana's progression from her reels (3, then 5, then 10 seconds; quick flicks of 1 second). Built from LeakQuiz:
// the same card, option tiles and result block. Nothing is sent or saved.
import { useEffect, useRef, useState } from 'react';
import { GetApp } from '../Waitlist';

type Routine = { id: string; label: string; sub: string; on: number; off: number; reps: number };
const ROUTINES: Routine[] = [
  { id: 'start', label: 'Starter holds', sub: '3 seconds on, 3 off, 10 times', on: 3, off: 3, reps: 10 },
  { id: 'build', label: 'Longer holds', sub: '5 seconds on, 5 off, 10 times', on: 5, off: 5, reps: 10 },
  { id: 'strong', label: 'Strong holds', sub: '10 seconds on, 10 off, 10 times', on: 10, off: 10, reps: 10 },
  { id: 'flicks', label: 'Quick flicks', sub: '1 second on, 1 off, 10 times', on: 1, off: 1, reps: 10 },
];
const length = (x: Routine) => { const s = (x.on + x.off) * x.reps; return s < 60 ? `${s} seconds` : `${Math.round(s / 6) / 10} min`; };
export type TimerLinks = { classes: string; letter?: string };

type Phase = 'squeeze' | 'relax';

export function KegelTimer({ links }: { links: TimerLinks }) {
  const [pick, setPick] = useState('start');
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState<Phase>('squeeze');
  const [rep, setRep] = useState(1);
  const [left, setLeft] = useState(0);       // seconds left in this phase
  const [frac, setFrac] = useState(0);       // 0 to 1 through this phase
  const [sound, setSound] = useState(false);
  const t0 = useRef(0);                      // when this phase started (ms), moved forward on resume
  const pausedAt = useRef(0);
  const audio = useRef<AudioContext | null>(null);
  const r = ROUTINES.find((x) => x.id === pick)!;

  const beep = (high: boolean) => {
    if (!sound) return;
    try {
      const ctx = audio.current ?? new AudioContext();
      audio.current = ctx;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = high ? 660 : 440; g.gain.value = 0.06;
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.12);
    } catch { /* no sound on this browser: the screen still leads */ }
  };

  useEffect(() => {
    if (!running || paused) return;
    const id = window.setInterval(() => {
      const len = (phase === 'squeeze' ? r.on : r.off) * 1000;
      const el = Date.now() - t0.current;
      if (el >= len) {
        if (phase === 'squeeze') { setPhase('relax'); beep(false); }
        else if (rep >= r.reps) { setRunning(false); setDone(true); return; }
        else { setPhase('squeeze'); setRep((n) => n + 1); beep(true); }
        t0.current = Date.now();
        setFrac(0);
        return;
      }
      setFrac(el / len);
      setLeft(Math.ceil((len - el) / 1000));
    }, 100);
    return () => window.clearInterval(id);
  }, [running, paused, phase, rep, r]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => { setDone(false); setPhase('squeeze'); setRep(1); setFrac(0); setLeft(r.on); t0.current = Date.now(); setPaused(false); setRunning(true); beep(true); };
  const pause = () => { if (paused) { t0.current += Date.now() - pausedAt.current; setPaused(false); } else { pausedAt.current = Date.now(); setPaused(true); } };
  const stop = () => { setRunning(false); setPaused(false); setFrac(0); };

  if (done) {
    return (
      <div className="tool tool--done" aria-live="polite">
        <div className="tool__res">
          <span className="tone-disc tone--rosy" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cats/cheer.svg" alt="" width={96} height={96} />
          </span>
          <div>
            <span className="tool__k">Done</span>
            <h2 className="h3 tool__t">{r.reps} {r.id === 'flicks' ? 'quick flicks' : 'holds'}, <em>done</em>.</h2>
          </div>
        </div>
        <p className="tool__p">Twice a day builds the habit. When this routine feels easy, move up to the next one.</p>
        <div className="tool__go">
          <a className="btn btn--quiet" href={links.classes}>See the 6-week classes</a>
          <GetApp className="btn" />
        </div>
        {links.letter && <ul className="tool__more"><li><a className="link" href={links.letter}>Half of us squeeze wrong: how to do a Kegel right</a></li></ul>}
        <button type="button" className="tool__again" onClick={() => setDone(false)}>Start again</button>
      </div>
    );
  }

  if (running) {
    const squeeze = phase === 'squeeze';
    return (
      <div className="tool" aria-label="Kegel timer running">
        <div className="tool__top">
          <span className="tool__k">{r.label}</span>
          <span className="tool__step">Rep {rep} of {r.reps}</span>
        </div>
        <div className="tool__bar" aria-hidden="true"><i style={{ width: `${((rep - 1 + (squeeze ? frac / 2 : 0.5 + frac / 2)) / r.reps) * 100}%` }} /></div>
        <div className={`timer timer--${phase}`} style={{ ['--p' as string]: squeeze ? frac : 1 - frac }}>
          <div className="timer__in" aria-live="polite">
            <b>{squeeze ? 'Squeeze' : 'Relax'}</b>
            <span>{paused ? 'Paused' : `${left} s`}</span>
          </div>
        </div>
        <p className="timer__cue">{squeeze ? 'Breathe out, then lift.' : 'Let go fully. Breathe in.'}</p>
        <div className="tool__nav">
          <button type="button" className="tool__back" onClick={stop}>Stop</button>
          <button type="button" className="btn btn--quiet" onClick={pause}>{paused ? 'Resume' : 'Pause'}</button>
        </div>
      </div>
    );
  }

  return (
    <form className="tool" onSubmit={(e) => { e.preventDefault(); start(); }} aria-label="Kegel timer">
      <div className="tool__top">
        <span className="tool__k">Free tool · Kegel timer</span>
        <span className="tool__step">{r.reps} reps · {length(r)}</span>
      </div>
      <fieldset className="tool__q">
        <legend className="tool__t">Pick your routine.</legend>
        <div className="opts">
          {ROUTINES.map((o) => (
            <label key={o.id} className="opt"><input type="radio" name="routine" checked={pick === o.id} onChange={() => setPick(o.id)} /><b>{o.label}</b><span>{o.sub}</span></label>
          ))}
        </div>
      </fieldset>
      <div className="tool__nav">
        <label className="check"><input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /> Sound</label>
        <button type="submit" className="btn">Start</button>
      </div>
      <p className="tool__privacy">Nothing is sent or saved. Works with the screen on.</p>
    </form>
  );
}
