export const SPOTIFY_URL = 'https://open.spotify.com/intl-es/artist/4v2UPYBvEr4S5rOerwXBPR'
export const APPLE_MUSIC_URL = 'https://music.apple.com/cl/album/rex/1829738289'
/** SmartLink oficial de ONErpm para "Rex": agrupa Spotify, Apple Music, Deezer, YouTube Music, Tidal, Anghami y Boomplay. */
export const ONERPM_URL = 'https://onerpm.link/271027579511'
export const YOUTUBE_URL = 'https://www.youtube.com/@brokeboirichie'
export const YOUTUBE_SUBSCRIBE_URL = `${YOUTUBE_URL}?sub_confirmation=1`

export type Track = {
  id: string
  title: string
  credit?: string
  /** Duración de la canción completa (no del snippet) */
  duration?: string
  tag?: string
  /** Snippet MP3 de 30s alojado en /public/snippets/ */
  src: string
}

/** Subir cada preview a /public/snippets/<id>.mp3 (30 segundos, 128–192 kbps). */
export const TRACKS: Track[] = [
  { id: 'puras-malas', title: 'Puras Malas', credit: 'Prod. Brokeboirichie', tag: '2026 Single' },
  { id: 'empezar-denuevo', title: 'Empezar Denuevo', credit: 'Prod. Khouyaprod', tag: '2026 Single' },
  { id: 'neri', title: 'Ñeri', credit: 'ft. Omacrac, frenesí', duration: '1:20' },
  { id: 'hold-up', title: 'Hold Up', credit: 'ft. Naxowo', duration: '1:52' },
  { id: 'conmigo-se-viene', title: 'Conmigo Se Viene', duration: '2:02' },
  { id: 'experiencia-inmersiva', title: 'Experiencia Inmersiva', credit: 'ft. Omacrac, frenesí', duration: '1:42' },
  { id: 'ciudad-gotica', title: 'Ciudad Gotica', credit: 'ft. Omacrac, Heirah', duration: '2:05' },
  { id: 'el-uno', title: 'El Uno', duration: '0:33' },
  { id: 'acme-freestyle', title: 'Acme Freestyle', credit: 'ft. Cyra', duration: '2:17' },
  { id: 'rexin', title: 'Rexin', credit: 'ft. Brokeboieme', duration: '2:18' },
  { id: 'rex', title: 'Rex', duration: '1:41' },
  { id: 'clasico-certificado', title: 'Clásico Certificado', credit: 'ft. Omacrac, frenesí', duration: '2:53' },
  { id: '808', title: '808', duration: '2:23' },
  { id: 'pollo-frito', title: 'Pollo Frito', credit: 'ft. Naxowo', duration: '2:31' },
].map((t) => ({ ...t, src: `/snippets/${t.id}.mp3` }))

export const PITCH_MODES = [
  { rate: 0.85, short: 'Slowed', label: 'Modo Slowed' },
  { rate: 1, short: 'Normal', label: 'Original Master' },
  { rate: 1.2, short: 'Sped Up', label: 'Modo Sped Up' },
] as const

export type Video = { id: string; title: string; subtitle: string }

export const VIDEOS: Video[] = [
  { id: 'etFPyjR5U8E', title: 'Puras Malas', subtitle: 'Prod. Brokeboirichie' },
  { id: 'gvtANivEW7c', title: 'Empezar Denuevo', subtitle: 'Video Oficial' },
  { id: 'KECl-1VNFco', title: 'Exclusivos', subtitle: 'ft. Kerchak & HWII' },
  { id: 'HKODtllvWZM', title: 'Para Tí', subtitle: 'ft. 666ATA' },
  { id: 'lPZWAC-kq7Q', title: 'Zona Sur', subtitle: 'Video Oficial' },
]

export const NAV_LINKS = [
  { label: 'Lanzamientos', href: '#lanzamientos' },
  { label: 'Tornamesa REX', href: '#tornamesa' },
  { label: 'Videos', href: '#videos' },
  { label: 'Lookbook', href: '#lookbook' },
  { label: 'Conectar', href: '#conectar' },
] as const

