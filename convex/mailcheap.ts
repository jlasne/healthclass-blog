// Copies a Class Notes subscriber to MailCheap (https://mailcheap.ai/docs/api): POST /api/v1/contacts with a bearer key.
// Without MAILCHEAP_API_KEY nothing leaves Convex: the signup waits here and the hourly cron sends it once the key is set.
// Env: MAILCHEAP_API_KEY (a signups-only key is enough), MAILCHEAP_NEWSLETTER (optional: the newsletter's id or slug).
import { v } from 'convex/values';
import { internalAction } from './_generated/server';
import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';

type Result = { ok?: boolean; status?: number; skipped?: string; pushed?: number };

export const push = internalAction({
  args: { id: v.id('subscribers'), ip: v.optional(v.string()), resubscribe: v.optional(v.boolean()) },
  handler: async (ctx, { id, ip, resubscribe }): Promise<Result> => {
    const key = process.env.MAILCHEAP_API_KEY;
    if (!key) return { skipped: 'no_key' };
    const row: Doc<'subscribers'> | null = await ctx.runQuery(internal.newsletter.get, { id });
    if (!row || row.status !== 'active' || row.syncedAt) return { skipped: 'nothing_to_do' };
    try {
      const res: Response = await fetch('https://mailcheap.ai/api/v1/contacts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: row.email,
          newsletter: process.env.MAILCHEAP_NEWSLETTER || undefined,
          source: 'website',
          tags: row.tags.length ? row.tags : undefined,
          resubscribe: resubscribe || undefined,
          ip: ip || undefined,
        }),
      });
      if (res.ok) {
        await ctx.runMutation(internal.newsletter.markSync, { id, ok: true });
        return { ok: true };
      }
      const text = (await res.text()).slice(0, 300);
      await ctx.runMutation(internal.newsletter.markSync, { id, ok: false, error: `${res.status} ${text}` });
      return { ok: false, status: res.status };
    } catch (e) {
      await ctx.runMutation(internal.newsletter.markSync, { id, ok: false, error: String(e) });
      return { ok: false };
    }
  },
});

// the hourly catch-up (crons.ts)
export const pushPending = internalAction({
  args: {},
  handler: async (ctx): Promise<Result> => {
    if (!process.env.MAILCHEAP_API_KEY) return { skipped: 'no_key' };
    const ids: Id<'subscribers'>[] = await ctx.runQuery(internal.newsletter.unsynced, {});
    for (const id of ids) await ctx.runAction(internal.mailcheap.push, { id });
    return { pushed: ids.length };
  },
});
