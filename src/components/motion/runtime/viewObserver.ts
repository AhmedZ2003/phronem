/**
 * Reference #6 to #9, the reference's `[view-item]` / `[view-list]` observer.
 *
 *   data-view="from-center" | "from-down" | "tile"   start state in globals.css, `.view` = end state
 *   data-view-list                                    children with data-view get `.view` 100ms apart
 *
 * CSS does the animating (2s expo-out transform, 0.2s opacity), exactly as in the reference.
 */
export function initViewObserver(heroDelayMs: number) {
  const timers: number[] = [];

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        const base = el.closest("#top") ? heroDelayMs : 0;
        const step = el.dataset.viewStep ? parseFloat(el.dataset.viewStep) : 100;

        if (el.hasAttribute("data-view-list")) {
          el.querySelectorAll<HTMLElement>("[data-view]").forEach((item, i) => {
            timers.push(window.setTimeout(() => item.classList.add("view"), base + i * step));
          });
        } else {
          timers.push(window.setTimeout(() => el.classList.add("view"), base));
        }
      }
    },
    { threshold: 0.2 },
  );

  document.querySelectorAll("[data-view-list]").forEach((el) => io.observe(el));
  document.querySelectorAll("[data-view]").forEach((el) => {
    if (!el.closest("[data-view-list]")) io.observe(el);
  });

  return () => {
    io.disconnect();
    timers.forEach((t) => clearTimeout(t));
  };
}
