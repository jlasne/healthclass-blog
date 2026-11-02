// Class Notes signups. The website's server action calls subscribe; MailCheap gets a copy when MAILCHEAP_API_KEY is
// set (right away, and the hourly cron catches up everyone who joined before the key existed).
import { v } from 'convex/values';
import { internalMutation, internalQuery, mutation } from './_generated/server';
import { internal } from './_generated/api';
import { EMAIL_RE, allow, checkSecret, normEmail } from './lib';

export const subscribe = mutation({
  args: { secret: v.string(), email: v.string(), source: v.optional(v.string()), tags: v.optional(v.array(v.string())), ip: v.optional(v.string()) },
  handler: async (ctx, a) => {
    checkSecret(a.secret);
    const email = normEmail(a.email);
    if (!EMAIL_RE.test(email) || email.length > 254) return { ok: false as const, error: 'invalid_email' };
    if (a.ip && !(await allow(ctx, `nl:ip:${a.ip}`, 8, 10 * 60_000))) return { ok: false as const, error: 'too_many' };
    const now = Date.now();
    const tags = (a.tags ?? []).map((t) => t.toLowerCase().replace(/,/g, '').slice(0, 40)).slice(0, 5);
    const row = await ctx.db.query('subscribers').withIndex('by_email', (q) => q.eq('email', email)).unique();
    if (row) {
      await ctx.db.patch(row._id, { status: 'active', updatedAt: now, tags: Array.from(new Set([...row.tags, ...tags])), syncedAt: undefined, syncError: undefined, syncAttempts: 0 });
      await ctx.scheduler.runAfter(0, internal.mailcheap.push, { id: row._id, ip: a.ip, resubscribe: row.status === 'unsubscribed' });
      return { ok: true as const, already: row.status === 'active' };
    }
    const id = await ctx.db.insert('subscribers', { email, status: 'active', source: a.source?.slice(0, 200), tags, createdAt: now, updatedAt: now, syncAttempts: 0 });
    await ctx.scheduler.runAfter(0, internal.mailcheap.push, { id, ip: a.ip, resubscribe: false });
    return { ok: true as const, already: false };
  },
});

export const get = internalQuery({ args: { id: v.id('subscribers') }, handler: (ctx, { id }) => ctx.db.get(id) });

export const markSync = internalMutation({
  args: { id: v.id('subscribers'), ok: v.boolean(), error: v.optional(v.string()) },
  handler: async (ctx, { id, ok, error }) => {
    const row = await ctx.db.get(id);
    if (!row) return;
    if (ok) await ctx.db.patch(id, { syncedAt: Date.now(), syncError: undefined });
    else await ctx.db.patch(id, { syncError: error?.slice(0, 300), syncAttempts: row.syncAttempts + 1 });
  },
});

// the ones MailCheap has not received yet (at most 50 per run, and 8 tries each)
export const unsynced = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('subscribers').withIndex('by_syncedAt', (q) => q.eq('syncedAt', undefined)).take(200);
    return rows.filter((r) => r.status === 'active' && r.syncAttempts < 8).slice(0, 50).map((r) => r._id);
  },
});
