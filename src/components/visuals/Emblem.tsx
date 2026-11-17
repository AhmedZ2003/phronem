import { cn } from "@/lib/cn";
import { cos, sin } from "@/lib/trig";

/**
 * Phronem's line-art emblem, in place of the reference's flower-of-life logo Lottie:
 * five equal rings (the five dimensions, deliberately unweighted), nine panel nodes on the outer
 * ring, and a spoke from each node to the centre (independent judgments, aggregated).
 * Every stroke uses pathLength=1 so it can be drawn by animating stroke-dashoffset 1 → 0.
 */
export const RINGS = [34, 62, 90, 118, 146];
export const NODES = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
  return { x: 160 + cos(a) * 146, y: 160 + sin(a) * 146 };
});

export function Emblem({ className, draw = "none" }: { className?: string; draw?: "none" | "css" }) {
  return (
    <svg viewBox="0 0 320 320" className={cn("overflow-visible", className)} aria-hidden fill="none">
      <g data-emblem-rings>
        {RINGS.map((r, i) => (
          <circle
            key={r}
            data-emblem-ring
            cx="160"
            cy="160"
            r={r}
            pathLength={1}
            stroke="currentColor"
            strokeWidth={i === RINGS.length - 1 ? 1.4 : 1}
            strokeOpacity={0.35 + i * 0.12}
            className={draw === "css" ? "emblem-draw" : undefined}
            style={draw === "css" ? { animationDelay: `${0.1 + i * 0.12}s` } : undefined}
            transform="rotate(-90 160 160)"
          />
        ))}
      </g>
      <g data-emblem-spokes>
        {NODES.map((n, i) => (
          <line
            key={i}
            data-emblem-spoke
            x1={n.x}
            y1={n.y}
            x2="160"
            y2="160"
            pathLength={1}
            stroke="var(--color-signal)"
            strokeOpacity="0.55"
            strokeWidth="1"
            className={draw === "css" ? "emblem-draw" : undefined}
            style={draw === "css" ? { animationDelay: `${0.7 + i * 0.05}s` } : undefined}
          />
        ))}
      </g>
      <g data-emblem-nodes>
        {NODES.map((n, i) => (
          <circle
            key={i}
            data-emblem-node
            cx={n.x}
            cy={n.y}
            r="5"
            fill="var(--color-ink)"
            stroke="var(--color-signal)"
            strokeWidth="1.6"
            className={draw === "css" ? "emblem-pop" : undefined}
            style={{ transformOrigin: `${n.x}px ${n.y}px`, ...(draw === "css" ? { animationDelay: `${0.6 + i * 0.05}s` } : {}) }}
          />
        ))}
      </g>
      <circle data-emblem-core cx="160" cy="160" r="6" fill="var(--color-fg)" />
    </svg>
  );
}
