'use client';
import { useActionState } from 'react';
import { subscribe, type SubState } from '@/app/actions';
import { Icon } from './Icon';

// The signup: one field, one rose button. After it: the cheering cat (the app congratulates at the end, once).
export function NewsletterForm({ source, tag, cta = 'Get the free letter', id, fine }: { source: string; tag?: string; cta?: string; id?: string; fine?: string }) {
  const [state, action, pending] = useActionState<SubState, FormData>(subscribe, { status: 'idle' });
  if (state.status === 'ok') {
    return (
      <div className="nl-done sparkle" role="status" aria-live="polite">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cats/cheer.svg" alt="" width={78} height={78} />
        <div>
          <b>You&rsquo;re in. See you Wednesday or Sunday.</b>
          <span>Look for &ldquo;Class Notes&rdquo; from Dr. Dana in your inbox. Move it to your main tab so the next one lands there.</span>
        </div>
      </div>
    );
  }
  const fieldId = id ?? `nl-${source.replace(/[^a-z0-9]/gi, '-')}`;
  return (
    <form action={action} className={pending ? 'is-sending' : undefined} aria-describedby={`${fieldId}-fine`}>
      <div className={pending ? 'nl-form is-sending' : 'nl-form'}>
        <label htmlFor={fieldId} className="sr-only">Your email</label>
        <input id={fieldId} type="email" name="email" inputMode="email" autoComplete="email" placeholder="Your email" defaultValue={state.email} required />
        {state.status === 'error' && state.email && <input type="hidden" name="confirm" value={state.email} />}
        <input type="hidden" name="source" value={source} />
        {tag && <input type="hidden" name="tag" value={tag} />}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
          <label>Company <input type="text" name="company" tabIndex={-1} autoComplete="off" /></label>
        </div>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Sending…' : cta}
          {!pending && <Icon name="arrow" />}
        </button>
      </div>
      {state.status === 'error' && <p className="nl-err" role="alert">{state.message}</p>}
      <p className="nl-fine" id={`${fieldId}-fine`}>
        {fine ?? 'Free. Every Wednesday and Sunday. Unsubscribe in 1 click.'} Your email stays with us: <a href="/privacy#newsletter">privacy</a>.
      </p>
    </form>
  );
}
