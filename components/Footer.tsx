import { Brand } from './Logo';
import { Cat } from './Cat';
import { Icon } from './Icon';
import { dana, site } from '@/lib/site';

// The footer: the cat naps in the hammock (the paper's edge curves down into the plum like the app's hammock line).
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
              Short letters from {dana.name}, a board-certified urologist, on the pelvic floor, bladder leaks and the habits that fix them. The blog of the {site.appName} app.
            </p>
            <div className="ft__social">
              <a href={dana.socials[0].url} rel="me noopener" target="_blank" aria-label="Dr. Dana on Instagram"><Icon name="instagram" /></a>
              <a href={`mailto:${site.email}`} aria-label="Email us"><Icon name="mail" /></a>
              <a href="/feed.xml" aria-label="RSS feed of the letters"><Icon name="link" /></a>
            </div>
          </div>
          <div>
            <h2>Read</h2>
            <ul>
              <li><a href="/letters">All letters</a></li>
              <li><a href="/feed.xml">RSS</a></li>
            </ul>
          </div>
          <div>
            <h2>The class</h2>
            <ul>
              <li><a href="/#get">Get the app</a></li>
              <li><a href="/live">Live with Dr. Dana</a></li>
              <li><a href="/support">Help and support</a></li>
            </ul>
          </div>
          <div>
            <h2>About</h2>
            <ul>
              <li><a href="/dana">Dr. Dana</a></li>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/terms">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="ft__base">
          <span>© {year} {site.name}. Education from a urologist, not medical advice. In an emergency, call 911.</span>
          <span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/sitemap.xml">Sitemap</a></span>
        </div>
      </div>
    </footer>
  );
}
