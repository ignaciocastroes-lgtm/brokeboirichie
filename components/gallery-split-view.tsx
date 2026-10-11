'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Camera } from 'lucide-react'
import type { GalleryResponse } from '@/lib/gallery'

/**
 * Patrón "Split View con Foco Dinámico" (pedido por el artista 2026-10-11, inspirado en el PS5):
 *  1. Hero View — fondo a pantalla completa con el arte de la categoría activa, tintado y con
 *     transición suave al cambiar de categoría.
 *  2. Fila de navegación central — grilla horizontal flotante; el ítem activo/foco se agranda.
 *  3. Panel principal — una sola foto visible por defecto por categoría; el resto se ve con scroll
 *     horizontal PROPIO de esa fila (no crece el scroll de la página).
 *  4. Feed oculto — bento grid asimétrico más abajo con todo el archivo, para scrollear.
 */
export function GallerySplitView({ categories }: { categories: GalleryResponse[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = categories[activeIndex]
  const heroPhoto = active.photos[0] ?? null

  const feed = useMemo(
    () => categories.flatMap((c) => c.photos.map((p) => ({ ...p, categoryLabel: c.label }))),
    [categories],
  )

  return (
    <section id="fotos" aria-labelledby="fotos-title" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-y2k-glow" style={{ color: 'var(--y2k-celestite)' }}>
          [Fotos] · Directo desde Flickr
        </p>
        <h2
          id="fotos-title"
          className="mt-2 text-balance font-display text-5xl font-light uppercase leading-none tracking-tight text-foreground sm:text-6xl"
        >
          Archivo visual
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          El artista sube y organiza sus propias fotos en Flickr — esta galería se actualiza sola cuando él agrega nuevas.
        </p>
      </div>

      {/* HERO VIEW + nav flotante + panel principal con scroll propio */}
      <div className="relative mx-4 overflow-hidden rounded-3xl border border-white/[0.08] sm:mx-6 lg:mx-8">
        <div className="relative h-[72vh] min-h-[460px] w-full">
          {heroPhoto ? (
            <Image
              key={heroPhoto.id}
              src={heroPhoto.src}
              alt=""
              fill
              unoptimized={heroPhoto.remote}
              sizes="100vw"
              priority={activeIndex === 0}
              className="object-cover opacity-80 transition-opacity duration-700 ease-out"
            />
          ) : (
            <div className="night-halos absolute inset-0" aria-hidden="true" />
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />

          {/* Fila de navegación central flotante */}
          <nav aria-label="Categorías de la galería" className="absolute inset-x-0 top-6 flex justify-center px-4">
            <div className="glass flex max-w-full gap-1.5 overflow-x-auto rounded-full p-1.5 sm:gap-2 sm:p-2">
              {categories.map((cat, i) => (
                <button
                  key={cat.category}
                  type="button"
                  aria-pressed={i === activeIndex}
                  onClick={() => setActiveIndex(i)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-all duration-300 ease-out hover:scale-110 focus-visible:scale-110 ${
                    i === activeIndex
                      ? 'scale-110 bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Panel principal: 1 foto visible, el resto con scroll horizontal propio */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-8 sm:pb-10">
            <div className="mb-3 flex items-end justify-between gap-4">
              <h3 className="font-display text-3xl font-light uppercase tracking-tight text-foreground sm:text-4xl">
                {active.label}
              </h3>
              {active.albums[0] && (
                <a
                  href={active.albums[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary sm:inline-flex"
                >
                  Ver álbum completo <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              )}
            </div>

            {active.source === 'empty' ? (
              <div className="flex min-h-28 max-w-sm flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.2] bg-background/40 p-6 text-center backdrop-blur-sm">
                <Camera className="size-6 text-muted-foreground" aria-hidden="true" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Álbum en camino — el artista aún está organizando este en Flickr
                </span>
              </div>
            ) : (
              <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
                {active.photos.map((photo, i) => (
                  <li
                    key={photo.id}
                    className={`w-[46vw] max-w-[220px] shrink-0 snap-start ${i === 0 ? 'w-[min(80vw,420px)] max-w-[420px]' : ''}`}
                  >
                    <a
                      href={photo.href ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-[4/5] overflow-hidden rounded-xl border border-white/[0.12]"
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt || photo.title || active.label}
                        fill
                        unoptimized={photo.remote}
                        sizes="(min-width: 640px) 40vw, 80vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {i === 0 && active.photos.length > 1 && (
                        <span className="absolute bottom-2 right-2 rounded-full bg-background/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
                          Desliza para ver más →
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Feed oculto: bento grid asimétrico con todo el archivo disponible */}
      {feed.length > 0 && (
        <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Feed completo</p>
          <ul className="grid auto-rows-[140px] grid-cols-2 gap-3 sm:auto-rows-[160px] sm:grid-cols-4 lg:grid-cols-6">
            {feed.slice(0, 24).map((photo, i) => (
              <li key={photo.id} className={i % 7 === 0 ? 'col-span-2 row-span-2' : ''}>
                <a
                  href={photo.href ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block size-full overflow-hidden rounded-xl border border-white/[0.08]"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt || photo.title || photo.categoryLabel}
                    fill
                    unoptimized={photo.remote}
                    sizes="(min-width: 1024px) 16vw, 45vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
