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
  email: 'dana@healthclass.app',
  // the app's store pages. Empty until the listings go live: the buttons then say "Coming soon" and offer the letter.
  appStoreUrl: '',
  playStoreUrl: '',
  // the store IDs, for the iPhone Smart App Banner and the Play deep link (e.g. '6740000000', 'app.healthclass')
  appStoreId: '',
  playPackage: 'app.healthclass',
  // App Store campaign links: the provider token (pt) from App Store Connect › Analytics › Acquisition › Campaign Link
  // Generator. Empty until the app is live (Apple shows Analytics only then): links still work, Apple just does not count them.
  appStorePt: '',
  price: { monthly: '$11.99', annual: '$99.99', trialDays: 3 },
  newsletter: {
    name: 'Class Notes',
    cadence: 'Every Wednesday and Sunday',
    promise: '1 idea, 1 exercise and 1 reader question, in a 3-minute read.',
  },
  qa: {
    name: 'Ask Dr. Dana',
    cadence: 'Once a month, live',
    length: '45 minutes',
    // the next live's month while its exact day is still open: the site and the app say "in December", no date.
    // Set it to '' once the date is set (in Convex, or in next below).
    month: 'December',
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
  // icon: an Icon name, or 'face' for Dr. Dana's round photo
  { href: '/letters', label: 'Letters', icon: 'mail' },
  { href: '/resources', label: 'Resources', icon: 'book' },
  { href: '/live', label: 'Live', icon: 'video' },
  { href: '/dana-kivlin', label: 'Dr. Dana', icon: 'face' },
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

// The magic link's short codes: healthclass.app/<code> sends a phone to its store and a computer to the site, and tells
// the stores and PostHog where she came from. Add a channel = add a line. Codes win over pages on the bare domain only.
export const linkSources: Record<string, string> = {
  ig: 'instagram',
  'ig-story': 'instagram-story',
  nl: 'newsletter',
  blog: 'blog',
  web: 'website',
  dana: 'dr-dana',
  pod: 'podcast',
};
