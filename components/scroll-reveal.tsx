'use client'

/**
 * SCROLL REVEAL (2026-10-11) — Envuelve una sección y la hace aparecer (opacidad + leve
 * desplazamiento) cuando entra en viewport, vía IntersectionObserver. Pedido explícito del
 * artista: la página se sentía "con baches negros" al bajar — las secciones aparecían de golpe,
 * sin vida. Esto le da intención al scroll sin tocar el contenido de cada sección.
 *
 * Respeta prefers-reduced-motion (igual que .eq-bar en globals.css): si el usuario lo pide, el
 * contenido aparece directo, sin animación.
 */

import { useEffect, useRef, useState } from 'react'

export function ScrollReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
