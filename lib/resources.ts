import 'server-only';
// The resources: one .mdx file per page in content/resources/<family>/<slug>.mdx, in 4 families (tools, compare,
// classes, made-for-you). Drop a new file in a family folder and it shows up everywhere on the next build: its
// family page, /resources, the sitemap and llms.txt. A future `date` keeps it hidden until that day (hourly re-render).
// Every page is written by the Health Class team, teaches and never diagnoses; the template adds the doctor note.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { Pose } from '@/components/Cat';
import type { Faq, Source } from './articles';
import { appFacts, fillFacts, usesFacts } from './app-facts';

export type Tone = 'rosy' | 'plum' | 'blush' | 'sky';
export type FamilyId = 'tools' | 'compare' | 'classes' | 'made-for-you';

export type Family = {
  id: FamilyId;
  name: string;          // the name people see
  h1: string;            // the family page title, with *one* word in italics
  line: string;          // one line under it
  seoTitle: string;
  description: string;
  cat: Pose;
  tone: Tone;
  icon: string;
};

export const FAMILIES: Record<FamilyId, Family> = {
  tools: {
    id: 'tools',
    name: 'Free tools',
    h1: 'Free tools for your *pelvic floor*.',
    line: 'Quizzes, timers and charts. Your result shows on the screen. No email, no sign up.',
    seoTitle: 'Free pelvic floor tools: quizzes, Kegel timer, bladder diary',
    description: 'Free pelvic floor and bladder tools for women: a leak type quiz, a Kegel timer, a bladder diary and more. Results on screen, no email needed.',
    cat: 'think',
    tone: 'sky',
    icon: 'timer',
  },
  compare: {
    id: 'compare',
    name: 'Side by side',
    h1: 'Pelvic floor apps, *side by side*.',
    line: 'Health Class next to other apps and methods. What each one does best, with dated facts and sources.',
    seoTitle: 'Pelvic floor apps compared: Health Class vs Squeezy, Perifit, Elvie and more',
    description: 'Pelvic floor apps and methods compared side by side: price, plan, who made it, what each does best. Facts dated and sourced.',
    cat: 'selfie',
    tone: 'plum',
    icon: 'users',
  },
  classes: {
    id: 'classes',
    name: 'The classes',
    h1: 'The classes, *week by week*.',
    line: 'What each class in the app teaches, from day 1 to day 42.',
    seoTitle: 'Pelvic floor classes for women: 6-week programs, week by week',
    description: 'The pelvic floor classes in the Health Class app, week by week: Pelvic Floor 101 and Bladder leaks, plus the classes on the way.',
    cat: 'lift',
    tone: 'rosy',
    icon: 'calendar',
  },
  'made-for-you': {
    id: 'made-for-you',
    name: 'Made for you',
    h1: 'Made for *you*.',
    line: 'Your moment, your goal, and the class that fits it. Pick the one that sounds like you.',
    seoTitle: 'Pelvic floor help for your moment: sneezing, running, after birth, menopause',
    description: 'Pelvic floor help for the moment you live: leaks when you sneeze, laugh or run, after birth, in menopause. Your goal and the class that fits.',
    cat: 'cheer',
    tone: 'blush',
    icon: 'heart',
  },
};
export const FAMILY_IDS = Object.keys(FAMILIES) as FamilyId[];
export const isFamily = (f: string): f is FamilyId => (FAMILY_IDS as string[]).includes(f);

// the blocks a family adds to its pages (all optional; the template shows what the front matter gives)
export type CompareRow = { label: string; us: string; them: string };
export type Week = { title: string; line: string };
export type Resource = {
  family: FamilyId;
  slug: string;
  path: string;            // /resources/<family>/<slug>
  title: string;           // the page's h1, in the site's voice
  seoTitle: string;        // the search query, for the <title>
  description: string;     // 150 characters, for Google
  excerpt: string;         // the lede under the title
  answer: string;          // the short answer, in a box at the top
  date: string;
  updated: string;
  tone: Tone;
  cat: Pose;
  keywords: string[];
  faq: Faq[];
  sources: Source[];
  links: string[];         // other resources, as "family/slug"
  letters: string[];       // letters, as their slug
  doctor: string[];        // "See a doctor first if" lines for this page (the template adds the general note)
  cta: { title: string; line?: string };
  // tools
  tool?: string;
  // compare
  rival?: { name: string; maker?: string; url: string; checked: string };
  table?: CompareRow[];
  wins?: { them: string[]; us: string[] };
  pick?: { them: string; us: string };
  // compare, 3 sides or more ("Elvie Trainer vs Perifit", "best pelvic floor app"): Health Class is one of the sides
  sides?: { name: string; url?: string; checked?: string }[];
  rows?: { label: string; values: string[] }[];
  winsBy?: { name: string; points: string[] }[];
  pickBy?: { name: string; text: string }[];
  // classes
  status?: 'live' | 'soon';
  facts?: string[];
  weeks?: Week[];
  // made for you
  goal?: string;
  fit?: string;            // the class that fits, as "classes/slug"
  appChecked?: string;     // set when the page shows app facts ({app.*}): the day those facts were checked
  body: string;
  minutes: number;
  words: number;
};

