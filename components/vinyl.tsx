import Image from 'next/image'

const SECONDS_PER_REVOLUTION = 1.8

export function Vinyl({ isPlaying, rate }: { isPlaying: boolean; rate: number }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-[4%] right-[10%] rounded-full bg-black/40 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]">
        <div
          aria-hidden="true"
          className="vinyl-grooves size-full animate-spin rounded-full motion-reduce:animate-none"
          style={{
            animationDuration: `${SECONDS_PER_REVOLUTION / rate}s`,
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}
        >
          <div className="absolute inset-[31%] overflow-hidden rounded-full border border-white/[0.08]">
            <Image src="/images/rex-cover.png" alt="" fill sizes="160px" className="object-cover opacity-80" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/45 text-center">
              <span className="font-display text-2xl font-light uppercase leading-none text-foreground sm:text-3xl">REX</span>
              <span className="mt-1 font-mono text-[7px] uppercase tracking-[0.18em] text-foreground/80 sm:text-[8px]">
                {'// Brokeboirichie'}
              </span>
            </div>
            <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute right-[3%] top-[3%] h-[64%] w-[10%] origin-top transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `rotate(${isPlaying ? 24 : 2}deg)` }}
      >
        <div className="absolute left-1/2 top-0 size-full -translate-x-1/2">
          <div className="absolute left-1/2 top-0 aspect-square w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.12] bg-card shadow-lg" />
          <div className="absolute left-1/2 top-0 h-[88%] w-[10%] -translate-x-1/2 rounded-full bg-foreground/70" />
          <div className="absolute bottom-0 left-1/2 h-[14%] w-[45%] -translate-x-1/2 rounded-sm border border-white/[0.15] bg-secondary" />
        </div>
      </div>
    </div>
  )
}
