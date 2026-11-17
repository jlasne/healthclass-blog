// The 2027 roadmap (/roadmap, hidden): every month ends on 3 moments that keep the app alive, plus the year's
// promotions. The live's day is a rule (e.g. the last Thursday); the micro update and the new program are placed
// from it, so moving Dr. Dana's live moves the whole month. Names are proposals until the team confirms them.

export type Plan = {
  month: number; // 0 = January
  theme: string;
  program: { name: string; line: string };
  update: { name: string; line: string };
  live: string; // the live's topic, tied to the program
};

export const YEAR = 2027;

export const PLANS: Plan[] = [
  { month: 0, theme: 'New year, new habit', program: { name: 'Core by level', line: 'Dead bugs, bridges and planks in 3 levels, safe for the pelvic floor.' }, update: { name: 'Spanish', line: 'The whole app in Spanish.' }, live: 'Your first questions, and how to start the year' },
  { month: 1, theme: 'Love your body', program: { name: 'Intimacy', line: 'Comfort and feeling, with a relaxed floor.' }, update: { name: 'Streak repair', line: 'Miss a day, keep your streak once a week.' }, live: 'Intimacy and the pelvic floor' },
  { month: 2, theme: 'Spring back to sport', program: { name: 'Run and jump', line: 'Leak-free running, jumping and lifting.' }, update: { name: 'Apple Health and Google Fit', line: 'Sessions saved as mindful minutes.' }, live: 'Sport without leaks' },
  { month: 3, theme: 'Urge control', program: { name: 'Sudden urges', line: 'Calm the urge wave, train the bladder.' }, update: { name: 'Home screen widget', line: "Today's session and streak, one tap away." }, live: 'Overactive bladder: your questions' },
  { month: 4, theme: 'For moms', program: { name: 'Postpartum', line: 'Rebuild after birth, at your pace.' }, update: { name: 'Partner gift', line: 'Gift a plan to a friend or a new mom.' }, live: 'After the baby: what is normal' },
  { month: 5, theme: 'World Continence Week', program: { name: 'Pregnancy', line: 'Train before the baby, trimester by trimester.' }, update: { name: 'French', line: 'The whole app in French.' }, live: 'Leaks: common, and fixable' },
  { month: 6, theme: 'Summer, travel and sport', program: { name: 'Travel kit', line: '5-minute sessions for planes, hotels and road trips.' }, update: { name: 'Offline mode', line: 'Every session works without a signal.' }, live: 'Bladder on vacation' },
  { month: 7, theme: 'Gut and bowel', program: { name: 'Fiber and the gut', line: 'From the fiber guide: 25 to 35 g a day, made easy.' }, update: { name: 'Fiber tracker', line: 'The guide’s "build your day" inside the app.' }, live: 'Constipation and the pelvic floor' },
  { month: 8, theme: 'Back to routine', program: { name: 'Desk and posture', line: 'Unclench, sit well, move every hour.' }, update: { name: 'Smarter reminders', line: 'Reminders that learn when you train.' }, live: 'Sitting all day: what it does' },
  { month: 9, theme: 'Menopause month', program: { name: 'Menopause', line: 'Keep your strength as hormones change.' }, update: { name: 'Dark mode', line: 'Evening sessions, easier on the eyes.' }, live: 'Menopause and the bladder' },
  { month: 10, theme: 'Bladder Health Month', program: { name: 'Prolapse', line: 'Support for a heavy, dragging feeling.' }, update: { name: 'Progress report', line: 'A monthly summary to share with your doctor.' }, live: 'Prolapse: your options' },
  { month: 11, theme: 'Gift of health', program: { name: 'Year 2: Advanced', line: 'Harder holds and faster flicks for graduates.' }, update: { name: 'Year in review', line: 'Your 2027 in sessions, minutes and streaks.' }, live: 'Your year, and what comes next' },
];

// promotions: key moments of the year (US dates for 2027)
export type Promo = { name: string; start: string; end: string; line: string };
export const PROMOS: Promo[] = [
  { name: 'New Year resolution', start: '2027-01-01', end: '2027-01-15', line: 'New habit, new year: the yearly plan at its best price.' },
  { name: "Valentine's Day", start: '2027-02-08', end: '2027-02-14', line: 'With the Intimacy class.' },
  { name: "Mother's Day and Women's Health Week", start: '2027-05-03', end: '2027-05-15', line: "Mother's Day is May 9; Women's Health Week starts that day. Gift a plan." },
  { name: 'World Continence Week', start: '2027-06-21', end: '2027-06-27', line: 'Late June: the leaks letters and the quiz, everywhere.' },
  { name: 'Back to school', start: '2027-08-30', end: '2027-09-12', line: 'A fresh routine for September.' },
  { name: 'World Menopause Day', start: '2027-10-14', end: '2027-10-20', line: 'October 18, with the Menopause class.' },
  { name: 'Black Friday', start: '2027-11-22', end: '2027-11-29', line: 'Thanksgiving is November 25, Black Friday November 26. Bladder Health Month all November.' },
  { name: 'Holiday gift', start: '2027-12-10', end: '2027-12-24', line: 'Gift a year of the class.' },
];

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

// The 3 moments spread evenly over the month: the update in week 1 to 2, the program mid-month, the live at the end.
// The live never sits on a promotion week: it moves a week earlier until it is free (e.g. Thanksgiving, Black Friday).
export type Spacing = 'even' | 'compact';
const inPromo = (d: Date) => {
  const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return PROMOS.find((p) => k >= p.start && k <= p.end) ?? null;
};
export function moments(month: number, weekday: number, rule: WeekRule, spacing: Spacing, year = YEAR) {
  let live = liveDay(month, weekday, rule, year);
  let movedFor: string | null = null;
  for (let i = 0; i < 3; i++) {
    const p = inPromo(live);
    if (!p) break;
    movedFor = p.name;
    live = new Date(live.getFullYear(), live.getMonth(), live.getDate() - 7);
  }
  const back = (n: number) => new Date(live.getFullYear(), live.getMonth(), live.getDate() - n);
  const [u, pr] = spacing === 'even' ? [20, 10] : [7, 3];
  // the update stays in the live's month (a moved live would push it into the month before)
  const first = new Date(live.getFullYear(), live.getMonth(), 1);
  const update = back(u) < first ? first : back(u);
  return { update, program: back(pr), live, movedFor };
}
