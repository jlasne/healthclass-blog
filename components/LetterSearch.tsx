'use client';
// The archive with a search box, all in the browser (the list is small).
import { useState } from 'react';
import { Icon } from './Icon';

export type LetterItem = { slug: string; title: string; excerpt: string; topic: string; tone: string; cat: string; date: string; dateLabel: string; minutes: number; keywords: string[] };

export function LetterSearch({ items }: { items: LetterItem[] }) {
  const [q, setQ] = useState('');
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = items.filter((a) => {
    const hay = `${a.title} ${a.excerpt} ${a.topic} ${a.keywords.join(' ')}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
  return (
    <>
      <div className="search" role="search">
        <Icon name="book" />
        <label htmlFor="letter-q" className="sr-only">Search the letters</label>
        <input id="letter-q" type="search" placeholder="Search: leaks, Kegels, pregnancy..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {shown.length ? (
        <ol className="letters">
          {shown.map((a) => (
            <li key={a.slug}>
              <a className={`letter tone--${a.tone}`} href={`/letters/${a.slug}`}>
                <div>
                  <div className="letter__meta">
                    <span className="pill">{a.topic}</span>
                    <time dateTime={a.date}>{a.dateLabel}</time>
                    <span className="dot" aria-hidden="true" />
                    <span>{a.minutes} min read</span>
                  </div>
                  <h2 className="letter__t">{a.title}</h2>
                  <p className="letter__x">{a.excerpt}</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <span className="letter__art" aria-hidden="true"><img className="cat" src={`/cats/${a.cat}.svg`} width={104} height={104} alt="" loading="lazy" /></span>
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p className="search__empty">No letter matches yet. Try another word, or ask Dr. Dana in the next live.</p>
      )}
    </>
  );
}
