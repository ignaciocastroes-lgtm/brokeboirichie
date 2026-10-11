'use client'

/**
 * HERRAMIENTA INTERNA — Marca de Beats (2026-10-11)
 * ---------------------------------------------------------------------------
 * No es parte del sitio público (no tiene link en el nav): vive en
 * /herramientas/marca-de-beats para que Ignacio o el artista preparen las 20
 * muestras de la Venta de Beats sin salir del navegador.
 *
 * Flujo: subir el beat completo -> elegir una ventana de 10s arrastrando
 * sobre la forma de onda -> subir (o reusar) la marca de sonido del artista
 * -> renderizar la mezcla -> descargar el .wav listo para /public/beats/.
 *
 * Todo corre client-side con Web Audio API — no sube archivos a ningún
 * servidor, no depende de ffmpeg ni de red. El WAV resultante se codifica a
 * mano (función bufferToWav) para no agregar dependencias.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { BEATS } from '@/lib/site-data'

const CLIP_SECONDS = 10
const WATERMARK_STORAGE_KEY = 'brokeboirichie:watermark-tag-v1'
const CANVAS_WIDTH = 900
const CANVAS_HEIGHT = 140

type Decoded = { buffer: AudioBuffer; name: string }

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return '0:00.0'
  const m = Math.floor(sec / 60)
  const s = (sec % 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** Codifica un AudioBuffer como WAV PCM 16 bits — sin librerías externas. */
function bufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const numFrames = buffer.length
  const blockAlign = numChannels * 2
  const dataSize = numFrames * blockAlign
  const arrayBuffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(arrayBuffer)

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  const channels: Float32Array[] = []
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c))

  let offset = 44
  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = clamp(channels[c][i], -1, 1)
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

/** Pico de amplitud por bucket, mezclando canales — para dibujar la forma de onda. */
function computePeaks(buffer: AudioBuffer, buckets: number): number[] {
  const channelData: Float32Array[] = []
  for (let c = 0; c < buffer.numberOfChannels; c++) channelData.push(buffer.getChannelData(c))
  const samplesPerBucket = Math.max(1, Math.floor(buffer.length / buckets))
  const peaks: number[] = []
  for (let b = 0; b < buckets; b++) {
    const start = b * samplesPerBucket
    const end = Math.min(buffer.length, start + samplesPerBucket)
    let peak = 0
    for (let i = start; i < end; i++) {
      for (const data of channelData) {
        const v = Math.abs(data[i])
        if (v > peak) peak = v
      }
    }
    peaks.push(peak)
  }
  return peaks
}

async function decodeFile(file: File): Promise<Decoded> {
  const arrayBuffer = await file.arrayBuffer()
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  try {
    const buffer = await ctx.decodeAudioData(arrayBuffer)
    return { buffer, name: file.name }
  } finally {
    ctx.close()
  }
}

/** Renderiza la ventana de CLIP_SECONDS del beat + la marca de sonido mezclada encima. */
async function renderMix(opts: {
  track: AudioBuffer
  startSec: number
  watermark: AudioBuffer | null
  watermarkMode: 'start' | 'loop'
  watermarkIntervalSec: number
  watermarkGain: number
}): Promise<AudioBuffer> {
  const { track, startSec, watermark, watermarkMode, watermarkIntervalSec, watermarkGain } = opts
  const sampleRate = track.sampleRate
  const length = Math.round(CLIP_SECONDS * sampleRate)
  const offlineCtx = new OfflineAudioContext(track.numberOfChannels, length, sampleRate)

  const trackSource = offlineCtx.createBufferSource()
  trackSource.buffer = track
  const trackGain = offlineCtx.createGain()
  trackGain.gain.value = 1
  trackSource.connect(trackGain).connect(offlineCtx.destination)
  trackSource.start(0, startSec, CLIP_SECONDS)

  if (watermark) {
    const wmGainNode = offlineCtx.createGain()
    wmGainNode.gain.value = watermarkGain
    wmGainNode.connect(offlineCtx.destination)

    const starts = watermarkMode === 'start' ? [0] : []
    if (watermarkMode === 'loop') {
      for (let t = 0; t < CLIP_SECONDS; t += watermarkIntervalSec) starts.push(t)
    }
    for (const t of starts) {
      const remaining = CLIP_SECONDS - t
      if (remaining <= 0) continue
      const wmSource = offlineCtx.createBufferSource()
      wmSource.buffer = watermark
      wmSource.connect(wmGainNode)
      wmSource.start(t, 0, Math.min(watermark.duration, remaining))
    }
  }

  return offlineCtx.startRendering()
}

