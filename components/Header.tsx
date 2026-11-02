'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Brand } from './Logo';
import { Icon } from './Icon';
import { nav } from '@/lib/site';

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
            <a key={n.href} href={n.href} aria-current={current(n.href)}>{n.label}</a>
          ))}
        </nav>
        <a className="btn btn--sm hd__cta" href="/#get">Get the app</a>
        <details className="hd__menu" ref={menu}>
          <summary aria-label="Menu"><Icon name="menu" /></summary>
          <div className="hd__sheet">
            {nav.map((n) => (
              <a key={n.href} href={n.href} aria-current={current(n.href)}>{n.label}</a>
            ))}
            <a className="btn" href="/#get">Get the app</a>
          </div>
        </details>
      </div>
    </header>
  );
}
