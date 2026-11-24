'use client';
// Bladder training schedule: 2 questions (the usual time between daytime trips, from a bladder diary, and the time you
// get up) give a 6-week schedule (NICE NG123 1.4.11: at least 6 weeks) that adds 15 minutes a week (Mayo Clinic's
// patient guide), aiming for 3 to 4 hours (the app's bladder training norm), and a sample day for week 1.
// Built from LeakQuiz: the same card, option tiles and result block. Nothing is sent or saved.
import { useState } from 'react';
import { GetApp } from '../Waitlist';

export type ScheduleLinks = { urge?: string; diary?: string; leaks: string };

const GAPS = [30, 45, 60, 90, 120, 150];
const WAKES = [5, 6, 7, 8, 9];
const STEP = 15;
const WEEKS = 6;
const BED = 22 * 60; // the sample day stops at 10 PM

const dur = (m: number) => { const h = Math.floor(m / 60); const r = m % 60; return h ? (r ? `${h} h ${r} min` : `${h} h`) : `${r} min`; };
const clock = (m: number) => { const h = Math.floor(m / 60); const r = m % 60; const h12 = ((h + 11) % 12) + 1; return `${h12}:${String(r).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };

export function BladderSchedule({ links }: { links: ScheduleLinks }) {
  const [step, setStep] = useState(0);
  const [gap, setGap] = useState<number | null>(null);
  const [wake, setWake] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const restart = () => { setStep(0); setGap(null); setWake(null); setDone(false); };

  if (done && gap != null && wake != null) {
    const long = gap >= 150;
    const weeks = Array.from({ length: WEEKS }, (_, w) => gap + w * STEP);
    const day: number[] = [];
    for (let t = wake * 60; t <= BED; t += gap) day.push(t);
    return (
      <div className="tool tool--done" aria-live="polite">
        <div className="tool__res">
          <span className="tone-disc tone--rosy" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cats/calendar.svg" alt="" width={96} height={96} />
          </span>
          <div>
            <span className="tool__k">Your 6-week schedule</span>
            <h2 className="h3 tool__t">{long ? <>You already wait <em>{dur(gap)}</em> or more.</> : <>Start at every <em>{dur(gap)}</em>.</>}</h2>
          </div>
        </div>
        <p className="tool__p">
          {long
            ? 'That is close to the 3 to 4 hours between trips that is typical with average drinking. Keep your gaps, go when your bladder is full rather than just in case, and ride out early urges.'
            : `Pee on waking, then at your set times through the day. Add ${STEP} minutes each week, once you held this week’s time on 5 days of 7. Keep going until you reach 3 to 4 hours.`}
        </p>
        {!long && (
          <ol className="join-steps weeks__list tone--rosy">
            {weeks.map((m, w) => (<li key={w}><b>Week {w + 1}</b><span>Every {dur(m)}</span></li>))}
          </ol>
        )}
        {!long && (
          <>
            <p className="tool__p"><b>A day in week 1:</b></p>
            <ul className="appcard__facts" aria-label="Times to pee in week 1">{day.map((t) => <li key={t}>{clock(t)}</li>)}</ul>
          </>
        )}
        <p className="tool__note">Tell your doctor you are starting bladder training, so they can check if you need any tests first. At night, go when you wake up: the schedule is for the day.</p>
        <div className="tool__go">
          {links.urge ? <a className="btn btn--quiet" href={links.urge}>An urge before your time? Ride it out</a> : null}
          <GetApp className="btn" />
        </div>
        <ul className="tool__more">
          {links.diary && <li><a className="link" href={links.diary}>Track your progress: the 3-day bladder diary</a></li>}
          <li><a className="link" href={links.leaks}>The Bladder leaks class: bladder habits, week by week</a></li>
        </ul>
        <button type="button" className="tool__again" onClick={restart}>Start again</button>
      </div>
    );
  }

  return (
    <form className="tool" onSubmit={(e) => e.preventDefault()} aria-label="Bladder training schedule">
      <div className="tool__top">
        <span className="tool__k">Free tool · 2 questions · 1 minute</span>
        <span className="tool__step">Question {step + 1} of 2</span>
      </div>
      <div className="tool__bar" aria-hidden="true"><i style={{ width: `${((step + 1) / 2) * 100}%` }} /></div>

      {step === 0 && (
        <fieldset className="tool__q">
          <legend className="tool__t">During the day, how long do you usually wait between trips to the toilet?</legend>
          <div className="opts opts--2">
            {GAPS.map((m) => (
              <label key={m} className="opt"><input type="radio" name="gap" checked={gap === m} onChange={() => setGap(m)} /><b>{m === 150 ? '2 h 30 min or more' : dur(m)}</b></label>
            ))}
          </div>
          <div className="tool__nav">
            <span />
            <button type="button" className="btn" disabled={gap == null} onClick={() => setStep(1)}>Next</button>
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="tool__q">
          <legend className="tool__t">What time do you usually get up?</legend>
          <div className="opts opts--2">
            {WAKES.map((h) => (
              <label key={h} className="opt"><input type="radio" name="wake" checked={wake === h} onChange={() => setWake(h)} /><b>{clock(h * 60)}</b></label>
            ))}
          </div>
          <div className="tool__nav">
            <button type="button" className="tool__back" onClick={() => setStep(0)}>Back</button>
            <button type="button" className="btn" disabled={wake == null} onClick={() => setDone(true)}>See my schedule</button>
          </div>
        </fieldset>
      )}
      <p className="tool__privacy">Not sure of your gaps? Keep a 3-day bladder diary first. Nothing is sent or saved.</p>
    </form>
  );
}
