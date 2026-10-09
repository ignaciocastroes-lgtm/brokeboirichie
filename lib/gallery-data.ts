import type { GalleryCategory, GalleryPhoto, GalleryResponse } from './gallery'
import { fetchAlbumPhotos, interleave, resolveAlbums } from './flickr'
import { siteConfig } from './site-config'

const MAX_PHOTOS = 36

/**
 * Arma la galería de una categoría desde el Flickr real del artista. A diferencia de GABOFOTOS,
 * acá no hay panel de admin/Supabase todavía — es solo Flickr + respaldo local. Nunca lanza error:
 * si el álbum aún no existe o Flickr falla, devuelve `source: 'empty'` y la UI lo explica.
 */
export async function loadCategoryGallery(category: GalleryCategory): Promise<GalleryResponse> {
  const userId = siteConfig.flickr.userId
  const albums = resolveAlbums(category.albums)

  const results = await Promise.allSettled(albums.map((album) => fetchAlbumPhotos(album.id, userId)))

  const lists: GalleryPhoto[][] = []
  for (const result of results) {
    if (result.status === 'fulfilled') lists.push(result.value)
    else console.error('[flickr]', result.reason)
  }
  const deFlickr = interleave(lists, MAX_PHOTOS)

  const photos = deFlickr.length > 0 ? deFlickr : category.fallback
  const source: GalleryResponse['source'] = deFlickr.length > 0 ? 'remote' : photos.length > 0 ? 'local' : 'empty'

  return {
    category: category.id,
    label: category.title,
    source,
    albums: albums.map((album) => ({ title: album.title, url: `${siteConfig.flickr.albumsUrl}${album.id}` })),
    photos,
  }
}