export const PLATFORMS = [
  { name: 'Spotify', handle: 'artist/brokeboirichie', href: SPOTIFY_URL },
  { name: 'Apple Music', handle: 'album/rex', href: 'https://music.apple.com/cl/album/rex/1829738289' },
  { name: 'YouTube', handle: '@brokeboirichie', href: YOUTUBE_URL },
  { name: 'YouTube Music', handle: '@brokeboirichie', href: 'https://music.youtube.com/@brokeboirichie' },
  { name: 'Instagram', handle: '@brokeboirichie', href: 'https://www.instagram.com/brokeboirichie/' },
] as const

export const INSTAGRAM_URL = 'https://www.instagram.com/brokeboirichie/'

export const LOOKBOOK_FILTERS = [
  { id: 'all', label: 'Todo el archivo' },
  { id: 'rex', label: 'Era REX Styling' },
  { id: 'custom', label: 'Custom Pieces & Siberia Collabs' },
  { id: 'backstage', label: 'Backstage & Zona Sur' },
] as const

export type LookbookCategory = Exclude<(typeof LOOKBOOK_FILTERS)[number]['id'], 'all'>

export type Look = {
  id: string
  number: string
  title: string
  category: LookbookCategory
  image: string
  alt: string
  /** Forma en la grilla asimétrica */
  shape: 'tall' | 'wide' | 'square'
  pieces: string[]
  direction: string
  concept: string
  /** Id de TRACKS que inspira el look (carga la Tornamesa REX) */
  trackId: string
}

/** Reemplazar `image` por las fotos reales de la sesión en /public/images/lookbook/. */
export const LOOKS: Look[] = [
  {
    id: 'look-01',
    number: 'Look 01',
    title: 'REX Archive Custom',
    category: 'rex',
    image: '/images/lookbook/look-01.png',
    alt: 'Brokeboirichie con chaqueta de mezclilla negra intervenida bajo un farol nocturno',
    shape: 'tall',
    pieces: ['Chaqueta denim negra intervenida a mano', 'Parches decolorados', 'Herrajes plata'],
    direction: 'Dirección visual: Brokeboirichie · Styling: Persona Errante',
    concept:
      'La chaqueta funciona como armadura del disco: desgastada, reparada y aún en pie. Cada parche es un tema de REX cosido sobre la misma prenda.',
    trackId: 'rex',
  },
  {
    id: 'look-02',
    number: 'Look 02',
    title: 'Zona Sur Street Armor',
    category: 'backstage',
    image: '/images/lookbook/look-02.png',
    alt: 'Retrato nocturno en calle de la Zona Sur con chaleco técnico y pasamontañas',
    shape: 'square',
    pieces: ['Chaleco técnico acolchado', 'Cargo negro', 'Pasamontañas abierto'],
    direction: 'Dirección visual: Brokeboirichie · Locación: San Bernardo',
    concept:
      'Capas para el frío de la madrugada en la periferia. Ropa funcional que habla del barrio sin disfrazarlo.',
    trackId: 'ciudad-gotica',
  },
  {
    id: 'look-03',
    number: 'Look 03',
    title: 'Drama Visual Era',
    category: 'custom',
    image: '/images/lookbook/look-03.png',
    alt: 'Primer plano con cadenas plateadas y polera pintada a mano con trazos violeta',
    shape: 'square',
    pieces: ['Polera blanca pintada a mano', 'Cadenas plata', 'Luz dura cenital'],
    direction: 'Dirección visual: Brokeboirichie · Pieza única intervenida',
    concept:
      'El trazo violeta es la melancolía del plugg hecha pintura: una prenda que no se repite, como un snippet que solo suena una vez.',
    trackId: 'experiencia-inmersiva',
  },
  {
    id: 'look-04',
    number: 'Look 04',
    title: 'Siberia Patchwork Hoodie',
    category: 'custom',
    image: '/images/lookbook/look-04.png',
    alt: 'Detalle de polerón patchwork negro y gris con costuras expuestas e imperdibles',
    shape: 'tall',
    pieces: ['Polerón patchwork reconstruido', 'Costuras expuestas', 'Bordado de corona'],
    direction: 'Colaboración Siberia [A CONFIRMAR CRÉDITOS] · Archivo de autor',
    concept:
      'Retazos de prendas viejas unidas en una sola: la misma lógica del sampleo. La corona bordada es el sello REX.',
    trackId: 'clasico-certificado',
  },
  {
    id: 'look-05',
    number: 'Look 05',
    title: 'Home Studio Sessions',
    category: 'backstage',
    image: '/images/lookbook/look-05.png',
    alt: 'Backstage en estudio casero con luz de monitores y audífonos',
    shape: 'wide',
    pieces: ['Oversized negro', 'Audífonos de estudio', 'Luz de monitor'],
    direction: 'Fotografía documental · Backstage REX',
    concept: 'Donde nace el sonido. Sin styling forzado: la ropa con la que se graba a las 4 AM.',
    trackId: 'acme-freestyle',
  },
  {
    id: 'look-06',
    number: 'Look 06',
    title: 'Persona Errante',
    category: 'rex',
    image: '/images/lookbook/look-06.png',
    alt: 'Figura solitaria con abrigo largo caminando por un paso sobre nivel en la niebla',
    shape: 'tall',
    pieces: ['Abrigo largo negro', 'Jeans wide leg', 'Botas gastadas'],
    direction: 'Dirección visual: Brokeboirichie · Still cinematográfico',
    concept:
      'El personaje que camina la ciudad de noche buscando sanar. Silueta larga, paso lento, como un tema slowed.',
    trackId: 'empezar-denuevo',
  },
]

