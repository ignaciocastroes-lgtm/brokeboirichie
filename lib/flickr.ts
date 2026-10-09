import type { GalleryPhoto } from './gallery'

// Cliente del "feed" público de Flickr (RSS/JSON de toda la vida, sin api_key). La API normal de
// Flickr (flickr.photosets.getPhotos) exige hoy una cuenta Flickr Pro para conseguir una api_key;
// la del artista es Free. Este feed es un mecanismo más viejo, pensado para "suscribirse" a un
// álbum público como si fuera un blog — no depende de si la cuenta es Free o Pro, y no pide clave.
// Mismo patrón que se usó y verificó en GABOFOTOS (lib/flickr.ts de ese proyecto).
// Doc (no oficial, pero el feed sigue funcionando): busca "flickr services feeds photoset.gne".
// Devuelve como mucho los ~20 ítems más recientes del álbum, no el álbum completo si tiene más.
const FEED = 'https://api.flickr.com/services/feeds/photoset.gne'

export type FlickrAlbum = { id: string; title: string }

/** Minúsculas, sin tildes y sin espacios sobrantes. */
export function normalizeTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

/**
 * Convierte los álbumes pedidos por una categoría en álbumes concretos: solo los que ya tienen
 * `id` (el feed público no permite listar álbumes de una cuenta sin api_key, así que uno sin id
 * simplemente se omite hasta que Ignacio consiga su número real desde la URL del álbum en Flickr).
 */
export function resolveAlbums(wanted: { id?: string; title: string }[]): FlickrAlbum[] {
  const seen = new Set<string>()
  const result: FlickrAlbum[] = []
  for (const album of wanted) {
    if (album.id && !seen.has(album.id)) {
      seen.add(album.id)
      result.push({ id: album.id, title: album.title })
    }
  }
  return result
}

const ENTIDADES: Record<string, string> = {
  '&amp;': '&',
  '&quot;': '"',
  '&#039;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
}

function desescapar(texto: string): string {
  return texto.replace(/&(?:amp|quot|#039|apos|lt|gt);/g, (m) => ENTIDADES[m] ?? m)
}

// El feed da una sola imagen ("_m", 240px de lado largo) por foto. Flickr sirve el mismo archivo
// en otros tamaños cambiando el sufijo (documentado y estable desde hace más de una década):
//   _q=150  _n=320  _z=640  _c=800  _b=1024
const SUFIJO_ORIGEN = '_m.jpg'
const SUFIJO_DESTINO = '_c.jpg'
const LADO_ORIGEN = 240
const LADO_DESTINO = 800

type FeedItem = {
  title?: string
  link?: string
  media?: { m?: string }
  description?: string
}

function medidasDesdeDescripcion(descripcion: string | undefined): { width: number; height: number } | null {
  const m = descripcion?.match(/width="(\d+)"\s+height="(\d+)"/)
  if (!m) return null
  const width = Number(m[1])
  const height = Number(m[2])
  return width > 0 && height > 0 ? { width, height } : null
}

function toGalleryPhoto(item: FeedItem): GalleryPhoto | null {
  const srcOrigen = item.media?.m
  if (!srcOrigen || !srcOrigen.includes(SUFIJO_ORIGEN)) return null

  const idMatch = srcOrigen.match(/\/(\d+)_([0-9a-f]+)_m\.jpg$/)
  if (!idMatch) return null
  const [, id] = idMatch

  const medidas = medidasDesdeDescripcion(item.description)
  if (!medidas) return null

  const factor = LADO_DESTINO / LADO_ORIGEN
  const width = Math.round(medidas.width * factor)
  const height = Math.round(medidas.height * factor)

  return {
    id,
    title: item.title ? desescapar(item.title) : '',
    src: srcOrigen.replace(SUFIJO_ORIGEN, SUFIJO_DESTINO),
    width,
    height,
    href: item.link,
    remote: true,
  }
}

export async function fetchAlbumPhotos(albumId: string, ownerNsid: string): Promise<GalleryPhoto[]> {
  const params = new URLSearchParams({ nsid: ownerNsid, set: albumId, format: 'json', nojsoncallback: '1' })
  const response = await fetch(`${FEED}?${params}`, { next: { revalidate: 3600 } })
  if (!response.ok) throw new Error(`Flickr respondió HTTP ${response.status}`)

  const data = (await response.json()) as { items?: FeedItem[] }
  const items = data.items ?? []
  return items.map(toGalleryPhoto).filter((photo): photo is GalleryPhoto => photo !== null)
}

/** Mezcla varias listas alternando una foto de cada una, sin repetir ids. */
export function interleave(lists: GalleryPhoto[][], limit: number): GalleryPhoto[] {
  const seen = new Set<string>()
  const result: GalleryPhoto[] = []
  const longest = Math.max(0, ...lists.map((list) => list.length))

  for (let i = 0; i < longest && result.length < limit; i++) {
    for (const list of lists) {
      const photo = list[i]
      if (photo && !seen.has(photo.id) && result.length < limit) {
        seen.add(photo.id)
        result.push(photo)
      }
    }
  }
  return result
}
