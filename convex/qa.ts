// The monthly Q&A with Dr. Dana, for the app's paid members. The website's server does the crypto (random tokens,
// SHA-256) and the email; Convex only stores hashes and answers "is this a member". Nothing here tells a browser
// whether an email has a plan: requestLink answers the same way for everyone, and only the server sees `sent`.
import { v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import { EMAIL_RE, allow, checkSecret, normEmail } from './lib';

const LINK_MS = 30 * 60_000;
const PASS_MS = 30 * 24 * 3600_000;

async function isMember(ctx: QueryCtx, email: string) {
  const now = Date.now();
  const rows = await ctx.db.query('members').withIndex('by_email', (q) => q.eq('email', email)).collect();
  return rows.some((m) => m.active && (!m.expiresAt || m.expiresAt > now));
}

async function nextEventOf(ctx: QueryCtx) {
  const now = Date.now();
  const ev = await ctx.db.query('qaEvents').withIndex('by_startsAt', (q) => q.gte('startsAt', now - 3 * 3600_000)).first();
  return ev ?? null;
}

// public: the next session's date and title (never its link)
export const nextEvent = query({
  args: {},
  handler: async (ctx) => {
    const ev = await nextEventOf(ctx);
    return ev ? { startsAt: ev.startsAt, durationMin: ev.durationMin, title: ev.title, topic: ev.topic ?? null } : null;
  },
});

// a member asks for a sign-in link. Returns sent: true only to the server, which then emails the link.
export const requestLink = mutation({
  args: { secret: v.string(), email: v.string(), tokenHash: v.string(), ip: v.optional(v.string()) },
  handler: async (ctx, a) => {
    checkSecret(a.secret);
    const email = normEmail(a.email);
    if (!EMAIL_RE.test(email)) return { ok: false as const, error: 'invalid_email' };
    if (a.ip && !(await allow(ctx, `qa:ip:${a.ip}`, 10, 15 * 60_000))) return { ok: false as const, error: 'too_many' };
    if (!(await allow(ctx, `qa:email:${email}`, 4, 15 * 60_000))) return { ok: true as const, sent: false };
    if (!(await isMember(ctx, email))) return { ok: true as const, sent: false };
    await ctx.db.insert('qaLinks', { tokenHash: a.tokenHash, email, expiresAt: Date.now() + LINK_MS });
    return { ok: true as const, sent: true };
  },
});

// the link is opened: it works once, then becomes a 30-day pass for this browser
export const redeemLink = mutation({
  args: { secret: v.string(), tokenHash: v.string(), passHash: v.string() },
  handler: async (ctx, a) => {
    checkSecret(a.secret);
    const link = await ctx.db.query('qaLinks').withIndex('by_tokenHash', (q) => q.eq('tokenHash', a.tokenHash)).unique();
    const now = Date.now();
    if (!link || link.usedAt || link.expiresAt < now) return { ok: false as const };
    await ctx.db.patch(link._id, { usedAt: now });
    if (!(await isMember(ctx, link.email))) return { ok: false as const };
    await ctx.db.insert('qaPasses', { passHash: a.passHash, email: link.email, expiresAt: now + PASS_MS, createdAt: now });
    return { ok: true as const };
  },
});

async function passEmail(ctx: QueryCtx, passHash: string) {
  const pass = await ctx.db.query('qaPasses').withIndex('by_passHash', (q) => q.eq('passHash', passHash)).unique();
  if (!pass || pass.expiresAt < Date.now()) return null;
  if (!(await isMember(ctx, pass.email))) return null;
  return pass.email;
}

// the member's page: the next session with its link, the replays, her questions
export const portal = query({
  args: { secret: v.string(), passHash: v.string() },
  handler: async (ctx, a) => {
    checkSecret(a.secret);
    const email = await passEmail(ctx, a.passHash);
    if (!email) return null;
    const next = await nextEventOf(ctx);
    const past = await ctx.db.query('qaEvents').withIndex('by_startsAt', (q) => q.lt('startsAt', Date.now() - 3 * 3600_000)).order('desc').take(12);
    const mine = await ctx.db.query('qaQuestions').withIndex('by_email', (q) => q.eq('email', email)).order('desc').take(20);
    return {
      email,
      next: next ? { id: next._id, startsAt: next.startsAt, durationMin: next.durationMin, title: next.title, topic: next.topic ?? null, joinUrl: next.joinUrl ?? null } : null,
      replays: past.filter((e) => e.replayUrl).map((e) => ({ startsAt: e.startsAt, title: e.title, replayUrl: e.replayUrl! })),
      questions: mine.map((q) => ({ text: q.text, status: q.status, createdAt: q.createdAt })),
    };
  },
});

export const ask = mutation({
  args: { secret: v.string(), passHash: v.string(), text: v.string(), firstName: v.optional(v.string()) },
  handler: async (ctx, a) => {
    checkSecret(a.secret);
    const email = await passEmail(ctx, a.passHash);
    if (!email) return { ok: false as const, error: 'signed_out' };
    const text = a.text.trim();
    if (text.length < 8 || text.length > 1200) return { ok: false as const, error: 'length' };
    if (!(await allow(ctx, `qa:ask:${email}`, 6, 24 * 3600_000))) return { ok: false as const, error: 'too_many' };
    const next = await nextEventOf(ctx);
    await ctx.db.insert('qaQuestions', { email, eventId: next?._id, text, firstName: a.firstName?.trim().slice(0, 40) || undefined, status: 'new', createdAt: Date.now() });
    return { ok: true as const };
  },
});

export const signOut = mutation({
  args: { secret: v.string(), passHash: v.string() },
  handler: async (ctx, a) => {
    checkSecret(a.secret);
    const pass = await ctx.db.query('qaPasses').withIndex('by_passHash', (q) => q.eq('passHash', a.passHash)).unique();
    if (pass) await ctx.db.delete(pass._id);
  },
});

// the team plans a session (run from the Convex dashboard or `npx convex run qa:addEvent '{...}'`)
export const addEvent = internalMutation({
  args: { startsAt: v.string(), durationMin: v.optional(v.number()), title: v.string(), topic: v.optional(v.string()), joinUrl: v.optional(v.string()) },
  handler: async (ctx, a) => {
    const t = Date.parse(a.startsAt);
    if (Number.isNaN(t)) throw new Error('startsAt must be an ISO date, e.g. 2026-12-03T20:00:00-05:00');
    return ctx.db.insert('qaEvents', { startsAt: t, durationMin: a.durationMin ?? 45, title: a.title, topic: a.topic, joinUrl: a.joinUrl });
  },
});

export const setReplay = internalMutation({
  args: { id: v.id('qaEvents'), replayUrl: v.string() },
  handler: (ctx, { id, replayUrl }) => ctx.db.patch(id, { replayUrl }),
});

export const cleanup = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    for (const l of await ctx.db.query('qaLinks').take(500)) if (l.expiresAt < now - 24 * 3600_000) await ctx.db.delete(l._id);
    for (const p of await ctx.db.query('qaPasses').take(500)) if (p.expiresAt < now) await ctx.db.delete(p._id);
    for (const r of await ctx.db.query('rateLimits').take(500)) if (r.windowStart < now - 2 * 24 * 3600_000) await ctx.db.delete(r._id);
  },
});
