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
    </section>
  )
}
