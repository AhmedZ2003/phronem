"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { howItWorks } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { GlowCard } from "@/components/ui/GlowCard";
import { CardLines, StepIcon, type StepIconName } from "@/components/visuals/StepIcons";
import { AssumptionWidget, ConfidenceWidget, ConflictWidget, ExpertWidget } from "@/components/visuals/HowWidgets";
import { cn } from "@/lib/cn";

/**
 * "From question to record": a one-to-one rebuild of the reference's "Upgrade Your Reality"
 * section (read from the live page with Claude in Chrome on 2026-11-13).
 *
 * Structure (desktop, ≥1024px), as in the reference:
 *   - a stage the height of the section; the giant two-line headline sits behind, its first line
 *     white, its second grey italic. Characters slide in with blur (SplitText, from-right-blur).
 *   - a front layer (z above) of absolutely positioned step cards and looping widgets.
 *
 * Scroll (reference IX2 "Home | How Work Scroll", progress = section entering → leaving,
 * smoothing 50). Values are the reference's own; its rem is fluid (1rem = 1vw), so rem → vw:
 *   headline      y  10% → 240% of its height  (it sinks, so the cards rush past it)
 *   ring          y  20 → -50vw        accent    y  50 → -100vw
 *   card 1        y  20 → -40vw        card 3    y  50 → -50vw
 *   profile       y  60 → -80vw        chart     y  20 → -10vw
 *   cards 2 and 4 ride with the page
 *   card line art rotates 0 → 360°
 *
 * Each card and widget scales in from 0.6 when 20% visible (view-item, 2s expo-out) and is
 * thrown by the mouse on hover (InertiaPlugin, velocity ×20, wobble ±10°). Cards: 1.3px
 * gradient edge (accent → dark at 50%), 25px radius, blurred glow top-left, line art bottom-right,
 * a 50px icon badge. Below 1024px: one column, the widgets between the cards and alternating
 * left and right, each layer drifting at its own speed with the scroll (widgets further than
 * cards) and the card line art turning, a phone-sized version of the same parallax.
 */

type Item =
  | { kind: "card"; step: number; left: string; top: string; from?: number; to?: number }
  | { kind: "widget"; widget: "confidence" | "conflict" | "assumption" | "expert"; left: string; top: string; from?: number; to?: number };

/**
 * Positions on a 1292 × 1555 stage: the reference's own four card slots (s1 to s4) and its
 * widget slots, as percentages of its stage. Parallax ranges are the reference's, rem → vw.
 */
const items: Item[] = [
  { kind: "widget", widget: "confidence", left: "11%", top: "17%", from: 20, to: -50 },
  { kind: "widget", widget: "conflict", left: "45%", top: "27%", from: 50, to: -100 },
  { kind: "card", step: 0, left: "19%", top: "33%", from: 20, to: -40 },
  { kind: "card", step: 1, left: "55%", top: "40%" },
  { kind: "widget", widget: "expert", left: "79%", top: "52%", from: 60, to: -80 },
  { kind: "card", step: 2, left: "15%", top: "63%", from: 50, to: -50 },
  { kind: "card", step: 3, left: "67%", top: "72%" },
  { kind: "widget", widget: "assumption", left: "47%", top: "81%", from: 20, to: -10 },
];

const widgetMap = { confidence: ConfidenceWidget, conflict: ConflictWidget, assumption: AssumptionWidget, expert: ExpertWidget };

/** Below 1024px: the same pieces in one column; drift is px over the section's scroll. */
type PhoneItem =
  | { kind: "card"; step: number; drift: [number, number] }
  | { kind: "widget"; widget: keyof typeof widgetMap; side: "start" | "end"; drift: [number, number] };
