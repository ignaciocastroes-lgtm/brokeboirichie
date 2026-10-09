'use client'

import { useEffect, useRef, useState } from 'react'
import { getLatestIntro } from '@/lib/intros'

const SEEN_KEY = 'brokeboirichie:intro-seen'

/**
 * ENTRADA DE ÉPOCA — una sola vez por sesión, con el clip del último lanzamiento.
 * -----------------------------------------------------------------------
 * Lee `getLatestIntro()` (lib/intros.ts), que a su vez sigue a `LATEST_RELEASE` de
 * lib/site-data.ts: cuando el artista saca un tema nuevo y se agrega su clip, esta intro cambia
 * sola sin tocar este archivo. Si todavía no hay clip para el último lanzamiento, el componente
 * no renderiza nada — nunca bloquea el sitio con un video vencido o inexistente.
 *
 * Por qué hay un botón "Entrar" antes de reproducir con sonido: los navegadores (Safari, Chrome
 * en iOS/Android, y el navegador interno de Instagram) BLOQUEAN el autoplay con audio sin que el
 * usuario haya tocado la pantalla primero. No hay forma de saltarse esto con código: siempre hace
 * falta un gesto del usuario antes de que suene el audio.
 *
 * sessionStorage (no localStorage): se vuelve a mostrar si cierran el navegador y vuelven otro
 * día, pero no cada vez que navegan entre secciones de la misma visita.
 */
export function IntroSplash() {
  const intro = getLatestIntro()
  const [status, setStatus] = useState<'checking' | 'gate' | 'playing' | 'done'>('checking')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!intro) return
    const seen = typeof window !== 'undefined' && sessionStorage.getItem(SEEN_KEY) === '1'
    setStatus(seen ? 'done' : 'gate')
  }, [intro])

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

  if (!intro || status === 'checking' || status === 'done') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <video
        ref={videoRef}
        src={intro.video}
        poster={intro.poster}
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
          className="absolute inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 font-mono text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_40px_rgb(124_102_220/0.5)] transition-transform active:scale-95"
        >
          Entrar
        </button>
      )}

      {status === 'playing' && (
        <button
          type="button"
          onClick={finish}
          className="absolute bottom-8 right-6 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/70 transition-colors hover:text-foreground"
        >
          Saltar
        </button>
      )}
    </div>
  )
}
