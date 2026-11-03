'use server';
// Class Notes signup, from every newsletter form on the site.
import { headers } from 'next/headers';
import { api, convex, secret } from '@/lib/convex';

export type SubState = { status: 'idle' | 'ok' | 'error'; message?: string; email?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// the usual misspelled domains, caught before they cost a lost subscriber
const TYPOS: Record<string, string> = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmail.co': 'gmail.com', 'hotmial.com': 'hotmail.com', 'yaho.com': 'yahoo.com', 'icloud.co': 'icloud.com', 'outlok.com': 'outlook.com' };

export async function subscribe(_prev: SubState, fd: FormData): Promise<SubState> {
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const source = String(fd.get('source') ?? '').slice(0, 200);
  const tag = String(fd.get('tag') ?? '').slice(0, 40);
  // a field people never see: a bot fills it, and gets a polite yes
  if (String(fd.get('company') ?? '')) return { status: 'ok', email };
  if (!EMAIL_RE.test(email) || email.length > 254) return { status: 'error', message: 'Check your email: it needs an @ and a domain, like name@gmail.com.', email };
  const domain = email.split('@')[1];
  if (TYPOS[domain] && fd.get('confirm') !== email) return { status: 'error', message: `Did you mean ${email.split('@')[0]}@${TYPOS[domain]}? Fix it, or send again to keep ${domain}.`, email };

  const c = convex();
  if (!c) {
    console.info(`[newsletter] Convex not set up yet: would subscribe ${email} (${source || 'unknown page'})`);
    return { status: 'ok', email };
  }
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || undefined;
  try {
    const r = await c.mutation(api.newsletter.subscribe, { secret, email, source, tags: tag ? ['website', tag] : ['website'], ip });
    if (r.ok) return { status: 'ok', email };
    if (r.error === 'too_many') return { status: 'error', message: 'Too many tries from this network. Wait 10 minutes, then send again.', email };
    return { status: 'error', message: 'Check your email: it needs an @ and a domain, like name@gmail.com.', email };
  } catch (e) {
    console.error('[newsletter]', e);
    return { status: 'error', message: `Our server missed that one. Send again, or write to dana@healthclass.app.`, email };
  }
}
