import { gsap } from "@/lib/gsap";

/**
 * Reference #13 and #14: on mouseenter an element is thrown along the mouse's velocity,
 * springs back to rest (InertiaPlugin, end: 0) and wobbles once.
 *
 *   data-inertia="20"   cards and widgets (reference: velocity x20, rotate up to ±10°)
 *   data-inertia="10"   button backgrounds (reference: velocity x10, rotate up to ±5°)
 *
 * Desktop with a fine pointer only, as in the reference (window.innerWidth >= 992).
 */
export function initInertiaHover() {
  if (!window.matchMedia("(min-width: 992px) and (pointer: fine)").matches) return () => {};

  let oldX = 0;
  let oldY = 0;
  let deltaX = 0;
  let deltaY = 0;
  const onMove = (e: MouseEvent) => {
    deltaX = e.clientX - oldX;
    deltaY = e.clientY - oldY;
    oldX = e.clientX;
    oldY = e.clientY;
  };
  window.addEventListener("mousemove", onMove, { passive: true });

  const bound = [...document.querySelectorAll<HTMLElement>("[data-inertia]")].map((el) => {
    const strength = parseFloat(el.dataset.inertia || "20");
    const onEnter = () => {
      const tl = gsap.timeline({ onComplete: () => void tl.kill() });
      tl.timeScale(1.2);
      tl.to(el, {
        inertia: {
          x: { velocity: deltaX * strength, end: 0 },
          y: { velocity: deltaY * strength, end: 0 },
        },
      });
      tl.fromTo(
        el,
        { rotate: 0 },
        { duration: 0.4, rotate: (Math.random() - 0.5) * strength, yoyo: true, repeat: 1, ease: "power1.inOut" },
        "<",
      );
    };
    el.addEventListener("mouseenter", onEnter);
    return { el, onEnter };
  });

  return () => {
    window.removeEventListener("mousemove", onMove);
    bound.forEach(({ el, onEnter }) => {
      el.removeEventListener("mouseenter", onEnter);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    });
  };
}
