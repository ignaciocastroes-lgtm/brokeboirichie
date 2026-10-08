'use client'

import { useEffect, useRef, useState } from 'react'

const SEEN_KEY = 'brokeboirichie:intro-seen'

/**
 * ENTRADA DE ÉPOCA — una sola vez por sesión.
 * -----------------------------------------------------------------------
 * /public/intro/intro-brokeboirichie.mp4 = video del oso (8s) + los 8 segundos
 * más intensos/melódicos de "Old Money" muxeados como pista de audio.
 *
 * Por qué hay un botón "Entrar" antes de reproducir con sonido:
 * los navegadores (Safari, Chrome en iOS/Android, y el navegador interno de
 * Instagram) BLOQUEAN el autoplay con audio sin que el usuario haya tocado
 * la pantalla primero. No hay forma de saltarse esto con código: siempre
 * hace falta un gesto del usuario antes de que suene el audio.
 *
 * sessionStorage (no localStorage): se vuelve a mostrar si cierran el
 * navegador y vuelven otro día, pero no cada vez que navegan entre
 * secciones de la misma visita.
 */
export function IntroSplash() {
  const [status, setStatus] = useState<'checking' | 'gate' | 'playing' | 'done'>('checking')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const seen = typeof window !== 'undefined' && sessionStorage.getItem(SEEN_KEY) === '1'
    setStatus(seen ? 'done' : 'gate')
  }, [])

  function finish() {
    sessionStorage.setItem(SEEN_KEY, '1')
    setStatus('done')
  }

  function enter() {
    setStatus('playing')
    requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => finish())
    })
  }

  if (status === 'checking' || status === 'done') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <video
        ref={videoRef}
        src="/intro/intro-brokeboirichie.mp4"
        poster="/intro/intro-poster.jpg"
        playsInline
        onEnded={finish}
        className={`h-full w-full object-cover transition-opacity duration-700 ${
          status === 'playing' ? 'opacity-100' : 'opacity-60'
        }`}
      />

      {status === 'gate' && (
        <button
          type="button"
          onClick={enter}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/40 backdrop-blur-sm"
        >
          <span className="font-display text-3xl font-light uppercase tracking-tight text-foreground sm:text-4xl">
            Brokeboirichie
          </span>
          <span className="rounded-full border border-white/20 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-foreground">
            Toca para entrar
          </span>
        </button>
      )}

      {status === 'playing' && (
        <button
          type="button"
          onClick={finish}
          className="absolute bottom-6 right-6 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/70 underline-offset-4 hover:underline"
        >
          Saltar
        </button>
      )}
    </div>
  )
}
