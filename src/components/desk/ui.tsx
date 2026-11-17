import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/desk/types";

/** Small shared pieces for the desk screens. No hooks, so server and client components can use them. */

export function Chip({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return <span className={cn("chip", `chip--${tone}`, className)}>{children}</span>;
}

export function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** A titled panel. `aside` sits on the title row, right-aligned (a state chip, a count). */
export function Section({
  title,
  intro,
  aside,
  children,
  className,
}: {
  title: string;
  intro?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("desk-panel p-5 sm:p-7", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="text-[18px] font-semibold tracking-[-0.025em]">{title}</h2>
        {aside && <div className="ml-auto flex flex-wrap items-center gap-2">{aside}</div>}
      </div>
      {intro && <p className="mt-1.5 max-w-[72ch] text-[14px] leading-relaxed text-fg-2">{intro}</p>}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** A note that explains a rule. Lavender wash, no icon soup. */
export function RuleNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[14px] border border-[rgb(var(--accent-rgb)/0.22)] bg-[rgb(var(--accent-rgb)/0.07)] px-4 py-3 text-[13.5px] leading-relaxed text-fg-2">
      {children}
    </p>
  );
}

/** A row of figures separated by hairlines. Used for the register and dashboard totals. */
export function Figures({ items }: { items: [string, string | number][] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
      {items.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1.5 bg-ink-2 px-5 py-4">
          <dt className="order-2 text-[13px] text-fg-2">{label}</dt>
          <dd className="order-1 text-[28px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** "Operator 1, 16 Nov 2026" for who set a value, or nothing if unknown. */
export function Attribution({ by, at, names, prefix = "By" }: { by?: string; at?: string; names: Record<string, string>; prefix?: string }) {
  if (!by) return null;
  return (
    <span className="text-[12.5px] text-fg-3">
      {prefix} <span className="font-semibold text-fg-2">{names[by] ?? by}</span>
      {at ? `, ${fmtDate(at)}` : ""}
    </span>
  );
}
