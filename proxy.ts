// healthclass.app (no www) is the magic link, like a store badge you can type: a phone goes straight to its store,
// a computer goes to www.healthclass.app/app (store buttons and a QR code). Every other path on the bare domain,
// like healthclass.app/privacy, goes to the same path on www, so links printed anywhere keep working.
// Store links come from env (APP_STORE_URL, PLAY_STORE_URL) or lib/site.ts; until a store is live, phones land on
// /app too. Campaign tags (utm_*) ride along: to Google Play as its install referrer, to the page as they are.
import { NextResponse, type NextRequest } from 'next/server';
import { site } from '@/lib/site';

const WWW = new URL(site.url);

export function proxy(req: NextRequest) {
  const host = (req.headers.get('host') ?? '').toLowerCase().split(':')[0];
  if (host !== site.magicHost) return NextResponse.next();

  const url = req.nextUrl;
  if (url.pathname === '/' || url.pathname === '/get' || url.pathname === '/download') {
    const ua = req.headers.get('user-agent') ?? '';
    const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && /Mobile/i.test(ua));
    const android = /Android/i.test(ua);
    const appStore = process.env.APP_STORE_URL || site.appStoreUrl;
    const play = process.env.PLAY_STORE_URL || site.playStoreUrl;
    const utm = [...url.searchParams].filter(([k]) => k.startsWith('utm_'));
    if (ios && appStore) return NextResponse.redirect(appStore, 302);
    if (android && play) {
      const dest = new URL(play);
      if (utm.length) dest.searchParams.set('referrer', new URLSearchParams(utm).toString());
      return NextResponse.redirect(dest, 302);
    }
    const page = new URL('/app', WWW);
    utm.forEach(([k, v]) => page.searchParams.set(k, v));
    if (!utm.length) page.searchParams.set('utm_source', 'magic-link');
    return NextResponse.redirect(page, 302);
  }
  const dest = new URL(url.pathname + url.search, WWW);
  return NextResponse.redirect(dest, 308);
}

export const config = {
  // the bare domain only matters for pages; files and Next's own assets pass straight through
  matcher: ['/((?!_next/|cats/|media/|fonts/|favicon|icon|apple-icon).*)'],
};
