"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger, motionEnabled } from "@/lib/gsap";
import { initSmoothScroll } from "./runtime/smoothScroll";
import { initSplitReveal } from "./runtime/splitReveal";
import { initViewObserver } from "./runtime/viewObserver";
import { initInertiaHover } from "./runtime/inertiaHover";
import { initTextRoll } from "./runtime/textRoll";
import { initNavRing } from "./runtime/navRing";

/** Seconds the hero waits when the preloader is showing (it fades out at 2.2s). */
const PRELOADER_HANDOFF = 2.1;

/**
 * Mounted once in the root layout. Starts every attribute-driven effect after fonts load,
 * mirroring how the reference initialises its scripts on `document.fonts.ready`.
 * Does nothing under reduced motion (the inline script never sets `js-motion`).
 */
export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    // The operator desk is a working tool: no smooth scrolling or reveal effects there.
    if (!motionEnabled() || pathname.startsWith("/operators")) return;
    const root = document.documentElement;
    let cleanups: (() => void)[] = [];
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;
      const heroDelay = root.classList.contains("no-preloader") ? 0.1 : PRELOADER_HANDOFF;
      cleanups = [
        initSmoothScroll(),
        initSplitReveal(heroDelay),
        initViewObserver(heroDelay * 1000),
        initInertiaHover(),
        initTextRoll(),
        initNavRing(),
      ];
      root.classList.add("motion-ready");
      ScrollTrigger.refresh();
    });

    // Late layout shifts (images, pinned sections settling) move trigger points: measure again once loaded
    const onLoad = () => ScrollTrigger.refresh();
    if (document.readyState !== "complete") window.addEventListener("load", onLoad, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
      cleanups.forEach((c) => c());
    };
  }, [pathname]); // re-run for each page, in case navigation ever happens client-side

  return null;
}
