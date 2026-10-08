'use client'

import { useState } from 'react'
import { ArrowUpRight, BellRing, Play } from 'lucide-react'
import { VIDEOS, YOUTUBE_SUBSCRIBE_URL, type Video } from '@/lib/site-data'

export function VideoSection() {
  const [featured, ...rest] = VIDEOS

  return (
    <section id="videos" aria-labelledby="videos-title" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Cine de madrugada</p>
          <h2 id="videos-title" className="mt-2 font-display text-5xl font-light uppercase tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Videoclips
          </h2>
        </div>
        <a
          href={YOUTUBE_SUBSCRIBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-mono text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          <BellRing className="size-4" aria-hidden="true" />
          Suscribirse al canal
          <span className="hidden normal-case tracking-normal opacity-70 sm:inline">(@brokeboirichie)</span>
        </a>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <VideoCard video={featured} featured />
        <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
          {rest.map((video) => (
            <li key={video.id}>
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function VideoCard({ video, featured = false }: { video: Video; featured?: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const watchUrl = `https://www.youtube.com/watch?v=${video.id}`

  return (
    <article className="glass flex h-full flex-col overflow-hidden rounded-xl">
      <div className="relative aspect-video w-full bg-card">
        {isLoaded ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`}
            title={`${video.title} — ${video.subtitle}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsLoaded(true)}
            className="group absolute inset-0 size-full"
            aria-label={`Reproducir video ${video.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail, loaded lazily */}
            <img
              src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-full object-cover opacity-75 saturate-50 transition-opacity group-hover:opacity-95"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <span
              className={`absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.2] bg-background/50 text-foreground backdrop-blur-md transition-colors group-hover:bg-primary group-hover:text-primary-foreground ${
                featured ? 'size-16' : 'size-12'
              }`}
            >
              <Play className={`translate-x-px ${featured ? 'size-6' : 'size-4'}`} aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-1 items-end justify-between gap-4 p-4">
        <div className="min-w-0">
          <h3 className={`font-display uppercase leading-tight tracking-wide text-foreground text-balance ${featured ? 'text-4xl' : 'text-2xl'}`}>
            {video.title}
          </h3>
          <p className="font-mono text-[11px] text-muted-foreground">{video.subtitle}</p>
        </div>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-foreground transition-colors hover:border-primary/60"
        >
          <ArrowUpRight className="size-4" aria-hidden="true" />
          <span className="sr-only">Ver {video.title} en YouTube</span>
        </a>
      </div>
    </article>
  )
}
