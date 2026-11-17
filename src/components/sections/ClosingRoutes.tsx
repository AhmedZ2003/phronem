"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { closingRoutes } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

/**
 * The closing call to action, routed by audience as on GLG ("Potential client / Existing client /
 * Expert"). Phronem routes organizations, research agencies and experts; each route's button opens
 * the contact form on the matching tab. The panel's light, rising from the bottom middle, is the footer's glow. The panel
 * scales in.
 */
export function ClosingRoutes() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const route = closingRoutes[active];

  return (
    <section aria-labelledby="closing-title" className="py-24 md:py-32">
      <Container>
        <div
          data-view="from-center"
          className="relative isolate overflow-hidden rounded-[var(--radius-panel)] border border-line px-6 pt-14 text-center sm:px-10 md:pt-20"
          style={{ background: "linear-gradient(180deg, var(--color-ink-2), var(--color-ink))" }}
        >
          {/* The footer's light rising from the bottom middle, then the rings over it */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
            <div className="footer-glow footer-glow--panel" />
          </div>
          <div aria-hidden className="absolute left-1/2 top-full -z-10 -translate-x-1/2 -translate-y-1/2">
            {[1100, 820, 560].map((size) => (
              <div
                key={size}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line"
                style={{ width: size, height: size }}
              />
            ))}
          </div>

          <h2 id="closing-title" className="text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[1] tracking-[-0.055em]">
            <span data-split="from-right-blur" data-split-stagger="0.03" className="block">
              Start a conversation
            </span>
          </h2>

          <div role="tablist" aria-label="I am" className="mx-auto mt-8 inline-flex flex-wrap justify-center gap-1 rounded-full border border-line bg-ink/60 p-1">
            {closingRoutes.map((r, i) => (
              <button
                key={r.id}
                id={`route-tab-${r.id}`}
                role="tab"
                type="button"
                aria-selected={i === active}
                aria-controls="route-panel"
                onClick={() => setActive(i)}
                className={cn("rounded-full px-4 py-2 text-sm transition-colors", i === active ? "bg-button text-ink" : "text-fg-2 hover:text-fg")}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div id="route-panel" role="tabpanel" aria-labelledby={`route-tab-${route.id}`} className="mx-auto mt-8 min-h-[11rem] max-w-[48ch]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={route.id}
                initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-2xl font-medium tracking-[-0.03em] text-fg">{route.title}</p>
                <p className="mt-3 text-lg text-fg-2 font-medium">{route.text}</p>
                {"cta" in route && (
                  <div className="mt-8 flex justify-center">
                    <Button href={route.cta.href}>{route.cta.label}</Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Room for the light rising from the bottom */}
          <div aria-hidden className="mt-10 h-[200px] md:h-[240px]" />
        </div>
      </Container>
    </section>
  );
}
