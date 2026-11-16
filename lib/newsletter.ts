// Class Notes, the newsletter: the queue of issues (newsletter/issues/NN-<slug>.md) and how the next one is built.
// The cron route app/api/cron/newsletter sends one every Wednesday and Sunday at 7:00 AM Eastern through MailCheap.
// An issue goes out once: MailCheap keeps its slug, so the next run takes the next file in name order.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getResources } from './resources';
import { absoluteUrl } from './site';

const DIR = path.join(process.cwd(), 'newsletter', 'issues');

export type Issue = { file: string; slug: string; subject: string; preview: string; body: string };

export function getIssues(): Issue[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => /^\d+-.+\.md$/.test(f))
    .sort()
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(DIR, file), 'utf8'));
      const slug = String(data.slug || file.replace(/^\d+-/, '').replace(/\.md$/, ''));
      return { file, slug, subject: String(data.subject || ''), preview: String(data.preview || ''), body: content.trim() };
    })
    .filter((i) => i.subject && i.body);
}

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
