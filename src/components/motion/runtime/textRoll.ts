import { gsap, SplitText } from "@/lib/gsap";

/**
 * Reference #17: hover text roll. The label's chars roll up and blur out while a copy rolls in
 * from below (back.inOut(1.7), 0.02s stagger). Markup comes from <RollText>. Works on focus too.
 * Split into words, then characters, so a long label wraps between words, never mid-word.
 */
export function initTextRoll() {
  const cleanups: (() => void)[] = [];

  document.querySelectorAll<HTMLElement>("[data-roll]").forEach((link) => {
    const original = link.querySelector<HTMLElement>("[data-roll-original]");
    const clone = link.querySelector<HTMLElement>("[data-roll-clone]");
    if (!original || !clone) return;

    const a = SplitText.create(original, { type: "words,chars" });
    const b = SplitText.create(clone, { type: "words,chars", aria: "none" });
    gsap.set(b.chars, { yPercent: 100, opacity: 0, filter: "blur(0.2rem)" });

    const tl = gsap
      .timeline({ paused: true })
      .to(a.chars, { yPercent: -100, opacity: 0, filter: "blur(0.2rem)", stagger: 0.02, duration: 0.5, ease: "back.inOut(1.7)" }, 0)
      .to(b.chars, { yPercent: 0, opacity: 1, filter: "blur(0rem)", stagger: 0.02, duration: 0.5, ease: "back.inOut(1.7)" }, 0.1);

    const play = () => tl.play();
    const reverse = () => tl.reverse();
    link.addEventListener("mouseenter", play);
    link.addEventListener("mouseleave", reverse);
    link.addEventListener("focus", play);
    link.addEventListener("blur", reverse);

    cleanups.push(() => {
      link.removeEventListener("mouseenter", play);
      link.removeEventListener("mouseleave", reverse);
      link.removeEventListener("focus", play);
      link.removeEventListener("blur", reverse);
      tl.kill();
      a.revert();
      b.revert();
    });
  });

  return () => cleanups.forEach((c) => c());
}
