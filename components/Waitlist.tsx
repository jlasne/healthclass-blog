'use client';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { NewsletterForm } from './NewsletterForm';
import { site } from '@/lib/site';

// One waitlist sheet for the whole site (mounted once in the layout). Until a store listing is live, every
// "Get the app" button and store badge opens it: the free letter, which sends the launch-day email.
// When appStoreUrl and playStoreUrl are both set in lib/site.ts, it is gone and the buttons go to the stores.
export const live = Boolean(site.appStoreUrl || site.playStoreUrl);
// the sheet stays while one store is still missing (its badge keeps opening it)
const soon = !site.appStoreUrl || !site.playStoreUrl;
const ID = 'hc-waitlist';

export function openWaitlist() {
  const d = document.getElementById(ID) as HTMLDialogElement | null;
  if (d && !d.open) d.showModal();
}

export function Waitlist() {
  const dlg = useRef<HTMLDialogElement>(null);
  if (!soon) return null;
  return (
    <dialog id={ID} ref={dlg} className="wait" aria-labelledby="wait-t" onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}>
      <div className="wait__in">
        <button type="button" className="wait__x" aria-label="Close" onClick={() => dlg.current?.close()}><Icon name="close" /></button>
        <div className="wait__hd">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <span className="wait__disc"><img src="/cats/bell.svg" alt="" width={84} height={84} /></span>
          <div>
            <span className="eyebrow">iPhone and Android</span>
            <h2 id="wait-t" className="h3">Be first on <em>launch day</em>.</h2>
          </div>
        </div>
        <p className="wait__lede">The app opens soon. Join Dr. Dana&rsquo;s free letter: the launch-day email comes first.</p>
        <NewsletterForm source="waitlist" tag="app-waitlist" fine="Then 1 short letter every Wednesday and Sunday. Free, unsubscribe in 1 click." />
      </div>
    </dialog>
  );
}

// "Get the app": the waitlist before launch; after launch, the store for this phone (a computer gets the home
// page, with both store buttons and the QR code).
export function GetApp({ className = 'btn', label = 'Get the app', icon = false }: { className?: string; label?: string; icon?: boolean }) {
  const [href, setHref] = useState('/#get');
  useEffect(() => {
    if (!live) return;
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua) && site.appStoreUrl) setHref(site.appStoreUrl);
    else if (/Android/i.test(ua) && site.playStoreUrl) setHref(site.playStoreUrl);
  }, []);
  const inner = <>{icon && <Icon name="phone" />}{label}</>;
  if (live) return <a className={className} href={href} rel="noopener">{inner}</a>;
  return <button type="button" className={className} onClick={openWaitlist} aria-haspopup="dialog">{inner}</button>;
}