const phoneItems: PhoneItem[] = [
  { kind: "widget", widget: "confidence", side: "end", drift: [70, -90] },
  { kind: "card", step: 0, drift: [30, -40] },
  { kind: "widget", widget: "conflict", side: "start", drift: [90, -110] },
  { kind: "card", step: 1, drift: [20, -20] },
  { kind: "widget", widget: "expert", side: "end", drift: [80, -100] },
  { kind: "card", step: 2, drift: [40, -40] },
  { kind: "widget", widget: "assumption", side: "start", drift: [60, -60] },
  { kind: "card", step: 3, drift: [20, -20] },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // IX2 "smoothing: 50": the layers ease toward the scroll position instead of locking to it.
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.6 });
  const headlineY = useTransform(progress, [0, 1], ["10%", "240%"]);
  const linesRotate = useTransform(progress, [0, 1], [0, 360]);
  const [line1, line2] = howItWorks.titleLines;

  return (
    <section id="how" ref={ref} aria-labelledby="how-title" className="relative scroll-mt-20 overflow-x-clip py-24 lg:py-10">
      <Container className="max-w-[1340px]">
        {/* Below 1024px: stacked */}
        <div className="lg:hidden">
          <h2 className="text-[clamp(3rem,13vw,5.5rem)] font-semibold leading-[1.05] tracking-[-0.06em]">
            <span data-split="from-right-blur" data-split-stagger="0.03" className="block">
              {line1}
            </span>
            <span data-split="from-right-blur" data-split-stagger="0.03" className="block pb-1 font-medium italic text-fg-3">
              {line2}
            </span>
          </h2>
          <p data-split="from-down-blur" className="mt-6 max-w-[48ch] text-lg text-fg-2 font-medium">
            {howItWorks.intro}
          </p>
          <ol className="mx-auto mt-12 grid max-w-[440px] gap-8">
            {phoneItems.map((item, i) => (
              <Drift
                key={i}
                progress={progress}
                range={item.drift}
                reduce={!!reduce}
                hidden={item.kind === "widget"}
                className={cn(item.kind === "widget" && (item.side === "end" ? "justify-self-end pr-6" : "justify-self-start pl-2"))}
              >
                {item.kind === "card" ? <StepCard index={item.step} linesRotate={reduce ? undefined : linesRotate} /> : <WidgetSlot name={item.widget} />}
              </Drift>
            ))}
          </ol>
        </div>

        {/* 1024px and up: the reference stage */}
        <div className="relative hidden h-[1555px] lg:block">
          <motion.h2
            id="how-title"
            aria-label={howItWorks.title}
            style={reduce ? undefined : { y: headlineY }}
            className="absolute inset-x-0 top-[2%] text-center text-[clamp(7rem,12.6vw,10.75rem)] font-semibold leading-[1.2] tracking-[-0.06em] text-fg"
          >
            <span aria-hidden data-split="from-right-blur" data-split-stagger="0.04" className="block">
              {line1}
            </span>
            <span aria-hidden data-split="from-right-blur" data-split-stagger="0.04" className="-mt-[0.12em] block pb-[0.08em] font-medium italic text-fg-3">
              {line2}
            </span>
          </motion.h2>

          <ol className="absolute inset-0" style={{ zIndex: 5 }} aria-label="Four steps">
            {items.map((item, i) => (
              <Floating key={i} item={item} progress={progress} reduce={!!reduce}>
                {item.kind === "card" ? <StepCard index={item.step} linesRotate={reduce ? undefined : linesRotate} /> : <WidgetSlot name={item.widget} />}
              </Floating>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/** Parallax layer › inertia layer › view-item layer, so the three never fight over `transform`. */
function Floating({ item, progress, reduce, children }: { item: Item; progress: MotionValue<number>; reduce: boolean; children: React.ReactNode }) {
  const y = useTransform(progress, [0, 1], [`${item.from ?? 0}vw`, `${item.to ?? 0}vw`]);
  const moves = item.from !== undefined && !reduce;
  return (
    <motion.li
      aria-hidden={item.kind === "widget" || undefined}
      style={{ left: item.left, top: item.top, ...(moves ? { y } : {}) }}
      className={cn("absolute", item.kind === "card" && "w-[280px]")}
    >
      <div data-inertia="20">
        <div data-view="from-center">{children}</div>
      </div>
    </motion.li>
  );
}

/** Below 1024px: a step card or widget drifting with the scroll by its own range (px), then scaling in. */
function Drift({ progress, range, reduce, hidden, className, children }: { progress: MotionValue<number>; range: [number, number]; reduce: boolean; hidden?: boolean; className?: string; children: React.ReactNode }) {
  const y = useTransform(progress, [0, 1], range);
  return (
    <motion.li aria-hidden={hidden || undefined} style={reduce ? undefined : { y }} className={className}>
      <div data-view="from-center">{children}</div>
    </motion.li>
  );
}

function WidgetSlot({ name }: { name: keyof typeof widgetMap }) {
  const W = widgetMap[name];
  return <W />;
}

/** The reference card: gradient edge, glow, icon badge, title, body, line art in the corner. */
function StepCard({ index, linesRotate }: { index: number; linesRotate?: MotionValue<number> }) {
  const step = howItWorks.steps[index];
  return (
    <GlowCard
      icon={<StepIcon name={step.icon as StepIconName} className="size-[22px]" />}
      lines={
        <motion.div aria-hidden style={linesRotate ? { rotate: linesRotate } : undefined} className="pointer-events-none absolute -bottom-[201px] -right-[201px] size-[402px]">
          <CardLines className="size-full" />
        </motion.div>
      }
    >
      <h3 className="relative mt-[22px] text-[17.9px] font-medium leading-[1.2] text-fg">
        <span className="sr-only">
          Step {index + 1}, {step.name}:{" "}
        </span>
        {step.title}
      </h3>
      <p className="relative mt-3 max-w-[22ch] text-[14.3px] leading-[1.5] text-fg/80">{step.text}</p>
    </GlowCard>
  );
}
