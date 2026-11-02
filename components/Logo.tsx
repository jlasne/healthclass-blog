import cats from '@/lib/cats.json';

// "HC" in Fraunces (drawn as outlines) and one curved bar under it: the app's logo, rose on paper.
export function Logo({ className, white = false }: { className?: string; white?: boolean }) {
  return (
    <svg className={className} viewBox="20 27 60 52" aria-hidden="true" focusable="false">
      <path d={cats.logo.hc} fill={white ? '#fff' : '#B93D57'} />
      <path d={cats.logo.bar} fill="none" stroke={white ? '#F7C6CE' : '#D9566F'} strokeWidth={4.6} strokeLinecap="round" />
    </svg>
  );
}

export function Brand({ white = false }: { white?: boolean }) {
  return (
    <a className="brand" href="/" aria-label="Pelvic Health Class: for Women, home">
      <Logo className="brand__mark" white={white} />
      <span className="brand__name">
        <b>Pelvic Health Class</b>
        <i>for Women</i>
      </span>
    </a>
  );
}
