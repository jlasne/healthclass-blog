import { notFound } from 'next/navigation';
import { Cat } from '@/components/Cat';
import { JsonLd } from '@/components/JsonLd';
import { Em, FamilyDoors, ResourceRows } from '@/components/Resource';
import { FAMILIES, FAMILY_IDS, getResources, isFamily } from '@/lib/resources';
import { breadcrumbs, graph, meta, orgId } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;
export const dynamicParams = false;
export function generateStaticParams() {
  return FAMILY_IDS.map((family) => ({ family }));
}

export async function generateMetadata({ params }: { params: Promise<{ family: string }> }) {
  const { family } = await params;
  if (!isFamily(family)) return {};
  const f = FAMILIES[family];
  // a family with no page yet stays out of Google until its first page is out
  return meta({ title: f.seoTitle, description: f.description, path: `/resources/${family}`, noindex: getResources(family).length === 0 });
}

export default async function Page({ params }: { params: Promise<{ family: string }> }) {
  const { family } = await params;
  if (!isFamily(family)) notFound();
  const f = FAMILIES[family];
  const items = getResources(family);
  return (
    <>
      <section className={`hero hero--center hero--band tone--${f.tone}`}>
        <div className="read">
          <a className="post-hd__back hub__back" href="/resources">Resources</a>
          <div className="hero__cat" aria-hidden="true"><Cat pose={f.cat} width={230} priority /></div>
          <h1 className="h1 h1--xl"><Em text={f.h1} /></h1>
          <p className="lede">{f.line}</p>
        </div>
      </section>
      <section className="read archive" aria-label={f.name} style={{ paddingBottom: 56 }}>
        <h2 className="archive__h">{f.name}</h2>
        {items.length ? <ResourceRows items={items} /> : <p className="search__empty">The first page lands soon.</p>}
      </section>
      <section className="wrap" aria-label="More resources" style={{ paddingBottom: 72 }}>
        <h2 className="archive__h">More resources</h2>
        <FamilyDoors current={family} />
      </section>
      <JsonLd
        data={graph(
          {
            '@type': 'CollectionPage',
            '@id': absoluteUrl(`/resources/${family}#page`),
            name: f.name,
            description: f.description,
            url: absoluteUrl(`/resources/${family}`),
            publisher: { '@id': orgId },
            hasPart: items.map((r) => ({ '@type': 'WebPage', name: r.title, url: absoluteUrl(r.path) })),
          },
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Resources', path: '/resources' }, { name: f.name, path: `/resources/${family}` }]),
        )}
      />
    </>
  );
}
