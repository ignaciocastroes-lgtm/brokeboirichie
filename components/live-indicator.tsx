export function LiveIndicator({ label = 'Reproduciendo' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-live">
      <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
        {[0, 0.2, 0.4, 0.1].map((delay, i) => (
          <span key={i} className="eq-bar h-full w-[2px] rounded-full bg-live" style={{ animationDelay: `${delay}s` }} />
        ))}
      </span>
      {label}
    </span>
  )
}
