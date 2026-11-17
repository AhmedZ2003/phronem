"use client";

/**
 * GSAP with the same plugins as the reference site (SplitText, ScrollTrigger, InertiaPlugin).
 * Import gsap only from here, so plugins are always registered once, in the browser.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { InertiaPlugin } from "gsap/InertiaPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, InertiaPlugin);
}

/** The reference's view-item curve: cubic-bezier(0.19, 1, 0.22, 1) (expo out). */
export const EXPO_OUT = "expo.out";

/** True when the page is running with motion (set before paint by the inline script in layout). */
export function motionEnabled() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("js-motion");
}

export { gsap, ScrollTrigger, SplitText, InertiaPlugin };
