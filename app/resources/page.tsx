import { Cat } from '@/components/Cat';
import { JsonLd } from '@/components/JsonLd';
import { FamilyDoors, ResourceRows } from '@/components/Resource';
import { getResources } from '@/lib/resources';
import { breadcrumbs, graph, meta, orgId } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

export const metadata = meta({
  title: 'Pelvic floor resources for women: free tools, classes, comparisons',
  description: 'Free pelvic floor tools, the classes week by week, apps side by side and help for your moment: sneezing, running, after birth, menopause.',
  path: '/resources',
});

export default function Page() {
  const all = getResources();
  return (
    <>
      <section className="hero hero--center hero--band">
        <div className="read">
          <div className="hero__cat" aria-hidden="true"><Cat pose="read" width={240} priority /></div>
          <h1 className="h1 h1--xl">Resources for your <em>pelvic floor</em>.</h1>
          <p className="lede">Free tools, the classes week by week, apps side by side, and help for your moment.</p>
        </div>
      </section>
      <section className="wrap" aria-label="The 4 families">
        <FamilyDoors />
      </section>
      {all.length > 0 && (
        <section className="read archive" aria-label="Newest pages" style={{ paddingTop: 56, paddingBottom: 72 }}>
          <h2 className="archive__h">Newest pages</h2>
          <ResourceRows items={all.slice(0, 12)} showFamily />
        </section>
      )}
      <JsonLd
        data={graph(
          {
            '@type': 'CollectionPage',
            '@id': absoluteUrl('/resources#page'),
            name: 'Pelvic floor resources for women',
            url: absoluteUrl('/resources'),
            publisher: { '@id': orgId },
            hasPart: all.map((r) => ({ '@type': 'WebPage', name: r.title, url: absoluteUrl(r.path) })),
          },
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Resources', path: '/resources' }]),
        )}
      />
    </>
  );
}
