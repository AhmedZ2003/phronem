import { cos, sin } from "@/lib/trig";
/**
 * The three looping line-art icons that sit inside the manifesto's word tiles
 * (the reference uses line-art Lottie loops in the same place). Pure SVG + CSS keyframes from
 * globals.css, simple geometry only, and each one stands for part of the method:
 *
 *   OrbitGlyph     a panel: three orbits turning around one point
 *   RingsGlyph     the five dimensions: five rings breathing in sequence
 *   ConvergeGlyph  judgments: nine points travelling into one record
 *
 * All animation stops under prefers-reduced-motion (globals.css).
 */
const stroke = { stroke: "currentColor", strokeWidth: 1.2, fill: "none", vectorEffect: "non-scaling-stroke" as const };

export function OrbitGlyph() {
  return (
    <svg viewBox="-50 -50 100 100" className="size-full" aria-hidden>
      <g className="glyph-spin">
        {[0, 60, 120].map((deg) => (
          <ellipse key={deg} rx="38" ry="14" transform={`rotate(${deg})`} {...stroke} strokeOpacity="0.8" />
        ))}
      </g>
      <circle r="3.5" fill="var(--color-signal)" />
    </svg>
  );
}

export function RingsGlyph() {
  return (
    <svg viewBox="-50 -50 100 100" className="size-full" aria-hidden>
      {[8, 16, 24, 32, 40].map((r, i) => (
        <circle key={r} r={r} {...stroke} className="glyph-breathe" style={{ animationDelay: `${i * 0.28}s` }} />
      ))}
    </svg>
  );
}

export function ConvergeGlyph() {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
    return { x: cos(a) * 38, y: sin(a) * 38 };
  });
  return (
    <svg viewBox="-50 -50 100 100" className="size-full" aria-hidden>
      <circle r="38" {...stroke} strokeOpacity="0.35" />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="currentColor"
          className="glyph-converge"
          style={{ ["--gx" as string]: `${-p.x}px`, ["--gy" as string]: `${-p.y}px`, animationDelay: `${i * 0.16}s` }}
        />
      ))}
      <circle r="4.5" fill="var(--color-signal)" />
    </svg>
  );
}

export const glyphs = { orbit: OrbitGlyph, rings: RingsGlyph, converge: ConvergeGlyph } as const;
export type GlyphName = keyof typeof glyphs;
