/**
 * Theme colours for canvas drawings, read from the CSS variables in globals.css as "r,g,b"
 * strings. watchPalette re-reads them whenever the theme or light / dark mode changes on <html>,
 * so canvases follow the nav toggle without a reload.
 */
export type CanvasPalette = {
  accent: string;
  glow: string;
  deep: string;
  highlight: string;
  pale: string;
  point: string;
  star: string;
  starAlpha: number;
  /** True in light mode (data-mode="light" on <html>). */
  light: boolean;
};

export function readPalette(): CanvasPalette {
  const css = getComputedStyle(document.documentElement);
  const ch = (name: string, fallback: string) => (css.getPropertyValue(name).trim() || fallback).split(/\s+/).join(",");
  return {
    accent: ch("--accent-rgb", "185 163 255"),
    glow: ch("--violet-rgb", "143 105 224"),
    deep: ch("--nebula-teal-rgb", "71 0 214"),
    highlight: ch("--highlight-rgb", "221 181 252"),
    pale: ch("--nebula-pink-rgb", "237 197 252"),
    point: ch("--point-rgb", "255 255 255"),
    star: ch("--star-rgb", "255 255 255"),
    starAlpha: parseFloat(css.getPropertyValue("--star-alpha")) || 1,
    light: document.documentElement.dataset.mode === "light",
  };
}

/** Calls onChange with a fresh palette whenever data-theme or data-mode changes. Returns a disposer. */
export function watchPalette(onChange: (p: CanvasPalette) => void) {
  const mo = new MutationObserver(() => onChange(readPalette()));
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-mode"] });
  return () => mo.disconnect();
}
