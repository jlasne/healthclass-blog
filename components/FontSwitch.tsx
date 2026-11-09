'use client';
import { useEffect, useState } from 'react';

// The font test bar on /dana-kivlin/police: a row of chips, each sets the page's heading font (--serif) and text
// font (--sans). The pick goes in the address (?font=editorial), so a link opens on that look.
export type FontOption = { id: string; name: string; feel: string; heads: string; text: string; headFamily: string; textFamily: string };

export function FontSwitch({ options }: { options: FontOption[] }) {
  const [cur, setCur] = useState(options[0].id);
  function pick(id: string, push = true) {
    const o = options.find((x) => x.id === id) || options[0];
    document.documentElement.style.setProperty('--serif', o.headFamily);
    document.documentElement.style.setProperty('--sans', o.textFamily);
    setCur(o.id);
    if (push) {
      const u = new URL(window.location.href);
      if (o.id === options[0].id) u.searchParams.delete('font'); else u.searchParams.set('font', o.id);
      window.history.replaceState(null, '', u.toString());
    }
  }
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('font');
    if (id) pick(id, false);
    return () => { document.documentElement.style.removeProperty('--serif'); document.documentElement.style.removeProperty('--sans'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const now = options.find((x) => x.id === cur) || options[0];
  return (
    <div className="fsw" role="group" aria-label="Text font">
      <style>{`
        .fsw { position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%); z-index: 60; width: min(1100px, calc(100% - 24px));
          background: rgb(255 255 255 / .94); backdrop-filter: blur(10px); border: 1px solid var(--line, #eadfd8); border-radius: 18px;
          box-shadow: 0 10px 30px rgb(60 30 40 / .14); padding: 10px 12px; }
        .fsw__now { margin: 0 4px 8px; font: 500 13px/1.3 system-ui, sans-serif; color: var(--muted, #7a6e66); }
        .fsw__now b { color: var(--ink, #2a2421); }
        .fsw__row { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
        .fsw__row::-webkit-scrollbar { display: none; }
        .fsw__chip { flex: 0 0 auto; border: 1px solid var(--line, #eadfd8); background: #fff; color: var(--ink, #2a2421); border-radius: 999px;
          padding: 8px 14px; font-size: 15px; line-height: 1; cursor: pointer; white-space: nowrap; }
        .fsw__chip[aria-pressed="true"] { background: var(--rose, #b93d57); border-color: var(--rose, #b93d57); color: #fff; }
        main { padding-bottom: 110px; }
      `}</style>
      <p className="fsw__now"><b>{now.name}</b>, {now.feel}. Headings: {now.heads}. Text: {now.text}.</p>
      <div className="fsw__row">
        {options.map((o) => (
          <button key={o.id} type="button" className="fsw__chip" aria-pressed={o.id === cur} style={{ fontFamily: o.headFamily }} onClick={() => pick(o.id)}>
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
}
