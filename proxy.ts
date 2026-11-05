// healthclass.app (no www) is the magic link, like a store badge you can type: a phone goes straight to its store,
// a computer goes to www.healthclass.app. Short codes say where she came from: healthclass.app/ig (Instagram),
// /nl (newsletter)... (lib/site.ts linkSources). ?s=<source> works too. The source rides along to the App Store (ct),
// to Google Play (install referrer utm_source) and to the site (utm_source), and each click is counted in PostHog
// (event link_click: source, platform, destination; anonymous, no cookie, no IP kept).
// Until a store is live, phones land on the home page (store buttons open the waitlist).
// Every other path on the bare domain, like healthclass.app/privacy, goes to the same path on www.
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { linkSources, site } from '@/lib/site';

const WWW = new URL(site.url);
const PH_KEY = process.env.POSTHOG_KEY || 'phc_sKLPxs4D3CsxYSJdGzHY7TwMwcHEQBfcEhyjYiELzYDJ';
const PH_HOST = 'https://eu.i.posthog.com';
const clean = (v: string) => v.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);

function count(ev: NextFetchEvent, props: Record<string, string | boolean>) {
  const body = JSON.stringify({
    api_key: PH_KEY,
    event: 'link_click',
    distinct_id: crypto.randomUUID(),
    properties: { ...props, $process_person_profile: false, $lib: 'magic-link' },
  });
  ev.waitUntil(fetch(`${PH_HOST}/i/v0/e/`, { method: 'POST', headers: { 'content-type': 'application/json' }, body }).catch(() => {}));
}

export function proxy(req: NextRequest, ev: NextFetchEvent) {
  const host = (req.headers.get('host') ?? '').toLowerCase().split(':')[0];
  if (host !== site.magicHost) return NextResponse.next();

  const url = req.nextUrl;
  const code = url.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const isLink = code === '' || code === 'get' || code === 'download' || code in linkSources;
  if (!isLink) return NextResponse.redirect(new URL(url.pathname + url.search, WWW), 308);

  const utm = [...url.searchParams].filter(([k]) => k.startsWith('utm_'));
  const source = clean(linkSources[code] || url.searchParams.get('s') || url.searchParams.get('utm_source') || 'direct') || 'direct';
  const ua = req.headers.get('user-agent') ?? '';
  const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && /Mobile/i.test(ua));
  const android = /Android/i.test(ua);
  const platform = ios ? 'ios' : android ? 'android' : 'desktop';
  const appStore = process.env.APP_STORE_URL || site.appStoreUrl;
  const play = process.env.PLAY_STORE_URL || site.playStoreUrl;

  let dest: URL;
  if (ios && appStore) {
    dest = new URL(appStore);
    const pt = process.env.APP_STORE_PT || site.appStorePt;
    if (pt) dest.searchParams.set('pt', pt);
    dest.searchParams.set('ct', source);
    dest.searchParams.set('mt', '8');
  } else if (android && play) {
    dest = new URL(play);
    const ref = new URLSearchParams(utm);
    if (!ref.has('utm_source')) ref.set('utm_source', source);
    if (!ref.has('utm_medium')) ref.set('utm_medium', 'magic-link');
    dest.searchParams.set('referrer', ref.toString());
  } else {
    dest = new URL('/', WWW);
    utm.forEach(([k, v]) => dest.searchParams.set(k, v));
    if (!dest.searchParams.has('utm_source')) dest.searchParams.set('utm_source', source);
    if (!dest.searchParams.has('utm_medium')) dest.searchParams.set('utm_medium', 'magic-link');
  }
  count(ev, { source, platform, destination: dest.hostname.includes('apple') ? 'app-store' : dest.hostname.includes('google') ? 'google-play' : 'website', stores_live: Boolean(appStore || play) });
  return NextResponse.redirect(dest, 302);
}

export const config = {
  // the bare domain only matters for pages; files and Next's own assets pass straight through
  matcher: ['/((?!_next/|cats/|media/|fonts/|favicon|icon|apple-icon).*)'],
};
