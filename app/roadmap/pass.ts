import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

// The team password lives in Vercel (Settings > Environment Variables > ROADMAP_PASSWORD). The browser keeps a pass, a
// hash of the password, in an httpOnly cookie for 30 days. Changing the password locks everyone out.
export const password = () => process.env.ROADMAP_PASSWORD ?? '';
export const passFor = (pw: string) => createHash('sha256').update(`roadmap:${pw}:${process.env.HC_SERVER_SECRET ?? 'hc'}`).digest('hex');
export function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function passOk(pass?: string) {
  const pw = password();
  return Boolean(pw && pass && same(pass, passFor(pw)));
}
