'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Pause, Play, X } from 'lucide-react'
import { BEATS, BEATS_ROYALTY_NOTE, MANAGEMENT_WHATSAPP_URL, type Beat } from '@/lib/site-data'
import { AudioVisualizer, resumeAudioContextFor } from './audio-visualizer'

/**
 * VENTA DE BEATS — sección nueva (2026-10-11) pensada como el segundo "deck" de la Tornamesa,
 * reconvertido en un catálogo B2B: el artista sube muestras de 10s con marca de sonido para que
 * otros artistas licencien instrumentales, con regalías coordinadas vía management.
 *
 * Deuda técnica: los 20 beats están declarados en lib/site-data.ts (BEATS) con `src: null` —
 * Ignacio sube los mp3 reales a /public/beats/<id>.mp3 y los botones de play se activan solos.
 *
 * Reutiliza el skin Winamp/Napster (clases `winamp-*`) ya validado en el deck principal.
 */

export function BeatsMarketplace() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [detailBeat, setDetailBeat] = useState<Beat | null>(null)

  useEffect(() => {
    if (!detailBeat) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDetailBeat(null)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [detailBeat])

  function toggleBeat(beat: Beat) {
    const audio = audioRef.current
    if (!audio || !beat.src) return
    if (playingId === beat.id) {
      audio.pause()
      setPlayingId(null)
      return
    }
    audio.src = beat.src
    audio.currentTime = 0
    resumeAudioContextFor(audio) // gesto real del usuario — aquí es seguro reanudar el AudioContext
    audio.play().catch(() => setPlayingId(null))
    setPlayingId(beat.id)
  }

  const nowPlaying = BEATS.find((b) => b.id === playingId) ?? null

  return (
    <section
      id="venta-de-beats"
      aria-labelledby="beats-title"
      className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6"
    >
      <audio
        ref={audioRef}
        onEnded={() => setPlayingId(null)}
        onPause={() => setPlayingId((id) => (audioRef.current?.ended ? null : id))}
      />

      <header className="mb-8 flex flex-col gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Catálogo B2B · Licencias con regalías
        </p>
        <h2 id="beats-title" className="font-display text-4xl font-light uppercase tracking-tight text-foreground sm:text-5xl">
          Venta de Beats
        </h2>
        <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Brokeboirichie abre su banco de instrumentales a otros artistas. Escucha la muestra de 10
          segundos, con marca de sonido, y coordina la licencia directo con su management.
        </p>
      </header>

      <div className="winamp-shell mb-6 overflow-hidden">
        <div className="winamp-titlebar">
          <div className="winamp-dots">
            <span className="winamp-dot" />
            <span className="winamp-dot" />
            <span className="winamp-dot" />
          </div>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/90">Beat Deck</span>
          <AudioVisualizer audioRef={audioRef} active={Boolean(playingId)} />
        </div>
        <div className="winamp-lcd flex flex-col gap-0.5 px-4 py-3">
          <p className="truncate text-2xl leading-none">{nowPlaying ? nowPlaying.title : 'NO SIGNAL —'}</p>
          <p className="text-sm uppercase leading-none tracking-[0.1em] opacity-70">
            {nowPlaying ? '▸ PLAYING · 10S SAMPLE' : 'SELECCIONA UN BEAT'}
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
        {BEATS.map((beat) => {
          const isPlaying = playingId === beat.id
          return (
            <li key={beat.id} className="winamp-shell overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggleBeat(beat)}
                  disabled={!beat.src}
                  aria-label={isPlaying ? `Pausar ${beat.title}` : `Reproducir muestra de ${beat.title}`}
                  className="winamp-btn inline-flex size-10 shrink-0 items-center justify-center text-foreground transition-transform active:scale-95 disabled:opacity-40"
                >
                  {isPlaying ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5 translate-x-px" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={() => setDetailBeat(beat)}
                  className="winamp-well min-w-0 flex-1 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.08em] text-foreground"
                >
                  <span className="block truncate">{beat.title}</span>
                  <span className="block truncate text-muted-foreground">
                    {beat.src ? '10s · marca de sonido' : 'muestra pendiente de subir'}
                  </span>
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {detailBeat && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="beat-detail-title"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/85 px-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setDetailBeat(null)}
        >
          <div className="winamp-shell relative w-full max-w-md overflow-hidden">
            <div className="winamp-titlebar">
              <div className="winamp-dots">
                <span className="winamp-dot" />
                <span className="winamp-dot" />
                <span className="winamp-dot" />
              </div>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/90">Licencia de beat</span>
              <button
                type="button"
                onClick={() => setDetailBeat(null)}
                aria-label="Cerrar"
                className="inline-flex size-5 items-center justify-center rounded-sm text-white/80 hover:text-white"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <div className="winamp-lcd px-3 py-2">
                <p id="beat-detail-title" className="truncate text-xl leading-none">
                  {detailBeat.title}
                </p>
              </div>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{BEATS_ROYALTY_NOTE}</p>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <a
                  href={MANAGEMENT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 font-mono text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Consultar licencia
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
                <a
                  href="#top"
                  onClick={() => setDetailBeat(null)}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/[0.12] px-5 font-mono text-xs uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary/60"
                >
                  Volver al inicio
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
