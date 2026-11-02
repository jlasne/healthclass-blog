import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();
// MailCheap catches up on signups it has not received (the key was missing, or it was down)
crons.hourly('mailcheap catch-up', { minuteUTC: 17 }, internal.mailcheap.pushPending, {});
// old sign-in links, passes and rate-limit rows go
crons.daily('qa cleanup', { hourUTC: 7, minuteUTC: 41 }, internal.qa.cleanup, {});
export default crons;
