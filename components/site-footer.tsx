import { ArrowUpRight } from 'lucide-react'
import { CONTACT_EMAIL, MANAGEMENT_WHATSAPP_URL, NAV_LINKS } from '@/lib/site-data'

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
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">
            <span>Contacto</span>
            {CONTACT_EMAIL ? (
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground transition-colors hover:text-primary">
                {CONTACT_EMAIL}
              </a>
            ) : (
              <span className="text-foreground/60">próximamente</span>
            )}
          </div>
          <a
            href={MANAGEMENT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Escribir por WhatsApp
            <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
