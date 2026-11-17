import { gsap } from "@/lib/gsap";

/** Reference #18: the nav mark turns 720° across the whole page (scrubbed to scroll). */
export function initNavRing() {
  const tween = gsap.to("[data-nav-ring]", {
    rotate: 720,
    ease: "none",
    scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: true },
  });
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}
