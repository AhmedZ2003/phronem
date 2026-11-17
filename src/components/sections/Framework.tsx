"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { framework } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

/**
 * Five dimensions as five equal concentric rings, with a tab list beside them.
 * The rings are deliberately equal: Phronem does not publish its weights.
 * Motivation for motion: choosing a dimension lights its ring (state feedback), nothing else moves.
 */
export function Framework() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const items = framework.items;
  const current = items[active];

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const next = (active + dir + items.length) % items.length;
    setActive(next);
    document.getElementById(`dim-tab-${next}`)?.focus();
  };

  return (
    <section id="framework" aria-labelledby="framework-title" className="relative scroll-mt-20 py-24 md:py-36">
      <Container className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        {/* Rings */}
        <div data-view="from-center" className="relative mx-auto aspect-square w-full max-w-[560px]" aria-hidden>
          <div className="spin-slow absolute -inset-4 rounded-full border border-dashed border-signal/20" />
          {items.map((_, i) => {
            const size = 100 - i * 17; // equal steps, equal ring widths
            const on = i === active;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{
                  width: `${size}%`,
                  height: `${size}%`,
                  left: `${(100 - size) / 2}%`,
                  top: `${(100 - size) / 2}%`,
                }}
                animate={{
                  borderColor: on ? "rgb(var(--accent-rgb) / 0.85)" : "rgba(255,255,255,0.09)",
                  boxShadow: on ? "inset 0 0 40px rgb(var(--accent-rgb) / 0.12), 0 0 40px rgb(var(--nebula-teal-rgb) / 0.35)" : "inset 0 0 0 rgba(0,0,0,0), 0 0 0 rgba(0,0,0,0)",
                }}
                transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            );
          })}
          <div className="absolute inset-[42%] grid place-items-center rounded-full bg-marine/60 text-center">
            <span className="font-mono text-[11px] leading-tight text-fg-2">
              one
              <br />
              record
            </span>
          </div>
        </div>

        {/* Copy + tabs */}
        <div>
          <h2 id="framework-title" data-split="from-down-blur" className="max-w-[18ch] text-[clamp(2.25rem,4.6vw,3.75rem)] font-medium leading-[1.04] tracking-[-0.045em]">
            {framework.title}
          </h2>
          <p data-split="from-down-blur" className="mt-5 max-w-[48ch] text-lg text-fg-2 font-medium">{framework.intro}</p>

          <div role="tablist" aria-orientation="vertical" aria-label="Dimensions" data-view="rise" className="mt-10 grid gap-1" onKeyDown={onKey}>
            {items.map((d, i) => (
              <button
                key={d.name}
                id={`dim-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={i === active}
                aria-controls="dim-panel"
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex items-center gap-4 rounded-full px-4 py-3 text-left text-[17px] transition-colors",
                  i === active ? "bg-glass text-fg" : "text-fg-3 hover:text-fg-2",
                )}
              >
                <span className="font-mono text-xs text-fg-3">{String(i + 1).padStart(2, "0")}</span>
                {d.name}
              </button>
            ))}
          </div>

          <div id="dim-panel" role="tabpanel" aria-labelledby={`dim-tab-${active}`} className="mt-6 min-h-[7.5rem] px-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={current.name}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-[52ch] text-base leading-relaxed text-fg-2"
              >
                {current.text}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
