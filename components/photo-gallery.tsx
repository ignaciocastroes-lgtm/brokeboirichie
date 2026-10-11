import { galleryCategories } from '@/lib/gallery'
import { loadCategoryGallery } from '@/lib/gallery-data'
import { GallerySplitView } from './gallery-split-view'

/**
 * Server component: trae las fotos reales de Flickr (o el respaldo local/estado vacío) y se las
 * pasa a la vista cliente GallerySplitView, que hace todo el trabajo visual/interactivo (patrón
 * "Split View con Foco Dinámico" pedido por el artista el 2026-10-11).
 */
export async function PhotoGallery() {
  const categories = await Promise.all(galleryCategories.map((c) => loadCategoryGallery(c)))
  return <GallerySplitView categories={categories} />
}
