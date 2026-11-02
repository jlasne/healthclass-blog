import 'server-only';
// Share images (1200 x 630): paper, the blush glow, a big Fraunces title, Dr. Dana's byline and the cat on its tone.
import fs from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import cats from './cats.json';
import { dana } from './site';

const root = process.cwd();
const font = (f: string) => fs.readFileSync(path.join(root, 'lib/og-fonts', f));
const TONES = { rosy: '#F9D5DB', plum: '#EADBE2', blush: '#F7C6CE', sky: '#C5DDF1' } as const;

export const ogSize = { width: 1200, height: 630 };

export function ogImage({ eyebrow, title, pose = 'hello', tone = 'rosy', foot }: { eyebrow: string; title: string; pose?: keyof typeof cats.sizes; tone?: keyof typeof TONES; foot?: string }) {
  const svg = fs.readFileSync(path.join(root, 'public/cats/still', `${pose}.svg`), 'utf8');
  const cat = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  const logo = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 27 60 52"><path d="${cats.logo.hc}" fill="#B93D57"/><path d="${cats.logo.bar}" fill="none" stroke="#D9566F" stroke-width="4.6" stroke-linecap="round"/></svg>`).toString('base64')}`;
  const s = cats.sizes[pose];
  const size = title.length > 34 ? 66 : 80;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#FFFBF6', backgroundImage: 'radial-gradient(900px 380px at 50% -80px, rgba(247,198,206,.75), rgba(247,198,206,0))', padding: '64px 72px', fontFamily: 'Instrument' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width={64} height={56} alt="" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'Fraunces', fontSize: 28, color: '#2A2421' }}>Pelvic Health Class</span>
              <span style={{ fontFamily: 'FrauncesItalic', fontSize: 22, color: '#B93D57', marginTop: -2 }}>for Women</span>
            </div>
          </div>
          <span style={{ marginTop: 54, fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', color: '#7C2D4B' }}>{eyebrow}</span>
          <span style={{ marginTop: 14, fontFamily: 'Fraunces', fontSize: size, lineHeight: 1.04, letterSpacing: -2, color: '#2A2421' }}>{title}</span>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 54, height: 12, borderBottom: '4px solid #D9566F', borderRadius: '0 0 50% 50%' }} />
            <span style={{ fontSize: 24, color: '#4A3F39' }}>{foot ?? `${dana.name} · ${dana.role}`}</span>
          </div>
        </div>
        <div style={{ width: 380, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: 10, left: 20, width: 340, height: 340, borderRadius: 999, background: TONES[tone] }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cat} width={360} height={Math.round((360 * s.h) / s.w)} alt="" style={{ position: 'relative' }} />
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: 'Fraunces', data: font('fraunces-latin-400-normal.woff'), weight: 400, style: 'normal' },
        { name: 'FrauncesItalic', data: font('fraunces-latin-400-italic.woff'), weight: 400, style: 'italic' },
        { name: 'Instrument', data: font('instrument-sans-latin-600-normal.woff'), weight: 600, style: 'normal' },
      ],
    },
  );
}
