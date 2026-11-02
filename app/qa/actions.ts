'use server';
// The members' Q&A: ask for a sign-in link, send a question, sign out. The answer to "send me a link" is the same for
// every email, so the page never reveals who has a plan.
import { createHash, randomBytes } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { api, convex, secret } from '@/lib/convex';
import { sendQaLink } from '@/lib/mail';
import { site } from '@/lib/site';

export type LinkState = { status: 'idle' | 'sent' | 'error'; message?: string; email?: string };
export type AskState = { status: 'idle' | 'ok' | 'error'; message?: string };

const sha = async (s: string) => createHash('sha256').update(s).digest('hex');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function requestLink(_prev: LinkState, fd: FormData): Promise<LinkState> {
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { status: 'error', message: 'Use the email you added in the app, like name@gmail.com.', email };
  const c = convex();
  if (!c) {
    console.info(`[qa] Convex not set up yet: would check ${email}`);
    return { status: 'sent', email };
  }
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || undefined;
  const token = randomBytes(32).toString('base64url');
  try {
    const r = await c.mutation(api.qa.requestLink, { secret, email, tokenHash: await sha(token), ip });
    if (!r.ok && r.error === 'too_many') return { status: 'error', message: 'Too many tries from this network. Wait 15 minutes, then send again.', email };
    if (r.ok && r.sent) {
      const proto = h.get('x-forwarded-proto') ?? 'https';
      const host = h.get('host') ?? new URL(site.url).host;
      await sendQaLink(email, `${proto}://${host}/qa/access?t=${token}`);
    }
    return { status: 'sent', email };
  } catch (e) {
    console.error('[qa]', e);
    return { status: 'error', message: 'Our server missed that one. Send again in a minute.', email };
  }
}

export async function askQuestion(_prev: AskState, fd: FormData): Promise<AskState> {
  const text = String(fd.get('question') ?? '').trim();
  const firstName = fd.get('showName') ? String(fd.get('firstName') ?? '').trim() : '';
  if (text.length < 8) return { status: 'error', message: 'Write a little more: one full sentence helps Dr. Dana answer well.' };
  if (text.length > 1200) return { status: 'error', message: 'Keep it under 1,200 characters, about 200 words.' };
  const c = convex();
  const pass = (await cookies()).get('hc_qa')?.value;
  if (!c || !pass) return { status: 'error', message: 'Your sign-in ended. Ask for a new link below.' };
  const r = await c.mutation(api.qa.ask, { secret, passHash: await sha(pass), text, firstName: firstName || undefined });
  if (!r.ok) {
    const msg = r.error === 'too_many' ? 'That is 6 questions today. Send the next one tomorrow.' : r.error === 'signed_out' ? 'Your sign-in ended. Ask for a new link below.' : 'Keep it between 8 and 1,200 characters.';
    return { status: 'error', message: msg };
  }
  revalidatePath('/qa');
  return { status: 'ok' };
}

export async function signOut() {
  const jar = await cookies();
  const pass = jar.get('hc_qa')?.value;
  const c = convex();
  if (c && pass) await c.mutation(api.qa.signOut, { secret, passHash: await sha(pass) }).catch(() => {});
  jar.delete('hc_qa');
  revalidatePath('/qa');
}
