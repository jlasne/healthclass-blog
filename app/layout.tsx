import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Analytics } from '@vercel/analytics/next';
import { Motion } from '@/components/Motion';
import { Waitlist } from '@/components/Waitlist';
import { JsonLd } from '@/components/JsonLd';
import { graph, organization, person, website } from '@/lib/seo';
import { site } from '@/lib/site';

// the app's two families, self-hosted (no request to Google), plus Caveat for the hand-drawn sketches.
// Latin only: the site is in English, and the basic Latin files already cover accents like é and curly quotes.
const fraunces = localFont({
  src: [
    { path: './fonts/fraunces-latin.woff2', weight: '300 650', style: 'normal' },
    { path: './fonts/fraunces-italic-latin.woff2', weight: '300 650', style: 'italic' },
  ],
  variable: '--font-fraunces',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});
const instrument = localFont({
  src: [
    { path: './fonts/instrument-sans-latin.woff2', weight: '400 700', style: 'normal' },
  ],
  variable: '--font-instrument',
  display: 'swap',
  fallback: ['-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
});
const caveat = localFont({
  src: [
    { path: './fonts/caveat-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/caveat-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-caveat',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.appName,
  authors: [{ name: 'Dr. Dana Kivlin', url: '/dana-kivlin' }],
  creator: 'Dr. Dana Kivlin',
  publisher: site.name,
  category: 'health',
  alternates: { canonical: '/', types: { 'application/rss+xml': [{ url: '/feed.xml', title: `${site.name} letters` }] } },
  openGraph: { siteName: site.name, locale: site.locale, type: 'website', url: '/' },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  formatDetection: { telephone: false, email: false, address: false },
  ...(site.appStoreId ? { itunes: { appId: site.appStoreId } } : {}),
  appleWebApp: { title: site.name, statusBarStyle: 'default' },
};

export const viewport: Viewport = { themeColor: '#FFFBF6', width: 'device-width', initialScale: 1, viewportFit: 'cover', colorScheme: 'light' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrument.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        {/* motion waits for the page only when JavaScript runs; a safety net shows everything after 2.5 s */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');setTimeout(function(){if(window.__hcMotion)return;document.querySelectorAll('[data-rise],.sketch').forEach(function(e){e.classList.add('is-in')})},2500)" }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <div className="progress" aria-hidden="true" />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Waitlist />
        <Motion />
        {/* page views for the weekly report: no cookies, no IP kept (Vercel Web Analytics, see /privacy#website).
            Only on Vercel, where its script exists; a local build stays free of the console error. */}
        {process.env.VERCEL ? <Analytics /> : null}
        <JsonLd data={graph(organization, website, person)} />
      </body>
    </html>
  );
}
