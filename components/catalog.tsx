'use client'

import Image from 'next/image'
import { ArrowUpRight, Disc3 } from 'lucide-react'
import { RELEASES, type Release } from '@/lib/site-data'
import { useTurntable } from './turntable-context'
import { LiveIndicator } from './live-indicator'

export function Catalog() {
  const { queue, queued } = useTurntable()

  return (
    <section id="lanzamientos" aria-labelledby="catalog-title" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Catálogo</p>
          <h2 id="catalog-title" className="mt-2 font-display text-5xl font-light uppercase tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Lanzamientos
          </h2>
        </div>
        <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          Escucha directo en plataformas o carga un preview en la Tornamesa REX.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {RELEASES.map((release) => (
          <li key={release.id}>
            <ReleaseCard release={release} isQueued={queued?.id === release.id} onQueue={queue} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ReleaseCard({
  release,
  isQueued,
  onQueue,
}: {
  release: Release
  isQueued: boolean
  onQueue: (r: Release) => void
}) {
  return (
    <article className="glass flex h-full flex-col overflow-hidden rounded-xl">
      {release.cover ? (
        <Image
          src={release.cover || "/placeholder.svg"}
          alt={`Portada de ${release.title}`}
          width={600}
          height={600}
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 33vw, (min-width: 480px) 50vw, 100vw"
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 border-b border-dashed border-white/[0.12] bg-midnight/20 p-4 text-center">
          <Disc3 className="size-8 text-muted-foreground" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Portada a confirmar
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>{release.kind} · {release.year}</span>
            {isQueued && <LiveIndicator label="" />}
          </div>
          <h3 className="font-display text-2xl font-normal uppercase leading-tight tracking-wide text-foreground text-balance">
            {release.title}
          </h3>
          <p className="font-mono text-[11px] text-muted-foreground">{release.meta}</p>
        </div>
        <div className="mt-auto flex gap-2">
          {release.href ? (
            <a
              href={release.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/[0.12] font-mono text-[10px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary/60"
            >
              Escuchar <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          ) : (
            <span className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-dashed border-white/[0.12] font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Próximamente
            </span>
          )}
          {release.trackId && <TurntableButton release={release} onQueue={onQueue} compact />}
        </div>
      </div>
    </article>
  )
}

function TurntableButton({
  release,
  onQueue,
  compact = false,
}: {
  release: Release
  onQueue: (r: Release) => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onQueue(release)}
      className={
        compact
          ? 'inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-midnight text-foreground transition-colors hover:bg-primary hover:text-primary-foreground'
          : 'inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-midnight px-5 font-mono text-xs uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-primary hover:text-primary-foreground'
      }
    >
      <Disc3 className="size-4" aria-hidden="true" />
      {compact ? <span className="sr-only">Cargar {release.title} en la tornamesa</span> : 'Tornamesa'}
    </button>
  )
}
