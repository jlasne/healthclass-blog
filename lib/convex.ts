import 'server-only';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// The website talks to Convex from its server only, with HC_SERVER_SECRET. Without a Convex URL (before the backend is
// set up) the forms still answer as if they worked, and the server logs what it would have sent.
const url = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || '';
export const convexReady = Boolean(url && process.env.HC_SERVER_SECRET);
export const secret = process.env.HC_SERVER_SECRET || '';
export function convex() {
  return convexReady ? new ConvexHttpClient(url) : null;
}
export { api };
