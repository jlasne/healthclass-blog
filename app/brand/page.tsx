import { cookies } from 'next/headers';
import tokens from '@/brand/tokens.json';
import { meta } from '@/lib/seo';
import { passOk } from '../roadmap/pass';
import { Gate } from '../roadmap/Gate';
import s from './brand.module.css';

// The brand at a glance: colors, type, logo, the cat, the voice. Hidden (noindex, not in the sitemap), behind the team
// password (the same one as /roadmap). The full text is in brand/ (synced from jlasne/healthclass, folder brand/).
export const metadata = meta({ title: 'Brand', description: 'The Health Class brand at a glance: colors, type, logo, the cat, the voice.', path: '/brand', noindex: true });

const POSES = ['bell', 'calendar', 'cheer', 'gift', 'hammock', 'heart', 'hello', 'laugh', 'lift', 'peek', 'read', 'reading', 'selfie', 'sleep', 'stretch', 'think', 'worry', 'write'];
const GROUPS: { name: string; keys: string[] }[] = [
  { name: 'Rose: the next action', keys: ['roseInk', 'rose', 'roseDark', 'blush', 'roseTint', 'roseSoft'] },
  { name: 'Plum: structure', keys: ['plum', 'plumDeep', 'plumTint', 'plumMist'] },
  { name: 'Sky: balance', keys: ['sky', 'sky2', 'skySoft', 'skyMist'] },
  { name: 'Neutrals', keys: ['paper', 'white', 'ink', 'ink2', 'mutedDark', 'muted', 'faint', 'well'] },
];
const RULES = [
  ['No em dashes.', 'Use a period, a comma or a colon.'],
  ['Sentences under 30 words.', 'One idea per sentence.'],
  ['Data instead of adjectives.', '"56% reported cure" beats "very effective".'],
  ['No weasel words.', 'Say who and how many.'],
  ['The so-what test.', 'If a line changes nothing for her, cut it.'],
  ['The simplest wording.', 'The short word, the plain verb.'],
  ['Say what she gets.', 'Avoid negations unless the outcome is one: "Laugh without worrying".'],
];
const EXAMPLES = [
  ['Our revolutionary app dramatically improves bladder control.', 'In a Cochrane review, 56% of women who trained reported cure of stress leaks, against 6% without.'],
  ['We don\'t want you to worry about leaks.', 'Laugh without worrying.'],
  ['Click here to sign up for our exciting newsletter!', 'Get the launch-day email.'],
];

const ink = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? '#2A2421' : '#FFFFFF';
};
type Color = { hex: string; use: string; app?: string; site?: string };

export default async function Page() {
  const open = passOk((await cookies()).get('hc_roadmap')?.value);
  if (!open) {
    return (
      <section className="sec" style={{ paddingTop: 'clamp(28px, 5vw, 64px)' }}>
        <div className="wrap">
          <h1 className="h1" style={{ fontSize: 'clamp(38px, 5vw, 60px)' }}>Brand</h1>
          <Gate />
        </div>
      </section>
    );
  }
  const colors = tokens.color as unknown as Record<string, Color>;
  return (
    <section className="sec" style={{ paddingTop: 'clamp(28px, 5vw, 64px)' }}>
      <div className="wrap">
        <h1 className="h1" style={{ fontSize: 'clamp(38px, 5vw, 60px)' }}>Health Class <em>brand</em></h1>
        <p className="lede" style={{ maxWidth: '60ch' }}>One look, one voice, on the app, the website and the stores. The full text lives in the repo folder <code>brand/</code>.</p>

        <h2 className={s.h}>Colors</h2>
        <p className={s.sub}>Rose and plum carry the brand, sky balances. No yellow, lavender, green, peach or tan. One rose element per screen: the next action.</p>
        {GROUPS.map((g) => (
          <div key={g.name} className={s.group}>
            <h3>{g.name}</h3>
            <ul className={s.swatches}>
              {g.keys.map((k) => {
                const c = colors[k];
                return (
                  <li key={k} className={s.sw} style={{ background: c.hex, color: ink(c.hex), boxShadow: c.hex.toUpperCase() === '#FFFBF6' || c.hex.toUpperCase() === '#FFFFFF' ? 'inset 0 0 0 1px var(--hair)' : undefined }}>
                    <b>{k}</b>
                    <code>{c.hex}</code>
                    <span>{c.use}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <h2 className={s.h}>Tones</h2>
        <p className={s.sub}>A tile&rsquo;s pastel. The words on a tone are always plum.</p>
        <ul className={s.tones}>
          {Object.entries(tokens.tones).map(([name, t]) => (
            <li key={name} style={{ background: t.fill, boxShadow: `inset 0 0 0 10px ${t.shape}`, color: t.ink }}>{name}</li>
          ))}
        </ul>

        <h2 className={s.h}>Type</h2>
        <div className={s.type}>
          <div>
            <small>Website titles: Playfair Display</small>
            <p className={s.title}>Laugh out loud <em>again</em>.</p>
            <small>Website text: Source Sans 3, lining numerals</small>
            <p className={s.body}>In a Cochrane review, 56% of women who trained reported cure of stress leaks, against 6% without. Every number links to its source.</p>
            <small>Caveat: sketch labels and the signature only</small>
            <p className={s.hand}>Dr. Kivlin</p>
          </div>
          <div>
            <small>App and store images</small>
            <p className={s.plain}><b>Fraunces</b> for titles (34, 30, 26, 22, 19 px) and numbers. <b>Instrument Sans</b> for text (17, 15, 13 px). Store headlines: Fraunces Light, the key word in rose-ink italic over the smile bar.</p>
          </div>
        </div>

        <h2 className={s.h}>Logo and teacher</h2>
        <div className={s.logos}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <figure><img src="/logo.svg" alt="Health Class logo" width={120} height={104} /><figcaption>The logo: HC and the smile bar</figcaption></figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <figure><img src="/icon.png" alt="App icon" width={104} height={104} className={s.icon} /><figcaption>App icon: white on rose</figcaption></figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <figure><img src="/media/dana/avatar.webp" alt="Dr. Kivlin" width={104} height={104} className={s.avatar} /><figcaption>Dr. Kivlin: her headshot only, no video stills</figcaption></figure>
        </div>
        <p className={s.sub}>Names: <b>Dr. Kivlin</b> on every public page. <b>Dr. Hapee Bladder</b> is her Instagram persona and the Class Notes sender. Not &ldquo;Dr. Dana&rdquo; in public.</p>

        <h2 className={s.h}>The cat</h2>
        <p className={s.sub}>Hand-drawn in plum ink, white fur, 6 frames at 7 a second. One per screen at most, doing what the screen is about.</p>
        <ul className={s.cats}>
          {POSES.map((p) => (
            <li key={p}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/cats/${p}.svg`} alt="" width={96} height={96} loading="lazy" />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <h2 className={s.h}>Voice</h2>
        <ol className={s.rules}>
          {RULES.map(([a, b]) => (<li key={a}><b>{a}</b> {b}</li>))}
        </ol>
        <div className={s.ex}>
          {EXAMPLES.map(([no, yes]) => (
            <div key={no}>
              <p className={s.no}>{no}</p>
              <p className={s.yes}>{yes}</p>
            </div>
          ))}
        </div>
        <p className={s.sub}>Never invent a claim, a quote or an experience. Every number has a source. No &ldquo;cure&rdquo; as a promise, no price or &ldquo;free&rdquo; in store images.</p>
      </div>
    </section>
  );
}
