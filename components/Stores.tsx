'use client';
import { Icon } from './Icon';
import { openWaitlist } from './Waitlist';
import { site } from '@/lib/site';

// The two store buttons. Until a listing is live, its button opens the waitlist (components/Waitlist.tsx, mounted
// once in the layout): the free letter (MailCheap), which sends the launch-day email.
export function Stores() {
  return (
    <div className="stores">
      {site.appStoreUrl ? (
        <a className="store" href={site.appStoreUrl} rel="noopener"><Icon name="apple" /><span><small>Download on the</small><b>App Store</b></span></a>
      ) : (
        <button type="button" className="store" onClick={openWaitlist} aria-haspopup="dialog"><Icon name="apple" /><span><small>Download on the</small><b>App Store</b></span></button>
      )}
      {site.playStoreUrl ? (
        <a className="store" href={site.playStoreUrl} rel="noopener"><Icon name="play" /><span><small>Get it on</small><b>Google Play</b></span></a>
      ) : (
        <button type="button" className="store" onClick={openWaitlist} aria-haspopup="dialog"><Icon name="play" /><span><small>Get it on</small><b>Google Play</b></span></button>
      )}
    </div>
  );
}
