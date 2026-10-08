'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { NAV_LINKS, ONERPM_URL } from '@/lib/site-data'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <a href="#top" className="flex flex-col leading-none" aria-label="BROKEBOIRICHIE — inicio">
          <span className="font-display text-xl font-semibold tracking-[0.08em] text-foreground sm:text-2xl">
            BROKEBOIRICHIE
          </span>
          <span className="mt-1 font-mono text-[10px] tracking-[0.28em] text-muted-foreground">
            MÚSICA PARA SANAR EL ALMA
          </span>
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-md px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={ONERPM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full border border-primary/50 bg-primary/15 px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-primary hover:text-primary-foreground sm:inline-flex"
          >
            Escuchar en todas partes
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/[0.08] text-foreground lg:hidden"
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            <span className="sr-only">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          'fixed inset-x-0 top-16 h-[calc(100dvh-4rem)] bg-background/95 backdrop-blur-md transition-[opacity,transform] duration-300 ease-out lg:hidden',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
        )}
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label="Menú móvil" className="flex h-full flex-col justify-between px-4 pt-6 pb-10 sm:px-6">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href} className="border-b border-white/[0.08]">
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between py-5"
                >
                  <span className="font-display text-4xl font-light uppercase tracking-wide text-foreground">
                    {link.label}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href={ONERPM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-mono text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground"
          >
            Escuchar en todas partes
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  )
}
