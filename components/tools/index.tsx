// The free tools, by the id a page names in its front matter (`tool: leak-type-quiz`). Each tool gets the links it
// needs from the live pages, so a result never points to a page that is not out yet.
import { getArticle } from '@/lib/articles';
import { resolve } from '@/lib/resources';
import { LeakQuiz } from './LeakQuiz';
import { KegelTimer } from './KegelTimer';
import { KegelPlan } from './KegelPlan';

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
  if (id === 'kegel-timer') {
    return <KegelTimer links={{ classes: page('classes/pelvic-floor-101', '/resources/classes'), letter: letter('how-to-do-kegels-correctly') }} />;
  }
  if (id === 'kegel-plan-by-age') {
    return (
      <KegelPlan
        links={{
          classes: page('classes/pelvic-floor-101', '/resources/classes'),
          timer: resolve('tools/kegel-timer')?.path,
          slow: resolve('classes/slow-holds')?.path,
          flicks: resolve('classes/quick-flicks')?.path,
          letter: letter('how-to-do-kegels-correctly'),
        }}
      />
    );
  }
  return null;
}
