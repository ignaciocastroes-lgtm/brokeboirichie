import { ArrowUpRight } from 'lucide-react'
import { DEVELOPER, NAV_LINKS } from '@/lib/site-data'

const SPEC_SHEET = [
  { label: 'Artista / Productor', value: 'Brokeboirichie' },
  { label: 'Género', value: 'Plugg · MexikoDro · Trap melancólico' },
  { label: 'Último álbum', value: 'REX — 2025 · 12 tracks' },
  { label: 'Origen', value: 'San Bernardo, Zona Sur, Santiago' },
]

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-white/[0.08]">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2">
            <p className="font-display text-5xl font-light uppercase leading-none tracking-tight text-foreground sm:text-6xl">
              Brokeboirichie
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">Música para sanar el alma</p>
          </div>

          <dl className="grid grid-cols-1 gap-x-10 gap-y-4 font-mono text-xs sm:grid-cols-2">
            {SPEC_SHEET.map((row) => (
              <div key={row.label} className="flex flex-col gap-1 border-t border-white/[0.08] pt-3">
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{row.label}</dt>
                <dd className="text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <nav aria-label="Navegación del pie" className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              [{l.label}]
            </a>
          ))}
        </nav>

        <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground">
          {'℗ & © BROKEBOIRICHIE. San Bernardo, Santiago de Chile.'}
        </p>
      </div>

      <div className="border-t border-white/[0.08] bg-midnight/20">
        <a
          href={DEVELOPER.href}
          className="group mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
        >
          <span className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">
            Plataforma de lanzamiento desarrollada por <span className="text-foreground">{DEVELOPER.name}</span>
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-foreground">
            ¿Eres artista y buscas tu propio hub interactivo?{' '}
            <span className="text-primary underline-offset-4 group-hover:underline">Conecta aquí</span>
            <ArrowUpRight className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
          </span>
        </a>
      </div>
    </footer>
  )
}
