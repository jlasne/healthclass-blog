'use client';
// The moving parts of Dr. Kivlin's fiber guide (/dana-kivlin/fiber): the sticky section chips, the food chart with
// "Build your day", and the supplement picker. Data in lib/fiber.ts. Picks stay in this browser only (localStorage).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import { GOAL, MAX_GRAMS, allFoods, fmt, foodGroups, goals, high, low, mid, supplements, type Food } from '@/lib/fiber';
import s from './fiber.module.css';

const round = (x: number) => Math.round(x * 10) / 10;
const pct = (x: number, of: number) => `${Math.max(0, Math.min(100, (x / of) * 100)).toFixed(2)}%`;

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduce(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return reduce;
}

function useWide(query = '(min-width: 1040px)') {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setWide(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return wide;
}

/* ------------------------------------------------------------------ the section chips */
export function FiberNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState('');
  const list = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const line = 150;
      let cur = '';
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= line) cur = it.id;
      }
      setActive(cur);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, [items]);

  // keep the current chip in view on a phone
  useEffect(() => {
    const box = list.current;
    const chip = box?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!box || !chip || box.scrollWidth <= box.clientWidth) return;
    box.scrollTo({ left: chip.offsetLeft - (box.clientWidth - chip.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
  }, [active, reduce]);

  return (
    <nav className={s.nav} aria-label="Sections of the guide">
      <div className={s.navIn} ref={list}>
        {items.map((it) => (
          <a key={it.id} href={`#${it.id}`} data-id={it.id} className={s.chip} aria-current={active === it.id ? 'true' : undefined} onClick={() => setActive(it.id)}>
            {it.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ the food chart and "Build your day" */
type Sort = 'most' | 'az';
type Picks = Record<string, number>;
const KEY = 'hc-fiber-day';
const trackable = (f?: Food): f is Food & { total: NonNullable<Food['total']> } => !!f && f.total != null;

function readPicks(): Picks {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== 'object') return {};
    const out: Picks = {};
    for (const [id, n] of Object.entries(data as Record<string, unknown>)) {
      if (typeof n === 'number' && n > 0 && n < 100 && trackable(allFoods.find((f) => f.id === id))) out[id] = Math.floor(n);
    }
    return out;
  } catch {
    return {};
  }
}
function savePicks(p: Picks) {
  try { window.localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode: the day still works, unsaved */ }
}

// lowercase, no accents: "Brussels" finds "brussels", "puree" finds "purée"
const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function FoodChart() {
  const [tab, setTab] = useState(foodGroups[0].id);
  const [sort, setSort] = useState<Sort>('most');
  const [picks, setPicks] = useState<Picks>({});
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const wide = useWide();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => { setPicks(readPicks()); }, []);

  const change = useCallback((id: string, by: number) => {
    setPicks((prev) => {
      const n = Math.max(0, (prev[id] ?? 0) + by);
      const next = { ...prev };
      if (n) next[id] = n; else delete next[id];
      savePicks(next);
      return next;
    });
  }, []);
  const reset = () => { setPicks({}); savePicks({}); };

  const group = foodGroups.find((g) => g.id === tab) ?? foodGroups[0];
  // search: across every group, by food name or note ("kiwi", "beans", "constipation"); accents and case ignored
  const query = norm(q.trim());
  const foods = useMemo(() => {
    const list = query ? allFoods.filter((f) => norm(f.name).includes(query) || norm(f.note ?? '').includes(query)) : [...group.foods];
    if (sort === 'az') return list.sort((a, b) => a.name.localeCompare(b.name));
    return list.sort((a, b) => (b.total == null ? -1 : a.total == null ? 1 : mid(b.total) - mid(a.total)));
  }, [group, sort, query]);

  const chosen = allFoods.filter((f) => picks[f.id] && trackable(f));
  const total = round(chosen.reduce((sum, f) => sum + low(f.total) * picks[f.id], 0));
  const servings = chosen.reduce((sum, f) => sum + picks[f.id], 0);
  const reached = total >= GOAL.min;
  const over = total > GOAL.max;

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const j = (i + d + foodGroups.length) % foodGroups.length;
    setTab(foodGroups[j].id);
    tabs.current[j]?.focus();
  };

  const status = over
    ? `${total} g today. Above ${GOAL.max} g.`
    : reached
      ? `${total} g today. Goal reached.`
      : `${total} of ${GOAL.min} g today`;

  return (
    <div className={s.chart}>
      <div className={s.chartMain}>
        <div className={s.search}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a food: kiwi, beans, oats…"
            aria-label="Search the food chart"
            aria-controls="fiber-foods"
            enterKeyHint="search"
            autoComplete="off"
          />
          {q && <button type="button" className={s.searchX} aria-label="Clear the search" onClick={() => setQ('')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" /></svg></button>}
        </div>

        <div className={s.tabs} role="tablist" aria-label="Food groups" data-dim={query ? 'true' : undefined}>
          {foodGroups.map((g, i) => (
            <button
              key={g.id}
              ref={(el) => { tabs.current[i] = el; }}
              role="tab"
              id={`tab-${g.id}`}
              aria-selected={tab === g.id}
              aria-controls="fiber-foods"
              tabIndex={tab === g.id ? 0 : -1}
              className={s.tab}
              onClick={() => { setTab(g.id); setQ(''); }}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              <span>{g.label}</span>
              <small>{g.foods.length}</small>
            </button>
          ))}
        </div>

        <div className={s.tools}>
          <div className={s.sort} role="group" aria-label="Sort the foods">
            <button type="button" aria-pressed={sort === 'most'} onClick={() => setSort('most')}>Most fiber first</button>
            <button type="button" aria-pressed={sort === 'az'} onClick={() => setSort('az')}>A to Z</button>
          </div>
          <p className={s.legend} aria-hidden="true">
            <span><i className={s.dotSol} />Soluble</span>
            <span><i className={s.dotIns} />Insoluble</span>
          </p>
        </div>

        {query && (
          <p className={s.found} aria-live="polite">
            {foods.length ? `${foods.length} ${foods.length === 1 ? 'food' : 'foods'} for “${q.trim()}”` : `No food matches “${q.trim()}”. Try apple, beans or oats.`}
          </p>
        )}
        {foods.length > 0 && (
          <ul className={s.rows} id="fiber-foods" role={query ? undefined : 'tabpanel'} aria-labelledby={query ? undefined : `tab-${group.id}`} aria-label={query ? 'Search results' : undefined}>
            {foods.map((f) => (
              <FoodRow key={f.id} f={f} count={picks[f.id] ?? 0} onAdd={() => change(f.id, 1)} />
            ))}
          </ul>
        )}
        <p className={s.fine}>Grams of fiber per serving, from my chart. Bars share one scale: the longest is {MAX_GRAMS} g. A range counts its low end in your day.</p>
      </div>

      <aside className={s.tracker} aria-label="Build your day" data-open={open || wide ? 'true' : undefined}>
        <div className={s.trackCard}>
          {wide ? (
            <div className={s.trackHead}>
              <p className={s.trackTitle}>Build your day</p>
              <TrackStatus total={total} reached={reached} over={over} status={status} />
            </div>
          ) : (
            <button type="button" className={s.trackHead} aria-expanded={open} aria-controls="fiber-day" onClick={() => setOpen((o) => !o)}>
              <TrackStatus total={total} reached={reached} over={over} status={status} />
              <span className={s.trackMore}>
                {servings ? `${servings} ${servings === 1 ? 'pick' : 'picks'}` : 'How it works'}
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" /></svg>
              </span>
            </button>
          )}
          <div className={s.tray} id="fiber-day" hidden={!(open || wide)}>
            {chosen.length === 0 ? (
              <p className={s.trayEmpty}>Tap <b className={s.plusMark} aria-hidden="true">+</b> on a food to add one serving. Your goal is {GOAL.min} to {GOAL.max} g a day.</p>
            ) : (
              <ul className={s.picks}>
                {chosen.map((f) => (
                  <li key={f.id}>
                    <span className={s.pickName}>
                      <b>{f.name}</b>
                      <small>{picks[f.id]} × {round(low(f.total))} g</small>
                    </span>
                    <span className={s.pickG}>{round(low(f.total) * picks[f.id])} g</span>
                    <span className={s.stepper}>
                      <button type="button" onClick={() => change(f.id, -1)} aria-label={`Remove 1 serving of ${f.name}`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" /></svg>
                      </button>
                      <button type="button" onClick={() => change(f.id, 1)} aria-label={`Add 1 serving of ${f.name}`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12" /></svg>
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className={s.trayTip}>
              <Icon name="drop" />
              <span>New to fiber? Add a few grams a week, and drink more water as you go.</span>
            </p>
            {chosen.length > 0 && (
              <button type="button" className={s.reset} onClick={reset}>Start over</button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function TrackStatus({ total, reached, over, status }: { total: number; reached: boolean; over: boolean; status: string }) {
  return (
    <span className={s.trackStatus}>
      <span className={s.trackLine} aria-live="polite">
        <span className="sr-only">{status}</span>
        <span aria-hidden="true">
          <b className={s.trackNum}>{total}</b>
          {over ? (
            <span className={s.trackOf}> g today <em className={`${s.reached} ${s.over}`}>Above {GOAL.max} g</em></span>
          ) : reached ? (
            <span className={s.trackOf}> g today <em className={s.reached}><Icon name="check" />Goal reached</em></span>
          ) : (
            <span className={s.trackOf}> of {GOAL.min} g today</span>
          )}
        </span>
      </span>
      <span className={s.meter} aria-hidden="true">
        <i style={{ width: pct(total, GOAL.max) }} />
        <em style={{ left: pct(GOAL.min, GOAL.max) }} />
      </span>
    </span>
  );
}

function FoodRow({ f, count, onAdd }: { f: Food; count: number; onAdd: () => void }) {
  const hasSplit = f.soluble != null && f.insoluble != null;
  const sol = mid(f.soluble);
  const ins = mid(f.insoluble);
  return (
    <li className={s.row} data-picked={count ? 'true' : undefined}>
      <div className={s.rowName}>
        <b>{f.name}</b>
        <span>{f.serving}</span>
      </div>

      {f.total != null ? (
        <>
          <p className={s.rowTotal}>
            <strong>{fmt(f.total)}</strong>
            <small> g</small>
          </p>
          <span className={s.bar} aria-hidden="true">
            <i style={{ width: pct(low(f.total), MAX_GRAMS) }} />
            {high(f.total) > low(f.total) && <i className={s.barRange} style={{ left: pct(low(f.total), MAX_GRAMS), width: pct(high(f.total) - low(f.total), MAX_GRAMS) }} />}
          </span>
        </>
      ) : null}

      {hasSplit ? (
        <div className={s.split}>
          <span className={s.solN}>{fmt(f.soluble!)} g<span className="sr-only"> soluble,</span></span>
          <span className={s.splitBar} aria-hidden="true">
            <i className={s.sol} style={{ flexGrow: Math.max(sol, 0.02) }} />
            <i className={s.ins} style={{ flexGrow: Math.max(ins, 0.02) }} />
          </span>
          <span className={s.insN}>{fmt(f.insoluble!)} g<span className="sr-only"> insoluble</span></span>
        </div>
      ) : f.total != null ? (
        <div className={s.split}>
          <span className={s.splitNone}>Soluble and insoluble split not listed</span>
        </div>
      ) : null}

      {f.note && <p className={s.note}>{f.note}</p>}

      {f.total != null ? (
        <button type="button" className={s.add} onClick={onAdd} aria-label={`Add ${f.name}, ${fmt(f.total)} g, to my day${count ? `. ${count} added` : ''}`}>
          {count ? <span className={s.addCount}>{count}</span> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12" /></svg>}
        </button>
      ) : (
        <span className={s.addOff} aria-hidden="true" />
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ the supplements, picked by goal */
export function SupplementPicker() {
  const [goal, setGoal] = useState<string | null>(null);
  const g = goals.find((x) => x.id === goal);
  const picks: readonly string[] = g ? g.picks : [];
  const list = g ? [...supplements].sort((a, b) => Number(picks.includes(b.id)) - Number(picks.includes(a.id))) : supplements;

  return (
    <div className={s.picker}>
      <div className={s.goalBox}>
        <p className={s.goalQ} id="goal-q">Pick by goal</p>
        <div className={s.goalChips} role="group" aria-labelledby="goal-q">
          {goals.map((x) => (
            <button key={x.id} type="button" aria-pressed={goal === x.id} onClick={() => setGoal(goal === x.id ? null : x.id)}>
              {x.label}
            </button>
          ))}
        </div>
        <p className={s.goalA} aria-live="polite" data-caution={g && 'caution' in g ? 'true' : undefined}>
          {g ? (
            <>
              <Icon name={'caution' in g ? 'alert' : 'check'} />
              <span>{g.line}</span>
            </>
          ) : (
            <span className={s.goalHint}>Tap a goal to see which supplement fits it.</span>
          )}
        </p>
      </div>

      <ul className={s.supps}>
        {list.map((sp) => {
          const hit = picks.includes(sp.id);
          const state = g ? (hit ? ('caution' in g ? 'caution' : 'match') : 'dim') : undefined;
          return (
            <li key={sp.id} className={s.supp} data-state={state}>
              <div className={s.suppHd}>
                <h4>{sp.name}</h4>
                {sp.badge && <span className={s.badge}>{sp.badge}</span>}
              </div>
              {sp.what && <p className={s.suppWhat}>{sp.what}</p>}
              <ul className={s.traits} aria-label="Type">
                {sp.traits.map((t) => <li key={t}>{t}</li>)}
              </ul>
              {(sp.good || sp.watch) && (
                <ul className={s.suppLines}>
                  {sp.good?.map((l) => <li key={l} className={s.good}><Icon name="check" /><span>{l}</span></li>)}
                  {sp.watch?.map((l) => <li key={l} className={s.watch}><Icon name="alert" /><span>{l}</span></li>)}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
