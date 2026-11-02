import { Cat } from '@/components/Cat';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbs, graph, meta } from '@/lib/seo';
import { legal } from '@/lib/legal';
import { site } from '@/lib/site';

// One privacy policy for the app (Pelvic Health Class: for Women, iOS and Android) and the website
// (www.healthclass.app: the letters, Class Notes and the members' Q&A). The App Store and Google Play both link here.
// DRAFT for a lawyer's review before the store release: fill every [bracket] first (npm run check lists them).
export const metadata = meta({
  title: 'Privacy Policy',
  description: `How ${site.appName} and www.healthclass.app handle your data: what stays on your phone, what reaches us, who processes it, and how to delete it.`,
  path: '/privacy',
});

const F = ({ children }: { children: React.ReactNode }) => <span className="fill">{children}</span>;
const SECTIONS = [
  ['short', 'The short version'], ['who', 'Who we are'], ['phone', 'Data that stays on your phone'], ['app', 'Data the app sends us'],
  ['purchases', 'Purchases'], ['chat', 'Support chat'], ['website', 'The website'], ['newsletter', 'Class Notes'], ['qa', 'The live Q&A'],
  ['processors', 'Who processes data'], ['retention', 'How long we keep data'], ['rights', 'Your rights and deletion'], ['health', 'Health information'],
  ['children', 'Teens and children'], ['changes', 'Changes'],
] as const;

