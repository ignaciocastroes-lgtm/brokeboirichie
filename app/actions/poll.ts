'use server'

import { randomUUID } from 'node:crypto'
import { cookies } from 'next/headers'
import { count, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pollVotes } from '@/lib/db/schema'
import { POLL_ERAS, TRACKS } from '@/lib/site-data'

const VOTER_COOKIE = 'bbr_voter'

const VALID_CHOICES = {
  era: new Set<string>(POLL_ERAS.map((e) => e.id)),
  show: new Set<string>(TRACKS.map((t) => t.id)),
} as const

export type PollQuestion = keyof typeof VALID_CHOICES

export type PollState = {
  totals: Record<PollQuestion, Record<string, number>>
  mine: Partial<Record<PollQuestion, string>>
}

async function readVoterId() {
  return (await cookies()).get(VOTER_COOKIE)?.value
}

async function ensureVoterId() {
  const store = await cookies()
  const existing = store.get(VOTER_COOKIE)?.value
  if (existing) return existing
  const id = randomUUID()
  const isDev = process.env.NODE_ENV === 'development'
  store.set(VOTER_COOKIE, id, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    // The v0 preview renders inside a cross-site iframe; without this the cookie is dropped.
    sameSite: isDev ? 'none' : 'lax',
    secure: isDev ? true : process.env.NODE_ENV === 'production',
  })
  return id
}

export async function getPollState(): Promise<PollState> {
  const voterId = await readVoterId()

  const rows = await db
    .select({ question: pollVotes.question, choice: pollVotes.choice, votes: count() })
    .from(pollVotes)
    .groupBy(pollVotes.question, pollVotes.choice)

  const totals: PollState['totals'] = { era: {}, show: {} }
  for (const r of rows) {
    if (r.question === 'era' || r.question === 'show') totals[r.question][r.choice] = Number(r.votes)
  }

  const mine: PollState['mine'] = {}
  if (voterId) {
    const own = await db
      .select({ question: pollVotes.question, choice: pollVotes.choice })
      .from(pollVotes)
      .where(eq(pollVotes.voterId, voterId))
    for (const r of own) {
      if (r.question === 'era' || r.question === 'show') mine[r.question] = r.choice
    }
  }

  return { totals, mine }
}

export async function castVote(question: PollQuestion, choice: string): Promise<PollState> {
  if (!(question in VALID_CHOICES) || !VALID_CHOICES[question].has(choice)) {
    throw new Error('Voto inválido')
  }

  const voterId = await ensureVoterId()

  await db
    .insert(pollVotes)
    .values({ question, choice, voterId })
    .onConflictDoUpdate({
      target: [pollVotes.question, pollVotes.voterId],
      set: { choice, createdAt: new Date() },
    })

  return getPollState()
}
