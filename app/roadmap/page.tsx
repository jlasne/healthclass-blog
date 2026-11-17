import { cookies } from 'next/headers';
import { Roadmap } from '@/components/Roadmap';
import { site } from '@/lib/site';
import { passOk } from './pass';
import { Gate } from './Gate';
import { meta } from '@/lib/seo';

// The team's 2027 roadmap: hidden (noindex, not in the sitemap or the menu) and behind the team password (the Vercel
// environment variable ROADMAP_PASSWORD). Without a valid pass, only the password card renders.
export const metadata = meta({ title: 'Roadmap 2027', description: 'The app calendar: a big update and a live every month, 3 new languages, and the promotions of the year.', path: '/roadmap', noindex: true });

async function unlocked() {
  return passOk((await cookies()).get('hc_roadmap')?.value);
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
          Our plan for 2027: a big update and a live with Dr. Dana every month, 3 new languages, and promotions on the big dates of the year. A question or a change request? Email us at <a className="link" href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <div style={{ marginTop: 28 }}><Roadmap /></div>
      </div>
    </section>
  );
}
