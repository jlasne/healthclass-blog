import { Brand } from './Logo';
import { Cat } from './Cat';
import { Icon } from './Icon';
import { PreferredSource } from './PreferredSource';
import { dana, site } from '@/lib/site';
import { FAMILIES, FAMILY_IDS } from '@/lib/resources';

// The footer: the cat naps in the hammock (the paper's edge curves down into the plum like the app's hammock line).
// The base line opens with Dr. Kivlin's credential line, on its own row.
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="ft">
      <div className="ft__hammock" aria-hidden="true">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" focusable="false"><path d="M0 0H1440V8C1100 76 340 76 0 8Z" /></svg>
        <Cat pose="hammock" width={230} />
      </div>
      <div className="wrap">
        <div className="ft__grid">
          <div>
            <Brand white />
            <p className="ft__about">
              The pelvic floor class for women. Laugh, move and feel in control.
            </p>
            <PreferredSource tone="dark" />
            <div className="ft__social">
              <a href={dana.socials[0].url} rel="me noopener" target="_blank" aria-label="Dr. Hapee Bladder on Instagram"><Icon name="instagram" /></a>
              <a href={`mailto:${site.email}`} aria-label="Email us"><Icon name="mail" /></a>
            </div>
          </div>
          <div>
            <h2>Read</h2>
            <ul>
              <li><a href="/letters">All letters</a></li>
            </ul>
          </div>
          <div>
            <h2>Resources</h2>
            <ul>
              {FAMILY_IDS.map((f) => (<li key={f}><a href={`/resources/${f}`}>{FAMILIES[f].name}</a></li>))}
            </ul>
          </div>
          <div>
            <h2>The class</h2>
            <ul>
              <li><a href="/#get">Get the app</a></li>
              <li><a href="/live">Live with Dr. Kivlin</a></li>
              <li><a href="/faq">FAQ and help</a></li>
            </ul>
          </div>
          <div>
            <h2>About</h2>
            <ul>
              <li><a href="/dana-kivlin">Dr. Kivlin</a></li>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/terms">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="ft__base">
          {/* her credential line, at the bottom of every page */}
          <a className="ft__cred" href="/dana-kivlin">{dana.name}, {dana.role.toLowerCase()}</a>
          <span>© {year} {site.name}. Education from a urologist, not medical advice. In an emergency, call 911.</span>
          <span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/sitemap.xml">Sitemap</a></span>
        </div>
      </div>
    </footer>
  );
}
