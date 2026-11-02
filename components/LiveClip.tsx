'use client';
import { useEffect, useRef, useState } from 'react';

// Dr. Dana's clip on /live: muted, looping, paused for reduced motion; a tap pauses or plays it.
// Placeholder captions run over the clip, one line per equal slice of the loop, until her own
// "next live" video replaces it (lib/site.ts qa.clip; pass no captions then).
export function LiveClip({ src, poster, label, captions = [] }: { src: string; poster: string; label: string; captions?: string[] }) {
  const v = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
  const [line, setLine] = useState(0);
  useEffect(() => {
    const el = v.current; if (!el) return;
    const sync = () => setPaused(el.paused);
    const cue = () => { if (el.duration && captions.length) setLine(Math.min(captions.length - 1, Math.floor((el.currentTime / el.duration) * captions.length))); };
    el.addEventListener('play', sync); el.addEventListener('pause', sync); el.addEventListener('timeupdate', cue);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.play().catch(sync);
    return () => { el.removeEventListener('play', sync); el.removeEventListener('pause', sync); el.removeEventListener('timeupdate', cue); };
  }, [captions.length]);
  const toggle = () => { const el = v.current; if (!el) return; if (el.paused) el.play().catch(() => setPaused(true)); else el.pause(); };
  return (
    <button type="button" className="live__vid" onClick={toggle} aria-label={paused ? `Play: ${label}` : `Pause: ${label}`}>
      <video ref={v} src={src} poster={poster} muted loop playsInline preload="metadata" width={576} height={720} aria-hidden="true" />
      {captions.length > 0 && (
        <span className="live__cap" aria-hidden="true"><span key={line}>{captions[line]}</span></span>
      )}
    </button>
  );
}
