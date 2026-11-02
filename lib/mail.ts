import 'server-only';
// Sends the Q&A sign-in email (a transactional email, separate from the newsletter). Through Resend's API when
// RESEND_API_KEY is set (from QA_FROM_EMAIL, e.g. "Dr. Dana at Health Class <qa@healthclass.app>"). Without a key, the
// link is logged on the server, so the flow can be tested before launch.
export async function sendQaLink(to: string, link: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.QA_FROM_EMAIL || 'Health Class <qa@healthclass.app>';
  const subject = 'Your link to the live Q&A with Dr. Dana';
  const text = `Here is your link to the live Q&A page. It works once, for 30 minutes:\n\n${link}\n\nOn the page: the next session's date and join link, the replays, and a box to send Dr. Dana your question.\n\nYou asked for this link on www.healthclass.app. If it was someone else, ignore this email: nothing changes.\n\nHealth Class · Pelvic Health Class: for Women`;
  const html = `<!doctype html><html><body style="margin:0;background:#FFFBF6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#4A3F39">
<div style="max-width:520px;margin:0 auto;padding:36px 24px">
<p style="font:600 12px/1.2 sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#7C2D4B;margin:0">Ask Dr. Dana · live Q&amp;A</p>
<h1 style="font:400 30px/1.15 Georgia,serif;color:#2A2421;margin:12px 0 0">Your link to the members' page</h1>
<p style="font-size:16px;line-height:1.6;margin:16px 0 24px">It works once, for 30 minutes. On the page: the next session's date and join link, the replays, and a box to send Dr. Dana your question.</p>
<a href="${link}" style="display:inline-block;background:#B93D57;color:#fff;text-decoration:none;font-weight:600;font-size:16px;padding:15px 26px;border-radius:999px">Open the Q&amp;A page</a>
<p style="font-size:13px;line-height:1.5;color:#7A6E66;margin:28px 0 0">You asked for this link on www.healthclass.app. If it was someone else, ignore this email: nothing changes.</p>
</div></body></html>`;
  if (!key) {
    console.info(`[qa] RESEND_API_KEY not set: sign-in link for ${to}: ${link}`);
    return true;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
  });
  if (!res.ok) console.error('[qa] email failed', res.status, await res.text());
  return res.ok;
}
