// Categorías de la galería de fotos del artista, leídas en vivo desde su Flickr real
// (https://www.flickr.com/photos/205023176@N03/) con el mismo patrón sin api_key que GABOFOTOS.
//
// Estado confirmado el 2026-10-09 (auditado directamente contra la cuenta pública):
//   - "Fotos Sitio" ya existe y es pública -> id real 72177720336030201.
//   - "tocatas", "otras arte y ropa" y "otra Richii" las mencionó el artista en el chat de
//     WhatsApp pero todavía no son álbumes públicos en su cuenta (el Flickr "lo está haciendo él").
//     Quedan con `albums: []` a propósito: en cuanto el artista cree cada álbum, basta con poner
//     aquí su id real (el número al final de la URL del álbum) — sin tocar nada más del sitio.
//
// Los `albums` se piden solo por `id` porque el feed público no permite buscar álbumes por
// nombre sin una api_key (ver comentario en lib/flickr.ts).

export type GalleryPhoto = {
  id: string
  title: string
  src: string
  width: number
  height: number
  alt?: string
  /** Página de la foto en Flickr (solo fotos que vienen de Flickr). */
  href?: string
  /** true si la foto vive fuera del sitio (Flickr): ya viene optimizada desde su CDN. */
  remote?: boolean
}

export type GalleryCategoryId = 'fotos-sitio' | 'tocatas' | 'arte-ropa' | 'otra-richii'

export type GalleryCategory = {
  id: GalleryCategoryId
  title: string
  description: string
  albums: { id?: string; title: string }[]
  /** Fotos locales de respaldo si Flickr no responde o el álbum aún no tiene fotos. */
  fallback: GalleryPhoto[]
}

export type GalleryResponse = {
  category: GalleryCategoryId
  label: string
  source: 'remote' | 'local' | 'empty'
  albums: { title: string; url: string }[]
  photos: GalleryPhoto[]
}

export const galleryCategories: GalleryCategory[] = [
  {
    id: 'fotos-sitio',
    title: 'Fotos del sitio',
    description: 'Material oficial para portadas, prensa y redes.',
    albums: [{ id: '72177720336030201', title: 'Fotos Sitio' }],
    fallback: [],
  },
  {
    id: 'tocatas',
    title: 'Tocatas',
    description: 'Shows en vivo — en camino, el artista está armando este álbum en Flickr.',
    albums: [],
    fallback: [],
  },
  {
    id: 'arte-ropa',
    title: 'Otras artes y ropa',
    description: 'Styling, piezas intervenidas y dirección de arte — en camino.',
    albums: [],
    fallback: [],
  },
  {
    id: 'otra-richii',
    title: 'Otra Richii',
    description: 'Archivo personal del artista — en camino.',
    albums: [],
    fallback: [],
  },
]
