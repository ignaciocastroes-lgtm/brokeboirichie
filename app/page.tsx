import { IntroSplash } from '@/components/intro-splash'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { DualDeckTurntable } from '@/components/dual-deck-turntable'
import { BeatsMarketplace } from '@/components/beats-marketplace'
import { VideoSection } from '@/components/video-section'
import { PhotoGallery } from '@/components/photo-gallery'
import { ConnectSection } from '@/components/connect-section'
import { SiteFooter } from '@/components/site-footer'
import { TurntableProvider } from '@/components/turntable-context'
import { ScrollReveal } from '@/components/scroll-reveal'
import { AmbientGlow } from '@/components/ambient-glow'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <TurntableProvider>
      <IntroSplash />
      <div aria-hidden="true" className="night-halos pointer-events-none fixed inset-0 -z-10" />
      <SiteHeader />
      <main className="min-h-dvh">
        <Hero />

        <ScrollReveal className="relative">
          <AmbientGlow tone="primary" position="top-left" />
          <VideoSection />
        </ScrollReveal>

        <ScrollReveal className="relative">
          <AmbientGlow tone="celestite" position="top-right" />
          <DualDeckTurntable />
        </ScrollReveal>

        <ScrollReveal className="relative">
          <AmbientGlow tone="astra" position="bottom-left" />
          <BeatsMarketplace />
        </ScrollReveal>

        <ScrollReveal className="relative">
          <AmbientGlow tone="mint" position="top-right" />
          <PhotoGallery />
        </ScrollReveal>

        <ScrollReveal className="relative">
          <AmbientGlow tone="primary" position="bottom-right" />
          <ConnectSection />
        </ScrollReveal>
      </main>
      <SiteFooter />
    </TurntableProvider>
  )
}
