import Image from 'next/image'
import { ArrowUpRight, Play } from 'lucide-react'
import { FEATURED_ALBUM, ONERPM_URL, RELEASES } from '@/lib/site-data'
import { LiveIndicator } from './live-indicator'
import { PlatformHub } from './platform-hub'

const premieres = RELEASES.filter((r) => r.kind === 'Single' && !r.pending)

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col justify-center gap-12 px-4 py-12 sm:px-6 md:py-16 lg:min-h-[calc(100dvh-5rem)] lg:px-8"
    >
      <div className="grid items-center gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
        <div className="flex flex-col gap-6 md:col-span-7 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <LiveIndicator label="Nuevo álbum · ya disponible" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {FEATURED_ALBUM.year} — {FEATURED_ALBUM.meta}
            </span>
          </div>

          <h1 id="hero-title" className="flex flex-col font-display uppercase leading-[0.82]">
            <span className="text-sm font-normal tracking-[0.4em] text-muted-foreground sm:text-base">
              BROKEBOIRICHIE presenta
            </span>
            <span className="mt-3 pb-4 text-[9rem] font-extralight tracking-tight text-foreground min-[400px]:text-[11rem] sm:text-[13rem] md:text-[12rem] lg:text-[15rem] xl:text-[17rem] 2xl:text-[19rem]">
              REX
            </span>
          </h1>

          <div className="flex flex-col gap-3 min-[400px]:flex-row">
            <a
              href={ONERPM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-mono text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Play className="size-4 fill-current" aria-hidden="true" />
              Escuchar REX
            </a>
            <a
              href="#videos"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/[0.12] px-6 font-mono text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary/60"
            >
              Ver videos
            </a>
          </div>
        </div>

        <div className="md:col-span-5 lg:col-span-5">
          <figure className="relative mx-auto w-full max-w-sm md:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,rgb(124_102_220/0.35),transparent)]"
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08]">
              <Image
                src={FEATURED_ALBUM.cover! || "/placeholder.svg"}
                alt="Portada del álbum REX de BROKEBOIRICHIE"
                width={900}
                height={900}
                priority
                sizes="(min-width: 768px) 40vw, 90vw"
                className="aspect-square w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <span>REX — LP</span>
              <span>{FEATURED_ALBUM.meta} · {FEATURED_ALBUM.year}</span>
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Estrenos recientes en YouTube
          </h2>
          <ol className="glass rounded-xl">
            {premieres.map((r) => (
              <li key={r.id} className="border-b border-white/[0.06] last:border-0">
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-14 items-center justify-between gap-4 px-4 py-3"
                >
                  <span className="font-display text-xl font-normal uppercase tracking-wide text-foreground sm:text-2xl">
                    {r.title}
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-primary">
                    Ver clip
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-7">
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Canales oficiales
          </h2>
          <PlatformHub />
        </div>
      </div>
    </section>
  )
}
