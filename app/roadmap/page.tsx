import { cookies } from 'next/headers';
import { Roadmap } from '@/components/Roadmap';
import { api, convex, secret } from '@/lib/convex';
import { Gate } from './Gate';
import { meta } from '@/lib/seo';

// The team's 2027 roadmap: hidden (noindex, not in the sitemap or the menu) and behind the team password, checked by
// Convex (convex/roadmap.ts). Without a valid pass, only the password card renders.
export const metadata = meta({ title: 'Roadmap 2027', description: 'The app calendar: a micro update, a big update and a live every month.', path: '/roadmap', noindex: true });

async function unlocked() {
  const pass = (await cookies()).get('hc_roadmap')?.value;
  const c = convex();
  if (!pass || !c) return false;
  return c.query(api.roadmap.check, { secret, pass }).catch(() => false);
}

export default async function Page() {
  if (!(await unlocked())) {
    return (
      <section className="sec" style={{ paddingTop: 'clamp(28px, 5vw, 64px)' }}>
        <div className="wrap">
          <h1 className="h1" style={{ fontSize: 'clamp(38px, 5vw, 60px)' }}>Roadmap <em>2027</em></h1>
          <Gate />
        </div>
      </section>
    );
  }
  return (
    <section className="sec" style={{ paddingTop: 'clamp(28px, 5vw, 64px)' }}>
      <div className="wrap">
        <h1 className="h1" style={{ fontSize: 'clamp(38px, 5vw, 60px)' }}>Roadmap <em>2027</em></h1>
        <p className="lede" style={{ maxWidth: '60ch' }}>
          Every month: a micro update, a big update, then a live with Dr. Dana. Plus promotions on the big dates of the year. The update names are examples for now: we pick the real ones each month.
        </p>
        <div style={{ marginTop: 28 }}><Roadmap /></div>
      </div>
    </section>
  );
}
