import { Check, Gauge, IdentificationBadge, Target, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { howItWorks } from "@/content/site";
import { StepIcon } from "@/components/visuals/StepIcons";

/**
 * The four looping widgets of "From question to record", standing in for the reference's
 * Lottie widgets (ring, accent tile with pill, line chart with a glowing dot and pill,
 * profile tile with badge). Pure SVG + CSS loops (globals.css: .hw-*), still under reduced motion.
 * Each tells part of the engagement, with illustrative figures from the fictional examples.
 */
const w = howItWorks.widgets;

const tile =
  "relative rounded-[23px] border border-line bg-[linear-gradient(180deg,var(--color-ink-4),var(--color-ink-2))] shadow-[0_24px_60px_-28px_rgb(var(--shadow-rgb)/0.3)]";

/** Reference "+89% Results" ring → the record's confidence: the arc fills part-way, the word appears. */
export function ConfidenceWidget() {
  return (
    <div className={`${tile} h-[167px] w-[162px] p-3`}>
      <span className="grid size-7 place-items-center rounded-[9px] bg-fg/[0.06] text-fg-2">
        <Gauge aria-hidden className="size-3.5" />
      </span>
      <svg viewBox="0 0 120 120" className="absolute left-1/2 top-[54%] size-[118px] -translate-x-1/2 -translate-y-1/2 -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(var(--fg-rgb) / 0.1)" strokeWidth="3" />
        <circle className="hw-ring-arc" cx="60" cy="60" r="52" fill="none" stroke="var(--color-fg)" strokeWidth="3" strokeLinecap="round" pathLength={1} />
      </svg>
      <span className="absolute left-1/2 top-[30%] grid size-[22px] -translate-x-1/2 place-items-center rounded-full bg-signal text-ink shadow-[0_0_18px_rgb(var(--accent-rgb)/0.6)]">
        <Check aria-hidden weight="bold" className="size-3" />
      </span>
      <p className="hw-word absolute inset-x-0 top-[51%] text-center text-[17px] font-medium leading-none tracking-[-0.02em] text-fg">{w.confidence.value}</p>
      <p className="absolute inset-x-0 top-[65%] text-center text-[10px] text-fg-2">{w.confidence.label}</p>
    </div>
  );
}

/** Reference violet "AI Assist" tile → signal-blue tile, a turning record glyph and a "Conflict check" pill. */
export function ConflictWidget() {
  return (
    <div className="relative grid h-[122px] w-[117px] place-items-center rounded-[22px] bg-[linear-gradient(140deg,var(--color-signal-2),var(--color-signal)_55%,var(--color-marine-2))] shadow-[0_24px_60px_-24px_rgb(var(--violet-rgb)/0.8)]">
      <div className="flex flex-col items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-full bg-ink text-signal">
          <StepIcon name="record" className="hw-turn size-6" />
        </span>
        <span className="rounded-full bg-ink px-2.5 py-1 text-[9.5px] font-medium text-fg">{w.conflict.label}</span>
      </div>
    </div>
  );
}

/** Reference line chart with glowing dot and pill → client growth, drawn by the ball as it travels. */
// Rises with clear ups and downs from (18, 56) to (186, 12). Kept between y 10 and 58 and x 18 to 186
// so the ball and its glow stay inside the card and clear of the label beneath.
const CHART_PATH = "M18 56 C 30 56, 38 28, 52 30 S 70 58, 86 52 S 106 18, 120 22 S 140 48, 154 40 S 174 10, 186 12";

export function AssumptionWidget() {
  return (
    <div className={`${tile} h-[185px] w-[207px] overflow-visible`}>
      <span className="absolute left-4 top-4 grid size-9 place-items-center rounded-[11px] bg-fg/[0.07] text-fg">
        <TrendUp aria-hidden className="size-4" />
      </span>
      <div className="absolute inset-x-0 top-[52px] h-[80px]">
        <svg viewBox="0 0 207 80" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          {/* The only line in the chart: revealed behind the ball as it travels (same timing as .hw-chart-dot). */}
          <path className="hw-chart-line" d={CHART_PATH} fill="none" stroke="var(--color-signal)" strokeWidth="2" strokeLinecap="round" pathLength={1} />
        </svg>
        <span className="hw-chart-dot absolute left-0 top-0" style={{ offsetPath: `path("${CHART_PATH}")` }} />
      </div>
      <p className="absolute bottom-[42px] left-4 text-[10px] text-fg-3">{w.assumption.label}</p>
      <p className="absolute bottom-4 left-4 text-[19px] font-medium leading-none tracking-[-0.02em] text-fg">{w.assumption.value}</p>
      <span className="hw-float absolute -right-9 top-[46%] flex items-center gap-1.5 rounded-full bg-fg px-3 py-1.5 text-[11px] font-medium text-ink shadow-[0_10px_30px_-8px_rgb(var(--shadow-rgb)/0.22)]">
        <Target aria-hidden className="size-3.5" />
        {w.assumption.pill}
      </span>
    </div>
  );
}

/** Reference face tiles → an expert described by role, not name, with checks lighting in turn. */
export function ExpertWidget() {
  return (
    <div className="relative h-[163px] w-[181px]">
      <div
        className="absolute bottom-0 left-0 flex h-[148px] w-[156px] flex-col justify-between overflow-hidden rounded-[24px] border border-line p-3.5"
        style={{ background: "radial-gradient(90% 80% at 20% 0%, rgb(var(--violet-rgb) / 0.9), transparent 70%), linear-gradient(180deg,var(--color-ink-4),var(--color-ink-2))" }}
      >
        <div className="flex items-center gap-2 text-fg-2">
          <IdentificationBadge aria-hidden weight="light" className="size-5 text-signal" />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.12em]">{w.expert.kicker}</span>
        </div>
        <p className="text-[13px] font-medium leading-snug text-fg">{w.expert.role}</p>
        <ul className="flex gap-1.5">
          {w.expert.checks.map((c, i) => (
            <li key={c} className="hw-check flex items-center gap-1 rounded-full bg-fg/[0.06] px-1.5 py-0.5 text-[9px] text-fg-2" style={{ animationDelay: `${i * 0.45}s` }}>
              <Check aria-hidden weight="bold" className="size-2.5 text-signal" />
              {c}
            </li>
          ))}
        </ul>
      </div>
      <span className="absolute right-1.5 top-0 grid size-11 place-items-center rounded-full border-2 border-ink bg-[var(--color-ink-4)] text-fg shadow-[0_8px_20px_-6px_rgb(var(--shadow-rgb)/0.25)]">
        <StepIcon name="source" className="size-5" />
      </span>
    </div>
  );
}