const DIR = path.join(process.cwd(), 'content/resources');
let cache: Resource[] | null = null;

const d = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? ''));
// {app.price} and the other app facts (lib/app-facts.ts), filled in every string of the front matter
const fill = (v: unknown): unknown => (typeof v === 'string' ? fillFacts(v) : Array.isArray(v) ? v.map(fill) : v && typeof v === 'object' && !(v instanceof Date) ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)])) : v);

function load(): Resource[] {
  if (cache && process.env.NODE_ENV === 'production') return cache;
  const list: Resource[] = [];
  for (const family of FAMILY_IDS) {
    const dir = path.join(DIR, family);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const parsed = matter(raw);
      const data = fill(parsed.data) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
      const content = fillFacts(parsed.content);
      // a page that shows app facts is as fresh as those facts: a change in lib/app-facts.ts moves its updated date
      const app = usesFacts(raw) ? appFacts.checked : undefined;
      const rt = readingTime(content.replace(/<[^>]+>/g, ' '));
      const slug = f.replace(/\.mdx$/, '');
      list.push({
        family,
        slug,
        path: `/resources/${family}/${slug}`,
        title: String(data.title),
        seoTitle: String(data.seoTitle ?? data.title),
        description: String(data.description ?? ''),
        excerpt: String(data.excerpt ?? data.description ?? ''),
        answer: String(data.answer ?? ''),
        date: d(data.date),
        updated: [d(data.updated ?? data.date), app ?? ''].sort().pop() as string,
        tone: (data.tone ?? FAMILIES[family].tone) as Tone,
        cat: (data.cat ?? FAMILIES[family].cat) as Pose,
        keywords: (data.keywords ?? []) as string[],
        faq: (data.faq ?? []) as Faq[],
        sources: (data.sources ?? []) as Source[],
        links: (data.links ?? []) as string[],
        letters: (data.letters ?? []) as string[],
        doctor: (data.doctor ?? []) as string[],
        cta: (data.cta ?? { title: 'Laugh, run and jump *again*.' }) as Resource['cta'],
        tool: data.tool ? String(data.tool) : undefined,
        rival: data.rival ? { ...data.rival, checked: d(data.rival.checked) } : undefined,
        table: data.table,
        wins: data.wins,
        pick: data.pick,
        sides: data.sides ? (data.sides as { name: string; url?: string; checked?: unknown }[]).map((x) => ({ ...x, checked: x.checked ? d(x.checked) : undefined })) : undefined,
        rows: data.rows,
        winsBy: data.winsBy,
        pickBy: data.pickBy,
        status: data.status,
        facts: data.facts,
        weeks: data.weeks,
        goal: data.goal ? String(data.goal) : undefined,
        fit: data.fit ? String(data.fit) : undefined,
        appChecked: app,
        body: content,
        minutes: Math.max(1, Math.round(rt.minutes)),
        words: rt.words,
      });
    }
  }
  cache = list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
  return cache;
}

// newest first; a page dated in the future stays hidden until that day
export function getResources(family?: FamilyId): Resource[] {
  const today = new Date().toISOString().slice(0, 10);
  return load().filter((r) => r.date <= today && (!family || r.family === family));
}

export function getResource(family: string, slug: string) {
  return getResources().find((r) => r.family === family && r.slug === slug) ?? null;
}

// "family/slug" to a live page (links to pages not out yet are skipped, so a page never links to a 404)
export function resolve(ref: string) {
  const [family, slug] = ref.split('/');
  return getResource(family, slug);
}

// the links under a page: the ones it names first, then one page from each other family, then the same family
export function nextSteps(r: Resource, n = 6) {
  const named = r.links.map(resolve).filter((x): x is Resource => Boolean(x) && x!.path !== r.path);
  const seen = new Set([r.path, ...named.map((x) => x.path)]);
  const rest = getResources().filter((x) => !seen.has(x.path));
  const others = FAMILY_IDS.filter((f) => f !== r.family && !named.some((x) => x.family === f))
    .map((f) => rest.find((x) => x.family === f))
    .filter((x): x is Resource => Boolean(x));
  const same = rest.filter((x) => x.family === r.family);
  const out: Resource[] = [];
  for (const x of [...named, ...others, ...same]) if (!out.some((o) => o.path === x.path)) out.push(x);
  return out.slice(0, n);
}

// italics in a title: "Free tools for your *pelvic floor*." becomes ["Free tools for your ", <em>pelvic floor</em>, "."]
export function splitEm(s: string): { text: string; em: boolean }[] {
  return s.split(/(\*[^*]+\*)/).filter(Boolean).map((p) => (p.startsWith('*') && p.endsWith('*') ? { text: p.slice(1, -1), em: true } : { text: p, em: false }));
}
export const plain = (s: string) => s.replace(/\*/g, '');
