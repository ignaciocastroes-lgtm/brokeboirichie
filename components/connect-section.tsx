import { ArrowUpRight } from 'lucide-react'
import { MANAGEMENT_PHONE_DISPLAY, MANAGEMENT_WHATSAPP_URL } from '@/lib/site-data'
import { CommunityLinks } from '@/components/community-links'
import { FanPoll } from '@/components/fan-poll'

export function ConnectSection() {
  return (
    <section
      id="conectar"
      aria-labelledby="conectar-title"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="flex flex-col gap-3 pb-10 sm:pb-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">[Conectar] · Comunidad</p>
        <h2
          id="conectar-title"
          className="text-balance font-display text-5xl font-light uppercase leading-none tracking-tight text-foreground sm:text-7xl"
        >
          La madrugada se escucha mejor acompañado
        </h2>
        <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Vota, comenta el próximo setlist y sigue el universo de Brokeboirichie en todas sus plataformas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="glass rounded-2xl p-5 sm:p-8">
          <FanPoll />
        </div>
        <div className="flex flex-col gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Canales oficiales</p>
          <CommunityLinks />
        </div>
      </div>

      <div className="glass mt-6 flex flex-col items-start gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Marcas, prensa y booking</p>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground">
            Fotos para marcas, book y propuestas de colaboración — contacto directo con su management: {MANAGEMENT_PHONE_DISPLAY}
          </p>
        </div>
        <a
          href={MANAGEMENT_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 font-mono text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Escribir por WhatsApp
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
