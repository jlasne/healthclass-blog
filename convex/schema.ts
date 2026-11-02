// Health Class blog · the Convex tables. Health answers never come here: only the letter's subscribers, the app's paid
// members (for the monthly Q&A), the Q&A's sign-in links, events and questions, and rate limits.
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Class Notes, the free letter. Every signup lands here first; mailcheap.ts copies it to MailCheap when a key is set.
  subscribers: defineTable({
    email: v.string(),
    status: v.union(v.literal('active'), v.literal('unsubscribed')),
    source: v.optional(v.string()),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    syncedAt: v.optional(v.number()),
    syncError: v.optional(v.string()),
    syncAttempts: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_syncedAt', ['syncedAt']),

  // the app's paid members: from Superwall's webhook (http.ts) or added by hand (members.upsert)
  members: defineTable({
    email: v.optional(v.string()),
    appUserId: v.optional(v.string()),
    active: v.boolean(),
    productId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    lastEvent: v.optional(v.string()),
    source: v.union(v.literal('superwall'), v.literal('admin')),
    updatedAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_appUserId', ['appUserId']),

  // one-time sign-in links sent by email (only the SHA-256 of the token is stored), valid 30 minutes
  qaLinks: defineTable({ tokenHash: v.string(), email: v.string(), expiresAt: v.number(), usedAt: v.optional(v.number()) }).index('by_tokenHash', ['tokenHash']),
  // a signed-in browser (its cookie's SHA-256), valid 30 days
  qaPasses: defineTable({ passHash: v.string(), email: v.string(), expiresAt: v.number(), createdAt: v.number() }).index('by_passHash', ['passHash']),
  // the live sessions with Dr. Dana, one a month
  qaEvents: defineTable({
    startsAt: v.number(),
    durationMin: v.number(),
    title: v.string(),
    topic: v.optional(v.string()),
    joinUrl: v.optional(v.string()),
    replayUrl: v.optional(v.string()),
  }).index('by_startsAt', ['startsAt']),
  // members' questions for the next session
  qaQuestions: defineTable({
    email: v.string(),
    eventId: v.optional(v.id('qaEvents')),
    text: v.string(),
    firstName: v.optional(v.string()),
    status: v.union(v.literal('new'), v.literal('picked'), v.literal('answered')),
    createdAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_event', ['eventId']),

  rateLimits: defineTable({ key: v.string(), windowStart: v.number(), count: v.number() }).index('by_key', ['key']),
});
