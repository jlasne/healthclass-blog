import sitemap from '@/app/sitemap';
import { absoluteUrl, site } from '@/lib/site';

// IndexNow on autopilot: every day Vercel calls this (vercel.json "crons"). It sends the pages added or changed since
// yesterday to IndexNow (Bing, Yandex, Naver, Seznam, Yep; DuckDuckGo, Yahoo and Ecosia follow Bing), so a new letter,
// a new Class Notes issue or an edited resource is known within minutes, not weeks. Google does not read IndexNow.
// Needs CRON_SECRET (the same as the newsletter cron). Preview without sending: ?dry=1. Everything: ?all=1.
export const dynamic = 'force-dynamic';

const ENDPOINT = 'https://api.indexnow.org/indexnow';
const nyDate = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const q = new URL(req.url).searchParams;
  const since = nyDate(new Date(Date.now() - 864e5)); // yesterday, New York
  const entries = sitemap();
  const day = (e: { lastModified?: string | Date }) => (e.lastModified instanceof Date ? e.lastModified.toISOString() : String(e.lastModified ?? '')).slice(0, 10);
  const changed = q.has('all') ? entries : entries.filter((e) => day(e) >= since);
  const urls = new Set(changed.map((e) => e.url));
  // a new letter or issue also changes the lists that link to it
  if ([...urls].some((u) => u.includes('/letters/') || u.includes('/resources/'))) { urls.add(absoluteUrl('/')); urls.add(absoluteUrl('/letters')); }
  const urlList = [...urls];

  if (!urlList.length || q.has('dry')) return Response.json({ status: q.has('dry') ? 'dry' : 'nothing_new', since, urlList });
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(site.url).host, key: site.indexNowKey, keyLocation: absoluteUrl(`/${site.indexNowKey}.txt`), urlList }),
  });
  return Response.json({ status: r.ok ? 'sent' : 'failed', http: r.status, count: urlList.length, urlList }, { status: r.ok ? 200 : 502 });
}
