# Class Notes · the newsletter

Free, every Sunday, from Dr. Dana Kivlin. Hosted on [MailCheap](https://mailcheap.ai). Every signup on the website lands
in Convex first (`subscribers` table), then goes to MailCheap through its API as soon as `MAILCHEAP_API_KEY` is set on
Convex. An hourly job sends everyone who signed up before the key existed, so no signup is lost while the newsletter
is being set up.

## Set up MailCheap (once)

1. Create the newsletter "Class Notes", sender **Dr. Dana · Class Notes**, from `dana@healthclass.app` (or `notes@`).
   Authenticate the domain (SPF, DKIM, DMARC) in MailCheap's deliverability settings.
2. Turn on confirmed opt-in if you want it (MailCheap sends the confirmation email itself).
3. Paste `welcome.md` as the welcome email.
4. Create a **signups-only** API key, then: `npx convex env set MAILCHEAP_API_KEY <key>` (and
   `MAILCHEAP_NEWSLETTER <slug>` if the account has more than one newsletter).
5. Optional: MailCheap can read `https://www.healthclass.app/feed.xml` for an RSS digest.

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
| Same day, same time | Sunday, 7:00 AM Eastern |
