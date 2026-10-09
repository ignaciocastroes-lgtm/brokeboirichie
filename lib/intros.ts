import { LATEST_RELEASE } from './site-data'

/**
 * Plantilla de "despliegue" por lanzamiento (acordado 2026-10-09): cada vez que el artista saca
 * un tema nuevo, la intro de 8-10s se arma con el mismo molde — un fragmento del videoclip oficial
 * (el momento más melódico/intenso, elegido a mano) + el mismo tratamiento de color y bisel de
 * título — y el sitio la muestra automáticamente porque lee `LATEST_RELEASE` de lib/site-data.ts.
 *
 * Para publicar la intro del próximo single:
 *   1. Poner el clip (8-10s, ya recortado del video oficial) en /public/intro/<release-id>.mp4
 *      y una miniatura /public/intro/<release-id>-poster.jpg.
 *   2. Agregar una entrada acá con ese mismo `id` de lib/site-data.ts (RELEASES).
 * Si el último lanzamiento no tiene entrada todavía, la intro simplemente no se muestra — nunca
 * se cae ni muestra un video equivocado.
 */
export type ReleaseIntro = {
  releaseId: string
  video: string
  poster: string
}

export const RELEASE_INTROS: ReleaseIntro[] = [
  {
    releaseId: 'old-money',
    video: '/intro/old-money.mp4',
    poster: '/intro/old-money-poster.jpg',
  },
]

export function getLatestIntro(): ReleaseIntro | null {
  return RELEASE_INTROS.find((intro) => intro.releaseId === LATEST_RELEASE.id) ?? null
}
