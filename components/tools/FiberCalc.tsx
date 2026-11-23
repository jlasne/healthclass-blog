'use client';
// Fiber calculator: 3 short steps, tick what you ate yesterday, and see your grams next to Dr. Kivlin's goal (25 to 35 g).
// The foods, servings and grams come from her fiber guide (lib/fiber.ts); the low end of a range counts, as in the
// guide's "Build your day". Built from LeakQuiz: the same card, option tiles and result block. Nothing is sent or saved.
import { useState } from 'react';
import { GetApp } from '../Waitlist';
import { GOAL, foodById, low, type Food } from '@/lib/fiber';

export type FiberLinks = { guide: string; classes: string };

// [food id, how many servings]: 2 slices of bread count as 2 servings of 1 slice
type Item = { id: string; times?: number; label?: string };
const STEPS: { q: string; items: Item[] }[] = [
  {
    q: 'Fruits and vegetables you ate yesterday',
    items: [{ id: 'apple' }, { id: 'banana' }, { id: 'orange' }, { id: 'blueberries' }, { id: 'pear' }, { id: 'broccoli' }, { id: 'carrots' }, { id: 'potato' }, { id: 'avocado', label: 'Avocado, half', times: 0.5 }],
  },
  {
    q: 'Grains you ate yesterday',
    items: [{ id: 'oatmeal' }, { id: 'whole-grain-bread', times: 2, label: 'Whole grain bread, 2 slices' }, { id: 'brown-rice' }, { id: 'pasta' }, { id: 'quinoa' }, { id: 'popcorn' }],
  },
  {
    q: 'Beans, nuts and seeds you ate yesterday',
    items: [{ id: 'black-beans' }, { id: 'lentils' }, { id: 'garbanzo' }, { id: 'almonds' }, { id: 'peanuts' }, { id: 'chia' }, { id: 'flaxseeds' }],
  },
];

// easy adds, richest first, from her "best for constipation" foods
const ADDS = ['raspberries', 'chia', 'lentils', 'pear', 'kiwi', 'black-beans'];

const grams = (f: Food, times = 1) => low(f.total) * times;
const round = (x: number) => Math.round(x);
const key = (it: Item) => `${it.id}:${it.times ?? 1}`;

export function FiberCalc({ links }: { links: FiberLinks }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const toggle = (k: string) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const restart = () => { setStep(0); setPicked([]); setDone(false); };

  const all = STEPS.flatMap((s) => s.items);
  const total = round(all.filter((it) => picked.includes(key(it))).reduce((sum, it) => { const f = foodById(it.id); return f ? sum + grams(f, it.times) : sum; }, 0));

  if (done) {
    const short = Math.max(0, GOAL.min - total);
    const level = total < GOAL.min ? 'short' : total <= GOAL.max ? 'goal' : 'over';
    const adds = ADDS.filter((id) => !picked.some((k) => k.startsWith(`${id}:`))).map((id) => foodById(id)).filter((f): f is Food => Boolean(f)).slice(0, 3);
    return (
      <div className="tool tool--done" aria-live="polite">
        <div className="tool__res">
          <span className="tone-disc tone--rosy" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/cats/${level === 'goal' ? 'cheer' : 'write'}.svg`} alt="" width={96} height={96} />
          </span>
          <div>
            <span className="tool__k">Your fiber yesterday</span>
            <h2 className="h3 tool__t">About <em>{`${total}\u00a0g`}</em> of fiber.</h2>
          </div>
        </div>
        {level === 'short' && (
          <p className="tool__p">The goal is {GOAL.min} to {GOAL.max} g a day, so you are about {short} g short. Add fiber slowly: 2 to 3 g a day more each week, with water.</p>
        )}
        {level === 'goal' && (
          <p className="tool__p">You are inside the {GOAL.min} to {GOAL.max} g goal. Keep both kinds of fiber on your plate, and drink water with them.</p>
        )}
        {level === 'over' && (
          <p className="tool__p">You are above the {GOAL.max} g goal. If your gut feels good, keep going. If you feel bloated, ease back a little and drink water with your fiber.</p>
        )}
        {level !== 'goal' && adds.length > 0 && <p className="tool__p"><b>Easy foods to add:</b></p>}
        {level !== 'goal' && adds.length > 0 && (
          <ol className="join-steps weeks__list tone--rosy">
            {adds.map((f) => (<li key={f.id}><b>{f.name}</b><span>{f.serving}: {`${round(low(f.total))}\u00a0g`} of fiber</span></li>))}
          </ol>
        )}
        <p className="tool__note">This tool counts fiber from food. It does not diagnose or treat. Constipation that lasts more than 3 weeks, or blood in your stool, needs a doctor.</p>
        <div className="tool__go">
          <a className="btn btn--quiet" href={links.guide}>See Dr. Kivlin&rsquo;s fiber guide</a>
          <GetApp className="btn" />
        </div>
        <ul className="tool__more">
          <li><a className="link" href={links.classes}>Pelvic Floor 101: fiber runs through all 6 weeks</a></li>
        </ul>
        <button type="button" className="tool__again" onClick={restart}>Start again</button>
      </div>
    );
  }

  const s = STEPS[step];
  return (
    <form className="tool" onSubmit={(e) => e.preventDefault()} aria-label="Fiber calculator">
      <div className="tool__top">
        <span className="tool__k">Free tool · 3 steps · 1 minute</span>
        <span className="tool__step">Step {step + 1} of {STEPS.length}</span>
      </div>
      <div className="tool__bar" aria-hidden="true"><i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
      <fieldset className="tool__q">
        <legend className="tool__t">{s.q}. Pick all that fit.</legend>
        <div className="opts opts--2">
          {s.items.map((it) => {
            const f = foodById(it.id);
            if (!f) return null;
            const k = key(it);
            return (
              <label key={k} className="opt">
                <input type="checkbox" name="food" checked={picked.includes(k)} onChange={() => toggle(k)} />
                <b>{it.label ?? f.name}</b>
                <span>{it.label ? '' : `${f.serving} · `}{`${round(grams(f, it.times) * 10) / 10}\u00a0g`}</span>
              </label>
            );
          })}
        </div>
        <div className="tool__nav">
          {step > 0 ? <button type="button" className="tool__back" onClick={() => setStep(step - 1)}>Back</button> : <span />}
          <button type="button" className="btn" onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : setDone(true))}>{step < STEPS.length - 1 ? 'Next' : 'See my total'}</button>
        </div>
      </fieldset>
      <p className="tool__privacy">None of these? Press Next. Your answers stay on this page. Nothing is sent or saved.</p>
    </form>
  );
}
