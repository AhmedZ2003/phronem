"use client";

import { useEffect, useRef } from "react";
import { readPalette, watchPalette } from "@/lib/palette";

/**
 * The hero object, in place of the reference template's phone. White points; the mesh,
 * panel lines and core glow take the active theme's colours from the CSS variables.
 *
 * A slowly turning sphere of points: Phronem's vetted network. Nine of them are lit (one panel)
 * and send their judgments, separately, into a single core where the record is formed. This is
 * the methodology in one picture: independent judgments, elicited separately, then aggregated.
 *
 * Canvas 2D with manual projection (no WebGL dependency). Pauses off-screen, respects
 * reduced motion (renders one still frame), caps device pixel ratio at 1.5. Phones and touch
 * screens get fewer points (and a wider mesh spacing to match), fewer stars and 30 frames a second.
 */

const POINTS = 720; // laptops; phones use PHONE_POINTS
const PHONE_POINTS = 420;
const PANEL = 9;
const STARS = 170;
const NEIGHBOR = 0.18; // max chord length on the unit sphere for a mesh edge (scaled up when there are fewer points)

type Vec = { x: number; y: number; z: number };

function fibonacciSphere(n: number): Vec[] {
  const out: Vec[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    out.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r });
  }
  return out;
}

// Deterministic pseudo-random so server and client never disagree and every load looks the same.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function ExpertSphere({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const N = small ? PHONE_POINTS : POINTS;
    const neighbor = NEIGHBOR * Math.sqrt(POINTS / N);
    const frameMs = small ? 1000 / 30 : 0;
    const rand = mulberry32(7);

    const pts = fibonacciSphere(N);
    const pairs: number[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dz = pts[i].z - pts[j].z;
        if (dx * dx + dy * dy + dz * dz < neighbor * neighbor) pairs.push(i, j);
      }
    }
    // Spread the panel across the sphere: fibonacci order is already well distributed.
    const panel = Array.from({ length: PANEL }, (_, k) => Math.floor(((k + 0.5) * N) / PANEL));
    const panelPhase = panel.map(() => rand());

    const stars = Array.from({ length: small ? 80 : STARS }, () => ({
      x: rand(),
      y: rand(),
      r: rand() * 1.1 + 0.3,
      a: rand() * 0.5 + 0.15,
      tw: rand() * Math.PI * 2,
    }));

    const sx = new Float32Array(N);
    const sy = new Float32Array(N);
    const sz = new Float32Array(N);

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) draw(0);
    };

    // Pointer parallax (eased toward target inside the frame loop, never through React state).
    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;
    const onPointer = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 0.5;
      ty = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };

    // Theme colours from the CSS variables; refreshed when the theme or light / dark mode changes
    let pal = readPalette();
    const stopWatching = watchPalette((p) => {
      pal = p;
      if (reduce) draw(0); // the still frame has to be redrawn in the new colours
    });

    let rot = 0.6;
    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      // Stars
      for (const s of stars) {
        const a = reduce ? s.a : s.a * (0.65 + 0.35 * Math.sin(time * 0.0012 + s.tw));
        ctx.fillStyle = `rgba(${pal.point},${a})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      const mobile = w < 768;
      const cx = w / 2;
      const cy = h * (mobile ? 0.56 : 0.64);
      // Large, as the reference's phone: it fills the lower hero and runs past the fold
      const R = mobile ? Math.min(w * 0.62, h * 0.38) : Math.min(w * 0.36, h * 0.58);

      px += (tx - px) * 0.04;
      py += (ty - py) * 0.04;
      const ay = rot + px;
      const ax = -0.42 + py;
      const cY = Math.cos(ay);
      const sY = Math.sin(ay);
      const cX = Math.cos(ax);
      const sX = Math.sin(ax);
      const cam = 3.2;

      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const x1 = p.x * cY - p.z * sY;
        const z1 = p.x * sY + p.z * cY;
        const y2 = p.y * cX - z1 * sX;
        const z2 = p.y * sX + z1 * cX;
        const k = cam / (cam - z2);
        sx[i] = cx + x1 * R * k;
        sy[i] = cy + y2 * R * k;
        sz[i] = z2; // -1 back, +1 front
      }

      // Core glow
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.25);
      core.addColorStop(0, `rgba(${pal.glow},0.3)`);
      core.addColorStop(0.35, `rgba(${pal.deep},0.16)`);
      core.addColorStop(1, "rgba(12,11,12,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Mesh edges, bucketed by depth to keep stroke calls low
      const buckets = [0.03, 0.07, 0.13];
      for (let b = 0; b < buckets.length; b++) {
        ctx.strokeStyle = `rgba(${pal.accent},${buckets[b]})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let e = 0; e < pairs.length; e += 2) {
          const i = pairs[e];
          const j = pairs[e + 1];
          const z = (sz[i] + sz[j]) * 0.5;
          const bucket = z < -0.35 ? 0 : z < 0.35 ? 1 : 2;
          if (bucket !== b) continue;
          ctx.moveTo(sx[i], sy[i]);
          ctx.lineTo(sx[j], sy[j]);
        }
        ctx.stroke();
      }

      // Points
      for (let i = 0; i < N; i++) {
        const d = (sz[i] + 1) / 2;
        ctx.fillStyle = `rgba(${pal.point},${0.12 + d * 0.7})`;
        ctx.beginPath();
        ctx.arc(sx[i], sy[i], 0.5 + d * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Panel: lines into the core, each with its own judgment travelling inward
      for (let k = 0; k < PANEL; k++) {
        const i = panel[k];
        const d = (sz[i] + 1) / 2;
        const grad = ctx.createLinearGradient(sx[i], sy[i], cx, cy);
        grad.addColorStop(0, `rgba(${pal.highlight},${0.15 + d * 0.45})`);
        grad.addColorStop(1, `rgba(${pal.highlight},0.02)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx[i], sy[i]);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        if (!reduce) {
          const f = (time * 0.00018 + panelPhase[k]) % 1;
          const mx = sx[i] + (cx - sx[i]) * f;
          const my = sy[i] + (cy - sy[i]) * f;
          ctx.fillStyle = `rgba(${pal.pale},${(1 - f) * (0.35 + d * 0.5)})`;
          ctx.beginPath();
          ctx.arc(mx, my, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }

        const pulse = reduce ? 1 : 0.75 + 0.25 * Math.sin(time * 0.002 + panelPhase[k] * 6);
        const halo = ctx.createRadialGradient(sx[i], sy[i], 0, sx[i], sy[i], 14);
        halo.addColorStop(0, `rgba(${pal.glow},${0.55 * pulse * (0.4 + d)})`);
        halo.addColorStop(1, `rgba(${pal.glow},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(sx[i], sy[i], 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${pal.point},${0.55 + d * 0.45})`;
        ctx.beginPath();
        ctx.arc(sx[i], sy[i], 2.2 + d * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core point
      ctx.fillStyle = `rgba(${pal.point},0.9)`;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    let raf = 0;
    let last = 0;
    let visible = true;
    const loop = (time: number) => {
      const since = last ? time - last : 16;
      if (since >= frameMs - 2) {
        last = time;
        rot += Math.min(since, 66) * 0.00011;
        draw(time);
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduce || raf) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    window.addEventListener("pointermove", onPointer, { passive: true });
    if (reduce) draw(0);
    else start();

    return () => {
      stop();
      stopWatching();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
