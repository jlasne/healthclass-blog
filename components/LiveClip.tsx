'use client';
import { useEffect, useRef, useState } from 'react';

// Dr. Dana's clip on /live: muted, looping, paused for reduced motion; a tap pauses or plays it.
export function LiveClip({ src, poster, label }: { src: string; poster: string; label: string }) {
  const v = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const el = v.current; if (!el) return;
    const sync = () => setPaused(el.paused);
    el.addEventListener('play', sync); el.addEventListener('pause', sync);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.play().catch(sync);
    return () => { el.removeEventListener('play', sync); el.removeEventListener('pause', sync); };
  }, []);
  const toggle = () => { const el = v.current; if (!el) return; if (el.paused) el.play().catch(() => setPaused(true)); else el.pause(); };
  return (
    <button type="button" className="live__vid" onClick={toggle} aria-label={paused ? `Play: ${label}` : `Pause: ${label}`}>
      <video ref={v} src={src} poster={poster} muted loop playsInline preload="metadata" width={576} height={720} aria-hidden="true" />
    </button>
  );
}
