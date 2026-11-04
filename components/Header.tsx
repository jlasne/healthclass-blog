'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Brand } from './Logo';
import { Icon } from './Icon';
import { GetApp } from './Waitlist';
import { dana, nav } from '@/lib/site';

// the small mark before each link: an icon, or Dr. Dana's face
function Mark({ icon }: { icon: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (icon === 'face') return <img className="hd__face" src={dana.avatar} alt="" width={22} height={22} />;
  return <Icon name={icon} className={`hd__ic hd__ic--${icon}`} />;
}

export function Header() {
  const path = usePathname() || '/';
  const menu = useRef<HTMLDetailsElement>(null);
  // the mobile sheet closes when the page changes
  useEffect(() => { if (menu.current) menu.current.open = false; }, [path]);
  const current = (href: string) => (path === href || path.startsWith(href + '/') ? 'page' : undefined);
  return (
    <header className="hd">
      <div className="wrap hd__in">
        <Brand />
        <nav className="hd__nav" aria-label="Main">
          {nav.map((n) => (
            <a key={n.href} href={n.href} aria-current={current(n.href)}><Mark icon={n.icon} />{n.label}</a>
          ))}
        </nav>
        <GetApp className="btn btn--sm hd__cta" />
        <details className="hd__menu" ref={menu}>
          <summary aria-label="Menu"><Icon name="menu" /></summary>
          <div className="hd__sheet">
            {nav.map((n) => (
              <a key={n.href} href={n.href} aria-current={current(n.href)}><Mark icon={n.icon} />{n.label}</a>
            ))}
            <GetApp className="btn" />
          </div>
        </details>
      </div>
    </header>
  );
}
