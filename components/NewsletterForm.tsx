'use client';
import { useEffect, useRef, useState } from 'react';

// The signup is MailCheap's form (newsletter "Pelvic Health Class: for women"), in its own frame: what changes in
// MailCheap reaches the site on its own. It works only on the sites listed under "Where it works" in MailCheap
// (https://mailcheap.ai/newsletters/form). The frame tells the page its height: { type: 'mailcheap:height', height }.
// The props stay from the former in-house form so every page keeps its call; the frame takes none of them.
const FORM = '6ae32d38dfdc6c9a1785eba1';
const ORIGIN = 'https://mailcheap.ai';

export function NewsletterForm({ fine }: { source?: string; tag?: string; cta?: string; id?: string; fine?: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(50);
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== ORIGIN || e.source !== frame.current?.contentWindow) return;   // only this frame, from MailCheap
      const d = e.data as { type?: string; height?: number } | null;
      if (d && d.type === 'mailcheap:height' && typeof d.height === 'number' && d.height > 0) setHeight(Math.ceil(d.height));
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  return (
    <div className="nl-embed">
      <iframe
        ref={frame}
        src={`${ORIGIN}/embed/${FORM}`}
        title="Newsletter signup"
        scrolling="no"
        loading="lazy"
        style={{ display: 'block', width: '100%', maxWidth: 480, height, border: 0, background: 'transparent' }}
      />
      <p className="nl-fine">
        {fine ?? 'Free. Every Wednesday and Sunday. Unsubscribe in 1 click.'} <a href="/privacy#newsletter">Privacy</a>.
      </p>
    </div>
  );
}
