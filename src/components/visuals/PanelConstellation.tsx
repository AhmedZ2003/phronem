import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { expertsBand } from "@/content/site";
import { LogoMark } from "@/components/ui/Logo";

/**
 * The expert panel as a constellation, for "Join the Phronem expert panel": role chips (illustrative)
 * float in orbit, each tied to the Phronem core by a line along which light flows inward (a view
 * travelling into the record). Counter-rotating dashed rings and faint unlabelled stars fill it out.
 * Chips and lines share one percentage coordinate space, so they stay joined at every size.
 * CSS loops (globals.css: .xp-*, .hw-float, .spin-slow) stop under reduced motion.
 */
const chips = [
  { x: 20, y: 16 },
  { x: 80, y: 13 },
  { x: 90, y: 54 },
  { x: 70, y: 88 },
  { x: 14, y: 74 },
];
const specks = [
  { x: 44, y: 6 },
  { x: 96, y: 32 },
  { x: 4, y: 44 },
  { x: 42, y: 95 },
  { x: 60, y: 30 },
  { x: 32, y: 60 },
];

export function PanelConstellation() {
  return (
    <div className="relative mx-auto aspect-[10/9] w-full max-w-[520px]" aria-hidden>
      {/* Rings */}
      <div className="spin-slow absolute inset-[14%] rounded-full border border-dashed border-signal/25" style={{ animationDuration: "40s" }} />
      <div className="spin-slow absolute inset-[26%] rounded-full border border-dashed border-signal/20" style={{ animationDuration: "28s", animationDirection: "reverse" }} />
      <div className="absolute inset-[36%] rounded-full bg-[radial-gradient(circle,rgb(var(--violet-rgb)/0.55),transparent_70%)] blur-xl" />

      {/* Lines from each chip into the core */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
        {chips.map((c, i) => (
          <g key={i}>
            <line x1={c.x} y1={c.y} x2="50" y2="50" stroke="rgb(var(--accent-rgb) / 0.18)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line
              x1={c.x}
              y1={c.y}
              x2="50"
              y2="50"
              stroke="var(--color-signal)"
              strokeWidth="1.4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              className="xp-flow"
              style={{ animationDelay: `${i * 0.7}s` }}
            />
          </g>
        ))}
      </svg>

      {/* Unlabelled stars: the rest of the network */}
      {specks.map((s, i) => (
        <span
          key={i}
          className="xp-twinkle absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_10px_rgb(var(--accent-rgb)/0.8)]"
          style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${i * 0.5}s` }}
        />
      ))}

      {/* Core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="xp-pulse absolute inset-0 rounded-full" />
        <span className="relative grid size-[92px] place-items-center rounded-full p-px" style={{ background: "linear-gradient(140deg, var(--color-signal), rgb(var(--nebula-pink-rgb) / 0.5) 60%, transparent)" }}>
          <span className="grid size-full place-items-center rounded-full bg-ink shadow-[0_0_40px_rgb(var(--violet-rgb)/0.7)]">
            <LogoMark className="size-11" />
          </span>
        </span>
      </div>

      {/* Role chips */}
      {chips.map((c, i) => (
        <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
          <span
            className="hw-float flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-ink-3/85 p-1.5 text-[12px] sm:pr-3 text-fg shadow-[0_10px_30px_-12px_rgb(var(--shadow-rgb)/0.9)]"
            style={{ animationDelay: `${i * 0.6}s` }}
          >
            <span className="grid size-5 place-items-center rounded-full bg-signal/20 text-signal">
              <SealCheck aria-hidden weight="fill" className="size-3" />
            </span>
            {/* On narrow screens the orbit is too small for labels; the chips show as verified stars */}
            <span className="hidden sm:inline">{expertsBand.roles[i]}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
