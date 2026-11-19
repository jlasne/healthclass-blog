'use client';
// The letters archive: the newest one featured, then every Class Notes issue and every letter as a card, with a search
// box and a filter (All, Class Notes, Letters). All in the browser (the list is small).
import { useState } from 'react';
import { Icon } from './Icon';

export type LetterItem = { slug: string; kind: 'issue' | 'letter'; n?: number; title: string; excerpt: string; topic: string; tone: string; cat: string; date: string; dateLabel: string; minutes: number; keywords: string[] };

const KINDS = [['all', 'All'], ['issue', 'Class Notes'], ['letter', 'Letters']] as const;
const label = (a: LetterItem) => (a.kind === 'issue' ? `Class Notes · ${a.topic}` : a.topic);

function Card({ a, big = false }: { a: LetterItem; big?: boolean }) {
  return (
    <a className={`acard tone--${a.tone}${big ? ' acard--big' : ''}`} href={`/letters/${a.slug}`}>
      <span className="acard__art" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cat" src={`/cats/${a.cat}.svg`} width={big ? 168 : 112} height={big ? 168 : 112} alt="" loading={big ? 'eager' : 'lazy'} />
        <span className="acard__no">{a.kind === 'issue' ? `NO. ${a.n}` : ''}</span>
      </span>
      <span className="acard__body">
        <span className="acard__meta">
          <span className="pill">{label(a)}</span>
          <time dateTime={a.date}>{a.dateLabel}</time>
          <span className="dot" aria-hidden="true" />
          <span>{a.minutes} min</span>
        </span>
        <span className="acard__t">{a.title}</span>
        <span className="acard__x">{a.excerpt}</span>
        <span className="acard__go">{big ? 'Read the latest' : 'Read'} <Icon name="arrow" /></span>
      </span>
    </a>
  );
}

export function LetterSearch({ items }: { items: LetterItem[] }) {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<(typeof KINDS)[number][0]>('all');
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = items.filter((a) => {
    if (kind !== 'all' && a.kind !== kind) return false;
    const hay = `${a.title} ${a.excerpt} ${a.topic} ${a.keywords.join(' ')}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
  const browsing = !words.length && kind === 'all';
  const [first, ...rest] = shown;
  return (
    <>
      <div className="search" role="search">
        <Icon name="book" />
        <label htmlFor="letter-q" className="sr-only">Search the letters</label>
        <input id="letter-q" type="search" placeholder="Search: leaks, Kegels, fiber, pregnancy..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="search__topics" role="group" aria-label="Show">
        {KINDS.map(([k, name]) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
            {name} <small>{k === 'all' ? items.length : items.filter((a) => a.kind === k).length}</small>
          </button>
        ))}
      </div>
      {shown.length ? (
        <>
          {browsing && first && <Card a={first} big />}
          <ol className="agrid">
            {(browsing ? rest : shown).map((a) => <li key={a.slug}><Card a={a} /></li>)}
          </ol>
        </>
      ) : (
        <p className="search__empty">No letter matches yet. Try another word, or ask Dr. Dana in the next live.</p>
      )}
    </>
  );
}
