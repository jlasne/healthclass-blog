# Class Notes · the newsletter

Free, every Wednesday and Sunday, from Dr. Dana Kivlin. Hosted on [MailCheap](https://mailcheap.ai). Every signup on the website lands
in Convex first (`subscribers` table), then goes to MailCheap through its API as soon as `MAILCHEAP_API_KEY` is set on
Convex. An hourly job sends everyone who signed up before the key existed, so no signup is lost while the newsletter
is being set up.

## Set up MailCheap (once)

1. Create the newsletter "Class Notes", sender **Dr. Dana · Class Notes**, from `DrDana@healthclass.app`; replies go to info@healthclass.app.
   Authenticate the domain (SPF, DKIM, DMARC) in MailCheap's deliverability settings.
2. Turn on confirmed opt-in if you want it (MailCheap sends the confirmation email itself).
3. Paste `welcome.md` as the welcome email.
4. Create a **signups-only** API key, then: `npx convex env set MAILCHEAP_API_KEY <key>` (and
   `MAILCHEAP_NEWSLETTER <slug>` if the account has more than one newsletter).
5. Optional: MailCheap can read `https://www.healthclass.app/feed.xml` for an RSS digest.

## On autopilot: every Wednesday and Sunday, 7:00 AM Eastern

The issues wait in `issues/` (`01-<slug>.md`, `02-...`), in sending order. Vercel calls `/api/cron/newsletter` every
Wednesday and Sunday at 9:00 UTC (`vercel.json`). It takes the first issue MailCheap has not seen (matched by its `slug`),
adds the resource pages published since the last issue under "New on Health Class", creates it in MailCheap and
schedules it for 7:00 AM New York time. Until then it can be canceled in MailCheap, Campaigns, Scheduled.

- Once: in Vercel, project healthclass-blog, Settings, Environment Variables (Production), add `MAILCHEAP_API_KEY` (a
  **Full access** key from MailCheap, API keys) and `CRON_SECRET` (any long random text), then redeploy.
- Preview the next issue: `curl -H "Authorization: Bearer <CRON_SECRET>" https://www.healthclass.app/api/cron/newsletter?dry=1`
- Add issues: drop new files at the end of `issues/` (see `issues/README.md`). With fewer than 4 left, write more.
- Skip an issue: cancel it in MailCheap; the next run sends the following one.

## Every issue is built for trust

Use `issue-template.md`. The checklist, in short:

| Trust signal | How |
|---|---|
| A real sender | From "Dr. Dana · Class Notes", a reply-to that a person reads |
| A face and a credential | Dana's photo and "Board-certified urologist, Middlesex Health" in the header |
| A source for every number | A numbered source list at the end, links to the studies |
| Honest size of the evidence | "1 small study", "11 trials, 3,307 women" |
| A safety line | "See a doctor if..." when the topic calls for it |
| One clear ask | One link: read the full letter, or try the exercise. The app comes after the value, once |
| A reader question | Answered by Dana, published without a name, with permission |
| Easy exit | 1-click unsubscribe, the postal address (required by CAN-SPAM) |
| Same days, same time | Wednesday and Sunday, 7:00 AM Eastern |
