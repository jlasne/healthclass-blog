// Health Class blog · one place for the facts and links the pages share. Fill the empty values before launch
// (npm run check lists them). Every page reads from here, so a change lands everywhere at once.

export const site = {
  url: 'https://www.healthclass.app',
  // the magic link: healthclass.app (no www) sends phones to their store, computers to the home page (see proxy.ts)
  magicHost: 'healthclass.app',
  name: 'Health Class',
  appName: 'Pelvic Health Class: for Women',
  appShort: 'Pelvic Health Class',
  tagline: 'Your pelvic floor, taught by a urologist.',
  description:
    'Short letters on bladder leaks, Kegels and the pelvic floor from Dr. Dana Kivlin, a board-certified urologist. The blog of Pelvic Health Class: for Women.',
  locale: 'en_US',
  email: 'hello@healthclass.app',
  // the app's store pages. Empty until the listings go live: the buttons then say "Coming soon" and offer the letter.
  appStoreUrl: '',
  playStoreUrl: '',
  // the store IDs, for the iPhone Smart App Banner and the Play deep link (e.g. '6740000000', 'app.healthclass')
  appStoreId: '',
  playPackage: 'app.healthclass',
  price: { weekly: '$7.99', annual: '$79.99', trialDays: 7 },
  newsletter: {
    name: 'Class Notes',
    cadence: 'Every Wednesday and Sunday',
    promise: '1 idea, 1 exercise and 1 reader question, in a 3-minute read.',
  },
  qa: {
    name: 'Ask Dr. Dana',
    cadence: 'Once a month, live',
    length: '45 minutes',
    // the next live when Convex has none scheduled (ISO, Eastern time). Set the real hour with Dana.
    next: '2026-11-30T19:00:00-05:00',
    // Dana's clip on /live: replace with her own 10-second "next live" video (vertical 4:5, silent captions burnt in)
    clip: '/media/dana/insta.mp4',
  },
} as const;

// Dr. Dana Kivlin. Only facts from public profiles; Dana confirms each one before launch.
export const dana = {
  name: 'Dr. Dana Kivlin',
  fullName: 'Dana Kivlin',
  shortName: 'Dr. Dana',
  firstName: 'Dana',
  role: 'Board-certified urologist',
  practice: 'Middlesex Health',
  practiceCity: 'Middletown, Connecticut',
  medicalSchool: 'University of New England College of Osteopathic Medicine',
  medicalSchoolYear: 2011,
  board: 'Board certified in Urology',
  photo: '/media/dana/portrait.webp',
  avatar: '/media/dana/avatar.webp',
  hero: '/media/dana/hero.webp',
  socials: [
    { label: 'Instagram', handle: '@dr_hapee_bladder', url: 'https://www.instagram.com/dr_hapee_bladder/' },
    { label: 'Middlesex Health', handle: 'Doctor profile', url: 'https://middlesexhealth.org/find-a-doctor/dana-u-kivlin-do' },
    { label: 'ResearchGate', handle: 'Research profile', url: 'https://www.researchgate.net/profile/Dana-Kivlin' },
  ],
  // podcasts Dana joins: add one entry per episode as they air ({ show, episode, date: 'YYYY-MM-DD', url })
  podcasts: [] as { show: string; episode: string; date: string; url: string }[],
};

export const nav = [
  { href: '/letters', label: 'Letters' },
  { href: '/live', label: 'Live' },
  { href: '/dana', label: 'Dr. Dana' },
] as const;

export const programs = [
  { name: 'Pelvic Floor 101', tone: 'rosy', status: 'live', line: 'Find, lift and let go of your pelvic floor in 6 weeks.' },
  { name: 'Bladder leaks', tone: 'plum', status: 'live', line: 'Fewer leaks when you laugh, sneeze or run.' },
  { name: 'Postpartum', tone: 'blush', status: 'soon', line: 'Rebuild after birth, at your pace.' },
  { name: 'Prolapse', tone: 'sky', status: 'soon', line: 'Support for a heavy, dragging feeling.' },
  { name: 'Menopause', tone: 'rosy', status: 'soon', line: 'Keep your strength as hormones change.' },
  { name: 'Intimacy', tone: 'plum', status: 'soon', line: 'Comfort and feeling, with a relaxed floor.' },
] as const;

export const absoluteUrl = (p = '/') => new URL(p, site.url).toString();
