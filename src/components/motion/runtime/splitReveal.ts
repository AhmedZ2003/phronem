import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

/**
 * Reference #4 and #5, ported value for value from the reference's `[data-split]` script.
 *
 *   <h2 data-split="from-right-blur">   chars slide in from the right, de-blurring, overshooting
 *   <p  data-split="from-down-blur">    lines rise half their height, de-blurring
 *
 * Optional: data-split-stagger, data-split-delay (s), data-split-start (ScrollTrigger start).
 * Anything inside #top waits for the preloader (heroDelay).
 */
const presets = {
  "from-right-blur": {
    type: "chars" as const,
    from: { opacity: 0, x: "6rem", filter: "blur(0.6rem)", scale: 1.2 },
    to: { opacity: 1, x: 0, filter: "blur(0rem)", scale: 1 },
    duration: 1.5,
    ease: "back.out(1.2)",
    stagger: 0.05,
  },
  "from-down-blur": {
    type: "lines" as const,
    from: { opacity: 0, y: "50%", filter: "blur(0.2rem)" },
    to: { opacity: 1, y: 0, filter: "blur(0rem)" },
    duration: 1.5,
    ease: "power2.out",
    stagger: 0.2,
  },
};

type PresetName = keyof typeof presets;

export function initSplitReveal(heroDelay: number) {
  const splits: SplitText[] = [];
  const triggers: ScrollTrigger[] = [];
  const done: HTMLElement[] = [];

  document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    if (el.dataset.splitDone) return;
    const preset = presets[(el.dataset.split as PresetName) ?? "from-down-blur"] ?? presets["from-down-blur"];
    const stagger = el.dataset.splitStagger ? parseFloat(el.dataset.splitStagger) : preset.stagger;
    const delay = parseFloat(el.dataset.splitDelay ?? "0") + (el.closest("#top") ? heroDelay : 0);
    const hidden = !!el.closest('[aria-hidden="true"]');

    const split = SplitText.create(el, {
      type: preset.type === "chars" ? "words,chars" : "lines",
      aria: hidden ? "none" : "auto",
    });
    const targets = preset.type === "chars" ? split.chars : split.lines;
    gsap.set(targets, preset.from);
    el.dataset.splitDone = "1";
    done.push(el);
    splits.push(split);

    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      gsap.to(targets, { ...preset.to, duration: preset.duration, ease: preset.ease, stagger, delay });
    };
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        // clamp() keeps the start inside the scrollable range, so text near the end of the page (the
        // footer wordmark on a tall screen) still fires. Text already on screen at load gets a start
        // of 0, which onEnter never reports at scroll 0, so onRefresh plays it when start <= scroll.
        start: `clamp(${el.dataset.splitStart ?? "top 85%"})`,
        once: true,
        onEnter: play,
        onRefresh: (self) => {
          if (self.start <= self.scroll()) play();
        },
      }),
    );
  });

  return () => {
    triggers.forEach((t) => t.kill());
    splits.forEach((s) => s.revert());
    done.forEach((el) => delete el.dataset.splitDone);
  };
}
