import { Cat } from './Cat';
import { fmtDate, type Article } from '@/lib/articles';

// The archive's rows (like a letters archive): date, read time, title, one line. The cat on its tone at the right.
export function Letters({ items, headingLevel = 'h2' }: { items: Article[]; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel;
  return (
    <ol className="letters">
      {items.map((a, i) => (
        <li key={a.slug} data-rise style={{ ['--i' as string]: i }}>
          <a className={`letter tone--${a.tone}`} href={`/letters/${a.slug}`}>
            <div>
              <div className="letter__meta">
                <span className="pill">{a.topic}</span>
                <time dateTime={a.date}>{fmtDate(a.date, 'short')}</time>
                <span className="dot" aria-hidden="true" />
                <span>{a.minutes} min read</span>
              </div>
              <H className="letter__t">{a.title}</H>
              <p className="letter__x">{a.excerpt}</p>
            </div>
            <span className="letter__art" aria-hidden="true"><Cat pose={a.cat} width={104} /></span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export function Feature({ a }: { a: Article }) {
  return (
    <a className={`feature tone--${a.tone}`} href={`/letters/${a.slug}`} data-rise>
      <Cat pose="peek" width={150} className="peek peek--left" />
      <div>
        <div className="letter__meta">
          <span className="pill">Latest letter</span>
          <time dateTime={a.date}>{fmtDate(a.date, 'short')}</time>
          <span className="dot" aria-hidden="true" />
          <span>{a.minutes} min read</span>
        </div>
        <h3 className="letter__t">{a.title}</h3>
        <p className="letter__x">{a.excerpt}</p>
        <span className="arrow" style={{ marginTop: 18 }}>Read the letter</span>
      </div>
      <span className="feature__art" aria-hidden="true"><Cat pose={a.cat} width={300} /></span>
    </a>
  );
}
