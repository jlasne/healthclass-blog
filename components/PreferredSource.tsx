import { Icon } from './Icon';
import { site } from '@/lib/site';

// "Add Health Class as a preferred source on Google": a plain link to Google's source preferences (documented by Google
// Search Central as the no-JavaScript option), so the page loads no Google script. People who pick us see our letters
// more in Top Stories, AI Overviews and AI Mode.
export function PreferredSource({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <a className={`pref pref--${tone}`} href={site.preferredSourceUrl} rel="noopener" target="_blank">
      <Icon name="star" />
      <span>Add us on Google<small>See our letters more often on Google</small></span>
    </a>
  );
}
