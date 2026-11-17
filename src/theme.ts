/**
 * The site's colour theme. Change this one word to switch; both themes live in src/app/globals.css.
 *
 *   "nebula"  violet and lavender, measured from the reference template (the original palette)
 *   "ember"   warm orange: orange accent, amber and peach highlights, rust glows
 *
 * The background and text colours are the same in both.
 */
export type Theme = "nebula" | "ember";

export const THEME: Theme = "nebula";

/**
 * "Color Bends": React Bits' ColorBends shader as an extra full-page background layer, under the
 * star field (dark) and the net (light). Set to false to switch it off; to remove it entirely,
 * delete src/components/visuals/ColorBends.tsx and ColorBendsBackdrop.tsx, the .color-bends-layer
 * rule in globals.css, this flag and its use in src/app/layout.tsx, and the three / @types/three
 * packages.
 */
export const COLOR_BENDS = true;
