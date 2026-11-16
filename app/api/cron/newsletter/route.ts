import { compose, getIssues } from '@/lib/newsletter';

// Class Notes on autopilot: Vercel calls this every Wednesday and Sunday early morning (vercel.json "crons"). It takes
// the next issue of newsletter/issues that MailCheap has not seen yet, creates it there and schedules it for 7:00 AM
// New York time, the newsletter's fixed hour. Until 7:00 it can be canceled in MailCheap (Campaigns, Scheduled).
//
// Env (Vercel, Production): MAILCHEAP_API_KEY (a Full access key: MailCheap, API keys), CRON_SECRET (any long random
// string; Vercel sends it), MAILCHEAP_NEWSLETTER (optional: the newsletter's slug when the account has more than one).
// Preview without sending: GET /api/cron/newsletter?dry=1 with the same Authorization header.
export const dynamic = 'force-dynamic';

const API = 'https://mailcheap.ai/api/v1';
const TZ = 'America/New_York';
const HOUR = '07:00';

type Campaign = { id: string; status: string; archiveSlug: string | null; subject: string; scheduledAt: string | null; sentAt: string | null; createdAt: string | null };

const nyDate = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const nyHour = (d: Date) => Number(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' }).format(d));

async function mc<T>(key: string, p: string, init?: RequestInit): Promise<T> {
  const r = await fetch(API + p, { ...init, headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) }, cache: 'no-store' });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`MailCheap ${r.status} on ${p}: ${JSON.stringify(body).slice(0, 300)}`);
  return body as T;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const dry = url.searchParams.has('dry');
  const now = new Date();
  const issues = getIssues();
  const key = process.env.MAILCHEAP_API_KEY;
  const newsletter = process.env.MAILCHEAP_NEWSLETTER || undefined;

  if (!key) {
    const next = issues[0];
    return Response.json({ status: 'no_key', note: 'Set MAILCHEAP_API_KEY (Full access) in Vercel.', next: next ? compose(next, now) : null }, { status: dry ? 200 : 503 });
  }

  const list = await mc<{ campaigns: Campaign[] }>(key, `/campaigns?limit=200${newsletter ? `&newsletter=${encodeURIComponent(newsletter)}` : ''}`);
  const seen = new Set(list.campaigns.filter((c) => c.status !== 'canceled').map((c) => c.archiveSlug).filter(Boolean));
  // once a day at most: if an issue is already scheduled or sent for today (New York), do nothing
  const today = nyDate(now);
  const already = list.campaigns.find((c) => c.status !== 'canceled' && [c.scheduledAt, c.sentAt].some((t) => t && nyDate(new Date(t)) === today));
  const next = issues.find((i) => !seen.has(i.slug));
  const left = issues.filter((i) => !seen.has(i.slug)).length;

  if (dry) return Response.json({ status: 'dry', today, alreadyToday: already?.subject ?? null, left, next: next ? compose(next, now) : null });
  if (already) return Response.json({ status: 'already_scheduled_today', subject: already.subject });
  if (!next) return Response.json({ status: 'queue_empty', note: 'Add issues to newsletter/issues.' });

  const c = await mc<Campaign>(key, '/campaigns', { method: 'POST', body: JSON.stringify({ ...(newsletter ? { newsletter } : {}), format: 'markdown', publishTo: 'both', ...compose(next, now) }) });
  // 7:00 AM New York today; if the cron ran late, 10 minutes from now
  const at = nyHour(now) < 7 ? `${today}T${HOUR}` : new Date(now.getTime() + 10 * 60_000).toISOString();
  await mc(key, `/campaigns/${c.id}/schedule`, { method: 'POST', body: JSON.stringify({ scheduledAt: at, timeZone: TZ }) });
  return Response.json({ status: 'scheduled', subject: next.subject, slug: next.slug, at, timeZone: TZ, left: left - 1 });
}
