import { NextResponse } from 'next/server'
import { fetchRexPreviews } from '@/lib/itunes'

export async function GET() {
  try {
    const tracks = await fetchRexPreviews()
    return NextResponse.json({ tracks }, { headers: { 'Cache-Control': 's-maxage=21600' } })
  } catch (error) {
    console.error('[api/tracks]', error)
    // Si Apple falla o nos rate-limitea, el cliente cae a los snippets locales / links de streaming.
    return NextResponse.json({ tracks: [], error: 'itunes_lookup_failed' }, { status: 502 })
  }
}
