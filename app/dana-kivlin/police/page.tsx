import localFont from 'next/font/local';
import { DanaBio } from '@/components/DanaBio';
import { FontSwitch, type FontOption } from '@/components/FontSwitch';
import { meta } from '@/lib/seo';

// Font test for Dr. Dana (she asked to compare text fonts): her page, with a switch at the bottom between today's
// font and 10 others. Hidden from search. Only the text font changes; headings stay in Fraunces.
const dmSans = localFont({ src: '../../fonts/dm-sans-latin-wght-normal.woff2', weight: '100 1000', preload: false });
const nunitoSans = localFont({ src: '../../fonts/nunito-sans-latin-wght-normal.woff2', weight: '200 1000', preload: false });
const figtree = localFont({ src: '../../fonts/figtree-latin-wght-normal.woff2', weight: '300 900', preload: false });
const jakarta = localFont({ src: '../../fonts/plus-jakarta-sans-latin-wght-normal.woff2', weight: '200 800', preload: false });
const manrope = localFont({ src: '../../fonts/manrope-latin-wght-normal.woff2', weight: '200 800', preload: false });
const outfit = localFont({ src: '../../fonts/outfit-latin-wght-normal.woff2', weight: '100 900', preload: false });
const workSans = localFont({ src: '../../fonts/work-sans-latin-wght-normal.woff2', weight: '100 900', preload: false });
const franklin = localFont({ src: '../../fonts/libre-franklin-latin-wght-normal.woff2', weight: '100 900', preload: false });
const sourceSerif = localFont({ src: '../../fonts/source-serif-4-latin-wght-normal.woff2', weight: '200 900', preload: false });
const lora = localFont({ src: '../../fonts/lora-latin-wght-normal.woff2', weight: '400 700', preload: false });

const SANS = 'sans-serif', SERIF = 'Georgia, serif';
const OPTIONS: FontOption[] = [
  { id: 'today', name: 'Instrument Sans (today)', feel: 'the font the site uses now', family: 'var(--font-instrument), sans-serif' },
  { id: 'dm-sans', name: 'DM Sans', feel: 'clean and round', family: `${dmSans.style.fontFamily}, ${SANS}` },
  { id: 'nunito-sans', name: 'Nunito Sans', feel: 'soft and warm', family: `${nunitoSans.style.fontFamily}, ${SANS}` },
  { id: 'figtree', name: 'Figtree', feel: 'friendly and modern', family: `${figtree.style.fontFamily}, ${SANS}` },
  { id: 'plus-jakarta-sans', name: 'Plus Jakarta Sans', feel: 'polished, a little wide', family: `${jakarta.style.fontFamily}, ${SANS}` },
  { id: 'manrope', name: 'Manrope', feel: 'crisp and technical', family: `${manrope.style.fontFamily}, ${SANS}` },
  { id: 'outfit', name: 'Outfit', feel: 'geometric and light', family: `${outfit.style.fontFamily}, ${SANS}` },
  { id: 'work-sans', name: 'Work Sans', feel: 'plain and sturdy', family: `${workSans.style.fontFamily}, ${SANS}` },
  { id: 'libre-franklin', name: 'Libre Franklin', feel: 'classic newspaper sans', family: `${franklin.style.fontFamily}, ${SANS}` },
  { id: 'source-serif-4', name: 'Source Serif 4', feel: 'a book serif, calm to read', family: `${sourceSerif.style.fontFamily}, ${SERIF}` },
  { id: 'lora', name: 'Lora', feel: 'a warm, curvy serif', family: `${lora.style.fontFamily}, ${SERIF}` },
];

export const metadata = meta({ title: 'Font test', description: 'A font test of Dr. Dana’s page.', path: '/dana-kivlin/police', noindex: true });

export default function Page() {
  return (
    <>
      <DanaBio />
      <FontSwitch options={OPTIONS} />
    </>
  );
}
