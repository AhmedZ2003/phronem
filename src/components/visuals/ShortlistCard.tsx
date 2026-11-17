import { Check, SealCheck, UserCircle } from "@phosphor-icons/react";
import { heroShortlist } from "@/content/site";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

const statusStyle: Record<string, string> = {
  Scheduled: "border-signal/60 bg-signal/15 text-signal",
  Vetted: "border-line-strong text-fg",
  "In review": "border-dashed border-line-strong text-fg-3",
};

/**
 * The hero card, in place of the reference's phone: an expert shortlist for a client request,
 * which is what an expert network delivers. The brief, four experts by role and experience with
 * their status, the vetting checks every one passes, and sourcing progress. Illustrative,
 * labelled fictional; experts are shown by role and an ID, never a name.
 */
export function ShortlistCard({ className }: { className?: string }) {
  const s = heroShortlist;
  const pct = Math.round((s.progress.done / s.progress.total) * 100);

  return (
    <article
      aria-label={`${s.kicker}, illustrative example`}
      className={cn("rounded-[var(--radius-panel)] border border-line bg-ink-2/90 p-5 text-left shadow-[0_30px_80px_-30px_rgb(var(--violet-rgb)/0.45)] sm:p-6", className)}
    >
      <header className="flex items-center gap-3">
        <LogoMark className="size-7" />
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-2">{s.kicker}</p>
      </header>

      <div className="mt-5">
        <p className="text-xs text-fg-3">{s.requestLabel}</p>
        <p className="mt-1 text-[15px] leading-snug text-fg">{s.request}</p>
      </div>

      <ul className="mt-5 divide-y divide-line border-y border-line">
        {s.experts.map((e) => (
          <li key={e.id} className="flex items-center gap-3 py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-ink-4 text-fg-2">
              <UserCircle aria-hidden weight="light" className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] leading-snug text-fg">{e.role}</span>
              <span className="block font-mono text-[10.5px] text-fg-3">
                {e.id} · {e.years}
              </span>
            </span>
            <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]", statusStyle[e.status])}>
              {e.status === "Vetted" && <SealCheck aria-hidden weight="fill" className="size-3 text-signal" />}
              {e.status}
            </span>
          </li>
        ))}
      </ul>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {s.checks.map((c) => (
          <li key={c} className="inline-flex items-center gap-1 rounded-[var(--radius-chip)] bg-fg/5 px-2 py-1 text-[11px] text-fg-2">
            <Check aria-hidden weight="bold" className="size-3 text-signal" />
            {c}
          </li>
        ))}
      </ul>

      <footer className="mt-4">
        <div className="flex items-baseline justify-between text-[11.5px] text-fg-3">
          <span className="text-fg-2">
            {s.progress.done} of {s.progress.total} {s.progress.label}
          </span>
          <span>{s.caption}</span>
        </div>
        <div aria-hidden className="mt-2 h-1 overflow-hidden rounded-full bg-fg/10">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-marine-2),var(--color-signal))]" style={{ width: `${pct}%` }} />
        </div>
      </footer>
    </article>
  );
}
