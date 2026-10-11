export const SPOTIFY_URL = 'https://open.spotify.com/intl-es/artist/4v2UPYBvEr4S5rOerwXBPR'
export const APPLE_MUSIC_URL = 'https://music.apple.com/cl/album/rex/1829738289'
/** SmartLink oficial de ONErpm para "Rex": agrupa Spotify, Apple Music, Deezer, YouTube Music, Tidal, Anghami y Boomplay. */
export const ONERPM_URL = 'https://onerpm.link/271027579511'
export const YOUTUBE_URL = 'https://www.youtube.com/@brokeboirichie'
export const YOUTUBE_SUBSCRIBE_URL = `${YOUTUBE_URL}?sub_confirmation=1`

/**
 * Contacto de management/booking — NO es el teléfono personal del artista, es el canal de su
 * manager. Confirmado explícitamente por Ignacio el 2026-10-09. Se publica como vía de contacto
 * para marcas/prensa/booking, nunca etiquetado como "contacto directo con el artista".
 */
export const MANAGEMENT_PHONE_DISPLAY = '+56 9 8488 3373'
export const MANAGEMENT_WHATSAPP_URL = 'https://wa.me/56984883373'

/**
 * VENTA DE BEATS — el artista vende instrumentales a otros artistas a cambio de regalías.
 * Deuda técnica (2026-10-11): generar las 20 muestras reales de 10s con marca de sonido en
 * /herramientas/marca-de-beats (herramienta interna, no pública — corta el clip y mezcla la marca
 * de sonido del artista en el navegador, sin subir nada a ningún servidor), guardar el .wav
 * resultante en /public/beats/<id>.wav y completar bpm/key/price aquí. Con `src: null` la tarjeta
 * se muestra pero el botón de reproducir queda deshabilitado — nunca se inventa un preview.
 */
export type Beat = {
  id: string
  title: string
  bpm?: number
  key?: string
  price?: string
  /** Muestra de 10s con marca de sonido, alojada en /public/beats/ (ver /herramientas/marca-de-beats). null = pendiente. */
  src: string | null
}

export const BEATS_ROYALTY_NOTE =
  'Cada muestra dura 10 segundos y lleva marca de sonido (tag hablado) para proteger el instrumental. Licencias y condiciones de regalías se coordinan directo con el management.'

export const BEATS: Beat[] = Array.from({ length: 20 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0')
  return {
    id: `beat-${n}`,
    title: `[BEAT ${n} — A CONFIRMAR]`,
    src: null,
  }
})

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
  // [A CONFIRMAR] título real del último estreno — Ignacio: reemplazar antes de publicar.
  { id: 'HtE1f_ThtUc', title: '[ÚLTIMO ESTRENO — CONFIRMAR TÍTULO]', subtitle: 'Video Oficial · 2026' },
  { id: 'etFPyjR5U8E', title: 'Puras Malas', subtitle: 'Prod. Brokeboirichie' },
  { id: 'gvtANivEW7c', title: 'Empezar Denuevo', subtitle: 'Video Oficial' },
  { id: 'KECl-1VNFco', title: 'Exclusivos', subtitle: 'ft. Kerchak & HWII' },
  { id: 'HKODtllvWZM', title: 'Para Tí', subtitle: 'ft. 666ATA' },
  { id: 'lPZWAC-kq7Q', title: 'Zona Sur', subtitle: 'Video Oficial' },
]

export const NAV_LINKS = [
  { label: 'Videos', href: '#videos' },
  { label: 'Tornamesa REX', href: '#tornamesa' },
  { label: 'Venta de Beats', href: '#venta-de-beats' },
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

/** Correo de contacto público (prensa / marcas / booking general). Confirmado 2026-10-11. */
export const CONTACT_EMAIL: string | null = 'brokeboirichiebeats@gmail.com'

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
    meta: 'Videoclip · YouTube',
    cover: '/images/old-money.png',
    href: 'https://youtu.be/wpBCM6pMbu8',
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

/**
 * El primer release real (no `pending`) de la lista. La intro de entrada (components/intro-splash.tsx,
 * vía lib/intros.ts) siempre muestra el clip del release que esto apunte — al agregar un single
 * nuevo arriba de `RELEASES`, la intro cambia sola, sin tocar el componente.
 */
export const LATEST_RELEASE: Release = RELEASES.find((r) => !r.pending) ?? FEATURED_ALBUM
