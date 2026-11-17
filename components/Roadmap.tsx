'use client';
import { useEffect, useMemo, useState } from 'react';
import { PLANS, PROMOS, WEEKDAYS, YEAR, moments, type Spacing, type WeekRule } from '@/lib/roadmap';
import s from './roadmap.module.css';

// The 2027 calendar. Pick Dr. Dana's live day; the micro update and the new program follow it. The choice is kept in
// the address (?day=4&week=last&gap=compact), so the link you share opens on the same plan.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const short = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
type Kind = 'live' | 'update' | 'program' | 'promo';

export function Roadmap() {
  const [day, setDay] = useState(4);
  const [week, setWeek] = useState<WeekRule>('last');
  const [gap, setGap] = useState<Spacing>('compact');
  const [hour, setHour] = useState('7:00 PM ET');
  const [today, setToday] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const d = Number(q.get('day'));
    if (q.has('day') && d >= 0 && d <= 6) setDay(d);
    const w = q.get('week');
    if (w === 'last' || w === '3' || w === '4') setWeek(w);
    const g = q.get('gap');
    if (g === 'compact' || g === 'spread') setGap(g);
    if (q.get('hour')) setHour(q.get('hour') as string);
    setToday(iso(new Date()));
  }, []);
  useEffect(() => {
    const q = new URLSearchParams({ day: String(day), week, gap, hour });
    window.history.replaceState(null, '', `?${q.toString()}`);
  }, [day, week, gap, hour]);

  const months = useMemo(() => PLANS.map((p) => ({ plan: p, m: moments(p.month, day, week, gap) })), [day, week, gap]);
  const upcoming = useMemo(() => {
    const all = months.flatMap(({ plan, m }) => [
      { kind: 'update' as Kind, date: m.update, title: `Micro update: ${plan.update.name}` },
      { kind: 'program' as Kind, date: m.program, title: `New program: ${plan.program.name}` },
      { kind: 'live' as Kind, date: m.live, title: `Live with Dr. Dana: ${plan.live}` },
    ]);
    const from = today || `${YEAR - 1}-12-31`;
    return all.filter((e) => iso(e.date) >= from).sort((a, b) => +a.date - +b.date).slice(0, 3);
  }, [months, today]);

  return (
    <div className={s.root}>
      <section className={s.controls} aria-label="When Dr. Dana does her live">
        <label>
          <span>Live day</span>
          <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {WEEKDAYS.map((w, i) => <option key={w} value={i}>{w}</option>)}
          </select>
        </label>
        <label>
          <span>Which week</span>
          <select value={week} onChange={(e) => setWeek(e.target.value as WeekRule)}>
            <option value="last">Last of the month</option>
            <option value="4">4th of the month</option>
            <option value="3">3rd of the month</option>
          </select>
        </label>
        <label>
          <span>Spacing</span>
          <select value={gap} onChange={(e) => setGap(e.target.value as Spacing)}>
            <option value="compact">Compact: update 7 days before, program 3 days before</option>
            <option value="spread">Spread: update 14 days before, program 7 days before</option>
          </select>
        </label>
        <label>
          <span>Live time</span>
          <input value={hour} onChange={(e) => setHour(e.target.value)} />
        </label>
      </section>

      <ul className={s.legend} aria-label="Legend">
        <li data-k="update">Micro update</li>
        <li data-k="program">New program</li>
        <li data-k="live">Live with Dr. Dana</li>
        <li data-k="promo">Promotion</li>
      </ul>

      {upcoming.length > 0 && (
        <section className={s.next} aria-label="Coming next">
          {upcoming.map((e) => (
            <div key={e.title} className={s.nextItem} data-k={e.kind}>
              <b>{short(e.date)}</b>
              <span>{e.title}</span>
            </div>
          ))}
        </section>
      )}

      <div className={s.grid}>
        {months.map(({ plan, m }) => {
          const marks: Record<string, Kind> = { [iso(m.update)]: 'update', [iso(m.program)]: 'program', [iso(m.live)]: 'live' };
          const promos = PROMOS.filter((p) => p.start.slice(5, 7) === String(plan.month + 1).padStart(2, '0') || p.end.slice(5, 7) === String(plan.month + 1).padStart(2, '0'));
          const first = new Date(YEAR, plan.month, 1);
          const days = new Date(YEAR, plan.month + 1, 0).getDate();
          const cells: (Date | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => new Date(YEAR, plan.month, i + 1))];
          const past = today && iso(m.live) < today;
          return (
            <article key={plan.month} className={s.month} data-past={past ? 'true' : undefined}>
              <header className={s.mHead}>
                <h2>{MONTHS[plan.month]}</h2>
                <p>{plan.theme}</p>
              </header>
              <div className={s.cal} role="grid" aria-label={`${MONTHS[plan.month]} ${YEAR}`}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className={s.dow}>{d}</span>)}
                {cells.map((d, i) => {
                  if (!d) return <span key={i} />;
                  const k = iso(d);
                  const promo = PROMOS.some((p) => k >= p.start && k <= p.end);
                  return (
                    <span key={i} className={s.day} data-k={marks[k]} data-promo={promo ? 'true' : undefined} data-today={k === today ? 'true' : undefined}>
                      {d.getDate()}
                    </span>
                  );
                })}
              </div>
              <ol className={s.list}>
                <li data-k="update"><time>{short(m.update)}</time><b>Micro update: {plan.update.name}</b><span>{plan.update.line}</span></li>
                <li data-k="program"><time>{short(m.program)}</time><b>New program: {plan.program.name}</b><span>{plan.program.line}</span></li>
                <li data-k="live"><time>{short(m.live)} · {hour}</time><b>Live with Dr. Dana</b><span>{plan.live}</span></li>
                {promos.map((p) => (
                  <li key={p.name} data-k="promo"><time>{short(new Date(p.start + 'T12:00'))} to {short(new Date(p.end + 'T12:00'))}</time><b>Promotion: {p.name}</b><span>{p.line}</span></li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </div>
  );
}
