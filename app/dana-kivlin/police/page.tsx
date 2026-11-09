import localFont from 'next/font/local';
import { DanaBio } from '@/components/DanaBio';
import { FontSwitch, type FontOption } from '@/components/FontSwitch';
import { meta } from '@/lib/seo';

// Font test for Dr. Dana (she asked to compare fonts): her page, with a switch at the bottom between today's look
// and 10 others. Each option sets both the headings and the text, from a distinct style family, so the difference
// shows at a glance. Hidden from search; the fonts load only on this page.
const playfair = localFont({ src: '../../fonts/playfair-display-latin-wght-normal.woff2', weight: '400 900', preload: false, display: 'swap' });
const sourceSans = localFont({ src: '../../fonts/source-sans-3-latin-wght-normal.woff2', weight: '200 900', preload: false, display: 'swap' });
const garamond = localFont({ src: '../../fonts/eb-garamond-latin-wght-normal.woff2', weight: '400 800', preload: false, display: 'swap' });
const nunito = localFont({ src: '../../fonts/nunito-latin-wght-normal.woff2', weight: '200 1000', preload: false, display: 'swap' });
const outfit = localFont({ src: '../../fonts/outfit-latin-wght-normal.woff2', weight: '100 900', preload: false, display: 'swap' });
const robotoSlab = localFont({ src: '../../fonts/roboto-slab-latin-wght-normal.woff2', weight: '100 900', preload: false, display: 'swap' });
const workSans = localFont({ src: '../../fonts/work-sans-latin-wght-normal.woff2', weight: '100 900', preload: false, display: 'swap' });
const cormorant = localFont({ src: '../../fonts/cormorant-latin-wght-normal.woff2', weight: '300 700', preload: false, display: 'swap' });
const raleway = localFont({ src: '../../fonts/raleway-latin-wght-normal.woff2', weight: '100 900', preload: false, display: 'swap' });
const josefin = localFont({ src: '../../fonts/josefin-sans-latin-wght-normal.woff2', weight: '100 700', preload: false, display: 'swap' });
const lato = localFont({ src: [{ path: '../../fonts/lato-latin-400-normal.woff2', weight: '400' }, { path: '../../fonts/lato-latin-700-normal.woff2', weight: '700' }], preload: false, display: 'swap' });
const atkinson = localFont({ src: '../../fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2', weight: '200 800', preload: false, display: 'swap' });
const dmSerif = localFont({ src: '../../fonts/dm-serif-display-latin-400-normal.woff2', weight: '400', preload: false, display: 'swap' });
const dmSans = localFont({ src: '../../fonts/dm-sans-latin-wght-normal.woff2', weight: '100 1000', preload: false, display: 'swap' });
const lora = localFont({ src: '../../fonts/lora-latin-wght-normal.woff2', weight: '400 700', preload: false, display: 'swap' });

const SANS = 'sans-serif', SERIF = 'Georgia, serif';
const f = (x: { style: { fontFamily: string } }, fb: string) => `${x.style.fontFamily}, ${fb}`;
const OPTIONS: FontOption[] = [
  { id: 'today', name: 'Today', feel: 'soft serif headings, clean text', heads: 'Fraunces', text: 'Instrument Sans', headFamily: 'var(--font-fraunces), Georgia, serif', textFamily: 'var(--font-instrument), sans-serif' },
  { id: 'editorial', name: 'Editorial', feel: 'magazine headlines, plain text', heads: 'Playfair Display', text: 'Source Sans 3', headFamily: f(playfair, SERIF), textFamily: f(sourceSans, SANS) },
  { id: 'book', name: 'Classic book', feel: 'like a printed book', heads: 'EB Garamond', text: 'EB Garamond', headFamily: f(garamond, SERIF), textFamily: f(garamond, SERIF) },
  { id: 'rounded', name: 'Rounded', feel: 'soft and friendly, no serif', heads: 'Nunito', text: 'Nunito', headFamily: f(nunito, SANS), textFamily: f(nunito, SANS) },
  { id: 'geometric', name: 'Geometric', feel: 'modern and clean', heads: 'Outfit', text: 'Outfit', headFamily: f(outfit, SANS), textFamily: f(outfit, SANS) },
  { id: 'slab', name: 'Slab', feel: 'sturdy, like a medical chart', heads: 'Roboto Slab', text: 'Work Sans', headFamily: f(robotoSlab, SERIF), textFamily: f(workSans, SANS) },
  { id: 'elegant', name: 'Elegant', feel: 'fine and airy', heads: 'Cormorant', text: 'Raleway', headFamily: f(cormorant, SERIF), textFamily: f(raleway, SANS) },
  { id: 'vintage', name: 'Vintage', feel: '1920s poster headings', heads: 'Josefin Sans', text: 'Lato', headFamily: f(josefin, SANS), textFamily: f(lato, SANS) },
  { id: 'easy', name: 'Easy to read', feel: 'designed for low vision', heads: 'Atkinson Hyperlegible', text: 'Atkinson Hyperlegible', headFamily: f(atkinson, SANS), textFamily: f(atkinson, SANS) },
  { id: 'bold-serif', name: 'Bold serif', feel: 'strong headings, round text', heads: 'DM Serif Display', text: 'DM Sans', headFamily: f(dmSerif, SERIF), textFamily: f(dmSans, SANS) },
  { id: 'warm', name: 'Warm serif', feel: 'serif everywhere, gentle curves', heads: 'Lora', text: 'Lora', headFamily: f(lora, SERIF), textFamily: f(lora, SERIF) },
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
