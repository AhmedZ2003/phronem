"use client";

import { useEffect, useRef } from "react";
import { gsap, motionEnabled } from "@/lib/gsap";
import { manifesto } from "@/content/site";
import { glyphs, type GlyphName } from "@/components/visuals/Glyphs";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

const edges: Record<GlyphName, string> = {
  orbit: "linear-gradient(135deg, var(--color-signal), var(--color-marine-2) 70%, transparent)",
  rings: "linear-gradient(135deg, var(--color-fg), rgb(var(--fg-rgb) / 0.15) 75%)",
  converge: "linear-gradient(135deg, var(--color-marine-2), var(--color-signal))",
};

/** A word tile with its looping glyph (reference #9). Grows from 0×0 when the headline is in view. */
function Tile({ name, ...rest }: { name: GlyphName } & React.HTMLAttributes<HTMLSpanElement>) {
  const Glyph = glyphs[name];
  return (
    <span
      data-view="tile"
      aria-hidden
      {...rest}
      className="word-tile inline-flex shrink-0 items-center justify-center text-fg"
      style={{ ["--tile-edge" as string]: edges[name] }}
    >
      <span className="block aspect-square h-[72%]">
        <Glyph />
      </span>
    </span>
  );
}

/**
 * Reference #9 + #10 (the pinned "Control [icon] your mind" section).
 * On every screen size the section is 320vh tall and its stage sticks. Scrubbed across it:
 *   5% → 40%   every word (and the first two tiles) slides left, blurs and fades, staggered
 *   25% → 70%  the last tile and "evidence." rise and stay
 *   30% → 65%  the paragraph un-blurs and closes up, word by word along each line
 * Phones use smaller type (lines may wrap) and shorter distances (12rem left, 30vh up).
 * Without motion (reduced motion or no JavaScript): the plain layout below the stage.
 */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section || !motionEnabled()) return;
    const mm = gsap.matchMedia();

    mm.add({ desktop: "(min-width: 768px)", phone: "(max-width: 767px)" }, (context) => {
      const { desktop } = context.conditions as { desktop: boolean };
      const moves = section.querySelectorAll("[data-move]");
      const tops = section.querySelectorAll("[data-top]");
      const words = [...section.querySelectorAll<HTMLElement>("[data-para-word]")];

      const lines: HTMLElement[][] = [];
      words.forEach((w, i) => {
        if (i === 0 || w.offsetTop !== words[i - 1].offsetTop) lines.push([]);
        lines[lines.length - 1].push(w);
      });
      lines.forEach((line) =>
        line.forEach((w, k) => gsap.set(w, { x: `${1.5 + k * 1.1}rem`, opacity: 0.08, filter: "blur(0.6rem)" })),
      );

      const tl = gsap.timeline({
        defaults: { ease: "power1.inOut" },
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: true },
      });
      tl.to({}, { duration: 1 }, 0); // the timeline spans exactly 0 → 1 of the pinned scroll

      const wordDur = (0.35 * 0.5) / (0.5 + (moves.length - 1) * 0.1);
      tl.to(moves, { x: desktop ? "-20rem" : "-12rem", opacity: 0, filter: "blur(0.6rem)", duration: wordDur, stagger: { amount: 0.35 - wordDur } }, 0.05);
      tl.to(tops, { y: desktop ? "-24rem" : "-30vh", duration: 0.45 }, 0.25);
      lines.forEach((line) => {
        const d = (0.35 * 0.5) / (0.5 + (line.length - 1) * 0.2);
        tl.to(line, { x: 0, opacity: 1, filter: "blur(0rem)", ease: "power1.out", duration: d, stagger: { amount: 0.35 - d } }, 0.3);
      });
    });

    return () => mm.revert();
  }, []);

  const [l1, l2, l3] = manifesto.lines;
  const words = manifesto.body.split(" ");

  return (
    <section ref={ref} aria-label="What Phronem does" className="relative [.js-motion_&]:h-[320vh]">
      {/* With motion, every screen size: pinned stage */}
      <div className="sticky top-0 hidden h-[100dvh] overflow-hidden [.js-motion_&]:block">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ background: "radial-gradient(50% 55% at 50% 50%, rgb(var(--deep-rgb) / 0.4), transparent 70%)" }}
        />
        <h2
          aria-label={manifesto.sentence}
          data-view-list
          className="absolute inset-0 flex -translate-y-[12%] flex-col items-center justify-center gap-[0.12em] px-4 text-[clamp(2rem,8.6vw,3rem)] font-medium leading-[1.1] tracking-[-0.045em] md:translate-y-0 md:px-0 md:text-[clamp(3rem,7vw,7rem)]"
        >
          <span aria-hidden className="flex flex-wrap items-center justify-center md:flex-nowrap md:translate-x-[4%]">
            <span data-move>{l1.lead}</span>
            <Tile name={l1.tile} data-move="" />
            <span data-move>{l1.tail}</span>
          </span>
          <span aria-hidden className="flex flex-wrap items-center justify-center md:flex-nowrap md:-translate-x-[8%]">
            <span data-move>{l2.lead}</span>
            <Tile name={l2.tile} data-move="" />
            <span data-move className="pb-[0.08em] italic text-fg-2">
              {l2.tail}
            </span>
          </span>
          <span aria-hidden className="flex flex-wrap items-center justify-center md:flex-nowrap md:translate-x-[14%]">
            <span data-move>{l3.lead}</span>
            <Tile name={l3.tile} data-top="" />
            <span data-top>{l3.tail}</span>
          </span>
        </h2>
        <Container className="pointer-events-none absolute inset-x-0 top-[42%] md:top-[50%]">
          <p className="max-w-[40ch] text-[1.15rem] font-bold italic leading-snug text-fg md:text-[clamp(1.25rem,2.1vw,1.75rem)]">
            {words.map((w, i) => (
              <span key={i} data-para-word className="inline-block">
                {w}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        </Container>
      </div>

      {/* Without motion (reduced motion, or before JavaScript): the plain layout */}
      <Container className="py-28 md:py-36 [.js-motion_&]:hidden">
        <h2
          aria-label={manifesto.sentence}
          data-view-list
          className="text-[clamp(2.4rem,11vw,3.5rem)] font-medium leading-[1.12] tracking-[-0.045em]"
        >
          {manifesto.lines.map((line) => (
            <span key={line.lead} aria-hidden className="flex flex-wrap items-center">
              <span>{line.lead}</span>
              <Tile name={line.tile} />
              <span className={cn("italic" in line && line.italic && "italic text-fg-2")}>{line.tail}</span>
            </span>
          ))}
        </h2>
        <p data-split="from-down-blur" data-split-stagger="0.1" className="mt-10 text-xl font-bold italic leading-snug text-fg">
          {manifesto.body}
        </p>
      </Container>
    </section>
  );
}
