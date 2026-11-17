// The team's /roadmap page is behind one shared password. The password lives only here, as the Convex environment
// variable ROADMAP_PASSWORD (Convex dashboard > Settings > Environment Variables). The website never sees it: on the
// right password, Convex hands back a pass (a hash of the password), the browser keeps it in an httpOnly cookie for
// 30 days, and each visit asks Convex if the pass still matches. Changing the password locks everyone out.
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { allow, checkSecret } from './lib';

async function passFor(password: string) {
  const data = new TextEncoder().encode(`roadmap:${password}:${process.env.HC_SERVER_SECRET ?? ''}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}
const same = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

// the password form: at most 8 tries per 15 minutes from one network
export const unlock = mutation({
  args: { secret: v.string(), password: v.string(), ip: v.optional(v.string()) },
  handler: async (ctx, a) => {
    checkSecret(a.secret);
    const expected = process.env.ROADMAP_PASSWORD;
    if (!expected) return { ok: false as const, error: 'not_set' as const };
    if (!(await allow(ctx, `roadmap:${a.ip ?? 'unknown'}`, 8, 15 * 60_000))) return { ok: false as const, error: 'too_many' as const };
    if (!same(a.password, expected)) return { ok: false as const, error: 'wrong' as const };
    return { ok: true as const, pass: await passFor(expected) };
  },
});

// each visit: is this browser's pass still good?
export const check = query({
  args: { secret: v.string(), pass: v.string() },
  handler: async (_ctx, a) => {
    checkSecret(a.secret);
    const expected = process.env.ROADMAP_PASSWORD;
    if (!expected || !a.pass) return false;
    return same(a.pass, await passFor(expected));
  },
});
