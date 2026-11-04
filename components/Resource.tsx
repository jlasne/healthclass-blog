// The resource pages' blocks (server). Every block reuses the letters' look: paper, rose and plum, Fraunces titles,
// the cat on its tone, the same boxes and cards. A page shows only the blocks its front matter fills.
import { Cat } from './Cat';
import { Icon } from './Icon';
import { GetApp } from './Waitlist';
import { Phone } from './AppBand';
import { fmtDate, getArticle, type Article } from '@/lib/articles';
import { FAMILIES, FAMILY_IDS, getResources, resolve, splitEm, type FamilyId, type Resource } from '@/lib/resources';
import { appFacts } from '@/lib/app-facts';

// "Laugh *again*." with the starred words in the rose italic
export function Em({ text }: { text: string }) {
  return <>{splitEm(text).map((p, i) => (p.em ? <em key={i}>{p.text}</em> : <span key={i}>{p.text}</span>))}</>;
}

// a family's rows, like the letters' archive: family pill, date, title, one line, the cat on its tone
export function ResourceRows({ items, showFamily = false }: { items: Resource[]; showFamily?: boolean }) {
  return (
    <ol className="letters">
      {items.map((r, i) => (
        <li key={r.path} data-rise style={{ ['--i' as string]: i }}>
          <a className={`letter tone--${r.tone}`} href={r.path}>
            <div>
              <div className="letter__meta">
                <span className="pill">{showFamily ? FAMILIES[r.family].name : (r.status === 'soon' ? 'On the way' : FAMILIES[r.family].name)}</span>
                <time dateTime={r.updated}>Updated {fmtDate(r.updated, 'short')}</time>
                <span className="dot" aria-hidden="true" />
                <span>{r.minutes} min read</span>
              </div>
              <h2 className="letter__t">{r.title}</h2>
              <p className="letter__x">{r.excerpt}</p>
            </div>
            <span className="letter__art" aria-hidden="true"><Cat pose={r.cat} width={104} /></span>
          </a>
        </li>
      ))}
    </ol>
  );
}

// the 4 families, as the home page's doors
export function FamilyDoors({ current }: { current?: FamilyId }) {
  const ids = FAMILY_IDS.filter((f) => f !== current);
  return (
    <div className={ids.length === 4 ? 'doors doors--4' : 'doors'}>
      {ids.map((f) => {
        const fam = FAMILIES[f];
        const n = getResources(f).length;
        return (
          <a key={f} className="door" href={`/resources/${f}`}>
            <span className={`tone-disc tone--${fam.tone}`} aria-hidden="true"><Cat pose={fam.cat} width={76} /></span>
            <div><b>{fam.name}</b><span>{n === 0 ? 'First page soon' : `${n} ${n === 1 ? 'page' : 'pages'}`}</span></div>
          </a>
        );
      })}
    </div>
  );
}

// the short answer: what Google can quote, what a skimmer needs
export function ShortAnswer({ text }: { text: string }) {
  if (!text) return null;
  return (
    <aside className="box box--answer">
      <span className="box__k"><Icon name="sparkle" /> The short answer</span>
      <p><Em text={text} /></p>
    </aside>
  );
}

// compare: the facts table, then what each one does best, then who should pick which
const US = 'Health Class';

// when the facts were checked: the other side's (its store page, its site) and ours (lib/app-facts.ts)
function Checked({ them, theirs, ours }: { them?: string; theirs: string; ours?: string }) {
  if (!ours || ours === theirs) return <p className="vs__checked">Facts checked on <time dateTime={theirs}>{fmtDate(theirs)}</time>. Sources below.</p>;
  return (
    <p className="vs__checked">
      {them ?? 'Other'} facts checked on <time dateTime={theirs}>{fmtDate(theirs)}</time>. Health Class facts on <time dateTime={ours}>{fmtDate(ours)}</time>. Sources below.
    </p>
  );
}
const TONES = ['sky', 'plum', 'blush'] as const;

