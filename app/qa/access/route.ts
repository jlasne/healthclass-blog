// The sign-in link from the email: it works once, then this browser keeps a 30-day pass (an httpOnly cookie).
import { createHash, randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { api, convex, secret } from '@/lib/convex';

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t') ?? '';
  const back = new URL('/qa', req.nextUrl);
  const c = convex();
  if (!c || token.length < 20) { back.searchParams.set('link', 'expired'); return NextResponse.redirect(back); }
  const pass = randomBytes(32).toString('base64url');
  const r = await c.mutation(api.qa.redeemLink, { secret, tokenHash: sha(token), passHash: sha(pass) }).catch(() => ({ ok: false }));
  if (!r.ok) { back.searchParams.set('link', 'expired'); return NextResponse.redirect(back); }
  const res = NextResponse.redirect(back);
  res.cookies.set('hc_qa', pass, { httpOnly: true, secure: req.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 30 * 24 * 3600 });
  return res;
}
