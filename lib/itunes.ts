const REX_COLLECTION_ID = '1829738289'

export type ItunesTrack = {
  id: string
  title: string
  previewUrl: string | null
  artwork: string | null
  durationMs: number | null
  trackNumber: number | null
}

function slugify(title: string) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes: Ñ, á, í...
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * Trae los previews de 30s reales del álbum REX directo desde la API pública
 * de iTunes (sin API key). Se cachea 6h en el servidor (revalidate) para no
 * pegarle a Apple en cada visita y para blindarse del rate limit no oficial
 * de esa API (~20 req/min por IP).
 */
export async function fetchRexPreviews(): Promise<ItunesTrack[]> {
  const url = `https://itunes.apple.com/lookup?id=${REX_COLLECTION_ID}&entity=song&country=CL`
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 6 } })
  if (!res.ok) throw new Error(`iTunes lookup falló: ${res.status}`)

  const data = (await res.json()) as { results: Array<Record<string, unknown>> }

  return data.results
    .filter((r) => r.wrapperType === 'track')
    .map((r) => {
      const artwork100 = (r.artworkUrl100 as string | undefined) ?? null
      return {
        id: slugify(r.trackName as string),
        title: r.trackName as string,
        previewUrl: (r.previewUrl as string | undefined) ?? null,
        artwork: artwork100 ? artwork100.replace('100x100bb', '600x600bb') : null,
        durationMs: (r.trackTimeMillis as number | undefined) ?? null,
        trackNumber: (r.trackNumber as number | undefined) ?? null,
      }
    })
    .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
}
