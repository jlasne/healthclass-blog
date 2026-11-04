// The free tools, by the id a page names in its front matter (`tool: leak-type-quiz`). Each tool gets the links it
// needs from the live pages, so a result never points to a page that is not out yet.
import { getArticle } from '@/lib/articles';
import { resolve } from '@/lib/resources';
import { LeakQuiz } from './LeakQuiz';

const page = (ref: string, fallback: string) => resolve(ref)?.path ?? fallback;
const letter = (slug: string) => (getArticle(slug) ? `/letters/${slug}` : undefined);

export function Tool({ id }: { id: string }) {
  if (id === 'leak-type-quiz') {
    return (
      <LeakQuiz
        links={{
          leaks: page('classes/bladder-leaks', '/resources/classes'),
          basics: page('classes/pelvic-floor-101', '/resources/classes'),
          sneeze: resolve('made-for-you/leak-when-you-sneeze')?.path,
          knack: letter('the-knack-squeeze-before-you-sneeze'),
        }}
      />
    );
  }
  return null;
}
