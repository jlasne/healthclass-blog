import { NewsletterForm } from './NewsletterForm';
import { Cat, type Pose } from './Cat';
import { dana } from '@/lib/site';

// The letter signup, kept simple: who writes it, one line, one field. The trust lines sit under the field
// (free, 1 email a week, leave in 1 click, where the email goes).
export function Newsletter({
  source,
  tag,
  title = <>1 letter a week from a <em>urologist</em>.</>,
  pose = 'write',
  as = 'h2',
  peek = false,
  compact = false,
}: {
  source: string;
  tag?: string;
  title?: React.ReactNode;
  text?: string;
  pose?: Pose;
  as?: 'h2' | 'h3';
  peek?: boolean;
  compact?: boolean;
}) {
  const H = as;
  const box = (
    <section className={compact ? 'nl nl--compact' : 'nl'} aria-label="The free weekly letter">
      <div>
        <div className="nl__who">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dana.avatar} alt={dana.name} width={44} height={44} loading="lazy" />
          <div>
            <b>{dana.name}</b>
            <span>{dana.role}</span>
          </div>
        </div>
        <H className="h3 nl__t">{title}</H>
        <NewsletterForm source={source} tag={tag} />
      </div>
      {!compact && <div className="nl__art" aria-hidden="true"><Cat pose={pose} width={180} /></div>}
    </section>
  );
  if (!peek) return box;
  return (
    <div className="nl-wrap">
      <Cat pose="peek" width={150} className="peek" />
      {box}
    </div>
  );
}
