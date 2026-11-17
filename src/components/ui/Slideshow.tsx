"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

type Props = {
  /** Accessible name for the carousel. */
  label: string;
  /** One node per slide. */
  children: React.ReactNode;
  /** Auto-advance interval; off under reduced motion, paused on hover, focus or drag. */
  intervalMs?: number;
  /** Width of each slide. */
  slideClassName?: string;
};

const BLEED = "px-4 sm:px-6 lg:px-[max(2.5rem,calc((100vw_-_1360px)/2_+_2.5rem))]";
/* Snap points line up with the page margin, not the screen edge */
const SNAP_PAD = "scroll-px-4 sm:scroll-px-6 lg:scroll-px-[max(2.5rem,calc((100vw_-_1360px)/2_+_2.5rem))]";

/**
 * A horizontal slideshow of cards: native scroll-snap underneath (touch and trackpad swipe as
 * normal), mouse drag on desktop, previous/next buttons, a counter and a progress line.
 * Advances on its own every few seconds while on screen, and loops back to the start.
 */
export function Slideshow({ label, children, intervalMs = 5000, slideClassName }: Props) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const visible = useRef(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const lastInteraction = useRef(0);

  const offsets = useCallback(() => {
    const el = track.current;
    if (!el) return [];
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    return Array.from(el.children, (c) => (c as HTMLElement).offsetLeft - pad);
  }, []);

  const goTo = useCallback(
    (i: number, smooth = true) => {
      const el = track.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      const n = ((i % count) + count) % count;
      el.scrollTo({ left: Math.min(offsets()[n] ?? 0, max), behavior: smooth ? "smooth" : "auto" });
      setIndex(n);
    },
    [count, offsets],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const el = track.current;
      if (!el) return;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
      if (dir === 1 && atEnd) goTo(0);
      else if (dir === -1 && el.scrollLeft <= 4) goTo(count - 1);
      else goTo(index + dir);
    },
    [count, goTo, index],
  );

  // Track position → current slide
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
        if (atEnd) return setIndex(count - 1);
        const offs = offsets();
        let best = 0;
        offs.forEach((o, i) => {
          if (Math.abs(o - el.scrollLeft) < Math.abs(offs[best] - el.scrollLeft)) best = i;
        });
        setIndex(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [count, offsets]);

  // Only run while the slideshow is on screen
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Autoplay
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (paused.current || !visible.current || document.hidden) return;
      if (performance.now() - lastInteraction.current < intervalMs * 1.5) return;
      stepRef.current(1);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  const touch = () => (lastInteraction.current = performance.now());

  // Mouse drag (touch and trackpads use native scrolling)
  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !track.current) return;
    drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    const el = track.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      el.style.scrollSnapType = "none";
      el.setPointerCapture(e.pointerId);
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    const el = track.current;
    drag.current = null;
    if (!d?.moved || !el) return;
    touch();
    const offs = offsets();
    let best = 0;
    offs.forEach((o, i) => {
      if (Math.abs(o - el.scrollLeft) < Math.abs(offs[best] - el.scrollLeft)) best = i;
    });
    goTo(best);
    window.setTimeout(() => (el.style.scrollSnapType = ""), 450);
    // Swallow the click that ends a drag, so a card link doesn't open
    el.addEventListener("click", (ev) => ev.preventDefault(), { capture: true, once: true });
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
    >
      <ul
        ref={track}
        data-lenis-prevent
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={touch}
        onTouchStart={touch}
        className={cn(
          "relative flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "cursor-grab active:cursor-grabbing",
          BLEED,
          SNAP_PAD,
        )}
      >
        {slides.map((slide, i) => (
          <li
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className={cn("shrink-0 snap-start select-none [&_a]:[-webkit-user-drag:none]", slideClassName)}
          >
            {slide}
          </li>
        ))}
        {/* Room at the end so the last card can line up with the first one's start */}
        <li aria-hidden className="w-px shrink-0" />
      </ul>

      <div className={cn("mt-8 flex items-center gap-5", BLEED)}>
        <p className="font-mono text-sm tabular-nums text-fg-2" aria-live="off">
          <span className="text-fg">{String(index + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
        </p>
        <div aria-hidden className="relative h-px flex-1 bg-line">
          <span
            className="absolute inset-y-0 left-0 bg-signal transition-[width] duration-500 ease-[var(--ease-out-expo)]"
            style={{ width: `${((index + 1) / count) * 100}%` }}
          />
        </div>
        <div className="flex gap-2">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              aria-label={dir === -1 ? "Previous slide" : "Next slide"}
              onClick={() => {
                touch();
                step(dir);
              }}
              className="glass grid size-11 place-items-center rounded-[var(--radius-control)] text-fg transition-colors hover:bg-fg/20"
            >
              {dir === -1 ? <ArrowLeft aria-hidden weight="bold" className="size-4" /> : <ArrowRight aria-hidden weight="bold" className="size-4" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
