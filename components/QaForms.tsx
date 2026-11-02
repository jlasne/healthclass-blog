'use client';
import { useActionState } from 'react';
import { requestLink, askQuestion, type LinkState, type AskState } from '@/app/qa/actions';
import { Icon } from './Icon';

export function LinkForm() {
  const [s, action, pending] = useActionState<LinkState, FormData>(requestLink, { status: 'idle' });
  if (s.status === 'sent') {
    return (
      <div className="nl-done sparkle" role="status" aria-live="polite" style={{ marginTop: 18 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cats/bell.svg" alt="" width={78} height={78} />
        <div><b>Check your inbox.</b><span>If {s.email} has a plan, your sign-in link is on its way. It works once, for 30 minutes.</span></div>
      </div>
    );
  }
  return (
    <form action={action} style={{ marginTop: 18 }}>
      <div className={pending ? 'nl-form is-sending' : 'nl-form'}>
        <label htmlFor="qa-email" className="sr-only">Your email</label>
        <input id="qa-email" type="email" name="email" inputMode="email" autoComplete="email" placeholder="The email in your app" defaultValue={s.email} required />
        <button className="btn" type="submit" disabled={pending}>{pending ? 'Sending…' : 'Email me my link'}{!pending && <Icon name="arrow" />}</button>
      </div>
      {s.status === 'error' && <p className="nl-err" role="alert">{s.message}</p>}
    </form>
  );
}

export function AskForm() {
  const [s, action, pending] = useActionState<AskState, FormData>(askQuestion, { status: 'idle' });
  return (
    <form action={action} className="qform">
      <label htmlFor="q" className="sr-only">Your question</label>
      <textarea id="q" name="question" maxLength={1200} placeholder="What would you like Dr. Dana to explain?" required key={s.status === 'ok' ? Date.now() : 'q'} />
      <div className="qform__row">
        <label className="check"><input type="checkbox" name="showName" /> Show my first name:</label>
        <input name="firstName" placeholder="First name" maxLength={40} style={{ flex: '1 1 140px', height: 44, padding: '0 14px', border: 0, borderRadius: 999, background: '#fff', boxShadow: 'inset 0 0 0 1px var(--hair-2)' }} />
        <button className="btn" type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send my question'}</button>
      </div>
      {s.status === 'ok' && <p className="nl-fine" role="status" style={{ color: 'var(--plum)', fontWeight: 600 }}>Sent. Dr. Dana will see it before the next session.</p>}
      {s.status === 'error' && <p className="nl-err" role="alert">{s.message}</p>}
    </form>
  );
}
