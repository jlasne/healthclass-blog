// The 2027 roadmap (/roadmap, behind the team password). Every month: a big update (a new program or an extension of
// one), a live with Dr. Dana, and in some months a micro update (a new language). Promotions are a % off or a
// challenge on the big dates of the year. Feats (a live or a post with a guest) can be added on any day. Only the
// live is fixed: the updates are placed in the free days around the live, the promotions and the feats.
// Program order follows Dr. Dana's call (Nov 2026): prolapse, then hormones and menopause, then the rest.

export type Plan = {
  month: number; // 0 = January
  theme: string;
  big: { name: string; line: string };
  micro?: { name: string; line: string }; // a new language: Spanish, Portuguese, French
  live: string; // the live's topic, tied to the big update
};

export const YEAR = 2027;

export const PLANS: Plan[] = [
  { month: 0, theme: 'Start with what women ask most', big: { name: 'Prolapse', line: 'Support for a heavy, dragging feeling.' }, live: 'Prolapse: your questions' },
  { month: 1, theme: 'Hormones and menopause', big: { name: 'Hormones and menopause', line: 'Keep your strength as hormones change.' }, live: 'Menopause and the bladder' },
  { month: 2, theme: 'Bladder safety, part 1', big: { name: 'Bladder safety: recurrent UTIs', line: 'For UTIs that keep coming back: what helps, and when to see a urologist.' }, micro: { name: 'Spanish', line: 'The whole app in Spanish.' }, live: 'UTIs that keep coming back' },
  { month: 3, theme: 'Bladder safety, part 2', big: { name: 'Bladder safety: when it is not an infection', line: 'Symptoms without an infection: what to watch for, and the next steps.' }, live: 'When it is not a UTI' },
  { month: 4, theme: 'For moms to be', big: { name: 'Pregnancy: prepare and protect', line: 'Protect your pelvic floor and prepare for delivery.' }, live: 'Pregnancy: protect and prepare' },
  { month: 5, theme: 'After the baby', big: { name: 'Postpartum: rehab after delivery', line: 'Rebuild after birth, at your pace.' }, micro: { name: 'Portuguese', line: 'The whole app in Portuguese.' }, live: 'After the baby: what is normal' },
  { month: 6, theme: 'Summer and sport', big: { name: 'Run and jump', line: 'Leak-free running, jumping and lifting.' }, live: 'Sport without leaks' },
  { month: 7, theme: 'Urge control', big: { name: 'Sudden urges', line: 'Calm the urge wave, train the bladder.' }, live: 'Overactive bladder: your questions' },
  { month: 8, theme: 'Back to routine', big: { name: 'Desk and posture', line: 'Unclench, sit well, move every hour.' }, micro: { name: 'French', line: 'The whole app in French.' }, live: 'Sitting all day: what it does' },
  { month: 9, theme: 'World Menopause Day', big: { name: 'Hormones and menopause, level 2', line: 'The next step of the February program.' }, live: 'Menopause: round 2' },
  { month: 10, theme: 'Bladder Health Month', big: { name: 'Prolapse, level 2', line: 'The next step of the January program.' }, live: 'Prolapse: round 2' },
  { month: 11, theme: 'Gift of health', big: { name: 'Year 2: Advanced', line: 'Harder holds and faster flicks for graduates.' }, live: 'Your year, and what comes next' },
];

