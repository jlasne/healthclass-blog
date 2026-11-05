import { api, convex } from '@/lib/convex';
import { site } from '@/lib/site';

// The next live with Dr. Dana, for the app's paywall and anyone else: public, no link, no member data.
// GET https://www.healthclass.app/api/next-live → { scheduled, startsAt, date, when, label, title, month }
// While only the month is set (site.qa.month), it says the month and no date: { scheduled: true, startsAt: null, month }.
export const revalidate = 300;

export async function GET() {
  const month = site.qa.month;
  if (month) {
    return Response.json(
      { scheduled: true, startsAt: null, date: month, when: null, month, label: `Next live with Dr. Dana: in ${month}`, title: null, durationMin: 45 },
      { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } },
    );
  }
  const c = convex();
  const next = c ? await c.query(api.qa.nextEvent, {}).catch(() => null) : null;
  const durMin = next?.durationMin ?? 45;
  const startsAt = next?.startsAt ?? Date.parse(site.qa.next);
  const scheduled = Number.isFinite(startsAt) && Date.now() < startsAt + durMin * 60_000;
  const at = (o: Intl.DateTimeFormatOptions) => new Date(startsAt).toLocaleString('en-US', { timeZone: 'America/New_York', ...o });
  const body = scheduled
    ? {
        scheduled: true,
        startsAt: new Date(startsAt).toISOString(),
        date: at({ month: 'long', day: 'numeric' }),
        when: `${at({ weekday: 'long' })} · ${at({ hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}`,
        label: `Next live with Dr. Dana: ${at({ month: 'long', day: 'numeric' })}`,
        title: next?.title ?? null,
        durationMin: durMin,
      }
    : { scheduled: false, startsAt: null, date: null, when: null, label: 'Live with Dr. Dana, once a month', title: null, durationMin: durMin };
  return Response.json(body, {
    headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
  });
}
