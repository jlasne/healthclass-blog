// Class Notes, the newsletter: the queue of issues (newsletter/issues/NN-<slug>.md) and how the next one is built.
// The cron route app/api/cron/newsletter sends one every Wednesday and Sunday at 7:00 AM Eastern through MailCheap.
// An issue goes out once: MailCheap keeps its slug, so the next run takes the next file in name order.
// The email carries no source list: it links to the issue's page on the site (/letters/<slug>), where the sources are.
// Every sent issue also lives in the /letters archive, on its own page, in the order it went out.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { Pose } from '@/components/Cat';
import { getResources } from './resources';
import { absoluteUrl } from './site';

const DIR = path.join(process.cwd(), 'newsletter', 'issues');

// the first send: Wednesday, November 18, 2026. Then Sunday, Wednesday, Sunday... (the cron's schedule).
const FIRST_SEND = Date.UTC(2026, 10, 18);
const DAY = 864e5;
export const sendDate = (index: number) => new Date(FIRST_SEND + DAY * (7 * Math.floor(index / 2) + (index % 2 ? 4 : 0))).toISOString().slice(0, 10);
const nyToday = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

export type IssueSource = { n: number; text: string; url?: string };
export type Issue = {
  file: string;
  n: number; // No. 1, 2, 3...
  slug: string;
  subject: string;
  preview: string;
  topic: string;
  cat: Pose;
  tone: 'rosy' | 'plum' | 'blush' | 'sky';
  date: string; // the day it goes out (ISO, New York)
  minutes: number;
  body: string; // the email: no sources, one link to the page
  web: string; // the page: the same letter, with source marks linking to the list
  sources: IssueSource[];
};

function parseSources(block: string): IssueSource[] {
  return block.split('\n').map((l) => /^(\d+)\.\s+(.*)$/.exec(l.trim())).filter((m): m is RegExpExecArray => Boolean(m)).map((m) => {
    // "Author. [Title](url). Journal, 2020." -> text "Author. Title. Journal, 2020." and the url
    const lm = /\[(.+?)\]\((.+?)\)/.exec(m[2]);
    return { n: Number(m[1]), text: m[2].replace(/\[(.+?)\]\((.+?)\)/, '$1'), url: lm?.[2] };
  });
}

let cache: Issue[] | null = null;
export function getIssues(): Issue[] {
  if (cache && process.env.NODE_ENV === 'production') return cache;
  if (!fs.existsSync(DIR)) return [];
  const list = fs
    .readdirSync(DIR)
    .filter((f) => /^\d+-.+\.md$/.test(f))
    .sort()
    .map((file) => ({ file, ...matter(fs.readFileSync(path.join(DIR, file), 'utf8')) }))
    .filter((r) => r.data.subject && r.content.trim())
    .map((r, index): Issue => {
      const slug = String(r.data.slug || r.file.replace(/^\d+-/, '').replace(/\.md$/, ''));
      const raw = r.content.trim();
      const [main, srcBlock = ''] = raw.split(/\n\*\*Sources\*\*\s*\n/);
      const sources = parseSources(srcBlock);
      const page = absoluteUrl(`/letters/${slug}`);
      const marks = sources.length ? `\n\n**Want the sources?** They are on the web: [${page.replace('https://', '')}](${page})` : '';
      const web = main
        .replace(/^Hi \{\{first_name\|there\}\},\s*/, '')
        .replace(/\n+Dana\s*$/, '')
        .replace(/\[(\d+)\](?!\()/g, '<Ref n={$1} />');
      return {
        file: r.file,
        n: index + 1,
        slug,
        subject: String(r.data.subject),
        preview: String(r.data.preview || ''),
        topic: String(r.data.topic || 'Class Notes'),
        cat: (r.data.cat || 'read') as Pose,
        tone: (r.data.tone || 'rosy') as Issue['tone'],
        date: sendDate(index),
        minutes: Math.max(1, Math.round(readingTime(web).minutes)),
        body: `${main.replace(/\n+Dana\s*$/, '')}${marks}\n\nDana`,
        web,
        sources,
      };
    });
  cache = list;
  return list;
}

export const getIssue = (slug: string) => getIssues().find((i) => i.slug === slug) ?? null;
// the issues already sent (their day has come), newest first: the archive and the sitemap list these
export const sentIssues = (now = new Date()) => getIssues().filter((i) => i.date <= nyToday(now)).reverse();

// "New on Health Class": the resource pages published in the days since the last issue (from content/resources),
// added under the issue's sign-off, so every letter also points to what is new on the site.
export function newResources(sinceDays = 4, today = new Date()) {
  const from = new Date(today.getTime() - sinceDays * 864e5).toISOString().slice(0, 10);
  return getResources().filter((r) => r.date > from).slice(0, 3);
}

export function compose(issue: Issue, today = new Date()) {
  const fresh = newResources(4, today);
  const extra = fresh.length
    ? `\n\n---\n\n**New on Health Class**\n\n${fresh.map((r) => `- [${r.title}](${absoluteUrl(r.path)}): ${r.excerpt}`).join('\n')}`
    : '';
  return { subject: issue.subject, previewText: issue.preview, content: issue.body + extra, archiveSlug: issue.slug };
}
