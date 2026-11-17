'use client';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { unlockRoadmap, type GateState } from './actions';

// the password card shown until this browser has a valid pass
export function Gate() {
  const router = useRouter();
  const [state, action, pending] = useActionState<GateState, FormData>(async (p, fd) => {
    const r = await unlockRoadmap(p, fd);
    if (r.status === 'idle') router.refresh();
    return r;
  }, { status: 'idle' });
  useEffect(() => { document.querySelector<HTMLInputElement>('#rm-pw')?.focus(); }, []);
  return (
    <form action={action} className="gate">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.png" alt="Pelvic Health Class" width={88} height={88} className="gate__logo" />
      <label htmlFor="rm-pw">Team password</label>
      <input id="rm-pw" name="password" type="password" autoComplete="current-password" required aria-invalid={state.status === 'error'} aria-describedby="rm-msg" />
      <button className="btn" type="submit" disabled={pending}>{pending ? 'Checking…' : 'Open the roadmap'}</button>
      <p id="rm-msg" role="status" className="gate__msg">{state.message ?? 'For the Health Class team only.'}</p>
    </form>
  );
}
