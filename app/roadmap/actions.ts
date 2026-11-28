'use server';
// The /roadmap password form: checks the team password (app/roadmap/pass.ts) and keeps a 30-day pass.
import { cookies } from 'next/headers';
import { password, passFor, same } from './pass';

export type GateState = { status: 'idle' | 'error'; message?: string };

export async function unlockRoadmap(_prev: GateState, fd: FormData): Promise<GateState> {
  const typed = String(fd.get('password') ?? '');
  if (!typed) return { status: 'error', message: 'Type the team password.' };
  const pw = password();
  if (!pw) return { status: 'error', message: 'No password is set yet. Add ROADMAP_PASSWORD in Vercel.' };
  if (!same(typed, pw)) {
    await new Promise((r) => setTimeout(r, 800)); // slows down guessing
    return { status: 'error', message: 'Wrong password. Try again.' };
  }
  (await cookies()).set('hc_roadmap', passFor(pw), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 30 * 24 * 3600 });
  return { status: 'idle' };
}
