import { ArrowUpRight } from 'lucide-react'
import { PLATFORMS } from '@/lib/site-data'

export function PlatformHub() {
  return (
    <ul className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-3">
      {PLATFORMS.map((p) => (
        <li key={p.name} className="last:min-[400px]:col-span-2 last:sm:col-span-1">
          <a
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="glass group flex min-h-16 items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors hover:border-primary/50 hover:bg-primary/[0.08] active:bg-primary/[0.12]"
          >
            <span className="flex flex-col">
              <span className="font-display text-lg uppercase tracking-wide text-foreground">{p.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{p.handle}</span>
            </span>
            <ArrowUpRight
              className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
            <span className="sr-only">(abre en una nueva pestaña)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
