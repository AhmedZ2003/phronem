import { CardLines } from "@/components/visuals/StepIcons";
import { cn } from "@/lib/cn";

type Props = {
  /** The icon shown in the round badge (22px, inherits the lavender accent). */
  icon: React.ReactNode;
  /** Replaces the default slowly turning line art, e.g. with a scroll-driven motion.div. */
  lines?: React.ReactNode;
  /** A photo across the top of the card; the icon badge then sits on its lower edge. */
  media?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/**
 * The reference's how-work card (.hw-card-block), shared by "From question to record" and the
 * services slideshow: a 1.3px edge (--card-edge → --card-edge-end at 126°), a --card-body body
 * (opaque in dark mode, translucent white in light mode so the card blends in; no backdrop blur,
 * which would have to be redone every frame over the animated background), a soft
 * lavender glow in the top-left corner, a round icon badge, and line art turning in the
 * bottom-right corner.
 */
export function GlowCard({ icon, lines, media, className, children }: Props) {
  return (
    <div
      className={cn("rounded-[25px] p-[1.3px]", className)}
      style={{ background: "linear-gradient(126deg, var(--card-edge), var(--card-edge-end) 50%)" }}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] bg-[var(--card-body)] px-[28px] pb-[34px] pt-[38px]">
        <div aria-hidden className="absolute -left-8 -top-8 size-[97px] rounded-full bg-signal opacity-25" style={{ filter: "blur(78px)" }} />
        {lines ?? (
          <div aria-hidden className="spin-slow pointer-events-none absolute -bottom-[201px] -right-[201px] size-[402px]" style={{ animationDuration: "60s" }}>
            <CardLines className="size-full" />
          </div>
        )}

        {media && (
          <div className="relative -mx-[28px] -mt-[38px] aspect-[16/10] overflow-hidden">
            {media}
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,var(--color-ink-3))]" />
          </div>
        )}

        <span
          className={cn("relative grid size-[50px] shrink-0 place-items-center rounded-full p-px", media && "z-10 -mt-[25px]")}
          style={{ background: "linear-gradient(140deg, rgb(var(--accent-rgb) / 0.9), rgb(var(--accent-rgb) / 0.1) 70%)" }}
        >
          <span className="grid size-full place-items-center rounded-full border-2 border-ink bg-ink-4 text-signal shadow-[0_5.6px_11px_rgb(var(--shadow-rgb)/0.25)]">
            {icon}
          </span>
        </span>

        {children}
      </div>
    </div>
  );
}