export default function BeatWatermarkerPage() {
  const [track, setTrack] = useState<Decoded | null>(null)
  const [peaks, setPeaks] = useState<number[]>([])
  const [startSec, setStartSec] = useState(0)
  const [trackError, setTrackError] = useState<string | null>(null)

  const [watermark, setWatermark] = useState<Decoded | null>(null)
  const [watermarkError, setWatermarkError] = useState<string | null>(null)
  const [hasSavedWatermark, setHasSavedWatermark] = useState(false)

  const [watermarkMode, setWatermarkMode] = useState<'start' | 'loop'>('loop')
  const [watermarkInterval, setWatermarkInterval] = useState(4)
  const [watermarkGain, setWatermarkGain] = useState(0.35)

  const [beatId, setBeatId] = useState(BEATS[0]?.id ?? 'beat-01')
  const [isRendering, setIsRendering] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playCtxRef = useRef<AudioContext | null>(null)
  const dragRef = useRef(false)

  // Intenta cargar una marca de sonido guardada previamente (localStorage, por comodidad del
  // artista: la sube una vez y queda disponible en próximas visitas de este mismo navegador).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WATERMARK_STORAGE_KEY)
      setHasSavedWatermark(Boolean(saved))
    } catch {
      // localStorage puede fallar (modo privado, storage bloqueado) — no es crítico.
    }
  }, [])

  const drawWaveform = useCallback(
    (peaksData: number[], duration: number, selectionStart: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = '#0f121c'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const mid = CANVAS_HEIGHT / 2
      const barWidth = CANVAS_WIDTH / peaksData.length
      ctx.fillStyle = '#253252'
      peaksData.forEach((peak, i) => {
        const h = Math.max(1, peak * (CANVAS_HEIGHT - 10))
        ctx.fillRect(i * barWidth, mid - h / 2, Math.max(1, barWidth - 1), h)
      })

      if (duration > 0) {
        const selX = (selectionStart / duration) * CANVAS_WIDTH
        const selW = (CLIP_SECONDS / duration) * CANVAS_WIDTH
        ctx.fillStyle = 'rgba(0, 191, 255, 0.18)'
        ctx.fillRect(selX, 0, selW, CANVAS_HEIGHT)
        ctx.strokeStyle = '#00bfff'
        ctx.lineWidth = 2
        ctx.strokeRect(selX + 1, 1, Math.max(2, selW - 2), CANVAS_HEIGHT - 2)
      }
    },
    [],
  )

  useEffect(() => {
    if (track) drawWaveform(peaks, track.buffer.duration, startSec)
  }, [track, peaks, startSec, drawWaveform])

  async function handleTrackFile(file: File) {
    setTrackError(null)
    setPreviewUrl(null)
    try {
      const decoded = await decodeFile(file)
      if (decoded.buffer.duration < CLIP_SECONDS) {
        setTrackError(`El archivo dura ${decoded.buffer.duration.toFixed(1)}s — necesita al menos ${CLIP_SECONDS}s.`)
        return
      }
      setTrack(decoded)
      setPeaks(computePeaks(decoded.buffer, 300))
      setStartSec(0)
    } catch {
      setTrackError('No se pudo leer este archivo de audio. Probá con un .mp3 o .wav.')
    }
  }

  async function handleWatermarkFile(file: File, persist: boolean) {
    setWatermarkError(null)
    try {
      const decoded = await decodeFile(file)
      setWatermark(decoded)
      if (persist) {
        try {
          const arrayBuffer = await file.arrayBuffer()
          let binary = ''
          const bytes = new Uint8Array(arrayBuffer)
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
          const base64 = btoa(binary)
          localStorage.setItem(WATERMARK_STORAGE_KEY, JSON.stringify({ name: file.name, type: file.type, data: base64 }))
          setHasSavedWatermark(true)
        } catch {
          // Si no cabe en localStorage (clip muy largo) seguimos igual, solo no queda guardada.
        }
      }
    } catch {
      setWatermarkError('No se pudo leer la marca de sonido. Probá con un .mp3 o .wav corto.')
    }
  }

  function loadSavedWatermark() {
    try {
      const raw = localStorage.getItem(WATERMARK_STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as { name: string; type: string; data: string }
      const binary = atob(saved.data)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const file = new File([bytes], saved.name, { type: saved.type })
      handleWatermarkFile(file, false)
    } catch {
      setWatermarkError('No se pudo recuperar la marca guardada — subila de nuevo.')
    }
  }

  function clearSavedWatermark() {
    try {
      localStorage.removeItem(WATERMARK_STORAGE_KEY)
      setHasSavedWatermark(false)
    } catch {
      // no-op
    }
  }

  function pointerToStart(clientX: number) {
    const canvas = canvasRef.current
    if (!canvas || !track) return
    const rect = canvas.getBoundingClientRect()
    const x = clamp(clientX - rect.left, 0, rect.width)
    const duration = track.buffer.duration
    const clickedTime = (x / rect.width) * duration
    setStartSec(clamp(clickedTime - CLIP_SECONDS / 2, 0, Math.max(0, duration - CLIP_SECONDS)))
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    dragRef.current = true
    pointerToStart(e.clientX)
  }
  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (dragRef.current) pointerToStart(e.clientX)
  }
  function onPointerUp() {
    dragRef.current = false
  }

  async function playOriginalWindow() {
    if (!track) return
    playCtxRef.current?.close()
    const ctx = new AudioContext()
    playCtxRef.current = ctx
    const source = ctx.createBufferSource()
    source.buffer = track.buffer
    source.connect(ctx.destination)
    source.start(0, startSec, CLIP_SECONDS)
  }

  async function playMixPreview() {
    if (!track) return
    const rendered = await renderMix({
      track: track.buffer,
      startSec,
      watermark: watermark?.buffer ?? null,
      watermarkMode,
      watermarkIntervalSec: watermarkInterval,
      watermarkGain,
    })
    playCtxRef.current?.close()
    const ctx = new AudioContext()
    playCtxRef.current = ctx
    const source = ctx.createBufferSource()
    source.buffer = rendered
    source.connect(ctx.destination)
    source.start()
  }

  async function renderAndDownload() {
    if (!track) return
    setIsRendering(true)
    try {
      const rendered = await renderMix({
        track: track.buffer,
        startSec,
        watermark: watermark?.buffer ?? null,
        watermarkMode,
        watermarkIntervalSec: watermarkInterval,
        watermarkGain,
      })
      const blob = bufferToWav(rendered)
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      const a = document.createElement('a')
      a.href = url
      a.download = `${beatId}.wav`
      a.click()
    } finally {
      setIsRendering(false)
    }
  }

  const pendingBeats = BEATS.filter((b) => !b.src)

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Herramienta interna · no pública</p>
        <h1 className="mt-2 font-display text-4xl font-light uppercase tracking-tight text-foreground sm:text-5xl">
          Marca de Beats
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Subí el beat completo, elegí los 10 segundos arrastrando sobre la forma de onda, aplicá
          la marca de sonido del artista y descargá el .wav listo para {`/public/beats/`}. Todo
          corre en tu navegador — nada se sube a ningún servidor.
        </p>
      </header>

      {/* 1. Beat */}
      <section className="winamp-shell mb-6 overflow-hidden">
        <div className="winamp-titlebar">
          <div className="winamp-dots">
            <span className="winamp-dot" />
            <span className="winamp-dot" />
            <span className="winamp-dot" />
          </div>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/90">1. Beat</span>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => e.target.files?.[0] && handleTrackFile(e.target.files[0])}
            className="font-mono text-xs text-muted-foreground file:winamp-btn file:mr-3 file:border-0 file:px-4 file:py-2 file:font-mono file:text-[10px] file:uppercase file:tracking-[0.1em] file:text-foreground"
          />
          {trackError && <p className="font-mono text-[11px] text-primary">{trackError}</p>}

          {track && (
            <>
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                className="w-full cursor-pointer touch-none rounded-lg border border-white/[0.1]"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground">
                <span>
                  Selección: {formatTime(startSec)} — {formatTime(startSec + CLIP_SECONDS)} de {formatTime(track.buffer.duration)}
                </span>
                <button type="button" onClick={playOriginalWindow} className="winamp-btn px-4 py-2 text-foreground">
                  ▸ Escuchar selección (sin marca)
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 2. Marca de sonido */}
      <section className="winamp-shell mb-6 overflow-hidden">
        <div className="winamp-titlebar">
          <div className="winamp-dots">
            <span className="winamp-dot" />
            <span className="winamp-dot" />
            <span className="winamp-dot" />
          </div>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/90">2. Marca de sonido</span>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => e.target.files?.[0] && handleWatermarkFile(e.target.files[0], true)}
              className="font-mono text-xs text-muted-foreground file:winamp-btn file:mr-3 file:border-0 file:px-4 file:py-2 file:font-mono file:text-[10px] file:uppercase file:tracking-[0.1em] file:text-foreground"
            />
            {hasSavedWatermark && !watermark && (
              <button type="button" onClick={loadSavedWatermark} className="winamp-btn px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-foreground">
                Usar marca guardada
              </button>
            )}
            {hasSavedWatermark && (
              <button type="button" onClick={clearSavedWatermark} className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-primary">
                Olvidar marca guardada
              </button>
            )}
          </div>
          {watermarkError && <p className="font-mono text-[11px] text-primary">{watermarkError}</p>}
          {watermark && (
            <p className="font-mono text-[11px] text-muted-foreground">
              Cargada: {watermark.name} ({watermark.buffer.duration.toFixed(1)}s) — se guarda en este navegador para la próxima vez.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Modo
              <select
                value={watermarkMode}
                onChange={(e) => setWatermarkMode(e.target.value as 'start' | 'loop')}
                className="winamp-well px-3 py-2 text-foreground"
              >
                <option value="loop">Repetir cada X segundos (anti-robo)</option>
                <option value="start">Solo al inicio (tag clásico)</option>
              </select>
            </label>

            {watermarkMode === 'loop' && (
              <label className="flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Intervalo ({watermarkInterval}s)
                <input
                  type="range"
                  min={2}
                  max={8}
                  step={0.5}
                  value={watermarkInterval}
                  onChange={(e) => setWatermarkInterval(Number(e.target.value))}
                  className="winamp-range"
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground sm:col-span-2">
              Volumen de la marca ({Math.round(watermarkGain * 100)}%)
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={watermarkGain}
                onChange={(e) => setWatermarkGain(Number(e.target.value))}
                className="winamp-range"
              />
            </label>
          </div>
        </div>
      </section>

      {/* 3. Render */}
      <section className="winamp-shell mb-10 overflow-hidden">
        <div className="winamp-titlebar">
          <div className="winamp-dots">
            <span className="winamp-dot" />
            <span className="winamp-dot" />
            <span className="winamp-dot" />
          </div>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/90">3. Exportar</span>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <label className="flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Nombre de archivo (coincide con el id en lib/site-data.ts → BEATS)
            <select value={beatId} onChange={(e) => setBeatId(e.target.value)} className="winamp-well px-3 py-2 text-foreground">
              {BEATS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} {b.src ? '· ya tiene audio' : '· pendiente'}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={playMixPreview}
              disabled={!track}
              className="winamp-btn px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-foreground disabled:opacity-40"
            >
              ▸ Escuchar mezcla con marca
            </button>
            <button
              type="button"
              onClick={renderAndDownload}
              disabled={!track || isRendering}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {isRendering ? 'Renderizando…' : `Descargar ${beatId}.wav`}
            </button>
          </div>

          {previewUrl && (
            <p className="font-mono text-[11px] text-muted-foreground">
              Listo. Movelo a <code>public/beats/{beatId}.wav</code> y en <code>lib/site-data.ts</code> cambiá ese beat de{' '}
              <code>src: null</code> a <code>src: &apos;/beats/{beatId}.wav&apos;</code>.
            </p>
          )}

          {pendingBeats.length > 0 && (
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Quedan {pendingBeats.length} de {BEATS.length} beats sin muestra.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
