// The app's paid members, so the Q&A can let them in. Two ways in:
// 1. Superwall's webhook (http.ts): every purchase, renewal, cancellation and expiration. The email comes from the
//    user attribute `email`, which the app sets when she adds her email (Superwall.setUserAttributes({ email })).
// 2. By hand: POST /members with the admin token (http.ts), or `npx convex run members:upsert '{...}'`.
import { v } from 'convex/values';
import { internalMutation } from './_generated/server';
import { normEmail } from './lib';

const ACTIVE = new Set(['initial_purchase', 'renewal', 'uncancellation', 'product_change', 'non_renewing_purchase', 'cancellation', 'billing_issue']);
// cancellation turns renewal off but the plan runs to its end date; expiration ends it

export const fromSuperwall = internalMutation({
  args: { type: v.string(), appUserId: v.optional(v.string()), email: v.optional(v.string()), productId: v.optional(v.string()), expiresAt: v.optional(v.number()), environment: v.optional(v.string()) },
  handler: async (ctx, a) => {
    if (a.environment && a.environment !== 'PRODUCTION' && process.env.QA_ACCEPT_SANDBOX !== '1') return { skipped: 'sandbox' };
    const email = a.email ? normEmail(a.email) : undefined;
    const active = ACTIVE.has(a.type);
    const now = Date.now();
    let row = a.appUserId ? await ctx.db.query('members').withIndex('by_appUserId', (q) => q.eq('appUserId', a.appUserId)).first() : null;
    if (!row && email) row = await ctx.db.query('members').withIndex('by_email', (q) => q.eq('email', email)).first();
    const patch = { active, lastEvent: a.type, productId: a.productId, expiresAt: a.expiresAt, updatedAt: now, ...(email ? { email } : {}), ...(a.appUserId ? { appUserId: a.appUserId } : {}) };
    if (row) await ctx.db.patch(row._id, patch);
    else await ctx.db.insert('members', { ...patch, source: 'superwall' });
    return { ok: true };
  },
});

export const upsert = internalMutation({
  args: { email: v.string(), active: v.boolean(), expiresAt: v.optional(v.number()) },
  handler: async (ctx, a) => {
    const email = normEmail(a.email);
    const row = await ctx.db.query('members').withIndex('by_email', (q) => q.eq('email', email)).first();
    if (row) await ctx.db.patch(row._id, { active: a.active, expiresAt: a.expiresAt, updatedAt: Date.now() });
    else await ctx.db.insert('members', { email, active: a.active, expiresAt: a.expiresAt, source: 'admin', updatedAt: Date.now() });
    return { ok: true };
  },
});
