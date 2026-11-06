// What the Health Class app is today, in one place. The app changes over time (classes, features, pricing): when it
// does, change the value here and set `checked` to that day. Resource pages write {app.price}, {app.phones}, ...
// in their front matter and body, so every Side by side page updates at once, with its "updated" date and the
// "Health Class facts checked on" line. Source of truth: the app itself (jlasne/healthclass: www/js/content-*.js
// for the classes, README for the phones). The price follows `site.price` in lib/site.ts, which the founders keep
// equal to the app's plans: a change there reaches every comparison by itself (then set `checked` to that day).
import { site } from './site';

// "$11.99 a month or $99.99 a year, with 3 free days": built from whatever plans site.price lists
function priceLine() {
  const p = site.price as Record<string, string | number | undefined>;
  const per: [string, string][] = [['weekly', 'a week'], ['monthly', 'a month'], ['annual', 'a year']];
  const plans = per.filter(([k]) => typeof p[k] === 'string' && p[k]).map(([k, unit]) => `${p[k]} ${unit}`);
  if (!plans.length) return 'Subscription, price shown in the app. Week 1 is open to everyone';
  const trial = typeof p.trialDays === 'number' && p.trialDays > 0 ? `, with ${p.trialDays} free days` : '';
  return `${plans.join(' or ')}${trial}. Week 1 is open to everyone`;
}

export const appFacts = {
  checked: '2026-11-06',
  maker: 'Dr. Dana Kivlin, board-certified urologist',
  price: priceLine(),
  trial: 'Week 1 is open to everyone',
  phones: 'iPhone (iOS 17 or later) and Android',
  classes: '2 classes of 6 weeks: Pelvic Floor 101 and Bladder leaks',
  classNames: 'Pelvic Floor 101 and Bladder leaks',
  daily: '1 guided exercise of 5 to 10 minutes, with cues like "Breathe out, then lift"',
  minutes: '5 to 10 minutes a day',
  learning: '1 short lesson a week',
  tracking: 'Daily check-ins and your progress, day by day',
  professional: 'A monthly live Q&A with Dr. Dana for members',
  device: 'No device: you train with your own muscles',
  languages: 'English',
  privacy: 'Your health answers and your log stay on your phone. No ads.',
  after: 'A routine on the days you pick, after week 6',
} as const;

export type AppFact = keyof typeof appFacts;

// "{app.price}" becomes the value above; an unknown key stays as it is (npm run check:resources flags it)
export const fillFacts = (s: string) => s.replace(/\{app\.([a-zA-Z]+)\}/g, (m, k: string) => (k in appFacts ? String(appFacts[k as AppFact]) : m));
export const usesFacts = (s: string) => /\{app\.[a-zA-Z]+\}/.test(s);
