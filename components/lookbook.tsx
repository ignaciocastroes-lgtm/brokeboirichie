'use client'

import Image from 'next/image'
import { useMemo, useRef, useState } from 'react'
import { Disc3, X } from 'lucide-react'
import { LOOKBOOK_FILTERS, LOOKS, SPOTIFY_URL, TRACKS, type Look } from '@/lib/site-data'
import { cn } from '@/lib/utils'
import { useTurntable } from './turntable-context'

type FilterId = (typeof LOOKBOOK_FILTERS)[number]['id']

const SHAPE_CLASSES: Record<Look['shape'], string> = {
  tall: 'aspect-[4/5] sm:row-span-2 sm:aspect-auto',
  square: 'aspect-square',
  wide: 'aspect-[3/2] sm:col-span-2',
}

export function Lookbook() {
  const [filter, setFilter] = useState<FilterId>('all')
  const [active, setActive] = useState<Look | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { selectTrack } = useTurntable()

  const looks = useMemo(() => (filter === 'all' ? LOOKS : LOOKS.filter((l) => l.category === filter)), [filter])

  const open = (look: Look) => {
    setActive(look)
    dialogRef.current?.showModal()
  }
  const close = () => dialogRef.current?.close()

  const loadInspiration = (look: Look) => {
    selectTrack(look.trackId)
    close()
    requestAnimationFrame(() =>
      document.getElementById('tornamesa')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

  const activeTrack = active ? TRACKS.find((t) => t.id === active.trackId) : undefined

  return (
    <section id="lookbook" aria-labelledby="lookbook-title" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">Garment & Styling Archive</p>
          <h2
            id="lookbook-title"
            className="mt-3 text-balance font-display text-5xl font-light uppercase leading-none tracking-tight text-foreground sm:text-6xl"
          >
            Lookbook de autor
          </h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
            {
              'Prendas intervenidas, styling y dirección de arte de "Persona Errante". La ropa como extensión del sonido: no está a la venta, es parte de la obra.'
            }
          </p>
        </div>

        <div role="group" aria-label="Filtrar archivo" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {LOOKBOOK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors',
                filter === f.id
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-white/[0.08] text-muted-foreground hover:border-white/20 hover:text-foreground',
              )}
            >
              [{f.label}]
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-10 grid grid-flow-dense grid-cols-1 gap-4 sm:auto-rows-[16rem] sm:grid-cols-2 lg:auto-rows-[18rem] lg:grid-cols-3">
        {looks.map((look) => (
          <li key={look.id} className={cn('relative', SHAPE_CLASSES[look.shape])}>
            <button
              type="button"
              onClick={() => open(look)}
              className="group relative flex h-full w-full flex-col justify-end overflow-hidden rounded-xl border border-white/[0.08] bg-card text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Image
                src={look.image || '/placeholder.svg'}
                alt={look.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover contrast-125 grayscale-[35%] transition-transform duration-700 ease-out group-hover:scale-105 group-focus-visible:scale-105"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <span className="relative flex flex-col gap-1 p-4 sm:p-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                  {look.number} {'//'}
                </span>
                <span className="font-display text-2xl font-light uppercase leading-none tracking-tight text-foreground sm:text-3xl">
                  {look.title}
                </span>
                <span className="mt-1 line-clamp-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {look.direction}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setActive(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        aria-labelledby="lightbox-title"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-foreground backdrop:bg-background/90 backdrop:backdrop-blur-sm"
      >
        {active && (
          <div className="flex min-h-dvh items-center justify-center p-4 sm:p-8">
            <div className="glass relative grid w-full max-w-5xl overflow-hidden rounded-2xl bg-card/80 md:grid-cols-[1.1fr_1fr]">
              <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[36rem]">
                <Image
                  src={active.image || '/placeholder.svg'}
                  alt={active.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover contrast-125"
                />
              </div>

              <div className="flex flex-col gap-6 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                      {active.number} {'//'} Ficha de archivo
                    </p>
                    <h3
                      id="lightbox-title"
                      className="mt-2 text-balance font-display text-4xl font-light uppercase leading-none tracking-tight sm:text-5xl"
                    >
                      {active.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Cerrar ficha"
                    className="glass flex size-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-white/[0.06]"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>

                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{active.concept}</p>

                <dl className="flex flex-col gap-4 border-t border-white/[0.08] pt-5 font-mono text-xs">
                  <div className="flex flex-col gap-2">
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Piezas</dt>
                    <dd>
                      <ul className="flex flex-col gap-1.5">
                        {active.pieces.map((p) => (
                          <li key={p} className="flex items-center gap-2 text-foreground">
                            <span aria-hidden="true" className="size-1 rounded-full bg-primary" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Créditos</dt>
                    <dd className="leading-relaxed text-foreground">{active.direction}</dd>
                  </div>
                  {activeTrack && (
                    <div className="flex flex-col gap-1">
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Canción que lo inspira</dt>
                      <dd className="text-foreground">
                        {activeTrack.title}
                        {activeTrack.credit ? ` (${activeTrack.credit})` : ''}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => loadInspiration(active)}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 font-mono text-[11px] uppercase tracking-[0.16em] text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Disc3 className="size-4" aria-hidden="true" />
                    Escuchar en Tornamesa
                  </button>
                  <a
                    href={SPOTIFY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass inline-flex h-11 flex-1 items-center justify-center rounded-full px-5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-white/[0.06]"
                  >
                    Abrir en Spotify
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}
