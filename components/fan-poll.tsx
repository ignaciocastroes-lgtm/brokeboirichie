'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { POLL_ERAS, TRACKS } from '@/lib/site-data'
import { cn } from '@/lib/utils'

/**
 * ENCUESTA — MODO LOCAL (deuda técnica pendiente)
 * -----------------------------------------------------------------------
 * Por ahora el voto se guarda solo en el navegador de cada persona
 * (localStorage), NO en una base de datos compartida. Por eso NO mostramos
 * porcentajes ni conteos "en vivo" — mostrar un % acá sería mentir, porque
 * solo reflejaría el voto de esa misma persona, no de todos los fans.
 *
 * Cuando haya DATABASE_URL configurado en Vercel (Postgres/Neon/Supabase):
 * 1. Correr `npx drizzle-kit push` para crear la tabla poll_votes.
 * 2. Volver a conectar este componente a app/actions/poll.ts
 *    (castVote/getPollState), que ya está escrito y listo — no hay que
 *    reescribir la lógica del servidor, solo volver a enchufarla acá.
 */

type Question = 'era' | 'show'
type Option = { id: string; label: string }

const QUESTIONS: { id: Question; title: string; options: Option[] }[] = [
  {
    id: 'era',
    title: '¿Cuál es tu era favorita de Brokeboirichie?',
    options: POLL_ERAS.map((e) => ({ id: e.id, label: e.label })),
  },
  {
    id: 'show',
    title: '¿Qué tema no puede faltar en el próximo show en vivo?',
    options: TRACKS.map((t) => ({ id: t.id, label: t.title })),
  },
]

const STORAGE_KEY = 'bbr_poll_votes_local'

type LocalVotes = Partial<Record<Question, string>>

function readLocalVotes(): LocalVotes {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as LocalVotes) : {}
  } catch {
    return {}
  }
}

export function FanPoll() {
  const [mine, setMine] = useState<LocalVotes>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setMine(readLocalVotes())
    setHydrated(true)
  }, [])

  function vote(question: Question, choice: string) {
    setMine((prev) => {
      const next = { ...prev, [question]: choice }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // localStorage no disponible (modo privado, etc.) — el voto igual se refleja en la sesión actual
      }
      return next
    })
  }

  return (
    <div className="flex flex-col gap-10">
      {QUESTIONS.map((q) => {
        const selected = mine[q.id]
        const hasVoted = Boolean(selected)

        return (
          <fieldset key={q.id} className="flex flex-col gap-4">
            <legend className="flex w-full flex-col gap-2 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                {q.id === 'era' ? 'Encuesta 01' : 'Encuesta 02'}
              </span>
              <span className="text-pretty font-display text-3xl font-light uppercase leading-tight tracking-tight text-foreground sm:text-4xl">
                {q.title}
              </span>
            </legend>

            <div className={cn('grid gap-2', q.id === 'era' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3')}>
              {q.options.map((opt) => {
                const isSelected = selected === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => vote(q.id, opt.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'relative flex min-h-12 items-center justify-between gap-3 overflow-hidden rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isSelected
                        ? 'border-primary/70 bg-primary/10'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
                    )}
                  >
                    <span className="relative flex min-w-0 items-center gap-2">
                      {isSelected && <Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />}
                      <span className="truncate font-mono text-xs uppercase tracking-[0.12em] text-foreground">
                        {opt.label}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground" aria-live="polite">
              {!hydrated
                ? '\u00A0'
                : hasVoted
                  ? 'Guardado en tu navegador · Puedes cambiar tu respuesta'
                  : 'Un toque para votar · Resultados en vivo próximamente'}
            </p>
          </fieldset>
        )
      })}
    </div>
  )
}
