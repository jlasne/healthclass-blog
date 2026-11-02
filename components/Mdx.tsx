// Renders a letter's MDX on the server, with the components a letter can use:
//   <Ref n={1} />            a numbered link to the letter's source list
//   <Bars>, <Dots>, <Weeks>, <Rhythm>, <Hammock>, <Steps>   the hand-drawn sketches (components/Sketch.tsx)
//   <Try title="...">        a sky box with the cat lifting: an exercise to try today
//   <Doctor>                 the rose box: see a doctor if...
//   <Remember>               the plum box: 3 things to remember
//   <Letter />               the newsletter, mid-letter
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { Bars, Dots, Hammock, Rhythm, Steps, Weeks } from './Sketch';
import { Cat, type Pose } from './Cat';
import { Icon } from './Icon';
import { Newsletter } from './Newsletter';

function Ref({ n }: { n: number }) {
  return <sup><a href={`#src-${n}`} aria-label={`Source ${n}`}>[{n}]</a></sup>;
}
function Try({ title, children, cat = 'lift' }: { title: string; children: React.ReactNode; cat?: Pose }) {
  return (
    <aside className="box box--try">
      <Cat pose={cat} width={110} />
      <span className="box__k"><Icon name="timer" /> Try it today · {title}</span>
      {children}
    </aside>
  );
}
function Doctor({ children, title = 'See a doctor first if' }: { children: React.ReactNode; title?: string }) {
  return (
    <aside className="box box--doctor">
      <span className="box__k"><Icon name="alert" /> {title}</span>
      {children}
    </aside>
  );
}
function Remember({ children, title = '3 things to remember' }: { children: React.ReactNode; title?: string }) {
  return (
    <aside className="box">
      <span className="box__k">{title}</span>
      {children}
    </aside>
  );
}
function Letter({ slug }: { slug?: string }) {
  return (
    <div style={{ margin: '2.4em 0' }}>
      <Newsletter compact as="h3" source={`/letters/${slug ?? ''}#mid`} tag="article" title={<>Get the next letter on <em>Sunday</em>.</>} text="1 idea, 1 exercise and 1 reader question from Dr. Dana. Free, in a 3-minute read." />
    </div>
  );
}

const components = { Ref, Bars, Dots, Weeks, Rhythm, Hammock, Steps, Try, Doctor, Remember, Letter };

export async function Mdx({ source, slug }: { source: string; slug: string }) {
  const { default: Content } = await evaluate(source, { ...runtime, baseUrl: import.meta.url });
  return <Content components={{ ...components, Letter: () => <Letter slug={slug} /> }} />;
}