export default function Page() {
  return (
    <section className="doc">
      <div className="read">
        <div className="doc__hd">
          <div>
            <span className="eyebrow">Legal</span>
            <h1 className="h1" style={{ marginTop: 14 }}>Privacy Policy</h1>
            <p className="doc__meta">{site.appName} (iOS and Android) and www.healthclass.app · Last updated <time dateTime={legal.updatedIso}>{legal.updated}</time></p>
          </div>
          <Cat pose="heart" width={150} priority />
        </div>
        <ul className="doc__toc" aria-label="Sections">
          {SECTIONS.map(([id, t]) => (<li key={id}><a href={`#${id}`}>{t}</a></li>))}
        </ul>
        <div className="prose">
          <div className="doc__short" id="short">
            <h2>The short version</h2>
            <ul>
              <li>Your health answers, your log (with its photos and notes) and your progress stay on your phone.</li>
              <li>Only a few things reach us: your email if you add it, the programs you ask us to tell you about, which first-question screen you reached (a number, never your answers), your purchases and your chats with us.</li>
              <li>On the website, we collect your email if you join Class Notes or sign in to the Q&amp;A, and the questions you send Dr. Dana.</li>
              <li>We sell no data, show no ads and run no tracking across apps or websites.</li>
              <li>In the app, Settings, then Delete my data, erases everything on your phone and asks our server to erase the rest. You can also email {site.email}.</li>
            </ul>
          </div>

          <h2 id="who">Who we are</h2>
          <p>{site.appName} (&ldquo;the app&rdquo;) and the website www.healthclass.app (&ldquo;the website&rdquo;) are published by <F>{legal.entity}</F>, <F>{legal.address}</F> (&ldquo;we&rdquo;), with Dr. Dana Kivlin, a urologist. We are the controller of the data described here. Contact: <a href={`mailto:${site.email}`}>{site.email}</a>.</p>

          <h2 id="phone">Data that stays on your phone</h2>
          <p>Your answers to the first questions (your need, your life stage, your symptoms, the safety check), your check-ins, your log (its photos and notes), your progress, your routine and your reminder time. The app stores them on your phone only. Your phone&rsquo;s own backup (iCloud or Google) may keep a copy, under the settings of your Apple or Google account. We cannot read this data.</p>

          <h2 id="app">Data the app sends us</h2>
          <ul>
            <li><b>Your email, if you add it</b>, for Class Notes, our free letter (Wednesday and Sunday), and to sign in to the members&rsquo; Q&amp;A. Each letter has a one-click unsubscribe link.</li>
            <li><b>&ldquo;Notify me&rdquo; requests:</b> the program you ask about (for example Prolapse), a random app ID created on your phone, your email if you add it, and your phone&rsquo;s platform and app version. We use them to count the demand for each program and to tell you the day it opens.</li>
            <li><b>The first-question screens you reach:</b> a screen number (1 to 12), the random app ID, and your phone&rsquo;s platform and app version. Never your answers. We use them to make the first questions shorter.</li>
          </ul>
          <p>The app stores these with our database provider, Supabase (<F>{legal.supabaseRegion}</F>).</p>

          <h2 id="purchases">Purchases</h2>
          <p>Apple (App Store) or Google (Google Play) process your payment. We never see your card. Superwall, our subscription provider, shows the plan screen and tests versions of it. It receives an anonymous app user ID, your device type, language and app version, the plan screens you see and your purchases. It never receives your answers, your program or your log.</p>
          <p>When you buy, renew, cancel or end a plan, Superwall tells our website server (hosted by Convex) the event, the product, the end date, the anonymous app user ID and, if you added it in the app, your email. We use this only to let paid members into the monthly live Q&amp;A.</p>

          <h2 id="chat">Support chat (iPhone)</h2>
          <p>On iPhone, Today and Settings open a chat with our team, run by Reception. When the app opens, Reception receives your phone&rsquo;s details: app version, phone model, iOS version, language, region, time zone and whether notifications are on. When you chat, Reception receives what you write and the photos you send. From your first chat, it also receives your email if you added it, your plan, the day you joined, your week and day, your reminder time and your break dates. Never your answers to the first questions or your log. If you mention your health in the chat, we use it only to answer you.</p>

          <h2 id="website">The website</h2>
          <ul>
            <li><b>Reading:</b> the website sets no advertising or analytics cookies. Our host, Vercel, processes the technical data every website receives (IP address, browser, the page requested) to deliver pages and protect them from abuse, and keeps its server logs for a short period.</li>
            <li><b>Forms:</b> when you send a form, we receive what you type in it and your IP address, which we use only to block abuse (at most a few tries per network every few minutes).</li>
            <li><b>Cookies:</b> only one, after you sign in to the Q&amp;A: <code>hc_qa</code>, a random sign-in key, kept 30 days or until you sign out. It is needed for the members&rsquo; page to work.</li>
          </ul>

          <h2 id="newsletter">Class Notes, the newsletter</h2>
          <p>If you join Class Notes on the website or in the app, we store your email, the page you joined from, the date and whether you are subscribed, in our database at Convex. We send the letters through MailCheap, which receives your email, the source &ldquo;website&rdquo; and your IP address (to block fake signups). We use your email to send the letters, twice a week, and nothing else. Every letter has a one-click unsubscribe link. Unsubscribing stops the letters at once.</p>

          <h2 id="qa">The live Q&amp;A with Dr. Dana</h2>
          <p>To sign in, you type the email you added in the app. Our server checks it against our list of paid members and, if it matches, emails you a one-time link through Resend. The answer on the page is the same for every email, so the page never shows whether someone has a plan. We store a scrambled form (a hash) of each link and sign-in key, never the key itself.</p>
          <p>When you send a question, we store it with your email, the date and, only if you choose, your first name. Dr. Dana reads the questions without email addresses. The session is hosted on <F>[video platform, e.g. Zoom]</F> under its own policy; joining is optional and your camera can stay off.</p>

          <h2 id="processors">Who processes data for us</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Provider</th><th>What for</th><th>Data</th></tr></thead>
              <tbody>
                <tr><td>Apple, Google</td><td>App stores, payments, phone backups</td><td>Purchases, under their own policies</td></tr>
                <tr><td>Superwall</td><td>Plan screens, subscription events</td><td>Anonymous app user ID, device details, purchases, email if added</td></tr>
                <tr><td>Supabase</td><td>App database</td><td>Email, Notify me requests, screen numbers</td></tr>
                <tr><td>Convex</td><td>Website database</td><td>Newsletter emails, paid members, Q&amp;A questions, sign-in hashes</td></tr>
                <tr><td>Vercel</td><td>Website hosting</td><td>Technical request data</td></tr>
                <tr><td>MailCheap</td><td>Sending Class Notes</td><td>Email, signup source, IP address</td></tr>
                <tr><td>Resend</td><td>Sending Q&amp;A sign-in links</td><td>Email</td></tr>
                <tr><td>Reception</td><td>Support chat on iPhone</td><td>See Support chat above</td></tr>
              </tbody>
            </table>
          </div>
          <p>Each provider processes the data only on our instructions. Some of them store data in the United States. Where the law requires it, we rely on the European Commission&rsquo;s standard contractual clauses for transfers. Links to Instagram open the Instagram app or website, under Instagram&rsquo;s own policy.</p>

          <h2 id="retention">How long we keep data</h2>
          <ul>
            <li>Your email for Class Notes: until you unsubscribe or delete your data.</li>
            <li>A &ldquo;Notify me&rdquo; request: until 90 days after the program opens, or until you delete your data.</li>
            <li>Paid member records: while your plan is active, then 12 months, or until you delete your data.</li>
            <li>Q&amp;A questions: 12 months after the session, or until you delete your data. Sign-in links: 24 hours. Sign-in keys: 30 days.</li>
            <li>Your chat: until you delete your data or ask us to delete it.</li>
          </ul>

          <h2 id="rights">Your rights and how to delete your data</h2>
          <p>You can ask to see, correct, export or delete the data we hold about you, and object to its use. In the app, Settings, then Delete my data, erases your data on the phone, deletes your chat and its photos, and asks our server to delete the email and requests linked to your app ID. To delete website data (Class Notes, the Q&amp;A), or for anything else, email <a href={`mailto:${site.email}?subject=Delete%20my%20data`}>{site.email}</a> from the address concerned. We answer within 30 days. You can also complain to your data protection authority. California residents: we do not sell or share personal information as the CCPA defines those terms.</p>

          <h2 id="health">Health information</h2>
          <p>{site.appName} is education from a urologist, not medical advice. Your health answers stay on your phone and never reach us. A question you send for the Q&amp;A may mention your health: we use it only to prepare the session.</p>

          <h2 id="children">Teens and children</h2>
          <p>The app and the website are for people aged 16 and over. We handle the data of 16 and 17 year olds exactly as described above, with no advertising and no profiling. We do not knowingly collect data from anyone under 16. If you think a child under 16 has sent us data, write to <a href={`mailto:${site.email}`}>{site.email}</a> and we will delete it.</p>

          <h2 id="changes">Changes</h2>
          <p>We post any change on this page and in the app, with a new date at the top. For an important change, we also tell Class Notes subscribers by email.</p>
        </div>
      </div>
      <JsonLd data={graph({ '@type': 'WebPage', name: 'Privacy Policy', dateModified: legal.updatedIso }, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }]))} />
    </section>
  );
}
