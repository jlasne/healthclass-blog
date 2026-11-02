import { Icon } from './Icon';
import { site } from '@/lib/site';

// The two store buttons. Until a listing is live, its button says "Coming soon".
export function Stores() {
  return (
    <div className="stores">
      {site.appStoreUrl ? (
        <a className="store" href={site.appStoreUrl} rel="noopener"><Icon name="apple" /><span><small>Download on the</small><b>App Store</b></span></a>
      ) : (
        <span className="store is-soon" aria-label="App Store: coming soon"><Icon name="apple" /><span><small>Coming soon</small><b>App Store</b></span></span>
      )}
      {site.playStoreUrl ? (
        <a className="store" href={site.playStoreUrl} rel="noopener"><Icon name="play" /><span><small>Get it on</small><b>Google Play</b></span></a>
      ) : (
        <span className="store is-soon" aria-label="Google Play: coming soon"><Icon name="play" /><span><small>Coming soon</small><b>Google Play</b></span></span>
      )}
    </div>
  );
}
