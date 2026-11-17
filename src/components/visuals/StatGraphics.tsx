import { cos, sin } from "@/lib/trig";

/**
 * Small looping graphics for the stats strip, one per fact (CSS loops in globals.css: .st-*,
 * stopped under reduced motion). Drawn in currentColor / the accent, 72px square.
 *   ServicesGraphic    a 4×2 grid of tiles lighting one after another: eight services
 *   ExpertiseGraphic   twelve dots in a ring with light running round: twelve areas of expertise
 *   DimensionsGraphic  five rings rippling outwards, as on the emblem: five dimensions
 */
export function ServicesGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 40" className={className} aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x={(i % 4) * 18 + 1}
          y={Math.floor(i / 4) * 20 + 1}
          width="14"
          height="16"
          rx="4"
          className="st-blink"
          fill="var(--color-signal)"
          style={{ animationDelay: `${i * 0.22}s` }}
        />
      ))}
    </svg>
  );
}

export function ExpertiseGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="-36 -36 72 72" className={className} aria-hidden>
      <circle r="27" fill="none" stroke="rgb(var(--fg-rgb) / 0.12)" strokeWidth="1" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={cos(a) * 27} cy={sin(a) * 27} r="3.6" className="st-blink" fill="var(--color-signal)" style={{ animationDelay: `${i * 0.15}s` }} />;
      })}
      <circle r="5" fill="var(--color-fg)" />
    </svg>
  );
}

export function DimensionsGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="-36 -36 72 72" className={className} aria-hidden>
      {[7, 14, 21, 28, 34].map((r, i) => (
        <circle key={r} r={r} fill="none" stroke="var(--color-signal)" strokeWidth="1.4" className="st-ripple" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
      <circle r="3.5" fill="var(--color-fg)" />
    </svg>
  );
}
