import { Cat } from '@/components/Cat';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbs, graph, meta } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = meta({
  title: `Support for ${site.appName}`,
  description: `Help with ${site.appName}: manage or cancel your plan, restore a purchase, reminders, the live Q&A and deleting your data. Email ${site.email}.`,
  path: '/faq',
});

const TOPICS: { id: string; q: string; a: React.ReactNode }[] = [
  { id: 'cancel', q: 'How do I cancel or change my plan?', a: (<><p><b>iPhone:</b> open Settings, tap your name, then Subscriptions, then {site.appShort}. Or in the app: Settings, then Manage plan.</p><p><b>Android:</b> open Google Play, tap your profile, then Payments and subscriptions, then Subscriptions.</p><p>Cancel at least 24 hours before the renewal date. Your plan runs to the end of the period you paid for.</p></>) },
  { id: 'restore', q: 'I have a plan, but the app asks me to pay.', a: (<p>In the app, open the plan screen and tap Restore purchase. Use the same Apple ID or Google account you bought the plan with.</p>) },
  { id: 'refund', q: 'How do I get a refund?', a: (<p>Apple and Google handle payments, so refunds follow their policy. iPhone: reportaproblem.apple.com. Android: the Google Play order history.</p>) },
  { id: 'reminders', q: 'My daily reminder stopped.', a: (<p>Check that notifications are on for the app in your phone&rsquo;s settings. Then, in the app, open Settings and set your reminder time again.</p>) },
  { id: 'qa', q: 'How do I join the monthly live Q&A?', a: (<p>Add your email in the app (Settings), then go to <a className="link" href="/live">www.healthclass.app/live</a> and ask for your link with that same email.</p>) },
  { id: 'newsletter', q: 'How do I stop the letters?', a: (<p>Click &ldquo;unsubscribe&rdquo; at the bottom of any letter. It works at once.</p>) },
  { id: 'delete-my-data', q: 'How do I delete my data?', a: (<><p><b>In the app:</b> Settings, then Delete my data. It erases everything on your phone, deletes your chat with us and asks our server to erase your email and requests.</p><p><b>By email:</b> write to <a className="link" href={`mailto:${site.email}?subject=Delete%20my%20data`}>{site.email}</a> from the address you used, with the subject &ldquo;Delete my data&rdquo;. We answer within 30 days. Deleting the app alone leaves your plan active: cancel it in your store settings.</p></>) },
];

export default function Page() {
  return (
    <section className="doc">
      <div className="read">
        <div className="doc__hd">
          <div>
            <span className="eyebrow">Support</span>
            <h1 className="h1" style={{ marginTop: 14 }}>How can we <em>help</em>?</h1>
            <p className="lede" style={{ marginTop: 16 }}>Write to us and a person from the Health Class team answers. On iPhone, the app also has a chat: Settings, then Chat with us.</p>
          </div>
          <Cat pose="think" width={150} priority />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
          <a className="btn" href={`mailto:${site.email}`}><Icon name="mail" /> {site.email}</a>
          <a className="btn btn--quiet" href="/privacy">Privacy policy</a>
        </div>
        <ul className="doc__toc" aria-label="Topics">
          {TOPICS.map((t) => (<li key={t.id}><a href={`#${t.id}`}>{t.q.replace(/\?$/, '')}</a></li>))}
        </ul>
        <div className="faq" style={{ marginTop: 18 }}>
          {TOPICS.map((t) => (
            <details key={t.id} id={t.id}>
              <summary>{t.q}</summary>
              <div>{t.a}</div>
            </details>
          ))}
        </div>
        <div className="box box--doctor" style={{ marginTop: 32 }}>
          <span className="box__k"><Icon name="alert" /> A health question?</span>
          <p style={{ margin: 0 }}>Support can help with the app. For symptoms, see your doctor. In an emergency, call 911 or your local emergency number.</p>
        </div>
      </div>
      <JsonLd data={graph(breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Support', path: '/faq' }]))} />
    </section>
  );
}
