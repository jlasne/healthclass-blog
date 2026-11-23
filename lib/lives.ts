// Dr. Kivlin's promise (November 2026): a live every month of 2027, and each member gets the replays of every live since
// her first plan day, a gap included. Lives left: 12 until January 2027, then the months from the next live (else this
// month) to December, New York time; 0 after 2027, and the lines go back to plain "Live with Dr. Kivlin".
// The app counts the same way (jlasne/healthclass, www/js/app.js livesLeft).
const ym = (t: number) => {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric' }).formatToParts(new Date(t));
  return { y: Number(p.find((x) => x.type === 'year')?.value), m: Number(p.find((x) => x.type === 'month')?.value) - 1 };
};

export function livesLeft(next?: number | null, now = Date.now()) {
  const t = ym(now);
  if (t.y < 2027) return 12;
  if (t.y > 2027) return 0;
  const n = next && next > now ? ym(next) : null;
  return 12 - (n && n.y === 2027 ? n.m : t.m);
}

export const liveLine = (n: number) => (n ? 'A live with Dr. Kivlin every month of 2027' : 'Live with Dr. Kivlin');
export const livesLeftLine = (n: number) => (n ? `${n} ${n === 1 ? 'live' : 'lives'} left. Join today: every replay from today.` : '');
