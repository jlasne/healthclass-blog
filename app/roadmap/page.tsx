import { Roadmap } from '@/components/Roadmap';
import { meta } from '@/lib/seo';

// The team's 2027 roadmap: hidden (noindex, not in the sitemap or the menu), open to anyone with the link.
export const metadata = meta({ title: 'Roadmap 2027', description: 'The app calendar: a live, a micro update and a new program every month.', path: '/roadmap', noindex: true });

export default function Page() {
  return (
    <section className="sec" style={{ paddingTop: 'clamp(28px, 5vw, 64px)' }}>
      <div className="wrap">
        <h1 className="h1" style={{ fontSize: 'clamp(38px, 5vw, 60px)' }}>Roadmap <em>2027</em></h1>
        <p className="lede" style={{ maxWidth: '60ch' }}>
          Every month ends on 3 moments: a micro update, a new program, then the live with Dr. Dana, who presents it. Promotions follow the key dates of the year. Pick Dr. Dana&rsquo;s live day and the calendar follows. Names are proposals.
        </p>
        <div style={{ marginTop: 28 }}><Roadmap /></div>
      </div>
    </section>
  );
}
