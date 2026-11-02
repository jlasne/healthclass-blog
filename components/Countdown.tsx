'use client';
import { useEffect, useState } from 'react';

// Days, hours, minutes, seconds to the next live. Blank until it mounts, so the server and the browser agree.
export function Countdown({ to, durationMin = 45 }: { to: number; durationMin?: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const left = now == null ? null : to - now;
  if (left != null && left <= 0) {
    const on = -left < durationMin * 60_000;
    return <p className="count count--now" role="status">{on ? 'Live now: join with the code from the app.' : 'The next date is coming soon.'}</p>;
  }
  const parts = left == null ? null : [Math.floor(left / 864e5), Math.floor(left / 36e5) % 24, Math.floor(left / 6e4) % 60, Math.floor(left / 1e3) % 60];
  const labels = ['days', 'hours', 'min', 'sec'];
  return (
    <div className="count" role="timer" aria-label="Time until the next live">
      {labels.map((l, i) => (
        <div key={l}><b>{parts ? String(parts[i]).padStart(2, '0') : '--'}</b><span>{l}</span></div>
      ))}
    </div>
  );
}
