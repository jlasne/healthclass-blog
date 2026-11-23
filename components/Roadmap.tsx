'use client';
import { useEffect, useMemo, useState } from 'react';
import { FEATS, PLANS, PROMOS, WEEKDAYS, YEAR, moments, type Feat, type WeekRule } from '@/lib/roadmap';
import { dana } from '@/lib/site';
import s from './roadmap.module.css';

// The 2027 calendar. Only Dr. Kivlin's live is fixed; the big and micro updates fill the free days around the live,
// the promotions and the feats. Every choice is kept in the address (?day=4&week=last&feat=2027-03-10~Name), so the
// link you share opens on the same plan.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const short = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const mm = (n: number) => String(n + 1).padStart(2, '0');
type Kind = 'live' | 'micro' | 'big' | 'feat';

export function Roadmap() {
  const [day, setDay] = useState(4);
  const [week, setWeek] = useState<WeekRule>('last');
  const [hour, setHour] = useState('7:00 PM ET');
  const [added, setAdded] = useState<Feat[]>([]);
  const [fDate, setFDate] = useState('');
  const [fWho, setFWho] = useState('');
  const [today, setToday] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const d = Number(q.get('day'));
    if (q.has('day') && d >= 0 && d <= 6) setDay(d);
    const w = q.get('week');
    if (w === 'last' || w === '3' || w === '4') setWeek(w);
    if (q.get('hour')) setHour(q.get('hour') as string);
    setAdded(q.getAll('feat').map((f) => { const [date, ...who] = f.split('~'); return { date, who: who.join('~') }; }).filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f.date) && f.who));
    setToday(iso(new Date()));
  }, []);
  useEffect(() => {
    const q = new URLSearchParams({ day: String(day), week, hour });
    added.forEach((f) => q.append('feat', `${f.date}~${f.who}`));
    window.history.replaceState(null, '', `?${q.toString()}`);
  }, [day, week, hour, added]);

  const feats = useMemo(() => [...FEATS, ...added], [added]);
  const months = useMemo(() => PLANS.map((p) => ({ plan: p, m: moments(p.month, day, week, feats, Boolean(p.micro)) })), [day, week, feats]);

  const addFeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fDate.startsWith(String(YEAR)) || !fWho.trim()) return;
    setAdded((a) => [...a, { date: fDate, who: fWho.trim() }].sort((x, y) => x.date.localeCompare(y.date)));
    setFWho('');
  };

  return (
    <div className={s.root}>
      <section className={s.controls} aria-label="When Dr. Kivlin does her live">
        <label>
          <span>Dr. Kivlin&rsquo;s live day</span>
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
          <span>Live time</span>
          <input value={hour} onChange={(e) => setHour(e.target.value)} />
        </label>
      </section>

      <form className={s.featForm} onSubmit={addFeat} aria-label="Add a feat">
        <label>
          <span>Feat date</span>
          <input type="date" min={`${YEAR}-01-01`} max={`${YEAR}-12-31`} value={fDate} onChange={(e) => setFDate(e.target.value)} required />
        </label>
        <label>
          <span>With who</span>
          <input value={fWho} onChange={(e) => setFWho(e.target.value)} placeholder="Name, and the live or post" required />
        </label>
        <button className="btn" type="submit">Add a feat</button>
      </form>
      {added.length > 0 && (
        <ul className={s.chips} aria-label="Feats added">
          {added.map((f, i) => (
            <li key={f.date + f.who}>
              {short(new Date(f.date + 'T12:00'))}: {f.who}
              <button type="button" aria-label={`Remove ${f.who}`} onClick={() => setAdded((a) => a.filter((_, j) => j !== i))}>×</button>
            </li>
          ))}
        </ul>
      )}

      <p className={s.note}>Only Dr. Kivlin&rsquo;s live is fixed. It can move when she joins a podcast: change her day above, and the updates move around it.</p>

      <ul className={s.legend} aria-label="Legend">
        <li data-k="big"><span><b>Big update</b>: a new program, or the next level of one</span></li>
        <li data-k="micro"><span><b>Micro update</b>: a new language (Spanish, Portuguese, French)</span></li>
        <li data-k="live"><span><b>Live with Dr. Kivlin</b></span></li>
        <li data-k="promo"><span><b>Promotion</b>: a % off or a challenge</span></li>
        <li data-k="feat"><span><b>Feat</b>: a live or a post with a guest</span></li>
      </ul>

      <div className={s.grid}>
        {months.map(({ plan, m }) => {
          const marks: Record<string, Kind> = { [iso(m.big)]: 'big', [iso(m.live)]: 'live' };
          if (m.micro) marks[iso(m.micro)] = 'micro';
          const mFeats = feats.filter((f) => f.date.slice(0, 7) === `${YEAR}-${mm(plan.month)}`);
          mFeats.forEach((f) => { if (!marks[f.date]) marks[f.date] = 'feat'; });
          const promos = PROMOS.filter((p) => p.start.slice(5, 7) === mm(plan.month) || p.end.slice(5, 7) === mm(plan.month));
          const first = new Date(YEAR, plan.month, 1);
          const days = new Date(YEAR, plan.month + 1, 0).getDate();
          const cells: (Date | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => new Date(YEAR, plan.month, i + 1))];
          const past = today && iso(m.live) < today;
          const items = [
            { k: 'big' as Kind, d: m.big, el: <><b>Big update: {plan.big.name}</b><span>{plan.big.line}</span></> },
            ...(m.micro && plan.micro ? [{ k: 'micro' as Kind, d: m.micro, el: <><b>Micro update: {plan.micro.name}</b><span>{plan.micro.line}</span></> }] : []),
            ...mFeats.map((f) => ({ k: 'feat' as Kind, d: new Date(f.date + 'T12:00'), el: <><b>Feat: {f.who}</b></> })),
          ].sort((a, b) => +a.d - +b.d);
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
                    <span key={i} className={s.day} data-k={marks[k]} data-promo={promo ? 'true' : undefined} data-today={k === today ? 'true' : undefined} title={marks[k] === 'live' ? 'Live with Dr. Kivlin' : undefined}>
                      {marks[k] === 'live' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={dana.avatar} alt="" width={40} height={40} />
                      ) : d.getDate()}
                    </span>
                  );
                })}
              </div>
              <ol className={s.list}>
                {items.map((it) => (
                  <li key={it.k + iso(it.d)} data-k={it.k}><time>{short(it.d)}</time>{it.el}</li>
                ))}
                <li data-k="live" className={s.liveItem}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dana.avatar} alt="" width={40} height={40} />
                  <div><time>{short(m.live)} · {hour}</time><b>Live with Dr. Kivlin</b><span>{plan.live}</span>{m.movedFor && <em>A week earlier, off the {m.movedFor} week.</em>}</div>
                </li>
              </ol>
              {promos.map((p) => (
                <div key={p.name} className={s.promo} data-kind={p.kind}>
                  <span className={s.promoTag}>{p.offer}</span>
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