// promotions: a % off or a challenge, on the key dates of the year (US dates for 2027)
export type Promo = { name: string; start: string; end: string; offer: string; kind: 'off' | 'challenge'; line: string };
export const PROMOS: Promo[] = [
  { name: 'New Year challenge', start: '2027-01-01', end: '2027-01-15', kind: 'challenge', offer: 'Challenge', line: '1 session a day for 15 days. Share your streak.' },
  { name: "Valentine's Day", start: '2027-02-08', end: '2027-02-14', kind: 'off', offer: '20% off', line: 'The yearly plan.' },
  { name: "Mother's Day and Women's Health Week", start: '2027-05-03', end: '2027-05-15', kind: 'off', offer: '25% off', line: "Gift a yearly plan. Mother's Day is May 9." },
  { name: 'World Continence Week', start: '2027-06-21', end: '2027-06-27', kind: 'challenge', offer: 'Challenge', line: '7 days, 7 sessions, with the leaks letters.' },
  { name: 'Back to school', start: '2027-08-30', end: '2027-09-12', kind: 'challenge', offer: 'Challenge', line: '14 days to build a September routine.' },
  { name: 'World Menopause Day', start: '2027-10-14', end: '2027-10-20', kind: 'off', offer: '20% off', line: 'October 18, with the menopause level 2.' },
  { name: 'Black Friday', start: '2027-11-22', end: '2027-11-29', kind: 'off', offer: '40% off', line: 'The yearly plan. Thanksgiving is November 25.' },
  { name: 'Holiday gift', start: '2027-12-10', end: '2027-12-24', kind: 'off', offer: '30% off', line: 'Gift a year of the class.' },
];

// feats: a live or a post with a guest. Confirmed ones go here; the page can add more (kept in its link).
export type Feat = { date: string; who: string };
export const FEATS: Feat[] = [];

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type WeekRule = 'last' | '4' | '3';

// the day of the live: the last (or 3rd, 4th) <weekday> of the month
export function liveDay(month: number, weekday: number, rule: WeekRule, year = YEAR) {
  if (rule === 'last') {
    const d = new Date(year, month + 1, 0);
    while (d.getDay() !== weekday) d.setDate(d.getDate() - 1);
    return d;
  }
  const d = new Date(year, month, 1);
  while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
  d.setDate(d.getDate() + 7 * (Number(rule) - 1));
  return d;
}

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const inPromo = (d: Date) => PROMOS.find((p) => key(d) >= p.start && key(d) <= p.end) ?? null;

// The live is fixed (moved a week earlier, up to 3 times, if it lands on a promotion week). The big update and the
// micro update then take the free weekdays (Tue to Thu) that spread the month most evenly: the widest smallest gap
// between the last live (about 3 days before the 1st), the updates, the feats, the promotion starts and the live. Days inside a promotion count against a spot, Tuesdays for it.
export function moments(month: number, weekday: number, rule: WeekRule, feats: Feat[] = [], hasMicro = false, year = YEAR) {
  let live = liveDay(month, weekday, rule, year);
  let movedFor: string | null = null;
  for (let i = 0; i < 3; i++) {
    const p = inPromo(live);
    if (!p) break;
    movedFor = p.name;
    live = new Date(year, month, live.getDate() - 7);
  }
  const last = live.getDate();
  const featDays = feats.map((f) => new Date(f.date + 'T12:00')).filter((d) => d.getFullYear() === year && d.getMonth() === month).map((d) => d.getDate());
  const promoStarts = PROMOS.map((p) => new Date(p.start + 'T12:00')).filter((d) => d.getFullYear() === year && d.getMonth() === month).map((d) => d.getDate());
  const at = (n: number) => new Date(year, month, n);
  const cands: number[] = [];
  for (let n = 1; n <= last - 2; n++) if ([2, 3, 4].includes(at(n).getDay()) && !featDays.includes(n)) cands.push(n);
  const score = (picks: number[]) => {
    const pts = [-3, last, ...featDays, ...promoStarts, ...picks].sort((x, y) => x - y);
    let min = Infinity;
    let sq = 0;
    for (let i = 1; i < pts.length; i++) if (pts[i] <= last) { const g = pts[i] - pts[i - 1]; min = Math.min(min, g); sq += g * g; }
    return min - 0.002 * sq - 3 * picks.filter((n) => inPromo(at(n))).length + 0.1 * picks.filter((n) => at(n).getDay() === 2).length;
  };
  let best: number[] = [];
  let top = -Infinity;
  for (const b of cands) {
    if (!hasMicro) { const v = score([b]); if (v > top) { top = v; best = [b]; } continue; }
    for (const m of cands) { if (m === b) continue; const v = score([b, m]); if (v > top) { top = v; best = [b, m]; } }
  }
  const big = at(best[0] ?? Math.max(1, last - 10));
  const micro = hasMicro && best[1] ? at(best[1]) : null;
  return { big, micro, live, movedFor };
}
