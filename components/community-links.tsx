import { ArrowUpRight } from 'lucide-react'
import { COMMUNITY } from '@/lib/site-data'

export function CommunityLinks() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {COMMUNITY.map((c) => (
        <li key={c.name}>
          <a
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="glass group flex min-h-32 flex-col justify-between gap-6 rounded-xl p-5 transition-colors hover:border-primary/50 hover:bg-white/[0.04] sm:min-h-40 sm:p-6"
          >
            <span className="flex items-start justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{c.handle}</span>
              <ArrowUpRight
                className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </span>
            <span className="flex items-end justify-between gap-4">
              <span className="font-display text-4xl font-light uppercase leading-none tracking-tight text-foreground">
                {c.name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{c.action}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
