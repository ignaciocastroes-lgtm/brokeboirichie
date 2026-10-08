'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { TRACKS, type Release } from '@/lib/site-data'

type TurntableState = {
  queued: Release | null
  trackId: string
  queue: (release: Release) => void
  selectTrack: (id: string) => void
}

const TurntableContext = createContext<TurntableState | null>(null)

export function TurntableProvider({ children }: { children: React.ReactNode }) {
  const [queued, setQueued] = useState<Release | null>(null)
  const [trackId, setTrackId] = useState(TRACKS[0].id)

  const queue = useCallback((release: Release) => {
    setQueued(release)
    if (release.trackId) setTrackId(release.trackId)
    document.getElementById('tornamesa')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const selectTrack = useCallback((id: string) => {
    setTrackId(id)
    setQueued(null)
  }, [])

  const value = useMemo(() => ({ queued, trackId, queue, selectTrack }), [queued, trackId, queue, selectTrack])
  return <TurntableContext.Provider value={value}>{children}</TurntableContext.Provider>
}

export function useTurntable() {
  const ctx = useContext(TurntableContext)
  if (!ctx) throw new Error('useTurntable must be used inside TurntableProvider')
  return ctx
}
