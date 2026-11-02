// Shared helpers for the Convex functions.
import type { MutationCtx } from './_generated/server';

// Only the website's server knows HC_SERVER_SECRET (set the same value in Vercel and in Convex). Every function that
// touches an email checks it, so nobody can call them from a browser or test whether an email has a plan.
export function checkSecret(secret: string) {
  const expected = process.env.HC_SERVER_SECRET;
  if (!expected) throw new Error('HC_SERVER_SECRET is not set on this Convex deployment');
  if (secret.length !== expected.length) throw new Error('Unauthorized');
  let diff = 0;
  for (let i = 0; i < secret.length; i++) diff |= secret.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) throw new Error('Unauthorized');
}

export const normEmail = (e: string) => e.trim().toLowerCase();
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// a fixed window: at most `max` calls per `windowMs` for one key (an IP or an email). Returns false when over.
export async function allow(ctx: MutationCtx, key: string, max: number, windowMs: number) {
  const now = Date.now();
  const row = await ctx.db.query('rateLimits').withIndex('by_key', (q) => q.eq('key', key)).unique();
  if (!row || now - row.windowStart > windowMs) {
    if (row) await ctx.db.patch(row._id, { windowStart: now, count: 1 });
    else await ctx.db.insert('rateLimits', { key, windowStart: now, count: 1 });
    return true;
  }
  if (row.count >= max) return false;
  await ctx.db.patch(row._id, { count: row.count + 1 });
  return true;
}
