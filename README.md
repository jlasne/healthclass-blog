# www.healthclass.app

The blog, the newsletter, the monthly members' Q&A and the legal pages of **Pelvic Health Class: for Women**, the app
of Dr. Dana Kivlin, board-certified urologist ([jlasne/healthclass](https://github.com/jlasne/healthclass)).
Same design language as the app: paper, rose and plum, Fraunces and Instrument Sans, and the class cat in 6-frame loops.

| Page | What |
|---|---|
| `/` | One goal: get the app (store buttons, QR code). Below: Dr. Dana, the letters, the lives |
| `/letters`, `/letters/<slug>` | The letter signup, then the archive with search. Each letter has a hand-drawn sketch, sources, FAQ, share image |
| `/live` | The monthly live with Dr. Dana. Locked: a premium plan in the app + the free letter. One email field unlocks it |
| `/dana-kivlin` | Dr. Dana in her own words: credentials, why the class, where to find her, podcasts |
| `/faq` | FAQ and help, the Support URL for the App Store and Google Play (cancel, restore, delete my data) |
| `/resources`, `/resources/<family>`, `/resources/<family>/<slug>` | Free tools, Side by side, The classes, Made for you: one page a day ([plan](content/resources/PLAN.md)) |
| `/privacy`, `/terms` | One policy and one set of terms for the app **and** the website (store-ready drafts) |
| `healthclass.app/<code>` | Short links by channel (ig, ig-story, nl, blog, web, dana, pod, or ?s=): phones to their store, computers to the site, clicks counted in PostHog (`proxy.ts`, `linkSources` in `lib/site.ts`) |
| `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/llms.txt` | Built from the content, refreshed every hour |

Old paths redirect: `/blog` to `/letters`, `/qa` to `/live`, `/about` and `/dana` to `/dana-kivlin`, `/newsletter` to `/letters`, `/app` to `/`.

## Stack

- **Next.js 16** (App Router, React 19), static pages re-rendered hourly, on **Vercel**.
- **Convex** for the backend (`convex/`): newsletter signups, paid members, Q&A sign-in, events and questions.
- **MailCheap** sends Class Notes (`convex/mailcheap.ts`). **Resend** sends Q&A sign-in links (`lib/mail.ts`).
- Superwall's webhook tells Convex who has a paid plan (`convex/http.ts`).

## Run it

```bash
npm install
npx convex dev          # first time: log in, create the project; it writes .env.local
npm run dev             # http://localhost:3000
```

Without Convex the site still runs: every form answers as if it worked and the server logs what it would have sent.
To try the backend with no account: `CONVEX_AGENT_MODE=anonymous npx convex dev` (a local backend).

Tests, with the site running (`npm run build && npm start -- -p 3005`):

```bash
node tests/shots.mjs http://localhost:3005 / /blog /about      # phone and desktop screenshots, fails on console errors
NEXT_LOG=next.log node tests/flows.mjs http://localhost:3005    # the forms end to end (start the server with > next.log)
```

## Launch checklist

1. `npm run check` lists what is left. It fails while a `[bracket]` is in the legal pages or a letter lacks Dr. Dana's
   approval (`reviewed: true` in its front matter).
2. Dr. Dana approves the 9 letters, the home page quote, "A letter from Dana" on `/dana-kivlin`, and her facts in
   `lib/site.ts` (name, board certification, Middlesex Health, medical school and year).
3. Fill `lib/legal.ts` (publisher, address, governing law, Supabase region) and the video platform in
   `app/privacy/page.tsx`. Have a lawyer read `/privacy` and `/terms`.
4. **Convex:** `npx convex deploy`, then on the production deployment:
   `npx convex env set HC_SERVER_SECRET <random>`, `SUPERWALL_WEBHOOK_KEY <random>`, `HC_ADMIN_TOKEN <random>`,
   and `MAILCHEAP_API_KEY <key>` once the newsletter exists (signups made before wait in Convex and go out within the hour).
5. **Vercel:** import this repo. Env: `NEXT_PUBLIC_CONVEX_URL` (production), `HC_SERVER_SECRET` (same value),
   `RESEND_API_KEY`, `QA_FROM_EMAIL`. See `.env.example`.
6. **Domains (Vercel):** add `www.healthclass.app` and `healthclass.app` to the same project. Do **not** set a Vercel
   redirect from the bare domain: `proxy.ts` handles it (phones to their store, computers to `/app`, every other path
   to the same path on www).
7. **Stores:** when the listings are live, set `appStoreUrl`, `playStoreUrl` and `appStoreId` in `lib/site.ts`.
   Store fields: Privacy Policy URL `https://www.healthclass.app/privacy`, Terms of Use (EULA)
   `https://www.healthclass.app/terms`, Support URL `https://www.healthclass.app/faq` (`/support` forwards there), Marketing URL
   `https://www.healthclass.app`, Play data deletion URL `https://www.healthclass.app/privacy#rights`.
8. **Superwall (left for later):** the setup wizard's last 2 steps wait for the first Android build: in the Play
   Console, Monetisation setup, Real-time developer notifications, paste the topic
   `projects/healthclass-513513/topics/Play-Store-Notifications`; then in Superwall's "Choose your SDK" pick
   **UIKit** for iOS and **Kotlin** for Android (the app is a Capacitor app: its Superwall plugin runs those 2 native
   SDKs; Flutter and Expo do not apply).
9. **Superwall webhook:** add the webhook `https://<deployment>.convex.site/webhooks/superwall?key=<SUPERWALL_WEBHOOK_KEY>`.
   In the app, set the member's email as a Superwall user attribute when she adds it
   (`Superwall.setUserAttributes({ email })`), so the Q&A recognizes her. Manual fix for one member:
   `curl -X POST https://<deployment>.convex.site/members -H "Authorization: Bearer $HC_ADMIN_TOKEN" -d '{"email":"...","active":true}'`.
9. **Resend:** verify `healthclass.app`, then set `RESEND_API_KEY` and `QA_FROM_EMAIL` in Vercel.
10. **MailCheap:** see [newsletter/README.md](newsletter/README.md) (welcome email and the trust template for each issue).
11. **Search:** add the site to Google Search Console and Bing Webmaster Tools, submit `/sitemap.xml` once. It updates
    itself after that.

## Write a letter

Add `content/articles/<keyword-slug>.mdx`. Copy the front matter of an existing letter: `title` (short, the letter's
voice), `seoTitle` (the search query), `description` (150 characters), `excerpt`, `date`, `updated`, `topic`, `tone`
(`rosy`, `plum`, `blush`, `sky`), `cat` (a pose), `keywords`, `faq`, `sources`, `reviewed`.

- The letter appears everywhere on the next deploy: archive, home, RSS, `llms.txt`, sitemap, share image.
- A future `date` schedules it: it goes live on that day by itself (pages re-render every hour).
- In the body: `<Ref n={1} />` for a source, `<Bars>`, `<Dots>`, `<Weeks>`, `<Rhythm>`, `<Hammock>`, `<Steps>` for a
  sketch (`components/Sketch.tsx`), `<Try>`, `<Doctor>`, `<Remember>` boxes and `<Letter />` for a mid-letter signup.
- Copy rules (the app's): no em dashes, under 30 words a sentence, a number instead of an adjective, no weasel words,
  simple words, say what to do. `npm run check` flags the dashes and long sentences.

## Resources (/resources)

Dr. Dana's tips from her Instagram reels, summed up in `content/dana/reels-tips.md`, feed `/dana-kivlin` and the pages
(quoted as "Dr. Dana, on Instagram"). Her treatment tips are never used: no medical advice on the site.

Free tools, comparisons, the classes week by week and pages for each moment, in `content/resources/<family>/<slug>.mdx`
(families: `tools`, `compare`, `classes`, `made-for-you`). One new page a day, in the order and with the rules of
[content/resources/PLAN.md](content/resources/PLAN.md). Each page appears on its family page, on `/resources`, in the
sitemap and in `llms.txt` by itself. `npm run check:resources` checks a page before it goes out: the front matter, the
copy rules, the sources, the links and the honesty rule on comparisons. What the app is today (price, free week,
phones, classes, features) lives in `lib/app-facts.ts`: pages show it as `{app.price}`, `{app.phones}`..., so when the
app changes, one edit there updates every comparison and its dates.

"Get the app", in the header and on every resource page, opens the launch-day waitlist until `appStoreUrl` and
`playStoreUrl` are set in `lib/site.ts`; then it goes to the store for the phone. Page views go to Vercel Web Analytics
(no cookies), on Vercel only.

## Plan a Q&A session

```bash
npx convex run qa:addEvent '{"startsAt":"2026-12-03T20:00:00-05:00","title":"Leaks, Kegels and your questions","joinUrl":"https://zoom.us/j/..."}'
npx convex run qa:setReplay '{"id":"<event id>","replayUrl":"https://..."}'
```

Questions arrive in the `qaQuestions` table (Convex dashboard), linked to the next session.

## The cat

The drawings live in `vendor/ink.js`, a copy of the app's `www/js/ink.js` (16 poses: hello, think, read, write, lift,
cheer, hammock, sleep...). `vendor/ink-blog.js` adds the website's own poses with the same engine and parts (`peek`,
`reading`). `npm run cats` (run by `npm run build`) renders each pose into `public/cats/<pose>.svg`: 6 frames with
their own CSS, swapping 7 times a second, frame 1 alone under reduced motion. `public/cats/still/` holds frame 1 for
share images. To add a pose, `I.define(name, { w, h, draw(t, K) })` in `vendor/ink-blog.js` (the format is documented
at the top of `vendor/ink.js`).

## Open decisions (to settle before launch)

- **Pricing.** The app's settings say $7.99 a week and $79.99 a year, with 7 free days on the annual plan only. Not
  confirmed yet. Once decided: create the 2 subscriptions in App Store Connect and Google Play
  (`healthclass_weekly`, `healthclass_annual`), add them in Superwall (Products, entitlement `premium`), build the
  paywall, and add the 4 placements (`onboarding_done`, `week_locked`, `routine_locked`, `settings_plan`) to a
  campaign. Then update the prices in `lib/site.ts`, the Terms (plans) and the store descriptions.
- **Google Play account type.** Personal account: keep only "Activity and fitness" in Health apps. For medical
  categories, get a D-U-N-S number and move the app to an organization account.
- **Reception on Android.** Not available (iOS only). Asked the founder; email support on Android until then.
