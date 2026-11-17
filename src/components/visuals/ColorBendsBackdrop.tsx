"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { THEME, type Theme } from "@/theme";

/**
 * "Color Bends" backdrop: React Bits' ColorBends shader as a full-page layer behind everything,
 * under the existing star field (dark) / net (light) canvas. Loaded in the browser only, after the
 * page, so three.js never delays the first paint. Drawn at half resolution (a third on phones) and
 * at most 30 times a second, which keeps it light. Strength per mode: .color-bends-layer in
 * globals.css. Switched on and off with COLOR_BENDS in src/theme.ts.
 */
const ColorBends = dynamic(() => import("./ColorBends"), { ssr: false });

// The bands in the active theme's own colours (other props as in the React Bits usage example)
const COLORS: Record<Theme, string[]> = {
  nebula: ["#ddb5fc", "#b9a3ff", "#8f69e0", "#4700d6"], // lilac, lavender, violet, indigo
  ember: ["#ffc89a", "#ff9a4d", "#e8622c", "#9a2b0c"], // peach, orange, burnt orange, rust
};

export function ColorBendsBackdrop() {
  // Inside the operator desk the shader runs on the sign-in page only, so working screens stay light.
  const pathname = usePathname();
  if (pathname.startsWith("/operators") && pathname !== "/operators/sign-in") return null;
  return (
    <div aria-hidden className="color-bends-layer pointer-events-none fixed inset-0">
      <ColorBends
        colors={COLORS[THEME]}
        rotation={90}
        speed={0.2}
        scale={1}
        frequency={1}
        warpStrength={1}
        mouseInfluence={1}
        noise={0.15}
        parallax={0.5}
        iterations={1}
        intensity={1.5}
        bandWidth={6}
        transparent
        renderScale="auto"
        maxFps={30}
      />
    </div>
  );
}
