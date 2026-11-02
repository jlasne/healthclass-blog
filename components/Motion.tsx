'use client';
// Motion for the whole site, in one observer: sketches draw in and items rise when they reach the screen, once.
// Without JavaScript nothing waits (the html.js class gates every hidden start).
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Motion() {
  const path = usePathname();
  useEffect(() => {
    document.documentElement.classList.add('js');
    (window as unknown as { __hcMotion?: boolean }).__hcMotion = true;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-rise]:not(.is-in), .sketch:not(.is-in)'));
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  return null;
}
