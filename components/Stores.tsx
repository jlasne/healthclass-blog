'use client';
import { useRef } from 'react';
import { Icon } from './Icon';
import { NewsletterForm } from './NewsletterForm';
import { site } from '@/lib/site';

// The two store buttons. Until a listing is live, its button says "Coming soon" and opens the waitlist: the free
// letter (MailCheap), which sends the launch-day email.
export function Stores() {
  const dlg = useRef<HTMLDialogElement>(null);
  const open = () => dlg.current?.showModal();
  const soon = !site.appStoreUrl || !site.playStoreUrl;
  return (
    <>
      <div className="stores">
        {site.appStoreUrl ? (
          <a className="store" href={site.appStoreUrl} rel="noopener"><Icon name="apple" /><span><small>Download on the</small><b>App Store</b></span></a>
        ) : (
          <button type="button" className="store is-soon" onClick={open} aria-haspopup="dialog"><Icon name="apple" /><span><small>Coming soon</small><b>App Store</b></span></button>
        )}
        {site.playStoreUrl ? (
          <a className="store" href={site.playStoreUrl} rel="noopener"><Icon name="play" /><span><small>Get it on</small><b>Google Play</b></span></a>
        ) : (
          <button type="button" className="store is-soon" onClick={open} aria-haspopup="dialog"><Icon name="play" /><span><small>Coming soon</small><b>Google Play</b></span></button>
        )}
      </div>
      {soon && (
        <dialog ref={dlg} className="wait" aria-labelledby="wait-t" onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}>
          <div className="wait__in">
            <button type="button" className="wait__x" aria-label="Close" onClick={() => dlg.current?.close()}><Icon name="close" /></button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="wait__cat" src="/cats/bell.svg" alt="" width={96} height={96} />
            <h2 id="wait-t" className="h3">Be first on <em>launch day</em>.</h2>
            <p>Join Dr. Dana&rsquo;s free letter. The launch-day email for iPhone and Android comes first, then a letter every Wednesday and Sunday.</p>
            <NewsletterForm source="waitlist" tag="app-waitlist" />
          </div>
        </dialog>
      )}
    </>
  );
}
