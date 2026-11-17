import { site } from "@/content/site";
import { Emblem } from "@/components/visuals/Emblem";

/**
 * Reference #1. The emblem draws itself, the wordmark rises, then the whole layer fades.
 * CSS only (globals.css: .preloader), so it can never get stuck waiting on JavaScript.
 * Hidden on repeat visits in a session and under reduced motion (inline script in layout).
 */
export function Preloader() {
  return (
    <div aria-hidden className="preloader fixed inset-0 grid place-items-center bg-ink" style={{ zIndex: 70 }}>
      <div className="flex flex-col items-center gap-6">
        <Emblem draw="css" className="size-40 text-fg md:size-48" />
        <p className="preloader-word text-3xl font-medium tracking-[-0.05em] text-fg">{site.wordmark}</p>
      </div>
    </div>
  );
}
