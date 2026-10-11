'use client'

import { useEffect, useRef } from 'react'

/**
 * VISUALIZER WINAMP REAL (2026-10-11) — reemplaza el pulso CSS estático (`EqBars`) por barras que
 * reaccionan de verdad al audio que suena en <BeatsMarketplace>, vía Web Audio API
 * (AnalyserNode + getByteFrequencyData), pintado a mano en <canvas>.
 *
 * El grafo de audio (AudioContext + MediaElementAudioSourceNode) se cachea por elemento <audio> en
 * un WeakMap a nivel de módulo: un <audio> solo admite UN `createMediaElementSource` en toda su
 * vida — si el componente se vuelve a montar (p.ej. StrictMode en dev) y se intenta crear el source
 * de nuevo sobre el mismo nodo, el navegador tira InvalidStateError. Reusar el source cacheado evita
 * ese choque sin tener que levantar un <audio> nuevo por visualizer.
 */

type AudioGraph = { ctx: AudioContext; source: MediaElementAudioSourceNode }

const graphCache = new WeakMap<HTMLAudioElement, AudioGraph>()

function getAudioGraph(audio: HTMLAudioElement): AudioGraph | null {
  const cached = graphCache.get(audio)
  if (cached) return cached
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    const ctx = new Ctx()
    const source = ctx.createMediaElementSource(audio)
    source.connect(ctx.destination)
    const graph = { ctx, source }
    graphCache.set(audio, graph)
    return graph
  } catch {
    // Web Audio bloqueado (CORS en el <audio src>, navegador sin soporte, etc.) — el visualizer
    // cae a modo estático más abajo en vez de romper el reproductor.
    return null
  }
}

/** Reanuda el AudioContext — llamar desde un gesto real del usuario (click de play). */
export function resumeAudioContextFor(audio: HTMLAudioElement | null) {
  if (!audio) return
  const graph = graphCache.get(audio) ?? getAudioGraph(audio)
  if (graph && graph.ctx.state === 'suspended') {
    graph.ctx.resume().catch(() => {})
  }
}

export function AudioVisualizer({
  audioRef,
  active,
  barCount = 14,
  className,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>
  active: boolean
  barCount?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Conecta (una sola vez por elemento <audio>) un AnalyserNode al grafo compartido.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const graph = getAudioGraph(audio)
    if (!graph) return
    const analyser = graph.ctx.createAnalyser()
    analyser.fftSize = 64
    analyser.smoothingTimeConstant = 0.8
    graph.source.connect(analyser)
    analyserRef.current = analyser
    return () => {
      analyser.disconnect()
      if (analyserRef.current === analyser) analyserRef.current = null
    }
  }, [audioRef])

  // Loop de dibujo — barras reales si hay AnalyserNode disponible, si no un fallback estático leve.
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx2d = canvas?.getContext('2d')
    if (!canvas || !ctx2d) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = window.devicePixelRatio || 1
    let raf = 0

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      canvas!.width = Math.max(1, Math.round(rect.width * dpr))
      canvas!.height = Math.max(1, Math.round(rect.height * dpr))
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      const w = canvas!.width
      const h = canvas!.height
      ctx2d!.clearRect(0, 0, w, h)

      const bars = barCount
      const gap = w * 0.015
      const barWidth = Math.max(1, (w - gap * (bars - 1)) / bars)
      const analyser = analyserRef.current

      let levels: number[]
      if (analyser && active && !prefersReduced) {
        const data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
        const bucket = Math.max(1, Math.floor(data.length / bars))
        levels = Array.from({ length: bars }, (_, i) => {
          let sum = 0
          for (let j = 0; j < bucket; j++) sum += data[i * bucket + j] ?? 0
          return sum / bucket / 255
        })
      } else {
        // Sin señal real (pausado, o el grafo de audio no pudo crearse): un pulso parejo y bajo,
        // nunca barras a cero planas, para que el deck no se vea "muerto".
        levels = Array.from({ length: bars }, () => (active ? 0.22 : 0.06))
      }

      levels.forEach((level, i) => {
        const barH = Math.max(h * 0.06, level * h)
        const x = i * (barWidth + gap)
        const y = h - barH
        ctx2d!.fillStyle = `rgba(0, 191, 255, ${(0.45 + level * 0.55).toFixed(2)})`
        ctx2d!.fillRect(x, y, barWidth, barH)
      })

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [active, barCount])

  return <canvas ref={canvasRef} aria-hidden="true" className={className ?? 'h-5 w-16'} />
}
