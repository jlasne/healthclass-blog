'use client';
// The 3-day bladder diary (NICE NG123 1.3.13: at least 3 days, a work day and a day off). The card shows how to fill it
// in, with 1 example row; "Print my diary" prints 3 pages, one per day, from the hidden block below (#print-root, the
// same print path as the exercise sheet). Built from the tool card. Nothing is sent or saved.
import { useEffect, useRef } from 'react';

const COLS = ['Time', 'Drink: what, how much', 'Pee', 'Leak', 'Urge', 'What you were doing'];
const SHORT = ['Time', 'Drink', 'Pee', 'Leak', 'Urge', 'Doing'];
const EXAMPLE = ['7:30', 'Coffee, 1 cup', 'Yes', 'No', '1', 'Got up'];
const LEGEND = ['Pee: yes, or how much if you measure', 'Leak: S drops, M wet underwear, L wet clothes', 'Urge: 0 none, 1 mild, 2 strong, 3 could not wait'];
const ROWS = 24;

export function BladderDiary() {
  const pages = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const off = () => { document.documentElement.classList.remove('print-sheet'); document.getElementById('print-root')?.remove(); };
    window.addEventListener('afterprint', off);
    return () => { window.removeEventListener('afterprint', off); off(); };
  }, []);
  const print = () => {
    if (!pages.current) return;
    document.getElementById('print-root')?.remove();
    const root = document.createElement('div');
    root.id = 'print-root';
    const copy = pages.current.cloneNode(true) as HTMLElement;
    copy.hidden = false;
    root.appendChild(copy);
    document.body.appendChild(root);
    document.documentElement.classList.add('print-sheet');
    window.print();
  };

  return (
    <section className="tool diary" aria-label="3-day bladder diary">
      <div className="tool__top">
        <span className="tool__k">Free tool · 3 days · print it</span>
        <span className="tool__step">3 pages, 1 a day</span>
      </div>
      <h2 className="h3 tool__t">My 3-day bladder <em>diary</em></h2>
      <p className="tool__p">Write a line each time you drink, pee, leak or feel an urge. Keep it for 3 days: at least 1 work day and 1 day off.</p>
      <div className="diary__wrap">
        <table className="diary__tbl">
          <thead><tr>{SHORT.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
          <tbody>
            <tr className="diary__ex">{EXAMPLE.map((c, i) => <td key={i}>{c}</td>)}</tr>
            {Array.from({ length: 3 }, (_, r) => <tr key={r}>{SHORT.map((c) => <td key={c} />)}</tr>)}
          </tbody>
        </table>
      </div>
      <ul className="appcard__facts diary__legend" aria-label="How to fill each column">{LEGEND.map((l) => <li key={l}>{l}</li>)}</ul>
      <p className="tool__note">Bring your 3 pages to your doctor. The diary helps them see your pattern. It does not diagnose.</p>
      <div className="tool__go">
        <button type="button" className="btn" onClick={print}>Print my diary</button>
      </div>
      <p className="tool__privacy">Prints on paper only. Nothing is sent or saved.</p>

      <div ref={pages} className="diary__pages" hidden>
        {[1, 2, 3].map((d) => (
          <div key={d} className="diary__page">
            <div className="diary__hd">
              <b>Bladder diary · Day {d}</b>
              <span>Date: ____________ &nbsp; Woke up: ________ &nbsp; Went to bed: ________</span>
            </div>
            <table className="diary__tbl diary__tbl--print">
              <thead><tr>{COLS.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
              <tbody>
                {d === 1 && <tr className="diary__ex">{EXAMPLE.map((c, i) => <td key={i}>{c}</td>)}</tr>}
                {Array.from({ length: d === 1 ? ROWS - 1 : ROWS }, (_, r) => <tr key={r}>{COLS.map((c) => <td key={c} />)}</tr>)}
              </tbody>
            </table>
            <p className="diary__foot">{LEGEND.join(' · ')}. healthclass.app: education, not medical advice.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
