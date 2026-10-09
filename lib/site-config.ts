/**
 * Cuenta real de Flickr del artista (confirmada vía chat de WhatsApp, 2026-10-09):
 * https://www.flickr.com/photos/205023176@N03/ — usuario "brokeboirichie" (Ricardo Paredes).
 * Él mismo sube y organiza sus fotos ahí; el sitio solo las lee (ver lib/gallery-data.ts).
 */
export const siteConfig = {
  flickr: {
    userId: process.env.FLICKR_USER_ID || '205023176@N03',
    albumsUrl: 'https://www.flickr.com/photos/205023176@N03/albums/',
  },
}
