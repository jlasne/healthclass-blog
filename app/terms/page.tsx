import { Cat } from '@/components/Cat';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbs, graph, meta, dt } from '@/lib/seo';
import { legal } from '@/lib/legal';
import { site } from '@/lib/site';

// Terms for the app (also its Terms of Use for auto-renewing plans, as Apple requires) and for the website.
// DRAFT for a lawyer's review before the store release: fill every [bracket] first (npm run check lists them).
export const metadata = meta({
  title: 'Terms of Service',
  description: `The terms for ${site.appName} and www.healthclass.app: education not medical advice, plans and auto-renewal, the newsletter and the members' Q&A.`,
  path: '/terms',
});

const F = ({ children }: { children: React.ReactNode }) => <span className="fill">{children}</span>;

export default function Page() {
  return (
    <section className="doc">
      <div className="read">
        <div className="doc__hd">
          <div>
            <span className="eyebrow">Legal</span>
            <h1 className="h1" style={{ marginTop: 14 }}>Terms of Service</h1>
            <p className="doc__meta">{site.appName} (iOS and Android) and www.healthclass.app · Last updated <time dateTime={legal.updatedIso}>{legal.updated}</time></p>
          </div>
          <Cat pose="read" width={150} priority />
        </div>
        <div className="prose">
          <h2 id="who">1. Who we are</h2>
          <p>{site.appName} (&ldquo;the app&rdquo;) and www.healthclass.app (&ldquo;the website&rdquo;) are published by <F>{legal.entity}</F>, <F>{legal.address}</F> (&ldquo;we&rdquo;), with Dr. Dana Kivlin, a urologist. By using the app or the website, you accept these terms.</p>

          <h2 id="education">2. Education, not medical advice</h2>
          <p>The app, the letters, the newsletter and the live Q&amp;A teach how the pelvic floor works and how to train it. They do not diagnose or treat any condition, and they do not replace a visit to your doctor. The live Q&amp;A is general education: Dr. Dana does not examine you, diagnose you or create a doctor-patient relationship there.</p>
          <ul>
            <li>Check with your doctor before you start if one of the warning signs of the app&rsquo;s safety check applies to you.</li>
            <li>Stop an exercise and see a doctor if you notice one of the warning signs listed in the app or in a letter.</li>
            <li>In an emergency, call 911 or your local emergency number.</li>
          </ul>

          <h2 id="use">3. Using the app and the website</h2>
          <p>The app and the website are for people aged 16 and over, for personal use. If you are 16 or 17, read these terms with a parent or guardian; buying a plan follows the rules of your App Store or Google Play account. Keep your phone and its backup secure: your log lives there. Use the forms with your own email, and send questions without other people&rsquo;s private details.</p>

          <h2 id="plans">4. Plans and payments</h2>
          <ul>
            <li><b>Plans:</b> Weekly ({site.price.weekly} a week) and Annual ({site.price.annual} a year), in US dollars, or the local price your store shows before you buy. Week 1 of each program is free without a plan.</li>
            <li><b>Free trial:</b> a plan can start with a free trial when the store offers one. Before you start it, the app shows the day you pay. If you buy a plan during a free trial, the unused part of the trial ends.</li>
            <li><b>Payment</b> goes through your Apple ID or Google account at confirmation of purchase.</li>
            <li><b>Auto-renewal:</b> Weekly and Annual plans renew automatically at the same price for the same period, unless you cancel at least 24 hours before the end of the current period. Your account is charged for the renewal within the 24 hours before the end of the period.</li>
            <li><b>Cancel or manage</b> your plan in your App Store or Google Play account settings (in the app: Settings, then Manage plan). Deleting the app does not cancel a plan.</li>
            <li><b>Refunds</b> follow the policy of Apple or Google.</li>
          </ul>

          <h2 id="members">5. Members&rsquo; benefits: the live Q&amp;A</h2>
          <p>Members with an active paid plan can join a live Q&amp;A with Dr. Dana, usually once a month, and watch its replays while their plan is active. Dates, length and format may change; we announce each date by email. We may decline or shorten a question that is off-topic, that asks for a personal diagnosis, or that names another person. Recording the session yourself, or sharing its link or replays, needs our written consent.</p>

          <h2 id="newsletter">6. The newsletter</h2>
          <p>Class Notes is free. You can unsubscribe at any time with the link at the bottom of each letter. We may change its cadence or format.</p>

          <h2 id="content">7. Content</h2>
          <p>The programs, lessons, letters, drawings (the class cat included), texts and videos belong to us and to Dr. Dana. You may use them for your own practice and share links to the website. Copying, republishing or selling them needs our written consent.</p>

          <h2 id="data">8. Your data</h2>
          <p>The <a href="/privacy">Privacy Policy</a> explains what stays on your phone and what reaches us.</p>

          <h2 id="changes-app">9. Changes to the app and the website</h2>
          <p>We improve the app and the website over time. Programs listed as coming next may change or open at a different date.</p>

          <h2 id="liability">10. Liability</h2>
          <p>We provide the app and the website as they are. To the extent the law allows, we are not liable for indirect damages, or for harm from using the exercises against the warning signs or your doctor&rsquo;s advice.</p>

          <h2 id="apple">11. Apple</h2>
          <p>If you use the app on an Apple device, these terms are between you and us, not Apple. Apple is not responsible for the app or its content, has no obligation to provide support for it, and is a third-party beneficiary of these terms with the right to enforce them. Apple&rsquo;s standard Licensed Application End User License Agreement also applies, where it does not conflict with these terms.</p>

          <h2 id="law">12. Law</h2>
          <p>These terms follow the laws of <F>{legal.governingLaw}</F>, without limiting the rights your local consumer law gives you.</p>

          <h2 id="contact">13. Contact</h2>
          <p>Questions: <a href={`mailto:${site.email}`}>{site.email}</a>. We post any change on this page and in the app, with a new date at the top.</p>
        </div>
      </div>
      <JsonLd data={graph({ '@type': 'WebPage', name: 'Terms of Service', dateModified: dt(legal.updatedIso) }, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Terms of Service', path: '/terms' }]))} />
    </section>
  );
}
