'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { PITCH_MODES } from '@/lib/site-data'
import type { ItunesTrack } from '@/lib/itunes'
import { useTurntable } from './turntable-context'
import { Vinyl } from './vinyl'

/**
 * TORNAMESA REX — Audio 100% real, cero MP3 que subir a mano.
 * -------------------------------------------------------------
 * El deck consume /api/tracks (Route Handler que llama a la API pública de
 * iTunes Lookup del álbum REX y devuelve previewUrl reales de 30s). Tiene
 * su propio <audio> y su propio pitch (playbackRate).
 *
 * Si la API de Apple falla (caída puntual / rate limit), el deck lo avisa
 * y deja el botón "Escuchar completa" como alternativa — no inventa audio.
 *
 * NOTA: los singles sueltos 2026 ("Puras Malas", "Empezar Denuevo") no son
 * parte del álbum REX en Apple Music, así que esta API no trae su preview.
 * Para esos, el botón manda directo a YouTube / ONErpm hasta que estén
 * distribuidos también en streaming.
 *
 * SKIN (2026-10-09): chasis estilo Winamp/Napster clásico (clases `winamp-*`
 * de app/globals.css) sobre la base Nocturnal Plugg — es solo la capa
 * visual, toda la lógica de audio de arriba queda intacta.
 *
 * (2026-10-11): se dejó un solo deck en esta sección a pedido del artista —
 * el segundo deck del mismo molde (useDeck/DeckPanel, ambos exportados) se
 * reutiliza en components/beats-marketplace.tsx para la Venta de Beats.
 */

export type DeckId = 'A' | 'B'

export function useDeck(deckId: DeckId, tracks: ItunesTrack[], initialIndex: number) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [index, setIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [rate, setRate] = useState(1)

  const track = tracks[index] ?? null

  function applySettings(audio: HTMLAudioElement) {
    audio.preservesPitch = false
    audio.playbackRate = rate
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio || !track?.previewUrl) return
    if (audio.paused) {
      applySettings(audio)
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }

  function changeRate(nextRate: number) {
    setRate(nextRate)
    if (audioRef.current) audioRef.current.playbackRate = nextRate
  }

  function changeTrack(nextIndex: number) {
    const wasPlaying = isPlaying
    setIndex(nextIndex)
    requestAnimationFrame(() => {
      const audio = audioRef.current
      if (!audio) return
      applySettings(audio)
      if (wasPlaying) audio.play().catch(() => setIsPlaying(false))
    })
  }

  return { deckId, audioRef, track, index, isPlaying, rate, setIsPlaying, togglePlay, changeRate, changeTrack }
}

/** 5 barras tipo ecualizador de Winamp — solo se mueven mientras el deck suena. */
export function EqBars({ active }: { active: boolean }) {
  const delays = [0, 0.12, 0.06, 0.18, 0.09]
  return (
    <div className="flex h-4 items-end gap-[3px]" aria-hidden="true">
      {delays.map((delay, i) => (
        <span
          key={i}
          className="eq-bar w-[3px] rounded-[1px] bg-[var(--y2k-celestite)]"
          style={{
            height: active ? '100%' : '15%',
            animationDelay: `${delay}s`,
            animationPlayState: active ? 'running' : 'paused',
            opacity: active ? 0.9 : 0.3,
          }}
        />
      ))}
    </div>
  )
}

