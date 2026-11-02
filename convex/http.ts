// HTTP endpoints on the Convex deployment (https://<deployment>.convex.site):
//   POST /webhooks/superwall?key=SUPERWALL_WEBHOOK_KEY   Superwall's subscription events → members
//   POST /members  (Authorization: Bearer HC_ADMIN_TOKEN) { email, active, expiresAt? } → members, for manual fixes
import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';

const http = httpRouter();
const same = (a: string, b: string) => a.length === b.length && [...a].reduce((d, c, i) => d | (c.charCodeAt(0) ^ b.charCodeAt(i)), 0) === 0;

http.route({
  path: '/webhooks/superwall',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const want = process.env.SUPERWALL_WEBHOOK_KEY;
    const got = new URL(req.url).searchParams.get('key') ?? '';
    if (!want || !same(got, want)) return new Response('Unauthorized', { status: 401 });
    let body: any;
    try { body = await req.json(); } catch { return new Response('Bad JSON', { status: 400 }); }
    const d = body?.data ?? {};
    const attrs = d.userAttributes ?? {};
    const email = typeof attrs.email === 'string' ? attrs.email : typeof attrs.$email === 'string' ? attrs.$email : undefined;
    const exp = d.expirationAt ? Number(d.expirationAt) || Date.parse(d.expirationAt) : undefined;
    await ctx.runMutation(internal.members.fromSuperwall, {
      type: String(body?.type ?? d.name ?? ''),
      appUserId: typeof d.originalAppUserId === 'string' ? d.originalAppUserId : undefined,
      email,
      productId: typeof d.productId === 'string' ? d.productId : undefined,
      expiresAt: Number.isFinite(exp) ? exp : undefined,
      environment: typeof d.environment === 'string' ? d.environment : undefined,
    });
    return new Response('ok');
  }),
});

http.route({
  path: '/members',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const want = process.env.HC_ADMIN_TOKEN;
    const got = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    if (!want || !same(got, want)) return new Response('Unauthorized', { status: 401 });
    const b = await req.json().catch(() => null);
    if (!b || typeof b.email !== 'string' || typeof b.active !== 'boolean') return new Response('Send { email, active, expiresAt? }', { status: 400 });
    await ctx.runMutation(internal.members.upsert, { email: b.email, active: b.active, expiresAt: typeof b.expiresAt === 'number' ? b.expiresAt : undefined });
    return new Response('ok');
  }),
});

export default http;
