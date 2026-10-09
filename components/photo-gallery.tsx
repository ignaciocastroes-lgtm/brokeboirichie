import Image from 'next/image'
import { ArrowUpRight, Camera } from 'lucide-react'
import { galleryCategories } from '@/lib/gallery'
import { loadCategoryGallery } from '@/lib/gallery-data'

export async function PhotoGallery() {
  const categories = await Promise.all(galleryCategories.map((c) => loadCategoryGallery(c)))

  return (
    <section
      id="fotos"
      aria-labelledby="fotos-title"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="glass-y2k mb-10 flex flex-col gap-3 rounded-2xl p-5 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-y2k-glow" style={{ color: 'var(--y2k-celestite)' }}>
          [Fotos] · Directo desde Flickr
        </p>
        <h2
          id="fotos-title"
          className="text-balance font-display text-5xl font-light uppercase leading-none tracking-tight text-foreground sm:text-6xl"
        >
          Archivo visual
        </h2>
        <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          El artista sube y organiza sus propias fotos en Flickr — esta galería se actualiza sola cuando él agrega nuevas.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {categories.map((cat) => (
          <GalleryCategoryBlock key={cat.category} data={cat} />
        ))}
      </div>
    </section>
  )
}

function GalleryCategoryBlock({ data }: { data: Awaited<ReturnType<typeof loadCategoryGallery>> }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-2xl font-normal uppercase tracking-wide text-foreground">{data.label}</h3>
        {data.albums[0] && (
          <a
            href={data.albums[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
          >
            Ver álbum completo <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        )}
      </div>

      {data.source === 'empty' ? (
        <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-midnight/10 p-6 text-center">
          <Camera className="size-6 text-muted-foreground" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Álbum en camino — el artista aún está organizando este en Flickr
          </span>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.photos.map((photo) => (
            <li key={photo.id} className="relative aspect-square overflow-hidden rounded-xl border border-white/[0.08]">
              {photo.href ? (
                <a href={photo.href} target="_blank" rel="noopener noreferrer" className="block size-full">
                  <Image
                    src={photo.src}
                    alt={photo.alt || photo.title || data.label}
                    fill
                    unoptimized={photo.remote}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </a>
              ) : (
                <Image
                  src={photo.src}
                  alt={photo.alt || photo.title || data.label}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