// 3 sides or more: the same table, one column per side, Health Class in rose; then what each one wins
function CompareMany({ r }: { r: Resource }) {
  const sides = r.sides ?? [];
  const checked = sides.map((x) => x.checked).filter(Boolean).sort().pop();
  let t = 0;
  const tone = (name: string) => (name === US ? 'rosy' : TONES[t++ % TONES.length]);
  return (
    <section className="vs" aria-labelledby="vs-t">
      <div className="vs__hd">
        <h2 id="vs-t" className="h3">{sides.map((x) => x.name).filter((n) => n !== US).join(', ')}{sides.some((x) => x.name === US) ? ' and Health Class' : ''}, <em>side by side</em></h2>
        {checked && <Checked them="Other apps'" theirs={checked} ours={r.appChecked} />}
      </div>
      <div className="vs__tbl">
        <table className={sides.length > 3 ? 'vs--wide' : undefined}>
          <thead>
            <tr><th scope="col"><span className="sr-only">What</span></th>{sides.map((x) => <th key={x.name} scope="col" className={x.name === US ? 'vs__us' : undefined}>{x.name}</th>)}</tr>
          </thead>
          <tbody>
            {(r.rows ?? []).map((row) => (
              <tr key={row.label}><th scope="row">{row.label}</th>{sides.map((x, i) => <td key={x.name} className={x.name === US ? 'vs__us' : undefined} data-label={x.name}>{row.values[i] ?? ''}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      {r.winsBy?.length ? (
        <div className={r.winsBy.length === 2 ? 'wins' : 'wins wins--3'}>
          {r.winsBy.map((w) => (
            <div key={w.name} className={`wins__col tone--${tone(w.name)}`}>
              <h3>Where {w.name} wins</h3>
              <ul>{w.points.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          ))}
        </div>
      ) : null}
      {r.pickBy?.length ? (
        <div className="pick">{r.pickBy.map((p) => <p key={p.name}><b>Pick {p.name} if</b> {p.text}</p>)}</div>
      ) : null}
    </section>
  );
}

export function CompareBlock({ r }: { r: Resource }) {
  if (r.sides?.length && r.rows?.length) return <CompareMany r={r} />;
  if (!r.rival || !r.table?.length) return null;
  const them = r.rival.name;
  return (
    <section className="vs" aria-labelledby="vs-t">
      <div className="vs__hd">
        <h2 id="vs-t" className="h3">Health Class and {them}, <em>side by side</em></h2>
        <Checked them={them} theirs={r.rival.checked} ours={r.appChecked} />
      </div>
      <div className="vs__tbl">
        <table>
          <thead>
            <tr><th scope="col"><span className="sr-only">What</span></th><th scope="col" className="vs__us">Health Class</th><th scope="col">{them}</th></tr>
          </thead>
          <tbody>
            {r.table.map((row) => (
              <tr key={row.label}><th scope="row">{row.label}</th><td className="vs__us" data-label="Health Class">{row.us}</td><td data-label={them}>{row.them}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {r.wins && (
        <div className="wins">
          <div className="wins__col tone--sky">
            <h3>Where {them} wins</h3>
            <ul>{r.wins.them.map((w) => <li key={w}>{w}</li>)}</ul>
          </div>
          <div className="wins__col tone--rosy">
            <h3>Where Health Class wins</h3>
            <ul>{r.wins.us.map((w) => <li key={w}>{w}</li>)}</ul>
          </div>
        </div>
      )}
      {r.pick && (
        <div className="pick">
          <p><b>Pick {them} if</b> {r.pick.them}</p>
          <p><b>Pick Health Class if</b> {r.pick.us}</p>
        </div>
      )}
    </section>
  );
}

// classes: the facts, then the 6 weeks
export function ClassBlock({ r }: { r: Resource }) {
  if (!r.weeks?.length) return null;
  return (
    <section className="weeks" aria-labelledby="weeks-t">
      {r.facts?.length ? <ul className="appcard__facts weeks__facts" aria-label="The class in numbers">{r.facts.map((f) => <li key={f}>{f}</li>)}</ul> : null}
      <h2 id="weeks-t" className="h3">Week by <em>week</em></h2>
      <ol className="join-steps weeks__list tone--rosy">
        {r.weeks.map((w) => (<li key={w.title}><b>{w.title}</b><span>{w.line}</span></li>))}
      </ol>
    </section>
  );
}

// made for you: her goal, then the class that fits
export function ForBlock({ r }: { r: Resource }) {
  if (!r.goal) return null;
  const fit = r.fit ? resolve(r.fit) : null;
  return (
    <section className="goal" aria-label="Your goal">
      <div className="goal__card">
        <span className="tone-disc tone--blush" aria-hidden="true"><Cat pose={r.cat} width={92} /></span>
        <div>
          <span className="eyebrow">Your goal</span>
          <p className="goal__t"><Em text={r.goal} /></p>
        </div>
      </div>
      {fit && (
        <a className="goal__fit" href={fit.path}>
          <span className="goal__k">The class that fits</span>
          <b>{fit.title}</b>
          <span>{fit.excerpt}</span>
          <span className="arrow">See the 6 weeks</span>
        </a>
      )}
    </section>
  );
}

// the doctor note, on every page: the page's own lines first, then the general one
export function DoctorNote({ lines }: { lines: string[] }) {
  return (
    <aside className="box box--doctor" aria-label="Medical note">
      <span className="box__k"><Icon name="alert" /> Education, not medical advice</span>
      <p>This page teaches. It does not diagnose or treat. A doctor can tell what causes your symptoms and what fits you.</p>
      <p style={{ marginBottom: 6 }}><b>See a doctor first if you have:</b></p>
      <ul>
        {[...lines, 'Pain, burning or blood in your urine', 'A fever, or symptoms that get worse', 'Leaks that started suddenly'].filter((v, i, a) => a.indexOf(v) === i).map((l) => <li key={l}>{l}</li>)}
      </ul>
      <p style={{ marginTop: 10 }}>In an emergency, call 911.</p>
    </aside>
  );
}

// the call to action, like the letters' app card: her goal as the title, one rose button
export function AppCta({ title, line }: { title: string; line?: string }) {
  return (
    <section className="sec sec--tight" aria-labelledby="app-cta">
      <div className="wrap">
        <div className="appcard" data-rise>
          <div className="appcard__copy">
            <span className="eyebrow">The app</span>
            <h2 id="app-cta" className="h2"><Em text={title} /></h2>
            {line && <p className="appcard__line">{line}</p>}
            <ul className="appcard__facts" aria-label="What the app gives you">
              <li>A class by a urologist</li>
              <li>{appFacts.minutes}</li>
              <li>{appFacts.trial}</li>
            </ul>
            <GetApp className="btn" icon />
          </div>
          <div className="appcard__phone" aria-hidden="true"><Phone /></div>
        </div>
      </div>
    </section>
  );
}

// the cards under a page: other resources and letters, each with its family
export function NextSteps({ items, letters }: { items: Resource[]; letters: string[] }) {
  // full rows of 3 (3 or 6 cards), with at least 1 letter when the page names one
  const all = letters.map((s) => getArticle(s)).filter((a): a is Article => Boolean(a));
  const n = items.length + all.length >= 6 ? 6 : items.length + all.length >= 3 ? 3 : items.length + all.length;
  const nl = Math.min(all.length, n === 6 ? 2 : 1, n);
  const nr = Math.min(items.length, n - nl);
  const ls = all.slice(0, n - nr);
  items = items.slice(0, nr);
  if (!items.length && !ls.length) return null;
  return (
    <section className="sec sec--tight">
      <div className="wrap">
        <div className="sec__hd"><div><span className="eyebrow">Keep going</span><h2 className="h3" style={{ marginTop: 10 }}>Next steps for your <em>pelvic floor</em></h2></div><a className="arrow" href="/resources">All resources</a></div>
        <div className="related related--next">
          {items.map((r) => (
            <a key={r.path} className={`card tone--${r.tone}`} href={r.path}>
              <span className="card__art" aria-hidden="true"><Cat pose={r.cat} width={118} /></span>
              <span className="pill card__fam">{FAMILIES[r.family].name}</span>
              <b>{r.title}</b>
              <span>{r.minutes} min read</span>
            </a>
          ))}
          {ls.map((a) => (
            <a key={a.slug} className={`card tone--${a.tone}`} href={`/letters/${a.slug}`}>
              <span className="card__art" aria-hidden="true"><Cat pose={a.cat} width={118} /></span>
              <span className="pill card__fam">Letter from Dr. Dana</span>
              <b>{a.title}</b>
              <span>{a.minutes} min read</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
