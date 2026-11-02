import { NewsletterForm } from './NewsletterForm';
import { Cat, type Pose } from './Cat';
import { dana, site } from '@/lib/site';

// The newsletter block, built for trust: who writes it (a face, a name, a credential), what is inside (3 concrete
// things), how often (1 a week), what it costs (nothing), how to leave (1 click), and where the email goes.
export function Newsletter({
  source,
  tag,
  title = <>1 letter a week from a <em>urologist</em>. Free.</>,
  text = 'Short, sourced and kind. Each Sunday, Dr. Dana sends the one thing she wants every woman to know about her pelvic floor.',
  compact = false,
  pose = 'write',
  as = 'h2',
  peek = false,
}: {
  source: string;
  tag?: string;
  title?: React.ReactNode;
  text?: string;
  compact?: boolean;
  pose?: Pose;
  as?: 'h2' | 'h3';
  peek?: boolean;
}) {
  const H = as;
  if (peek) {
    return (
      <div className="nl-wrap">
        <Cat pose="peek" width={150} className="peek" />
        <Newsletter source={source} tag={tag} title={title} text={text} compact={compact} pose={pose} as={as} />
      </div>
    );
  }
  return (
    <section className={compact ? 'nl nl--compact' : 'nl'} aria-label={`${site.newsletter.name}, the free newsletter`}>
      <div>
        <div className="nl__who">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dana.avatar} alt={dana.name} width={44} height={44} loading="lazy" />
          <div>
            <b>{site.newsletter.name} · by {dana.name}</b>
            <span>{dana.role}, {dana.practice}</span>
          </div>
        </div>
        <H className={compact ? 'h3' : 'h2'} style={compact ? undefined : { fontSize: 'clamp(30px, 3.6vw, 44px)' }}>{title}</H>
        <p className="nl__p">{text}</p>
        {!compact && (
          <ul className="nl__inside" aria-label="In every letter">
            <li className="tone--rosy"><b>1 idea</b>What the research says, in plain words, with its source.</li>
            <li className="tone--sky"><b>1 exercise</b>A 2-minute move to try the same day.</li>
            <li className="tone--plum"><b>1 question</b>A reader asks. Dr. Dana answers.</li>
          </ul>
        )}
        <NewsletterForm source={source} tag={tag} />
      </div>
      <div className="nl__art" aria-hidden="true"><Cat pose={pose} width={230} /></div>
    </section>
  );
}
