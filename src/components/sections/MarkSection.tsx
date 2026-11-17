"use client";

import { useEffect, useRef } from "react";
import { gsap, motionEnabled } from "@/lib/gsap";
import { mark } from "@/content/site";
import { Emblem } from "@/components/visuals/Emblem";

/**
 * Reference #11 (IX2 "Home | Logo Scroll"), on the Phronem emblem. Scrubbed from the moment the
 * section enters the screen (so it is never an empty frame) until it unpins. The section is 220vh,
 * so the first ~45% of the scrub happens while it scrolls in, the rest while it is pinned:
 *    2% → 42%  as the section arrives: the emblem rises, fades in and its five rings draw
 *   42% → 63%  as it pins: the nine panel nodes pop in, their spokes reach the core, the core lands
 *   44% → 60%  the glow behind it rises, then settles at 0.25
 *   64% → 100% the emblem turns 360° and grows to 1.4
 * The caption rises near the end. Reduced motion: the finished emblem, static.
 */
export function MarkSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section || !motionEnabled()) return;

    const ctx = gsap.context(() => {
      const rings = section.querySelectorAll("[data-emblem-ring]");
      const spokes = section.querySelectorAll("[data-emblem-spoke]");
      const nodes = section.querySelectorAll("[data-emblem-node]");
      const core = section.querySelector("[data-emblem-core]");

      gsap.set([...rings, ...spokes], { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(nodes, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(core, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set("[data-mark-emblem]", { y: 40 });
      gsap.set("[data-mark-caption]", { y: 24, filter: "blur(4px)" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
      });
      tl.set({}, {}, 0) // anchor the timeline at 0 so positions below are fractions of the scrub
        .to("[data-mark-emblem]", { y: 0, opacity: 1, duration: 0.2 }, 0.02)
        .to(rings, { strokeDashoffset: 0, duration: 0.22, stagger: 0.03 }, 0.08)
        .to(nodes, { scale: 1, duration: 0.07, stagger: 0.01, ease: "back.out(2)" }, 0.42)
        .to(spokes, { strokeDashoffset: 0, duration: 0.1, stagger: 0.008, ease: "none" }, 0.48)
        .to(core, { scale: 1, duration: 0.05, ease: "back.out(2)" }, 0.58)
        .to("[data-mark-glow]", { opacity: 0.7, duration: 0.06 }, 0.44)
        .to("[data-mark-glow]", { opacity: 0.25, duration: 0.06 }, 0.54)
        .to("[data-mark-emblem]", { rotate: 360, scale: 1.4, duration: 0.36 }, 0.64)
        .to("[data-mark-caption]", { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.12 }, 0.84);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} aria-label={mark.caption} className="relative h-[220vh]">
      <div className="sticky top-0 grid h-[100dvh] place-items-center overflow-hidden">
        <div
          data-mark-glow
          aria-hidden
          className="absolute left-1/2 top-1/2 size-[min(92vh,760px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgb(var(--violet-rgb) / 0.32), rgb(var(--violet-rgb) / 0.1) 55%, transparent)" }}
        />
        <div
          data-mark-emblem
          className="relative w-[min(78vw,460px)] text-fg [.js-motion_&]:opacity-0"
        >
          <Emblem className="w-full" />
        </div>
        <p
          data-mark-caption
          className="absolute bottom-[10vh] px-4 text-center text-lg text-fg-2 [.js-motion_&]:opacity-0 font-medium"
        >
          {mark.caption}
        </p>
      </div>
    </section>
  );
}
