import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { Smile } from '@/components/Smile';
import { Newsletter } from '@/components/Newsletter';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Letters } from '@/components/Letters';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbs, graph, meta } from '@/lib/seo';
import { dana, site } from '@/lib/site';
import { getArticles } from '@/lib/articles';

export const metadata = meta({
  title: 'Class Notes: a free weekly letter from a urologist',
  description: 'Class Notes is the free Sunday letter from Dr. Dana Kivlin, board-certified urologist: 1 idea, 1 exercise and 1 reader question on the pelvic floor.',
  path: '/newsletter',
});

const PROMISES = [
  { i: 'heart', t: 'Free, for good', d: 'Every letter, for every reader. The app pays for it.' },
  { i: 'calendar', t: '1 email a week', d: 'Sunday morning, 3 minutes to read. Nothing in between.' },
  { i: 'seal', t: 'From a urologist', d: `${dana.name} writes or approves every line.` },
  { i: 'book', t: 'Sources in every letter', d: 'Each number links to its study, so you can check it.' },
  { i: 'lock', t: 'Your email stays with us', d: 'We use it to send the letter. Nobody else gets it.' },
  { i: 'arrow', t: 'Leave in 1 click', d: 'Every email ends with an unsubscribe link that works at once.' },
];

const FAQ = [
  { q: 'What does it cost?', a: 'Nothing. Class Notes is free, for good. The app funds it.' },
  { q: 'How often will you email me?', a: '1 letter every Sunday. When a new program opens in the app, you may get 1 short extra note that week.' },
  { q: 'Who writes it?', a: `${dana.name}, a board-certified urologist at ${dana.practice}. Each letter carries its sources.` },
  { q: 'Can I reply?', a: 'Yes. Reply with your question. Some questions become the reader question of a future letter, without your name.' },
  { q: 'How do I unsubscribe?', a: 'Click "unsubscribe" at the bottom of any letter. It works at once, with no login.' },
];

export default function Page() {
  const latest = getArticles().slice(0, 3);
  return (
    <>
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <span className="eyebrow">{site.newsletter.name} · free · {site.newsletter.cadence.toLowerCase()}</span>
            <h1 className="h1">1 letter a week from a <em>urologist</em>.</h1>
            <p className="lede">{site.newsletter.promise} From {dana.name}, to your inbox, every Sunday.</p>
            <div className="hero__form"><NewsletterForm source="/newsletter#hero" tag="newsletter-page" cta="Send me Sunday's letter" /></div>
            <div className="byline" style={{ marginTop: 22 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dana.avatar} alt="" width={46} height={46} />
              <div><b>{dana.name}, {dana.credential}</b><span>{dana.role} · {dana.practice}</span></div>
            </div>
          </div>
          <div className="hero__art" style={{ aspectRatio: 'auto' }}>
            <EmailPreview />
          </div>
        </div>
      </section>

      <section className="sec--tight" aria-labelledby="promise">
        <div className="wrap">
          <div className="sec__hd"><div><span className="eyebrow">Our promise</span><h2 id="promise" className="h2">6 things you can count on</h2></div></div>
          <div className="programs">
            {PROMISES.map((p, i) => (
              <div key={p.t} className={`program tone--${['rosy', 'sky', 'plum'][i % 3]}`} data-rise style={{ ['--i' as string]: i }}>
                <span className="du" style={{ marginBottom: 12 }}><Icon name={p.i} /></span>
                <b>{p.t}</b>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="recent">
        <div className="wrap">
          <div className="sec__hd"><div><span className="eyebrow">Recent letters</span><h2 id="recent" className="h2">Read 3 before you join</h2></div><a className="arrow" href="/blog">All letters</a></div>
          <Letters items={latest} headingLevel="h3" />
        </div>
      </section>

      <section className="sec--tight" aria-labelledby="nl-faq">
        <div className="read">
          <h2 id="nl-faq" className="h3">Questions</h2>
          <div className="faq" style={{ marginTop: 8 }}>
            {FAQ.map((f) => (<details key={f.q}><summary>{f.q}</summary><div><p>{f.a}</p></div></details>))}
          </div>
        </div>
      </section>

      <div className="wrap" style={{ paddingTop: 56, paddingBottom: 40 }}>
        <Newsletter source="/newsletter#bottom" tag="newsletter-page" pose="bell" title={<>Your first letter arrives <em>Sunday</em>.</>} />
      </div>
      <JsonLd data={graph({ '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Newsletter', path: '/newsletter' }]))} />
    </>
  );
}

// what a letter looks like in an inbox: the sender, the subject, the first lines
function EmailPreview() {
  return (
    <div className="mail" aria-label="Preview of a Class Notes email" role="img">
      <div className="mail__bar"><i /><i /><i /></div>
      <div className="mail__hd">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dana.avatar} alt="" width={40} height={40} />
        <div><b>Dr. Dana · Class Notes</b><span>to me · Sunday 7:00 AM</span></div>
      </div>
      <div className="mail__body">
        <span className="mail__s">56 versus 6</span>
        <p>If you remember 1 number from my letters, make it this one: 56%.</p>
        <p>In a Cochrane review, 56% of women with stress leaks who trained reported cure. Without training, 6%.</p>
        <div className="mail__try"><b>Try it today</b>8 lifts of 3 seconds, morning, lunch and evening.</div>
        <div className="mail__q"><b>Your question</b>&ldquo;Can I do Kegels while driving?&rdquo;</div>
        <span className="mail__sig">Dana</span>
      </div>
      <Cat pose="write" width={150} className="mail__cat" />
    </div>
  );
}
