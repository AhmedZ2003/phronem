"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number that counts up from 0 (expo-out, ~1.6s) the first time it is half on screen.
 * Server-rendered as the final value, so it reads correctly without JavaScript; with reduced
 * motion it simply stays at the final value.
 */
export function CountUp({ value, durationMs = 1600, className }: { value: number; durationMs?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let started = false;
    setShown(0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / durationMs);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setShown(Math.round(eased * value));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
}
