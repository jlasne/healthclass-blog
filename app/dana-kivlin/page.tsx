import { DanaBio } from '@/components/DanaBio';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbs, danaId, graph, meta, dt } from '@/lib/seo';
import { absoluteUrl, dana } from '@/lib/site';

// Dr. Dana, in her own words: who she is, why the class, where to find her, then her letter (components/DanaBio.tsx).
export const metadata = meta({
  title: `${dana.name}, Urologist · Pelvic Health for Women`,
  description: `${dana.name} is a board-certified urologist with fellowship training in urogynecology and certification in menopause medicine. Why she made a pelvic floor class for women, and where to find her.`,
  path: '/dana-kivlin',
});

export default function Page() {
  return (
    <>
      <DanaBio />
      <JsonLd data={graph({ '@type': 'ProfilePage', '@id': absoluteUrl('/dana-kivlin'), url: absoluteUrl('/dana-kivlin'), name: dana.name, mainEntity: { '@id': danaId }, dateModified: dt('2026-11-09') }, breadcrumbs([{ name: 'Home', path: '/' }, { name: dana.name, path: '/dana-kivlin' }]))} />
    </>
  );
}