export function DeckPanel({ deck, label, tracks }: { deck: ReturnType<typeof useDeck>; label: string; tracks: ItunesTrack[] }) {
  const activeMode = PITCH_MODES.find((m) => m.rate === deck.rate) ?? PITCH_MODES[1]
  const canPlay = Boolean(deck.track?.previewUrl)

  return (
    <div className="winamp-shell flex flex-col overflow-hidden">
      <div className="winamp-titlebar">
        <div className="winamp-dots">
          <span className="winamp-dot" />
          <span className="winamp-dot" />
          <span className="winamp-dot" />
        </div>
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/90">Deck {label}</span>
        <EqBars active={deck.isPlaying} />
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="mx-auto w-full max-w-[200px]">
          <Vinyl isPlaying={deck.isPlaying} rate={deck.rate} />
        </div>

        {deck.track?.previewUrl && (
          <audio
            ref={deck.audioRef}
            src={deck.track.previewUrl}
            preload="metadata"
            onPlay={() => deck.setIsPlaying(true)}
            onPause={() => deck.setIsPlaying(false)}
            onEnded={() => deck.setIsPlaying(false)}
          />
        )}

        <div className="winamp-lcd flex flex-col gap-0.5 px-3 py-2">
          <p className="truncate text-2xl leading-none">{deck.track ? deck.track.title : 'NO SIGNAL —'}</p>
          <p className="text-sm uppercase leading-none tracking-[0.1em] opacity-70">
            {deck.isPlaying ? '▸ PLAYING' : '❚❚ PAUSED'} · {activeMode.short.toUpperCase()} · {deck.rate.toFixed(2)}X
          </p>
        </div>

        <select
          value={deck.index}
          onChange={(e) => deck.changeTrack(Number(e.target.value))}
          className="winamp-well w-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-foreground"
        >
          {tracks.map((t, i) => (
            <option key={t.id} value={i} className="bg-background text-foreground" disabled={!t.previewUrl}>
              {t.title}
              {!t.previewUrl ? ' (sin preview)' : ''}
            </option>
          ))}
        </select>

        {!canPlay && (
          <p className="font-mono text-[10px] leading-relaxed text-primary">
            Apple no devolvió preview para este tema ahora mismo — prueba otro o reintenta en unos minutos.
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={deck.togglePlay}
            disabled={!canPlay}
            aria-label={deck.isPlaying ? `Pausar deck ${label}` : `Reproducir deck ${label}`}
            className="winamp-btn inline-flex size-11 shrink-0 items-center justify-center text-foreground transition-transform active:scale-95 disabled:opacity-40"
          >
            {deck.isPlaying ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4 translate-x-px" aria-hidden="true" />}
          </button>

          <div className="grid flex-1 grid-cols-3 gap-1.5">
            {PITCH_MODES.map((mode) => {
              const active = mode.rate === deck.rate
              return (
                <button
                  key={mode.rate}
                  type="button"
                  aria-pressed={active}
                  onClick={() => deck.changeRate(mode.rate)}
                  className="winamp-btn flex min-h-9 flex-col items-center justify-center font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground transition-colors"
                >
                  {mode.short}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DualDeckTurntable() {
  const [tracks, setTracks] = useState<ItunesTrack[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const { trackId } = useTurntable()

  useEffect(() => {
    fetch('/api/tracks')
      .then((res) => res.json())
      .then((data: { tracks: ItunesTrack[] }) => {
        if (!data.tracks?.length) throw new Error('empty')
        setTracks(data.tracks)
      })
      .catch(() => setLoadError(true))
  }, [])

  const deckA = useDeck('A', tracks ?? [], 0)

  // Cuando el Catálogo pide cargar una canción ("Tornamesa"), el contexto
  // compartido actualiza trackId y hace scroll hasta acá — el deck toma esa
  // canción automáticamente.
  useEffect(() => {
    if (!tracks) return
    const idx = tracks.findIndex((t) => t.id === trackId)
    if (idx >= 0) deckA.changeTrack(idx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, tracks])

  return (
    <section id="tornamesa" aria-labelledby="dual-deck-title" className="mx-auto max-w-2xl scroll-mt-20 px-4 py-16 sm:px-6">
      <header className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">REX Deck</p>
        <h2 id="dual-deck-title" className="mt-2 font-display text-4xl font-light uppercase tracking-tight text-foreground sm:text-5xl">
          Tornamesa en vivo
        </h2>
        <p className="mt-2 max-w-md font-mono text-[11px] text-muted-foreground">
          Previews oficiales de 30s servidos en vivo desde Apple Music — nada subido a mano.
        </p>
      </header>

      {!tracks && !loadError && (
        <p className="font-mono text-xs text-muted-foreground">Cargando previews desde Apple Music…</p>
      )}
      {loadError && (
        <p className="font-mono text-xs text-primary">
          No se pudo cargar el catálogo de previews ahora mismo. Reintenta en unos minutos.
        </p>
      )}

      {tracks && <DeckPanel deck={deckA} label="A" tracks={tracks} />}
    </section>
  )
}
