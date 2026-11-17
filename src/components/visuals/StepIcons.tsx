import { cos, sin } from "@/lib/trig";
/**
 * Line-art step icons for "From question to record", in the spirit of the reference's
 * geometric card icons (asterisk, isometric hexagon, flower, triquetra): thin single-weight
 * strokes, pure geometry, drawn on a 24×24 grid and shown at 22px inside a 50px badge.
 *
 *   frame    an eight-ray asterisk in a circle: the question at the centre
 *   source   a hexagon of six nodes, each tied to the centre: experts found for the question
 *   vet      three interlocking circles: identity, role and experience, checked together
 *   engage   three crossing orbits: people meeting around one question
 *   record   five equal rings and a spoke: the record and its five dimensions
 */
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

function Frame() {
  const rays = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
  return (
    <>
      <circle cx="12" cy="12" r="10" {...base} strokeOpacity={0.55} />
      {rays.map((a, i) => (
        <line key={i} x1={12 + cos(a) * 2.2} y1={12 + sin(a) * 2.2} x2={12 + cos(a) * 7.6} y2={12 + sin(a) * 7.6} {...base} />
      ))}
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
    </>
  );
}

function Source() {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3 - Math.PI / 2;
    return [12 + cos(a) * 9, 12 + sin(a) * 9] as const;
  });
  return (
    <>
      <polygon points={pts.map((p) => p.join(",")).join(" ")} {...base} strokeOpacity={0.55} />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <line x1="12" y1="12" x2={x} y2={y} {...base} />
          <circle cx={x} cy={y} r="1.2" fill="currentColor" />
        </g>
      ))}
      <circle cx="12" cy="12" r="1.6" {...base} />
    </>
  );
}

function Vet() {
  const c = Array.from({ length: 3 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
    return [12 + cos(a) * 3.6, 12 + sin(a) * 3.6] as const;
  });
  return (
    <>
      {c.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5.6" {...base} />
      ))}
      <circle cx="12" cy="12" r="10.4" {...base} strokeOpacity={0.4} />
    </>
  );
}

function Engage() {
  return (
    <>
      {[0, 60, 120].map((deg) => (
        <ellipse key={deg} cx="12" cy="12" rx="10" ry="3.8" transform={`rotate(${deg} 12 12)`} {...base} />
      ))}
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    </>
  );
}

function Record() {
  return (
    <>
      {[2.2, 4.2, 6.2, 8.2, 10.2].map((r, i) => (
        <circle key={r} cx="12" cy="12" r={r} {...base} strokeOpacity={0.35 + i * 0.13} />
      ))}
      <line x1="12" y1="12" x2="19.2" y2="4.8" {...base} />
      <circle cx="19.2" cy="4.8" r="1.2" fill="currentColor" />
    </>
  );
}

export const stepIcons = { frame: Frame, source: Source, vet: Vet, engage: Engage, record: Record } as const;
export type StepIconName = keyof typeof stepIcons;

export function StepIcon({ name, className }: { name: StepIconName; className?: string }) {
  const Glyph = stepIcons[name];
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <Glyph />
    </svg>
  );
}

/**
 * The faint curved lines in each card's lower-right corner (the reference uses a flower-of-life
 * line image, 402px, centred on the card's bottom-right corner). Six large circles around a point.
 */
export function CardLines({ className }: { className?: string }) {
  const circles = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3;
    return [201 + cos(a) * 70, 201 + sin(a) * 70] as const;
  });
  return (
    <svg viewBox="0 0 402 402" className={className} aria-hidden fill="none">
      {circles.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="120" stroke="rgb(var(--fg-rgb) / 0.08)" strokeWidth="1" />
      ))}
      <circle cx="201" cy="201" r="190" stroke="rgb(var(--fg-rgb) / 0.05)" strokeWidth="1" />
    </svg>
  );
}
