"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { site } from "@/content/site";
import { ExpertSphere } from "@/components/visuals/ExpertSphere";
import { ShortlistCard } from "@/components/visuals/ShortlistCard";
import { Container } from "@/components/ui/Container";

/**
 * Hero. Entrance (after the preloader), as in the reference:
 *   wordmark   SplitText chars, from-right-blur
 *   tagline    SplitText lines, from-down-blur
 *   shortlist  view-item from-center (scale .6 → 1, 2s expo-out): an expert shortlist card, in place of the phone
 * Continuous: the card tilts with the pointer, and drifts up as the hero scrolls away.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [22, 12]), { stiffness: 80, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-26, -14]), { stiffness: 80, damping: 20 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.25]);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section ref={ref} id="top" onPointerMove={onMove} className="relative isolate min-h-[100dvh] overflow-hidden">
      {/* The reference's hero light: one violet block (#8f69e0) at the top edge, blurred to a glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="hero-top-blur" />
      </div>
      <motion.div aria-hidden style={reduce ? undefined : { opacity: sceneOpacity }} className="absolute inset-0 -z-10">
        <ExpertSphere className="h-full w-full" />
      </motion.div>

      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[44%] -z-10 select-none text-center text-[25vw] font-medium leading-none tracking-[-0.07em] text-fg/[0.06] md:top-[40%] md:text-[19vw]"
      >
        {site.wordmark}
      </p>

      <Container className="flex flex-col items-center pt-24 text-center md:pt-[5.5rem]">
        <h1 className="wordmark-depth text-[clamp(4.25rem,15vw,10.5rem)] font-medium leading-[1.02] tracking-[-0.065em] text-fg">
          <span className="sr-only">
            {site.name}: {site.tagline}
          </span>
          <span aria-hidden data-split="from-right-blur" className="block">
            {site.wordmark}
          </span>
        </h1>
        <p aria-hidden data-split="from-down-blur" data-split-delay="0.5" className="-mt-1 text-base font-bold text-fg/90 md:text-lg">
          {site.tagline}
        </p>
      </Container>

      {/* The expert shortlist, tilted like the reference phone. From md up it hangs from a fixed line just below
          the tagline (not from the bottom edge), so it never covers the text on short screens. */}
      <motion.div
        style={reduce ? undefined : { y: cardY }}
        className="pointer-events-none absolute inset-x-0 bottom-[-46%] flex justify-center [perspective:1400px] sm:bottom-[-30%] md:bottom-auto md:top-[21.5rem]"
      >
        <motion.div
          style={reduce ? { rotateX: 16, rotateY: -20, rotateZ: 7 } : { rotateX: rx, rotateY: ry, rotateZ: 7 }}
          className="w-[min(84vw,400px)] [transform-style:preserve-3d]"
        >
          <div data-view="from-center">
            <ShortlistCard />
          </div>
        </motion.div>
      </motion.div>

    </section>
  );
}
