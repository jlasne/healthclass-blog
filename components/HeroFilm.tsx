'use client';
import { useEffect, useRef, useState } from 'react';

// The 20-second film in the home hero (source: jlasne/healthclass, video/). It plays muted and loops;
// "Play with sound" restarts it from frame one, because the music is cut to the picture.
// Reduced motion: it holds on the poster until she presses play.
export function HeroFilm() {
  const v = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(true);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const el = v.current;
    if (!el) return;
    let raf = 0;
    const draw = () => { if (el.duration && bar.current) bar.current.style.width = `${(el.currentTime / el.duration) * 100}%`; };
    const tick = () => { draw(); raf = requestAnimationFrame(tick); };
    const sync = () => { setPaused(el.paused); cancelAnimationFrame(raf); if (el.paused) draw(); else raf = requestAnimationFrame(tick); };
    el.addEventListener('play', sync);
    el.addEventListener('pause', sync);
    el.addEventListener('seeked', draw);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) el.play().catch(sync);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('play', sync); el.removeEventListener('pause', sync); el.removeEventListener('seeked', draw); };
  }, []);

  const toggle = () => { const el = v.current; if (!el) return; if (el.paused) el.play().catch(() => setPaused(true)); else el.pause(); };
  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = v.current; if (!el) return;
    if (el.muted) { el.muted = false; el.currentTime = 0; el.play().catch(() => setPaused(true)); setSound(true); }
    else { el.muted = true; setSound(false); }
  };

  return (
    <div className="film" data-paused={paused ? '' : undefined} onClick={toggle}>
      <video
        ref={v}
        src="/media/hero/hero.mp4"
        poster="/media/hero/poster.jpg"
        muted
        playsInline
        loop
        preload="metadata"
        aria-label="A 20-second film: the class cat laughs, jumps and dives into the app. Laugh without worrying, get back to sport, feel in control. By Dr. Dana, urologist."
      />
      <button className="film__play" type="button" aria-label={paused ? 'Play' : 'Pause'} onClick={(e) => { e.stopPropagation(); toggle(); }}>
        {paused ? (
          <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5.6v12.8a1 1 0 0 0 1.53.85l10.2-6.4a1 1 0 0 0 0-1.7L9.53 4.75A1 1 0 0 0 8 5.6z" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><rect x="6.4" y="5" width="3.9" height="14" rx="1.3" /><rect x="13.7" y="5" width="3.9" height="14" rx="1.3" /></svg>
        )}
      </button>
      <button className={sound ? 'film__sound is-on' : 'film__sound'} type="button" onClick={toggleSound}>
        {sound ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z" /><path d="m22 9-6 6" /><path d="m16 9 6 6" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg>
        )}
        <span>{sound ? 'Mute' : 'Play with sound'}</span>
      </button>
      <div className="film__bar" aria-hidden="true"><i ref={bar} /></div>
    </div>
  );
}
