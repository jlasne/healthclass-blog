'use server';
// The /roadmap password form. Convex checks the password (convex/roadmap.ts); this only keeps the pass it returns.
import { cookies, headers } from 'next/headers';
import { api, convex, secret } from '@/lib/convex';

export type GateState = { status: 'idle' | 'error'; message?: string };
const COOKIE = 'hc_roadmap';

export async function unlockRoadmap(_prev: GateState, fd: FormData): Promise<GateState> {
  const password = String(fd.get('password') ?? '');
  if (!password) return { status: 'error', message: 'Type the team password.' };
  const c = convex();
  if (!c) return { status: 'error', message: 'The lock is not set up yet on this server.' };
  const ip = ((await headers()).get('x-forwarded-for') ?? '').split(',')[0].trim() || undefined;
  const r = await c.mutation(api.roadmap.unlock, { secret, password, ip }).catch((e) => { console.error('[roadmap]', e); return null; });
  if (!r) return { status: 'error', message: 'Our server missed that one. Try again in a minute.' };
  if (!r.ok) {
    const message = r.error === 'too_many' ? 'Too many tries. Wait 15 minutes.' : r.error === 'not_set' ? 'No password is set yet. Add ROADMAP_PASSWORD in Convex.' : 'Wrong password. Try again.';
    return { status: 'error', message };
  }
  (await cookies()).set(COOKIE, r.pass, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/roadmap', maxAge: 30 * 24 * 3600 });
  return { status: 'idle' };
}
