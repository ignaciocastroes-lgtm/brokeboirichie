'use client'

import { useRef, useState } from 'react'
import { ArrowUpRight, Pause, Play } from 'lucide-react'
import { APPLE_MUSIC_URL, PITCH_MODES, SPOTIFY_URL, TRACKS } from '@/lib/site-data'
import { useTurntable } from './turntable-context'
import { LiveIndicator } from './live-indicator'
import { Vinyl } from './vinyl'

const SNIPPET_SECONDS = 30

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function TurntableDeck() {
  const { trackId, selectTrack } = useTurntable()
  const audioRef = useRef<HTMLAudioElement>(null)
  const playOnLoadRef = useRef(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(SNIPPET_SECONDS)
  const [rate, setRate] = useState(1)
  const [hasError, setHasError] = useState(false)
  const [loadedTrackId, setLoadedTrackId] = useState(trackId)

  if (loadedTrackId !== trackId) {
    setLoadedTrackId(trackId)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(SNIPPET_SECONDS)
    setHasError(false)
  }

  const trackIndex = TRACKS.findIndex((t) => t.id === trackId)
  const track = TRACKS[trackIndex] ?? TRACKS[0]
  const maxTime = Math.min(duration || SNIPPET_SECONDS, SNIPPET_SECONDS)
  const activeMode = PITCH_MODES.find((m) => m.rate === rate) ?? PITCH_MODES[1]

  function applyAudioSettings(audio: HTMLAudioElement) {
    audio.preservesPitch = false
    audio.playbackRate = rate
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio || hasError) return
    if (audio.paused) {
      applyAudioSettings(audio)
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }

  function changeRate(nextRate: number) {
    setRate(nextRate)
    if (audioRef.current) audioRef.current.playbackRate = nextRate
  }

  function seek(value: number) {
    if (audioRef.current) audioRef.current.currentTime = value
    setCurrentTime(value)
  }

  function pickTrack(id: string) {
    if (id === trackId) {
      togglePlay()
      return
    }
    playOnLoadRef.current = true
    selectTrack(id)
  }

  return (
    <section
      id="tornamesa"
      aria-labelledby="deck-title"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">REX Deck · Snippets 0:30</p>
          <h2 id="deck-title" className="mt-2 font-display text-5xl font-light uppercase tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Tornamesa REX
          </h2>
        </div>
        <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          Previews de 30 segundos. Bájale las revoluciones en modo slowed o súbelas en sped up — como suena a las 4 AM.
        </p>
      </header>

      <audio
        ref={audioRef}
        src={track.src}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const audio = e.currentTarget
          applyAudioSettings(audio)
          if (Number.isFinite(audio.duration)) setDuration(audio.duration)
          if (playOnLoadRef.current) {
            playOnLoadRef.current = false
            audio.play().catch(() => setIsPlaying(false))
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget
          if (audio.currentTime >= SNIPPET_SECONDS) {
            audio.pause()
            audio.currentTime = 0
            setCurrentTime(0)
            return
          }
          setCurrentTime(audio.currentTime)
        }}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentTime(0)
        }}
        onError={() => {
          playOnLoadRef.current = false
          setHasError(true)
          setIsPlaying(false)
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="glass flex flex-col gap-8 rounded-2xl p-5 sm:p-8">
          <Vinyl isPlaying={isPlaying} rate={rate} />

          <div className="flex flex-col gap-1">
            <div className="flex min-h-4 items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <span>
                Track {String(trackIndex + 1).padStart(2, '0')} / {TRACKS.length}
                {track.tag ? ` · ${track.tag}` : ''}
              </span>
              {isPlaying && <LiveIndicator label={`${rate.toFixed(2)}x`} />}
            </div>
            <p className="font-display text-4xl font-normal uppercase leading-none tracking-wide text-foreground text-balance sm:text-5xl">
              {track.title}
            </p>
            {track.credit && <p className="font-mono text-xs text-muted-foreground">{track.credit}</p>}
            {hasError && (
              <p role="status" className="mt-2 font-mono text-[11px] leading-relaxed text-primary">
                Snippet en camino — falta el archivo <span className="text-foreground">{track.src}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlay}
              disabled={hasError}
              aria-label={isPlaying ? `Pausar ${track.title}` : `Reproducir ${track.title}`}
              className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
            >
              {isPlaying ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5 translate-x-px" aria-hidden="true" />}
            </button>
            <div className="flex flex-1 flex-col gap-2">
              <input
                type="range"
                min={0}
                max={maxTime}
                step={0.1}
                value={Math.min(currentTime, maxTime)}
                onChange={(e) => seek(Number(e.target.value))}
                disabled={hasError}
                aria-label="Progreso del snippet"
                aria-valuetext={`${formatTime(currentTime)} de ${formatTime(maxTime)}`}
                className="deck-range w-full"
                style={{ '--progress': `${(Math.min(currentTime, maxTime) / maxTime) * 100}%` } as React.CSSProperties}
              />
              <div className="flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(maxTime)}</span>
              </div>
            </div>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 flex w-full justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <span>Pitch</span>
              <span className="text-foreground">[{activeMode.label}]</span>
            </legend>
            <div className="grid grid-cols-3 gap-2 rounded-full border border-white/[0.08] p-1">
              {PITCH_MODES.map((mode) => {
                const active = mode.rate === rate
                return (
                  <button
                    key={mode.rate}
                    type="button"
                    aria-pressed={active}
                    onClick={() => changeRate(mode.rate)}
                    className={`flex min-h-11 flex-col items-center justify-center rounded-full font-mono uppercase transition-colors ${
                      active ? 'bg-midnight text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-[10px] tracking-[0.16em]">{mode.short}</span>
                    <span className={`text-[10px] tabular-nums ${active ? 'text-primary' : ''}`}>{mode.rate.toFixed(2)}x</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Escuchar canción completa en</p>
            <div className="flex flex-col gap-3 min-[400px]:flex-row">
              <a
                href={SPOTIFY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 font-mono text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Spotify <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href={APPLE_MUSIC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/[0.12] px-5 font-mono text-xs uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary/60"
              >
                Apple Music <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="glass flex flex-col rounded-2xl p-2 sm:p-3">
          <div className="flex items-center justify-between px-3 pb-3 pt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span>REX + Singles</span>
            <span>Duración</span>
          </div>
          <ol className="flex flex-col">
            {TRACKS.map((t, i) => {
              const active = t.id === trackId
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => pickTrack(t.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`flex min-h-14 w-full items-center gap-4 rounded-xl px-3 py-2 text-left transition-colors ${
                      active ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className={`w-6 shrink-0 font-mono text-[11px] tabular-nums ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-display text-xl uppercase leading-tight tracking-wide text-foreground">{t.title}</span>
                      {(t.credit || t.tag) && (
                        <span className="truncate font-mono text-[10px] text-muted-foreground">
                          {[t.credit, t.tag].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </span>
                    {active && isPlaying ? (
                      <LiveIndicator label="" />
                    ) : (
                      <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">{t.duration ?? 'Single'}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
