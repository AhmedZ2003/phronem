import { ArrowUp, ChatsCircle, Check, Gauge, Scales, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { features } from "@/content/site";
import { StepIcon } from "@/components/visuals/StepIcons";

/**
 * The four looping widgets of the feature showcase, one per feature, standing in for the
 * reference's Lottie widgets (same sizes and composition). Pure SVG + CSS (globals.css: .fs-*),
 * still under reduced motion. Figures are illustrative.
 */
const [judgment, opposing, measured, current] = features;

const tile = "rounded-[22px] border border-line bg-[linear-gradient(180deg,var(--color-ink-4),var(--color-ink-2))] shadow-[0_24px_60px_-28px_rgb(var(--shadow-rgb)/0.3)]";

/** Reference "Visualize. Align. Achieve." → independent views narrowing into one record. */
export function JudgmentWidget() {
  const w = judgment.widget;
  return (
    <div className="relative h-[182px] w-[205px]">
      <div className={`${tile} absolute left-[18px] top-[14px] h-[150px] w-[150px] overflow-hidden`}>
        <svg viewBox="0 0 150 150" className="absolute inset-0 size-full" aria-hidden fill="none">
          {[
            { cy: 50, rx: 56, ry: 24 },
            { cy: 60, rx: 44, ry: 19 },
            { cy: 69, rx: 32, ry: 14 },
            { cy: 77, rx: 20, ry: 9 },
          ].map((e, i) => (
            <ellipse key={i} cx="75" cy={e.cy} rx={e.rx} ry={e.ry} stroke="rgb(var(--fg-rgb) / 0.55)" strokeWidth="1" className="fs-ring" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </svg>
        <span className="absolute left-1/2 top-[78px] grid size-[26px] -translate-x-1/2 place-items-center rounded-full bg-signal text-ink shadow-[0_0_22px_rgb(var(--accent-rgb)/0.7)]">
          <StepIcon name="record" className="size-4" />
        </span>
        <p className="absolute inset-x-0 bottom-4 text-center text-[10.5px] text-fg/90">{w.caption}</p>
      </div>
      <span className="absolute left-0 top-0 grid size-[36px] place-items-center rounded-full p-px" style={{ background: "linear-gradient(140deg, var(--color-signal), rgb(var(--accent-rgb) / 0.1) 70%)" }}>
        <span className="grid size-full place-items-center rounded-full bg-ink text-signal">
          <UsersThree aria-hidden className="size-4" />
        </span>
      </span>
      <span className="fs-float absolute right-0 top-[104px] flex items-center gap-2 rounded-[12px] bg-fg px-2.5 py-1.5 text-ink shadow-[0_10px_30px_-8px_rgb(var(--shadow-rgb)/0.22)]">
        <ArrowUp aria-hidden weight="bold" className="size-3.5" />
        <span className="leading-none">
          <span className="block text-[8px] text-ink/60">{w.pillLabel}</span>
          <span className="fs-count block text-[14px] font-semibold" />
        </span>
      </span>
    </div>
  );
}

/** Reference "Start transformation" tracks → the opposing case, with views travelling round it. */
const TRACK = "M78 40 H188 A60 60 0 0 1 188 160 H78 A60 60 0 0 1 78 40 Z";

export function OpposingWidget() {
  const w = opposing.widget;
  const nodes = [
    { icon: <Scales aria-hidden className="size-4" />, lit: true, delay: "0s" },
    { icon: <ChatsCircle aria-hidden className="size-4" />, lit: false, delay: "-4.7s" },
    { icon: <StepIcon name="vet" className="size-4" />, lit: false, delay: "-9.4s" },
  ];
  return (
    <div className="relative h-[200px] w-[266px]">
      <svg viewBox="0 0 266 200" className="absolute inset-0 size-full" aria-hidden fill="none">
        <defs>
          <linearGradient id="fs-track" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--color-signal)" />
            <stop offset="0.55" stopColor="var(--color-marine-2)" />
            <stop offset="1" stopColor="var(--color-signal)" />
          </linearGradient>
        </defs>
        {[0, 10, 20].map((inset) => (
          <rect key={inset} x={8 + inset} y={30 + inset} width={250 - inset * 2} height={140 - inset * 2} rx={70 - inset} stroke="url(#fs-track)" strokeOpacity={0.75 - inset * 0.02} strokeWidth="1" />
        ))}
      </svg>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-line bg-[var(--color-ink-4)] px-5 py-2.5 text-[11px] text-fg shadow-[0_10px_30px_-10px_rgb(var(--shadow-rgb)/0.28)]">
        {w.button}
      </span>
      {nodes.map((n, i) => (
        <span
          key={i}
          className={`fs-orbit absolute left-0 top-0 grid size-[30px] place-items-center rounded-full ${n.lit ? "bg-signal text-ink shadow-[0_0_20px_rgb(var(--accent-rgb)/0.6)]" : "border border-line bg-[var(--color-ink-4)] text-fg"}`}
          style={{ offsetPath: `path("${TRACK}")`, animationDelay: n.delay }}
        >
          {n.icon}
        </span>
      ))}
    </div>
  );
}

/** Reference crossing line charts → stated confidence against logged outcomes. */
export function MeasuredWidget() {
  const w = measured.widget;
  const stated = "M18 140 L62 116 L106 104 L150 78 L194 70 L236 44";
  const outcome = "M18 150 L62 102 L106 120 L150 86 L194 58 L236 52";
  const pts = (d: string) => d.replace(/[ML]/g, "").trim().split(/\s+/).map(Number).reduce<number[][]>((a, v, i) => (i % 2 ? (a[a.length - 1].push(v), a) : [...a, [v]]), []);
  return (
    <div className="relative h-[193px] w-[259px]">
      <svg viewBox="0 0 259 193" className="absolute inset-0 size-full" aria-hidden fill="none">
        {[60, 104, 148, 192].map((x, i) => (
          <rect key={x} x={x - 16} y={40 + (i % 2) * 18} width="32" height={130 - (i % 2) * 18} rx="10" fill="rgb(var(--fg-rgb) / 0.05)" />
        ))}
        <path d={stated} stroke="var(--color-signal)" strokeWidth="1.6" className="fs-draw" pathLength={1} />
        <path d={outcome} stroke="rgb(var(--fg-rgb) / 0.9)" strokeWidth="1.6" className="fs-draw" pathLength={1} style={{ animationDelay: "0.35s" }} />
        {pts(stated).map(([x, y], i) => (
          <circle key={`s${i}`} cx={x} cy={y} r="3" fill="var(--color-signal)" className="fs-pop" style={{ animationDelay: `${0.25 + i * 0.22}s` }} />
        ))}
        {pts(outcome).map(([x, y], i) => (
          <circle key={`o${i}`} cx={x} cy={y} r="3" fill="var(--color-fg)" className="fs-pop" style={{ animationDelay: `${0.6 + i * 0.22}s` }} />
        ))}
      </svg>
      <span className="absolute left-[30px] top-[10px] grid size-[40px] place-items-center rounded-[12px] bg-signal text-ink shadow-[0_0_24px_rgb(var(--accent-rgb)/0.45)]">
        <Gauge aria-hidden className="size-5" />
      </span>
      <span className="absolute bottom-[6px] right-[4px] flex items-center gap-2 rounded-[14px] border border-line bg-[var(--color-ink-4)] py-2 pl-2 pr-3 shadow-[0_10px_30px_-10px_rgb(var(--shadow-rgb)/0.28)]">
        <span className="grid size-6 place-items-center rounded-full bg-signal/20 text-signal">
          <Check aria-hidden weight="bold" className="size-3" />
        </span>
        <span className="text-[10.5px] text-fg">{w.chip}</span>
      </span>
    </div>
  );
}

/** Reference calendar recommendation card → an assumption alert and a reissued record. */
export function CurrentWidget() {
  const w = current.widget;
  return (
    <div className="relative h-[184px] w-[188px]">
      <div className={`${tile} absolute right-[6px] top-0 h-[170px] w-[146px] p-3.5`}>
        <div className="flex items-end gap-1.5">
          <span className="text-[30px] font-medium leading-none tracking-[-0.04em] text-fg">{w.date}</span>
          <span className="pb-0.5 text-[8px] leading-tight text-fg-3">
            {w.month}
            <br />
            {w.day}
          </span>
        </div>
        <p className="mt-3 text-[9.5px] text-fg-3">{w.heading}</p>
        <p className="mt-0.5 text-[10.5px] leading-snug text-fg">{w.body}</p>
        <div className="mt-2.5 flex justify-end border-t border-line pt-2">
          <span className="rounded-full border border-line-strong px-2 py-0.5 text-[8.5px] text-fg">{w.status}</span>
        </div>
      </div>
      <span className="fs-glow absolute right-0 top-[18px] grid size-[30px] place-items-center rounded-[9px] bg-signal text-[11px] font-semibold text-ink">
        {w.badge}
      </span>
      <span className="fs-float absolute bottom-[2px] left-0 rounded-[12px] p-px" style={{ background: "linear-gradient(140deg, var(--color-signal), var(--color-marine-2))" }}>
        <span className="block rounded-[11px] bg-ink px-2.5 py-2">
          <span className="block text-[8px] text-fg-3">Trigger</span>
          <span className="block text-[10px] text-fg">{w.trigger}</span>
        </span>
      </span>
    </div>
  );
}
