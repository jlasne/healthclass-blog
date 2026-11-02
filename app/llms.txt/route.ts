// llms.txt: a plain map of the site for AI answer engines (ChatGPT, Perplexity, Google's AI answers), so they find,
// understand and cite the letters. Updates with the letters.
import { getArticles } from '@/lib/articles';
import { absoluteUrl, dana, site } from '@/lib/site';

export const revalidate = 3600;

export function GET() {
  const letters = getArticles().map((a) => `- [${a.title}](${absoluteUrl(`/blog/${a.slug}`)}): ${a.description}`).join('\n');
  const body = `# ${site.name}

> ${site.description}

${site.name} is the blog of the app ${site.appName}. Every letter is written by ${dana.name}, ${dana.credential}, a ${dana.role.toLowerCase()} at ${dana.practice} (${dana.practiceCity}), and cites its sources (NICE, ACOG, AUA guidelines and Cochrane reviews). It is education, not medical advice.

## Letters

${letters}

## About

- [About ${dana.name}](${absoluteUrl('/about')}): credentials, practice and editorial policy
- [Class Notes newsletter](${absoluteUrl('/newsletter')}): free, weekly
- [The app](${absoluteUrl('/app')}): ${site.appName}, 6-week pelvic floor programs
- [Monthly live Q&A](${absoluteUrl('/qa')}): for paid members of the app

## Policies

- [Privacy Policy](${absoluteUrl('/privacy')})
- [Terms of Service](${absoluteUrl('/terms')})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
