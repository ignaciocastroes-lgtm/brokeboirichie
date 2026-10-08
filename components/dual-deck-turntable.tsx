'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { PITCH_MODES } from '@/lib/site-data'
import type { ItunesTrack } from '@/lib/itunes'
import { useTurntable } from './turntable-context'
import { Vinyl } from './vinyl'

/**
 * DUAL DECK + CROSSFADER REAL — Audio 100% real, cero MP3 que subir a mano.
 * -----------------------------------------------------------------------
 * Los dos decks consumen /api/tracks (Route Handler que llama a la API
 * pública de iTunes Lookup del álbum REX y devuelve previewUrl reales de
 * 30s). Cada deck tiene su propio <audio>, su propio pitch (playbackRate)
 * y el crossfader mueve el volumen de A y B con la misma matemática de un
 * mixer de DJ.
 *
 * Si la API de Apple falla (caída puntual / rate limit), el deck lo avisa
 * y deja el botón "Escuchar completa" como alternativa — no inventa audio.
 *
 * NOTA: los singles sueltos 2026 ("Puras Malas", "Empezar Denuevo") no son
 * parte del álbum REX en Apple Music, así que esta API no trae su preview.
 * Para esos, el botón manda directo a YouTube / ONErpm hasta que estén
 * distribuidos también en streaming.
 */

type DeckId = 'A' | 'B'

function useDeck(deckId: DeckId, tracks: ItunesTrack[], initialIndex: number) {
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

function DeckPanel({ deck, label, tracks }: { deck: ReturnType<typeof useDeck>; label: string; tracks: ItunesTrack[] }) {
  const activeMode = PITCH_MODES.find((m) => m.rate === deck.rate) ?? PITCH_MODES[1]
  const canPlay = Boolean(deck.track?.previewUrl)

  return (
    <div className="glass flex flex-col gap-4 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <span>Deck {label}</span>
        {deck.isPlaying && <span className="text-primary">● Live</span>}
      </div>

      <div className="mx-auto w-full max-w-[220px]">
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

      <select
        value={deck.index}
        onChange={(e) => deck.changeTrack(Number(e.target.value))}
        className="w-full rounded-full border border-white/[0.08] bg-transparent px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-foreground"
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

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={deck.togglePlay}
          disabled={!canPlay}
          aria-label={deck.isPlaying ? `Pausar deck ${label}` : `Reproducir deck ${label}`}
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
        >
          {deck.isPlaying ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5 translate-x-px" aria-hidden="true" />}
        </button>

        <div className="grid flex-1 grid-cols-3 gap-2 rounded-full border border-white/[0.08] p-1">
          {PITCH_MODES.map((mode) => {
            const active = mode.rate === deck.rate
            return (
              <button
                key={mode.rate}
                type="button"
                aria-pressed={active}
                onClick={() => deck.changeRate(mode.rate)}
                className={`flex min-h-9 flex-col items-center justify-center rounded-full font-mono text-[10px] uppercase transition-colors ${
                  active ? 'bg-midnight text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode.short}
              </button>
            )
          })}
        </div>
      </div>
      <p className="text-right font-mono text-[10px] text-muted-foreground">[{activeMode.label}]</p>
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
  const deckB = useDeck('B', tracks ?? [], 1)

  // Cuando el Catálogo o el Lookbook piden cargar una canción ("Tornamesa"),
  // el contexto compartido actualiza trackId y hace scroll hasta acá — el
  // Deck A toma esa canción automáticamente.
  useEffect(() => {
    if (!tracks) return
    const idx = tracks.findIndex((t) => t.id === trackId)
    if (idx >= 0) deckA.changeTrack(idx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, tracks])

  const [crossfader, setCrossfader] = useState(0)

  function handleCrossfader(value: number) {
    setCrossfader(value)
    const volA = Math.min(1, 1 - Math.max(0, value))
    const volB = Math.min(1, 1 + Math.min(0, value))
    if (deckA.audioRef.current) deckA.audioRef.current.volume = volA
    if (deckB.audioRef.current) deckB.audioRef.current.volume = volB
  }

  return (
    <section id="tornamesa" aria-labelledby="dual-deck-title" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6">
      <header className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">REX Deck · Mezclador de 2 canales</p>
        <h2 id="dual-deck-title" className="mt-2 font-display text-4xl font-light uppercase tracking-tight text-foreground sm:text-5xl">
          Mezclador en vivo
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

      {tracks && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <DeckPanel deck={deckA} label="A" tracks={tracks} />
            <DeckPanel deck={deckB} label="B" tracks={tracks} />
          </div>

          <div className="glass mt-6 flex flex-col items-center gap-3 rounded-2xl p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Crossfader</p>
            <div className="flex w-full max-w-md items-center gap-4">
              <span className="font-mono text-xs text-muted-foreground">A</span>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={crossfader}
                onChange={(e) => handleCrossfader(Number(e.target.value))}
                aria-label="Crossfader entre Deck A y Deck B"
                className="deck-range w-full"
              />
              <span className="font-mono text-xs text-muted-foreground">B</span>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
