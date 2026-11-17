"use client";

import { useEffect, useRef } from "react";
import { readPalette, watchPalette } from "@/lib/palette";

/**
 * The page backdrop, a fixed canvas under the content. It draws one of two scenes and swaps live
 * when the light / dark switch is used:
 *
 *   dark   as on the reference (a particles.js field over #0c0b0c): a few hundred white stars of
 *          mixed size and brightness drifting very slowly, each fading in and out on its own clock
 *   light  a net: a fine dot grid across the page, and a network of accent-coloured points drifting
 *          slowly, joined by thin lines when they come close, a few of them lit with a soft halo;
 *          near the pointer the points link to it
 *
 * Density scales with the viewport. Kept light: resolution capped at 1.5x, drawn at most 30 times a
 * second (motion is time-based, so speeds don't change), and the light-mode dot grid is drawn once
 * per resize into an offscreen canvas and copied in. Pauses when the tab is hidden; one still frame
 * under reduced motion.
 */
type Star = { x: number; y: number; vx: number; vy: number; r: number; a: number; tw: number; sp: number };
type Node = { x: number; y: number; vx: number; vy: number; r: number; lit: boolean; ph: number };

const GRID = 30; // light mode dot grid spacing, px
const LINK = 150; // light mode: max distance for a line between two points, px
const REACH = 170; // light mode: max distance for a line to the pointer, px
const FRAME_MS = 1000 / 30; // draw at most 30 times a second

export function StarParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let pal = readPalette();
    let stars: Star[] = [];
    let nodes: Node[] = [];
    let w = 0;
    let h = 0;
    const pointer = { x: -9999, y: -9999 };
    const grid = document.createElement("canvas"); // light mode dot grid, pre-drawn
    let dpr = 1;

    const paintGrid = () => {
      grid.width = canvas.width;
      grid.height = canvas.height;
      const g = grid.getContext("2d");
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = `rgba(${pal.accent},0.16)`;
      g.beginPath();
      for (let y = GRID / 2; y < h; y += GRID) {
        for (let x = GRID / 2; x < w; x += GRID) {
          g.moveTo(x + 0.9, y);
          g.arc(x, y, 0.9, 0, Math.PI * 2);
        }
      }
      g.fill();
    };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let seed = 11;
      const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

      const count = Math.max(90, Math.min(320, Math.round((w * h) / 4200)));
      stars = Array.from({ length: count }, () => {
        const dir = rand() * Math.PI * 2;
        const speed = rand() * 0.06 + 0.02;
        return {
          x: rand() * w,
          y: rand() * h,
          vx: Math.cos(dir) * speed,
          vy: Math.sin(dir) * speed,
          r: rand() < 0.85 ? rand() * 0.7 + 0.5 : rand() * 0.8 + 1.2,
          a: rand() * 0.6 + 0.25,
          tw: rand() * Math.PI * 2,
          sp: rand() * 0.9 + 0.3,
        };
      });

      const nodeCount = Math.max(26, Math.min(80, Math.round((w * h) / 19000)));
      nodes = Array.from({ length: nodeCount }, () => {
        const dir = rand() * Math.PI * 2;
        const speed = rand() * 0.14 + 0.05;
        return { x: rand() * w, y: rand() * h, vx: Math.cos(dir) * speed, vy: Math.sin(dir) * speed, r: rand() * 1.1 + 1.3, lit: rand() < 0.16, ph: rand() * Math.PI * 2 };
      });
      paintGrid();
      draw(0, 16);
    };

    const drawStars = (t: number, k: number) => {
      for (const s of stars) {
        if (!reduce) {
          s.x += s.vx * k;
          s.y += s.vy * k;
          if (s.x < -4) s.x = w + 4;
          else if (s.x > w + 4) s.x = -4;
          if (s.y < -4) s.y = h + 4;
          else if (s.y > h + 4) s.y = -4;
        }
        const a = reduce ? s.a : s.a * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.0012 * s.sp + s.tw)));
        ctx.fillStyle = `rgba(${pal.star},${a * pal.starAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawNet = (t: number, k: number) => {
      // Dot grid, pre-drawn
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(grid, 0, 0);
      ctx.restore();

      // Drifting points
      for (const n of nodes) {
        if (reduce) continue;
        n.x += n.vx * k;
        n.y += n.vy * k;
        if (n.x < -20) n.x = w + 20;
        else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        else if (n.y > h + 20) n.y = -20;
      }

      // Lines between near points, and to the pointer
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          const f = 1 - Math.sqrt(d2) / LINK;
          ctx.strokeStyle = `rgba(${pal.accent},${f * 0.28})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        if (!reduce) {
          const dx = a.x - pointer.x;
          const dy = a.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < REACH * REACH) {
            const f = 1 - Math.sqrt(d2) / REACH;
            ctx.strokeStyle = `rgba(${pal.glow},${f * 0.5})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      // The points, a few of them lit
      for (const n of nodes) {
        if (n.lit) {
          const pulse = reduce ? 1 : 0.7 + 0.3 * Math.sin(t * 0.002 + n.ph);
          const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 14);
          halo.addColorStop(0, `rgba(${pal.glow},${0.35 * pulse})`);
          halo.addColorStop(1, `rgba(${pal.glow},0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${pal.accent},${n.lit ? 0.85 : 0.5})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const draw = (t: number, dt: number) => {
      const k = dt / 16.67;
      ctx.clearRect(0, 0, w, h);
      if (pal.light) drawNet(t, k);
      else drawStars(t, k);
    };

    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      const since = last ? t - last : FRAME_MS;
      if (since >= FRAME_MS - 2) {
        last = t;
        draw(t, Math.min(since, 66));
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (!document.hidden && !reduce) raf = requestAnimationFrame(loop);
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };

    build();
    const stopWatching = watchPalette((p) => {
      pal = p;
      paintGrid();
      if (reduce) draw(0, 16);
    });
    window.addEventListener("resize", build);
    document.addEventListener("visibilitychange", start);
    if (finePointer && !reduce) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    start();

    return () => {
      stopWatching();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 h-full w-full" style={{ zIndex: -1 }} />;
}
