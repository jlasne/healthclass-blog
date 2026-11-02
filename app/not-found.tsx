import { Cat } from '@/components/Cat';
import { getArticles } from '@/lib/articles';

export default function NotFound() {
  const top = getArticles().slice(0, 3);
  return (
    <section className="doc" style={{ textAlign: 'center' }}>
      <div className="read">
        <div className="zzz" style={{ width: 260, margin: '0 auto' }} aria-hidden="true"><Cat pose="sleep" width={260} priority /><i>z</i><i>z</i><i>z</i></div>
        <span className="eyebrow eyebrow--plain" style={{ marginTop: 18 }}>404</span>
        <h1 className="h1" style={{ marginTop: 10, fontSize: 'clamp(36px,5vw,56px)' }}>This page is <em>napping</em>.</h1>
        <p className="lede" style={{ marginTop: 14 }}>The link may be old. These letters are wide awake:</p>
        <ul className="qlist" style={{ marginTop: 22, textAlign: 'left' }}>
          {top.map((a) => (<li key={a.slug}><a className="link" href={`/blog/${a.slug}`}>{a.title}</a><span>{a.topic} · {a.minutes} min read</span></li>))}
        </ul>
        <a className="btn" href="/" style={{ marginTop: 26 }}>Back to the home page</a>
      </div>
    </section>
  );
}
