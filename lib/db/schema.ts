import { pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const pollVotes = pgTable(
  'poll_votes',
  {
    id: serial('id').primaryKey(),
    question: text('question').notNull(),
    choice: text('choice').notNull(),
    voterId: text('voter_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.question, t.voterId)],
)