export const POLL_ERAS = [
  { id: 'rex', label: 'REX' },
  { id: 'involucrao', label: 'Involucrao' },
  { id: 'trampa-romance', label: 'Trampa & Romance' },
  { id: 'drama', label: 'Drama' },
] as const

export type PollEra = (typeof POLL_ERAS)[number]['id']

export const COMMUNITY = [
  { name: 'Instagram', handle: '@brokeboirichie', action: 'Seguir', href: INSTAGRAM_URL },
  { name: 'YouTube', handle: '@brokeboirichie', action: 'Suscribirse', href: YOUTUBE_SUBSCRIBE_URL },
  { name: 'Spotify', handle: 'Brokeboirichie', action: 'Seguir', href: SPOTIFY_URL },
  { name: 'Apple Music', handle: 'REX · 2025', action: 'Escuchar', href: APPLE_MUSIC_URL },
] as const

/** Editar con los datos de la agencia/plataforma desarrolladora. */
export const DEVELOPER = {
  name: '[NOMBRE DE TU PLATAFORMA]',
  href: 'mailto:contacto@tuplataforma.com',
}

export type Release = {
  id: string
  title: string
  kind: 'Álbum' | 'Single' | 'EP' | 'Proyecto'
  year: string
  meta: string
  cover?: string
  href?: string
  /** Id del track en TRACKS que se carga en la Tornamesa REX */
  trackId?: string
  pending?: boolean
}

export const FEATURED_ALBUM: Release = {
  id: 'rex',
  title: 'REX',
  kind: 'Álbum',
  year: '2025',
  meta: '12 tracks',
  cover: '/images/rex-cover.png',
  href: APPLE_MUSIC_URL,
  trackId: 'neri',
}

/** Editar libremente: reemplazar `href` por el link directo al video / single cuando esté disponible. */
export const RELEASES: Release[] = [
  {
    id: 'old-money',
    title: 'OLD MONEY',
    kind: 'Single',
    year: 'Estreno',
    meta: 'A confirmar con el artista',
    cover: '/images/old-money.png',
    href: YOUTUBE_URL,
    pending: true,
  },
  {
    id: 'puras-malas',
    title: 'PURAS MALAS',
    kind: 'Single',
    year: 'Estreno',
    meta: 'Videoclip · YouTube',
    cover: '/images/puras-malas.png',
    href: 'https://www.youtube.com/watch?v=etFPyjR5U8E',
    trackId: 'puras-malas',
  },
  {
    id: 'empezar-denuevo',
    title: 'EMPEZAR DENUEVO',
    kind: 'Single',
    year: 'Estreno',
    meta: 'Videoclip · YouTube',
    cover: '/images/empezar-denuevo.png',
    href: 'https://www.youtube.com/watch?v=gvtANivEW7c',
    trackId: 'empezar-denuevo',
  },
  {
    id: 'proyecto-a-confirmar-1',
    title: '[PROYECTO / EP DESTACADO]',
    kind: 'EP',
    year: '—',
    meta: 'A confirmar con el artista',
    pending: true,
  },
  {
    id: 'proyecto-a-confirmar-2',
    title: '[PROYECTO / EP DESTACADO]',
    kind: 'Proyecto',
    year: '—',
    meta: 'A confirmar con el artista',
    pending: true,
  },
]
