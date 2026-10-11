'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Camera, ChevronRight } from 'lucide-react'
import type { GalleryResponse } from '@/lib/gallery'

/**
 * Patrón "Split View con Foco Dinámico" (pedido por el artista 2026-10-11, inspirado en el PS5):
 *  1. Hero View — fondo a pantalla completa con el arte de la categoría activa, tintado y con
 *     transición suave al cambiar de categoría.
 *  2. Fila de navegación central — grilla horizontal flotante; el ítem activo/foco se agranda.
 *  3. Panel principal — SOLO el scroll horizontal de fotos de la categoría activa. Pedido explícito
 *     2026-10-11: "saca archivo visual y solo deja el scroll de la galería" — sin título/intro ni
 *     feed secundario debajo; el scroll ES la galería.
 *  4. Foco dinámico real: a medida que se scrollea la fila, la foto centrada/enfocada se ve nítida
 *     y a tamaño completo, el resto se oscurece y reduce — vía IntersectionObserver por foto
 *     (ventana horizontal angosta centrada en el contenedor), no solo un efecto de borde.
 */
function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

export function GallerySplitView({ categories }: { categories: GalleryResponse[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = categories[activeIndex]
  const heroPhoto = active.photos[0] ?? null

  // Barra de progreso del scroll horizontal propio de cada galería — la señal visual de que hay
  // más para ver "si hace scroll" (pedido del artista 2026-10-11), en vez de dejarlo implícito.
  const stripRef = useRef<HTMLUListElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Foto enfocada dentro de la fila activa — la única que se ve clara; el resto se oscurece.
  const [focusedId, setFocusedId] = useState<string | null>(active.photos[0]?.id ?? null)
  const photoRefs = useRef(new Map<string, HTMLLIElement>())

  useEffect(() => {
    setScrollProgress(0)
    setFocusedId(active.photos[0]?.id ?? null)
    stripRef.current?.scrollTo({ left: 0 })
  }, [active.photos])

  useEffect(() => {
    const root = stripRef.current
    if (!root || active.photos.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // La foto con mayor fracción visible dentro de la "ventana" central gana el foco.
        let best: { id: string; ratio: number } | null = null
        for (const entry of entries) {
          const id = entry.target.getAttribute('data-photo-id')
          if (!id) continue
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { id, ratio: entry.intersectionRatio }
          }
        }
        if (best && best.ratio > 0) setFocusedId(best.id)
      },
      {
        root,
        // Ventana angosta centrada en el contenedor: solo la foto que cruza el centro cuenta como
        // "enfocada", el resto queda afuera del margen y se oscurece.
        rootMargin: '0px -35% 0px -35%',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    for (const node of photoRefs.current.values()) observer.observe(node)
    return () => observer.disconnect()
  }, [active.photos])

  const registerPhotoRef = useCallback((id: string, node: HTMLLIElement | null) => {
    if (node) photoRefs.current.set(id, node)
    else photoRefs.current.delete(id)
  }, [])

  function onStripScroll() {
    const el = stripRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setScrollProgress(max > 0 ? clamp01(el.scrollLeft / max) : 0)
  }

  return (
    <section id="fotos" aria-labelledby="fotos-title" className="scroll-mt-24 py-16 sm:py-24">
      <h2 id="fotos-title" className="sr-only">
        Fotos
      </h2>

      {/* HERO VIEW + nav flotante + panel principal: solo el scroll de la galería */}
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

          {/* Panel principal: el scroll horizontal ES la galería — una foto enfocada y clara, el
              resto oscurecido, hasta que el scroll trae la siguiente al centro. */}
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
              <div className="relative">
                <ul
                  ref={stripRef}
                  onScroll={onStripScroll}
                  className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]"
                >
                  {active.photos.map((photo, i) => {
                    const isFocused = focusedId === photo.id
                    return (
                      <li
                        key={photo.id}
                        ref={(node) => registerPhotoRef(photo.id, node)}
                        data-photo-id={photo.id}
                        className="w-[46vw] max-w-[220px] shrink-0 snap-center first:ml-[27vw] last:mr-[27vw] first:sm:ml-0 last:sm:mr-0"
                      >
                        <a
                          href={photo.href ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group relative block aspect-[4/5] overflow-hidden rounded-xl border transition-all duration-500 ease-out ${
                            isFocused
                              ? 'scale-100 border-white/[0.18] opacity-100'
                              : 'scale-[0.92] border-white/[0.06] opacity-45 brightness-[0.45] saturate-50'
                          }`}
                        >
                          <Image
                            src={photo.src}
                            alt={photo.alt || photo.title || active.label}
                            fill
                            unoptimized={photo.remote}
                            sizes="(min-width: 640px) 40vw, 80vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {isFocused && active.photos.length > 1 && (
                            <span className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-full bg-background/70 py-1 pl-2 pr-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
                              Desliza
                              <ChevronRight className="gallery-hint-chevron size-3" aria-hidden="true" />
                            </span>
                          )}
                        </a>
                      </li>
                    )
                  })}
                </ul>

                {active.photos.length > 1 && (
                  <div className="mt-2 h-[2px] w-full max-w-[220px] overflow-hidden rounded-full bg-white/[0.1]">
                    <div
                      className="h-full rounded-full bg-[var(--y2k-celestite)] transition-[width] duration-150 ease-out"
                      style={{ width: `${Math.max(8, scrollProgress * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
