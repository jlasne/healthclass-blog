// RSS for readers and for MailCheap's RSS-to-email, if you use it. Updates with the letters.
import { getArticles } from '@/lib/articles';
import { absoluteUrl, dana, site } from '@/lib/site';

export const revalidate = 3600;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function GET() {
  const items = getArticles().map((a) => `
    <item>
      <title>${esc(a.title)}</title>
      <link>${absoluteUrl(`/letters/${a.slug}`)}</link>
      <guid isPermaLink="true">${absoluteUrl(`/letters/${a.slug}`)}</guid>
      <pubDate>${new Date(`${a.date}T12:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(a.topic)}</category>
      <dc:creator>${esc(dana.name)}</dc:creator>
      <description>${esc(a.excerpt)}</description>
    </item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(site.name)}: letters from ${esc(dana.name)}</title>
    <link>${site.url}</link>
    <atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml" />
    <description>${esc(site.description)}</description>
    <language>en-us</language>
    <image><url>${absoluteUrl('/icon.png')}</url><title>${esc(site.name)}</title><link>${site.url}</link></image>${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
