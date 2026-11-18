'use client';
// The printable exercise sheet: one page with the routine the Health Class app keeps after a class (the Bladder leaks
// keeper: breathing, 8 holds, 10 flicks, 5 Knack coughs, a let-go), its cues and stop signs, and a 12-week chart to
// tick. "Print this sheet" prints a copy of the card alone (#print-root, see globals.css). Built from the tool card.
import { useEffect, useRef } from 'react';

const ROUTINE = [
  { t: 'Breathe, 30 seconds', l: 'Hands on your ribs. Breathe in wide, belly soft. Let the out-breath fall.' },
  { t: '8 slow holds', l: 'Breathe out and lift for 3 seconds. Let go for 6. Build to 10 seconds on, 10 off.' },
  { t: '10 quick flicks', l: 'Lift fast for 1 second. Let go fully for 2 seconds.' },
  { t: '5 Knack coughs', l: 'Squeeze just before a small cough. Hold through it, then let go.' },
  { t: 'Let go, 1 minute', l: 'Feel your pelvic floor soften and drop with each breath.' },
];
const CUES = ['Breathe out, then lift.', 'Butt, thighs and belly stay soft.', 'Every rep ends soft.'];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function ExerciseSheet() {
  const card = useRef<HTMLElement>(null);
  // print the card alone: a copy goes in #print-root, the only thing html.print-sheet lets the printer see
  useEffect(() => {
    const off = () => { document.documentElement.classList.remove('print-sheet'); document.getElementById('print-root')?.remove(); };
    window.addEventListener('afterprint', off);
    return () => { window.removeEventListener('afterprint', off); off(); };
  }, []);
  const print = () => {
    if (!card.current) return;
    document.getElementById('print-root')?.remove();
    const root = document.createElement('div');
    root.id = 'print-root';
    root.appendChild(card.current.cloneNode(true));
    document.body.appendChild(root);
    document.documentElement.classList.add('print-sheet');
    window.print();
  };

  return (
    <section ref={card} className="tool sheet" aria-label="Printable exercise sheet">
      <div className="tool__top">
        <span className="tool__k">Free sheet · 1 page · print it</span>
        <span className="tool__step">healthclass.app</span>
      </div>
      <h2 className="h3 tool__t">My pelvic floor <em>sheet</em></h2>
      <p className="tool__p sheet__when">Once a day, the full routine. 2 more times a day, 8 slow holds. Pick 3 anchors: coffee, lunch, brushing your teeth.</p>
      <ol className="join-steps weeks__list tone--rosy">
        {ROUTINE.map((s) => (<li key={s.t}><b>{s.t}</b><span>{s.l}</span></li>))}
      </ol>
      <ul className="appcard__facts sheet__cues" aria-label="Cues">{CUES.map((c) => <li key={c}>{c}</li>)}</ul>
      <p className="tool__p"><b>Where:</b> lying down in weeks 1 to 4, sitting in weeks 5 to 8, standing in weeks 9 to 12.</p>
      <div className="sheet__chart" role="table" aria-label="12-week chart: tick each day you train">
        <div className="sheet__row sheet__row--hd" role="row"><span role="columnheader">Week</span>{DAYS.map((d, i) => <span key={i} role="columnheader">{d}</span>)}</div>
        {Array.from({ length: 12 }, (_, w) => (
          <div key={w} className="sheet__row" role="row"><span role="rowheader">{w + 1}</span>{DAYS.map((_, i) => <i key={i} role="cell" aria-label="Not ticked" />)}</div>
        ))}
      </div>
      <p className="tool__note">Stop and see a doctor if you feel pain or a bulge, or if soreness lasts into the next day. This sheet teaches. It does not diagnose or treat.</p>
      <div className="tool__go sheet__go">
        <button type="button" className="btn" onClick={print}>Print this sheet</button>
      </div>
    </section>
  );
}
