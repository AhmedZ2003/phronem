import { sampleRecord } from "@/content/site";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

/**
 * A real, readable Decision Confidence Record (the product itself), using the illustrative
 * example from the Phronem site. Shown floating in the hero in place of a phone mockup.
 */
export function RecordCard({ className }: { className?: string }) {
  const r = sampleRecord;
  return (
    <article
      aria-label={`${r.kicker}, illustrative example`}
      className={cn("rounded-[var(--radius-panel)] border border-line bg-ink-2/90 p-5 text-left shadow-[0_30px_80px_-30px_rgb(var(--violet-rgb)/0.45)] sm:p-6", className)}
    >
      <header className="flex items-center gap-3">
        <LogoMark className="size-7" />
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-2">{r.kicker}</p>
      </header>

      <dl className="mt-5 grid gap-4">
        <div>
          <dt className="text-xs text-fg-3">Decision</dt>
          <dd className="mt-1 text-[15px] leading-snug text-fg">{r.decision}</dd>
        </div>
        <div className="grid grid-cols-[1fr_auto] items-end gap-4">
          <div>
            <dt className="text-xs text-fg-3">Recommendation</dt>
            <dd className="mt-1 text-sm leading-snug text-fg-2">{r.recommendation}</dd>
          </div>
          <div className="text-right">
            <dt className="text-xs text-fg-3">Confidence</dt>
            <dd className="mt-1 rounded-[var(--radius-chip)] border border-line-strong px-2.5 py-1 font-mono text-xs text-signal">
              {r.confidence}
            </dd>
          </div>
        </div>
      </dl>

      <ul className="mt-5 divide-y divide-line border-t border-line">
        {r.dimensions.map((d) => (
          <li key={d.name} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 py-2 text-[12.5px] leading-snug">
            <span className="text-fg-2">{d.name}</span>
            <span className="text-fg-3">{d.reading}</span>
          </li>
        ))}
      </ul>

      <footer className="mt-4 flex flex-wrap items-baseline justify-between gap-2 text-[11.5px] text-fg-3">
        <span className="text-fg-2">{r.changeIf}</span>
        <span>{r.caption}</span>
      </footer>
    </article>
  );
}
