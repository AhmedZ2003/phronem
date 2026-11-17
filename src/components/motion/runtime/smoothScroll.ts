import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Reference #2: Lenis smooth scroll, driven by GSAP's ticker and synced to ScrollTrigger. */
export function initSmoothScroll() {
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);

  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // In-page links glide with Lenis instead of jumping.
  const onClick = (e: MouseEvent) => {
    const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]');
    if (!link || link.hasAttribute("data-native-anchor")) return;
    const href = link.getAttribute("href") ?? "";
    // "/#section" glides only when we're already on the homepage; elsewhere it navigates normally.
    if (href.startsWith("/#") && window.location.pathname !== "/") return;
    const hash = href.replace(/^\//, "");
    if (!hash || hash === "#") return;
    const target = document.querySelector<HTMLElement>(hash);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: hash === "#top" ? 0 : -16 });
    history.replaceState(null, "", hash);
  };
  document.addEventListener("click", onClick);

  return () => {
    document.removeEventListener("click", onClick);
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}
