'use client';
import { useEffect, useMemo, useState } from 'react';
import { PLANS, PROMOS, WEEKDAYS, YEAR, moments, type Spacing, type WeekRule } from '@/lib/roadmap';
import { dana } from '@/lib/site';
import s from './roadmap.module.css';

// The 2027 calendar. Pick Dr. Dana's live day; the micro update and the new program follow it. The choice is kept in
// the address (?day=4&week=last&gap=even), so the link you share opens on the same plan.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const short = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
type Kind = 'live' | 'update' | 'program' | 'promo';

export function Roadmap() {
  const [day, setDay] = useState(4);
  const [week, setWeek] = useState<WeekRule>('last');
  const [gap, setGap] = useState<Spacing>('even');
  const [hour, setHour] = useState('7:00 PM ET');
  const [today, setToday] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const d = Number(q.get('day'));
    if (q.has('day') && d >= 0 && d <= 6) setDay(d);
    const w = q.get('week');
    if (w === 'last' || w === '3' || w === '4') setWeek(w);
    const g = q.get('gap');
    if (g === 'even' || g === 'compact') setGap(g);
    if (q.get('hour')) setHour(q.get('hour') as string);
    setToday(iso(new Date()));
  }, []);
  useEffect(() => {
    const q = new URLSearchParams({ day: String(day), week, gap, hour });
    window.history.replaceState(null, '', `?${q.toString()}`);
  }, [day, week, gap, hour]);

  const months = useMemo(() => PLANS.map((p) => ({ plan: p, m: moments(p.month, day, week, gap) })), [day, week, gap]);

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
            <option value="even">Spread over the month</option>
            <option value="compact">All in the last week</option>
          </select>
        </label>
        <label>
          <span>Live time</span>
          <input value={hour} onChange={(e) => setHour(e.target.value)} />
        </label>
      </section>

      <p className={s.note}>Live dates can move when Dr. Dana joins a podcast. Change her day above and the month follows.</p>

      <ul className={s.legend} aria-label="Legend">
        <li data-k="update"><span><b>Micro update</b>: a small change to keep the app in the news, like a new language</span></li>
        <li data-k="program"><span><b>Big update</b>: a new program, or something big in the app or the site</span></li>
        <li data-k="live">Live with Dr. Dana</li>
        <li data-k="promo">Promotion</li>
      </ul>

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
                    <span key={i} className={s.day} data-k={marks[k]} data-promo={promo ? 'true' : undefined} data-today={k === today ? 'true' : undefined} title={marks[k] === 'live' ? 'Live with Dr. Dana' : undefined}>
                      {marks[k] === 'live' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={dana.avatar} alt="" width={40} height={40} />
                      ) : d.getDate()}
                    </span>
                  );
                })}
              </div>
              <ol className={s.list}>
                <li data-k="update"><time>{short(m.update)}</time><b>Micro update: {plan.update.name}</b><span>{plan.update.line}</span></li>
                <li data-k="program"><time>{short(m.program)}</time><b>Big update: {plan.program.name}</b><span>{plan.program.line}</span></li>
                <li data-k="live" className={s.liveItem}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dana.avatar} alt="" width={40} height={40} />
                  <div><time>{short(m.live)} · {hour}</time><b>Live with Dr. Dana</b><span>{plan.live}</span>{m.movedFor && <em>A week earlier, off the {m.movedFor} week.</em>}</div>
                </li>
              </ol>
              {promos.map((p) => (
                <div key={p.name} className={s.promo}>
                  <span className={s.promoTag}>Promotion</span>
                  <b>{p.name}</b>
                  <time>{short(new Date(p.start + 'T12:00'))} to {short(new Date(p.end + 'T12:00'))}</time>
                  <span>{p.line}</span>
                </div>
              ))}
            </article>
          );
        })}
      </div>
    </div>
  );
}
